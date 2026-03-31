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
    metadata?: Record<string, any>;
}

export default function ContentManagerTab({ token }: ContentManagerTabProps) {
    const [pages, setPages] = useState<string[]>(['home', 'about', 'contact', 'plans']);
    const [selectedPage, setSelectedPage] = useState('home');
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<ContentItem>>({});

    useEffect(() => {
        if (selectedPage) {
            fetchPageContent();
        }
    }, [selectedPage]);

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
        setFormData({ ...item });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string = 'image_url') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataToUpload = new FormData();
        formDataToUpload.append('image', file);

        try {
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataToUpload
            });

            if (response.ok) {
                const data = await response.json();
                const imageUrl = data.imageUrl;

                if (field === 'image_url') {
                    setFormData({ ...formData, image_url: imageUrl });
                } else if (field.startsWith('carousel_')) {
                    const [, itemIdx] = field.split('_');
                    const items = [...(formData.metadata?.carousel_items || [])];
                    items[parseInt(itemIdx)].image = imageUrl;
                    setFormData({ ...formData, metadata: { ...formData.metadata, carousel_items: items } });
                }
                alert('Image uploaded successfully!');
            } else {
                alert('Upload failed');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            alert('Error uploading image');
        }
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

    const renderForm = () => {
        if (!editing || !formData) return null;

        const item = content.find(c => c.id === editing);
        const type = item?.metadata?.type || 'generic';

        return (
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Edit: {item?.section_name}</h3>

                {/* GENERIC FIELDS */}
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
                    />
                </div>

                {/* TYPE-SPECIFIC FIELDS */}
                {type === 'hero' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.image_url || ''}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="Image URL"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-sm font-medium">
                                    📸 Upload
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'image_url')}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {formData.image_url && (
                                <div className="mt-3">
                                    <img src={formData.image_url} alt="Preview" className="h-40 object-cover rounded border" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                            <input
                                type="text"
                                value={formData.cta_text || ''}
                                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Social Proof Text</label>
                            <input
                                type="text"
                                value={formData.metadata?.social_proof || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    metadata: { ...formData.metadata, social_proof: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </>
                )}

                {type === 'ritual-cards' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cards</label>
                        <div className="space-y-4">
                            {formData.metadata?.cards?.map((card: any, idx: number) => (
                                <div key={idx} className="bg-white p-4 rounded border">
                                    <input
                                        type="text"
                                        placeholder="Icon (material symbol)"
                                        value={card.icon}
                                        onChange={(e) => {
                                            const cards = [...(formData.metadata?.cards || [])];
                                            cards[idx].icon = e.target.value;
                                            setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={card.title}
                                        onChange={(e) => {
                                            const cards = [...(formData.metadata?.cards || [])];
                                            cards[idx].title = e.target.value;
                                            setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={card.description}
                                        onChange={(e) => {
                                            const cards = [...(formData.metadata?.cards || [])];
                                            cards[idx].description = e.target.value;
                                            setFormData({ ...formData, metadata: { ...formData.metadata, cards } });
                                        }}
                                        rows={2}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {type === 'festival-carousel' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Festival Items</label>
                        <div className="space-y-4">
                            {formData.metadata?.carousel_items?.map((item: any, idx: number) => (
                                <div key={idx} className="bg-white p-4 rounded border">
                                    <input
                                        type="text"
                                        placeholder="Festival Name"
                                        value={item.name}
                                        onChange={(e) => {
                                            const items = [...(formData.metadata?.carousel_items || [])];
                                            items[idx].name = e.target.value;
                                            setFormData({ ...formData, metadata: { ...formData.metadata, carousel_items: items } });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Date"
                                        value={item.date}
                                        onChange={(e) => {
                                            const items = [...(formData.metadata?.carousel_items || [])];
                                            items[idx].date = e.target.value;
                                            setFormData({ ...formData, metadata: { ...formData.metadata, carousel_items: items } });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                                    />
                                    <div className="flex gap-1 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Image URL"
                                            value={item.image}
                                            onChange={(e) => {
                                                const items = [...(formData.metadata?.carousel_items || [])];
                                                items[idx].image = e.target.value;
                                                setFormData({ ...formData, metadata: { ...formData.metadata, carousel_items: items } });
                                            }}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                        <label className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer text-xs font-medium">
                                            📸
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, `carousel_${idx}`)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {item.image && <img src={item.image} alt="Preview" className="h-20 object-cover rounded mb-2 border" />}
                                    <textarea
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => {
                                            const items = [...(formData.metadata?.carousel_items || [])];
                                            items[idx].description = e.target.value;
                                            setFormData({ ...formData, metadata: { ...formData.metadata, carousel_items: items } });
                                        }}
                                        rows={2}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={() => setEditing(null)}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
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
                    {pages.map((page) => (
                        <option key={page} value={page}>
                            {page.charAt(0).toUpperCase() + page.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading content...</div>
            ) : editing ? (
                renderForm()
            ) : (
                <div className="space-y-4">
                    {content.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{item.section_name}</h3>
                                    <p className="text-gray-600 text-sm">{item.title}</p>
                                </div>
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    ✎ Edit
                                </button>
                            </div>

                            {item.image_url && (
                                <img src={item.image_url} alt={item.section_name} className="h-24 object-cover rounded mb-3" />
                            )}

                            {item.description && (
                                <p className="text-gray-700 text-sm mb-2 line-clamp-2">{item.description}</p>
                            )}

                            {item.metadata?.type && (
                                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                    {item.metadata.type}
                                </span>
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
