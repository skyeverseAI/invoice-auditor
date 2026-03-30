# Invoice Auditor 🧾

An AI-powered invoice auditing system that automatically extracts, validates, and logs invoice data — delivered via Telegram, processed by Gemini Vision AI, and displayed on a live React dashboard.

---

## Demo

Send a PDF invoice to a Telegram bot. The system will:

1. Extract structured data using **Gemini Vision AI**
2. Validate math, signatures, line items, totals (tax-aware)
3. Detect and block **duplicate invoices**
4. Log everything to **Google Sheets**
5. Send a Telegram notification — **PASS** ✅ or **FLAG** 🚩 with reasons
6. Display on a **live React dashboard** with override and UPI payment support

---

## Tech Stack

| Layer | Tool |
|---|---|
| Trigger | Telegram Bot API |
| Automation | n8n (self-hosted) |
| AI Extraction | Google Gemini Vision |
| File Upload | Gemini File API |
| Storage | Google Sheets |
| Dashboard | React + Vite |
| Hosting | Vercel |

---

## Features

### Core
- AI invoice data extraction — vendor, invoice number, date, line items, subtotal, tax, discount, shipping, total
- Tax-aware math validation — `subtotal + tax + shipping - discount = total`
- Line item validation — `qty x rate = line_total`
- Signature detection — flags invoices without handwritten/stamp signatures
- Duplicate prevention — blocks re-submission of same invoice number
- Gemini retry on failure — auto-retries on 503 overload errors

### Dashboard
- Live invoice table with search and status filter
- Metric cards — total invoices, pass rate, flagged count, approved value
- Charts — pass/flag breakdown, top flag reasons
- Override button — approve flagged invoices directly from dashboard
- Pay button — one-click UPI deep link for approved invoices
- UPI ID saved in localStorage — set once, persists
- Dark mode — automatic based on system preference
- Mobile responsive

---

## Architecture

```
Telegram Bot
    |
n8n — Main Flow
    |-- Get File Path (Telegram API)
    |-- Download File
    |-- Upload to Gemini File API
    |-- Gemini Vision Extract (JSON)
    |-- Parse + Validate (tax-aware)
    |-- Duplicate Check (Google Sheets lookup)
    |     |-- DUPLICATE → Telegram warning
    |     └-- NEW → Log to Google Sheets
    |                   |-- PASS → Telegram ✅
    |                   └-- FLAG → Telegram 🚩

n8n — Dashboard API
    └-- GET /IA-dashboard → Fetch all rows → Return JSON

n8n — Override Handler
    └-- POST /override-handler → Update row Status to PASS

React Dashboard (Vercel)
    |-- Fetches data from n8n webhook
    |-- Override → POST to n8n webhook
    └-- Pay → UPI deep link
```

---

## Validation Checks

| Check | Description |
|---|---|
| Missing invoice number | Flags if not extracted by Gemini |
| Missing vendor name | Flags if not extracted |
| Missing invoice date | Flags if not extracted |
| Missing signature | Flags if no visual signature detected |
| No line items | Flags if items array is empty |
| Line item math | qty x rate must match line_total |
| Subtotal check | Sum of line items must match subtotal |
| Total check | subtotal + tax + shipping - discount must match total |
| Duplicate | Same invoice number already exists in sheet |
| Parse error | Gemini returned unparseable response |

---

## Google Sheets Schema

| Column | Description |
|---|---|
| Timestamp | ISO datetime of submission |
| Vendor | Seller name |
| Invoice_Number | Invoice ID |
| Invoice_Date | Date on invoice |
| Total_Amount | Invoice total |
| Calculated_Total | Line items subtotal calculated by system |
| Status | PASS / FLAG |
| Flag_Reason | Pipe-separated list of issues |
| Signature_Present | true / false |

---

## n8n Workflows

### 1. Invoice Auditor (Main)
```
Telegram Trigger
→ Get File Path → Download → Upload to Gemini File API
→ Gemini Vision Extract → Parse JSON
→ Validation Logic
→ Duplicate Check (Sheets)
→ Log to Sheets → PASS / FLAG → Telegram notification
```

### 2. Dashboard API
```
Webhook GET /IA-dashboard
→ Get all rows → Filter empty → Return JSON
```

### 3. Override Handler
```
Webhook POST /override-handler
→ Update row Status = PASS
→ Return { success: true }
```

---

## Setup

### 1. Telegram Bot
- Create bot via @BotFather
- Copy token → add to n8n as Telegram credential

### 2. Google Sheets
- Create spreadsheet with sheet named `logs`
- Add column headers matching schema above
- Add Google Sheets OAuth2 credential in n8n

### 3. n8n
- Import workflow JSON
- Configure credentials
- Add Gemini API key
- Activate workflow

### 4. Dashboard
```bash
npm install
npm run dev
npm run build
```

Update webhook URLs in `src/App.jsx`:
```js
const WEBHOOK_URL = 'https://your-n8n.com/webhook/IA-dashboard'
const OVERRIDE_URL = 'https://your-n8n.com/webhook/override-handler'
```

Deploy to Vercel by connecting GitHub repo.

---

## License

MIT
