'use client';

import React, { useState, useEffect } from 'react';

interface UsersTabProps {
    token: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    created_at: string;
}

interface Subscription {
    id: number;
    user_id: number;
    plan_type: string;
    status: string;
    price: number;
    delivery_days: string;
    start_date: string;
    custom_schedule: any;
}

export default function UsersTab({ token }: UsersTabProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedUser, setExpandedUser] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchSubscriptions();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('/api/admin/subscriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setSubscriptions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch subscriptions:', err);
        }
    };

    const getUserSubscriptions = (userId: number) => {
        return subscriptions.filter((sub) => sub.user_id === userId);
    };

    const getNextDeliveryDate = (subscription: Subscription) => {
        if (!subscription.start_date) return 'N/A';
        const startDate = new Date(subscription.start_date);
        const days = parseInt(subscription.delivery_days || '7');
        const nextDate = new Date(startDate);
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate.toISOString().split('T')[0];
    };

    if (loading && users.length === 0) {
        return <div className="text-center py-8">Loading users...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Users Management</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subscriptions</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => {
                                const userSubs = getUserSubscriptions(user.id);
                                return (
                                    <React.Fragment key={user.id}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                    {userSubs.length}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                                >
                                                    {expandedUser === user.id ? 'Hide' : 'View'} Details
                                                </button>
                                            </td>
                                        </tr>

                                        {expandedUser === user.id && userSubs.length > 0 && (
                                            <tr className="bg-blue-50">
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="space-y-3">
                                                        {userSubs.map((sub) => (
                                                            <div key={sub.id} className="bg-white p-4 rounded border border-blue-200">
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <span className="text-gray-600">Plan:</span>
                                                                        <span className="ml-2 font-semibold">{sub.plan_type}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">Status:</span>
                                                                        <span className={`ml-2 font-semibold px-2 py-1 rounded text-xs ${
                                                                            sub.status === 'active'
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : sub.status === 'paused'
                                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                                : 'bg-red-100 text-red-800'
                                                                        }`}>
                                                                            {sub.status}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">Price:</span>
                                                                        <span className="ml-2 font-semibold">₹{sub.price}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">Delivery Days:</span>
                                                                        <span className="ml-2 font-semibold">Every {sub.delivery_days} days</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">Start Date:</span>
                                                                        <span className="ml-2 font-semibold">
                                                                            {new Date(sub.start_date).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-600">Next Delivery:</span>
                                                                        <span className="ml-2 font-semibold">{getNextDeliveryDate(sub)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                        {expandedUser === user.id && userSubs.length === 0 && (
                                            <tr className="bg-blue-50">
                                                <td colSpan={6} className="px-6 py-4 text-center text-gray-600 text-sm">
                                                    No subscriptions
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="text-center py-8 text-gray-600">No users found</div>
                )}
            </div>
        </div>
    );
}
