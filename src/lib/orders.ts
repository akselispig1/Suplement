import { Order } from "@/types/product";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// In-memory fallback for read-only (serverless) filesystems.
let memoryOrders: Order[] | null = null;
let usingMemory = false;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

export function getAllOrders(): Order[] {
  if (usingMemory) return memoryOrders ?? [];
  try {
    ensureDataDir();
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8")) as Order[];
  } catch {
    usingMemory = true;
    if (!memoryOrders) memoryOrders = [];
    return memoryOrders;
  }
}

function persist(orders: Order[]) {
  if (usingMemory) {
    memoryOrders = orders;
    return;
  }
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch {
    usingMemory = true;
    memoryOrders = orders;
  }
}

export function getOrderById(id: string): Order | undefined {
  return getAllOrders().find((o) => o.id === id);
}

export function getOrderByStripeSession(sessionId: string): Order | undefined {
  return getAllOrders().find((o) => o.stripeSessionId === sessionId);
}

export function createOrder(order: Order): Order {
  const orders = getAllOrders();
  orders.push(order);
  persist(orders);
  return order;
}

export function updateOrderStatus(id: string, status: Order["status"]): Order | null {
  const orders = getAllOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx].status = status;
  persist(orders);
  return orders[idx];
}
