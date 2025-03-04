"use client";

import { useRouter } from "next/navigation";
import { hasUserId } from "@/utils/local-storage";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      // If user is not logged in, redirect to login page
      const userLoggedIn = await hasUserId();
      console.log("User logged in:", userLoggedIn);
      if (!userLoggedIn) {
        router.push("/auth/login");
        return;
      }

      // Navigate to the subject page
      router.push("/subject");
    } catch (error) {
      console.error("Error:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-light overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 rounded-full bg-theme-primary/10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-40 right-10 w-40 h-40 rounded-full bg-theme-primary/20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-theme-primary/10"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 h-screen flex flex-col items-center justify-center relative z-10">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-6xl md:text-7xl lg:text-8xl font-bold text-theme-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span
                className="inline-block relative group"
                aria-label="It means wisdom in Sanskrit"
              >
                Prajñā
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-theme-primary text-theme-light text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  It means wisdom in Sanskrit
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-theme-primary"></span>
                </span>
              </span>
              <motion.span
                className="text-7xl text-theme-accent inline-block ml-2"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                AI
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-theme-primary/80 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Transform your learning experience with AI-powered study tools
              designed to enhance comprehension and retention.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <motion.button
                onClick={handleStart}
                disabled={isLoading}
                className="px-8 py-4 bg-theme-primary text-theme-light rounded-lg shadow-lg hover:shadow-xl hover:bg-theme-primary/90 transition-all text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 w-64 justify-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-theme-light border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  "Get Started"
                )}
              </motion.button>

              <motion.a
                href="#features"
                className="px-8 py-4 bg-transparent border-2 border-theme-primary text-theme-primary rounded-lg hover:bg-theme-primary/5 transition-all text-lg font-semibold w-64 text-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{
              opacity: { delay: 1.2, duration: 0.7 },
              y: { delay: 1.2, duration: 2, repeat: Infinity },
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-theme-primary/60"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <FeatureSectionTitle />

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            <FeatureCard
              title="AI-Generated Notes"
              description="Create highly customizable AI-generated notes from your study material. Organize information effectively and focus on what matters most."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M10 13l-2 2 2 2" />
                  <path d="M14 17l2-2-2-2" />
                </svg>
              }
              index={0}
            />

            <FeatureCard
              title="AI Chat Assistant"
              description="Chat with your notes using our AI-powered assistant. Ask questions, seek clarification, and deepen your understanding through interactive conversations."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 9h.01" />
                  <path d="M12 9h.01" />
                  <path d="M16 9h.01" />
                </svg>
              }
              index={1}
            />

            <FeatureCard
              title="Smart Flashcards"
              description="Generate comprehensive flashcards from your notes to reinforce key concepts and improve retention through active recall and spaced repetition."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M8 12h8" />
                </svg>
              }
              index={2}
            />

            <FeatureCard
              title="AI-Generated Exams"
              description="Test your knowledge with personalized AI-generated exams tailored to your learning progress, helping you identify strengths and areas for improvement."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
              index={3}
            />
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-1/2 left-0 w-40 h-40 bg-theme-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 z-0"></div>
        <div className="absolute bottom-20 right-0 w-60 h-60 bg-theme-primary/5 rounded-full translate-x-1/3 z-0"></div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-theme-primary text-theme-light">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm md:text-base">
            &copy; {new Date().getFullYear()} Prajna AI. All Rights Reserved.
            Created by ANSHUL SHARMA
          </p>
        </div>
      </footer>
    </div>
  );
}

// Feature Section Title Component
function FeatureSectionTitle() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div ref={ref} className="text-center max-w-3xl mx-auto">
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.h2
          variants={titleVariants}
          className="text-4xl md:text-5xl font-bold text-theme-primary mb-4"
        >
          Smart Learning Features
        </motion.h2>
        <motion.div
          variants={titleVariants}
          className="h-1 w-20 bg-theme-primary mx-auto mb-6"
        />
        <motion.p
          variants={titleVariants}
          className="text-xl text-theme-primary/70"
        >
          Accelerate your learning with our suite of AI-powered tools designed
          for modern students
        </motion.p>
      </motion.div>
    </div>
  );
}

// Feature Card Component Props Interface
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

// Feature Card Component
function FeatureCard({ title, description, icon, index }: FeatureCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1 + 0.2,
        ease: "easeOut",
      }}
      className="bg-white rounded-xl shadow-lg p-8 relative z-10 hover:shadow-xl transition-shadow border border-theme-primary/10"
    >
      <div className="mb-6 text-theme-primary">{icon}</div>
      <h3 className="text-2xl font-bold text-theme-primary mb-4">{title}</h3>
      <p className="text-theme-primary/70">{description}</p>

      <motion.div
        className="absolute top-0 right-0 mt-6 mr-6 bg-theme-primary/10 rounded-full w-12 h-12 flex items-center justify-center text-theme-primary font-bold"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1, rotate: 360 } : { scale: 0 }}
        transition={{ delay: index * 0.1 + 0.4, type: "spring" }}
      >
        {index + 1}
      </motion.div>
    </motion.div>
  );
}
