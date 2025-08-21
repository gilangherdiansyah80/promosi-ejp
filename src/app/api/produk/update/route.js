import { NextResponse } from "next/server";
import db from "../../../../lib/db";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { bundling_id } = await req.json();

    // ✅ JOIN bundling dengan detail promosi_product
    const [rows] = await db.query(
      `SELECT pb.*, pp.name, pp.price, pp.category, pp.menu_class
       FROM product_bundling pb
       JOIN promosi_product pp ON pb.promosi_id = pp.promosi_id
       WHERE pb.bundling_id = ?`,
      [bundling_id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Bundling tidak ditemukan" },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Terjadi kesalahan", error: err.message },
      { status: 500 }
    );
  }
}
