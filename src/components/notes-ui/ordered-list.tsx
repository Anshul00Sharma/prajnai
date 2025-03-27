"use client";

import { useState } from "react";
import NoteBlock from "./note-block";
import OrderedListItem from "./ordered-list-item";
import { Block } from "@/app/note/[topic_id]/page"; // Needed for typing
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import { RiMagicLine } from "react-icons/ri";

interface ListItem {
  id: string;
  content: string;
}

interface OrderedListProps {
  id: string;
  block?: Block; // Optional for now, will be used for AI edits in the future
  initialItems?: ListItem[];
  isEditing?: boolean;
  onDelete?: () => void;
  onItemsChange?: (items: ListItem[]) => void;
}

export default function OrderedList({
  id,
  block, // Will be used when connecting to the AI API
  initialItems = [{ id: "0", content: "List item" }],
  isEditing = false,
  onDelete,
  onItemsChange,
}: OrderedListProps) {
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [isAIBubbleOpen, setIsAIBubbleOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);

  const handleAddItem = () => {
    const newItems = [
      ...items,
      { id: `item-${Date.now()}`, content: "New item" },
    ];
    setItems(newItems);
    onItemsChange?.(newItems);
  };

  const handleDeleteItem = (itemId: string) => {
    if (items.length <= 1) return; // Don't allow deleting the last item

    const newItems = items.filter((item) => item.id !== itemId);
    setItems(newItems);
    onItemsChange?.(newItems);
  };

  const handleItemContentChange = (itemId: string, content: string) => {
    const newItems = items.map((item) =>
      item.id === itemId ? { ...item, content } : item
    );
    setItems(newItems);
    onItemsChange?.(newItems);
  };

  // Implement real AI edit function using API
  const handleAIEdit = async () => {
    if (!prompt.trim()) return;

    // Check if block data is available
    const hasBlockContext = !!block;
    console.log("Has block context for AI:", hasBlockContext);

    setIsAILoading(true);

    try {
      // Call the API endpoint to edit the ordered list
      const response = await fetch('/api/note-sections/ordered-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          block: block,
          items: items,
          prompt: prompt,
          title: block?.heading || "Ordered List"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit ordered list');
      }

      const data = await response.json();
      
      if (data.success && data.editedItems && Array.isArray(data.editedItems)) {
        setItems(data.editedItems);
        onItemsChange?.(data.editedItems);
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('Error editing ordered list with AI:', error);
      
      // Fallback to mock implementation if API fails
      const mockAIItems = []; 
      
      mockAIItems.push(
        {
          id: `ai-item-${Date.now()}-1`,
          content: `AI suggested item: ${prompt.substring(0, 20)}...`,
        },
        {
          id: `ai-item-${Date.now()}-2`,
          content: "Another AI suggested item",
        }
      );

      setItems(mockAIItems);
      onItemsChange?.(mockAIItems);
    } finally {
      setIsAILoading(false);
      setIsAIBubbleOpen(false);
      setPrompt("");
    }
  };

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="flex items-center justify-center my-2">
      <motion.div
        className="w-2 h-2 bg-theme-primary rounded-full mr-1"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.5, 1],
        }}
      />
      <motion.div
        className="w-2 h-2 bg-theme-primary rounded-full mr-1"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          delay: 0.2,
          times: [0, 0.5, 1],
        }}
      />
      <motion.div
        className="w-2 h-2 bg-theme-primary rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          delay: 0.4,
          times: [0, 0.5, 1],
        }}
      />
    </div>
  );

  // View-only version of list item
  const ViewOnlyListItem = ({
    content,
    index,
  }: {
    content: string;
    index: number;
  }) => (
    <li className="flex items-start mb-2 relative pl-2" value={index + 1}>
      <span className="absolute left-[-1rem] top-0.5 text-theme-primary/80 font-medium">
        {index + 1}.
      </span>
      <span className="flex-1 text-theme-primary/90 py-0.5 px-1">
        {content}
      </span>
    </li>
  );

  return (
    <NoteBlock id={id} type="Ordered List" onDelete={onDelete}>
      <div className="px-2 py-1 relative">
        <ol className="ml-2 list-decimal">
          {items.map((item, index) =>
            isEditing ? (
              <OrderedListItem
                key={item.id}
                id={item.id}
                index={index}
                initialContent={item.content}
                onDelete={() => handleDeleteItem(item.id)}
                onContentChange={handleItemContentChange}
              />
            ) : (
              <ViewOnlyListItem
                key={item.id}
                content={item.content}
                index={index}
              />
            )
          )}
        </ol>

        {isEditing && (
          <div className="flex justify-between items-center mt-2">
            <button
              className="text-sm text-theme-primary/70 hover:text-theme-primary flex items-center transition-colors"
              onClick={handleAddItem}
            >
              <span className="mr-1">+</span> Add item
            </button>

            {/* AI Edit Button */}
            <motion.button
              className="w-8 h-8 rounded-full bg-theme-primary text-white flex items-center justify-center shadow-md hover:bg-theme-primary/90"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAIBubbleOpen(true)}
            >
              <RiMagicLine size={18} />
            </motion.button>
          </div>
        )}

        {/* AI Chat Bubble */}
        <AnimatePresence>
          {isAIBubbleOpen && (
            <motion.div
              className="absolute right-0 bottom-12 w-72 bg-white rounded-lg shadow-lg border border-theme-primary/20 overflow-hidden z-10"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="flex items-center justify-between bg-theme-primary text-white p-2">
                <div className="flex items-center">
                  <FaRobot className="mr-2" />
                  <span className="font-medium">AI List Editor</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsAIBubbleOpen(false)}
                >
                  <FaTimes />
                </motion.button>
              </div>

              <div className="p-3">
                <p className="text-sm text-gray-600 mb-2">
                  How would you like to transform this list?
                </p>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
                  placeholder="E.g., Reorder chronologically, Add bullet points, Combine similar items..."
                  disabled={isAILoading}
                />

                {isAILoading ? (
                  <LoadingAnimation />
                ) : (
                  <motion.button
                    className="mt-2 w-full bg-theme-primary text-white py-2 rounded flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAIEdit}
                    disabled={!prompt.trim()}
                  >
                    <FaPaperPlane className="mr-2" size={12} />
                    Edit with AI
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NoteBlock>
  );
}
