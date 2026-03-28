import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js'
import './Charts.css'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip)

export default function Charts({ invoices }) {
  const pass = invoices.filter(i => i.Status === 'PASS').length
  const flag = invoices.filter(i => i.Status === 'FLAG').length
  const dup = invoices.filter(i => i.Status === 'DUPLICATE').length

  const reasons = {}
  invoices
    .filter(i => i.Flag_Reason && i.Status === 'FLAG')
    .forEach(i =>
      i.Flag_Reason.split(' | ').forEach(r => {
        const k = r.split('(')[0].trim()
        reasons[k] = (reasons[k] || 0) + 1
      })
    )
  const sortedReasons = Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div className="charts">
      <div className="chart-card">
        <div className="chart-card__title">Status breakdown</div>
        <div className="chart-legend">
          <span><span className="dot" style={{ background: '#639922' }} />Pass ({pass})</span>
          <span><span className="dot" style={{ background: '#E24B4A' }} />Flag ({flag})</span>
          {dup > 0 && <span><span className="dot" style={{ background: '#EF9F27' }} />Duplicate ({dup})</span>}
        </div>
        <div className="chart-wrap chart-wrap--donut">
          {pass + flag + dup > 0 ? (
            <Doughnut
              data={{
                labels: ['Pass', 'Flag', 'Duplicate'],
                datasets: [{
                  data: [pass, flag, dup],
                  backgroundColor: ['#639922', '#E24B4A', '#EF9F27'],
                  borderWidth: 0,
                  hoverOffset: 4,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}` } } },
              }}
            />
          ) : <div className="chart-empty">No data yet</div>}
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card__title">Top flag reasons</div>
        <div className="chart-wrap chart-wrap--bar">
          {sortedReasons.length > 0 ? (
            <Bar
              data={{
                labels: sortedReasons.map(e => e[0]),
                datasets: [{
                  data: sortedReasons.map(e => e[1]),
                  backgroundColor: '#E24B4A',
                  borderRadius: 4,
                  barThickness: 20,
                }],
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#9e9e97', font: { size: 11 }, stepSize: 1 } },
                  y: { grid: { display: false }, ticks: { color: '#6b6b65', font: { size: 11 } } },
                },
              }}
            />
          ) : <div className="chart-empty">No flags yet</div>}
        </div>
      </div>
    </div>
  )
}
