import { LucidePlus, LucideSendHorizonal } from "lucide-react";

export default function Composer({ value, onChange, onSubmit, onSelectFiles }) {
  return (
    <div className="flex flex-row gap-2 p-3 pb-safe">
      <label
        htmlFor="message-attachments-input"
        className="p-3 bg-[#1a1a1a] border border-[#363636] text-neutral-200 rounded-lg
        hover:border-rose-400 hover:text-white active:scale-95 transition-colors
        min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation cursor-pointer"
        aria-label="Add attachments"
      >
        <LucidePlus size={20} />
      </label>
      <input
        id="message-attachments-input"
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) onSelectFiles(files);
          e.target.value = "";
        }}
      />
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
        className="flex-1 p-3 pl-4 bg-[#1a1a1a]
        border border-[#363636] rounded-lg text-white text-base
        placeholder-neutral-400 focus:outline-none focus:border-rose-400
        focus:ring-1 focus:ring-rose-400 min-h-[44px]"
      />
      <button
        onClick={() => {
          onSubmit(value);
        }}
        className="p-3 bg-rose-500 border border-rose-400 text-white rounded-lg
        font-medium hover:bg-rose-600 active:scale-95 transition-colors
        min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <LucideSendHorizonal size={20} />
      </button>
    </div>
  );
}
