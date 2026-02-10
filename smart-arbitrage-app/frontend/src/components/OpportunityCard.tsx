import { Opportunity } from '../lib/types';

interface Props {
  item: Opportunity;
}

const colorMap: Record<Opportunity['score']['labelColor'], string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-rose-500'
};

export const OpportunityCard = ({ item }: Props) => {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-100 shadow-sm">
      <header className="mb-3">
        <h3 className="text-base font-semibold">{item.title}</h3>
        <p className="text-xs text-slate-400">ASIN: {item.asin}</p>
      </header>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>Price: €{item.currentPrice.amount.toFixed(2)}</p>
        <p>Sellers: {item.sellersCount ?? '-'}</p>
        <p>BSR: {item.bsrCurrent ?? '-'}</p>
        <p>BSR 30/90: {item.bsrAvg30d ?? '-'} / {item.bsrAvg90d ?? '-'}</p>
        <p className="font-medium text-emerald-300">Net: €{item.netProfit.amount.toFixed(2)}</p>
        <p className="font-medium text-cyan-300">ROI: {item.roiPercent.toFixed(2)}%</p>
      </div>

      <div className="mt-3">
        <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Confidence score</p>
        <div className="h-3 w-full rounded bg-slate-700">
          <div className={`h-3 rounded ${colorMap[item.score.labelColor]}`} style={{ width: `${item.score.score}%` }} />
        </div>
        <p className="mt-1 text-xs">{item.score.score}/100</p>
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-300">
        {item.score.reasons.map((reason, idx) => (
          <li key={`${reason.factor}-${idx}`}>
            <span className="font-semibold">{reason.factor}</span>: {reason.reason} ({reason.impact.toFixed(1)})
          </li>
        ))}
      </ul>

      {item.warnings.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-amber-300">
          {item.warnings.map((warning, idx) => (
            <li key={idx}>⚠ {warning}</li>
          ))}
        </ul>
      )}
    </article>
  );
};
