"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/Dashboardlayout";

const ProductBundling = () => {
  const [dataProduk, setDataProduk] = useState([]);
  const [showPilihProduk, setShowPilihProduk] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [hargaBundling, setHargaBundling] = useState("");

  // Ambil data produk dari API promosi
  useEffect(() => {
    fetch("/api/promo-product")
      .then((response) => response.json())
      .then((data) => setDataProduk(data.payload.datas))
      .catch((err) => console.error("Error fetching produk:", err));
  }, []);

  // Toggle modal pilih produk
  const handleShowChoose = () => {
    setShowPilihProduk(!showPilihProduk);
  };

  // Cek & toggle checkbox produk
  const handleCheckboxChange = (product) => {
    const isSelected = selectedProducts.some(
      (item) => item.promosi_id === product.promosi_id
    );

    if (isSelected) {
      setSelectedProducts((prev) =>
        prev.filter((item) => item.promosi_id !== product.promosi_id)
      );
    } else {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  // Reset produk & harga bundling
  const handleResetProduk = () => {
    setSelectedProducts([]);
    setHargaBundling("");
    setShowPilihProduk(false);
  };

  // Buat bundling produk ke API
  const handleCreateBundling = async () => {
    if (selectedProducts.length === 0) {
      alert("Pilih minimal 1 produk untuk bundling.");
      return;
    }

    const bodyData = {
      products: selectedProducts.map((p) => ({
        promosi_id: p.promosi_id,
      })),
    };

    if (hargaBundling && parseInt(hargaBundling) > 0) {
      bodyData.new_price = parseInt(hargaBundling);
    }

    try {
      const res = await fetch("/api/product-bundling/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan bundling.");
      }

      alert("Bundling berhasil dibuat!");
      handleResetProduk();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <main className="flex flex-col gap-y-6 p-6">
        <article className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bundling Produk</h1>
          <button
            className="bg-yellow-400 p-3 rounded-lg text-black cursor-pointer"
            onClick={handleShowChoose}
          >
            {showPilihProduk ? "Batal Pilih Produk" : "Pilih Produk"}
          </button>
        </article>

        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-xl">
            <thead className="bg-gradient-to-r from-[#f6df3c] to-[#74690f] text-white">
              <tr>
                {showPilihProduk && (
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Pilih
                  </th>
                )}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataProduk.map((item, index) => {
                const isChecked = selectedProducts.some(
                  (selected) => selected.promosi_id === item.promosi_id
                );
                return (
                  <tr key={item.promosi_id}>
                    {showPilihProduk && (
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(item)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">{index + 1}</td>
                    <td className="px-6 py-4 text-center">{item.name}</td>
                    <td className="px-6 py-4 text-center">
                      {item.price.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">{item.category}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedProducts.length > 0 && (
          <section className="flex flex-col gap-y-4 mt-6">
            <h2 className="text-lg font-semibold">Produk Dipilih:</h2>
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
                      Harga
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">
                      Kategori
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedProducts.map((product, index) => (
                    <tr key={product.promosi_id}>
                      <td className="px-6 py-4 text-center">{index + 1}</td>
                      <td className="px-6 py-4 text-center">{product.name}</td>
                      <td className="px-6 py-4 text-center">
                        {product.price.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4">
                <label className="block mb-2 font-medium">
                  Harga Bundling (Opsional)
                </label>
                <input
                  type="number"
                  value={hargaBundling}
                  onChange={(e) => setHargaBundling(e.target.value)}
                  placeholder="Masukkan harga bundling"
                  className="w-full border border-black rounded-lg p-3"
                />
              </div>
            </div>

            <div className="w-full flex gap-x-4">
              <button
                className="bg-gray-300 p-3 rounded-lg text-black w-1/2 cursor-pointer"
                onClick={handleResetProduk}
              >
                Reset Produk
              </button>
              <button
                className="bg-yellow-400 p-3 rounded-lg text-black w-1/2 cursor-pointer"
                onClick={handleCreateBundling}
              >
                Buat Bundling Produk
              </button>
            </div>
          </section>
        )}
      </main>
    </DashboardLayout>
  );
};

export default ProductBundling;
