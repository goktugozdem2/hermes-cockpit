"use client";

import { useMemo, useState } from "react";
import type { HourlyActivity } from "@/lib/autonomous-state";
import type { Project } from "@/lib/cockpit-data";

type Granularity = "hourly" | "daily";
type Metric = "tokens" | "cost" | "work";

type Props = {
  activity: HourlyActivity[];
  projects: Project[];
  source: string;
};

type SeriesPoint = {
  key: string;
  label: string;
  tokens: number;
  costUsd: number;
  workUnits: number;
};

type ProjectBreakdown = {
  project: Project;
  tokens: number;
  costUsd: number;
  workUnits: number;
  inputTokens: number;
  outputTokens: number;
};

const CHART_WIDTH = 760;
const CHART_HEIGHT = 292;
const PLOT = { left: 62, right: 18, top: 24, bottom: 42 };
const PLOT_WIDTH = CHART_WIDTH - PLOT.left - PLOT.right;
const PLOT_HEIGHT = CHART_HEIGHT - PLOT.top - PLOT.bottom;

const numberFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const fullDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function formatTokens(value: number) {
  if (value >= 1_000) return compactFormatter.format(value);
  return numberFormatter.format(value);
}

function dateKey(value: string) {
  return value.slice(0, 10);
}

function formatDateLabel(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function metricLabel(metric: Metric) {
  if (metric === "cost") return "Estimated cost";
  if (metric === "work") return "Work units";
  return "Tokens";
}

function metricValue(point: SeriesPoint, metric: Metric) {
  if (metric === "cost") return point.costUsd;
  if (metric === "work") return point.workUnits;
  return point.tokens;
}

function formatMetricValue(value: number, metric: Metric) {
  if (metric === "cost") return currencyFormatter.format(value);
  if (metric === "work") return `${numberFormatter.format(value)} work`;
  return `${formatTokens(value)} tokens`;
}

function yTickValue(maxValue: number, tick: number) {
  return maxValue - (maxValue * tick) / 4;
}

function buildChartPoints(values: number[]) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? PLOT_WIDTH / (values.length - 1) : PLOT_WIDTH;

  return values.map((value, index) => ({
    x: Math.round(PLOT.left + index * step),
    y: Math.round(PLOT.top + PLOT_HEIGHT - (value / max) * PLOT_HEIGHT),
    value,
  }));
}

function buildLinePath(points: ReturnType<typeof buildChartPoints>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
}

function buildAreaPath(points: ReturnType<typeof buildChartPoints>) {
  if (points.length === 0) return "";
  const baseline = PLOT.top + PLOT_HEIGHT;
  return `${buildLinePath(points)} L${points.at(-1)?.x},${baseline} L${points[0].x},${baseline} Z`;
}

export function CeoUsageDashboard({ activity, projects, source }: Props) {
  const dateOptions = useMemo(() => Array.from(new Set(activity.map((hour) => dateKey(hour.hour)))).sort(), [activity]);
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions.at(-1) ?? "all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [granularity, setGranularity] = useState<Granularity>("hourly");
  const [metric, setMetric] = useState<Metric>("tokens");

  const projectBySlug = useMemo(() => new Map(projects.map((project) => [project.slug, project])), [projects]);

  const filteredHours = useMemo(() => {
    return activity
      .filter((hour) => granularity === "daily" || selectedDate === "all" || dateKey(hour.hour) === selectedDate)
      .map((hour) => {
        const rows = selectedProject === "all"
          ? hour.projects
          : hour.projects.filter((project) => project.projectSlug === selectedProject);

        return {
          ...hour,
          projects: rows,
          totalWorkUnits: rows.reduce((sum, project) => sum + project.workUnits, 0),
          totalTokens: rows.reduce((sum, project) => sum + project.inputTokens + project.outputTokens, 0),
          totalCostUsd: rows.reduce((sum, project) => sum + project.costUsd, 0),
        };
      });
  }, [activity, granularity, selectedDate, selectedProject]);

  const series = useMemo<SeriesPoint[]>(() => {
    if (granularity === "hourly") {
      return filteredHours.map((hour) => ({
        key: hour.hour,
        label: hour.label,
        tokens: hour.totalTokens,
        costUsd: hour.totalCostUsd,
        workUnits: hour.totalWorkUnits,
      }));
    }

    const grouped = new Map<string, SeriesPoint>();
    for (const hour of filteredHours) {
      const key = dateKey(hour.hour);
      const current = grouped.get(key) ?? {
        key,
        label: formatDateLabel(key),
        tokens: 0,
        costUsd: 0,
        workUnits: 0,
      };
      current.tokens += hour.totalTokens;
      current.costUsd += hour.totalCostUsd;
      current.workUnits += hour.totalWorkUnits;
      grouped.set(key, current);
    }

    return Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredHours, granularity]);

  const totals = useMemo(() => {
    return series.reduce(
      (sum, point) => ({
        tokens: sum.tokens + point.tokens,
        costUsd: sum.costUsd + point.costUsd,
        workUnits: sum.workUnits + point.workUnits,
      }),
      { tokens: 0, costUsd: 0, workUnits: 0 },
    );
  }, [series]);

  const projectBreakdown = useMemo<ProjectBreakdown[]>(() => {
    const grouped = new Map<string, Omit<ProjectBreakdown, "project">>();
    for (const hour of filteredHours) {
      for (const row of hour.projects) {
        const current = grouped.get(row.projectSlug) ?? {
          tokens: 0,
          costUsd: 0,
          workUnits: 0,
          inputTokens: 0,
          outputTokens: 0,
        };
        current.inputTokens += row.inputTokens;
        current.outputTokens += row.outputTokens;
        current.tokens += row.inputTokens + row.outputTokens;
        current.costUsd += row.costUsd;
        current.workUnits += row.workUnits;
        grouped.set(row.projectSlug, current);
      }
    }

    return Array.from(grouped.entries())
      .map(([slug, values]) => ({
        project: projectBySlug.get(slug) ?? {
          id: slug,
          name: slug,
          slug,
          description: "",
          repo: "",
          productionUrl: "",
          status: "healthy",
          focus: "",
          updatedAt: "",
          activeAgents: 0,
          pendingTasks: 0,
          blockedTasks: 0,
          failingChecks: 0,
          lastDeploy: "",
          healthScore: 0,
          tags: [],
        },
        ...values,
      }))
      .sort((a, b) => b.tokens - a.tokens);
  }, [filteredHours, projectBySlug]);

  const values = series.map((point) => metricValue(point, metric));
  const chartPoints = buildChartPoints(values);
  const linePath = buildLinePath(chartPoints);
  const areaPath = buildAreaPath(chartPoints);
  const peak = Math.max(...values, 0);
  const maxProjectTokens = Math.max(...projectBreakdown.map((row) => row.tokens), 1);
  const average = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const maxPoint = series.reduce<SeriesPoint | undefined>((best, point) => {
    if (!best) return point;
    return metricValue(point, metric) > metricValue(best, metric) ? point : best;
  }, undefined);
  const selectedDateLabel = selectedDate === "all" ? "All dates" : fullDateFormatter.format(new Date(`${selectedDate}T00:00:00Z`));
  const selectedProjectLabel = selectedProject === "all" ? "All projects" : projectBySlug.get(selectedProject)?.name ?? selectedProject;
  const filterSummary = `${selectedDateLabel} · ${selectedProjectLabel} · ${granularity} · ${metricLabel(metric)}`;

  return (
    <section className="panel ceo-dashboard tableau-dashboard" id="ceo-usage-dashboard">
      <div className="tableau-title-row">
        <div>
          <p className="eyebrow">CEO Usage Dashboard · Tableau-style workbook</p>
          <h2>Executive usage control center</h2>
          <p className="tableau-subtitle">
            Purpose-built for the executive question: which project burned tokens, when, and at what estimated cost?
          </p>
        </div>
        <div className="tableau-source-card" aria-label="Dashboard data source">
          <span>Data source</span>
          <strong>{source}</strong>
          <small>Provider billing sync pending</small>
        </div>
      </div>

      <div className="tableau-filter-shelf" aria-label="Usage dashboard filters">
        <div className="tableau-shelf-label">Filters</div>
        <label>
          <span>Date</span>
          <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} disabled={granularity === "daily"}>
            <option value="all">All dates</option>
            {dateOptions.map((date) => <option value={date} key={date}>{formatDateLabel(date)}</option>)}
          </select>
        </label>
        <label>
          <span>Project</span>
          <select value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)}>
            <option value="all">All projects</option>
            {projects.map((project) => <option value={project.slug} key={project.slug}>{project.name}</option>)}
          </select>
        </label>
        <label>
          <span>Breakdown</span>
          <select value={granularity} onChange={(event) => setGranularity(event.target.value as Granularity)}>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
          </select>
        </label>
        <label>
          <span>Measure</span>
          <select value={metric} onChange={(event) => setMetric(event.target.value as Metric)}>
            <option value="tokens">Tokens</option>
            <option value="cost">Cost</option>
            <option value="work">Work units</option>
          </select>
        </label>
      </div>

      <div className="tableau-context-bar">
        <span>View: {filterSummary}</span>
        <span>{series.length} marks</span>
        <span>Peak: {formatMetricValue(peak, metric)}{maxPoint ? ` at ${maxPoint.label}` : ""}</span>
      </div>

      <div className="executive-kpis tableau-kpis">
        <article><small>Total tokens</small><span>{formatTokens(totals.tokens)}</span><em>Input + output across selected view</em></article>
        <article><small>Estimated cost</small><span>{currencyFormatter.format(totals.costUsd)}</span><em>Derived from cockpit planning model</em></article>
        <article><small>Work units</small><span>{numberFormatter.format(totals.workUnits)}</span><em>Throughput completed by agents</em></article>
        <article><small>Average {granularity}</small><span>{formatMetricValue(average, metric)}</span><em>Reference line on the worksheet</em></article>
      </div>

      <div className="tableau-workbook-grid">
        <article className="tableau-sheet tableau-trend-sheet">
          <div className="tableau-sheet-header">
            <div>
              <span className="worksheet-label">Worksheet 1</span>
              <h3>{metricLabel(metric)} trend</h3>
              <p>{selectedProjectLabel} / {granularity === "hourly" ? selectedDateLabel : "all tracked dates"}</p>
            </div>
            <div className="tableau-legend">
              <span className={`legend-dot metric-${metric}`} />
              <strong>{metricLabel(metric)}</strong>
            </div>
          </div>

          <svg className="tableau-line-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Tableau-style line chart for token cost and work usage">
            <text x="0" y="18" className="axis-title">{metricLabel(metric)}</text>
            {[0, 1, 2, 3, 4].map((tick) => {
              const y = PLOT.top + (PLOT_HEIGHT * tick) / 4;
              return (
                <g key={tick}>
                  <line x1={PLOT.left} x2={CHART_WIDTH - PLOT.right} y1={y} y2={y} className="tableau-grid-line" />
                  <text x={PLOT.left - 10} y={y + 4} className="axis-tick" textAnchor="end">
                    {formatMetricValue(yTickValue(peak || 1, tick), metric)}
                  </text>
                </g>
              );
            })}
            <line x1={PLOT.left} x2={CHART_WIDTH - PLOT.right} y1={PLOT.top + PLOT_HEIGHT} y2={PLOT.top + PLOT_HEIGHT} className="tableau-axis-line" />
            <line x1={PLOT.left} x2={PLOT.left} y1={PLOT.top} y2={PLOT.top + PLOT_HEIGHT} className="tableau-axis-line" />
            {average > 0 ? (
              <line
                x1={PLOT.left}
                x2={CHART_WIDTH - PLOT.right}
                y1={PLOT.top + PLOT_HEIGHT - (average / Math.max(peak, 1)) * PLOT_HEIGHT}
                y2={PLOT.top + PLOT_HEIGHT - (average / Math.max(peak, 1)) * PLOT_HEIGHT}
                className="tableau-reference-line"
              />
            ) : null}
            <path d={areaPath} className={`tableau-area metric-${metric}`} />
            <path d={linePath} className={`tableau-line metric-${metric}`} />
            {chartPoints.map((point, index) => (
              <circle key={series[index]?.key} cx={point.x} cy={point.y} r="4.5" className={`tableau-mark metric-${metric}`}>
                <title>{series[index]?.label}: {formatMetricValue(point.value, metric)}</title>
              </circle>
            ))}
            {series.map((point, index) => (
              <text
                key={point.key}
                x={chartPoints[index]?.x ?? PLOT.left}
                y={CHART_HEIGHT - 12}
                textAnchor="middle"
                className="x-axis-tick"
              >
                {point.label}
              </text>
            ))}
            <text x={CHART_WIDTH - PLOT.right} y="18" className="reference-label" textAnchor="end">
              Avg {formatMetricValue(average, metric)}
            </text>
          </svg>
        </article>

        <article className="tableau-sheet tableau-insight-sheet">
          <div className="tableau-sheet-header compact">
            <div>
              <span className="worksheet-label">Insight</span>
              <h3>Executive readout</h3>
            </div>
          </div>
          <div className="insight-stack">
            <p><strong>Primary driver:</strong> {projectBreakdown[0]?.project.name ?? "No project"} leads token burn in this slice.</p>
            <p><strong>Peak window:</strong> {maxPoint ? `${maxPoint.label} at ${formatMetricValue(metricValue(maxPoint, metric), metric)}` : "No usage recorded"}.</p>
            <p><strong>Dashboard rule:</strong> limited to three core views—trend, project ranking, ledger—to preserve Tableau-style clarity.</p>
          </div>
        </article>
      </div>

      <div className="tableau-workbook-grid secondary">
        <article className="tableau-sheet">
          <div className="tableau-sheet-header compact">
            <div>
              <span className="worksheet-label">Worksheet 2</span>
              <h3>Project ranking</h3>
              <p>Sorted by token burn</p>
            </div>
          </div>
          <div className="tableau-ranking-list">
            {projectBreakdown.map((row, index) => (
              <div className="tableau-ranking-row" key={row.project.slug}>
                <div className="rank-label"><span>{index + 1}</span><strong>{row.project.name}</strong></div>
                <div className="rank-bar" aria-label={`${row.project.name} token share`}>
                  <i style={{ width: `${Math.max(7, Math.round((row.tokens / maxProjectTokens) * 100))}%` }} />
                </div>
                <div className="rank-values">
                  <strong>{formatTokens(row.tokens)}</strong>
                  <small>{currencyFormatter.format(row.costUsd)} · {row.workUnits} work</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="tableau-sheet">
          <div className="tableau-sheet-header compact">
            <div>
              <span className="worksheet-label">Worksheet 3</span>
              <h3>{granularity === "hourly" ? "Hourly" : "Daily"} burn ledger</h3>
              <p>{selectedProjectLabel}</p>
            </div>
          </div>
          <div className="tableau-ledger-list">
            <div className="tableau-ledger-row header"><span>Period</span><span>Tokens</span><span>Cost</span><span>Work</span></div>
            {series.map((point) => (
              <div className="tableau-ledger-row" key={point.key}>
                <span>{point.label}</span>
                <strong>{formatTokens(point.tokens)}</strong>
                <strong>{currencyFormatter.format(point.costUsd)}</strong>
                <strong>{point.workUnits}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
