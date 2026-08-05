import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { CheckCircle2, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import useBilling from "../hook/useBilling";
import useAuth from "../../../hook/useAuth";
import { useSelector } from "react-redux";
import UserCreditBadge from "../../../components/UserCreditBadge";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const { handleVerifyPayment } = useBilling();
  const { handleGetMe } = useAuth();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!sessionId) {
        if (isMounted) {
          setError("No session ID found in request.");
          setLoading(false);
        }
        return;
      }

      try {
        const data = await handleVerifyPayment(sessionId);
        if (isMounted) {
          if (data && data.success && data.user) {
            setVerifiedUser(data.user);
            // Double-verify in background without showing global loading
            handleGetMe(false);
          } else {
            setError(data?.message || "Failed to verify payment.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to verify payment with server.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [sessionId, handleVerifyPayment, handleGetMe]);

  const activeUser = verifiedUser || user;

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl bg-white/5 border border-white/10 p-8 text-center backdrop-blur-md shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <h2 className="text-xl font-semibold">Verifying Your Payment...</h2>
            <p className="text-zinc-400 text-sm">Please wait while we update your account credits.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Verification Error</h2>
            <p className="text-zinc-400 text-sm">{error}</p>
            <div className="flex gap-4 mt-6 w-full">
              <button
                onClick={() => navigate("/pricing")}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition"
              >
                Back to Pricing
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Payment Successful!
            </h1>

            <p className="text-zinc-400 text-sm">
              Thank you for upgrading your plan! Your credits have been added to your account.
            </p>

            {activeUser && (
              <div className="w-full my-4 rounded-2xl bg-black/40 border border-white/10 p-5 text-center flex flex-col items-center gap-3">
                <UserCreditBadge
                  credit={activeUser.credit}
                  plan={activeUser.plan}
                  className="text-sm py-2 px-4"
                />
              </div>
            )}

            <Link
              to="/dashboard"
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
