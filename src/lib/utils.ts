export type Theme = "dark" | "light";

export interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  preview: string;
}

export interface Message {
  id: string; // Added id property
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  animation?: {
    jobId: string;
    videoUrl?: string;
    status?: "loading" | "complete" | "error";
    error?: string;
  };
}

export function getCurrentDateTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getFormattedDate(): string {
  // Format current date as YYYY-MM-DD
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getFullDateTime(): string {
  // Format as YYYY-MM-DD HH:MM:SS
  const now = new Date();
  return `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
}

export function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

// Add the generateMessageId function
export function generateMessageId(): string {
  return 'msg_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);
}

export const getThemeClasses = (theme: Theme) => {
  return theme === "dark" 
    ? {
        bg: "bg-slate-900",
        header: "bg-slate-800",
        sidebar: "bg-slate-900",
        chatBg: "bg-slate-800",
        userMessage: "bg-slate-700",
        botMessage: "bg-slate-800",
        input: "bg-slate-700 border-slate-600",
        text: "text-white",
        textSecondary: "text-slate-300",
        textMuted: "text-slate-400",
        hover: "hover:bg-slate-700",
        button: "bg-blue-600 hover:bg-blue-700",
        buttonSecondary: "bg-slate-700 hover:bg-slate-600",
        gradientStart: "from-slate-900",
        iconBg: "bg-slate-700",
        border: "border-slate-600",
        boxShadow: "shadow-md shadow-black/20",
      }
    : {
        bg: "bg-gray-50",
        header: "bg-white",
        sidebar: "bg-white",
        chatBg: "bg-gray-50",
        userMessage: "bg-blue-50",
        botMessage: "bg-white",
        input: "bg-white border-gray-200",
        text: "text-gray-900",
        textSecondary: "text-gray-700",
        textMuted: "text-gray-500",
        hover: "hover:bg-gray-100",
        button: "bg-blue-600 hover:bg-blue-700",
        buttonSecondary: "bg-gray-200 hover:bg-gray-300 text-gray-700",
        gradientStart: "from-gray-50",
        iconBg: "bg-gray-200",
        border: "border-gray-200",
        boxShadow: "shadow-md shadow-gray-200/50",
      };
};