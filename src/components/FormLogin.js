"use client";
import { useState, useEffect } from "react";
import Alert from "./alert";

const FormLogin = () => {
  const [dataForm, setDataForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    setDataForm({
      ...dataForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://ejpeacecoffee.online/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataForm),
        }
      );

      const data = await response.json();

      console.log(data.payload?.datas.user);

      if (data.payload?.datas) {
        localStorage.setItem("users", data.payload.datas.user.role);
        setAlertMessage("Login Berhasil");
        setShowAlert(true);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        setAlertMessage("Login Gagal: " + result.message);
        setShowAlert(true);

        setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage("Harap isi username dan password terlebih dahulu!");
      setShowAlert(true);

      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    } finally {
      setLoading(false);
      setDataForm({
        username: "",
        password: "",
      });
    }
  };

  const handleShowPassword = () => {
    const passwordInput = document.getElementById("password");
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  };

  return (
    <main className="relative w-full h-screen flex items-center justify-center bg-gradient-to-r from-[#fae6ad] to-[#be0801]">
      {showAlert && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30">
          <Alert message={alertMessage} />
        </div>
      )}

      <section
        className={`flex flex-col gap-y-3 w-1/2 transition-all duration-300 ${
          showAlert ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <div className="flex justify-center items-center bg-black w-52 h-52 rounded-full self-center">
          <img
            src="/images/logo-profile-1.png"
            alt="PT.EJPeace Karya Indonesia"
            className="w-52 rounded-full"
          />
        </div>
        <h1 className="text-center text-2xl">
          Selamat datang di sistem penentuan promosi Ejpeace Coffe
        </h1>
        <form
          className="flex flex-col gap-y-3 border border-gray-400 p-3 rounded-xl w-full bg-white shadow-lg"
          onSubmit={handleLogin}
        >
          <section className="flex flex-col gap-y-3">
            <label>Username</label>
            <input
              type="text"
              placeholder="Input Username"
              id="username"
              name="username"
              value={dataForm.username}
              onChange={handleChange}
              className="p-3 rounded-xl border border-gray-400"
            />
          </section>

          <section className="flex flex-col gap-y-3">
            <label>Password</label>
            <div className="w-full relative">
              <input
                type="password"
                placeholder="*****"
                id="password"
                name="password"
                value={dataForm.password}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-400 w-full"
              />
              <i
                className="fa-solid fa-eye absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={handleShowPassword}
              ></i>
            </div>
          </section>

          <button
            type="submit"
            className="p-3 bg-[#f6df3c] text-black rounded-xl cursor-pointer"
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default FormLogin;
