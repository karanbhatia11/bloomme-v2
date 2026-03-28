'use client';

import React, { useState, useEffect } from 'react';
import DashboardTab from './tabs/DashboardTab';
import ContentManagerTab from './tabs/ContentManagerTab';
import UsersTab from './tabs/UsersTab';
import OrdersTab from './tabs/OrdersTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';

interface AdminDashboardProps {
    token: string;
    onLogout: () => void;
}

type TabType = 'dashboard' | 'content' | 'users' | 'orders' | 'subscriptions';

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
        { id: 'content', label: '📝 Content Manager', icon: '📝' },
        { id: 'users', label: '👥 Users', icon: '👥' },
        { id: 'orders', label: '📦 Orders', icon: '📦' },
        { id: 'subscriptions', label: '💳 Subscriptions', icon: '💳' }
    ] as const;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardTab token={token} />;
            case 'content':
                return <ContentManagerTab token={token} />;
            case 'users':
                return <UsersTab token={token} />;
            case 'orders':
                return <OrdersTab token={token} />;
            case 'subscriptions':
                return <SubscriptionsTab token={token} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">🌸 Bloomme Admin Panel</h1>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-purple-600 text-purple-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderTabContent()}
            </main>
        </div>
    );
}
