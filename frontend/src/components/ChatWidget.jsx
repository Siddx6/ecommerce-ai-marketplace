import { useState } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../api/client";
import { useCart } from "../context/CartContext";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const location = useLocation();
  const { cart } = useCart();

  // If we're on a product page, extract the product ID so the assistant has context
  const productMatch = location.pathname.match(/^\/products\/([^/]+)/);
  const productId = productMatch ? productMatch[1] : null;

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);

    const cartProductIds = cart.items.map((item) => item.product?._id || item.product);

    try {
      const res = await apiClient.post("/assistant/chat", { message: text, history, productId, cartProductIds });
      setMessages((prev) => [...prev, { role: "assistant", text: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, something went wrong." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="w-80 h-96 bg-slate-800 rounded-xl shadow-2xl flex flex-col mb-3 overflow-hidden border border-slate-700">
          <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
            <span className="text-white font-medium text-sm">Shopping Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-slate-400 text-xs text-center mt-4">
                Ask me about products, prices, or recommendations!
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
                  m.role === "user" ? "bg-indigo-600 text-white ml-auto" : "bg-slate-700 text-slate-200"
                }`}
              >
                {m.text}
              </div>
            ))}
            {sending && <div className="text-slate-400 text-xs">Thinking...</div>}
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg bg-slate-700 text-white text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg px-3 py-2 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl transition"
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default ChatWidget;