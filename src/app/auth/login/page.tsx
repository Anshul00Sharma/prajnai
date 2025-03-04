"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Frontend validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      // Sign in with Supabase
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (data?.user) {
        console.log("Login successful:", data.user);

        // Store user ID in localStorage for compatibility with existing code
        localStorage.setItem("userId", data.user.id);

        // Redirect to home page
        router.push("/subject");
      } else {
        throw new Error("Login failed. No user data returned.");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials and try again."
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
            Sign in to your account
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
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/auth/reset-password")}
              className="text-sm text-theme-primary hover:underline"
            >
              Forgot password?
            </button>
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-theme-primary/70">
            {"Don't"} have an account?{" "}
            <Link
              href="/auth/register"
              className="text-theme-primary hover:underline font-semibold"
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
