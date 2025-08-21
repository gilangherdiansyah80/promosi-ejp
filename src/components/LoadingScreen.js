"use client";
import { useEffect, useState } from "react";

const LoadingScreen = ({ loading }) => {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-[#211C84]">
      <img src="/images/logo1.png" alt="OutPay" />
      {{ loading } && <p className="text-white">Loading...</p>}
    </main>
  );
};

export default LoadingScreen;
