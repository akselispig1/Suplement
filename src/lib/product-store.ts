import { Product } from "@/types/product";
import fs from "fs";
import path from "path";
import { products as seedProducts } from "@/data/catalog";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

function ensureStore(): Product[] {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts, null, 2));
  }
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8")) as Product[];
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
