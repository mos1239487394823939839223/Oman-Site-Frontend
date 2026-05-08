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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = readDataFile();
    const order = data.data.find((o: any) => o._id === id);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({ status: "success", data: order });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read order" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = readDataFile();
    const index = data.data.findIndex((o: any) => o._id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    data.data[index] = {
      ...data.data[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    writeDataFile(data);
    return NextResponse.json({ status: "success", data: data.data[index] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

