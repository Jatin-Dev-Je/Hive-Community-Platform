import React from "react";

export default function Divider({ children }) {
  return (
    <div className="flex items-center my-4">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="mx-3 text-gray-400 text-xs select-none">{children}</span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
} 