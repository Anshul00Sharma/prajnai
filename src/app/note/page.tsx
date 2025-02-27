"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdCode,
  MdTextFields,
  MdImage,
} from "react-icons/md";
import Heading1 from "@/components/notes-ui/heading-1";
import Heading2 from "@/components/notes-ui/heading-2";
import Paragraph from "@/components/notes-ui/paragraph";
import UnorderedList from "@/components/notes-ui/unordered-list";
import OrderedList from "@/components/notes-ui/ordered-list";
import Image from "@/components/notes-ui/image";
import CodeBlock from "@/components/notes-ui/code-block";
import AddBlockButton from "@/components/notes-ui/add-block-button";

// Define types for our note structure
type SubBlockType =
  | "paragraph"
  | "unordered-list"
  | "ordered-list"
  | "image"
  | "code-block";

interface SubBlock {
  id: string;
  heading: string;
  type: SubBlockType;
  content: any; // This will vary based on the type
}

interface Block {
  id: string;
  heading: string;
  subBlocks: SubBlock[];
}

export default function NotePage() {
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
  const updateSubBlockContent = (subBlockId: string, newContent: any) => {
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
  const getDefaultContentForType = (type: SubBlockType) => {
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
            initialContent={subBlock.content}
            onContentChange={(content) =>
              updateSubBlockContent(subBlock.id, content)
            }
          />
        );
      case "unordered-list":
        return (
          <UnorderedList
            id={subBlock.id}
            initialItems={subBlock.content}
            onItemsChange={(items) => updateSubBlockContent(subBlock.id, items)}
          />
        );
      case "ordered-list":
        return (
          <OrderedList
            id={subBlock.id}
            initialItems={subBlock.content}
            onItemsChange={(items) => updateSubBlockContent(subBlock.id, items)}
          />
        );
      case "image":
        return (
          <Image
            id={subBlock.id}
            initialSrc={subBlock.content.src}
            initialAlt={subBlock.content.alt}
            onImageChange={(src, alt) =>
              updateSubBlockContent(subBlock.id, { src, alt })
            }
          />
        );
      case "code-block":
        return (
          <CodeBlock
            id={subBlock.id}
            initialCode={subBlock.content.code}
            initialLanguage={subBlock.content.language}
            onCodeChange={(code, language) =>
              updateSubBlockContent(subBlock.id, { code, language })
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Main Block with Heading 1 */}
      <div className="mb-6">
        <Heading1
          id={block.id}
          initialContent={block.heading}
          onContentChange={updateBlockHeading}
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
                initialContent={subBlock.heading}
                onContentChange={(content) =>
                  updateSubBlockHeading(subBlock.id, content)
                }
                onDelete={() => deleteSubBlock(subBlock.id)}
              />
            </div>

            {/* Content of the Sub-Block based on its type */}
            <div className="ml-4">{renderSubBlockContent(subBlock)}</div>
          </div>
        ))}
      </div>

      {/* Add new sub-block buttons */}
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
    </div>
  );
}
