import React from "react";

export default function AuthWrapper({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 dark:border-gray-800">
        {children}
      </div>
    </div>
  );
} 