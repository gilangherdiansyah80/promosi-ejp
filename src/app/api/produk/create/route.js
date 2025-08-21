import { NextResponse } from "next/server";
import formidable from "formidable";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { createReadStream } from "fs";
import csv from "csv-parser";
import db from "../../../../lib/db";
export const dynamic = "force-dynamic";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// Helper: Convert ReadableStream to Node.js Readable
async function streamToNodeReadable(req) {
  const readable = Readable.fromWeb(req.body);
  return Object.assign(readable, {
    headers: Object.fromEntries(req.headers),
    method: req.method,
    url: req.url,
  });
}

// Parse multipart form → return file info
async function parseForm(req) {
  const nodeReq = await streamToNodeReadable(req);

  const uploadDir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 12 * 1024 * 1024,
  });

  return new Promise((resolve, reject) => {
    form.parse(nodeReq, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

// Helper function to clean currency and percentage values
function cleanCurrencyValue(value) {
  if (!value || value === "") return 0;
  // Remove Rp, dots, commas, and spaces
  const cleaned = value
    .toString()
    .replace(/[Rp\.\s]/g, "")
    .replace(/,/g, ".");
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
}

// DEBUG: Function to read first few lines of file
async function debugReadFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const lines = content.split("\n").slice(0, 5); // First 5 lines
    console.log("🔍 FILE CONTENT DEBUG:");
    lines.forEach((line, index) => {
      console.log(`Line ${index + 1}: "${line}"`);
      console.log(
        `Line ${index + 1} chars:`,
        line.split("").map((c) => c.charCodeAt(0))
      );
    });

    // Detect delimiter
    const firstDataLine = lines[0] || "";
    const semicolonCount = (firstDataLine.match(/;/g) || []).length;
    const commaCount = (firstDataLine.match(/,/g) || []).length;
    const tabCount = (firstDataLine.match(/\t/g) || []).length;

    console.log("🔍 DELIMITER ANALYSIS:");
    console.log(`Semicolons (;): ${semicolonCount}`);
    console.log(`Commas (,): ${commaCount}`);
    console.log(`Tabs: ${tabCount}`);

    return { semicolonCount, commaCount, tabCount, firstLine: firstDataLine };
  } catch (error) {
    console.error("❌ Debug read file error:", error);
    return null;
  }
}

// Enhanced CSV parser with better debugging
async function parseCSVFile(filePath) {
  // First, debug the file content
  const debugInfo = await debugReadFile(filePath);

  // Determine best delimiter
  let delimiter = ";"; // default
  if (debugInfo) {
    if (debugInfo.commaCount > debugInfo.semicolonCount) {
      delimiter = ",";
    } else if (
      debugInfo.tabCount >
      Math.max(debugInfo.semicolonCount, debugInfo.commaCount)
    ) {
      delimiter = "\t";
    }
  }

  console.log(`🔍 Using delimiter: "${delimiter}"`);

  const rows = [];
  let rawRowCount = 0;
  let headerDetected = null;

  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(
        csv({
          separator: delimiter,
          skipEmptyLines: true,
        })
      )
      .on("data", (row) => {
        rawRowCount++;

        // Capture header on first row
        if (!headerDetected) {
          headerDetected = Object.keys(row);
          console.log("📋 DETECTED HEADERS:", headerDetected);
          console.log("📋 FIRST ROW DATA:", row);
        }

        // Log first few rows for debugging
        if (rawRowCount <= 3) {
          console.log(`📋 Row ${rawRowCount}:`, row);
        }

        // Try different possible column names
        const possibleNames = [
          // Nama Product variations
          row["Nama Product"] ||
            row["nama_product"] ||
            row["Name"] ||
            row["Product Name"] ||
            row["NAMA PRODUCT"] ||
            row["Nama Produk"] ||
            row["nama_produk"] ||
            Object.values(row)[0], // First column fallback

          // Category variations
          row["Category Product"] ||
            row["category_product"] ||
            row["Category"] ||
            row["Kategori"] ||
            row["CATEGORY PRODUCT"] ||
            row["Kategori Produk"] ||
            row["kategori_produk"] ||
            Object.values(row)[1], // Second column fallback

          // Price variations
          row["Price"] ||
            row["price"] ||
            row["Harga"] ||
            row["PRICE"] ||
            row["harga"] ||
            Object.values(row)[2], // Third column fallback

          // Menu Class variations
          row["Menu Class"] ||
            row["menu_class"] ||
            row["Class"] ||
            row["Kelas Menu"] ||
            row["MENU CLASS"] ||
            row["Kelas"] ||
            row["kelas"] ||
            Object.values(row)[3] ||
            "", // Fourth column fallback
        ];

        const namaProduct = possibleNames[0]?.toString().trim() || "";
        const categoryProduct = possibleNames[1]?.toString().trim() || "";
        const price = possibleNames[2] || "";
        const menuClass = possibleNames[3]?.toString().trim() || "";

        console.log(`🔍 Row ${rawRowCount} processed:`, {
          nama: namaProduct,
          category: categoryProduct,
          price: price,
          menuClass: menuClass,
        });

        // Skip header row and empty rows
        if (
          namaProduct &&
          namaProduct !== "" &&
          namaProduct.toLowerCase() !== "nama product" &&
          namaProduct.toLowerCase() !== "name" &&
          categoryProduct &&
          categoryProduct !== "" &&
          categoryProduct.toLowerCase() !== "category product" &&
          categoryProduct.toLowerCase() !== "category"
        ) {
          rows.push({
            nama_product: namaProduct,
            category_product: categoryProduct,
            price: price,
            menu_class: menuClass,
          });

          console.log(
            `✅ Valid row added: ${namaProduct} - ${categoryProduct}`
          );
        } else {
          console.log(
            `⏭️ Row ${rawRowCount} skipped: nama="${namaProduct}", category="${categoryProduct}"`
          );
        }
      })
      .on("end", () => {
        console.log(`🏁 CSV parsing completed:`);
        console.log(`   Raw rows processed: ${rawRowCount}`);
        console.log(`   Valid rows found: ${rows.length}`);
        console.log(`   Headers detected:`, headerDetected);

        if (rows.length > 0) {
          console.log(`📋 Sample valid data:`, rows.slice(0, 2));
        }

        resolve(rows);
      })
      .on("error", (error) => {
        console.error("❌ CSV parse error:", error);
        reject(error);
      });
  });
}

export async function POST(req) {
  let filePath = null;

  try {
    console.log("🚀 Starting CSV upload process");
    const { files } = await parseForm(req);
    const file = files.file?.[0];

    if (!file) {
      return NextResponse.json(
        { message: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    filePath = file.filepath;
    const ext = path.extname(file.originalFilename || "").toLowerCase();
    console.log(
      `📄 File received: ${file.originalFilename}, size: ${file.size} bytes`
    );

    // Validasi hanya CSV
    if (ext !== ".csv") {
      return NextResponse.json(
        { message: "Hanya file CSV yang diizinkan" },
        { status: 400 }
      );
    }

    // Parse CSV file
    console.log("📋 Starting CSV parsing...");
    const rows = await parseCSVFile(filePath);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          message: "Tidak ada data valid dalam CSV",
          debug: "Periksa console log server untuk detail parsing",
          hint: "Pastikan CSV memiliki header dan data yang sesuai",
        },
        { status: 400 }
      );
    }

    // Validate and clean data
    const data = [];
    const errors = [];

    rows.forEach((row, idx) => {
      const nama = row.nama_product?.toString().trim();
      const kategori = row.category_product?.toString().trim();
      const price = cleanCurrencyValue(row.price);
      const menuClass = row.menu_class?.toString().trim() || "";

      // Validasi data wajib
      if (!nama) {
        errors.push(`Baris ${idx + 2}: nama_product kosong`);
        return;
      }

      if (!kategori) {
        errors.push(`Baris ${idx + 2}: category_product kosong`);
        return;
      }

      data.push([nama, kategori, price, menuClass]);
    });

    // Jika ada error validasi
    if (errors.length > 0) {
      console.warn("❗ Validation errors:", errors);
      return NextResponse.json(
        {
          message: "Terdapat data yang tidak valid",
          errors: errors.slice(0, 10),
          totalErrors: errors.length,
          validData: data.length,
          debug: "Periksa console log untuk detail",
        },
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { message: "Semua baris tidak valid setelah validasi!" },
        { status: 400 }
      );
    }

    // Insert ke database
    console.log(`💾 Inserting ${data.length} records to database...`);
    const sql = `INSERT INTO produk (
      nama_produk, 
      kategori, 
      harga, 
      menu_class
    ) VALUES (?, ?, ?, ?)`;

    let successCount = 0;
    const insertErrors = [];

    for (let i = 0; i < data.length; i++) {
      try {
        await db.query(sql, data[i]);
        successCount++;
        console.log(`✅ Inserted: ${data[i][0]} - ${data[i][1]}`);
      } catch (dbError) {
        console.error(`❌ Insert error for row ${i + 1}:`, dbError.message);
        insertErrors.push(`${data[i][0]}: ${dbError.message}`);
      }
    }

    // Response berdasarkan hasil insert
    if (successCount === data.length) {
      return NextResponse.json(
        {
          message: `Berhasil import ${successCount} data`,
          imported: successCount,
          total: data.length,
          summary: `Semua data berhasil diimpor ke database`,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: `Import selesai dengan ${successCount}/${data.length} data berhasil`,
          imported: successCount,
          total: data.length,
          errors: insertErrors.slice(0, 10),
          summary: `${successCount} data berhasil, ${insertErrors.length} data gagal`,
        },
        { status: 207 }
      );
    }
  } catch (err) {
    console.error("💥 Server error:", err);
    return NextResponse.json(
      {
        message: "Terjadi error pada server",
        error: err.message,
        debug: "Periksa console log server untuk detail",
      },
      { status: 500 }
    );
  } finally {
    // Cleanup temporary file
    if (filePath) {
      try {
        await fs.promises.unlink(filePath);
        console.log("🗑️ Temporary file cleaned up");
      } catch (cleanupError) {
        console.warn("⚠️ Failed to cleanup file:", cleanupError.message);
      }
    }
  }
}
