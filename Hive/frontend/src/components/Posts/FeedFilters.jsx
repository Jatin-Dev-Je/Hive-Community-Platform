import React from "react";

const options = [
  { label: "All", value: "all" },
  { label: "Threads", value: "thread" },
  { label: "Questions", value: "question" },
  { label: "Milestones", value: "milestone" },
];

export default function FeedFilters({ filter, setFilter }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`px-4 py-2 rounded-full border transition font-medium text-sm ${
            filter === opt.value
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          }`}
          onClick={() => setFilter(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
} 