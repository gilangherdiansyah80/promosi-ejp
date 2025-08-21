import { NextResponse } from "next/server";
import db from "../../../../lib/db";
export const dynamic = "force-dynamic";

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { bundling_id, status } = body;

    if (!bundling_id || !status) {
      return NextResponse.json(
        { error: "bundling_id & status wajib diisi" },
        { status: 400 }
      );
    }

    const validStatuses = ["Menunggu Persetujuan", "Disetujui", "Ditolak"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE product_bundling 
      SET status = ? 
      WHERE bundling_id = ?
    `;

    const [result] = await db.query(sql, [status, bundling_id]);

    return NextResponse.json(
      { message: `Status bundling berhasil diubah ke ${status}`, result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
