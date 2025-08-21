"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "../../../components/Dashboardlayout";
import Link from "next/link";

const TampilDataUser = () => {
  const [dataUsers, setDataUsers] = useState([]);

  const fetchData = async () => {
    const response = await fetch("/api/users");
    const data = await response.json();
    setDataUsers(data.payload.datas);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/users/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("User Berhasil Dihapus");
        fetchData();
      } else {
        console.error("Failed to delete user:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <DashboardLayout>
      <main className="flex flex-col gap-y-10">
        <section className="flex justify-between items-center">
          <button className="flex justify-center items-center bg-[#be0801] text-white rounded-md p-3">
            <Link
              href="/dashboard/DataMaster/Users/TambahUser"
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
                  Username
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold">
                  Password
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataUsers.map((item, index) => (
                <tr key={item.user_id}>
                  <td className="px-6 py-4 text-gray-500 text-center">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-center">
                    {item.username}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium text-center">
                    {item.password}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium text-center">
                    {item.role}
                  </td>
                  <td className="px-6 py-4 flex gap-x-3 w-full">
                    <Link
                      href={`/dashboard/DataMaster/Users/UbahUser/${item.id_user}`}
                      className="w-1/2 bg-green-500 text-white px-4 py-2 rounded-md text-center"
                    >
                      <button>Edit User</button>
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id_user)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md w-1/2"
                    >
                      Hapus User
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

export default TampilDataUser;
