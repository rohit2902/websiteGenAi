import React, { useState } from "react";
import { Check, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import useBilling from "../features/billing/hook/useBilling.js";
import UserCreditBadge from "./UserCreditBadge.jsx";

const Pricing = () => {
  const plans = [
    {
      key: "free",
      name: "Free",
      planType: "free",
      price: "₹0",
      credits: 100,
      description: "Perfect to explore GenWeb.ai",
      features: [
        "AI website generation",
        "Responsive HTML output",
        "Basic animations",
      ],
      popular: false,
      button: "Get Started",
    },
    {
      key: "pro",
      name: "Pro",
      planType: "pro",
      price: "₹499",
      credits: 500,
      description: "For serious creators & freelancers",
      features: [
        "Everything in Free",
        "Faster generation",
        "Edit & regenerate",
        "Download source code",
      ],
      popular: true,
      button: "Upgrade to Pro",
    },
    {
      key: "enterprise",
      name: "Enterprise",
      planType: "enterprise",
      price: "₹1499",
      credits: 1000,
      description: "For teams & power users",
      features: [
        "Unlimited iterations",
        "Highest priority",
        "Team collaboration",
        "Dedicated support",
      ],
      popular: false,
      button: "Upgrade to Enterprise",
    },
  ];

  const navigate = useNavigate();
  const { handleBilling } = useBilling();
  const { user } = useSelector((state) => state.auth);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const activePlanKey = (user?.plan || "free").toLowerCase();

  const handlePlanBuy = async (planKey) => {
    setErrorMsg(null);
    if (!user) {
      navigate("/login");
      return;
    }

    if (planKey === activePlanKey) {
      navigate("/dashboard");
      return;
    }

    if (planKey === "free") {
      navigate("/dashboard");
      return;
    }

    try {
      setLoadingPlan(planKey);
      await handleBilling(planKey);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to process request. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className="min-h-screen bg-[#0d0f14] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {user && (
            <UserCreditBadge
              credit={user.credit}
              plan={user.plan}
              className="text-sm py-2 px-4"
            />
          )}
        </div>

        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-5">
            <Sparkles size={16} />
            Pricing Plans
          </div>

          <h1 className="text-5xl font-bold">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>

          <p className="text-zinc-400 mt-5 max-w-2xl mx-auto">
            Start for free and upgrade whenever you need more AI website
            generations, credits, and premium features.
          </p>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 max-w-md mx-auto">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = activePlanKey === plan.key;

            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isCurrentPlan
                    ? "border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-transparent shadow-emerald-500/10"
                    : plan.popular
                    ? "border-indigo-500 bg-gradient-to-b from-indigo-500/10 to-transparent scale-105"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {isCurrentPlan ? (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Active Plan
                  </span>
                ) : (
                  plan.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  )
                )}

                <h2 className="text-3xl font-bold">{plan.name}</h2>

                <div className="mt-5 flex items-end gap-2">
                  <h3 className="text-5xl font-bold">{plan.price}</h3>
                  <span className="text-zinc-400 mb-2">/month</span>
                </div>

                <p className="text-zinc-400 mt-4">{plan.description}</p>

                <div className="mt-6 rounded-2xl bg-black/30 border border-white/10 p-4">
                  <p className="text-sm text-zinc-400">Monthly Credits</p>
                  <h4 className="text-3xl font-bold mt-1">
                    {plan.credits.toLocaleString()}
                  </h4>
                </div>

                <ul className="space-y-4 mt-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check size={15} className="text-green-400" />
                      </div>
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanBuy(plan.key)}
                  disabled={loadingPlan === plan.key || isCurrentPlan}
                  className={`w-full mt-10 py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                      : plan.popular
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50"
                      : "bg-white/10 hover:bg-white/20 disabled:opacity-50"
                  }`}
                >
                  {loadingPlan === plan.key ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    "Active Plan"
                  ) : (
                    plan.button
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-20">
          <p className="text-zinc-500">
            Need a custom solution for your company?
          </p>

          <button className="mt-5 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold hover:scale-105 transition">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;