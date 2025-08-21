import { NextResponse } from "next/server";
import db from "../../../../lib/db"; // Sesuaikan dengan path ke file koneksi database Anda
import fs from "fs/promises";
import path from "path";
export const dynamic = "force-dynamic";

// Menggunakan multer untuk menangani file upload
export async function POST(req) {
  const formData = await req.formData(); // Mendapatkan formData dari request

  try {
    // Mengambil data lain dari formData
    const username = formData.get("username");
    const password = formData.get("password");
    const role = formData.get("role");

    // Validasi inputan
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "All fields except image are required" },
        { status: 400 }
      );
    }

    // SQL query untuk menambahkan data produk
    const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;

    // Menjalankan query untuk menambahkan data produk ke database
    await db.query(sql, [username, password, role]);

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST function:", error);
    return NextResponse.json(
      { message: "Failed to create users", error: error.message },
      { status: 500 }
    );
  }
}
