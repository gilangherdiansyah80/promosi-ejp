"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "../../components/Dashboardlayout";
import Link from "next/link";

const PersetujuanBundlingSection = () => {
  const [dataProduk, setDataProduk] = useState([]);

  const fetchData = async () => {
    const response = await fetch("/api/product-bundling");
    const data = await response.json();
    setDataProduk(data.payload.datas);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const userLogin =
    typeof window !== "undefined" ? localStorage.getItem("users") : "";

  // ✅ Fungsi update status
  const handleUpdateStatus = async (bundling_id, newStatus) => {
    try {
      // 1️⃣ Update status bundling
      const res = await fetch("/api/product-bundling/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bundling_id, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Gagal memperbarui status");
      }

      // // 2️⃣ Jika disetujui, masukkan ke produk
      // if (newStatus === "Disetujui") {
      //     "/api/produk/update",
      //     {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({ bundling_id }),
      //     }
      //   );

      //   if (!approveRes.ok) {
      //     throw new Error("Gagal memasukkan bundling ke produk");
      //   }
      // }

      alert(`Status berhasil diubah ke ${newStatus}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <main className="flex flex-col gap-y-10">
        <section
          className={`flex justify-between items-center ${
            userLogin === "Tim Marketing" ? "block" : "hidden"
          }`}
        >
          <button className="flex justify-center items-center bg-black text-white rounded-md p-3">
            <Link
              href="/dashboard/DataMaster/Produk/TambahProduk"
              className="flex gap-x-3 items-center"
            >
              <i className="fas fa-add"></i>
              <h1>Tambah Data</h1>
            </Link>
          </button>
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
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataProduk.map((item, index) => (
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
                    {item.status}
                  </td>
                  <td className="px-6 py-4 flex gap-x-3 w-full justify-center">
                    <button
                      onClick={() =>
                        handleUpdateStatus(item.bundling_id, "Ditolak")
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-md w-1/2"
                    >
                      Tolak Bundling
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(item.bundling_id, "Disetujui")
                      }
                      className="bg-green-500 text-white px-4 py-2 rounded-md w-1/2"
                    >
                      Setujui Bundling
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default PersetujuanBundlingSection;
