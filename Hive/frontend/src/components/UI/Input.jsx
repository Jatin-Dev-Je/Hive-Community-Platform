import React from "react";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

const icons = { mail: EnvelopeIcon, lock: LockClosedIcon };

export default function Input({ label, error, icon, className = "", ...props }) {
  const Icon = icon ? icons[icon] : null;
  return (
    <div className="mb-4 relative">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">{label}</label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${error ? "border-red-500" : ""} ${Icon ? "pr-10" : ""} ${className}`}
        {...props}
      />
      {Icon && <Icon className="w-5 h-5 absolute right-3 top-9 text-gray-400 pointer-events-none" />}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
} 