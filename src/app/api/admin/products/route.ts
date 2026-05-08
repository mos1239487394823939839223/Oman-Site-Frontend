import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

// Helper to read JSON file
function readDataFile() {
  try {
    const fileContent = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    return { data: [] };
  }
}

// Helper to write JSON file
function writeDataFile(data: any) {
  try {
    // Ensure directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing file:", error);
    return false;
  }
}

// GET - Get all products
export async function GET() {
  try {
    const data = readDataFile();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read products" }, { status: 500 });
  }
}

// POST - Create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readDataFile();
    
    const newProduct = {
      _id: `product_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.data.push(newProduct);
    writeDataFile(data);
    
    return NextResponse.json({ status: "success", data: newProduct });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

