"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Frontend validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Register with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.user) {
        console.log("Registration successful:", data.user);

        // Store user ID in localStorage for compatibility with existing code
        const userId = data.user.id;
        localStorage.setItem("userId", userId);

        try {
          // Create a new subject for the user
          const newSubject = {
            id: crypto.randomUUID(),
            user_id: userId,
          };

          const createResponse = await fetch("/api/subject", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newSubject),
          });

          if (!createResponse.ok) {
            console.error(
              "Failed to create subject:",
              await createResponse.text()
            );
          } else {
            console.log("Subject created successfully");
          }
        } catch (subjectError) {
          console.error("Error creating subject:", subjectError);
          // Continue with registration flow even if subject creation fails
        }

        try {
          // Initialize user credits
          const creditResponse = await fetch(`/api/credit/${userId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ credit: 50 }),
          });

          if (!creditResponse.ok) {
            console.error(
              "Failed to initialize credits:",
              await creditResponse.text()
            );
          } else {
            console.log("Credits initialized successfully");
          }
        } catch (creditError) {
          console.error("Error initializing credits:", creditError);
          // Continue with registration flow even if credit initialization fails
        }

        // Redirect to home page or confirmation page
        router.push("/subject");
      } else {
        // This might happen if email confirmation is required
        setError(
          "Registration successful. Please check your email to confirm your account."
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-full bg-theme-light flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-theme-primary"
          >
            Prajna
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-theme-primary/70"
          >
            Create your account
          </motion.p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 bg-red-100 text-red-700 rounded-md"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-theme-primary mb-1"
            >
              Full Name
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-theme-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-theme-primary mb-1"
            >
              Email
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-theme-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-theme-primary mb-1"
            >
              Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-theme-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <p className="text-xs text-theme-primary/60 mt-1">
              Password must be at least 6 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-theme-primary mb-1"
            >
              Confirm Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-theme-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-theme-primary text-theme-light rounded-md shadow-sm hover:bg-theme-primary/90 transition-colors text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-theme-light border-t-transparent rounded-full animate-spin"></div>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-theme-primary/70">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-theme-primary hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
