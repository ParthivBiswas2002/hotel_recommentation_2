import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const CustomerScoresRadar = ({ title = 'Customer Ratings Overview', scores = { cleanliness: 4.2, service: 4.6, amenities: 4.0, value: 4.4 } }) => {
  const labels = ['Cleanliness', 'Service', 'Amenities', 'Value for Money'];
  const values = [
    Number(scores.cleanliness || 0),
    Number(scores.service || 0),
    Number(scores.amenities || 0),
    Number(scores.value || scores.valueForMoney || 0)
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Average Score (out of 5)',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue} / 5`
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          stepSize: 1,
          showLabelBackdrop: false,
          color: '#4B5563'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)'
        },
        angleLines: {
          color: 'rgba(107, 114, 128, 0.2)'
        },
        pointLabels: {
          color: '#111827',
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">Scale: 0 - 5</div>
      </div>
      <div className="h-80">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};

export default CustomerScoresRadar;



