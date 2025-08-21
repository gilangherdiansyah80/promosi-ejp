import { NextResponse } from "next/server";
import db from "../../../../lib/db";
export const dynamic = "force-dynamic";

// CREATE - Save uploaded file info to database
export async function POST(req) {
  try {
    const { fileInfo, associationRules, promotionData } = await req.json();

    console.log("Received data:", {
      fileInfo,
      associationRulesCount: associationRules?.length,
    });

    // Validate required fields
    if (!fileInfo || !fileInfo.originalName) {
      return NextResponse.json(
        { error: "Missing required file information" },
        { status: 400 }
      );
    }

    // Save file upload record
    const insertFileQuery = `
      INSERT INTO uploaded_files (
        original_name, 
        file_name, 
        file_size, 
        total_records, 
        cleaned_records, 
        association_rules_count, 
        status,
        promotion_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const fileParams = [
      fileInfo.originalName || "unknown",
      fileInfo.fileName || "unknown",
      fileInfo.fileSize || 0,
      fileInfo.totalRecords || 0,
      fileInfo.cleanedRecords || 0,
      fileInfo.associationRulesCount || 0,
      "promoted", // Since we're creating promotion
      new Date(),
    ];

    console.log("Inserting file with params:", fileParams);

    const result = await db.query(insertFileQuery, fileParams);

    // Get the inserted file ID
    let fileId;
    if (Array.isArray(result)) {
      fileId = result.insertId;
    } else if (result && result[0]) {
      fileId = result[0].insertId;
    } else if (result && result.insertId) {
      fileId = result.insertId;
    } else {
      console.warn("Could not get insertId from result:", result);
      fileId = 1; // fallback
    }

    console.log("File inserted with ID:", fileId);

    // Save association rules with file reference (optional)
    if (associationRules && associationRules.length > 0 && fileId) {
      try {
        const rulesQuery = `
          INSERT INTO file_association_rules (
            file_id, 
            rule_text, 
            confidence, 
            total_price, 
            category, 
            transaction_date,
            menu_classes
          ) VALUES ?
        `;

        const rulesValues = associationRules.map((rule) => [
          fileId,
          rule.rule || "",
          rule.confidence || "0%",
          parseFloat(rule.totalPrice) || 0,
          rule.category || "",
          rule.transactionDate || null,
          JSON.stringify(rule.menuClasses || []),
        ]);

        await db.query(rulesQuery, [rulesValues]);
        console.log("Association rules saved successfully");
      } catch (rulesError) {
        console.warn("Failed to save association rules:", rulesError.message);
        // Don't fail the whole operation if rules can't be saved
      }
    }

    return NextResponse.json({
      success: true,
      message: "File dan data berhasil disimpan",
      fileId,
    });
  } catch (error) {
    console.error("Error saving file data:", error);
    return NextResponse.json(
      { error: "Failed to save file data: " + error.message },
      { status: 500 }
    );
  }
}

// READ - Get all uploaded files
export async function GET() {
  try {
    const query = `
      SELECT 
        id,
        original_name,
        file_name,
        file_size,
        total_records,
        cleaned_records,
        association_rules_count,
        status,
        promotion_created_at
      FROM uploaded_files 
      ORDER BY upload_date DESC
    `;

    const result = await db.query(query);

    let files;
    if (Array.isArray(result)) {
      files = result;
    } else if (result && Array.isArray(result[0])) {
      files = result[0];
    } else if (result && result.rows) {
      files = result.rows;
    } else {
      files = [];
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files: " + error.message },
      { status: 500 }
    );
  }
}
