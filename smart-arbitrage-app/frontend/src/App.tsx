import { useMemo, useState } from 'react';
import { Opportunity, OpportunitiesResponse } from './lib/types';
import { OpportunityCard } from './components/OpportunityCard';

const parseAsins = (raw: string): string[] => {
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const App = () => {
  const [asinInput, setAsinInput] = useState('');
  const [items, setItems] = useState<Opportunity[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ minRoi: 0, minProfit: 0, minScore: 0 });

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          item.roiPercent >= filters.minRoi &&
          item.netProfit.amount >= filters.minProfit &&
          item.score.score >= filters.minScore
      ),
    [items, filters]
  );

  const analyze = async () => {
    const asins = parseAsins(asinInput);
    if (asins.length === 0) {
      setWarnings(['Enter at least one ASIN']);
      return;
    }

    setLoading(true);
    setWarnings([]);
    try {
      const response = await fetch('http://localhost:3001/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asins, marketplace: 'ES', options: { historyDays: 90, forceUpdateHours: 12 } })
      });

      const data = (await response.json()) as OpportunitiesResponse;
      setItems(data.opportunities ?? []);
      setWarnings(data.warnings ?? []);
    } catch {
      setWarnings(['Unable to reach backend']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-slate-950 px-4 py-6 text-slate-100">
      <h1 className="mb-4 text-2xl font-bold">Opportunities</h1>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <label className="mb-2 block text-sm font-medium">ASINs (comma or newline separated)</label>
        <textarea
          className="h-28 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
          value={asinInput}
          onChange={(e) => setAsinInput(e.target.value)}
          placeholder="B07PGL2N7J, B0B1Q2W3E4"
        />

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:text-sm">
          <input
            type="number"
            className="rounded border border-slate-700 bg-slate-950 p-2"
            placeholder="Min ROI"
            value={filters.minRoi}
            onChange={(e) => setFilters((prev) => ({ ...prev, minRoi: Number(e.target.value) }))}
          />
          <input
            type="number"
            className="rounded border border-slate-700 bg-slate-950 p-2"
            placeholder="Min Profit"
            value={filters.minProfit}
            onChange={(e) => setFilters((prev) => ({ ...prev, minProfit: Number(e.target.value) }))}
          />
          <input
            type="number"
            className="rounded border border-slate-700 bg-slate-950 p-2"
            placeholder="Min Score"
            value={filters.minScore}
            onChange={(e) => setFilters((prev) => ({ ...prev, minScore: Number(e.target.value) }))}
          />
        </div>

        <button
          className="mt-3 w-full rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white disabled:opacity-70"
          disabled={loading}
          onClick={analyze}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </section>

      {warnings.length > 0 && (
        <section className="mt-4 rounded-lg border border-amber-800 bg-amber-950/40 p-3 text-sm text-amber-300">
          <ul className="space-y-1">
            {warnings.map((warning, idx) => (
              <li key={idx}>⚠ {warning}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4 space-y-3">
        {filtered.map((item) => (
          <OpportunityCard key={item.asin} item={item} />
        ))}
        {!loading && filtered.length === 0 && <p className="text-center text-sm text-slate-400">No opportunities yet.</p>}
      </section>
    </main>
  );
};

export default App;
