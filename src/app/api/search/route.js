import db from "../../../lib/db";
import response from "../../../utils/response";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Fungsi handler untuk menangani permintaan
export async function GET(req) {
  try {
    // Ambil parameter query dari URL
    const url = new URL(req.url);
    const query = url.searchParams.get("query");

    // Validasi query
    if (!query || query.trim() === "") {
      return NextResponse.json(
        response(400, [], "Query parameter is required"),
        { status: 400 }
      );
    }

    // Ambil data produk dari database
    const [data] = await db.query("SELECT * FROM topup");

    // Filter data berdasarkan query
    const filteredData = data.filter((item) =>
      item.nama_topup.toLowerCase().includes(query.toLowerCase())
    );

    // Jika tidak ada data yang cocok
    if (filteredData.length === 0) {
      return NextResponse.json(
        response(404, [], "No matching products found"),
        { status: 404 }
      );
    }

    // Kembalikan data yang diformat dengan response helper
    return NextResponse.json(
      response(200, filteredData, "Products fetched successfully"),
      { status: 200 }
    );
  } catch (error) {
    // Menangani kesalahan query atau error lainnya
    console.error(error);
    return NextResponse.json(response(500, [], "Internal Server Error"), {
      status: 500,
    });
  }
}
