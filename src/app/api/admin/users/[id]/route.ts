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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = readDataFile();
    const user = data.data.find((u: any) => u._id === id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({ status: "success", data: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read user" }, { status: 500 });
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
    const index = data.data.findIndex((u: any) => u._id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // If password is provided, hash it
    const updateData: any = { ...body };
    if (updateData.password) {
      const crypto = require("crypto");
      updateData.password = crypto.createHash("sha256").update(updateData.password).digest("hex");
    }
    
    // Don't allow email changes for existing users
    delete updateData.email;
    
    data.data[index] = {
      ...data.data[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    writeDataFile(data);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = data.data[index];
    
    return NextResponse.json({ status: "success", data: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
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
    
    data.data.splice(index, 1);
    writeDataFile(data);
    
    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

