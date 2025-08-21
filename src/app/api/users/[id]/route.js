import { NextResponse } from "next/server";
import response from "../../../../utils/response";
import db from "../../../../lib/db";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [
      id,
    ]);

    // Menggunakan fungsi response
    const responseBody = response(200, rows, "Data retrieved successfully");

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database Query Error:", error);

    // Menggunakan fungsi response untuk error
    const responseBody = response(500, null, error.message);

    return new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
