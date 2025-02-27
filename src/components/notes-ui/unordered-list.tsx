"use client";

import { useState } from "react";

import NoteBlock from "./note-block";
import UnorderedListItem from "./unordered-list-item";

interface ListItem {
  id: string;
  content: string;
}

interface UnorderedListProps {
  id: string;
  initialItems?: ListItem[];
  isEditing?: boolean;
  onDelete?: () => void;
  onItemsChange?: (items: ListItem[]) => void;
}

export default function UnorderedList({
  id,
  initialItems = [{ id: "0", content: "List item" }],
  isEditing = false,
  onDelete,
  onItemsChange,
}: UnorderedListProps) {
  const [items, setItems] = useState<ListItem[]>(initialItems);

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

  // View-only version of list item
  const ViewOnlyListItem = ({ content }: { content: string }) => (
    <li className="flex items-start mb-1">
      <span className="text-theme-primary mr-2 mt-1">•</span>
      <span className="flex-1 text-theme-primary/90 py-0.5 px-1">
        {content}
      </span>
    </li>
  );

  return (
    <NoteBlock id={id} type="Unordered List" onDelete={onDelete}>
      <div className="px-2 py-1">
        <ul className="ml-2">
          {items.map((item) => (
            isEditing ? (
              <UnorderedListItem
                key={item.id}
                id={item.id}
                initialContent={item.content}
                onDelete={() => handleDeleteItem(item.id)}
                onContentChange={handleItemContentChange}
              />
            ) : (
              <ViewOnlyListItem key={item.id} content={item.content} />
            )
          ))}
        </ul>
        {isEditing && (
          <button
            className="text-sm text-theme-primary/70 hover:text-theme-primary mt-1 flex items-center transition-colors"
            onClick={handleAddItem}
          >
            <span className="mr-1">+</span> Add item
          </button>
        )}
      </div>
    </NoteBlock>
  );
}
