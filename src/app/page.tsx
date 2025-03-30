import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold">ExplainGPT is Live! 🚀</h1>
      <Link href="/chat">
        <button className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-md text-lg">
          Try Chatbot 💬
        </button>
      </Link>
    </main>
  );
}
