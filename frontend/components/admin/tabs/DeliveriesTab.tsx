'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface DeliveriesTabProps {
    token: string;
}

interface Delivery {
    delivery_id: number;
    delivery_date: string;
    delivery_day: string;
    order_type: string;
    delivery_type: string;
    customer_name: string;
    phone: string;
    house_number: string;
    street: string;
    area: string;
    city: string;
    pin_code: string;
    delivery_slot: string | null;
    plan_name: string | null;
    plan_price: number | null;
    subscription_id: number | null;
    order_id: number | null;
    delivery_status: string;
    payment_status: string | null;
    addon_total: number;
    total_amount: number;
    addons: Array<{ name: string; qty: number }> | null;
}

type SubTab = 'tomorrow' | 'next_week' | 'next_month';

function getDateRange(tab: SubTab): { from: string; to: string } {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const toISO = (d: Date) => d.toISOString().split('T')[0];

    if (tab === 'tomorrow') {
        return { from: toISO(tomorrow), to: toISO(tomorrow) };
    }
    if (tab === 'next_week') {
        const end = new Date(tomorrow);
        end.setDate(end.getDate() + 6);
        return { from: toISO(tomorrow), to: toISO(end) };
    }
    // next_month
    const end = new Date(tomorrow);
    end.setDate(end.getDate() + 29);
    return { from: toISO(tomorrow), to: toISO(end) };
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' });
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-blue-100 text-blue-800';
    }
}

function getTypeBadge(type: string) {
    switch (type) {
        case 'sub+addons':
            return 'bg-purple-100 text-purple-800';
        case 'addon_only':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export default function DeliveriesTab({ token }: DeliveriesTabProps) {
    const [activeTab, setActiveTab] = useState<SubTab>('tomorrow');
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState<Record<SubTab, number>>({ tomorrow: 0, next_week: 0, next_month: 0 });

    const fetchDeliveries = useCallback(async (tab: SubTab) => {
        setLoading(true);
        try {
            const { from, to } = getDateRange(tab);
            const res = await fetch(`/api/admin/delivery-manifest?from_date=${from}&to_date=${to}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            const rows = Array.isArray(data) ? data : [];
            setDeliveries(rows);
            setCounts(prev => ({ ...prev, [tab]: rows.length }));
        } catch {
            setDeliveries([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Pre-fetch counts for all tabs on mount
    useEffect(() => {
        const tabs: SubTab[] = ['tomorrow', 'next_week', 'next_month'];
        tabs.forEach(async (tab) => {
            try {
                const { from, to } = getDateRange(tab);
                const res = await fetch(`/api/admin/delivery-manifest?from_date=${from}&to_date=${to}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                const count = Array.isArray(data) ? data.length : 0;
                setCounts(prev => ({ ...prev, [tab]: count }));
                if (tab === 'tomorrow') setDeliveries(Array.isArray(data) ? data : []);
            } catch {}
        });
    }, [token]);

    const handleTabChange = (tab: SubTab) => {
        setActiveTab(tab);
        fetchDeliveries(tab);
    };

    const grouped = deliveries.reduce<Record<string, Delivery[]>>((acc, d) => {
        const key = d.delivery_date.split('T')[0];
        if (!acc[key]) acc[key] = [];
        acc[key].push(d);
        return acc;
    }, {});

    const subTabs: { id: SubTab; label: string }[] = [
        { id: 'tomorrow', label: 'Tomorrow' },
        { id: 'next_week', label: 'Next 7 Days' },
        { id: 'next_month', label: 'Next 30 Days' },
    ];

    return (
        <div className="w-full overflow-x-hidden">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">Deliveries</h2>

            {/* Sub-tabs */}
            <div className="flex gap-2 mb-6 px-4 sm:px-0 flex-wrap">
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[36px] flex items-center gap-2 ${
                            activeTab === tab.id
                                ? 'bg-purple-600 text-white shadow'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                        }`}
                    >
                        {tab.label}
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                            activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                        }`}>
                            {counts[tab.id]}
                        </span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 text-sm">Loading deliveries…</div>
            ) : deliveries.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
                    No deliveries scheduled for this period
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, rows]) => (
                        <div key={date} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            {/* Date header */}
                            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <span className="font-semibold text-sm text-gray-800">{formatDate(date)}</span>
                                <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-0.5 font-medium">
                                    {rows.length} delivery{rows.length !== 1 ? 'ies' : ''}
                                </span>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-full">
                                    <thead>
                                        <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                                            <th className="px-4 sm:px-6 py-2.5 font-medium whitespace-nowrap">Customer</th>
                                            <th className="px-4 sm:px-6 py-2.5 font-medium whitespace-nowrap">Address</th>
                                            <th className="px-4 sm:px-6 py-2.5 font-medium whitespace-nowrap">Type</th>
                                            <th className="px-4 sm:px-6 py-2.5 font-medium whitespace-nowrap">Plan</th>
                                            <th className="px-4 sm:px-6 py-2.5 font-medium whitespace-nowrap">Add-ons</th>
                                            <th className="px-4 sm:px-6 py-2.5 font-medium whitespace-nowrap">Amount</th>
                                            <th className="px-4 sm:px-6 py-2.5 font-medium whitespace-nowrap">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {rows.map((d, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 sm:px-6 py-3">
                                                    <div className="font-medium text-sm text-gray-900">{d.customer_name || '—'}</div>
                                                    <div className="text-xs text-gray-500">{d.phone || '—'}</div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 text-xs text-gray-600 max-w-[200px]">
                                                    <div className="truncate">
                                                        {[d.house_number, d.street, d.area].filter(Boolean).join(', ') || '—'}
                                                    </div>
                                                    <div className="text-gray-400">{d.city}{d.pin_code ? ` - ${d.pin_code}` : ''}</div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getTypeBadge(d.delivery_type)}`}>
                                                        {d.delivery_type === 'sub+addons' ? 'Sub + Addons' : d.delivery_type === 'addon_only' ? 'Add-on Only' : 'Subscription'}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 capitalize whitespace-nowrap">
                                                    {d.plan_name || '—'}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 text-xs text-gray-600">
                                                    {d.addons && d.addons.length > 0
                                                        ? d.addons.map((a, j) => (
                                                            <div key={j} className="whitespace-nowrap">
                                                                {a.qty > 1 && <span className="font-semibold">{a.qty}× </span>}
                                                                {a.name}
                                                            </div>
                                                        ))
                                                        : <span className="text-gray-300">—</span>
                                                    }
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                                                    ₹{d.total_amount}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${getStatusBadge(d.delivery_status)}`}>
                                                        {d.delivery_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
