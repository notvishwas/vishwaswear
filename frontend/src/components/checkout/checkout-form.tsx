"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createOrder, verifyPayment, type CreateOrderResult } from "@/actions/checkout";
import { CartWarnings } from "@/components/cart/cart-warnings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { calculateShipping } from "@/config/shipping";
import { siteConfig } from "@/config/site";
import { useCartLines, useCartSubtotal } from "@/hooks/use-cart";
import { applyValidatedCart, clearCart } from "@/lib/cart/store";
import { buildIdempotencyKey, resetCheckoutAttempt } from "@/lib/checkout/attempt";
import { INDIAN_STATES } from "@/lib/checkout/indian-states";
import {
  checkoutFormSchema,
  normalizePhone,
  type CheckoutFormInput,
  type CheckoutFormValues,
} from "@/lib/checkout/schema";
import { loadRazorpayScript } from "@/lib/razorpay/load-script";
import { formatPrice } from "@/lib/utils";
import type { CartWarning } from "@/types/cart";
import { OrderSummary } from "./order-summary";

type PayResult = Extract<CreateOrderResult, { ok: true; kind: "pay" }>;

type Notice = {
  tone: "error" | "info";
  title: string;
  body: string;
  /** Shown when the payment succeeded at Razorpay but confirming it with us failed. */
  retryVerification?: RazorpaySuccessResponse;
};

type CheckoutFormProps = {
  defaultEmail: string;
  defaultName: string;
  signedIn: boolean;
};

export function CheckoutForm({ defaultEmail, defaultName, signedIn }: CheckoutFormProps) {
  const router = useRouter();
  const lines = useCartLines();
  const subtotal = useCartSubtotal();

  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [warnings, setWarnings] = useState<CartWarning[]>([]);

  // A ref, not state, so a second click in the same tick can't slip past the guard.
  const submittingRef = useRef(false);
  const paymentHandledRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormInput, unknown, CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onTouched",
    defaultValues: { email: defaultEmail, phone: "", fullName: defaultName, addressLine1: "", addressLine2: "", city: "", state: undefined, pincode: "", landmark: "" },
  });

  function release() {
    submittingRef.current = false;
    setBusy(false);
  }

  async function confirmPayment(response: RazorpaySuccessResponse) {
    setBusy(true);
    setNotice(null);
    const result = await verifyPayment({
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
    });

    if (result.ok) {
      // Only now, with the payment confirmed, is it safe to empty the cart.
      setCompleted(true);
      clearCart();
      resetCheckoutAttempt();
      router.push(result.confirmationPath);
      return;
    }

    setNotice({
      tone: "error",
      title: result.code === "insufficient_stock" ? "Payment received, item sold out" : "We couldn't confirm your payment yet",
      body: result.message,
      retryVerification: result.code === "server_error" ? response : undefined,
    });
    release();
  }

  function openRazorpay(order: PayResult, values: CheckoutFormValues) {
    if (!window.Razorpay) {
      setNotice({ tone: "error", title: "Payment window unavailable", body: "Please check your connection and try again." });
      release();
      return;
    }

    paymentHandledRef.current = false;
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency,
      name: siteConfig.name,
      description: `Order ${order.orderNumber}`,
      order_id: order.razorpayOrderId,
      prefill: { name: values.fullName, email: values.email, contact: normalizePhone(values.phone) },
      theme: { color: "#0f1b2d" },
      handler: (response) => {
        paymentHandledRef.current = true;
        void confirmPayment(response);
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          if (paymentHandledRef.current) return;
          setNotice({
            tone: "info",
            title: "Payment not completed",
            body: "The payment window was closed and you haven't been charged. Your cart is saved, so you can try again whenever you're ready.",
          });
          release();
        },
      },
    });

    checkout.on("payment.failed", (response) => {
      setNotice({
        tone: "error",
        title: "Payment failed",
        body: `${response.error.description ?? "Your payment couldn't be completed."} You haven't been charged for a failed payment. You can retry in the payment window or close it and try again.`,
      });
    });

    checkout.open();
  }

  async function onSubmit(values: CheckoutFormValues) {
    if (submittingRef.current || !lines || lines.length === 0) return;
    submittingRef.current = true;
    setBusy(true);
    setNotice(null);
    setWarnings([]);

    try {
      const result = await createOrder({
        ...values,
        items: lines.map(({ variantId, quantity, unitPricePaise }) => ({ variantId, quantity, unitPricePaise })),
        idempotencyKey: await buildIdempotencyKey(lines),
      });

      if (!result.ok) {
        if (result.code === "cart_changed" && result.validated) {
          applyValidatedCart(result.validated);
          setWarnings(result.validated.warnings);
        }
        setNotice({
          tone: "error",
          title: result.code === "cart_changed" ? "Your cart was updated" : "We couldn't start your payment",
          body: result.message,
        });
        release();
        return;
      }

      if (result.kind === "already_paid") {
        setCompleted(true);
        clearCart();
        resetCheckoutAttempt();
        router.push(result.confirmationPath);
        return;
      }

      if (!(await loadRazorpayScript())) {
        setNotice({
          tone: "error",
          title: "Couldn't load the payment window",
          body: "Please check your connection, disable any content blockers for this page, and try again.",
        });
        release();
        return;
      }

      openRazorpay(result, values);
    } catch {
      setNotice({
        tone: "error",
        title: "Something went wrong",
        body: "We couldn't reach the server. Your cart is safe, please try again.",
      });
      release();
    }
  }

  if (lines === null) {
    return <p role="status" className="py-16 text-center text-sm text-navy-500">Loading your cart…</p>;
  }

  if (completed) {
    return (
      <p role="status" className="py-16 text-center text-navy-800">
        Payment confirmed. Taking you to your order…
      </p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <h2 className="text-xl font-semibold text-navy-800">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-navy-500">Add a piece to your cart to check out.</p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center rounded-md border border-navy-800 bg-navy-800 px-8 text-base font-semibold text-white hover:bg-navy-700"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  const total = subtotal + calculateShipping(subtotal);

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-12">
      <div className="lg:order-2 lg:sticky lg:top-24">
        <OrderSummary lines={lines} subtotalPaise={subtotal} />
      </div>

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate className="flex flex-col gap-8 lg:order-1">
        <CartWarnings warnings={warnings} onDismiss={() => setWarnings([])} />

        {notice && (
          <div
            role="alert"
            className={
              notice.tone === "error"
                ? "rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900"
                : "rounded-md border border-gold-300 bg-gold-50 p-4 text-sm text-navy-800"
            }
          >
            <p className="font-semibold">{notice.title}</p>
            <p className="mt-1">{notice.body}</p>
            {notice.retryVerification && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void confirmPayment(notice.retryVerification!)}
                className="mt-3 font-semibold underline underline-offset-4"
              >
                Check payment again
              </button>
            )}
            {notice.title === "Your cart was updated" && (
              <Link href="/cart" className="mt-3 inline-block font-semibold underline underline-offset-4">
                Review your cart
              </Link>
            )}
          </div>
        )}

        <fieldset disabled={busy} className="flex flex-col gap-4">
          <legend className="mb-1 text-lg font-semibold text-navy-800">Contact</legend>
          {!signedIn && (
            <p className="text-sm text-navy-500">
              Have an account?{" "}
              <Link href="/login?next=/checkout" className="font-semibold text-navy-800 underline underline-offset-4">
                Sign in with Google
              </Link>{" "}
              to save this order to your account, or continue as a guest.
            </p>
          )}
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            hint="We'll send your order confirmation here."
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="phone"
            label="Mobile number"
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            placeholder="98765 43210"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </fieldset>

        <fieldset disabled={busy} className="flex flex-col gap-4">
          <legend className="mb-1 text-lg font-semibold text-navy-800">Shipping address</legend>
          <Input id="fullName" label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
          <Input
            id="addressLine1"
            label="Address line 1"
            autoComplete="address-line1"
            placeholder="House or flat number, street"
            error={errors.addressLine1?.message}
            {...register("addressLine1")}
          />
          <Input
            id="addressLine2"
            label="Address line 2 (optional)"
            autoComplete="address-line2"
            placeholder="Area, colony"
            error={errors.addressLine2?.message}
            {...register("addressLine2")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="city" label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
            <Input
              id="pincode"
              label="PIN code"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="400001"
              error={errors.pincode?.message}
              {...register("pincode")}
            />
          </div>
          <Select id="state" label="State" autoComplete="address-level1" error={errors.state?.message} defaultValue="" {...register("state")}>
            <option value="" disabled>
              Select your state
            </option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
          <Input
            id="landmark"
            label="Landmark (optional)"
            placeholder="Near the temple, opposite the bank"
            error={errors.landmark?.message}
            {...register("landmark")}
          />
        </fieldset>

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" loading={busy} className="w-full">
            {busy ? "Processing…" : `Pay ${formatPrice(total)}`}
          </Button>
          <p className="text-center text-xs text-navy-400">
            Payments are processed securely by Razorpay. UPI, cards and net banking accepted.
          </p>
        </div>
      </form>
    </div>
  );
}
