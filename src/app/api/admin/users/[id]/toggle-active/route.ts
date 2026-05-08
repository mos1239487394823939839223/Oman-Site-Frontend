import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function readDataFile() {
  try {
    const fileContent = fs.readFileSync(USERS_FILE, "utf-8");
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
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing file:", error);
    return false;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = readDataFile();
    const index = data.data.findIndex((u: any) => u._id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Toggle active status
    data.data[index] = {
      ...data.data[index],
      active: !data.data[index].active,
      updatedAt: new Date().toISOString(),
    };
    
    writeDataFile(data);
    return NextResponse.json({ status: "success", data: data.data[index] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle user active status" }, { status: 500 });
  }
}

