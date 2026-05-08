import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role = "user" } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const data = readDataFile();
    const users = data.data || [];

    // Check if email already exists
    const existingUser = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const now = new Date().toISOString();
    const newUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name,
      email: email.toLowerCase(),
      password: hashPassword(password), // Store hashed password
      phone: phone || "",
      role: role || "user",
      active: true,
      addresses: [],
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    writeDataFile({ data: users });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Generate a simple token for local auth
    const token = `local_user_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      status: "success",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}

