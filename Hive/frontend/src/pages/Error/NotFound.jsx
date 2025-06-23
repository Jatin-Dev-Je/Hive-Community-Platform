import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-10 flex flex-col items-center">
        <svg width="80" height="80" fill="none" viewBox="0 0 80 80" className="mb-6">
          <circle cx="40" cy="40" r="38" stroke="#6366f1" strokeWidth="4" fill="#EEF2FF" />
          <text x="40" y="50" textAnchor="middle" fontSize="32" fill="#6366f1" fontWeight="bold">404</text>
        </svg>
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Sorry, the page you are looking for does not exist or has been moved.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
} 