import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function readDataFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContent);
    }
    return { data: [] };
  } catch (error) {
    return { data: [] };
  }
}

export async function GET() {
  try {
    const productsData = readDataFile(PRODUCTS_FILE);
    const ordersData = readDataFile(ORDERS_FILE);
    const usersData = readDataFile(USERS_FILE);

    const products = productsData.data || [];
    const orders = ordersData.data || [];
    const users = usersData.data || [];

    // Calculate revenue from orders
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + (order.totalOrderPrice || 0);
    }, 0);

    const stats = {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalRevenue: totalRevenue,
    };

    return NextResponse.json({ status: "success", data: stats });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

