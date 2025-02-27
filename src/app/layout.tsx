import type { Metadata } from "next";
import { domine } from "./fonts";
import { Inter } from "next/font/google";
import "./globals.css";
import { SubjectProvider } from "@/contexts/subject-context";
import { UploadProvider } from "@/contexts/upload-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrajnAI",
  description: "Your AI Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${domine.className} ${inter.className} antialiased bg-theme-light`}>
        <SubjectProvider>
          <UploadProvider>{children}</UploadProvider>
        </SubjectProvider>
      </body>
    </html>
  );
}
