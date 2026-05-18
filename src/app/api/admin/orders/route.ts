import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function readDataFile() {
  try {
    const fileContent = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    return { data: [] };
  }
}

function writeDataFile(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing file:", error);
    return false;
  }
}

export async function GET() {
  try {
    const data = readDataFile();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newOrder = await req.json();
    const existing = readDataFile();
    const orders: any[] = existing.data || [];

    // Avoid duplicate by _id
    const alreadyExists = orders.some((o) => o._id === newOrder._id);
    if (!alreadyExists) {
      orders.unshift({ ...newOrder, createdAt: newOrder.createdAt || new Date().toISOString() });
    }

    const success = writeDataFile({ data: orders });
    if (!success) return NextResponse.json({ error: "Failed to save order" }, { status: 500 });

    return NextResponse.json({ status: "success", data: newOrder });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
