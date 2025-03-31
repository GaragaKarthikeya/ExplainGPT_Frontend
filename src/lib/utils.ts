export type Theme = "dark" | "light";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  preview: string;
}

export function getCurrentDateTime(): string {
  return "2025-03-31 00:04:15";
}

export function getTimeFromDateTime(datetime: string): string {
  return datetime.split(' ')[1].substring(0, 5); // HH:MM format
}

export function getFormattedDate(): string {
  return "2025-03-31";
}

export function getRelativeDate(dateString: string): string {
  const today = "2025-03-31";
  const yesterday = "2025-03-30";
  
  if (dateString.startsWith(today)) return "Today";
  if (dateString.startsWith(yesterday)) return "Yesterday";
  
  // For demo purposes - actual implementation would calculate real relative dates
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const getThemeClasses = (theme: Theme) => {
  return theme === "dark" 
    ? {
        bg: "bg-[#0F172A]", // Changed to a deeper blue for premium look
        header: "bg-[#1E293B]",
        sidebar: "bg-[#1E293B]",
        chatBg: "bg-[#0F172A]",
        userMessage: "bg-[#334155]",
        botMessage: "bg-[#1E293B]",
        input: "bg-[#334155] border-[#475569]",
        text: "text-white",
        textSecondary: "text-slate-300",
        textMuted: "text-slate-400",
        hover: "hover:bg-[#334155]",
        button: "bg-indigo-600 hover:bg-indigo-700",
        buttonSecondary: "bg-slate-700 hover:bg-slate-600",
        gradientStart: "from-[#0F172A]",
        iconBg: "bg-[#334155]",
        border: "border-[#334155]",
      }
    : {
        bg: "bg-gray-50",
        header: "bg-white",
        sidebar: "bg-white",
        chatBg: "bg-gray-50",
        userMessage: "bg-indigo-50",
        botMessage: "bg-white",
        input: "bg-white border-gray-200",
        text: "text-gray-900",
        textSecondary: "text-gray-700",
        textMuted: "text-gray-500",
        hover: "hover:bg-gray-100",
        button: "bg-indigo-600 hover:bg-indigo-700",
        buttonSecondary: "bg-gray-200 hover:bg-gray-300 text-gray-700",
        gradientStart: "from-gray-50",
        iconBg: "bg-gray-200",
        border: "border-gray-200",
      };
};

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}