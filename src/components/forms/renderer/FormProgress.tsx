interface FormProgressProps {
  total: number;
  filled: number;
}

export default function FormProgress({ total, filled }: FormProgressProps) {
  if (total === 0) return null;
  const percentage = Math.min(100, Math.max(0, Math.round((filled / total) * 100)));

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span>COMPLETION PROGRESS</span>
        <span className="font-bold text-cyan-400">{percentage}% ({filled} of {total})</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
