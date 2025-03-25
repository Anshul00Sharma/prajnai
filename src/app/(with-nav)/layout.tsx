"use client";

import { NavBar } from "@/components/layout/nav-bar";
import { CreditProvider } from "@/contexts/credit-context";
import { PageTransition } from "@/components/transitions/page-transition";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

import { useState } from "react";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CreditProvider>
        <Sidebar isCollapsed={isCollapsed} onCollapsedChange={setIsCollapsed} />
        <div
          className={`transition-[justify-content] duration-300 ease-in-out h-screen w-full bg-white p-0 lg:p-8 flex items-center justify-center overflow-hidden ${
            isCollapsed ? "lg:justify-center" : "lg:justify-end"
          } `}
        >
          <div className="w-full h-screen lg:w-[80%] lg:h-[95vh] bg-theme-light lg:rounded-3xl lg:shadow-xl relative overflow-hidden border border-theme-primary/20">
            <NavBar />
            <div className="absolute inset-x-0 top-0 bottom-0 pb-14 lg:pb-0 overflow-y-auto overflow-x-hidden">
              <div className="px-4 lg:px-8">
                <PageTransition>{children}</PageTransition>
              </div>
            </div>
            <BottomNav />
          </div>
        </div>
      </CreditProvider>
    </div>
  );
}
