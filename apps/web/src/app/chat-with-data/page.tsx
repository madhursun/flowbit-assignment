"use client";
import React, { useState } from "react";
import axios from "axios";

// ✅ Define strong type
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWithDataPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat-with-data`, { question });
      const data = res.data;

      let content = "";
      if (data.error) {
        content = `⚠️ ${data.error}`;
      } else if (data.results?.length) {
        const keys = Object.keys(data.results[0]);
        const tableHTML = `
          <div class="overflow-x-auto mt-3 border rounded-lg">
            <table class="min-w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100 text-gray-700">
                  ${keys
                    .map((k) => `<th class="px-3 py-2 border">${k}</th>`)
                    .join("")}
                </tr>
              </thead>
              <tbody>
                ${data.results
                  .map(
                    (row: any, i: number) => `
                      <tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50"}">
                        ${keys
                          .map(
                            (k) =>
                              `<td class="px-3 py-2 border text-gray-800">${row[k]}</td>`
                          )
                          .join("")}
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;

        content = `
          <p class="text-xs text-gray-500 mb-2">SQL generated:</p>
          <pre class="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto mb-4">${data.sql}</pre>
          <p class="text-xs text-gray-500 mb-1">Results:</p>${tableHTML}`;
      } else {
        content = "No results found.";
      }

      const assistantMessage: Message = { role: "assistant", content };
      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat error:", err.message);
      setMessages((prev: Message[]) => [
        ...prev,
        { role: "assistant", content: "❌ Failed to connect to AI service." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">
        💬 Chat with Your Data
      </h1>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 h-[70vh] overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm">
            Start by asking something like:{" "}
            <span className="italic text-gray-700">
              “Show total spend by vendor”
            </span>
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-5 flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-gray-50 text-gray-800 rounded-bl-none border border-gray-200"
              }`}
              dangerouslySetInnerHTML={{ __html: msg.content }}
            />
          </div>
        ))}

        {loading && (
          <div className="text-gray-500 text-sm animate-pulse">Thinking...</div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex items-center bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden"
      >
        <input
          type="text"
          placeholder="Ask a question about your data..."
          className="flex-1 px-5 py-3 focus:outline-none text-sm text-gray-800 placeholder-gray-400"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-3 hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-colors"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
