import { NextResponse } from "next/server";
import db from "../../../../lib/db";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  let query = "SELECT * FROM promosi_product";
  let params = [];

  if (month && year) {
    query += " WHERE MONTH(create_at) = ? AND YEAR(create_at) = ?";
    params.push(month, year);
  } else if (month) {
    query += " WHERE MONTH(create_at) = ?";
    params.push(month);
  } else if (year) {
    query += " WHERE YEAR(create_at) = ?";
    params.push(year);
  }

  try {
    const [rows] = await db.execute(query, params);
    return NextResponse.json({ payload: { datas: rows } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error ambil data" }, { status: 500 });
  }
}
