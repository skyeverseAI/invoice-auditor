import { useState } from 'react'
import './PayModal.css'

export default function PayModal({ invoice, upiId, onClose, onPaid }) {
  const [paid, setPaid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentInitiated, setPaymentInitiated] = useState(false)

  const [vendorUpi, setVendorUpi] = useState(
    upiId ||
    localStorage.getItem(`upi_${invoice?.Vendor}`) ||
    ''
  )

  const amount = parseFloat(invoice?.Total_Amount || 0)

  const launchUPI = (app) => {
    if (!vendorUpi) {
      alert("Please enter Vendor UPI ID")
      return
    }

    // ✅ UPI VALIDATION
    const upiRegex = /^[\w.-]+@[\w.-]+$/
    if (!upiRegex.test(vendorUpi)) {
      alert("Enter a valid UPI ID (e.g. name@bank)")
      return
    }

    const note = `Invoice ${invoice?.Invoice_Number || ''}`

    const baseParams =
      `pa=${encodeURIComponent(vendorUpi)}` +
      `&pn=Invoice Auditor` +
      `&am=${amount}` +
      `&tn=${encodeURIComponent(note)}` +
      `&cu=INR`

    let url = ""

    switch (app) {
      case "GPay":
        url = `tez://upi/pay?${baseParams}`
        break
      case "PhonePe":
        url = `phonepe://pay?${baseParams}`
        break
      case "Paytm":
        url = `paytmmp://pay?${baseParams}`
        break
      default:
        url = `upi://pay?${baseParams}`
    }

    // 🔥 Reliable deep link trigger
    const a = document.createElement("a")
    a.href = url
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // 🔥 fallback
    setTimeout(() => {
      window.location.href = `upi://pay?${baseParams}`
    }, 800)

    setPaymentInitiated(true)
  }

  const handleConfirm = () => {
    if (!paymentInitiated) {
      alert("Please initiate payment first")
      return
    }

    // ✅ Save vendor UPI
    localStorage.setItem(`upi_${invoice?.Vendor}`, vendorUpi)

    setPaid(true)

    setTimeout(() => {
      onPaid && onPaid(vendorUpi)
    }, 1500)
  }

  const apps = [
    { name: 'GPay', key: 'GPay' },
    { name: 'PhonePe', key: 'PhonePe' },
    { name: 'Paytm', key: 'Paytm' },
    { name: 'Any UPI', key: 'UPI' }
  ]

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        {!paid ? (
          <>
            <div className="modal__header">
              <div>
                <h3 className="modal__title">Pay invoice</h3>
                <p className="modal__sub">
                  {invoice?.Vendor || 'Unknown'} · {invoice?.Invoice_Number || '—'}
                </p>
              </div>
              <button className="modal__close" onClick={onClose}>✕</button>
            </div>

            <div className="modal__amount">₹{amount}</div>

            <div className="modal__details">
              <div className="modal__row">
                <span>Invoice</span>
                <span className="mono">{invoice?.Invoice_Number || '—'}</span>
              </div>
              <div className="modal__row">
                <span>Vendor</span>
                <span>{invoice?.Vendor || 'Unknown'}</span>
              </div>
              <div className="modal__row">
                <span>Date</span>
                <span>{invoice?.Invoice_Date || '—'}</span>
              </div>
            </div>

            {/* 🔥 Editable UPI */}
            <div className="modal__upi-box">
              <input
                className="modal__upi-input"
                value={vendorUpi}
                onChange={e => setVendorUpi(e.target.value)}
                placeholder="vendor@upi"
              />
              <div className="modal__upi-label">Vendor UPI ID</div>
            </div>

            <div className="modal__apps">
              {apps.map(app => (
                <button
                  key={app.name}
                  className="upi-app"
                  disabled={loading}
                  onClick={() => launchUPI(app.key)}
                >
                  <span className="upi-app__icon">{app.name[0]}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>

            <div className="modal__actions">
              <button className="btn btn--cancel" onClick={onClose}>
                Cancel
              </button>

              <button
                className="btn btn--primary"
                onClick={handleConfirm}
                disabled={loading}
              >
                Mark as paid
              </button>
            </div>
          </>
        ) : (
          <div className="modal__success">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3>Payment initiated!</h3>
            <p>Invoice marked as paid.</p>
          </div>
        )}
      </div>
    </div>
  )
}