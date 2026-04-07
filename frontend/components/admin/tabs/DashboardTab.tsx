'use client';

import React, { useState, useEffect } from 'react';

interface DashboardTabProps {
    token: string;
}

interface Stats {
    total_users: number;
    total_subscriptions: number;
    active_subscriptions: number;
    plan_breakdown: Array<{ plan_type: string; count: string }>;
}

export default function DashboardTab({ token }: DashboardTabProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data);
        } catch (err: any) {
            setError('Failed to load stats: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>;
    }

    if (!stats) {
        return <div className="text-center py-8">No data available</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Users</div>
                    <div className="text-4xl font-bold text-purple-600">{stats.total_users}</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Subscriptions</div>
                    <div className="text-4xl font-bold text-blue-600">{stats.total_subscriptions}</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-medium mb-2">Active Subscriptions</div>
                    <div className="text-4xl font-bold text-green-600">{stats.active_subscriptions}</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-medium mb-2">Conversion Rate</div>
                    <div className="text-4xl font-bold text-orange-600">
                        {stats.total_users > 0
                            ? ((stats.total_subscriptions / stats.total_users) * 100).toFixed(1)
                            : 0}%
                    </div>
                </div>
            </div>

            {/* Plan Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Subscription Plans Breakdown</h3>
                <div className="space-y-3">
                    {stats.plan_breakdown && Array.isArray(stats.plan_breakdown) ? stats.plan_breakdown.map((plan, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium capitalize">{plan.plan_type}</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-48 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{
                                            width: `${(parseInt(plan.count) / stats.total_subscriptions) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <span className="font-bold text-lg text-gray-900 w-12 text-right">{plan.count}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500">No plan data available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
