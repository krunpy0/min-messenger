import { LucideSendHorizonal } from "lucide-react";

export default function Composer({ value, onChange, onSubmit }) {
  return (
    <div className="flex relative bottom-3 left-1 right-1 flex-row gap-1 p-2 mb-3">
      <input
        type="text"
        name="message-input"
        id="message-input"
        placeholder="type something here..."
        value={value}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit(value);
        }}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl p-3 border-2 border-gray-400"
      />
      <button
        onClick={() => {
          onSubmit(value);
        }}
        className="rounded-2xl p-3 border-2 border-gray-400 hover:border-gray-600 active:scale-95"
      >
        <LucideSendHorizonal />
      </button>
    </div>
  );
}
