const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let loading: Promise<boolean> | null = null;

/** Loads Razorpay Checkout once. Resolves false if the script can't be loaded (offline, blocked). */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loading) return loading;

  loading = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      script.remove();
      loading = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return loading;
}
