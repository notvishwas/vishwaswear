import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser, getUserDisplayName } from "@/lib/auth/user";
import { getOrdersForUser } from "@/lib/orders/queries";
import { STATUS_LABELS, isPaidStatus } from "@/lib/orders/status";
import { getConfirmationPath } from "@/lib/orders/token";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const orders = await getOrdersForUser(user.id);
  const name = getUserDisplayName(user);
  const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });

  return (
    <Container size="narrow" className="py-8 sm:py-14">
      <SectionHeading as="h1" title={`Hello, ${name.split(" ")[0]}`} description={user.email ?? undefined} />

      <section aria-labelledby="orders-heading" className="mt-10">
        <h2 id="orders-heading" className="text-lg font-semibold text-navy-800">
          Your orders
        </h2>

        {orders.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-md border border-dashed border-navy-200 px-6 py-14 text-center">
            <p className="font-semibold text-navy-800">No orders yet</p>
            <p className="mt-2 max-w-sm text-sm text-navy-500">
              Orders you place while signed in will show up here.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-11 items-center rounded-md border border-navy-800 bg-navy-800 px-6 text-sm font-semibold text-white hover:bg-navy-700"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-md border border-cream-300 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-800">{order.order_number}</p>
                    <p className="mt-1 text-sm text-navy-500">
                      {dateFormat.format(new Date(order.created_at))} · {formatPrice(order.total_paise)}
                    </p>
                  </div>
                  <Badge variant={isPaidStatus(order.status) ? "gold" : "outline"}>{STATUS_LABELS[order.status]}</Badge>
                </div>

                <ul className="mt-4 flex gap-2 overflow-x-auto" aria-label="Items in this order">
                  {order.items.map((item) => (
                    <li key={item.id} className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-sm bg-cream-200">
                      {item.image_url && (
                        <Image src={item.image_url} alt={item.product_name} fill sizes="56px" className="object-cover" />
                      )}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                  <Link href={getConfirmationPath(order.order_number)} className="text-navy-800 underline underline-offset-4">
                    View order
                  </Link>
                  <Link href="/track-order" className="text-navy-800 underline underline-offset-4">
                    Track order
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={signOut} className="mt-12 border-t border-cream-300 pt-6">
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-md border border-navy-800 px-6 text-sm font-semibold text-navy-800 hover:bg-navy-800 hover:text-white"
        >
          Sign out
        </button>
      </form>
    </Container>
  );
}
