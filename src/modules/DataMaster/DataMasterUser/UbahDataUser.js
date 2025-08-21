"use client";

import DashboardLayout from "../../../components/Dashboardlayout";
import Link from "next/link";
import { useState, useEffect } from "react";

const UbahDataUser = ({ params }) => {
  const [users, setUsers] = useState({
    username: "",
    password: "",
    role: "",
  });
  const { id } = params;

  // Fungsi untuk mendapatkan data produk
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();

      if (response.ok) {
        setUsers({
          username: data.payload.datas.username || "",
          password: data.payload.datas.password || "",
          role: data.payload.datas.role || "",
        });
      } else {
        console.error("Failed to fetch user:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Fungsi untuk menangani perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsers((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Fungsi untuk submit data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(users),
      });

      const result = await response.json();
      if (response.ok) {
        alert("User updated successfully!");
        // Redirect user to product management page
        window.location.href = "/dashboard/DataMaster/Users";
      } else {
        alert("Harap isi semua inputan!");
      }
    } catch (error) {
      alert("Harap isi semua inputan!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <main className="flex flex-col gap-y-5">
        <h1 className="text-2xl font-bold text-yellow-400">Edit Users</h1>
        <form className="flex flex-col gap-y-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Input Username Product"
            name="username"
            value={users.username}
            onChange={handleChange}
            className="border border-[#211C84] rounded-lg p-3"
          />
          <input
            type="text"
            placeholder="Input Password"
            name="password"
            value={users.password}
            onChange={handleChange}
            className="border border-[#211C84] rounded-lg p-3"
          />
          <select
            name="role" // Menggunakan role untuk referensi state
            value={users.role} // Menghubungkan dengan state
            onChange={handleChange} // Memastikan handleChange menangani perubahan
            className="border border-[#211C84] rounded-lg p-3"
          >
            <option value="">Select Role</option>
            <option value="Manager">Manager</option>
            <option value="Tim Marketing">Tim Marketing</option>
            <option value="Kasir">Kasir</option>
          </select>
          <section className="w-full flex gap-x-3">
            <Link
              href="/dashboard/DataMaster/Users"
              className="bg-red-500 p-3 text-white rounded-lg w-1/2 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-green-500 p-3 text-white rounded-lg w-1/2"
            >
              Submit
            </button>
          </section>
        </form>
      </main>
    </DashboardLayout>
  );
};

export default UbahDataUser;
