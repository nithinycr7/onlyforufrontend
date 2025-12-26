'use client';

import { useState, useEffect } from 'react';
import { CreatorCard } from '@/components/features/CreatorCard';
import styles from './page.module.css';
import { Zap, Users, Search } from 'lucide-react';
import { api } from '@/lib/api';

const CATEGORIES = ['All', 'Resolve', 'Connect', 'Trending'];

// Static sample creators for better UX
const SAMPLE_CREATORS = [
    {
        id: 'sample-1',
        slug: 'vismai-cooks',
        display_name: 'Vismai Cooks',
        niche: 'Cooking',
        bio: 'Traditional Telugu recipes and cooking tips. Join me for authentic home-style cooking!',
        cover_image_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80',
        profile_image_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop',
        active_subscribers: 245,
        verified_badge: true
    },
    {
        id: 'sample-2',
        slug: 'tech-talks-nithin',
        display_name: 'Tech Talks with Ravi',
        niche: 'Technology Podcast',
        bio: 'Weekly tech podcast covering AI, startups, and innovation. Get expert insights!',
        cover_image_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
        profile_image_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop',
        active_subscribers: 892,
        verified_badge: true
    },
    {
        id: 'sample-3',
        slug: 'makeup-divya',
        display_name: 'Glam by Divya',
        niche: 'Bridal Makeup & Beauty',
        bio: 'Professional bridal makeup artist. Transform your look for weddings and special occasions!',
        cover_image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
        profile_image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=200&fit=crop',
        active_subscribers: 1247,
        verified_badge: true
    },
    {
        id: 'sample-4',
        slug: 'stylist-priya',
        display_name: "Priya's Closet",
        niche: 'Personal Styling',
        bio: 'Your personal fashion consultant. Wardrobe makeovers and styling for every occasion!',
        cover_image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
        profile_image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop',
        active_subscribers: 634,
        verified_badge: true
    },
    {
        id: 'sample-5',
        slug: 'content-growth-ravi',
        display_name: 'Content Growth with Ravi',
        niche: 'Creator Growth Strategy',
        bio: 'Helping creators grow on Instagram & YouTube. Monetization and content strategy expert!',
        cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        profile_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
        active_subscribers: 1523,
        verified_badge: true
    },
    {
        id: 'sample-6',
        slug: 'jyotish-sharma',
        display_name: 'Jyotish Guru Sharma',
        niche: 'Astrology & Horoscope',
        bio: 'Vedic astrologer with 15+ years experience. Kundali readings, muhurtham, and life guidance.',
        cover_image_url: 'https://images.unsplash.com/photo-1532798442725-41036acc7489?w=800&q=80',
        profile_image_url: 'https://images.unsplash.com/photo-1532798442725-41036acc7489?w=200&h=200&fit=crop',
        active_subscribers: 2156,
        verified_badge: true
    },
    {
        id: 'sample-7',
        slug: 'beerbiceps-ranveer',
        display_name: 'BeerBiceps - The Ranveer Show',
        niche: 'Lifestyle & Mindset Podcast',
        bio: "India's #1 podcast on personal growth, fitness, spirituality, and success. Get personalized advice!",
        cover_image_url: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=80',
        profile_image_url: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=200&h=200&fit=crop',
        active_subscribers: 3521,
        verified_badge: true
    }
];

export default function HomePage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [trendingCreators, setTrendingCreators] = useState<any[]>(SAMPLE_CREATORS);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/feed/trending?limit=10');
                // Merge API data with sample creators
                if (res.data && res.data.length > 0) {
                    setTrendingCreators([...SAMPLE_CREATORS, ...res.data]);
                }
            } catch (err) {
                console.error("Failed to fetch trending:", err);
                // Keep sample creators on error
            }
        };
        fetchData();
    }, []);

    // Filter creators based on active category
    const filteredCreators = trendingCreators.filter(creator => {
        if (activeCategory === 'All') return true;
        if (activeCategory === 'Trending') return true;
        // Filter by vertical when backend supports it
        return true;
    });

    return (
        <main className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Connect with Creators.<br />
                        Resolve Your Queries.
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Discover creators who offer professional services and build amazing communities
                    </p>

                    {/* Value Props */}
                    <div className={styles.valueProps}>
                        <div className={styles.valueProp}>
                            <div className={styles.valueIcon}>
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3>Resolve</h3>
                                <p>Get expert help with SLA-backed responses</p>
                            </div>
                        </div>
                        <div className={styles.valueProp}>
                            <div className={styles.valueIcon}>
                                <Users size={24} />
                            </div>
                            <div>
                                <h3>Connect</h3>
                                <p>Join exclusive communities and engage</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className={styles.searchSection}>
                <div className={styles.searchBar}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search creators by name or niche..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* Filter Categories */}
            <div className={styles.filterSection}>
                <div className={styles.filterScroll}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterChip} ${activeCategory === cat ? styles.active : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Creators Feed */}
            <div className={styles.feedSection}>
                <h2 className={styles.sectionTitle}>
                    {activeCategory === 'All' ? 'Discover Creators' : `${activeCategory} Creators`}
                </h2>

                <div className={styles.feedGrid}>
                    {filteredCreators.length > 0 ? (
                        filteredCreators
                            .filter(creator =>
                                searchQuery === '' ||
                                creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                creator.niche.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(creator => (
                                <CreatorCard
                                    key={creator.id}
                                    id={creator.slug}
                                    name={creator.display_name}
                                    niche={creator.niche}
                                    bio={creator.bio}
                                    image={creator.cover_image_url || 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&q=80'}
                                    profilePic={creator.profile_image_url || 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=200&h=200&fit=crop'}
                                    fans={creator.active_subscribers}
                                    price={99}
                                    isVerified={creator.verified_badge}
                                />
                            ))
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎭</div>
                            <h3>No creators yet</h3>
                            <p>Be the first creator to join our platform!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
