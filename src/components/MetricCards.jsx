import './MetricCards.css'

export default function MetricCards({ invoices }) {
  const total = invoices.length
  const pass = invoices.filter(i => i.Status === 'PASS').length
  const flag = invoices.filter(i => i.Status === 'FLAG').length
  const dup = invoices.filter(i => i.Status === 'DUPLICATE').length
  const passVal = invoices
    .filter(i => i.Status === 'PASS')
    .reduce((s, i) => s + parseFloat(i.Total_Amount || 0), 0)

  const passRate = total > 0 ? Math.round((pass / total) * 100) : 0

  return (
    <div className="metrics">
      <div className="metric">
        <div className="metric__label">Total invoices</div>
        <div className="metric__value">{total}</div>
        <div className="metric__sub">{dup > 0 ? `${dup} duplicate blocked` : 'This session'}</div>
      </div>
      <div className="metric metric--green">
        <div className="metric__label">Ready to pay</div>
        <div className="metric__value">{pass}</div>
        <div className="metric__sub">{passRate}% pass rate</div>
      </div>
      <div className="metric metric--red">
        <div className="metric__label">Flagged</div>
        <div className="metric__value">{flag}</div>
        <div className="metric__sub">Need review</div>
      </div>
      <div className="metric metric--blue">
        <div className="metric__label">Approved value</div>
        <div className="metric__value">
          ${passVal.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="metric__sub">From PASS invoices</div>
      </div>
    </div>
  )
}
