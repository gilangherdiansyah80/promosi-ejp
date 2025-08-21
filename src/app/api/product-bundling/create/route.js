import { NextResponse } from "next/server";
import db from "../../../../lib/db";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    let { products, new_price } = body;

    // Normalisasi: jika hanya 1 produk, bungkus jadi array
    if (!Array.isArray(products)) {
      products = [products];
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Products tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Jika user isi harga baru, update harga produk yang dipilih
    if (new_price && !isNaN(new_price)) {
      for (const p of products) {
        await db.query(
          `UPDATE promosi_product SET price = ? WHERE promosi_id = ?`,
          [new_price, p.promosi_id]
        );
      }
    }

    // Simpan relasi ke table product_bundling
    const insertSql = `
      INSERT INTO product_bundling (promosi_id, status)
      VALUES ?
    `;

    const insertValues = products.map((p) => [
      p.promosi_id,
      "Menunggu Persetujuan",
    ]);

    const [result] = await db.query(insertSql, [insertValues]);

    return NextResponse.json(
      {
        message: "Bundling berhasil dibuat & menunggu persetujuan",
        result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inserting bundling:", error);
    return NextResponse.json(
      { message: "Gagal membuat bundling", error: error.message },
      { status: 500 }
    );
  }
}
