import { useState, useEffect, useCallback } from 'react'
import MetricCards from './components/MetricCards.jsx'
import InvoiceTable from './components/InvoiceTable.jsx'
import Charts from './components/Charts.jsx'
import PayModal from './components/PayModal.jsx'
import './App.css'

const WEBHOOK_URL = 'https://sherri-finespun-outspokenly.ngrok-free.dev/webhook/IA-dashboard'
const OVERRIDE_URL = 'https://sherri-finespun-outspokenly.ngrok-free.dev/webhook/override-handler'

export default function App() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [payInvoice, setPayInvoice] = useState(null)
  const [upiId, setUpiId] = useState(() => localStorage.getItem('upi_id') || '')
  const [upiEditing, setUpiEditing] = useState(!localStorage.getItem('upi_id'))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const saveUpi = () => {
    localStorage.setItem('upi_id', upiId)
    setUpiEditing(false)
    showToast('UPI ID saved!', 'success')
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(WEBHOOK_URL, {
        method: 'GET',
        mode: 'cors',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setInvoices(data.invoices || [])
      setLastRefresh(new Date())
    } catch (e) {
      setError('Could not fetch data from n8n. Is the workflow active?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleOverride = async (inv) => {
    try {
      showToast('Overriding...', 'info')
      const res = await fetch(OVERRIDE_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ invoice_number: inv.Invoice_Number })
      })
      if (!res.ok) throw new Error()
      showToast('Invoice overridden to PASS!', 'success')
      fetchData()
    } catch {
      showToast('Override failed. Check n8n workflow.', 'error')
    }
  }

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase()
    const matchQ = !q || (inv.Vendor || '').toLowerCase().includes(q) || (inv.Invoice_Number || '').toLowerCase().includes(q)
    const matchS = !statusFilter || inv.Status === statusFilter
    return matchQ && matchS
  })

  return (
    <div className="app">
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      {payInvoice && (
        <PayModal
          invoice={payInvoice}
          upiId={upiId}
          onClose={() => setPayInvoice(null)}
          onPaid={() => { setPayInvoice(null); showToast('Payment initiated!', 'success') }}
        />
      )}

      <header className="header">
        <div className="header__left">
          <div className="header__logo">
            <span className="header__logo-icon">◈</span>
            <span className="header__title">Invoice Auditor</span>
          </div>
          <span className="header__sub">
            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
          </span>
        </div>
        <div className="header__right">
          {upiEditing ? (
            <div className="upi-input-wrap">
              <span className="upi-label">UPI</span>
              <input
                className="upi-input"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                onKeyDown={e => e.key === 'Enter' && saveUpi()}
              />
              <button className="btn btn--save" onClick={saveUpi}>Save</button>
            </div>
          ) : (
            <div className="upi-saved" onClick={() => setUpiEditing(true)} title="Click to edit">
              <span className="upi-label">UPI</span>
              <span className="upi-value">{upiId || 'Set UPI ID'}</span>
              <span className="upi-edit">✎</span>
            </div>
          )}
          <button className="btn btn--ghost" onClick={fetchData} disabled={loading}>
            {loading ? '...' : '↻'}
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {loading && invoices.length === 0 ? (
        <div className="loading">
          <div className="loading__spinner" />
          <span>Fetching invoices...</span>
        </div>
      ) : (
        <>
          <MetricCards invoices={invoices} />
          <Charts invoices={invoices} />
          <div className="table-section">
            <div className="table-section__header">
              <h2 className="section-title">All invoices</h2>
              <div className="filters">
                <input className="filter-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="PASS">Pass</option>
                  <option value="FLAG">Flag</option>
                  <option value="DUPLICATE">Duplicate</option>
                </select>
              </div>
            </div>
            <InvoiceTable invoices={filtered} onPay={inv => setPayInvoice(inv)} onOverride={handleOverride} showToast={showToast} />
          </div>
        </>
      )}
    </div>
  )
}
