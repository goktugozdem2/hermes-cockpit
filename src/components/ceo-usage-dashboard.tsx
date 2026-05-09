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

function buildLinePath(values: number[], width = 760, height = 240) {
  if (values.length === 0) return "";

  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  return values
    .map((value, index) => {
      const x = Math.round(index * step);
      const y = Math.round(height - (value / max) * height);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function chartPoints(values: number[], width = 760, height = 240) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;

  return values.map((value, index) => ({
    x: Math.round(index * step),
    y: Math.round(height - (value / max) * height),
    value,
  }));
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
  const linePath = buildLinePath(values);
  const points = chartPoints(values);
  const peak = Math.max(...values, 0);
  const selectedDateLabel = selectedDate === "all" ? "All dates" : formatDateLabel(selectedDate);
  const selectedProjectLabel = selectedProject === "all" ? "All projects" : projectBySlug.get(selectedProject)?.name ?? selectedProject;

  return (
    <section className="panel ceo-dashboard" id="ceo-usage-dashboard">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">CEO Usage Dashboard</p>
          <h2>Date and project-based token burn</h2>
        </div>
        <p className="muted">
          Filter by date, project, and hourly/daily granularity to see exactly where token spend and work throughput are going.
        </p>
      </div>

      <div className="dashboard-toolbar" aria-label="Usage dashboard filters">
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
          <span>Metric</span>
          <select value={metric} onChange={(event) => setMetric(event.target.value as Metric)}>
            <option value="tokens">Tokens</option>
            <option value="cost">Cost</option>
            <option value="work">Work units</option>
          </select>
        </label>
      </div>

      <div className="executive-kpis">
        <article><span>{formatTokens(totals.tokens)}</span><small>tokens burned</small></article>
        <article><span>{currencyFormatter.format(totals.costUsd)}</span><small>estimated cost</small></article>
        <article><span>{numberFormatter.format(totals.workUnits)}</span><small>work units</small></article>
        <article><span>{formatMetricValue(peak, metric)}</span><small>peak {granularity === "hourly" ? "hour" : "day"}</small></article>
      </div>

      <div className="executive-chart-card">
        <div className="chart-card-header">
          <div>
            <strong>{selectedProjectLabel}</strong>
            <small>{granularity === "hourly" ? selectedDateLabel : "Daily trend across all tracked dates"} · {metric}</small>
          </div>
          <span>{source}</span>
        </div>
        <svg className="executive-line-chart" viewBox="0 0 760 300" role="img" aria-label="CEO line chart for token cost and work usage">
          {[0, 1, 2, 3].map((line) => (
            <line key={line} x1="0" x2="760" y1={line * 78 + 12} y2={line * 78 + 12} className="chart-grid-line" />
          ))}
          <g transform="translate(0 26)">
            <path d={linePath} className={`chart-line executive-line metric-${metric}`} />
            {points.map((point, index) => (
              <circle key={series[index]?.key} cx={point.x} cy={point.y} r="5" className={`chart-point metric-${metric}`}>
                <title>{series[index]?.label}: {formatMetricValue(point.value, metric)}</title>
              </circle>
            ))}
          </g>
        </svg>
        <div className="chart-axis executive-axis">
          {series.map((point) => <span key={point.key}>{point.label}</span>)}
        </div>
      </div>

      <div className="breakdown-grid">
        <div className="breakdown-panel">
          <div className="mini-heading">
            <span>Project breakdown</span>
            <small>{selectedDateLabel}</small>
          </div>
          <div className="breakdown-list">
            {projectBreakdown.map((row) => (
              <article className="breakdown-row" key={row.project.slug}>
                <div>
                  <strong>{row.project.name}</strong>
                  <small>{formatTokens(row.inputTokens)} in · {formatTokens(row.outputTokens)} out</small>
                </div>
                <div>
                  <strong>{formatTokens(row.tokens)}</strong>
                  <small>{currencyFormatter.format(row.costUsd)} · {row.workUnits} work</small>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="breakdown-panel">
          <div className="mini-heading">
            <span>{granularity === "hourly" ? "Hourly" : "Daily"} burn ledger</span>
            <small>{selectedProjectLabel}</small>
          </div>
          <div className="ledger-list">
            {series.map((point) => (
              <article className="ledger-row" key={point.key}>
                <span>{point.label}</span>
                <strong>{formatTokens(point.tokens)}</strong>
                <small>{currencyFormatter.format(point.costUsd)} · {point.workUnits} work</small>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
