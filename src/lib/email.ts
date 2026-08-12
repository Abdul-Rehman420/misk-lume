import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Contact form recipient — misklume@gmail.com until the @misklume.com mailbox exists.
const CONTACT_TO = process.env.CONTACT_EMAIL_TO || 'misklume@gmail.com'
// Resend's onboarding sender works without domain verification (owner inbox only).
// Switch to a verified domain (e.g. "Misk Lume Contact <noreply@misklume.com>") once misklume.com is verified.
const CONTACT_FROM = process.env.EMAIL_FROM_CONTACT || 'Misk Lume Contact <onboarding@resend.dev>'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

export async function sendOrderConfirmation(order: {
  email: string
  orderNumber: string
  items: { name: string; quantity: number; price: number }[]
  total: number
}) {
  const itemRows = order.items
    .map(item => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e5e5">${escapeHtml(item.name)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:center">${item.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right">PKR ${item.price.toLocaleString()}</td></tr>`)
    .join('')

  await resend.emails.send({
    from: 'Misk Lume <orders@misklume.com>',
    to: order.email,
    subject: `Order Confirmation — ${order.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <div style="text-align:center;margin-bottom:40px">
          <h1 style="font-size:24px;color:#1a1a1a;margin:0">Misk Lume</h1>
          <p style="font-size:12px;color:#999;letter-spacing:2px;margin-top:4px">LUXURY FRAGRANCES</p>
        </div>
        <div style="background:#f9f6f0;padding:24px;border-radius:4px;margin-bottom:32px">
          <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 8px">Thank you for your order!</h2>
          <p style="font-size:14px;color:#666;margin:0">Order Number: <strong>${order.orderNumber}</strong></p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <thead><tr style="border-bottom:2px solid #1a1a1a"><th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px">Item</th><th style="padding:8px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px">Qty</th><th style="padding:8px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px">Price</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="text-align:right;padding:16px 12px;border-top:2px solid #1a1a1a">
          <span style="font-size:16px;font-weight:bold;color:#1a1a1a">Total: PKR ${order.total.toLocaleString()}</span>
        </div>
        <p style="font-size:13px;color:#999;text-align:center;margin-top:40px">If you have any questions, contact us at ${CONTACT_TO}</p>
      </div>
    `,
  })
}

export async function sendContactEmail(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  await resend.emails.send({
    from: CONTACT_FROM,
    to: CONTACT_TO,
    subject: `Contact Form: ${data.subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h2 style="font-size:20px;color:#1a1a1a;margin:0 0 16px">New Contact Form Submission</h2>
        <p style="font-size:14px;color:#666;margin:0 0 4px"><strong>From:</strong> ${escapeHtml(data.name)}</p>
        <p style="font-size:14px;color:#666;margin:0 0 16px"><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p style="font-size:14px;color:#666;margin:0 0 4px"><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        <div style="background:#f9f6f0;padding:16px;border-radius:4px;margin-top:16px">
          <p style="font-size:14px;color:#1a1a1a;margin:0;white-space:pre-wrap">${escapeHtml(data.message)}</p>
        </div>
      </div>
    `,
  })
}
