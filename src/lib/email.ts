import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(order: {
  email: string
  orderNumber: string
  items: { name: string; quantity: number; price: number }[]
  total: number
}) {
  const itemRows = order.items
    .map(item => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e5e5">${item.name}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:center">${item.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right">PKR ${item.price.toLocaleString()}</td></tr>`)
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
        <p style="font-size:13px;color:#999;text-align:center;margin-top:40px">If you have any questions, contact us at info@misklume.com</p>
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
    from: 'Misk Lume Contact <noreply@misklume.com>',
    to: 'info@misklume.com',
    subject: `Contact Form: ${data.subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h2 style="font-size:20px;color:#1a1a1a;margin:0 0 16px">New Contact Form Submission</h2>
        <p style="font-size:14px;color:#666;margin:0 0 4px"><strong>From:</strong> ${data.name}</p>
        <p style="font-size:14px;color:#666;margin:0 0 16px"><strong>Email:</strong> ${data.email}</p>
        <p style="font-size:14px;color:#666;margin:0 0 4px"><strong>Subject:</strong> ${data.subject}</p>
        <div style="background:#f9f6f0;padding:16px;border-radius:4px;margin-top:16px">
          <p style="font-size:14px;color:#1a1a1a;margin:0;white-space:pre-wrap">${data.message}</p>
        </div>
      </div>
    `,
  })
}

export async function sendNewsletterWelcome(email: string) {
  await resend.emails.send({
    from: 'Misk Lume <hello@misklume.com>',
    to: email,
    subject: 'Welcome to the Misk Lume Ritual',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <div style="text-align:center;margin-bottom:40px">
          <h1 style="font-size:24px;color:#1a1a1a;margin:0">Welcome to Misk Lume</h1>
          <p style="font-size:12px;color:#999;letter-spacing:2px;margin-top:4px">LUXURY FRAGRANCES</p>
        </div>
        <div style="background:#f9f6f0;padding:32px;border-radius:4px;text-align:center;margin-bottom:32px">
          <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 12px">The Ritual Begins</h2>
          <p style="font-size:14px;color:#666;margin:0;line-height:1.6">
            You're now part of an exclusive circle of fragrance connoisseurs. We'll share first access to new releases, limited editions, and the stories behind our craft.
          </p>
        </div>
        <div style="text-align:center;margin-bottom:32px">
          <p style="font-size:13px;color:#999;margin:0 0 8px">As a welcome gift, use code</p>
          <p style="font-size:18px;font-weight:bold;color:#b8860b;letter-spacing:2px;margin:0">RITUAL15</p>
          <p style="font-size:13px;color:#999;margin:8px 0 0">for 15% off your first order</p>
        </div>
        <p style="font-size:13px;color:#999;text-align:center">Questions? Reply to this email or visit misklume.com</p>
      </div>
    `,
  })
}
