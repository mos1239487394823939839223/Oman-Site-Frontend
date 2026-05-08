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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = readDataFile();
    const subcategory = data.data.find((s: any) => s._id === id);
    
    if (!subcategory) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }
    
    return NextResponse.json({ status: "success", data: subcategory });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read subcategory" }, { status: 500 });
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
    const index = data.data.findIndex((s: any) => s._id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }
    
    data.data[index] = {
      ...data.data[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    writeDataFile(data);
    return NextResponse.json({ status: "success", data: data.data[index] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update subcategory" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = readDataFile();
    const index = data.data.findIndex((s: any) => s._id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }
    
    data.data.splice(index, 1);
    writeDataFile(data);
    
    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 });
  }
}

