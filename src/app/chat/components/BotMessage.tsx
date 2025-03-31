"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function BotMessage({ text }: { text: string }) {
  const [staticText, setStaticText] = useState(text);
  const [newPortion, setNewPortion] = useState("");
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (text.length > prevTextRef.current.length) {
      const diff = text.slice(prevTextRef.current.length);
      setNewPortion(diff);
      const timer = setTimeout(() => {
        setStaticText(text);
        setNewPortion("");
        prevTextRef.current = text;
      }, 200);
      return () => clearTimeout(timer);
    }
    if (text.length < prevTextRef.current.length) {
      setStaticText(text);
      setNewPortion("");
      prevTextRef.current = text;
    }
  }, [text]);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            if (!match) {
              return (
                <code className="bg-opacity-30 bg-gray-700 text-sm rounded px-1 py-0.5" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="bg-[#1A1A2E] my-4 rounded-lg overflow-hidden">
                <div className="bg-[#16162A] px-4 py-1 text-xs text-gray-400 font-mono border-b border-gray-800">
                  {match[1]}
                </div>
                <pre className="p-4 overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          a({ node, children, href, ...props }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-500 underline transition-colors duration-200" 
                {...props}
              >
                {children}
              </a>
            );
          },
          p({ node, children, ...props }) {
            return (
              <p className="mb-4 last:mb-0" {...props}>
                {children}
              </p>
            );
          },
          ul({ node, children, ...props }) {
            return (
              <ul className="mb-4 pl-6 list-disc" {...props}>
                {children}
              </ul>
            );
          },
          ol({ node, children, ...props }) {
            return (
              <ol className="mb-4 pl-6 list-decimal" {...props}>
                {children}
              </ol>
            );
          },
          li({ node, children, ...props }) {
            return (
              <li className="mb-1" {...props}>
                {children}
              </li>
            );
          },
          h1({ node, children, ...props }) {
            return (
              <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>
                {children}
              </h1>
            );
          },
          h2({ node, children, ...props }) {
            return (
              <h2 className="text-xl font-bold mt-6 mb-3" {...props}>
                {children}
              </h2>
            );
          },
          h3({ node, children, ...props }) {
            return (
              <h3 className="text-lg font-bold mt-5 mb-2" {...props}>
                {children}
              </h3>
            );
          }
        }}
      >
        {staticText}
      </ReactMarkdown>
      {newPortion && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {newPortion}
        </motion.span>
      )}
    </div>
  );
}