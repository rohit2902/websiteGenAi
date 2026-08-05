import React from "react";
import { Zap } from "lucide-react";

const UserCreditBadge = ({
  credit = 0,
  plan = "free",
  onClick,
  className = "",
  showIcon = true,
}) => {
  const normalizedPlan = (plan || "free").toLowerCase();

  const getPlanName = (p) => {
    switch (p) {
      case "pro":
        return "Pro";
      case "enterprise":
        return "Enterprise";
      default:
        return "Free";
    }
  };

  const getBadgeStyle = (p) => {
    switch (p) {
      case "enterprise":
        return "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20";
      case "pro":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20";
      default:
        return "bg-zinc-500/10 border-zinc-500/30 text-zinc-300 hover:bg-zinc-500/20";
    }
  };

  const planFormatted = getPlanName(normalizedPlan);
  const styleClasses = getBadgeStyle(normalizedPlan);

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer select-none ${styleClasses} ${className}`}
      title={`Current Plan: ${planFormatted} (${credit} Credits)`}
    >
      {showIcon && <Zap size={14} className="text-yellow-400 shrink-0" />}
      <span>
        Credits: {credit?.toLocaleString()} • {planFormatted}
      </span>
    </div>
  );
};

export default UserCreditBadge;
