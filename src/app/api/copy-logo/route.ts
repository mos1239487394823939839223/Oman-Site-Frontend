import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const srcPath = `C:\\Users\\moham\\.gemini\\antigravity\\brain\\73c1bb64-4010-44bb-b8ee-ae69d1d76f9f\\media__1779065477172.png`;
    const destPath = path.join(process.cwd(), "public", "logo.png");

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      return NextResponse.json({ success: true, message: "Logo copied successfully!" });
    } else {
      return NextResponse.json({ success: false, error: "Source file not found at: " + srcPath }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
