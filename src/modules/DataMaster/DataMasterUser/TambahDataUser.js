"use client";
import { useState, useCallback } from "react";
import DashboardLayout from "../../../components/Dashboardlayout";
import Link from "next/link";

const TambahDataUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Menggunakan `name` daripada `id`
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Membuat objek FormData
      const form = new FormData();
      form.append("username", formData.username);
      form.append("password", formData.password);
      form.append("role", formData.role);

      // Mengirim permintaan ke server
      const response = await fetch("/api/users/create", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      const data = await response.json();
      console.log("Berhasil tambah user:", data);

      setFormData({ username: "", password: "", role: "" });
      alert("Berhasil tambah user!");
      window.location.href = "/dashboard/DataMaster/Users";
    } catch (error) {
      alert("Harap isi semua inputan terlebih dahulu!");
      console.error("Error adding users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <main className="flex flex-col gap-y-5">
        <h1 className="text-2xl font-bold text-yellow-400">Add Users</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form className="flex flex-col gap-y-3" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username" // Menggunakan username untuk referensi state
            value={formData.username} // Menghubungkan dengan state
            onChange={handleChange} // Memastikan handleChange menangani perubahan
            placeholder="Input Username"
            className="border border-[#211C84] rounded-lg p-3"
          />
          <input
            type="text"
            name="password" // Menggunakan password untuk referensi state
            value={formData.password} // Menghubungkan dengan state
            onChange={handleChange} // Memastikan handleChange menangani perubahan
            placeholder="Input Password"
            className="border border-[#211C84] rounded-lg p-3"
          />
          <select
            name="role" // Menggunakan role untuk referensi state
            value={formData.role} // Menghubungkan dengan state
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
              className={`bg-green-500 p-3 text-white rounded-lg w-1/2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </section>
        </form>
      </main>
    </DashboardLayout>
  );
};

export default TambahDataUser;
