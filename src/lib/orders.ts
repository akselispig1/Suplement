import { Order } from "@/types/product";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

export function getAllOrders(): Order[] {
  ensureDataDir();
  const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
  return JSON.parse(raw) as Order[];
}

export function getOrderById(id: string): Order | undefined {
  return getAllOrders().find((o) => o.id === id);
}

export function getOrderByStripeSession(sessionId: string): Order | undefined {
  return getAllOrders().find((o) => o.stripeSessionId === sessionId);
}

export function createOrder(order: Order): Order {
  ensureDataDir();
  const orders = getAllOrders();
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return order;
}

export function updateOrderStatus(id: string, status: Order["status"]): Order | null {
  ensureDataDir();
  const orders = getAllOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx].status = status;
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return orders[idx];
}
