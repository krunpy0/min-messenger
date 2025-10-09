import bytes from "bytes";
export default function AttachmentsBar({
  attachments,
  onClearAll,
  onRemoveAt,
}) {
  if (!attachments || attachments.length <= 0) return null;
  return (
    <div className="px-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="m-0 text-sm text-gray-400">
          Attachments ({attachments.length})
        </p>
        <button
          onClick={onClearAll}
          className="text-xs text-gray-300 hover:text-white underline"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {attachments.map((file, idx) => (
          <div
            key={`${file.name}-${file.size}-${file.lastModified}-${idx}`}
            className="flex items-center gap-2 rounded-lg border border-gray-600 px-2 py-1 bg-neutral-900"
          >
            <span
              className="text-sm text-gray-200 truncate max-w-[16rem]"
              title={`${file.name} (${bytes(file.size)})`}
            >
              {file.name}
            </span>
            <span className="text-xs text-gray-500">{bytes(file.size)}</span>
            <button
              onClick={() => onRemoveAt(idx)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
