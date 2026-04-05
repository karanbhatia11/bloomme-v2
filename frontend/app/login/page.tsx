"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with email:", email);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Login error response:", errorData);
        throw new Error(errorData.message || errorData.error || "Invalid credentials");
      }

      const data = await response.json();
      console.log("Login successful, storing token and user data");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Redirecting to:", redirect || "/dashboard");
      router.push(redirect || "/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      console.error("Login error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="flex items-start justify-center px-6 pt-32 relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-container-low">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] z-10"
        >
          {/* Login Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-lg border border-surface-container">
            <header className="mb-8">
              <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
                Welcome Back
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Sign in to your account
              </p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  className="block font-label font-semibold text-sm text-on-surface-variant"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="bg-surface-container-low rounded-lg transition-all focus-within:bg-surface-container-highest group">
                  <input
                    className="w-full bg-transparent px-4 py-3 text-on-surface placeholder:text-outline-variant focus:outline-none border-none text-sm"
                    id="email"
                    placeholder="name@atelier.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="h-[2px] w-0 group-focus-within:w-full bg-primary transition-all duration-300"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="font-label font-semibold text-sm text-on-surface-variant"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs font-semibold text-primary-container hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="bg-surface-container-low rounded-lg transition-all focus-within:bg-surface-container-highest group">
                  <div className="flex items-center">
                    <input
                      className="flex-1 bg-transparent px-4 py-3 text-on-surface placeholder:text-outline-variant focus:outline-none border-none text-sm"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  <div className="h-[2px] w-0 group-focus-within:w-full bg-primary transition-all duration-300"></div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-3">
                <input
                  className="w-5 h-5 rounded border-none bg-surface-container-high text-primary focus:ring-primary/20 cursor-pointer"
                  id="remember"
                  type="checkbox"
                />
                <label
                  className="text-sm text-on-surface-variant font-medium cursor-pointer"
                  htmlFor="remember"
                >
                  Remember me
                </label>
              </div>

              {/* CTA */}
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-4 rounded-lg font-headline font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
                onClick={(e) => {
                  console.log("Button clicked");
                  if (!email || !password) {
                    e.preventDefault();
                    setError("Please enter email and password");
                    return;
                  }
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-primary hover:underline underline-offset-4"
                >
                  Join Now
                </Link>
              </p>
            </div>
          </div>

        </motion.div>
      </main>
      <Footer />
    </>
  );
}
