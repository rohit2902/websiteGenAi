import React from "react";
import { Link } from "react-router";
import { XCircle, ArrowLeft } from "lucide-react";

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-[#0d0f14] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl bg-white/5 border border-white/10 p-8 text-center backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <XCircle className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Payment Cancelled
          </h1>

          <p className="text-zinc-400 text-sm">
            Your checkout process was cancelled and no charges were made.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
            <Link
              to="/pricing"
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Try Again
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition flex items-center justify-center"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
