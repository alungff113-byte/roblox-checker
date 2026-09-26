'use client';
export default function StatsCard({ stats, filter, setFilter }: any) {
  if (!stats) return null;
  const colors: any = {
    valid: 'text-green-400 border-green-500/30',
    invalid: 'text-red-400 border-red-500/30',
    error: 'text-orange-400 border-orange-500/30',
    rate: 'text-yellow-400 border-yellow-500/30'
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
      {['valid','invalid','error','rate'].map(k => (
        <button key={k} onClick={() => setFilter(filter === k ? 'all' : k)}
          className={`p-3 rounded-lg border transition ${filter === k ? 'bg-white/10 border-white' : `border-white/10 hover:bg-white/5 ${colors[k]}`}`}>
          <div className="text-xs uppercase tracking-wider opacity-60">{k}</div>
          <div className={`text-xl font-bold ${colors[k].split(' ')[0]}`}>{stats[k] ?? 0}</div>
        </button>
      ))}
    </div>
  );
}
