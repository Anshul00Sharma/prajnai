"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import {
  MdSend,
  MdClose,
  MdRocketLaunch,
  MdMic,
  MdVolumeUp,
  MdVolumeOff,
} from "react-icons/md";
// import { FaRobot } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentPropsWithoutRef } from "react";
import Image from "next/image";
import AI_image from "../../../public/ai_tutor.png";

interface ChatMessage {
  id?: string;
  text: string;
  sender: "user" | "ai";
  timestamp?: string;
  isPlaying?: boolean;
}

interface ChatApiResponse {
  messages: {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: string;
  }[];
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessages?: ChatMessage[];
  noteId?: string;
}

export default function Chatbot({
  isOpen,
  onClose,
  initialMessages = [],
  noteId,
}: ChatbotProps) {
  // State management
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialMessages.length > 0 ? initialMessages : []
  );
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load chat history from the API
  const loadChatHistory = useCallback(async () => {
    if (!noteId || hasLoadedHistory) return;

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("noteId", noteId);

      const response = await fetch(`/api/chat?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch chat history");
      }

      const data = (await response.json()) as ChatApiResponse;
      if (data.messages && data.messages.length > 0) {
        // Sort messages by timestamp for proper display
        const sortedMessages = data.messages
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          .map((msg) => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp,
            isPlaying: false,
          }));

        setChatMessages(sortedMessages);
      } else {
        // Set default welcome message if no messages exist
        setChatMessages([
          {
            id: uuidv4(),
            text: "Hello! I'm your AI assistant. How can I help with your notes today?",
            sender: "ai",
            timestamp: new Date().toISOString(),
            isPlaying: false,
          },
        ]);
      }

      // Mark that we've loaded history
      setHasLoadedHistory(true);
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Show error message
      setChatMessages([
        {
          id: uuidv4(),
          text:
            error instanceof Error
              ? `Error loading chat history: ${error.message}`
              : "Failed to load chat history",
          sender: "ai",
          timestamp: new Date().toISOString(),
          isPlaying: false,
        },
      ]);

      // Still mark as loaded even if there was an error
      setHasLoadedHistory(true);
    }
  }, [noteId, hasLoadedHistory]);

  // Load initial chat history when the chatbot is opened
  useEffect(() => {
    if (isOpen && !hasLoadedHistory) {
      loadChatHistory();
    }
  }, [isOpen, loadChatHistory, hasLoadedHistory]);

  // Reset loaded history state when the chatbot is closed
  useEffect(() => {
    if (!isOpen) {
      setHasLoadedHistory(false);
    }
  }, [isOpen]);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Function to generate a new user message
  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      text,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    return newMessage;
  };

  // Function to generate a new AI message
  const addAIMessage = (text: string, id: string) => {
    const newMessage: ChatMessage = {
      id,
      text,
      sender: "ai",
      timestamp: new Date().toISOString(),
      isPlaying: false,
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Function to handle sending a chat message
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    // Add user message to the local state immediately
    const userMessage = addUserMessage(currentMessage);

    // Clear input and show typing indicator
    setCurrentMessage("");
    setIsTyping(true);

    try {
      // setIsLoading(true);

      // Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          noteId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      // Get AI response and add it to local state (no need to reload all messages)
      const aiMessageData = await response.json();
      addAIMessage(aiMessageData.text, aiMessageData.id);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message directly to local state
      setChatMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          text: "Sorry, I encountered an error processing your request. Please try again later.",
          sender: "ai",
          timestamp: new Date().toISOString(),
          isPlaying: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Start text-to-speech for an AI message
  const startTextToSpeech = (text: string, messageId: string) => {
    // In a real implementation, we'd connect to a TTS service here
    console.log(`Starting TTS for message ${messageId}: ${text}`);
    alert("This is a placeholder for text-to-speech functionality!");

    // Toggle speech for the message
    toggleSpeech(messageId);
  };

  // Toggle speech for AI message
  const toggleSpeech = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isPlaying: !msg.isPlaying } : msg
      )
    );
  };

  // Toggle microphone listening state
  const toggleListening = () => {
    if (isListening) {
      // If we were listening, stop and simulate sending the captured audio as a message
      setIsListening(false);

      // Simulate processing the voice input after a short delay
      setTimeout(() => {
        const userMessage: ChatMessage = {
          id: uuidv4(),
          text: "This is simulated voice input. In a real implementation, this would be the transcribed text from your speech.",
          sender: "user",
          timestamp: new Date().toISOString(),
        };

        setChatMessages((prev) => [...prev, userMessage]);

        // Simulate AI thinking
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: uuidv4(),
            text: "I've received your voice message. In a real implementation, I would process this and respond accordingly!",
            sender: "ai",
            timestamp: new Date().toISOString(),
            isPlaying: false,
          };

          setChatMessages((prev) => [...prev, aiMessage]);
          setIsTyping(false);
        }, 1500);
      }, 500);
    } else {
      // Start listening
      setIsListening(true);
    }
  };

  // Function to scroll to the bottom of the chat
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  if (!isOpen) return null;

  return (
    <motion.div
      className={`fixed ${
        isMobile
          ? "inset-0 w-full h-full rounded-none"
          : "bottom-4 right-4 w-[550px]  h-[800px] rounded-2xl"
      } bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 backdrop-blur-sm shadow-xl border border-theme-primary/20 z-50 flex flex-col overflow-hidden`}
      initial={{ opacity: 0, y: isMobile ? 20 : 20, scale: isMobile ? 1 : 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isMobile ? 20 : 20, scale: isMobile ? 1 : 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Chat Header */}
      <div className="bg-theme-primary text-white px-4 pt-2 pb-2 flex justify-between items-center">
        <div className="flex items-center gap-2 ">
          <motion.div
            className="bg-white/20 rounded-full p-1.5 overflow-hidden"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(255,255,255,0.4)",
                "0 0 0 10px rgba(255,255,255,0)",
                "0 0 0 0 rgba(255,255,255,0)",
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
          >
            {/* <FaRobot size={isMobile ? 22 : 18} />
             */}
            <Image
              src={AI_image}
              alt="AI Tutor"
              width={40}
              height={40}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "contain", scale: 1.4 }}
              className="mt-2"
            />
          </motion.div>
          <span className={`font-semibold ${isMobile ? "text-lg" : ""}`}>
            AI Assistant
          </span>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="hover:bg-white/20 rounded-full p-1.5 transition"
        >
          <MdClose size={isMobile ? 24 : 18} />
        </motion.button>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 ${
          isMobile ? "pb-24" : ""
        } space-y-4 scrollbar-thin scrollbar-thumb-theme-primary/20 scrollbar-track-transparent`}
      >
        {
          // isLoading ? (
          //   <div className="flex justify-center items-center h-full">
          //     <div className="flex gap-1.5 items-center">
          //       <motion.div
          //         className="w-3 h-3 bg-theme-primary rounded-full"
          //         animate={{ y: [0, -5, 0] }}
          //         transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
          //       />
          //       <motion.div
          //         className="w-3 h-3 bg-theme-primary rounded-full"
          //         animate={{ y: [0, -5, 0] }}
          //         transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
          //       />
          //       <motion.div
          //         className="w-3 h-3 bg-theme-primary rounded-full"
          //         animate={{ y: [0, -5, 0] }}
          //         transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
          //       />
          //     </div>
          //   </div>
          // ) : (
          chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`flex  ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  message.sender === "user"
                    ? "bg-theme-primary text-white rounded-tr-none"
                    : "bg-white shadow-md rounded-tl-none"
                } ${isMobile ? "text-base p-4" : ""} relative`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div
                    className={`font-medium ${
                      message.sender === "user"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {message.sender === "user" ? "You" : "AI Assistant"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {message.timestamp
                      ? new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="prose dark:prose-invert max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({
                          inline,
                          className,
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"code"> & {
                          inline?: boolean;
                          className?: string;
                        }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <pre className="p-2 rounded overflow-auto">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        a({
                          children,
                          href,
                          ...props
                        }: ComponentPropsWithoutRef<"a">) {
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                              {...props}
                            >
                              {children}
                            </a>
                          );
                        },
                        p({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"p">) {
                          return (
                            <p className="mb-2 last:mb-0" {...props}>
                              {children}
                            </p>
                          );
                        },
                        ul({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"ul">) {
                          return (
                            <ul className="list-disc pl-5 mb-2" {...props}>
                              {children}
                            </ul>
                          );
                        },
                        ol({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"ol">) {
                          return (
                            <ol className="list-decimal pl-5 mb-2" {...props}>
                              {children}
                            </ol>
                          );
                        },
                        li({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"li">) {
                          return (
                            <li className="mb-1" {...props}>
                              {children}
                            </li>
                          );
                        },
                        blockquote({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"blockquote">) {
                          return (
                            <blockquote
                              className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic text-gray-600 dark:text-gray-300"
                              {...props}
                            >
                              {children}
                            </blockquote>
                          );
                        },
                        h1({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"h1">) {
                          return (
                            <h1 className="text-xl font-bold mb-2" {...props}>
                              {children}
                            </h1>
                          );
                        },
                        h2({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"h2">) {
                          return (
                            <h2 className="text-lg font-bold mb-2" {...props}>
                              {children}
                            </h2>
                          );
                        },
                        h3({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"h3">) {
                          return (
                            <h3 className="text-md font-bold mb-1" {...props}>
                              {children}
                            </h3>
                          );
                        },
                        table({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"table">) {
                          return (
                            <div className="overflow-x-auto">
                              <table
                                className="min-w-full border-collapse border border-gray-300 dark:border-gray-600"
                                {...props}
                              >
                                {children}
                              </table>
                            </div>
                          );
                        },
                        th({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"th">) {
                          return (
                            <th
                              className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-700"
                              {...props}
                            >
                              {children}
                            </th>
                          );
                        },
                        td({
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<"td">) {
                          return (
                            <td
                              className="border border-gray-300 dark:border-gray-600 px-2 py-1"
                              {...props}
                            >
                              {children}
                            </td>
                          );
                        },
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Time and TTS button for AI messages */}
                <div className="flex justify-between items-center mt-1">
                  <p
                    className={`${isMobile ? "text-sm" : "text-xs"} opacity-70`}
                  >
                    {message.timestamp
                      ? new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>

                  {message.sender === "ai" && (
                    <motion.button
                      onClick={() =>
                        message.id &&
                        startTextToSpeech(message.text, message.id)
                      }
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-1 rounded-full ml-2 transition-colors ${
                        message.isPlaying
                          ? "text-theme-primary"
                          : "text-gray-400 hover:text-theme-primary"
                      }`}
                    >
                      {message.isPlaying ? (
                        <MdVolumeUp size={isMobile ? 18 : 14} />
                      ) : (
                        <MdVolumeOff size={isMobile ? 18 : 14} />
                      )}
                    </motion.button>
                  )}
                </div>
                {/* ----------------------------------------------- */}
                {/* High-tech speech animation for AI messages */}
                {message.sender === "ai" && message.isPlaying && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl rounded-tl-none ">
                    {/* Animated color-changing border */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl rounded-tl-none "
                      style={{
                        background:
                          "linear-gradient(90deg, #FF00FF, #00FFFF, #00FF00, #FFFF00, #FF00FF)",
                        backgroundSize: "500% 100%",
                        padding: "2px",
                      }}
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut",
                      }}
                    >
                      {/* Inner div to create border effect */}
                      <div className="w-full h-full bg-white  rounded-2xl rounded-tl-none "></div>
                    </motion.div>
                  </div>
                )}
                {/* ----------------------------------------------- */}
              </div>
            </motion.div>
          ))
          // )
        }

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div
              className={`bg-white rounded-2xl p-3 shadow-md rounded-tl-none max-w-[80%] ${
                isMobile ? "p-4" : ""
              }`}
            >
              <div className="flex gap-1.5 items-center h-6">
                <motion.div
                  className={`${
                    isMobile ? "w-3 h-3" : "w-2 h-2"
                  } bg-theme-primary rounded-full`}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                />
                <motion.div
                  className={`${
                    isMobile ? "w-3 h-3" : "w-2 h-2"
                  } bg-theme-primary rounded-full`}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                />
                <motion.div
                  className={`${
                    isMobile ? "w-3 h-3" : "w-2 h-2"
                  } bg-theme-primary rounded-full`}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Chat Input */}
      <div
        className={`p-3 bg-white border-t border-theme-primary/10 ${
          isMobile ? "fixed bottom-0 left-0 right-0 p-4 shadow-lg" : ""
        }`}
      >
        <div className="flex items-center gap-2 bg-theme-primary/5 rounded-full px-4 py-2">
          {/* Microphone button with listening animation */}
          <motion.button
            onClick={toggleListening}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`${
              isListening
                ? "text-red-500 bg-red-100"
                : "text-theme-primary hover:bg-theme-primary/10"
            } p-1.5 rounded-full transition-all duration-300`}
          >
            {isListening ? (
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
              >
                <MdMic size={isMobile ? 24 : 18} />
                {/* Sound wave animation rings */}
                <motion.div
                  className="absolute -inset-2 rounded-full border border-red-400 opacity-80"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 0, 0.7],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -inset-3 rounded-full border border-red-300 opacity-60"
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
              </motion.div>
            ) : (
              <MdMic size={isMobile ? 24 : 18} />
            )}
          </motion.button>

          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            onClick={scrollToBottom}
            placeholder={
              isListening ? "Listening..." : "Ask something about your notes..."
            }
            disabled={isListening}
            className={`flex-1 bg-transparent outline-none ${
              isMobile ? "text-base py-2" : "text-sm"
            } ${isListening ? "text-red-500 italic" : ""}`}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isListening}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`${
              currentMessage.trim() && !isListening
                ? "text-theme-primary hover:bg-theme-primary/10"
                : "text-gray-400"
            } p-1.5 rounded-full transition`}
          >
            <MdSend size={isMobile ? 24 : 18} />
          </motion.button>
        </div>

        {/* Listening indicator text */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center mt-2 text-xs text-red-500 font-medium"
          >
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Listening to your voice... Click the microphone again to stop
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Futuristic Decoration Elements */}
      <motion.div
        className="absolute top-12 right-2 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 z-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-16 left-4 text-theme-primary/10"
        animate={{
          opacity: [0.4, 0.8, 0.4],
          rotate: [0, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
      >
        <MdRocketLaunch size={24} />
      </motion.div>
    </motion.div>
  );
}
