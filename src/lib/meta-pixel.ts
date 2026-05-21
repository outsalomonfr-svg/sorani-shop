declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const viewContent = (data: { content_name: string; content_ids: string[]; value: number; currency: string }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', data);
  }
};

export const addToCart = (data: { content_name: string; content_ids: string[]; value: number; currency: string }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', data);
  }
};

export const initiateCheckout = (data: { value: number; currency: string; num_items: number }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', data);
  }
};

export const purchase = (data: { value: number; currency: string; content_ids: string[] }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', data);
  }
};
