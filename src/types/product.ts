export type ProductForm = "capsule" | "tablet" | "softgel" | "powder" | "gummy" | "liquid";
export type EvidenceStrength = "strong" | "moderate" | "emerging";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brandLabel: string;
  category: string;
  subCategory?: string;
  goals: string[];
  shortDescription: string;
  longDescription: string;
  form: ProductForm;
  servingSize: string;
  servingsPerContainer: number;
  priceCHF: number;
  compareAtPriceCHF?: number;
  evidenceStrength: EvidenceStrength;
  bestFor: string[];
  pairsWith: string[];
  cautions: string;
  inStock: boolean;
  imageUrl: string;
  /** Operator sourcing link — where to buy this to fulfil orders (ships to CH). */
  supplierUrl?: string;
  /** What the operator pays the supplier for the product, in CHF. */
  supplierCostCHF?: number;
  /** Operator's shipping cost from the supplier, in CHF (estimate — verify at checkout). */
  shippingCostCHF?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  items: {
    productId: string;
    productName: string;
    quantity: number;
    priceCHF: number;
  }[];
  totalCHF: number;
  stripeSessionId: string;
  status: "awaiting_payment" | "to_ship" | "shipped" | "cancelled";
  createdAt: string;
};
