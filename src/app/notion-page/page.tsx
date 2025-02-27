"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { NotionAPI } from "notion-client";
import { ExtendedRecordMap } from "notion-types";
import { NotionRenderer } from "react-notion-x";

// Import CSS styles
import "./global.css";

// Import required components from react-notion-x
const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then((m) => m.Code)
);
const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection
  )
);
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
);
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  { ssr: false }
);

export default function NotionPage() {
  const [pageId, setPageId] = useState<string | null>(null);
  const [recordMap, setRecordMap] = useState<ExtendedRecordMap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const notionClient = new NotionAPI();

  useEffect(() => {
    async function fetchNotionData() {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch page ID from our API
        const response = await fetch("/api/notion");
        if (!response.ok) {
          throw new Error("Failed to fetch Notion page data");
        }

        const data = await response.json();
        if (!data.pageId) {
          throw new Error("No page ID returned from API");
        }

        setPageId(data.pageId);

        // Step 2: Use notion-client to fetch the full page content
        const notionData = await notionClient.getPage(data.pageId);
        setRecordMap(notionData);
      } catch (err) {
        console.error("Error fetching Notion data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchNotionData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-primary font-medium">
            Loading Notion Page...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-light">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!recordMap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-light">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-theme-primary mb-4">
            No Content Found
          </h2>
          <p className="text-gray-700 mb-4">
            We could not find any Notion page content to display.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-primary">Notion Page</h1>
          <p className="text-gray-600">
            Displaying content from Notion page: {pageId?.substring(0, 8)}...
          </p>
        </div>

        <div className="notion-container">
          <NotionRenderer
            recordMap={recordMap}
            fullPage={true}
            darkMode={false}
            components={{
              Code,
              Collection,
              Equation,
              Modal,
            }}
          />
        </div>
      </div>
    </div>
  );
}
