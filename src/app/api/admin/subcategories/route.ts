import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const SUBCATEGORIES_FILE = path.join(DATA_DIR, "subcategories.json");

function readDataFile() {
  try {
    const fileContent = fs.readFileSync(SUBCATEGORIES_FILE, "utf-8");
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
    fs.writeFileSync(SUBCATEGORIES_FILE, JSON.stringify(data, null, 2), "utf-8");
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
    return NextResponse.json({ error: "Failed to read subcategories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readDataFile();
    
    const newSubcategory = {
      _id: `subcategory_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.data.push(newSubcategory);
    writeDataFile(data);
    
    return NextResponse.json({ status: "success", data: newSubcategory });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}

