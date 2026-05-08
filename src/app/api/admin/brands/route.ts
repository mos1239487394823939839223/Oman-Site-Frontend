import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const BRANDS_FILE = path.join(DATA_DIR, "brands.json");

function readDataFile() {
  try {
    const fileContent = fs.readFileSync(BRANDS_FILE, "utf-8");
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
    fs.writeFileSync(BRANDS_FILE, JSON.stringify(data, null, 2), "utf-8");
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
    return NextResponse.json({ error: "Failed to read brands" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readDataFile();
    
    const newBrand = {
      _id: `brand_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.data.push(newBrand);
    writeDataFile(data);
    
    return NextResponse.json({ status: "success", data: newBrand });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}

