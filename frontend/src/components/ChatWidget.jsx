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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      <div
        className={`w-80 h-96 bg-surface rounded shadow-2xl flex flex-col mb-3 overflow-hidden border-t-[3px] border-lime origin-bottom-right transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-6 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-ink px-4 py-3 flex items-center justify-between border-b border-surface-light">
          <span className="font-display font-bold text-sm text-cream">AI Assistant</span>
          <button onClick={() => setIsOpen(false)} className="text-muted hover:text-cream transition">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-muted text-xs text-center mt-4">
              Ask me about products, prices, or recommendations!
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm rounded px-3 py-2 max-w-[85%] ${
                m.role === "user" ? "bg-coral text-coral-dark ml-auto font-medium" : "bg-ink text-cream"
              }`}
            >
              {m.text}
            </div>
          ))}
          {sending && <div className="text-muted text-xs">Thinking...</div>}
        </div>

        <form onSubmit={sendMessage} className="p-3 border-t border-surface-light flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded bg-ink border border-surface-light text-cream text-sm px-3 py-2 outline-none focus:border-lime transition"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-lime text-lime-dark font-display font-bold text-sm rounded px-3 py-2 hover:opacity-90 disabled:opacity-50 transition"
          >
            Send
          </button>
        </form>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-lime text-lime-dark rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl transition hover:opacity-90"
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default ChatWidget;