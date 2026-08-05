import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Login from "../pages/Login";
import Home from "../pages/Home";
import { useSelector } from "react-redux";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../features/user/pages/Dashboard";
import Generate from "../features/user/pages/Generate";
import Workspace from "../features/user/pages/Workspace";
import Pricing from "../components/Pricing";
import PaymentSuccess from "../features/billing/pages/PaymentSuccess";
import PaymentCancel from "../features/billing/pages/PaymentCancel";
import LearnMore from "../pages/LearnMore";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/learn-more",
    element: <LearnMore />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/generate",
    element: (
      <ProtectedRoute>
        <Generate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pricing",
    element: (
      <ProtectedRoute>
        <Pricing />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-success",
    element: (
      <ProtectedRoute>
        <PaymentSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-cancel",
    element: (
      <ProtectedRoute>
        <PaymentCancel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/workspace/:id",
    element: (
      <ProtectedRoute>
        <Workspace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/editor/:id",
    element: (
      <ProtectedRoute>
        <Workspace />
      </ProtectedRoute>
    ),
  },
]);

const AppRoute = () => {
  const { loading, user } = useSelector((state) => state.auth);

  if (loading && !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-sm text-zinc-400">Loading Application...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

export default AppRoute;
