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
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchSubscriptions, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            console.log('Fetching subscriptions...');
            const response = await fetch('/api/admin/subscriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Subscriptions fetched:', data.length);
            setSubscriptions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch subscriptions:', err);
            setSubscriptions([]);
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

    const formatDate = (dateString: string | null): string => {
        try {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    const getNextDeliveryDate = (subscription: Subscription) => {
        try {
            if (!subscription.start_date) return 'N/A';
            const startDate = new Date(subscription.start_date);
            if (isNaN(startDate.getTime())) return 'N/A';
            const days = parseInt(subscription.delivery_days || '7');
            const nextDate = new Date(startDate);
            nextDate.setDate(nextDate.getDate() + days);
            return `${nextDate.getFullYear()}-${String(nextDate.getMonth()+1).padStart(2,'0')}-${String(nextDate.getDate()).padStart(2,'0')}`;
        } catch (error) {
            console.error('Error calculating next delivery date:', error);
            return 'N/A';
        }
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
        <div className="w-full overflow-x-hidden">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">Subscriptions Management</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 px-4 sm:px-0">
                <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-600 truncate">Total</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-green-700 font-semibold truncate">Active</div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{stats.active}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-yellow-700 font-semibold truncate">Paused</div>
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">{stats.paused}</div>
                </div>
                <div className="bg-red-50 rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-red-700 font-semibold truncate">Cancelled</div>
                    <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{stats.cancelled}</div>
                </div>
            </div>

            {/* Filter */}
            <div className="mb-4 sm:mb-6 px-4 sm:px-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-xs sm:text-sm min-h-[44px]"
                >
                    <option value="all">All Subscriptions ({stats.total})</option>
                    <option value="active">Active ({stats.active})</option>
                    <option value="paused">Paused ({stats.paused})</option>
                    <option value="cancelled">Cancelled ({stats.cancelled})</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full min-w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">ID</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Customer</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Plan</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Price</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Days</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Start</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Next</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSubscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">#{sub.id}</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                        <div className="text-gray-900 font-medium truncate">{sub.user_name}</div>
                                        <div className="text-gray-600 text-[10px] sm:text-xs truncate">{sub.user_email}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 uppercase whitespace-nowrap">{sub.plan_type}</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">₹{sub.price}</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize ${getStatusColor(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{sub.delivery_days}d</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                        {formatDate(sub.start_date)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
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
