'use client';
import { useState, useMemo } from 'react';
import Uploader from '@/components/Uploader';
import StatsCard from '@/components/StatsCard';
import ResultTable from '@/components/ResultTable';

type R = { status: string; username: string };

export default function Home() {
  const [results, setResults] = useState<R[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<'default'|'az'|'za'>('default');

  const visible = useMemo(() => {
    const f = results.filter(r => filter === 'all' || r.status === filter);
    if (sort === 'az') return [...f].sort((a, b) => a.username.localeCompare(b.username));
    if (sort === 'za') return [...f].sort((a, b) => b.username.localeCompare(a.username));
    return f;
  }, [results, filter, sort]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 max-w-2xl mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center font-bold">RC</div>
        <h1 className="text-xl font-bold">Roblox Checker</h1>
      </header>
      <Uploader onDone={(d) => { setResults(d.results || []); setStats(d); }} />
      <StatsCard stats={stats} filter={filter} setFilter={setFilter} />
      <div className="flex gap-2 mt-4">
        {(['default','az','za'] as const).map(s => (
          <button key={s} onClick={() => setSort(s)}
            className={`px-4 py-2 rounded-lg border text-sm transition ${sort === s ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:bg-white/5'}`}>
            {s === 'default' ? 'Default' : s === 'az' ? 'A-Z' : 'Z-A'}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold">Results</h2>
          <span className="text-white/40 text-sm">{visible.length} found</span>
        </div>
        <ResultTable results={visible} />
      </div>
    </main>
  );
}
