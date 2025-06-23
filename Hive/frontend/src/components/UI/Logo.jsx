import React from "react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <span className="inline-block w-8 h-8 bg-blue-600 rounded-full shadow-md"></span>
      <span className="text-xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">Hive</span>
    </div>
  );
} 