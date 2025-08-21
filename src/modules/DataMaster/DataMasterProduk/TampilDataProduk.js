"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "../../../components/Dashboardlayout";
import Link from "next/link";

const TampilDataProduk = () => {
  const [dataProduk, setDataProduk] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [dataBundling, setDataBundling] = useState([]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (file) {
      const ext = file.name.toLowerCase().split(".").pop();

      if (ext !== "csv") {
        setError("Harap pilih file dengan format CSV");
        e.target.value = "";
        return;
      }

      if (file.size > 12 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 12MB");
        e.target.value = "";
        return;
      }
    }

    setSelectedFile(file);
    setMsg("");
    setError(null);
    setUploadResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Silakan pilih file CSV terlebih dahulu");
      return;
    }

    setLoading(true);
    setError(null);
    setMsg("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/produk/create", {
        method: "POST",
        body: formData,
      });

      const responseJson = await response.json();

      if (!response.ok) {
        setError(responseJson.message || "Gagal mengimpor data CSV");
        console.error("Error detail:", responseJson);
      } else {
        setMsg(responseJson.message || "Upload berhasil");
        setTimeout(() => {
          window.location.href = "/dashboard/DataMaster/Produk";
        }, 3000);
      }
    } catch (error) {
      setError("Harap isi inputkan file CSV!");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Template CSV download function (optional)
  const downloadTemplate = () => {
    const csvContent =
      "nama_produk,harga,kategori,kalsifikasi_kategori\nTeh Hijau,12000,Teh,Premium\nTeh Hitam,15000,Teh,Standar";
    const blob = new Blob([csvContent], {
      type: "text/csv",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_produk.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async (id) => {
    const response = await fetch("/api/produk");
    const data = await response.json();
    setDataProduk(data.payload.datas);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/produk/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Produk Berhasil Dihapus");
        fetchData();
      } else {
        console.error("Failed to delete produk:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting produk:", error);
    }
  };

  const userLogin = localStorage.getItem("users");

  const fetchProductBundling = async () => {
    try {
      const response = await fetch("/api/product-bundling");
      const data = await response.json();
      setDataBundling(data.payload.datas);
    } catch (error) {
      console.error("Error fetching product bundling:", error);
    }
  };

  useEffect(() => {
    fetchProductBundling();
  }, []);

  const filteredBundling = dataBundling.filter(
    (item) => item.status === "Disetujui"
  );

  return (
    <DashboardLayout>
      <main className="flex flex-col gap-y-5">
        <div>
          <h1 className="text-2xl font-bold text-black">Tambah Data Produk</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {msg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {msg}
            </div>
          )}

          <div
            className={`bg-white shadow-md rounded-lg p-3 ${
              userLogin === "Tim Marketing" ? "block" : "hidden"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              enctype="multipart/form-data"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih File CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Format yang didukung: CSV (maksimal 12MB)
                </p>
                {selectedFile && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p className="text-gray-700">
                      <strong>File terpilih:</strong> {selectedFile.name}
                    </p>
                    <p className="text-gray-600">
                      <strong>Ukuran:</strong>{" "}
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className={`flex-1 bg-green-500 hover:bg-green-600 p-3 text-white rounded-lg transition-colors font-medium ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading || !selectedFile}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Mengupload...
                    </span>
                  ) : (
                    "Upload Produk"
                  )}
                </button>

                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="bg-blue-500 hover:bg-blue-600 p-3 text-white rounded-lg transition-colors font-medium"
                >
                  Download Template
                </button>
              </div>
            </form>
          </div>
        </div>

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
                  Kategori Produk
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold">
                  Kelas Menu
                </th>
                <th
                  className={`px-6 py-3 text-center text-sm font-semibold ${
                    userLogin === "Tim Marketing" ? "block" : "hidden"
                  }`}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataProduk.map((item, index) => (
                <tr key={item.id_produk}>
                  <td className="px-6 py-4 text-gray-700 text-center">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-center">
                    {item.nama_produk}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-center">
                    {item.harga.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-center">
                    {item.kategori}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-center">
                    {item.menu_class}
                  </td>
                  <td
                    className={`px-6 py-4 flex gap-x-3 w-full justify-center ${
                      userLogin === "Tim Marketing" ? "block" : "hidden"
                    }`}
                  >
                    <button
                      onClick={() => handleDelete(item.id_produk)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md w-1/2"
                    >
                      Hapus Produk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="flex flex-col gap-y-3">
          <h2 className="text-2xl font-bold">Data Produk Bundling</h2>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-xl">
              <thead className="bg-gradient-to-r from-[#f6df3c] to-[#74690f] text-white">
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
                    Kategori Produk
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Kelas Menu
                  </th>
                  <th
                    className={`px-6 py-3 text-center text-sm font-semibold ${
                      userLogin === "Tim Marketing" ? "block" : "hidden"
                    }`}
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBundling.map((item, index) => (
                  <tr key={item.bundling_id}>
                    <td className="px-6 py-4 text-gray-700 text-center">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-center">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-center">
                      {item.price.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-center">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-center">
                      {item.menu_class}
                    </td>
                    <td
                      className={`px-6 py-4 flex gap-x-3 w-full justify-center ${
                        userLogin === "Tim Marketing" ? "block" : "hidden"
                      }`}
                    >
                      <button
                        onClick={() => handleDelete(item.bundling_id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md w-1/2"
                      >
                        Hapus Produk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
};

export default TampilDataProduk;
