"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const qName = searchParams.get("name");
    const qEmail = searchParams.get("email");
    const qPhone = searchParams.get("phone");
    if (qName) setName(qName);
    if (qEmail) setEmail(qEmail);
    if (qPhone) setPhone(qPhone);
  }, [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!termsAccepted) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
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

      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface via-surface to-surface-container-low">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 shadow-lg border border-surface-container text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-primary">mark_email_read</span>
            </div>
            <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">Check your inbox</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              We&apos;ve sent a verification link to <strong className="text-on-surface">{email}</strong>. Click it to activate your account and get started.
            </p>
            <p className="text-xs text-on-surface-variant mb-6">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">sign in</Link>.
            </p>
            {searchParams.get("redirect") && (
              <button
                onClick={() => router.push(searchParams.get("redirect")!)}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Continue to checkout →
              </button>
            )}
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

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
                  <div className="relative">
                    <input
                      className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 pr-12 transition-all placeholder:text-on-surface-variant/50"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
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
                  <div className="relative">
                    <input
                      className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg px-4 py-3 pr-12 transition-all placeholder:text-on-surface-variant/50"
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-xl">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    className="mt-1 rounded text-primary focus:ring-primary-container border-outline-variant bg-surface-container-low cursor-pointer"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
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

          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  );
}
