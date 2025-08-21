import response from "../../../utils/response";
import db from "../../../lib/db";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const [rows] = await db.query(`
      SELECT 
        product_bundling .*,
        promosi_product.name,
        promosi_product.price,
        promosi_product.category,
        promosi_product.menu_class
      FROM product_bundling
      JOIN promosi_product ON product_bundling.promosi_id = promosi_product.promosi_id
    `);

    const responseBody = response(200, rows, "Data retrieved successfully");

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database Query Error:", error);

    const responseBody = response(500, null, error.message);

    return new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
