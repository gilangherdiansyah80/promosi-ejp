import fs from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import csv from "csv-parser";
import { NextResponse } from "next/server";
import db from "../../../../lib/db"; // Sesuaikan path DB-mu!
export const dynamic = "force-dynamic";

export const config = {
  api: {
    bodyParser: false,
  },
};

// 🔵 Helpers
function normalizeKey(key) {
  return key.trim().replace(/\./g, "").replace(/\s+/g, "");
}

function cleanData(rawData) {
  return rawData
    .map((row) => {
      const cleanedRow = {};
      Object.keys(row).forEach((k) => {
        const key = normalizeKey(k);
        const val = row[k];
        if (val && val.toString().trim() !== "") {
          cleanedRow[key] = val.toString().trim();
        }
      });
      return cleanedRow;
    })
    .filter(
      (row) =>
        row["ReffNo"] &&
        row["ItemName"] &&
        row["Category"] &&
        row["ItemSales"] &&
        row["TransactionDate"]
    );
}

function filterData(cleanedData) {
  return cleanedData.map((row) => ({
    reffNo: row["ReffNo"],
    itemName: row["ItemName"],
    category: row["Category"],
    price: parseFloat(row["ItemSales"]?.replace(/[^\d.-]/g, "") || "0"),
    transactionDate: normalizeDate(row["TransactionDate"]) || null,
  }));
}

function transformData(filteredData) {
  const baskets = {};

  filteredData.forEach((row) => {
    if (!baskets[row.reffNo]) {
      baskets[row.reffNo] = {
        items: [],
        transactionDate: row.transactionDate,
      };
    }
    baskets[row.reffNo].items.push({
      item: row.itemName,
      category: row.category,
      price: row.price,
    });
  });

  return Object.entries(baskets).map(([reffNo, data]) => ({
    reffNo,
    items: data.items,
    transactionDate: data.transactionDate,
  }));
}

function dummyFPGrowth(transactions) {
  const supportCount = {};
  const priceMap = {};
  const categoryMap = {};
  const dateMap = {};
  const pairDateMap = {};

  transactions.forEach(({ items, transactionDate }) => {
    items.forEach(({ item, price, category }) => {
      supportCount[item] = (supportCount[item] || 0) + 1;
      priceMap[item] = price;
      categoryMap[item] = category;
      if (!dateMap[item]) dateMap[item] = transactionDate;
    });
  });

  const frequentItems = Object.entries(supportCount).map(([item, count]) => ({
    itemset: [item],
    support: count,
    totalPrice: priceMap[item] || 0,
    category: categoryMap[item] || null,
    transactionDate: dateMap[item] || null,
  }));

  const pairCounts = {};
  const pairPrices = {};

  transactions.forEach(({ items, transactionDate }) => {
    const uniqueItems = [...new Map(items.map((i) => [i.item, i])).values()];
    for (let i = 0; i < uniqueItems.length; i++) {
      for (let j = i + 1; j < uniqueItems.length; j++) {
        const a = uniqueItems[i];
        const b = uniqueItems[j];
        const pairKey = [a.item, b.item].sort().join(",");
        pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
        pairPrices[pairKey] = (a.price || 0) + (b.price || 0);
        if (!pairDateMap[pairKey]) pairDateMap[pairKey] = transactionDate;
      }
    }
  });

  const minSupport = 5;
  const frequentPairs = Object.entries(pairCounts)
    .filter(([, count]) => count >= minSupport)
    .map(([pair, count]) => {
      const [a, b] = pair.split(",");
      return {
        itemset: [a, b],
        support: count,
        totalPrice: pairPrices[pair] || 0,
        category: `${categoryMap[a]} + ${categoryMap[b]}`,
        transactionDate: pairDateMap[pair] || null,
      };
    });

  const associationRules = frequentPairs.map(
    ({ itemset, support, totalPrice, category, transactionDate }) => {
      const [A, B] = itemset;
      const confidenceAtoB = (support / supportCount[A]) * 100;
      const confidenceBtoA = (support / supportCount[B]) * 100;
      return {
        itemset,
        rule: `${A} => ${B}`,
        confidence: confidenceAtoB.toFixed(2) + "%",
        reverseRule: `${B} => ${A}`,
        reverseConfidence: confidenceBtoA.toFixed(2) + "%",
        totalPrice: totalPrice.toFixed(2),
        category,
        transactionDate,
      };
    }
  );

  return {
    supportCount,
    frequentItems: [...frequentItems, ...frequentPairs],
    associationRules,
  };
}

// Helper function to normalize date format for CSV
function normalizeDate(dateValue) {
  if (!dateValue) return null;

  // Convert to string first to handle all cases
  const strValue = dateValue.toString();

  // If it's already a string in date format, return as is
  if (strValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return strValue;
  }

  // If it's a Date object, format it
  if (dateValue instanceof Date && !isNaN(dateValue)) {
    const day = String(dateValue.getDate()).padStart(2, "0");
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const year = dateValue.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Try to parse various date formats
  if (strValue.includes("-")) {
    // Handle YYYY-MM-DD or DD-MM-YYYY format
    const parts = strValue.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${
          parts[0]
        }`;
      } else {
        // DD-MM-YYYY
        return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${
          parts[2]
        }`;
      }
    }
  }

  // Return null if can't process
  console.log(
    "Could not normalize date:",
    dateValue,
    "type:",
    typeof dateValue
  );
  return null;
}

async function parseCSVFile(filePath) {
  const rawData = [];
  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csv({ separator: ";" }))
      .on("data", (row) => {
        // Normalize date fields for CSV
        if (row.TransactionDate) {
          row.TransactionDate = normalizeDate(row.TransactionDate);
        }
        rawData.push(row);
      })
      .on("end", () => resolve(rawData))
      .on("error", reject);
  });
}

// 🔥 NEW: Function to get menu classes with case-insensitive matching
async function getMenuClassesForProducts(uniqueNames) {
  try {
    if (uniqueNames.size === 0) {
      return {};
    }

    // Get all products from database first
    const getAllProductsQuery = "SELECT nama_produk, menu_class FROM produk";
    const [allProducts] = await db.query(getAllProductsQuery);

    // Create a case-insensitive mapping
    const menuClassMap = {};
    const dbProductMap = new Map();

    // Create a normalized map of database products
    allProducts.forEach((product) => {
      const normalizedDbName = product.nama_produk.toLowerCase().trim();
      dbProductMap.set(normalizedDbName, {
        originalName: product.nama_produk,
        menuClass: product.menu_class,
      });
    });

    // Match unique names with database products
    [...uniqueNames].forEach((csvProductName) => {
      const normalizedCsvName = csvProductName.toLowerCase().trim();

      // Try exact match first
      if (dbProductMap.has(normalizedCsvName)) {
        const match = dbProductMap.get(normalizedCsvName);
        menuClassMap[csvProductName] = match.menuClass;
        return;
      }

      // Try partial matching - check if CSV name contains DB name or vice versa
      let bestMatch = null;
      let bestMatchScore = 0;

      for (const [dbNormalizedName, dbProduct] of dbProductMap.entries()) {
        let matchScore = 0;

        // Check for substring matches
        if (normalizedCsvName.includes(dbNormalizedName)) {
          matchScore = dbNormalizedName.length / normalizedCsvName.length;
        } else if (dbNormalizedName.includes(normalizedCsvName)) {
          matchScore = normalizedCsvName.length / dbNormalizedName.length;
        }

        // Check for word-level matches
        const csvWords = normalizedCsvName.split(/\s+/);
        const dbWords = dbNormalizedName.split(/\s+/);
        const commonWords = csvWords.filter((word) =>
          dbWords.some(
            (dbWord) => dbWord.includes(word) || word.includes(dbWord)
          )
        ).length;

        if (commonWords > 0) {
          const wordMatchScore =
            (commonWords * 2) / (csvWords.length + dbWords.length);
          matchScore = Math.max(matchScore, wordMatchScore);
        }

        if (matchScore > bestMatchScore && matchScore > 0.5) {
          // Threshold for similarity
          bestMatch = dbProduct;
          bestMatchScore = matchScore;
        }
      }

      if (bestMatch) {
        menuClassMap[csvProductName] = bestMatch.menuClass;
        console.log(
          `Matched "${csvProductName}" with "${
            bestMatch.originalName
          }" (score: ${bestMatchScore.toFixed(2)})`
        );
      } else {
        menuClassMap[csvProductName] = null;
        console.log(`No match found for "${csvProductName}"`);
      }
    });

    return menuClassMap;
  } catch (error) {
    console.error("Error getting menu classes:", error);
    // Fallback to original method if something goes wrong
    const uniqueNamesArray = [...uniqueNames];
    const placeholders = uniqueNamesArray.map(() => "?").join(",");
    const sql = `SELECT nama_produk, menu_class FROM produk WHERE nama_produk IN (${placeholders})`;

    try {
      const [rows] = await db.query(sql, uniqueNamesArray);
      const fallbackMap = {};
      rows.forEach((row) => {
        fallbackMap[row.nama_produk] = row.menu_class;
      });
      return fallbackMap;
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError);
      return {};
    }
  }
}

// ✅ MAIN HANDLER
export async function POST(req) {
  let filePath = null;
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check if file is CSV
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      return NextResponse.json(
        {
          error: "Only CSV files are supported. Please upload a .csv file.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
    await fs.writeFile(filePath, buffer);

    const rawData = await parseCSVFile(filePath);
    if (!rawData.length) {
      throw new Error("Uploaded CSV file is empty or unreadable.");
    }

    const cleanedData = cleanData(rawData);
    if (!cleanedData.length) {
      throw new Error(
        "No valid data found in CSV file. Please check the required columns: ReffNo, ItemName, Category, ItemSales, TransactionDate"
      );
    }

    const filteredData = filterData(cleanedData);
    const transformedData = transformData(filteredData);
    const fpResults = dummyFPGrowth(transformedData);

    // Collect unique product names
    const uniqueNames = new Set();
    fpResults.frequentItems.forEach((fi) =>
      fi.itemset.forEach((name) => uniqueNames.add(name))
    );
    fpResults.associationRules.forEach((rule) =>
      rule.itemset.forEach((name) => uniqueNames.add(name))
    );

    // 🔥 Use improved menu class matching
    const menuClassMap = await getMenuClassesForProducts(uniqueNames);

    // Log matching results for debugging
    console.log("Product matching results:");
    [...uniqueNames].forEach((name) => {
      console.log(`"${name}" -> ${menuClassMap[name] || "No match"}`);
    });

    const frequentItems = fpResults.frequentItems.map((fi) => ({
      ...fi,
      menuClasses: fi.itemset.map((name) => menuClassMap[name] || null),
    }));

    const associationRules = fpResults.associationRules.map((rule) => ({
      ...rule,
      menuClasses: rule.itemset.map((name) => menuClassMap[name] || null),
    }));

    return NextResponse.json({
      preprocessing: {
        totalRaw: rawData.length,
        cleanedCount: cleanedData.length,
        filteredSample: filteredData.slice(0, 5),
        transformedSample: transformedData.slice(0, 5),
      },
      matching: {
        totalUniqueProducts: uniqueNames.size,
        matchedProducts: Object.values(menuClassMap).filter((v) => v !== null)
          .length,
        matchingDetails: Object.fromEntries(
          [...uniqueNames].map((name) => [
            name,
            menuClassMap[name] || "No match",
          ])
        ),
      },
      frequentItems,
      associationRules,
    });
  } catch (err) {
    console.error("Processing Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (filePath) {
      await fs.unlink(filePath).catch(() => {}); // hapus file sementara
    }
  }
}
