import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BodyLogEntry, DietTarget } from '../../types/closet';
import { Scale, Ruler, Layers } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DietTrendChartProps {
  logs: BodyLogEntry[];
  target: DietTarget;
}

export const DietTrendChart: React.FC<DietTrendChartProps> = ({ logs, target }) => {
  const [chartMode, setChartMode] = useState<'weight' | 'waist' | 'dual'>('dual');

  // Sorted logs chronologically
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const labels = sortedLogs.map((l) => l.date.slice(5)); // MM-DD
  const weights = sortedLogs.map((l) => l.weight);
  const waists = sortedLogs.map((l) => l.waistInch);

  // Target lines (horizontal lines spanning across all data points)
  const targetWeightArray = labels.map(() => target.targetWeight);
  const targetWaistArray = labels.map(() => target.targetWaistInch);

  // Architectural dataset colors: Clean Electric Blue (#2563EB), Emerald (#059669), and Neutral Slate dashed targets
  let datasets: any[] = [];

  if (chartMode === 'weight') {
    datasets = [
      {
        label: '체중 (kg)',
        data: weights,
        borderColor: '#E11D48',
        backgroundColor: 'rgba(225, 29, 72, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#E11D48',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.25,
        fill: true,
      },
      {
        label: `목표 체중 (${target.targetWeight}kg)`,
        data: targetWeightArray,
        borderColor: '#FDA4AF',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ];
  } else if (chartMode === 'waist') {
    datasets = [
      {
        label: '허리둘레 (inch)',
        data: waists,
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.06)',
        borderWidth: 2.5,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.25,
        fill: true,
      },
      {
        label: `목표 허리 (${target.targetWaistInch}인치)`,
        data: targetWaistArray,
        borderColor: '#94A3B8',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ];
  } else {
    // Dual axis
    datasets = [
      {
        label: '체중 (kg)',
        data: weights,
        borderColor: '#E11D48',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointBackgroundColor: '#E11D48',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointRadius: 3.5,
        yAxisID: 'yWeight',
        tension: 0.25,
      },
      {
        label: `목표 체중 (${target.targetWeight}kg)`,
        data: targetWeightArray,
        borderColor: '#FDA4AF',
        borderWidth: 1.5,
        borderDash: [5, 4],
        pointRadius: 0,
        yAxisID: 'yWeight',
      },
      {
        label: '허리둘레 (inch)',
        data: waists,
        borderColor: '#059669',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointRadius: 3.5,
        yAxisID: 'yWaist',
        tension: 0.25,
      },
      {
        label: `목표 허리 (${target.targetWaistInch}인치)`,
        data: targetWaistArray,
        borderColor: '#CBD5E1',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        yAxisID: 'yWaist',
      },
    ];
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
          font: {
            size: 11,
            family: "'Pretendard', sans-serif",
            weight: '600',
          },
          color: '#52525B',
        },
      },
      tooltip: {
        backgroundColor: '#18181B',
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 11, family: "'Pretendard', sans-serif", weight: 'bold' },
        bodyFont: { size: 11, family: "'Pretendard', sans-serif" },
        borderColor: '#27272A',
        borderWidth: 1,
        boxPadding: 4,
        callbacks: {
          afterBody: (context: any) => {
            const index = context[0]?.dataIndex;
            const note = sortedLogs[index]?.note;
            return note ? `메모: ${note}` : '';
          },
        },
      },
    },
    scales:
      chartMode === 'dual'
        ? {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10, family: "'Pretendard', sans-serif" }, color: '#71717A' },
            },
            yWeight: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: '체중 (kg)',
                color: '#E11D48',
                font: { size: 10, family: "'Pretendard', sans-serif", weight: '700' },
              },
              grid: { color: 'rgba(225, 29, 72, 0.05)' },
              ticks: { font: { size: 10, family: "'Pretendard', sans-serif" }, color: '#E11D48' },
              suggestedMin: Math.min(...weights, target.targetWeight) - 1.5,
              suggestedMax: Math.max(...weights) + 1.5,
            },
            yWaist: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: '허리 (inch)',
                color: '#059669',
                font: { size: 10, family: "'Pretendard', sans-serif", weight: '600' },
              },
              grid: { drawOnChartArea: false },
              ticks: { font: { size: 10, family: "'Pretendard', sans-serif" }, color: '#059669' },
              suggestedMin: Math.min(...waists, target.targetWaistInch) - 1.0,
              suggestedMax: Math.max(...waists) + 1.0,
            },
          }
        : {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10, family: "'Pretendard', sans-serif" }, color: '#71717A' },
            },
            y: {
              grid: { color: 'rgba(225, 29, 72, 0.05)' },
              ticks: { font: { size: 10, family: "'Pretendard', sans-serif" }, color: '#71717A' },
              suggestedMin:
                chartMode === 'weight'
                  ? Math.min(...weights, target.targetWeight) - 1.5
                  : Math.min(...waists, target.targetWaistInch) - 1.0,
              suggestedMax:
                chartMode === 'weight'
                  ? Math.max(...weights) + 1.5
                  : Math.max(...waists) + 1.0,
            },
          },
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-modern space-y-4">
      {/* Chart Header & Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
              신체 변화 및 목표선 추이
            </h3>
            <span className="text-[10px] text-rose-500 font-mono">6주간</span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            목표선(점선) 수렴 경향을 확인하세요.
          </p>
        </div>

        {/* Mode Segmented Controls */}
        <div className="flex bg-[#FDF2F4] p-0.5 rounded-lg border border-[#FBCFE8]">
          <button
            onClick={() => setChartMode('dual')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              chartMode === 'dual'
                ? 'bg-white text-zinc-900 shadow-sm font-bold'
                : 'text-rose-900/70 hover:text-[#E11D48]'
            }`}
          >
            <Layers size={13} /> 듀얼 축
          </button>
          <button
            onClick={() => setChartMode('weight')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              chartMode === 'weight'
                ? 'bg-white text-[#E11D48] shadow-sm font-bold'
                : 'text-rose-900/70 hover:text-[#E11D48]'
            }`}
          >
            <Scale size={13} /> 체중
          </button>
          <button
            onClick={() => setChartMode('waist')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              chartMode === 'waist'
                ? 'bg-white text-emerald-600 shadow-sm font-bold'
                : 'text-rose-900/70 hover:text-emerald-700'
            }`}
          >
            <Ruler size={13} /> 허리
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-1">
        <Line data={{ labels, datasets }} options={options} />
      </div>
    </div>
  );
};
