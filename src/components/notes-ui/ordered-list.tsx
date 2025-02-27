"use client";

import { useState } from "react";
import NoteBlock from "./note-block";
import OrderedListItem from "./ordered-list-item";

interface ListItem {
  id: string;
  content: string;
}

interface OrderedListProps {
  id: string;
  initialItems?: ListItem[];
  isEditing?: boolean;
  onDelete?: () => void;
  onItemsChange?: (items: ListItem[]) => void;
}

export default function OrderedList({
  id,
  initialItems = [{ id: "0", content: "List item" }],
  isEditing = false,
  onDelete,
  onItemsChange,
}: OrderedListProps) {
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
      <div className="px-2 py-1">
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
