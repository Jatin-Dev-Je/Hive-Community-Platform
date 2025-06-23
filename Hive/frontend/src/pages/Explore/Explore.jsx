import React from "react";
import TrendingTopics from "../../components/Explore/TrendingTopics";
import TrendingGroups from "../../components/Explore/TrendingGroups";
import TrendingContent from "../../components/Explore/TrendingContent";

// Mock data
const topics = ["React", "Career", "Mentorship", "Startups", "AI"];
const groups = [
  { id: 1, name: "Developers", members: 1200 },
  { id: 2, name: "Career Changers", members: 800 },
  { id: 3, name: "AI Enthusiasts", members: 650 },
];
const content = [
  { id: 1, title: "How to get your first tech job", author: "Alice" },
  { id: 2, title: "Best resources for learning React", author: "Bob" },
  { id: 3, title: "AI trends in 2024", author: "Carol" },
];

export default function Explore() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Explore</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <TrendingTopics topics={topics} />
          <TrendingGroups groups={groups} />
        </div>
        <div>
          <TrendingContent content={content} />
        </div>
      </div>
    </div>
  );
} 