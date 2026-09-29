import type { Database } from "./database";

type Tables = Database["public"]["Tables"];
type Enums = Database["public"]["Enums"];

export type { Database, Json } from "./database";

export type Category = Tables["categories"]["Row"];
export type Product = Tables["products"]["Row"];
export type ProductImage = Tables["product_images"]["Row"];
export type ProductVariant = Tables["product_variants"]["Row"];
export type Order = Tables["orders"]["Row"];
export type OrderItem = Tables["order_items"]["Row"];
export type Profile = Tables["profiles"]["Row"];

export type OrderStatus = Enums["order_status"];
export type UserRole = Enums["user_role"];

export type NewOrder = Tables["orders"]["Insert"];
export type NewOrderItem = Tables["order_items"]["Insert"];

/** A product with everything the storefront needs to render it. */
export type ProductWithDetails = Product & {
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
