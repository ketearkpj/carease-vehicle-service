// ===== src/Components/Admin/AnalyticsChart.jsx =====
import React from 'react';
import '../../Styles/AnalyticsChart.css';

/**
 * AnalyticsChart Component - GOD MODE
 * Multiple chart types for admin analytics (No external dependencies)
 * 
 * @param {Object} props
 * @param {string} props.type - Chart type (line, bar, pie, doughnut, radar)
 * @param {Array} props.data - Chart data
 * @param {Object} props.options - Chart options
 * @param {string} props.title - Chart title
 * @param {boolean} props.loading - Loading state
 * @param {string} props.height - Chart height
 * @param {string} props.className - Additional CSS classes
 */
const AnalyticsChart = ({
  type = 'line',
  data = { labels: [], datasets: [] },
  options = {},
  title,
  loading = false,
  height = '300px',
  className = '',
  ...props
}) => {
  const normalizeDataArray = (values) => (Array.isArray(values) ? values : []);
  const getDatasetValues = (datasets = []) =>
    normalizeDataArray(datasets).flatMap((dataset) => normalizeDataArray(dataset?.data));
  const getSafeMinMax = (values = []) => {
    if (!values.length) {
      return { minValue: 0, maxValue: 1, range: 1 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const minValue = min === max ? Math.max(0, min - 1) : min * 0.9;
    const maxValue = min === max ? max + 1 : max * 1.1;
    const range = maxValue - minValue || 1;

    return { minValue, maxValue, range };
  };
  
  // Helper function to get color based on index
  const getColor = (index) => {
    const colors = [
      '#d4af37', // gold
      '#00ff88', // success green
      '#33b5e5', // info blue
      '#ffbb33', // warning yellow
      '#ff4444', // error red
      '#aa80ff', // purple
      '#ff80ab', // pink
      '#80deea', // cyan
      '#ffb74d', // orange
      '#a1887f'  // brown
    ];
    return colors[index % colors.length];
  };

  // Render line chart
  const renderLineChart = () => {
    const { labels = [], datasets = [] } = data;
    if (!labels.length || !datasets.length) return renderNoData();

    const datasetValues = getDatasetValues(datasets);
    if (!datasetValues.length) return renderNoData();
    const { minValue, maxValue, range } = getSafeMinMax(datasetValues);

    return (
      <div className="chart-svg-container">
        <svg viewBox={`0 0 ${labels.length * 100} 300`} preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={`grid-${i}`}
              x1="50"
              y1={50 + i * 50}
              x2={labels.length * 100 - 50}
              y2={50 + i * 50}
              stroke="rgba(212, 175, 55, 0.1)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}

          {/* Data lines and points */}
          {datasets.map((dataset, datasetIndex) => {
            const points = normalizeDataArray(dataset?.data).map((value, index) => ({
              x: 50 + index * 100,
              y: 250 - ((value - minValue) / range) * 200
            }));

            if (!points.length) return null;
            const lastPoint = points[points.length - 1];
            if (!lastPoint) return null;

            // Create path for line
            const linePath = points.map((p, i) => 
              `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
            ).join(' ');

            return (
              <g key={`dataset-${datasetIndex}`}>
                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={dataset.borderColor || getColor(datasetIndex)}
                  strokeWidth="2"
                />
                
                {/* Area fill (optional) */}
                {dataset.fill && (
                  <path
                    d={`${linePath} L ${lastPoint.x} 250 L 50 250 Z`}
                    fill={dataset.backgroundColor || `${getColor(datasetIndex)}33`}
                    opacity="0.1"
                  />
                )}

                {/* Points */}
                {points.map((point, pointIndex) => (
                  <circle
                    key={`point-${datasetIndex}-${pointIndex}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={dataset.pointBackgroundColor || getColor(datasetIndex)}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                ))}
              </g>
            );
          })}

          {/* X-axis labels */}
          {labels.map((label, index) => (
            <text
              key={`xlabel-${index}`}
              x={50 + index * 100}
              y="280"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
            >
              {label}
            </text>
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const value = minValue + (range * (4 - i) / 4);
            return (
              <text
                key={`ylabel-${i}`}
                x="30"
                y={50 + i * 50 + 5}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
              >
                {value.toFixed(0)}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render bar chart
  const renderBarChart = () => {
    const { labels = [], datasets = [] } = data;
    if (!labels.length || !datasets.length) return renderNoData();

    const datasetValues = getDatasetValues(datasets);
    if (!datasetValues.length) return renderNoData();
    const { maxValue } = getSafeMinMax(datasetValues);
    const barWidth = 60;
    const groupSpacing = 20;
    const chartWidth = labels.length * (datasets.length * barWidth + groupSpacing);

    return (
      <div className="chart-svg-container">
        <svg viewBox={`0 0 ${chartWidth + 100} 300`} preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={`grid-${i}`}
              x1="50"
              y1={50 + i * 50}
              x2={chartWidth + 50}
              y2={50 + i * 50}
              stroke="rgba(212, 175, 55, 0.1)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}

          {/* Bars */}
          {labels.map((label, labelIndex) => {
            const groupX = 50 + labelIndex * (datasets.length * barWidth + groupSpacing);
            
            return datasets.map((dataset, datasetIndex) => {
              const barHeight = (dataset.data[labelIndex] / maxValue) * 200;
              const safeValue = Number(dataset?.data?.[labelIndex] || 0);
              const barHeightSafe = (safeValue / maxValue) * 200;
              const barX = groupX + datasetIndex * barWidth;
              const barY = 250 - barHeightSafe;

              return (
                <g key={`bar-${labelIndex}-${datasetIndex}`}>
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth - 4}
                    height={barHeightSafe}
                    fill={dataset.backgroundColor || getColor(datasetIndex)}
                    rx="4"
                    ry="4"
                  />
                  {dataset.label && (
                    <title>{dataset.label}: {safeValue}</title>
                  )}
                </g>
              );
            });
          })}

          {/* X-axis labels */}
          {labels.map((label, index) => {
            const groupX = 50 + index * (datasets.length * barWidth + groupSpacing) + (datasets.length * barWidth) / 2;
            return (
              <text
                key={`xlabel-${index}`}
                x={groupX}
                y="280"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="12"
              >
                {label}
              </text>
            );
          })}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const value = (maxValue * i) / 4;
            return (
              <text
                key={`ylabel-${i}`}
                x="30"
                y={250 - i * 50 + 5}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
              >
                {value.toFixed(0)}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render pie/doughnut chart
  const renderPieChart = () => {
    const { labels = [], datasets = [] } = data;
    if (!labels.length || !datasets.length) return renderNoData();

    const dataset = datasets[0];
    const pieValues = normalizeDataArray(dataset?.data);
    if (!pieValues.length) return renderNoData();
    const total = pieValues.reduce((a, b) => a + b, 0);
    const centerX = 200;
    const centerY = 150;
    const radius = type === 'doughnut' ? 60 : 80;
    const innerRadius = type === 'doughnut' ? 40 : 0;

    let startAngle = 0;

    return (
      <div className="chart-svg-container">
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
          {/* Pie/doughnut segments */}
          {pieValues.map((value, index) => {
            const percentage = value / total;
            const angle = percentage * 2 * Math.PI;
            const endAngle = startAngle + angle;

            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = angle > Math.PI ? 1 : 0;

            // Outer path
            let path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            // For doughnut, create a ring
            if (type === 'doughnut') {
              const innerX1 = centerX + innerRadius * Math.cos(startAngle);
              const innerY1 = centerY + innerRadius * Math.sin(startAngle);
              const innerX2 = centerX + innerRadius * Math.cos(endAngle);
              const innerY2 = centerY + innerRadius * Math.sin(endAngle);

              path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`;
            }

            const color = dataset.backgroundColor?.[index] || getColor(index);

            startAngle = endAngle;

            return (
              <g key={`pie-${index}`}>
                <path
                  d={path}
                  fill={color}
                  stroke="#0a0c14"
                  strokeWidth="2"
                />
                {labels[index] && (
                  <title>{labels[index]}: {value} ({Math.round(percentage * 100)}%)</title>
                )}
              </g>
            );
          })}

          {/* Center text for doughnut */}
          {type === 'doughnut' && (
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#d4af37"
              fontSize="16"
              fontWeight="bold"
            >
              {total}
            </text>
          )}
        </svg>

        {/* Legend */}
        <div className="chart-legend">
          {labels.map((label, index) => (
            <div key={`legend-${index}`} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: dataset.backgroundColor?.[index] || getColor(index) }}
              ></span>
              <span className="legend-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render radar chart
  const renderRadarChart = () => {
    const { labels = [], datasets = [] } = data;
    if (!labels.length || !datasets.length) return renderNoData();

    const centerX = 200;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / labels.length;

    return (
      <div className="chart-svg-container">
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
          {/* Background circles */}
          {[0.25, 0.5, 0.75, 1].map(level => (
            <circle
              key={`bg-circle-${level}`}
              cx={centerX}
              cy={centerY}
              r={radius * level}
              fill="none"
              stroke="rgba(212, 175, 55, 0.1)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}

          {/* Axis lines */}
          {labels.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <line
                key={`axis-${index}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="rgba(212, 175, 55, 0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygons */}
          {datasets.map((dataset, datasetIndex) => {
            const radarValues = normalizeDataArray(dataset?.data);
            if (!radarValues.length) return null;
            const maxValue = Math.max(...radarValues);
            const points = radarValues.map((value, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const distance = (value / maxValue) * radius;
              return {
                x: centerX + distance * Math.cos(angle),
                y: centerY + distance * Math.sin(angle)
              };
            });

            const polygonPath = points.map((p, i) => 
              `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
            ).join(' ') + ' Z';

            return (
              <g key={`radar-${datasetIndex}`}>
                <path
                  d={polygonPath}
                  fill={dataset.backgroundColor || `${getColor(datasetIndex)}33`}
                  stroke={dataset.borderColor || getColor(datasetIndex)}
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Axis labels */}
          {labels.map((label, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + (radius + 20) * Math.cos(angle);
            const y = centerY + (radius + 20) * Math.sin(angle);
            return (
              <text
                key={`label-${index}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#94a3b8"
                fontSize="12"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render no data state
  const renderNoData = () => (
    <div className="chart-empty" style={{ height }}>
      <span className="empty-icon">📊</span>
      <p>No data available</p>
    </div>
  );

  // Render loading state
  if (loading) {
    return (
      <div className="chart-loading" style={{ height }}>
        <div className="loading-spinner"></div>
        <p>Loading chart data...</p>
      </div>
    );
  }

  // Render based on chart type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
      case 'doughnut':
        return renderPieChart();
      case 'radar':
        return renderRadarChart();
      case 'line':
      default:
        return renderLineChart();
    }
  };

  return (
    <div className={`chart-container ${className}`} {...props}>
      {title && <h3 className="chart-title">{title}</h3>}
      {renderChart()}
    </div>
  );
};

// Predefined chart configurations (Now returning data only, not Chart.js config)
export const ChartTemplates = {
  // Revenue over time
  revenueChart: (data) => ({
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Revenue',
        data: data.values,
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        fill: true
      }]
    }
  }),

  // Booking distribution by type
  bookingsByTypeChart: (data) => ({
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: [
          '#d4af37',
          '#00ff88',
          '#33b5e5',
          '#ffbb33',
          '#ff4444'
        ]
      }]
    }
  }),

  // User growth
  userGrowthChart: (data) => ({
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'New Users',
        data: data.values,
        backgroundColor: 'rgba(212, 175, 55, 0.8)'
      }]
    }
  }),

  // Vehicle utilization
  vehicleUtilizationChart: (data) => ({
    type: 'radar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Utilization %',
        data: data.values,
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        borderColor: '#d4af37'
      }]
    }
  }),

  // Daily bookings
  dailyBookingsChart: (data) => ({
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Completed',
          data: data.completed,
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0, 255, 136, 0.1)'
        },
        {
          label: 'Cancelled',
          data: data.cancelled,
          borderColor: '#ff4444',
          backgroundColor: 'rgba(255, 68, 68, 0.1)'
        }
      ]
    }
  }),

  // Payment methods
  paymentMethodsChart: (data) => ({
    type: 'pie',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: [
          '#d4af37',
          '#00ff88',
          '#33b5e5',
          '#ffbb33'
        ]
      }]
    }
  }),

  // Peak hours
  peakHoursChart: (data) => ({
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Bookings',
        data: data.values,
        backgroundColor: 'rgba(212, 175, 55, 0.6)'
      }]
    }
  })
};

export default AnalyticsChart;
