"use client";

import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import AddTopicCard from "@/components/topic/add-topic-card";
import { UploadData } from "@/contexts/upload-context";
import { useUpload } from "@/contexts/upload-context";

interface TopicData {
  id: number;
  title: string;
  description: string;
  // uploadIds: string[];
}

// Example upload data to populate the "Use Uploads" section for demonstration
const exampleUploads: UploadData[] = [
  {
    id: 1,
    title: "Introduction to Machine Learning PDF",
    type: "pdf",
    description: "Comprehensive guide on ML basics",
    content: "intro-ml.pdf",
  },
  {
    id: 2,
    title: "Neural Networks Tutorial",
    type: "web-link",
    description: "Interactive tutorial on neural networks",
    content: "https://example.com/neural-networks",
  },
  {
    id: 3,
    title: "Data Preprocessing Guide",
    type: "text",
    description: "Steps for effective data preprocessing",
    content: "This is an example of text content for data preprocessing...",
  },
  {
    id: 4,
    title: "Deep Learning Research Paper",
    type: "pdf",
    description: "Latest research on deep learning models",
    content: "deep-learning-paper.pdf",
  },
  {
    id: 5,
    title: "ML Best Practices",
    type: "text",
    description: "Industry best practices for ML implementation",
    content:
      "Here are some best practices for machine learning implementation...",
  },
];

export default function TopicPage() {
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [nextId, setNextId] = useState(1);
  const { setUploadedData } = useUpload();

  // Set example uploads and create a demo topic when component mounts
  useEffect(() => {
    setUploadedData(exampleUploads);

    // Create a demo topic with some selected uploads
    // if (topics.length === 0) {
    //   setTopics([
    //     {
    //       id: 0,
    //       title: "Example AI Topic",
    //       description: "A demonstration topic for AI techniques and tutorials",
    //       uploadIds: ["1", "2", "4"] // Pre-select some example uploads
    //     }
    //   ]);
    //   setNextId(1);
    // }
  }, [setUploadedData, topics.length]);

  const handleAddTopic = () => {
    setTopics((prev) => [
      ...prev,
      { id: nextId, title: "", description: "", uploadIds: [] },
    ]);
    setNextId((prev) => prev + 1);

    // Scroll to the new card
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleTopicSubmit = (topicData: TopicData) => {
    setTopics((prev) =>
      prev.map((topic) => (topic.id === topicData.id ? topicData : topic))
    );
    // Here you would integrate with your backend
    console.log("Topic submitted:", topicData);
  };

  const handleTopicDelete = (id: number) => {
    setTopics((prev) => prev.filter((topic) => topic.id !== id));
  };

  return (
    <main className="py-6 pt-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-theme-primary mb-8">Topics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <AddTopicCard
              key={topic.id}
              id={topic.id}
              onSubmit={handleTopicSubmit}
              onDelete={handleTopicDelete}
            />
          ))}

          {topics.length < 20 && (
            <div className="w-full">
              <button
                onClick={handleAddTopic}
                className="bg-white rounded-xl shadow-lg p-4 w-full h-[250px] flex flex-col items-center justify-center border-2 border-dashed border-theme-primary/20 hover:border-theme-primary/40 transition-colors group"
              >
                <FaPlus className="text-4xl text-theme-primary/40 group-hover:text-theme-primary/60 transition-colors" />
                <span className="mt-2 text-sm text-theme-primary/40 group-hover:text-theme-primary/60 transition-colors">
                  Add New Topic ({topics.length}/20)
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
