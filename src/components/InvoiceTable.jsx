import './InvoiceTable.css'

const Badge = ({ status }) => {
  const map = {
    PASS: 'badge--pass',
    FLAG: 'badge--flag',
    DUPLICATE: 'badge--dup',
  }
  return <span className={`badge ${map[status] || ''}`}>{status}</span>
}

export default function InvoiceTable({ invoices, onPay, showToast }) {
  if (invoices.length === 0) {
    return (
      <div className="table-empty">
        No invoices found
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="inv-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Invoice #</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Calc. total</th>
            <th>Signature</th>
            <th>Status</th>
            <th>Flag reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={i}>
              <td className="td--vendor" title={inv.Vendor}>{inv.Vendor || '—'}</td>
              <td className="td--mono">{inv.Invoice_Number || '—'}</td>
              <td className="td--muted">{inv.Invoice_Date || '—'}</td>
              <td className="td--mono">
                {inv.Total_Amount ? `$${parseFloat(inv.Total_Amount).toFixed(2)}` : '—'}
              </td>
              <td className="td--mono td--muted">
                {inv.Calculated_Total ? `$${parseFloat(inv.Calculated_Total).toFixed(2)}` : '—'}
              </td>
              <td className="td--muted">
                {inv.Signature_Present === 'true' || inv.Signature_Present === true ? 'Yes' : 'No'}
              </td>
              <td><Badge status={inv.Status} /></td>
              <td className="td--reason" title={inv.Flag_Reason}>
                {inv.Flag_Reason || '—'}
              </td>
              <td>
                {inv.Status === 'PASS' && (
                  <button className="btn btn--pay" onClick={() => onPay(inv)}>
                    Pay ${parseFloat(inv.Total_Amount || 0).toFixed(2)}
                  </button>
                )}
                {inv.Status === 'FLAG' && (
                  <button
                    className="btn btn--override"
                    onClick={() => showToast('Override requires manual action in n8n', 'info')}
                  >
                    Override
                  </button>
                )}
                {inv.Status === 'DUPLICATE' && (
                  <span className="td--muted" style={{ fontSize: '12px' }}>Blocked</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
