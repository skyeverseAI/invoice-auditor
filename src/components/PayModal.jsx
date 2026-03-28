import { useState } from 'react'
import './PayModal.css'

export default function PayModal({ invoice, upiId, onClose, onPaid }) {
  const [paid, setPaid] = useState(false)
  const amount = parseFloat(invoice.Total_Amount || 0).toFixed(2)

  const launchUPI = () => {
    const note = `Invoice+${(invoice.Invoice_Number || '').replace(/\s/g, '+')}`
    const link = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Invoice+Auditor&am=${amount}&tn=${note}&cu=INR`
    window.open(link)
  }

  const handleConfirm = () => {
    setPaid(true)
    setTimeout(() => { onPaid() }, 1800)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {!paid ? (
          <>
            <div className="modal__header">
              <div>
                <h3 className="modal__title">Pay invoice</h3>
                <p className="modal__sub">{invoice.Vendor} · {invoice.Invoice_Number}</p>
              </div>
              <button className="modal__close" onClick={onClose}>✕</button>
            </div>

            <div className="modal__amount">${amount}</div>

            <div className="modal__details">
              <div className="modal__row">
                <span>Invoice</span>
                <span className="mono">{invoice.Invoice_Number}</span>
              </div>
              <div className="modal__row">
                <span>Vendor</span>
                <span>{invoice.Vendor}</span>
              </div>
              <div className="modal__row">
                <span>Date</span>
                <span>{invoice.Invoice_Date}</span>
              </div>
            </div>

            <div className="modal__upi-box">
              <div className="modal__upi-id">{upiId}</div>
              <div className="modal__upi-label">Payment recipient UPI ID</div>
            </div>

            <div className="modal__apps">
              {['GPay', 'PhonePe', 'Paytm', 'Any UPI'].map(app => (
                <button key={app} className="upi-app" onClick={launchUPI}>
                  <span className="upi-app__icon">{app[0]}</span>
                  <span>{app}</span>
                </button>
              ))}
            </div>

            <div className="modal__actions">
              <button className="btn btn--cancel" onClick={onClose}>Cancel</button>
              <button className="btn btn--primary" onClick={handleConfirm}>Mark as paid</button>
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
