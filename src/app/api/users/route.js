import db from "../../../lib/db";
import response from "../../../utils/response";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const [rows] = await db.query("SELECT * FROM users");

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
