import bytes from "bytes";
export default function AttachmentsBar({
  attachments,
  onClearAll,
  onRemoveAt,
}) {
  if (!attachments || attachments.length <= 0) return null;
  return (
    <div className="px-3 py-2 border-b border-neutral-700">
      <div className="mb-2 flex items-center justify-between">
        <p className="m-0 text-sm text-neutral-400">
          Attachments ({attachments.length})
        </p>
        <button
          onClick={onClearAll}
          className="text-xs text-neutral-300 hover:text-white underline touch-manipulation"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
        {attachments.map((file, idx) => (
          <div
            key={`${file.name}-${file.size}-${file.lastModified}-${idx}`}
            className="flex items-center gap-2 rounded-lg border border-[#363636] px-2 py-1 bg-neutral-800 min-h-[32px]"
          >
            <span
              className="text-sm text-neutral-200 truncate max-w-[12rem] sm:max-w-[16rem]"
              title={`${file.name} (${bytes(file.size)})`}
            >
              {file.name}
            </span>
            <span className="text-xs text-neutral-500 flex-shrink-0">
              {bytes(file.size)}
            </span>
            <button
              onClick={() => onRemoveAt(idx)}
              className="text-neutral-400 hover:text-white text-sm touch-manipulation min-w-[20px] min-h-[20px] flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
