import db from "../../../../../lib/db";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { message: "Produk ID is required" },
      { status: 400 }
    );
  }

  const sql = "DELETE FROM produk WHERE id_produk = ?";
  try {
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Produk not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Produk deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error deleting Produk:", error);
    return NextResponse.json(
      { message: "Failed to delete Produk" },
      { status: 500 }
    );
  }
}
