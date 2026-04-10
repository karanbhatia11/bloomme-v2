'use client';

import React, { useState, useEffect } from 'react';

interface OrdersTabProps {
    token: string;
}

interface Order {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    user_phone: string;
    order_type: string;
    amount: number;
    status: string;
    promo_code: string;
    promo_discount: number;
    referral_discount: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    created_at: string;
    paid_at: string;
}

export default function OrdersTab({ token }: OrdersTabProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            console.log('Fetching orders...');
            const response = await fetch('/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Orders fetched:', data.length);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

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

    if (loading && orders.length === 0) {
        return <div className="text-center py-8">Loading orders...</div>;
    }

    return (
        <div className="w-full overflow-x-hidden">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">Orders Management</h2>

            {/* Filter */}
            <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-xs sm:text-sm min-h-[44px]"
                >
                    <option value="all">All Orders ({orders.length})</option>
                    <option value="paid">Paid ({orders.filter((o) => o.status === 'paid').length})</option>
                    <option value="pending">Pending ({orders.filter((o) => o.status === 'pending').length})</option>
                    <option value="failed">Failed ({orders.filter((o) => o.status === 'failed').length})</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full min-w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">ID</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Customer</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Type</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Amount</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Date</th>
                                <th className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <React.Fragment key={order.id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">#{order.id}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                            <div className="text-gray-900 font-medium truncate">{order.user_name}</div>
                                            <div className="text-gray-600 text-[10px] sm:text-xs truncate">{order.user_email}</div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm capitalize text-gray-600 whitespace-nowrap">{order.order_type}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">₹{order.amount}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                            <button
                                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm whitespace-nowrap min-h-[44px] inline-flex items-center justify-center"
                                            >
                                                {expandedOrder === order.id ? 'Hide' : 'View'}
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedOrder === order.id && (
                                        <tr className="bg-blue-50">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Phone:</span>
                                                        <span className="ml-2 font-semibold">{order.user_phone}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Razorpay Order ID:</span>
                                                        <span className="ml-2 font-semibold text-xs break-words">{order.razorpay_order_id || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Razorpay Payment ID:</span>
                                                        <span className="ml-2 font-semibold text-xs break-words">{order.razorpay_payment_id || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Paid At:</span>
                                                        <span className="ml-2 font-semibold">
                                                            {order.paid_at ? new Date(order.paid_at).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    {order.promo_code && (
                                                        <>
                                                            <div>
                                                                <span className="text-gray-600">Promo Code:</span>
                                                                <span className="ml-2 font-semibold">{order.promo_code}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Promo Discount:</span>
                                                                <span className="ml-2 font-semibold">₹{order.promo_discount}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {order.referral_discount > 0 && (
                                                        <div>
                                                            <span className="text-gray-600">Referral Discount:</span>
                                                            <span className="ml-2 font-semibold">₹{order.referral_discount}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-600">No orders found</div>
                )}
            </div>
        </div>
    );
}
