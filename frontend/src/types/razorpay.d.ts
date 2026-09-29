// Minimal typings for Razorpay Checkout (https://checkout.razorpay.com/v1/checkout.js).
export {};

declare global {
  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayFailureResponse {
    error: {
      code?: string;
      description?: string;
      reason?: string;
      metadata?: { order_id?: string; payment_id?: string };
    };
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string };
    handler: (response: RazorpaySuccessResponse) => void;
    modal?: { ondismiss?: () => void; confirm_close?: boolean };
  }

  interface RazorpayInstance {
    open(): void;
    on(event: "payment.failed", callback: (response: RazorpayFailureResponse) => void): void;
  }

  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
