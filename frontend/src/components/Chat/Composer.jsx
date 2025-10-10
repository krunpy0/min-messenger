import { LucideSendHorizonal } from "lucide-react";

export default function Composer({ value, onChange, onSubmit }) {
  return (
    <div className="flex relative bottom-3 left-1 right-1 flex-row gap-3 p-2 mb-3">
      <input
        type="text"
        name="message-input"
        id="message-input"
        placeholder="Type something here..."
        value={value}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit(value);
        }}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 pl-4 bg-[#1a1a1a]
        border border-[#363636] rounded-lg text-white
        placeholder-neutral-400 focus:outline-none focus:border-rose-400
        focus:ring-1 focus:ring-rose-400"
      />
      <button
        onClick={() => {
          onSubmit(value);
        }}
        className="p-3  bg-rose-500 border border-rose-400 text-white rounded-lg
        font-medium hover:bg-rose-600 active:scale-95 transition-colors"
      >
        <LucideSendHorizonal />
      </button>
    </div>
  );
}
