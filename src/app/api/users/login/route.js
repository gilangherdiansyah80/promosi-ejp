import db from "../../../../lib/db";
import response from "../../../../utils/response";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // Ambil data dari request body
    const body = await request.json();
    const { username, password } = body;

    // Validasi input
    if (!username || !password) {
      return new Response(
        JSON.stringify(
          response(400, null, "username and password are required")
        ),
        { status: 400 }
      );
    }

    // Cari pengguna berdasarkan username
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (rows.length === 0) {
      return new Response(
        JSON.stringify(response(401, null, "Invalid username or password")),
        { status: 401 }
      );
    }

    const user = rows[0];

    // Bandingkan password langsung
    if (password !== user.password) {
      return new Response(
        JSON.stringify(response(401, null, "Invalid username or password")),
        { status: 401 }
      );
    }

    // Kirim respon sukses dengan token
    return new Response(
      JSON.stringify(
        response(
          200,
          {
            user: {
              id: user.user_id,
              username: user.username,
              role: user.role,
            },
          },
          "Login successful"
        )
      ),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return new Response(
      JSON.stringify(response(500, null, "An error occurred during login")),
      { status: 500 }
    );
  }
}
