import './InvoiceTable.css'

const Badge = ({ status }) => {
  const map = { PASS: 'badge--pass', FLAG: 'badge--flag', DUPLICATE: 'badge--dup' }
  return <span className={`badge ${map[status] || ''}`}>{status}</span>
}

export default function InvoiceTable({ invoices, onPay, onOverride, showToast }) {
  if (invoices.length === 0) return <div className="table-empty">No invoices found</div>

  return (
    <div className="table-wrap">
      <table className="inv-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Invoice #</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th className="col-reason">Flag reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={i}>
              <td className="td--vendor" title={inv.Vendor}>{inv.Vendor || '—'}</td>
              <td className="td--mono">{inv.Invoice_Number || '—'}</td>
              <td className="td--muted td--date">{inv.Invoice_Date || '—'}</td>
              <td className="td--mono">{inv.Total_Amount ? `$${parseFloat(inv.Total_Amount).toFixed(2)}` : '—'}</td>
              <td><Badge status={inv.Status} /></td>
              <td className="td--reason col-reason" title={inv.Flag_Reason}>{inv.Flag_Reason || '—'}</td>
              <td className="td--actions">
                {inv.Status === 'PASS' && (
                  <button className="btn btn--pay" onClick={() => onPay(inv)}>
                    Pay
                  </button>
                )}
                {inv.Status === 'FLAG' && (
                  <button className="btn btn--override" onClick={() => onOverride(inv)}>
                    Override
                  </button>
                )}
                {inv.Status === 'DUPLICATE' && (
                  <span className="td--muted" style={{ fontSize: '11px' }}>Blocked</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
