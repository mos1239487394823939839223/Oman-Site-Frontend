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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = readDataFile();
    const brand = data.data.find((b: any) => b._id === id);
    
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    
    return NextResponse.json({ status: "success", data: brand });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read brand" }, { status: 500 });
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
    const index = data.data.findIndex((b: any) => b._id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    
    data.data[index] = {
      ...data.data[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    writeDataFile(data);
    return NextResponse.json({ status: "success", data: data.data[index] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = readDataFile();
    const index = data.data.findIndex((b: any) => b._id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    
    data.data.splice(index, 1);
    writeDataFile(data);
    
    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}

