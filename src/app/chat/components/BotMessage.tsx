"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs, vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiCopy, FiCheck } from "react-icons/fi";
import "katex/dist/katex.min.css";

interface BotMessageProps {
  text: string;
  theme?: "dark" | "light";
  animation?: {
    jobId: string;
    videoUrl?: string;
    status?: "loading" | "complete" | "error";
    error?: string;
  };
}

export function BotMessage({ text, theme = "dark", animation }: BotMessageProps) {
  const [staticText, setStaticText] = useState(text);
  const [newPortion, setNewPortion] = useState("");
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const prevTextRef = useRef(text);
  const isDarkMode = theme === "dark";

  useEffect(() => {
    if (text.length > prevTextRef.current.length) {
      const diff = text.slice(prevTextRef.current.length);
      setNewPortion(diff);
      
      // Update static text immediately for most of the content
      // but keep a very small delay to create a subtle typing effect
      const timer = setTimeout(() => {
        setStaticText(text);
        setNewPortion("");
      }, 50); // Ultra-responsive 50ms delay for smoother streaming
      
      return () => clearTimeout(timer);
    } else {
      // If text is completely replaced or shortened
      setStaticText(text);
      setNewPortion("");
    }
    prevTextRef.current = text;
  }, [text]);

  // Function to copy code to clipboard
  const copyToClipboard = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(prev => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [index]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bot-message prose dark:prose-invert">
      {animation && (
        <div className={`animation-container my-4 rounded-lg overflow-hidden ${
          isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
        }`}>
          {animation.status === "loading" && (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-12 h-12 border-4 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin"></div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Generating your animation... This may take up to 30 seconds.
              </p>
            </div>
          )}
          
          {animation.status === "error" && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
              <p className="font-medium">Error generating animation</p>
              <p className="text-sm">{animation.error || "An unknown error occurred"}</p>
            </div>
          )}
          
          {animation.status === "complete" && animation.videoUrl && (
            <div className="animation-video">
              <video 
                src={animation.videoUrl} 
                controls 
                autoPlay 
                loop
                className="w-full rounded-lg"
                poster="/assets/animation-poster.png"
              />
              <div className={`p-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Animation ID: {animation.jobId}
              </div>
            </div>
          )}
        </div>
      )}
      
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: { 
            node: any; 
            inline?: boolean; 
            className?: string; 
            children: React.ReactNode;
            [key: string]: any;
          }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeIndex = inline ? -1 : Math.random();
            
            return !inline ? (
              <div className="relative group">
                <div className={`absolute right-2 top-2 ${
                  isDarkMode ? 'bg-slate-800/70' : 'bg-slate-50/70'
                } backdrop-blur-sm rounded p-1`}>
                  <button
                    onClick={() => copyToClipboard(String(children), codeIndex)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                    }`}
                    aria-label="Copy code"
                  >
                    {copied[codeIndex] ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-green-500"
                      >
                        <FiCheck size={16} />
                      </motion.div>
                    ) : (
                      <FiCopy size={16} className={
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      } />
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  language={language}
                  style={isDarkMode ? vscDarkPlus : vs}
                  customStyle={{
                    borderRadius: '0.5rem',
                    marginTop: '1em',
                    marginBottom: '1em',
                    padding: '1rem',
                    fontSize: '0.875rem',
                    background: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.8)',
                    border: `1px solid ${isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'}`,
                    boxShadow: isDarkMode 
                      ? '0 2px 10px rgba(0, 0, 0, 0.2)' 
                      : '0 2px 10px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className={`${className} px-1.5 py-0.5 rounded ${
                  isDarkMode 
                    ? 'bg-slate-800/50 text-pink-400' 
                    : 'bg-slate-100 text-pink-600'
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ node, children }) {
            return <p className="mb-4 last:mb-0">{children}</p>;
          },
          ul({ node, children }) {
            return <ul className="mb-4 list-disc pl-6 space-y-2">{children}</ul>;
          },
          ol({ node, children }) {
            return <ol className="mb-4 list-decimal pl-6 space-y-2">{children}</ol>;
          },
          li({ node, children }) {
            return <li className="marker:text-indigo-500">{children}</li>;
          },
          a({ node, href, children }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-blue-500 hover:text-blue-600 underline transition-colors`}
              >
                {children}
              </a>
            );
          },
          h1({ node, children }) {
            return <h1 className="text-2xl font-bold mt-6 mb-4 border-b pb-2">{children}</h1>;
          },
          h2({ node, children }) {
            return <h2 className="text-xl font-bold mt-6 mb-3">{children}</h2>;
          },
          h3({ node, children }) {
            return <h3 className="text-lg font-bold mt-5 mb-3">{children}</h3>;
          },
          blockquote({ node, children }) {
            return (
              <blockquote className={`border-l-4 ${
                isDarkMode ? 'border-indigo-700 bg-slate-800/30' : 'border-indigo-300 bg-indigo-50/50'
              } pl-4 py-1 pr-2 my-4 italic`}>
                {children}
              </blockquote>
            );
          },
          table({ node, children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-gray-200 border">{children}</table>
              </div>
            );
          },
          th({ node, children }) {
            return <th className={`px-3 py-2 text-left text-sm font-medium ${
              isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
            }`}>{children}</th>;
          },
          td({ node, children }) {
            return <td className="px-3 py-2 text-sm border-t">{children}</td>;
          },
        }}
      >
        {staticText}
      </ReactMarkdown>
      {newPortion && (
        <span className="text-indigo-500 dark:text-indigo-400 stream-text">
          {newPortion}
        </span>
      )}
      
      <style jsx global>{`
        .bot-message {
          max-width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        
        .bot-message img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 1rem 0;
        }
        
        .bot-message pre {
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          overflow: visible !important;
        }
        
        .bot-message table {
          border-collapse: collapse;
          width: 100%;
        }
        
        .stream-text {
          position: relative;
          border-right: 2px solid ${isDarkMode ? 'rgba(139, 92, 246, 0.7)' : 'rgba(99, 102, 241, 0.7)'};
          animation: streamCursor 0.8s step-end infinite;
        }

        @keyframes streamCursor {
          0%, 100% { border-color: transparent; }
          50% { border-color: ${isDarkMode ? 'rgba(139, 92, 246, 0.7)' : 'rgba(99, 102, 241, 0.7)'}; }
        }
      `}</style>
    </div>
  );
}