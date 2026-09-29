"use server";

import { validateCartItems, type CartItemsInput } from "@/lib/cart/validate";
import type { ValidatedCart } from "@/types/cart";

/** Re-checks prices and stock against the database. See `validateCartItems`. */
export async function validateCart(input: CartItemsInput): Promise<ValidatedCart> {
  return validateCartItems(input);
}
