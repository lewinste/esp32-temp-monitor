"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Reading } from "@/lib/supabase";
import { ShowerSession } from "@/lib/shower-detection";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  TimeScale
);

interface Props {
  readings: Reading[];
  threshold: number;
  showers: ShowerSession[];
}

export default function TemperatureChart({
  readings,
  threshold,
  showers,
}: Props) {
  const data = {
    datasets: [
      {
        label: "Temperature (°C)",
        data: readings.map((r) => ({
          x: new Date(r.timestamp).getTime(),
          y: r.temperature,
        })),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.1)",
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: "Hot water threshold",
        data: readings.length
          ? [
              { x: new Date(readings[0].timestamp).getTime(), y: threshold },
              {
                x: new Date(readings[readings.length - 1].timestamp).getTime(),
                y: threshold,
              },
            ]
          : [],
        borderColor: "rgba(239, 68, 68, 0.5)",
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          displayFormats: { hour: "HH:mm", minute: "HH:mm" },
          tooltipFormat: "HH:mm:ss",
        },
        ticks: { color: "#94a3b8", maxTicksLimit: 12 },
        grid: { color: "rgba(148, 163, 184, 0.1)" },
      },
      y: {
        ticks: { color: "#94a3b8", callback: (v: number | string) => `${v}°C` },
        grid: { color: "rgba(148, 163, 184, 0.1)" },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1)}°C`,
        },
      },
    },
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-200">
        Temperature Today
      </h2>
      <div className="h-[350px] md:h-[400px]">
        <Line data={data} options={options} />
      </div>
      {showers.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {showers.map((s, i) => (
            <span
              key={i}
              className="text-xs bg-sky-900/50 text-sky-300 px-2 py-1 rounded"
            >
              Shower #{i + 1}:{" "}
              {s.startTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {s.endTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              ({s.durationMinutes} min, peak {s.peakTemperature.toFixed(1)}°C)
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
