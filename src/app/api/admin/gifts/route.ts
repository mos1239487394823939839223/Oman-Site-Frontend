import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const GIFTS_FILE = path.join(DATA_DIR, "gifts.json");

function readDataFile() {
  try {
    if (!fs.existsSync(GIFTS_FILE)) {
      return { data: [] };
    }
    const fileContent = fs.readFileSync(GIFTS_FILE, "utf-8");
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
    fs.writeFileSync(GIFTS_FILE, JSON.stringify(data, null, 2), "utf-8");
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
    return NextResponse.json({ error: "Failed to read gifts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readDataFile();
    
    const newGift = {
      _id: `gift_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...body,
      isGift: true,
      price: 0, // Gifts are free
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.data.push(newGift);
    writeDataFile(data);
    
    return NextResponse.json({ status: "success", data: newGift });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create gift" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const data = readDataFile();
    const initialLength = data.data.length;
    data.data = data.data.filter((item: any) => item._id !== id);
    
    if (data.data.length === initialLength) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    writeDataFile(data);
    return NextResponse.json({ status: "success", message: "Gift deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete gift" }, { status: 500 });
  }
}
