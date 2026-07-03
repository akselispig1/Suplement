import { Product } from "@/types/product";
import fs from "fs";
import path from "path";
import { products as seedProducts } from "@/data/catalog";
import { defaultSupplierUrl } from "@/lib/product-image";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const SEED_MARKER = path.join(DATA_DIR, ".seed-version");

// Bump this whenever the catalog is replaced so existing stores re-seed.
const SEED_VERSION = "2026-07-real-catalog-v1";

/** Ensure operator fields exist so the admin always has a buy link + costs. */
function withDefaults(p: Product): Product {
  return {
    ...p,
    supplierUrl: p.supplierUrl || defaultSupplierUrl(p.name),
    supplierCostCHF: typeof p.supplierCostCHF === "number" ? p.supplierCostCHF : 0,
    shippingCostCHF: typeof p.shippingCostCHF === "number" ? p.shippingCostCHF : 0,
  };
}

function ensureStore(): Product[] {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const currentVersion = fs.existsSync(SEED_MARKER) ? fs.readFileSync(SEED_MARKER, "utf-8").trim() : "";
  if (!fs.existsSync(PRODUCTS_FILE) || currentVersion !== SEED_VERSION) {
    // First run, or the catalog was replaced — (re)seed from the real catalog.
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts, null, 2));
    fs.writeFileSync(SEED_MARKER, SEED_VERSION);
  }
  const raw = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8")) as Product[];
  return raw.map(withDefaults);
}

function save(products: Product[]) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

export function getAllProducts(): Product[] {
  return ensureStore();
}

export function getProductById(id: string): Product | undefined {
  return ensureStore().find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return ensureStore().find((p) => p.slug === slug);
}

export function createProduct(product: Product): Product {
  const products = ensureStore();
  if (products.find((p) => p.id === product.id)) {
    throw new Error(`Product with id ${product.id} already exists`);
  }
  products.push(product);
  save(products);
  return product;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = ensureStore();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  save(products);
  return products[idx];
}

export function deleteProduct(id: string): boolean {
  const products = ensureStore();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  save(products);
  return true;
}

export function nextProductId(products: Product[]): string {
  const nums = products
    .map((p) => parseInt(p.id.replace("p", ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `p${String(max + 1).padStart(3, "0")}`;
}
