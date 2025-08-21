import { NextResponse } from "next/server";
import db from "../../../../lib/db";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products harus berupa array & tidak boleh kosong" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO promosi_product (
        name,
        price,
        category,
        menu_class,
        transaction_date
      ) VALUES ?
    `;

    // Buat array values per baris
    const values = products.map((p) => [
      p.name,
      p.price,
      p.category,
      p.menuClasses.join(", "),
      p.transactionDate,
    ]);

    const [result] = await db.query(sql, [values]);

    return NextResponse.json(
      { message: "Semua data promosi berhasil ditambahkan", result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inserting promosi:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan data promosi", error: error.message },
      { status: 500 }
    );
  }
}
