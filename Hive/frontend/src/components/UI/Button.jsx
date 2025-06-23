import React from "react";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) {
  const base =
    "w-full py-2 px-4 font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed ";
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white ",
    secondary:
      "bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 ",
  };
  return (
    <button
      type={type}
      className={`${base}${variants[variant] || ""}${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-white border-t-blue-500 rounded-full animate-spin align-middle mr-2"></span>
      ) : null}
      {children}
    </button>
  );
} 