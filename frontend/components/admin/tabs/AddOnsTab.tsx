'use client';

import React, { useState, useEffect } from 'react';

interface AddOnsTabProps {
    token: string;
}

interface AddOn {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    order_id: number;
    addon_name: string;
    quantity: number;
    price: number;
    status: string;
    created_at: string;
}

export default function AddOnsTab({ token }: AddOnsTabProps) {
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [expandedAddon, setExpandedAddon] = useState<number | null>(null);

    useEffect(() => {
        fetchAddOns();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchAddOns, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAddOns = async () => {
        try {
            setLoading(true);
            console.log('Fetching add-ons...');
            const response = await fetch('/api/admin/addons', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Add-ons fetched:', data.length);
            setAddOns(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch add-ons:', err);
            setAddOns([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredAddOns = filter === 'all' ? addOns : addOns.filter((a) => a.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    if (loading && addOns.length === 0) {
        return <div className="text-center py-8">Loading add-ons...</div>;
    }

    const stats = {
        paid: addOns.filter((a) => a.status === 'paid').length,
        pending: addOns.filter((a) => a.status === 'pending').length,
        failed: addOns.filter((a) => a.status === 'failed').length,
        total: addOns.length
    };

    return (
        <div className="w-full overflow-x-hidden">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">Add-Ons Management</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 px-4 sm:px-0">
                <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-600 truncate">Total</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-green-700 font-semibold truncate">Paid</div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{stats.paid}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-yellow-700 font-semibold truncate">Pending</div>
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
                </div>
                <div className="bg-red-50 rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-red-700 font-semibold truncate">Failed</div>
                    <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{stats.failed}</div>
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
                    <option value="all">All Add-Ons ({stats.total})</option>
                    <option value="paid">Paid ({stats.paid})</option>
                    <option value="pending">Pending ({stats.pending})</option>
                    <option value="failed">Failed ({stats.failed})</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full min-w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Order</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Customer</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Add-On</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Qty</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Price</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Date</th>
                                <th className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAddOns.map((addon) => (
                                <React.Fragment key={addon.id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">#{addon.order_id}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                            <div className="text-gray-900 font-medium truncate">{addon.user_name}</div>
                                            <div className="text-gray-600 text-[10px] sm:text-xs truncate">{addon.user_email}</div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">{addon.addon_name}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{addon.quantity}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">₹{addon.price}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusColor(addon.status)}`}>
                                                {addon.status}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                            {formatDate(addon.created_at)}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                            <button
                                                onClick={() => setExpandedAddon(expandedAddon === addon.id ? null : addon.id)}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm whitespace-nowrap min-h-[44px] inline-flex items-center justify-center"
                                            >
                                                {expandedAddon === addon.id ? 'Hide' : 'View'} Details
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedAddon === addon.id && (
                                        <tr className="bg-blue-50">
                                            <td colSpan={8} className="px-6 py-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">User ID:</span>
                                                        <span className="ml-2 font-semibold">#{addon.user_id}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Order ID:</span>
                                                        <span className="ml-2 font-semibold">#{addon.order_id}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Add-On Name:</span>
                                                        <span className="ml-2 font-semibold">{addon.addon_name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Total Price:</span>
                                                        <span className="ml-2 font-semibold">₹{addon.price * addon.quantity}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAddOns.length === 0 && (
                    <div className="text-center py-8 text-gray-600">No add-ons found</div>
                )}
            </div>
        </div>
    );
}
