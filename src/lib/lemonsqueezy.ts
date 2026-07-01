import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

export function setupLS() {
  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });
}

export { createCheckout };

export async function createLSCheckout({
  storeId,
  variantId,
  customData,
  redirectUrl,
  customerEmail,
}: {
  storeId: string;
  variantId: string;
  customData: Record<string, string>;
  redirectUrl: string;
  customerEmail?: string;
}) {
  setupLS();
  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutOptions: {
      embed: false,
    },
    checkoutData: {
      email: customerEmail,
      custom: customData,
    },
    productOptions: {
      redirectUrl,
    },
  });
  if (error) throw new Error(error.message);
  return data?.data.attributes.url as string;
}
