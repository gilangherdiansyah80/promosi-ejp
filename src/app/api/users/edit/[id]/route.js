import db from "../../../../../lib/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  const { id } = params; // Mengambil ID dari params
  const { username, password, role } = await req.json(); // Parsing body request

  // Validasi input
  if (!id || !username || !password || !role) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  // Query SQL untuk update data
  const sql =
    "UPDATE users SET username = ?, password = ?, role = ? WHERE id_user = ?";
  const queryParams = [username, password, role, id]; // Ubah nama variabel params

  try {
    const [result] = await db.query(sql, queryParams);
    return NextResponse.json(
      { message: "User updated successfully", result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user" },
      { status: 500 }
    );
  }
}
