import { useEffect, useState } from "react";
import { Wallet, ClipboardList, Package, TrendingUp, Trophy } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import StatCard from "../../components/common/StatCard";
import Spinner from "../../components/common/Spinner";
import ComingSoon from "../../components/common/ComingSoon";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  fetchSummary,
  fetchDailySales,
  fetchMonthlySales,
  fetchBestSellers,
} from "../../services/analyticsService";

function formatDayLabel(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-PH", {
    month: "short",
    year: "2-digit",
  });
}

function ChartTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-[var(--color-ink)]">{labelFormatter(label)}</p>
      <p className="text-[var(--color-storefront)]">{formatCurrency(payload[0].value)}</p>
      <p className="text-xs text-[var(--color-muted)]">
        {payload[0].payload.order_count} {payload[0].payload.order_count === 1 ? "order" : "orders"}
      </p>
    </div>
  );
}

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchSummary(),
      fetchDailySales(14),
      fetchMonthlySales(6),
      fetchBestSellers(5),
    ])
      .then(([summaryData, dailyData, monthlyData, bestSellersData]) => {
        setSummary(summaryData);
        setDaily(dailyData);
        setMonthly(monthlyData);
        setBestSellers(bestSellersData);
      })
      .catch(() => setError("Couldn't load your analytics. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Crunching the numbers…" />;

  if (error) {
    return (
      <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Analytics</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Revenue from completed orders — pending and cancelled orders aren't counted.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total revenue"
          value={formatCurrency(summary.total_revenue)}
          hint="All-time, completed orders"
          accent="storefront"
        />
        <StatCard
          icon={ClipboardList}
          label="Completed orders"
          value={summary.total_orders}
          hint="All-time"
          accent="awning"
        />
        <StatCard
          icon={Package}
          label="Items sold"
          value={summary.total_items_sold}
          hint="Across all completed orders"
          accent="storefront"
        />
        <StatCard
          icon={TrendingUp}
          label="Average order"
          value={formatCurrency(summary.average_order_value)}
          hint="Per completed order"
          accent="awning"
        />
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Daily sales <span className="font-body text-sm font-normal text-[var(--color-muted)]">· last 14 days</span>
        </h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDayLabel}
                tick={{ fontSize: 12, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip labelFormatter={formatDayLabel} />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="revenue" fill="var(--color-storefront)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Monthly sales <span className="font-body text-sm font-normal text-[var(--color-muted)]">· last 6 months</span>
        </h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonthLabel}
                tick={{ fontSize: 12, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--color-muted)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip labelFormatter={formatMonthLabel} />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="revenue" fill="var(--color-awning)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Best sellers</h2>
        {bestSellers.length === 0 ? (
          <ComingSoon
            icon={Trophy}
            title="No sales yet"
            description="Your top products will show up here once orders are completed."
          />
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-[var(--color-border-subtle)]">
            {bestSellers.map((item, index) => (
              <div key={item.product_name} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-storefront)]/10 text-sm font-bold text-[var(--color-storefront)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{item.product_name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{item.quantity_sold} sold</p>
                  </div>
                </div>
                <p className="font-display font-bold text-[var(--color-storefront)]">
                  {formatCurrency(item.revenue)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
