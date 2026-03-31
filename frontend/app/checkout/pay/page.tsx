"use client";
import Link from "next/link";

export default function CheckoutPayPage() {
  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-3xl font-bold text-[#2f1500]">Step 4: Payment</h1>
      <p className="text-[#4d4638]">Coming soon — payment integration.</p>
      <Link href="/checkout/details" className="px-6 py-3 rounded-full border-2 border-[#775a11] text-[#775a11] font-bold hover:bg-[#fff1e9] transition-all">← Back to Details</Link>
    </div>
  );
}
