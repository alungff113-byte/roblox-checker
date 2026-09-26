'use client';
export default function ResultTable({ results }: { results: any[] }) {
  if (!results.length) return <div className="text-center text-white/30 py-12 text-sm">Upload a .txt file to begin</div>;
  const dot: any = { valid: 'bg-green-500', invalid: 'bg-red-500', rate: 'bg-yellow-500', error: 'bg-orange-500' };
  return (
    <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
      {results.map((r, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dot[r.status]}`} />
          <span className="font-mono text-sm truncate">{r.username}</span>
          <span className="ml-auto text-xs text-white/40 uppercase shrink-0">{r.status}</span>
        </div>
      ))}
    </div>
  );
}
