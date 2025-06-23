import React from "react";

export default function TrendingGroups({ groups }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-2 text-indigo-700">Trending Groups</h2>
      <div className="space-y-2">
        {groups.map((group) => (
          <div key={group.id} className="flex items-center justify-between bg-indigo-50 px-4 py-2 rounded-lg">
            <span className="font-medium text-indigo-800">{group.name}</span>
            <span className="text-xs text-indigo-500">{group.members} members</span>
          </div>
        ))}
      </div>
    </div>
  );
} 