// Open/closed state of the cart drawer, shared by the header icon, product page and drawer itself.
let open = false;
const listeners = new Set<() => void>();

function set(value: boolean) {
  if (open === value) return;
  open = value;
  listeners.forEach((listener) => listener());
}

export const openCartDrawer = () => set(true);
export const closeCartDrawer = () => set(false);
export const isCartDrawerOpen = () => open;

export function subscribeToCartDrawer(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
