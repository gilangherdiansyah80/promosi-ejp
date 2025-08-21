"use client";
import DashboardLayout from "../../components/Dashboardlayout";
import { useState, useEffect } from "react";
export const dynamic = "force-dynamic";

const Home = () => {
  const [dataProduk, setDataProduk] = useState([]);
  const [dataTransaksi, setDataTransaksi] = useState([]);

  useEffect(() => {
    fetch("https://ejpeacecoffee.online/api/produk")
      .then((response) => response.json())
      .then((data) => setDataProduk(data.payload.datas));
  }, []);

  useEffect(() => {
    fetch("https://ejpeacecoffee.online/api/promo-product")
      .then((response) => response.json())
      .then((data) => setDataTransaksi(data.payload.datas));
  }, []);

  return (
    <DashboardLayout>
      <main className="flex flex-col gap-y-3">
        <ul className="flex gap-x-3 w-full">
          <li className="bg-[#f6df3c] p-3 rounded-lg text-black w-1/2 flex gap-y-3 items-center justify-between">
            <i className="fa-solid fa-box text-4xl"></i>
            <section className="flex flex-col gap-y-1 items-center">
              <h1>Total Products</h1>
              <h2>{dataProduk.length}</h2>
            </section>
          </li>
          <li className="bg-[#f6df3c] p-3 rounded-lg text-black w-1/2 flex gap-y-3 items-center justify-between">
            <i className="fa-solid fa-cart-shopping text-4xl"></i>
            <section className="flex flex-col gap-y-1 items-center">
              <h1>Total Transaksi</h1>
              <h2>{dataTransaksi.length}</h2>
            </section>
          </li>
        </ul>

        <section className="flex flex-col gap-y-3 items-center justify-center border border-[#211C84] rounded-xl p-3">
          <div className="flex justify-center bg-black rounded-full w-96 h-96">
            <img
              src="/images/EJP-Creative.png"
              alt="PT.Inticore Nusa Persada"
              className="w-96"
            />
          </div>
          <h1 className="text-2xl">
            Selamat Datang Di Dashboard EJPeace Coffee
          </h1>
        </section>
      </main>
    </DashboardLayout>
  );
};

export default Home;
