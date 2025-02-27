import { Client } from "@notionhq/client";

import { NextResponse } from "next/server";

// Initialize the Notion client with the environment variables
const notionClient = new Client({
  auth: process.env.NOTION_INTENTIONS_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

export async function GET() {
  try {
    // Query the database to get pages
    const response = await notionClient.databases.query({
      database_id: databaseId as string,
      page_size: 10, // Limit to 10 pages
    });

    // Extract the first page ID (we'll use this to fetch detailed page content)
    if (response.results.length === 0) {
      // Create a new page if none exists
      const newPage = await notionClient.pages.create({
        parent: {
          database_id: databaseId as string,
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: "Welcome to Notion Integration",
                },
              },
            ],
          },
        },
        children: [
          {
            object: "block",
            type: "heading_1",
            heading_1: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "Hello from Prajnai!",
                  },
                },
              ],
            },
          },
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "This is a sample page created by your Notion integration.",
                  },
                },
              ],
            },
          },
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "You can use this integration to create and manage Notion pages from your application.",
                  },
                },
              ],
            },
          },
        ],
      });
      
      // Return the newly created page ID
      return NextResponse.json({ pageId: newPage.id });
    }

    // Return the first page ID
    const pageId = response.results[0].id;
    
    // Get the page blocks
    const blocks = await notionClient.blocks.children.list({
      block_id: pageId,
    });

    // Return both the page ID and the blocks
    return NextResponse.json({ 
      pageId,
      blocks: blocks.results 
    });
  } catch (error) {
    console.error("Error accessing Notion API:", error);
    return NextResponse.json(
      { error: "Failed to fetch Notion data" },
      { status: 500 }
    );
  }
}