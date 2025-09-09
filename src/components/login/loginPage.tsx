"use client";

import { FaEnvelope, FaLock } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/api/auth";
import Cookies from "js-cookie";
import { useAuth } from "@/providers/AuthContext";
import { decodeToken } from "@/utils/jwt";
// import { apiPost } from "@/lib/services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setUser } = useAuth(); // 👈 grab setUser from context

  const handleLogin = async () => {
    try {
      // Login request via apiPost
      const response = await login({ email, password });
      const { data } = response;

      // Store token in cookies (non-HTTP-only, accessible in JS)
      Cookies.set("token", data.accessToken, { path: "/" });

      // Decode token to get user info
      const payload = decodeToken(data.accessToken);
      if (!payload) throw new Error("Invalid token");
      const { id, name, role } = payload;

      // Save in localStorage
      localStorage.setItem("user", JSON.stringify({ id, name, role }));

      // Save in context
      setUser({ id, name, role });

      // Redirect
      if (role === "BANK_USER") router.push("/client/dashboard");
      else if (role === "MANAGER") router.push("/manager/dashboard");
      else router.push("/unauthorized");

    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error");
    }
  };

  return (
    <main className="h-screen flex flex-row bg-white">
      {/* Left Side */}
      <div className="hidden md:flex flex-col justify-center h-full w-full bg-gradient-to-b from-blue-500 to-blue-700 text-white">
        <div className="flex flex-col justify-start pl-32">
          <h1 className="font-bold text-5xl">EXPERTIC</h1>
          <p>Disponibilité garantie, intervention assurée.</p>
          <button
            type="submit"
            className="cursor-pointer max-w-52 mt-2 bg-[#0575E6] hover:bg-[#0568c6] text-white py-3 rounded-full font-semibold transition"
          >
            En savoir plus
          </button>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col lg:p-32 justify-center lg:w-1/2">
        <div className="flex w-full justify-center items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="rounded-xl w-96 space-y-5 p-8"
          >
            <div className="flex flex-col justify-center bg-white">
              <h1 className="text-2xl font-bold">Bonjour à nouveau !</h1>
              <p>Heureux de vous retrouver</p>
            </div>

            {error && <p className="text-red-500 text-center text-sm">{error}</p>}

            {/* Email Field */}
            <div className="flex items-center border rounded-full px-4">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 outline-none text-black rounded-full"
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex items-center border rounded-full px-4">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 outline-none text-black rounded-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400"
              >
                {showPassword ? <HiEyeOff /> : <HiEye />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full cursor-pointer bg-[#0575E6] hover:bg-[#0568c6] text-white p-4 rounded-full font-semibold transition"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
