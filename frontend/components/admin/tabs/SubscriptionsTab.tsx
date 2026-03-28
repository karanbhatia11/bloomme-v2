'use client';

import React, { useState, useEffect } from 'react';

interface SubscriptionsTabProps {
    token: string;
}

interface Subscription {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    plan_type: string;
    price: number;
    status: string;
    delivery_days: string;
    start_date: string;
    custom_schedule: any;
    created_at: string;
}

export default function SubscriptionsTab({ token }: SubscriptionsTabProps) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/subscriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setSubscriptions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubscriptions = filter === 'all' ? subscriptions : subscriptions.filter((s) => s.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getNextDeliveryDate = (subscription: Subscription) => {
        if (!subscription.start_date) return 'N/A';
        const startDate = new Date(subscription.start_date);
        const days = parseInt(subscription.delivery_days || '7');
        const nextDate = new Date(startDate);
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate.toISOString().split('T')[0];
    };

    if (loading && subscriptions.length === 0) {
        return <div className="text-center py-8">Loading subscriptions...</div>;
    }

    const stats = {
        active: subscriptions.filter((s) => s.status === 'active').length,
        paused: subscriptions.filter((s) => s.status === 'paused').length,
        cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
        total: subscriptions.length
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Subscriptions Management</h2>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-4">
                    <div className="text-sm text-green-700 font-semibold">Active</div>
                    <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg shadow p-4">
                    <div className="text-sm text-yellow-700 font-semibold">Paused</div>
                    <div className="text-3xl font-bold text-yellow-600">{stats.paused}</div>
                </div>
                <div className="bg-red-50 rounded-lg shadow p-4">
                    <div className="text-sm text-red-700 font-semibold">Cancelled</div>
                    <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
                </div>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                    <option value="all">All Subscriptions ({stats.total})</option>
                    <option value="active">Active ({stats.active})</option>
                    <option value="paused">Paused ({stats.paused})</option>
                    <option value="cancelled">Cancelled ({stats.cancelled})</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sub ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Plan</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Delivery Days</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Next Delivery</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSubscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{sub.id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="text-gray-900 font-medium">{sub.user_name}</div>
                                        <div className="text-gray-600 text-xs">{sub.user_email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase">{sub.plan_type}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{sub.price}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">Every {sub.delivery_days} days</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(sub.start_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                                        {getNextDeliveryDate(sub)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredSubscriptions.length === 0 && (
                    <div className="text-center py-8 text-gray-600">No subscriptions found</div>
                )}
            </div>
        </div>
    );
}
