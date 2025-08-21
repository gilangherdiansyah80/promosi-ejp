"use client";
import { useEffect, useState } from "react";
import Alert from "./alert";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", icon: "fa-gauge", label: "Dashboard" },
  {
    href: "#",
    icon: "fa-database",
    icon2: "fa-chevron-down",
    label: "Data Master",
    hasDropdown: true,
  },
  //   {
  //     href: "/dashboard/Penugasan",
  //     icon: "fa-filter",
  //     label: "Penugasan Tim",
  //     role: "Project Officer",
  //   },
  //   {
  //     href: "/visualization",
  //     icon: "fa-chart-line",
  //     label: "Visualization",
  //     role: "user",
  //   },
  //   { href: "/kmeans", icon: "fa-chart-line", label: "Kmeans", role: "user" },
  //   {
  //     href: "/dashboard/TugasSaya",
  //     icon: "fa-chart-line",
  //     label: "Tugas Saya",
  //     role: "Tim A Padaleunyi",
  //   },
  //   {
  //     href: "/dashboard/Pelaporan",
  //     icon: "fa-chart-line",
  //     label: "Pelaporan",
  //     role: "Admin",
  //   },
  //   {
  //     href: "/dashboard/RiwayatPelaporan",
  //     icon: "fa-chart-line",
  //     label: "Riwayat Pelaporan",
  //     role: "Admin",
  //   },
  //   {
  //     href: "/dashboard/RiwayatPelaporan",
  //     icon: "fa-chart-line",
  //     label: "Riwayat Pelaporan",
  //     role: "Direktur",
  //   },
  {
    href: "/dashboard/ProdukBundling",
    icon: "fa-box",
    label: "Product Bunddling",
    role: "Tim Marketing",
  },
  // {
  //   href: "/dashboard/DataMaster/Produk",
  //   icon: "fa-box",
  //   label: "Product",
  //   role: "Kasir",
  // },
  // {
  //   href: "/dashboard/DataMaster/Produk",
  //   icon: "fa-box",
  //   label: "Product",
  //   role: "Manager",
  // },
  // {
  //   href: "/dashboard/DataMaster/Produk",
  //   icon: "fa-box",
  //   label: "Product",
  //   role: "Tim Marketing",
  // },
  {
    href: "/dashboard/PersetujuanBundlingPage",
    icon: "fa-chart-line",
    label: "Request Bundling",
    role: "Manager",
  },
  {
    href: "/dashboard/DataMaster/Users",
    icon: "fa-users",
    label: "Users",
    role: "Manager",
  },
];

const subNavItems = [
  {
    href: "/dashboard/DataMaster/Transaksi",
    label: "Transaksi",
  },
  { href: "/dashboard/DataMaster/Produk", label: "Produk" },
  // { href: "/dashboard/DataMaster/JalurTol", label: "Jalur Tol", role: "Admin" },
  {
    href: "/dashboard/DataMaster/JalurTol",
    label: "Jalur Tol",
    role: "Direktur",
  },
  // {
  //   href: "/dashboard/ProductCostControl",
  //   label: "Penjualan",
  //   role: "Kasir",
  // },
  {
    href: "/dashboard/DataMaster/ListKeahlian",
    label: "List Keahlian",
    role: "Project Officer",
  },
];

const DashboardLayout = ({ title, children }) => {
  const [alertShow, setAlertShow] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("users");
    if (userData) {
      try {
        const parsedUser = userData.replace(/"/g, "");
        setUserRole(parsedUser || "");
      } catch (error) {
        console.error("Invalid user data in localStorage");
      }
    }
  }, []);

  const toggleDropdown = (label) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  const handleLogout = () => {
    setAlertMessage("Logout Berhasil");
    setAlertShow(true);
    localStorage.removeItem("users");

    setTimeout(() => {
      setAlertShow(false);
      window.location.href = "/";
    }, 2000);
  };

  return (
    <main className="bg-gray-200 flex w-full h-screen overflow-hidden p-3">
      {/* Sidebar */}
      <aside className="text-black bg-[#fae6ad] flex flex-col w-1/6 h-[922px] fixed rounded-xl justify-between">
        <section className="flex flex-col gap-y-10 overflow-y-auto">
          {/* Logo */}
          <div className="flex flex-col items-center mt-10">
            <div className="bg-black rounded-full flex justify-center items-center w-20 h-20">
              <img
                src="/images/logo-profile-1.png"
                alt="PT blackeace Karya Indonesia"
                className="rounded-full w-20 h-20"
              />
            </div>
            <h1 className="text-xl font-bold mt-3">EJpeace Coffe</h1>
            <hr className="bg-black w-72 h-1 rounded-full mt-10" />
          </div>

          {/* Navigation */}
          <nav>
            <ul className="flex flex-col gap-y-4">
              {navItems
                .filter((item) => !item.role || item.role === userRole)
                .map(({ href, icon, icon2, label, hasDropdown }) => (
                  <li key={label}>
                    <div
                      onClick={() =>
                        hasDropdown ? toggleDropdown(label) : null
                      }
                      className="flex items-center gap-x-4 px-6 text-black cursor-pointer"
                    >
                      <Link
                        href={href}
                        className="flex justify-between items-center w-full"
                      >
                        <section className="flex gap-x-3">
                          <i className={`fa-solid ${icon} text-2xl`}></i>
                          <span>{label}</span>
                        </section>
                        {hasDropdown && (
                          <i
                            className={`fa-solid ${
                              activeMenu === label
                                ? "fa-chevron-up"
                                : "fa-chevron-down"
                            } text-xs`}
                          ></i>
                        )}
                      </Link>
                    </div>

                    {hasDropdown && activeMenu === label && (
                      <ul className="pl-12 mt-2 flex flex-col gap-y-3 bg-[#be0801] p-3">
                        {subNavItems
                          .filter((sub) => !sub.role || sub.role === userRole)
                          .map((sub) => (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className="flex items-center gap-x-2 text-white cursor-pointer"
                              >
                                <span>{sub.label}</span>
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ul>
          </nav>
        </section>

        {/* User & Logout */}
        <div className="flex flex-col items-center bg-[#be0801] py-8 gap-y-6">
          <div className="flex items-center gap-x-3 cursor-pointer">
            <div className="border-2 border-white rounded-full w-12 h-12 flex justify-center items-center">
              <i className="fas fa-user text-white text-2xl"></i>
            </div>
            <h1 className="text-xl font-bold text-white capitalize">
              {userRole}
            </h1>
          </div>

          <div
            onClick={handleLogout}
            className="flex items-center gap-x-3 cursor-pointer"
          >
            <i className="fa-solid fa-right-from-bracket text-white text-2xl"></i>
            <h1 className="text-xl font-bold text-white">Logout</h1>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-[17.5%] w-5/6 h-full flex flex-col">
        <header className="flex justify-between items-center shadow p-4 bg-gradient-to-r from-[#fae6ad] to-[#be0801] rounded-t-xl">
          <h1 className="text-xl md:text-2xl text-black font-bold">
            Dashboard Promosi EJPeace
          </h1>
        </header>

        <section className="p-4 bg-white w-full overflow-y-auto flex-1">
          {children}
        </section>
      </div>

      {/* Alert */}
      {alertShow && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30">
          <Alert message={alertMessage} />
        </div>
      )}
    </main>
  );
};

export default DashboardLayout;
