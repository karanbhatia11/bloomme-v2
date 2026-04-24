'use client';

import React, { useState, useEffect } from 'react';
import DashboardTab from './tabs/DashboardTab';
import ContentManagerTab from './tabs/ContentManagerTab';
import UsersTab from './tabs/UsersTab';
import OrdersTab from './tabs/OrdersTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import AddOnsTab from './tabs/AddOnsTab';
import DeliveriesTab from './tabs/DeliveriesTab';

interface AdminDashboardProps {
    token: string;
    onLogout: () => void;
}

type TabType = 'dashboard' | 'content' | 'users' | 'orders' | 'subscriptions' | 'addons' | 'deliveries';

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
        { id: 'content', label: '📝 Content Manager', icon: '📝' },
        { id: 'users', label: '👥 Users', icon: '👥' },
        { id: 'orders', label: '📦 Orders', icon: '📦' },
        { id: 'subscriptions', label: '💳 Subscriptions', icon: '💳' },
        { id: 'addons', label: '🎁 Add-Ons', icon: '🎁' },
        { id: 'deliveries', label: '🚴 Deliveries', icon: '🚴' }
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
            case 'addons':
                return <AddOnsTab token={token} />;
            case 'deliveries':
                return <DeliveriesTab token={token} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            {/* Header */}
            <header className="bg-white shadow overflow-x-hidden">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 flex justify-between items-center w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-shrink-0">🌸 Admin</h1>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium min-h-[44px] flex-shrink-0"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 overflow-x-auto">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                    <nav className="flex overflow-x-auto space-x-3 sm:space-x-6 lg:space-x-8 pb-4 no-scrollbar" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-h-[44px] flex items-center transition-all ${
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
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 w-full">
                {renderTabContent()}
            </main>
        </div>
    );
}
