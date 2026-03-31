'use client';

import React, { useState, useEffect } from 'react';

interface ContentManagerTabProps {
    token: string;
}

interface ContentItem {
    id: number;
    page_name: string;
    section_name: string;
    title: string;
    subtitle: string;
    description: string;
    image_url: string;
    cta_text: string;
    cta_link: string;
    display_order: number;
}

export default function ContentManagerTab({ token }: ContentManagerTabProps) {
    const [pages, setPages] = useState<string[]>(['home']);
    const [selectedPage, setSelectedPage] = useState('home');
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<ContentItem>>({});

    useEffect(() => {
        fetchPages();
    }, []);

    useEffect(() => {
        if (selectedPage) {
            fetchPageContent();
        }
    }, [selectedPage]);

    const fetchPages = async () => {
        try {
            const response = await fetch('/api/admin/page-content/list/pages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPages(Array.isArray(data) ? data : ['home']);
        } catch (err: any) {
            console.error('Failed to fetch pages:', err);
            setPages(['home']);
        }
    };

    const fetchPageContent = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/page-content?page=${selectedPage}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setContent(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch content:', err);
            setContent([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: ContentItem) => {
        setEditing(item.id);
        setFormData(item);
    };

    const handleSave = async () => {
        if (!editing) return;

        try {
            const response = await fetch(`/api/admin/page-content/${editing}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setEditing(null);
                fetchPageContent();
            }
        } catch (err: any) {
            console.error('Failed to save content:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this content?')) return;

        try {
            const response = await fetch(`/api/admin/page-content/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchPageContent();
            }
        } catch (err: any) {
            console.error('Failed to delete content:', err);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Content Manager</h2>

            {/* Page Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Page</label>
                <select
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                    {pages && pages.length > 0 ? pages.map((page) => (
                        <option key={page} value={page}>
                            {page.charAt(0).toUpperCase() + page.slice(1)}
                        </option>
                    )) : (
                        <option value="home">Home</option>
                    )}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading content...</div>
            ) : (
                <div className="space-y-6">
                    {content.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow p-6">
                            {editing === item.id ? (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold mb-4">Edit Section: {item.section_name}</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                        <input
                                            type="text"
                                            value={formData.subtitle || ''}
                                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image_url || ''}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        />
                                        {formData.image_url && (
                                            <img src={formData.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded" />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                                            <input
                                                type="text"
                                                value={formData.cta_text || ''}
                                                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                                            <input
                                                type="text"
                                                value={formData.cta_link || ''}
                                                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditing(null)}
                                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{item.section_name}</h3>
                                            <p className="text-gray-600">{item.title}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-3">{item.description}</p>

                                    {item.image_url && (
                                        <img src={item.image_url} alt={item.section_name} className="h-40 object-cover rounded mb-3" />
                                    )}

                                    {item.cta_text && (
                                        <div className="text-sm text-gray-600">
                                            <strong>CTA:</strong> {item.cta_text} → {item.cta_link}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {content.length === 0 && (
                        <div className="text-center py-8 text-gray-600">No content found for this page</div>
                    )}
                </div>
            )}
        </div>
    );
}
