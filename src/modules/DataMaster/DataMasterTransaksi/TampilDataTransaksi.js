"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "../../../components/Dashboardlayout";
import UploadPage from "../../ProductCostControlSection/ProductCostControl";

const TampilDataTransaksi = () => {
  const [dataProduk, setDataProduk] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [dataFile, setDataFile] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allFiles, setAllFiles] = useState([]);

  // New states for file content viewing
  const [showFileContentModal, setShowFileContentModal] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [fileContentLoading, setFileContentLoading] = useState(false);
  const [fileContentError, setFileContentError] = useState(null);
  const [currentViewingFile, setCurrentViewingFile] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/promo-product");
      const data = await response.json();

      if (data.payload && data.payload.datas) {
        setDataProduk(data.payload.datas);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal mengambil data produk");
    }
    setIsLoading(false);
  };

  const fetchDataFilter = async () => {
    if (!selectedMonth && !selectedYear) {
      fetchData();
      return;
    }

    setIsLoading(true);
    try {
      let url = "/api/promo-product/filter";
      const params = new URLSearchParams();

      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedYear) params.append("year", selectedYear);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.payload && data.payload.datas) {
        setDataProduk(data.payload.datas);
      } else {
        setDataProduk([]);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
      await fetchData();
    }
    setIsLoading(false);
  };

  const fetchAllFiles = async () => {
    try {
      const response = await fetch("/api/files");
      const data = await response.json();

      if (data.payload && data.payload.datas) {
        setAllFiles(data.payload.datas);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchDataFile = async () => {
    try {
      const response = await fetch("/api/promo-product");
      const data = await response.json();

      if (data.payload && data.payload.datas) {
        setDataFile(data.payload.datas);
      }
    } catch (error) {
      console.error("Error fetching file data:", error);
    }
  };

  // Function to fetch and display file content
  const fetchFileContent = async (file) => {
    setFileContentLoading(true);
    setFileContentError(null);
    setCurrentViewingFile(file);

    try {
      // First, try to get file content from API if available
      const response = await fetch(
        `/api/promo-product/show-file/${file.id || file.file_name}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.payload && data.payload.content) {
          // If API returns structured content
          setFileContent({
            type: "structured",
            data: data.payload.content,
            metadata: data.payload.metadata || {},
          });
        } else {
          // If API returns raw content
          const textContent = await response.text();
          setFileContent({
            type: "text",
            data: textContent,
            metadata: { size: textContent.length },
          });
        }
      } else {
        // Fallback: try to fetch file directly
        const fileResponse = await fetch(`/uploads/${file.file_name}`);

        if (fileResponse.ok) {
          const contentType = fileResponse.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            const jsonContent = await fileResponse.json();
            setFileContent({
              type: "json",
              data: jsonContent,
              metadata: { contentType },
            });
          } else if (
            contentType &&
            (contentType.includes("text/") ||
              contentType.includes("application/vnd.ms-excel"))
          ) {
            const textContent = await fileResponse.text();

            // Check if it's CSV content
            if (
              file.original_name?.toLowerCase().includes(".csv") ||
              file.file_name?.toLowerCase().includes(".csv") ||
              textContent.includes(",")
            ) {
              setFileContent({
                type: "csv",
                data: parseCSV(textContent),
                rawData: textContent,
                metadata: { contentType, rows: textContent.split("\n").length },
              });
            } else {
              setFileContent({
                type: "text",
                data: textContent,
                metadata: { contentType, size: textContent.length },
              });
            }
          } else {
            // For binary files or unsupported formats
            setFileContent({
              type: "binary",
              data: null,
              metadata: {
                contentType,
                message:
                  "File ini tidak dapat ditampilkan sebagai teks. Silakan download untuk melihat isinya.",
              },
            });
          }
        } else {
          throw new Error("File tidak dapat diakses");
        }
      }

      setShowFileContentModal(true);
    } catch (error) {
      console.error("Error fetching file content:", error);
      setFileContentError(
        error.message || "Terjadi kesalahan saat membaca file"
      );
      setFileContent(null);
      setShowFileContentModal(true);
    }

    setFileContentLoading(false);
  };

  // Simple CSV parser
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split("\n");
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || "";
        return obj;
      }, {});
    });

    return { headers, rows: rows.slice(0, 100) }; // Limit to 100 rows for performance
  };

  useEffect(() => {
    fetchData();
    fetchDataFile();
    fetchAllFiles();
  }, []);

  useEffect(() => {
    fetchDataFilter();
  }, [selectedMonth, selectedYear]);

  const userLogin =
    typeof window !== "undefined" ? localStorage.getItem("users") : "";

  const chnageNumberToMonth = (number) => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return months[number - 1];
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/promo-product/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Transaksi berhasil dihapus");
        await fetchData();
        await fetchDataFile();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Gagal menghapus: ${errorData.message || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error("Error deleting produk:", error);
      alert("Terjadi kesalahan saat menghapus transaksi");
    }
    setIsLoading(false);
  };

  const findRelatedFiles = (promosiItem) => {
    if (!allFiles || allFiles.length === 0) {
      return [];
    }

    const relatedFiles = allFiles.filter((file) => {
      const productNameMatch =
        file.original_name &&
        file.original_name
          .toLowerCase()
          .includes(promosiItem.name.toLowerCase());

      let dateMatch = false;
      if (file.created_at && promosiItem.transaction_date) {
        const fileDate = new Date(file.created_at);
        const transactionDate = promosiItem.transaction_date;
        const [day, month, year] = transactionDate.split("-");
        const transDate = new Date(`${year}-${month}-${day}`);
        dateMatch = fileDate.toDateString() === transDate.toDateString();
      }

      const idMatch =
        file.file_name &&
        file.file_name.includes(promosiItem.promosi_id.toString());

      const categoryMatch =
        file.original_name &&
        promosiItem.category &&
        file.original_name
          .toLowerCase()
          .includes(promosiItem.category.toLowerCase());

      return productNameMatch || dateMatch || idMatch || categoryMatch;
    });

    return relatedFiles;
  };

  const handleViewTransaction = async (promosiItem) => {
    try {
      setIsLoading(true);
      const relatedFiles = findRelatedFiles(promosiItem);

      if (relatedFiles.length === 0) {
        setSelectedFile({
          promosiId: promosiItem.promosi_id,
          files: allFiles.slice(0, 10),
          productName: promosiItem.name,
          showAllFiles: true,
          message:
            "File terkait tidak ditemukan. Berikut adalah semua file yang tersedia:",
        });
        setShowModal(true);
      } else if (relatedFiles.length === 1) {
        const file = relatedFiles[0];
        const fileUrl = `/uploads/${file.file_name}`;
        window.open(fileUrl, "_blank");
      } else {
        setSelectedFile({
          promosiId: promosiItem.promosi_id,
          files: relatedFiles,
          productName: promosiItem.name,
          showAllFiles: false,
          message: `Ditemukan ${relatedFiles.length} file yang mungkin terkait:`,
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error viewing transaction:", error);
      alert("Terjadi kesalahan saat mencari file");
    }
    setIsLoading(false);
  };

  const openFileFromModal = (file) => {
    const fileUrl = `/uploads/${file.file_name}`;
    window.open(fileUrl, "_blank");
  };

  const downloadFile = async (file) => {
    try {
      const fileUrl = `/uploads/${file.file_name}`;
      const response = await fetch(fileUrl);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          file.original_name || file.file_name || `file_${Date.now()}`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Gagal mendownload file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Terjadi kesalahan saat mendownload file");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  const closeFileContentModal = () => {
    setShowFileContentModal(false);
    setFileContent(null);
    setCurrentViewingFile(null);
    setFileContentError(null);
  };

  // Render file content based on type
  const renderFileContent = () => {
    if (fileContentLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Memuat isi file...</span>
        </div>
      );
    }

    if (fileContentError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">❌ Error: {fileContentError}</p>
        </div>
      );
    }

    if (!fileContent) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-gray-600">Tidak ada konten untuk ditampilkan</p>
        </div>
      );
    }

    switch (fileContent.type) {
      case "csv":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-blue-800 text-sm">
                📊 File CSV dengan {fileContent.data.rows.length} baris data
                {fileContent.data.rows.length >= 100 &&
                  " (menampilkan 100 baris pertama)"}
              </p>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {fileContent.data.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-3 py-2 text-left font-medium text-gray-700 border-r"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fileContent.data.rows.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {fileContent.data.headers.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-3 py-2 text-gray-700 border-r max-w-xs overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "json":
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-800 text-sm">📄 File JSON</p>
            </div>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto max-h-96 text-sm">
              {JSON.stringify(fileContent.data, null, 2)}
            </pre>
          </div>
        );

      case "structured":
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
              <p className="text-purple-800 text-sm">📋 Data Terstruktur</p>
            </div>
            <div className="overflow-x-auto max-h-96">
              {Array.isArray(fileContent.data) ? (
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(fileContent.data[0] || {}).map(
                        (key, index) => (
                          <th
                            key={index}
                            className="px-3 py-2 text-left font-medium text-gray-700 border-r"
                          >
                            {key}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fileContent.data.slice(0, 50).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(item).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-3 py-2 text-gray-700 border-r max-w-xs overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                  {JSON.stringify(fileContent.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="text-gray-800 text-sm">
                📝 File Teks ({fileContent.metadata.size} karakter)
              </p>
            </div>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto max-h-96 text-sm whitespace-pre-wrap">
              {fileContent.data}
            </pre>
          </div>
        );

      case "binary":
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">📁 {fileContent.metadata.message}</p>
            <p className="text-sm text-gray-600 mt-2">
              Tipe file: {fileContent.metadata.contentType}
            </p>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <p className="text-gray-600">Format file tidak dikenali</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {userLogin === "Kasir" ? (
        <main className="flex flex-col gap-y-10 p-6">
          <UploadPage />

          <h1 className="text-2xl font-bold">Aktivitas Transaksi</h1>

          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-xl">
              <thead className="bg-gradient-to-r from-[#fae6ad] to-[#be0801] text-white">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    No
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Aktivitas Transaksi
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : dataProduk.length === 0 ? (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada data transaksi
                    </td>
                  </tr>
                ) : (
                  dataProduk.map((item, index) => (
                    <tr key={item.promosi_id}>
                      <td className="px-6 py-4 text-gray-700 text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-center">
                        <p>
                          Promosi untuk bulan{" "}
                          {item.transaction_date
                            ? chnageNumberToMonth(
                                parseInt(item.transaction_date.slice(12, 15))
                              )
                            : "Unknown"}{" "}
                          sudah diunggah
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-center">
                        <div className="flex gap-x-2 justify-center">
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleViewTransaction(item)}
                            disabled={isLoading}
                          >
                            Lihat Transaksi
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDelete(item.promosi_id)}
                            disabled={isLoading}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      ) : (
        <main className="flex flex-col gap-y-5 p-6">
          <h1 className="text-2xl font-bold">Data Transaksi</h1>

          <section className="flex gap-x-3 items-center">
            <select
              className="p-3 border border-black rounded-md"
              value={selectedMonth || ""}
              onChange={(e) =>
                setSelectedMonth(e.target.value ? Number(e.target.value) : null)
              }
              disabled={isLoading}
            >
              <option value="">Pilih Bulan</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {chnageNumberToMonth(i + 1)}
                </option>
              ))}
            </select>

            <select
              className="p-3 border border-black rounded-md"
              value={selectedYear || ""}
              onChange={(e) =>
                setSelectedYear(e.target.value ? Number(e.target.value) : null)
              }
              disabled={isLoading}
            >
              <option value="">Pilih Tahun</option>
              {Array.from({ length: 10 }, (_, i) => 2023 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {(selectedMonth || selectedYear) && (
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => {
                  setSelectedMonth(null);
                  setSelectedYear(null);
                }}
                disabled={isLoading}
              >
                Reset Filter
              </button>
            )}
          </section>

          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-xl">
              <thead className="bg-gradient-to-r from-[#fae6ad] to-[#be0801] text-white">
                <tr>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    No
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Nama Produk
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Harga Produk
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Kelas Menu
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : dataProduk.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {selectedMonth || selectedYear
                        ? "Tidak ada data untuk filter yang dipilih"
                        : "Tidak ada data transaksi"}
                    </td>
                  </tr>
                ) : (
                  dataProduk.map((item, index) => (
                    <tr key={item.promosi_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-700 text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-center">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-center">
                        {item.price?.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }) || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-center">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-center">
                        {item.menu_class}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-center">
                        {item.transaction_date}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-center">
                        <div className="flex gap-x-2 justify-center">
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleViewTransaction(item)}
                            disabled={isLoading}
                          >
                            Lihat Transaksi
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDelete(item.promosi_id)}
                            disabled={isLoading}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* Modal untuk menampilkan multiple files */}
      {showModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                File Transaksi: {selectedFile.productName}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                {selectedFile.message}
              </p>

              <div className="space-y-3">
                {selectedFile.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {file.original_name ||
                          file.file_name ||
                          `File ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.file_size &&
                          `${(file.file_size / 1024).toFixed(1)} KB • `}
                        {file.created_at &&
                          `Upload: ${new Date(
                            file.created_at
                          ).toLocaleDateString("id-ID")}`}
                        {file.status && ` • Status: ${file.status}`}
                      </p>
                      {file.total_records && (
                        <p className="text-xs text-blue-600">
                          Total Records: {file.total_records} | Cleaned:{" "}
                          {file.cleaned_records}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-x-2">
                      <button
                        className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
                        onClick={() => fetchFileContent(file)}
                      >
                        Lihat Isi
                      </button>
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        onClick={() => openFileFromModal(file)}
                      >
                        Buka
                      </button>
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        onClick={() => downloadFile(file)}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedFile.showAllFiles && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Tips:</strong> File mungkin tidak terkait
                    langsung dengan transaksi ini. Silakan pilih file yang
                    sesuai berdasarkan nama atau tanggal.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                onClick={closeModal}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal untuk menampilkan isi file */}
      {showFileContentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">
                  Isi File:{" "}
                  {currentViewingFile?.original_name ||
                    currentViewingFile?.file_name}
                </h3>
                {currentViewingFile && (
                  <p className="text-sm text-gray-500">
                    {currentViewingFile.file_size &&
                      `Ukuran: ${(currentViewingFile.file_size / 1024).toFixed(
                        1
                      )} KB • `}
                    {currentViewingFile.created_at &&
                      `Upload: ${new Date(
                        currentViewingFile.created_at
                      ).toLocaleDateString("id-ID")}`}
                  </p>
                )}
              </div>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeFileContentModal}
              >
                &times;
              </button>
            </div>

            <div className="p-4">{renderFileContent()}</div>

            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <div className="flex gap-x-2">
                {currentViewingFile && (
                  <>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => openFileFromModal(currentViewingFile)}
                    >
                      Buka di Tab Baru
                    </button>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() => downloadFile(currentViewingFile)}
                    >
                      Download File
                    </button>
                  </>
                )}
              </div>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                onClick={closeFileContentModal}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TampilDataTransaksi;
