"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "next/navigation";
import {
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdCode,
  MdTextFields,
  MdImage,
} from "react-icons/md";
import { FaEdit, FaSave } from "react-icons/fa";
import Heading1 from "@/components/notes-ui/heading-1";
import Heading2 from "@/components/notes-ui/heading-2";
import Paragraph from "@/components/notes-ui/paragraph";
import UnorderedList from "@/components/notes-ui/unordered-list";
import OrderedList from "@/components/notes-ui/ordered-list";
import ImageComponent from "@/components/notes-ui/image";
import Image from "next/image";
import CodeBlock from "@/components/notes-ui/code-block";
import AddBlockButton from "@/components/notes-ui/add-block-button";
import Chatbot from "@/components/chat/chatbot";
import { motion } from "framer-motion";
import AI_image from "@/utils/media/ai_tutor.png";

// Define types for our note structure
type SubBlockType =
  | "paragraph"
  | "unordered-list"
  | "ordered-list"
  | "image"
  | "code-block";

// Define the content types for each sub-block type
interface ListItem {
  id: string;
  content: string;
}

interface ImageContent {
  src: string;
  alt: string;
}

interface CodeContent {
  code: string;
  language: string;
}

// Define the content type based on the sub-block type
type SubBlockContent =
  | string // for paragraph
  | ListItem[] // for unordered-list and ordered-list
  | ImageContent // for image
  | CodeContent; // for code-block

interface SubBlock {
  id: string;
  heading: string;
  type: SubBlockType;
  content: SubBlockContent; // Typed based on the type of sub-block
}

export interface Block {
  id: string;
  heading: string;
  subBlocks: SubBlock[];
}

export default function NotePage() {
  const params = useParams();
  const topicId = params.topic_id as string;

  // Initialize with a default block and one sub-block
  const [block, setBlock] = useState<Block>({
    id: uuidv4(),
    heading: "My Note",
    subBlocks: [
      {
        id: uuidv4(),
        heading: "Getting Started",
        type: "paragraph",
        content: "This is your first note. Feel free to edit this content.",
      },
    ],
  });

  // State for loading, error, editing
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch note data from API
  useEffect(() => {
    const fetchNoteData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/topic/${topicId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch note data");
        }

        const data = await response.json();

        if (data.note) {
          setBlock(data.note);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching note:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch note data"
        );
        setLoading(false);
      }
    };

    if (topicId) {
      fetchNoteData();
    }
  }, [topicId]);

  // Function to save note data to the API
  const saveNote = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(null);

      const response = await fetch(`/api/topic/${topicId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note: block }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save note");
      }

      // Note saved successfully
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(null), 3000); // Clear success message after 3 seconds

      // Exit editing mode
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving note:", err);
      setError(err instanceof Error ? err.message : "Failed to save note");
      setSaveSuccess(false);
      // Keep editing mode active so user can try again
    } finally {
      setIsSaving(false);
    }
  };

  // Function to update the block heading
  const updateBlockHeading = (newHeading: string) => {
    setBlock({
      ...block,
      heading: newHeading,
    });
  };

  // Function to update a sub-block's heading
  const updateSubBlockHeading = (subBlockId: string, newHeading: string) => {
    setBlock({
      ...block,
      subBlocks: block.subBlocks.map((subBlock) =>
        subBlock.id === subBlockId
          ? { ...subBlock, heading: newHeading }
          : subBlock
      ),
    });
  };

  // Function to update a sub-block's content
  const updateSubBlockContent = (
    subBlockId: string,
    newContent: SubBlockContent
  ) => {
    setBlock({
      ...block,
      subBlocks: block.subBlocks.map((subBlock) =>
        subBlock.id === subBlockId
          ? { ...subBlock, content: newContent }
          : subBlock
      ),
    });
  };

  // Function to add a new sub-block
  const addSubBlock = (type: SubBlockType) => {
    const newSubBlock: SubBlock = {
      id: uuidv4(),
      heading: "New Section",
      type,
      content: getDefaultContentForType(type),
    };

    setBlock({
      ...block,
      subBlocks: [...block.subBlocks, newSubBlock],
    });
  };

  // Function to delete a sub-block
  const deleteSubBlock = (subBlockId: string) => {
    if (block.subBlocks.length <= 1) {
      return; // Don't delete if it's the last sub-block
    }

    setBlock({
      ...block,
      subBlocks: block.subBlocks.filter(
        (subBlock) => subBlock.id !== subBlockId
      ),
    });
  };

  // Helper function to get default content based on block type
  const getDefaultContentForType = (type: SubBlockType): SubBlockContent => {
    switch (type) {
      case "paragraph":
        return "New paragraph content";
      case "unordered-list":
        return [{ id: uuidv4(), content: "New list item" }];
      case "ordered-list":
        return [{ id: uuidv4(), content: "New list item" }];
      case "image":
        return {
          src: "https://via.placeholder.com/800x400?text=Add+an+image",
          alt: "New image",
        };
      case "code-block":
        return { code: "// Add your code here", language: "javascript" };
      default:
        return "";
    }
  };

  // Render the appropriate component based on sub-block type
  const renderSubBlockContent = (subBlock: SubBlock) => {
    switch (subBlock.type) {
      case "paragraph":
        return (
          <Paragraph
            id={subBlock.id}
            block={block}
            initialContent={subBlock.content as string}
            title={subBlock.heading}
            isEditing={isEditing}
            onContentChange={
              isEditing
                ? (content) => updateSubBlockContent(subBlock.id, content)
                : undefined
            }
          />
        );
      case "unordered-list":
        return (
          <UnorderedList
            block={block}
            title={subBlock.heading}
            id={subBlock.id}
            initialItems={subBlock.content as ListItem[]}
            isEditing={isEditing}
            onItemsChange={
              isEditing
                ? (items) => updateSubBlockContent(subBlock.id, items)
                : undefined
            }
          />
        );
      case "ordered-list":
        return (
          <OrderedList
            block={block}
            id={subBlock.id}
            initialItems={subBlock.content as ListItem[]}
            isEditing={isEditing}
            onItemsChange={
              isEditing
                ? (items) => updateSubBlockContent(subBlock.id, items)
                : undefined
            }
          />
        );
      case "image":
        return (
          <ImageComponent
            id={subBlock.id}
            isEditing={isEditing}
            initialSrc={(subBlock.content as ImageContent).src}
            initialAlt={(subBlock.content as ImageContent).alt}
            onImageChange={
              isEditing
                ? (src, alt) => updateSubBlockContent(subBlock.id, { src, alt })
                : undefined
            }
          />
        );
      case "code-block":
        return (
          <CodeBlock
            block={block}
            title={subBlock.heading}
            id={subBlock.id}
            initialCode={(subBlock.content as CodeContent).code}
            initialLanguage={(subBlock.content as CodeContent).language}
            isEditing={isEditing}
            onCodeChange={
              isEditing
                ? (code, language) =>
                    updateSubBlockContent(subBlock.id, { code, language })
                : undefined
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-theme-primary">
            {loading ? "Loading Note..." : block.heading}
          </h1>
          <div className="flex items-center gap-4">
            {/* Show success/error feedback */}
            {saveSuccess === true && (
              <span className="text-green-600 text-sm">Note saved!</span>
            )}
            {saveSuccess === false && (
              <span className="text-red-600 text-sm">Failed to save</span>
            )}

            <button
              onClick={isEditing ? saveNote : () => setIsEditing(true)}
              disabled={isSaving}
              className={`flex items-center gap-2 px-3 py-1.5 ${
                isSaving
                  ? "bg-gray-400"
                  : "bg-theme-primary hover:bg-theme-primary/90"
              } text-white rounded-lg transition-colors`}
            >
              {isEditing ? (
                <>
                  <FaSave className="mr-1" size={16} />
                  {isSaving ? "Saving..." : "Save"}
                </>
              ) : (
                <>
                  <FaEdit className="mr-1" size={16} />
                  Edit
                </>
              )}
            </button>

            {/* Chatbot Button with Animation */}
            <div className="relative group">
              <motion.button
                className="flex items-center justify-center w-14 h-14 border bg-theme-primary border-theme-secondary text-white rounded-full transition-colors overflow-hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ x: 0 }}
                animate={
                  !isChatOpen
                    ? {
                        x: [0, -3, 3, -3, 0],
                        transition: {
                          repeat: Infinity,
                          repeatType: "loop",
                          duration: 0.3,
                          repeatDelay: 2,
                        },
                      }
                    : { x: 0 }
                }
                onClick={() => setIsChatOpen(true)}
              >
                <Image
                  src={AI_image}
                  alt="AI Tutor"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "contain", scale: 1.1 }}
                  className="mt-2"
                />
              </motion.button>
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-theme-primary text-theme-light text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                AI Tutor
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-theme-primary"></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Component */}
      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        noteId={topicId}
      />

      {/* Add padding to account for fixed navbar */}
      <div className="pt-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Loading note...</div>
          </div>
        ) : error ? (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            {/* Main Block with Heading 1 */}
            <div className="mb-6">
              <Heading1
                id={block.id}
                isEditing={isEditing}
                initialContent={block.heading}
                onContentChange={isEditing ? updateBlockHeading : undefined}
              />
            </div>

            {/* Sub-Blocks */}
            <div className="space-y-8">
              {block.subBlocks.map((subBlock) => (
                <div
                  key={subBlock.id}
                  className="border border-theme-primary/10 rounded-lg p-4 bg-white shadow-sm"
                >
                  {/* Heading 2 for the Sub-Block */}
                  <div className="mb-4">
                    <Heading2
                      id={`heading-${subBlock.id}`}
                      isEditing={isEditing}
                      initialContent={subBlock.heading}
                      onContentChange={
                        isEditing
                          ? (content) =>
                              updateSubBlockHeading(subBlock.id, content)
                          : undefined
                      }
                      onDelete={
                        isEditing
                          ? () => deleteSubBlock(subBlock.id)
                          : undefined
                      }
                    />
                  </div>

                  {/* Content of the Sub-Block based on its type */}
                  <div className="ml-4">{renderSubBlockContent(subBlock)}</div>
                </div>
              ))}
            </div>

            {/* Add new sub-block buttons - only visible in edit mode */}
            {isEditing && (
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <AddBlockButton
                  icon={<MdTextFields size={40} />}
                  label="Text"
                  onClick={() => addSubBlock("paragraph")}
                />
                <AddBlockButton
                  icon={<MdFormatListBulleted size={40} />}
                  label="Bullet List"
                  onClick={() => addSubBlock("unordered-list")}
                />
                <AddBlockButton
                  icon={<MdFormatListNumbered size={40} />}
                  label="Numbered List"
                  onClick={() => addSubBlock("ordered-list")}
                />
                <AddBlockButton
                  icon={<MdImage size={40} />}
                  label="Image"
                  onClick={() => addSubBlock("image")}
                />
                <AddBlockButton
                  icon={<MdCode size={40} />}
                  label="Code"
                  onClick={() => addSubBlock("code-block")}
                />
              </div>
            )}

            {/* Debug information - can be removed in production */}
            <div className="mt-12 p-4 bg-gray-100 rounded-lg">
              <details>
                <summary className="cursor-pointer text-sm text-theme-primary/70">
                  Debug: Current Note Structure
                </summary>
                <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto">
                  {JSON.stringify(block, null, 2)}
                </pre>
              </details>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
