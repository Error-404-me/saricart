import { useMemo } from "react";
import { formatCurrency } from "../../utils/formatCurrency";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

function formatHour(hour) {
  const period = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${period}`;
}

export default function SalesHeatmap({ cells }) {
  const { grid, maxRevenue, dayTotals, busiestDay, busiestHour } = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(24).fill(null));
    const dayTotals = Array(7).fill(0);
    const hourTotals = Array(24).fill(0);
    let max = 0;

    for (const cell of cells) {
      const revenue = Number(cell.revenue);
      grid[cell.day_of_week][cell.hour] = { revenue, orderCount: cell.order_count };
      dayTotals[cell.day_of_week] += revenue;
      hourTotals[cell.hour] += revenue;
      if (revenue > max) max = revenue;
    }

    const hasAny = dayTotals.some((t) => t > 0);
    const busiestDayIndex = dayTotals.indexOf(Math.max(...dayTotals));
    const busiestHourIndex = hourTotals.indexOf(Math.max(...hourTotals));

    return {
      grid,
      maxRevenue: max,
      dayTotals,
      busiestDay: hasAny ? DAY_LABELS[busiestDayIndex] : null,
      busiestHour: hasAny ? formatHour(busiestHourIndex) : null,
    };
  }, [cells]);

  const hasData = maxRevenue > 0;

  function alphaFor(revenue) {
    if (!maxRevenue || !revenue) return 0;
    return Math.max(0.1, revenue / maxRevenue);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Sales heatmap{" "}
          <span className="font-body text-sm font-normal text-[var(--color-muted)]">
            · last 12 weeks, by day &amp; time
          </span>
        </h2>
        {hasData && (
          <p className="text-sm text-[var(--color-muted)]">
            Busiest: <span className="font-medium text-[var(--color-storefront)]">{busiestDay}</span>
            {busiestHour && (
              <>
                {" "}around <span className="font-medium text-[var(--color-storefront)]">{busiestHour}</span>
              </>
            )}
          </p>
        )}
      </div>

      {!hasData ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          No completed sales yet — this fills in once orders start coming through.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="ml-12 flex pr-16">
              {HOURS.map((h) => (
                <div key={h} className="flex-1 text-center text-[10px] text-[var(--color-muted)]">
                  {h % 3 === 0 ? formatHour(h) : ""}
                </div>
              ))}
            </div>

            {DAY_LABELS.map((label, dayIndex) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-10 shrink-0 text-right text-xs font-medium ${
                    label === busiestDay ? "text-[var(--color-storefront)]" : "text-[var(--color-muted)]"
                  }`}
                >
                  {label}
                </div>
                <div className="flex flex-1 gap-[2px] py-[2px]">
                  {grid[dayIndex].map((cell, hourIndex) => {
                    const revenue = cell?.revenue || 0;
                    const alpha = alphaFor(revenue);
                    return (
                      <div
                        key={hourIndex}
                        title={`${label} ${formatHour(hourIndex)} — ${formatCurrency(revenue)}${
                          cell?.orderCount ? ` · ${cell.orderCount} order${cell.orderCount === 1 ? "" : "s"}` : ""
                        }`}
                        className="h-5 flex-1 rounded-[3px]"
                        style={{
                          backgroundColor:
                            alpha > 0
                              ? `color-mix(in srgb, var(--color-storefront) ${Math.round(alpha * 100)}%, transparent)`
                              : "var(--color-overlay)",
                        }}
                      />
                    );
                  })}
                </div>
                <div className="w-16 shrink-0 text-right text-xs text-[var(--color-muted)]">
                  {formatCurrency(dayTotals[dayIndex])}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}