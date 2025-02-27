"use client";

import { useState } from "react";
import { FaCode } from "react-icons/fa";
import NoteBlock from "./note-block";

interface CodeBlockProps {
  id: string;
  initialCode?: string;
  initialLanguage?: string;
  onDelete?: () => void;
  onCodeChange?: (code: string, language: string) => void;
}

export default function CodeBlock({
  id,
  initialCode = "// Write your code here",
  initialLanguage = "javascript",
  onDelete,
  onCodeChange,
}: CodeBlockProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isEditing, setIsEditing] = useState(false);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange?.(newCode, language);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    onCodeChange?.(code, newLanguage);
  };

  // Languages for dropdown
  const languages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c",
    "cpp",
    "csharp",
    "go",
    "ruby",
    "rust",
    "php",
    "html",
    "css",
    "json",
    "markdown",
    "bash",
    "sql",
  ];

  return (
    <NoteBlock
      id={id}
      type="Code Block"
      icon={<FaCode size={14} />}
      onDelete={onDelete}
    >
      <div className="px-2 py-1">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="px-3 py-1.5 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary/20 text-sm bg-theme-light text-theme-primary"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              <button
                className="px-4 py-1.5 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors text-sm"
                onClick={() => setIsEditing(false)}
              >
                Done
              </button>
            </div>
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="w-full px-4 py-3 bg-theme-primary/5 text-theme-primary/90 font-mono text-sm rounded-lg border border-theme-primary/10 focus:border-theme-primary/30 focus:outline-none min-h-[150px] resize-y"
              autoFocus
              spellCheck={false}
            />
          </div>
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            <div className="flex items-center justify-between py-1 px-3 bg-theme-primary/10 text-theme-primary rounded-t-lg text-xs">
              <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
              <button
                className="text-theme-primary/70 hover:text-theme-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <FaCode size={12} />
              </button>
            </div>
            <pre className="bg-theme-primary/5 p-3 rounded-b-lg overflow-x-auto text-sm text-theme-primary/90 font-mono">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </NoteBlock>
  );
}
