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
        return <div className="text-center py-8 text-xs sm:text-sm">Loading...</div>;
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded text-xs sm:text-sm">{error}</div>;
    }

    if (!stats) {
        return <div className="text-center py-8 text-xs sm:text-sm">No data available</div>;
    }

    return (
        <div className="w-full overflow-x-hidden">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 px-4 sm:px-0">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
                    <div className="text-gray-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3">Total Users</div>
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-purple-600">{stats.total_users}</div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
                    <div className="text-gray-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3">Total Subscriptions</div>
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600">{stats.total_subscriptions}</div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
                    <div className="text-gray-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3">Active Subscriptions</div>
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-600">{stats.active_subscriptions}</div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
                    <div className="text-gray-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3">Conversion Rate</div>
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600">
                        {stats.total_users > 0
                            ? ((stats.total_subscriptions / stats.total_users) * 100).toFixed(1)
                            : 0}%
                    </div>
                </div>
            </div>

            {/* Plan Breakdown */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8 px-4 sm:px-0">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">Subscription Plans Breakdown</h3>
                <div className="space-y-3 sm:space-y-4 overflow-x-auto">
                    {stats.plan_breakdown && Array.isArray(stats.plan_breakdown) ? stats.plan_breakdown.map((plan, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 min-w-max sm:min-w-0">
                            <span className="text-gray-700 font-medium capitalize text-xs sm:text-sm md:text-base flex-shrink-0">{plan.plan_type}</span>
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-[80px] sm:min-w-[120px] md:min-w-[160px] lg:min-w-[200px] bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{
                                            width: `${(parseInt(plan.count) / stats.total_subscriptions) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900 w-10 sm:w-12 text-right flex-shrink-0">{plan.count}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 text-xs sm:text-sm py-4">No plan data available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
