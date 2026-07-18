"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    orders: true,
    lowStock: true,
    reviews: false,
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Settings</h1>
        <p className="text-sm text-admin-text-muted">Configure your store settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Store Info */}
        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Store Name</label>
              <input
                type="text"
                defaultValue="Misk Lume"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Description</label>
              <textarea
                rows={3}
                defaultValue="Luxury fragrances crafted with the finest ingredients from the heart of the East."
                className="w-full resize-none rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Contact Email</label>
              <input
                type="email"
                defaultValue="info@misklume.com"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Phone</label>
              <input
                type="tel"
                defaultValue="+92 300 1234567"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">Shipping</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Default Shipping Rate (PKR)</label>
              <input
                type="text"
                defaultValue="200"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Free Shipping Threshold (PKR)</label>
              <input
                type="text"
                defaultValue="8,000"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Estimated Delivery</label>
              <input
                type="text"
                defaultValue="4-5 business days"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">Payment Details</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Bank Name</label>
              <input
                type="text"
                defaultValue="Habib Bank Limited"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Account Title</label>
              <input
                type="text"
                defaultValue="Misk Lume (Pvt) Ltd"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Account Number</label>
              <input
                type="text"
                defaultValue="0123-4567-8901-2345"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">IBAN</label>
              <input
                type="text"
                defaultValue="PK36 HABB 0123 4567 8901 2345"
                className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">Notifications</h2>
          <div className="space-y-4">
            {([
              { key: "orders" as const, label: "Order Notifications", desc: "Get notified when a new order is placed" },
              { key: "lowStock" as const, label: "Low Stock Alerts", desc: "Alert when product stock falls below 5 units" },
              { key: "reviews" as const, label: "New Review Alerts", desc: "Get notified when a customer leaves a review" },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-admin-text">{item.label}</p>
                  <p className="text-xs text-admin-text-muted">{item.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    notifications[item.key] ? "bg-accent-gold" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifications[item.key] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="rounded-md bg-accent-gold px-6 py-2.5 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover">
          Save Changes
        </button>
      </div>
    </div>
  );
}
