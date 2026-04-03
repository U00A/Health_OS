"use client";

import React, { useState, ReactElement, ReactNode } from "react";

interface TabProps {
  children: ReactNode;
  title: string;
  key?: string;
}

interface TabsProps {
  children: ReactNode;
  "aria-label"?: string;
}

export function Tabs({ children, "aria-label": ariaLabel }: TabsProps) {
  // Extract all valid elements (Tabs)
  const tabs = React.Children.toArray(children).filter(
    (child): child is ReactElement => React.isValidElement(child)
  );
  
  // Use 'all' if present, else first tab's key
  const defaultKey = tabs.find((t) => t.key === "all")?.key || tabs[0]?.key || "";
  const [activeKey, setActiveKey] = useState(defaultKey);

  if (tabs.length === 0) return null;

  return (
    <div className="w-full">
      <div 
        className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar mb-4" 
        role="tablist" 
        aria-label={ariaLabel}
      >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        const tabTitle = (tab.props as { title?: string }).title;
        return (
          <button
            ref={(node) => {
              if (node && isActive) {
                // Ensure active tab scrolls into view on mount if needed
              }
            }}
            key={tab.key}
            onClick={() => setActiveKey(tab.key as string)}
            className={`pb-3 text-sm transition-colors whitespace-nowrap outline-none border-b-2 ${
              isActive 
                ? "border-blue-600 text-blue-600 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-medium"
            }`}
            role="tab"
            aria-selected={isActive}
          >
            {tabTitle}
          </button>
        );
      })}
      </div>
      <div className="pt-2">
        {(tabs.find((tab) => tab.key === activeKey)?.props as { children?: ReactNode })?.children}
      </div>
    </div>
  );
}

export function Tab({ children, title: _title }: { children?: ReactNode; title?: ReactNode }) {
  return <>{children}</>;
}
