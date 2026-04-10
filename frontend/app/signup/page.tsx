"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
            referred_by_code: referralCode || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-gradient-to-br from-surface via-surface to-surface-container-low pb-6">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-xl sm:rounded-2xl shadow-lg bg-surface-container-lowest mt-20 sm:mt-24">
          {/* Left Side: Signup Form */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center"
          >
            <div className="mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-headline tracking-tight text-on-surface mb-2">
                Sign Up for Daily Puja Flower Delivery
              </h1>
              <p className="font-accent italic text-lg text-primary opacity-80">
                Get fresh flowers delivered daily
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-error-container text-error rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Full Name
                </label>
                <input
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 transition-all placeholder:text-on-surface-variant/50"
                  placeholder="Jane Doe"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Contact Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant">
                    Email
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 transition-all placeholder:text-on-surface-variant/50"
                    placeholder="jane@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant">
                    Phone
                  </label>
                  <div className="flex items-center bg-surface-container-low rounded-lg px-4 py-3 border-0 border-b-2 border-transparent focus-within:border-primary transition-all">
                    <span className="text-on-surface-variant font-medium mr-2 text-sm">
                      +91
                    </span>
                    <input
                      className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm placeholder:text-on-surface-variant/50"
                      placeholder="98765 43210"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Referral Code Field (Optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Referral Code <span className="text-on-surface-variant/60">(optional)</span>
                </label>
                <input
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 transition-all placeholder:text-on-surface-variant/50 uppercase"
                  placeholder="Enter a friend's referral code"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  disabled={loading}
                />
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant">
                    Password
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 transition-all placeholder:text-on-surface-variant/50"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={loading}
                  />
                  {/* Strength Bar */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-surface-container-high">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-full w-1/4 transition-colors ${
                            i < passwordStrength
                              ? "bg-primary"
                              : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
                      <span>
                        Strength:{" "}
                        <span
                          className={`font-black ${
                            passwordStrength <= 1
                              ? "text-error"
                              : passwordStrength === 2
                              ? "text-tertiary"
                              : "text-primary"
                          }`}
                        >
                          {passwordStrength === 0
                            ? "Weak"
                            : passwordStrength === 1
                            ? "Fair"
                            : passwordStrength === 2
                            ? "Good"
                            : "Strong"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant">
                    Confirm Password
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 transition-all placeholder:text-on-surface-variant/50"
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    className="mt-1 rounded text-primary focus:ring-primary-container border-outline-variant bg-surface-container-low cursor-pointer"
                    type="checkbox"
                  />
                  <span className="text-sm text-on-surface-variant leading-tight">
                    I agree to the{" "}
                    <Link href="#" className="text-primary font-semibold hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-primary font-semibold hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    className="mt-1 rounded text-primary focus:ring-primary-container border-outline-variant bg-surface-container-low cursor-pointer"
                    type="checkbox"
                    defaultChecked
                  />
                  <span className="text-sm text-on-surface-variant leading-tight">
                    Subscribe to our newsletter for floral care tips and exclusive offers.
                  </span>
                </label>
              </div>

              {/* CTA Button */}
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-4 px-8 rounded-lg font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

            </form>

            {/* Sign In Link */}
            <p className="text-center text-sm text-on-surface-variant mt-8">
              Already a member?{" "}
              <Link
                href="/login"
                className="font-bold text-primary hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </motion.section>

          {/* Right Side: Benefits & Testimonial */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:flex flex-col justify-between bg-surface-container-low p-16 relative overflow-hidden"
          >
            <div>
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-8">
                Why choose Bloomme?
              </h2>
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="bg-surface-container-highest p-3 rounded-xl text-primary flex-shrink-0">
                    <span className="material-symbols-outlined">eco</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">
                      Fresh flowers every morning
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Hand-picked stems from sustainable growers, delivered to your door while the dew is still fresh.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-surface-container-highest p-3 rounded-xl text-primary flex-shrink-0">
                    <span className="material-symbols-outlined">
                      event_busy
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">
                      Pause or skip anytime
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Going on vacation? Life happened? Easily skip deliveries or pause your subscription with one tap.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-surface-container-highest p-3 rounded-xl text-primary flex-shrink-0">
                    <span className="material-symbols-outlined">
                      verified_user
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">
                      30-day money-back guarantee
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      If our blooms don&apos;t brighten your space as promised, we&apos;ll make it right or refund your first month.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-surface-container-highest p-3 rounded-xl text-primary flex-shrink-0">
                    <span className="material-symbols-outlined">
                      support_agent
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">
                      24/7 customer support
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Our master florists and support team are always available to help with arrangements or account needs.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Testimonial */}
            <div className="mt-16 p-8 bg-surface-container-highest rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-xl font-bold">
                  AV
                </div>
                <div>
                  <p className="font-bold text-on-surface leading-none">
                    Amara Varma
                  </p>
                  <p className="text-xs text-primary font-semibold tracking-wide uppercase mt-1">
                    Premium Member
                  </p>
                </div>
              </div>
              <p className="font-accent italic text-lg text-on-surface leading-relaxed">
                &ldquo;Waking up to a fresh bouquet every Monday has completely transformed my home&apos;s energy. Bloomme is more than a service, it&apos;s a weekly ritual of joy.&rdquo;
              </p>
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  );
}
