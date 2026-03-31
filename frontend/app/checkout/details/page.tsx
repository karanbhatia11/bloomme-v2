"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutDetailsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#fff8f5] flex flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-3xl font-bold text-[#2f1500]">Step 3: Details</h1>
      <p className="text-[#4d4638]">Coming soon — delivery details.</p>
      <div className="flex gap-4">
        <Link href="/checkout/addons" className="px-6 py-3 rounded-full border-2 border-[#775a11] text-[#775a11] font-bold hover:bg-[#fff1e9] transition-all">← Back to Add-ons</Link>
        <button onClick={() => router.push("/checkout/pay")} className="px-6 py-3 rounded-full bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold hover:scale-[1.02] transition-all">Continue to Pay →</button>
      </div>
    </div>
  );
}
