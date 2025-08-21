"use client";

import { useState, useEffect } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load uploaded files history
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const res = await fetch("/api/uploaded-files");
      if (res.ok) {
        const data = await res.json();
        setUploadedFiles(data.files || []);
      }
    } catch (err) {
      console.error("Error fetching uploaded files:", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Validate CSV file
    if (selectedFile && !selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Hanya file CSV yang didukung. Silakan pilih file .csv");
      setFile(null);
      e.target.value = ""; // Clear the input
      return;
    }

    setFile(selectedFile);
    setError(null); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Silakan pilih file CSV!");
      return;
    }

    // Double-check file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Hanya file CSV yang didukung!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null); // Clear previous results

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/product-cost/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload gagal");
      }

      setResult(data);
      setError(null);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    // Prevent multiple submissions or invalid state
    if (!result?.associationRules || submitting) {
      return;
    }

    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      // 1. Save to promo products (existing functionality)
      const formattedData = result.associationRules.map((item) => ({
        name: item.rule.replace(" => ", " + "),
        price: parseInt(item.totalPrice) || 0,
        category: item.category,
        menuClasses: item.menuClasses,
        transactionDate: item.transactionDate,
      }));

      console.log("Step 1: Saving to promo products...");
      const promoRes = await fetch("/api/promo-product/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: formattedData }),
      });

      if (!promoRes.ok) {
        const promoError = await promoRes.json();
        throw new Error(promoError.error || "Failed to save promo products");
      }

      // 2. Prepare file info with proper data
      const fileInfoToSave = {
        originalName: file.name,
        fileName: `${Date.now()}-${file.name}`,
        fileSize: file.size,
        totalRecords: result.preprocessing.totalRaw,
        cleanedRecords: result.preprocessing.cleanedCount,
        associationRulesCount: result.associationRules.length,
        status: "promoted",
      };

      console.log("Step 2: Saving file info and association rules...");

      // 3. Save file info and association rules to database
      const fileRes = await fetch("/api/product-cost/save-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileInfo: fileInfoToSave,
          associationRules: result.associationRules,
          promotionData: formattedData,
        }),
      });

      if (!fileRes.ok) {
        const errorData = await fileRes.json();
        throw new Error(errorData.error || "Failed to save file data");
      }

      console.log("Success: All data saved successfully");
      setSuccess("Data berhasil disimpan dan promosi berhasil dibuat!");

      // Refresh file history in background
      fetchUploadedFiles().catch(console.error);

      // Clear current result and reset form
      setResult(null);
      setFile(null);

      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload CSV untuk FP-Growth</h1>
      </div>

      {/* Upload Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload File CSV</h2>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || submitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Hanya file CSV yang didukung. Format yang dibutuhkan: ReffNo,
              ItemName, Category, ItemSales, TransactionDate
            </p>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || submitting || !file}
          >
            {loading ? "Memproses..." : "Jalankan Analisis"}
          </button>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Sukses:</strong> {success}
        </div>
      )}

      {/* Results */}
      {result?.associationRules && (
        <div>
          <section className="bg-[#f6df3c] p-3 rounded mb-4">
            <h2 className="text-lg font-bold mb-2">Hasil Promosi</h2>
            <section>
              <h2>
                Data Transaksi{" "}
                {result.associationRules[0]?.transactionDate?.slice(9) ||
                  "tanpa tanggal"}{" "}
                sudah dibuat
              </h2>
              <p className="text-sm mt-2">
                Ditemukan <strong>{result.associationRules.length}</strong>{" "}
                aturan asosiasi dari{" "}
                <strong>{result.preprocessing?.totalRaw || 0}</strong> data
                mentah
              </p>
            </section>
          </section>

          <button
            onClick={handleSaveToDatabase}
            className="w-full px-6 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : "Buat Promosi & Simpan ke Database"}
          </button>
        </div>
      )}
    </main>
  );
}
