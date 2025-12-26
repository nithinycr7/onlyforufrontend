'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, Clock, Lock, Star, Share2, ShieldCheck, MessageCircle, ArrowLeft } from 'lucide-react';
import { TierCard } from '@/components/features/TierCard';
import { PaymentModal } from '@/components/features/PaymentModal';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { api } from '@/lib/api';

// Mock Data for sample creators
const CREATORS: Record<string, any> = {
    'vismai-cooks': {
        name: 'Vismai Cooks',
        display_name: 'Vismai Cooks',
        niche: 'Cooking',
        vertical: 'resolve',
        bio: 'Traditional Telugu recipes and cooking tips. Join me for authentic home-style cooking!',
        image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80',
        cover_image_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80',
        profilePic: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop',
        profile_image_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop',
        fans: '245',
        active_subscribers: 245,
        rating: 4.9,
        items: [
            {
                title: 'Quick Recipe Help',
                subtitle: 'Fast fix for one cooking problem',
                price: 499,
                features: ['1 photo/video submission', 'Single clear fix', 'Text/voice reply', '24-48 hr SLA'],
                description: 'Perfect for daily cooking issues like curry taste fixes, ingredient substitutes, or texture problems'
            },
            {
                title: 'Recipe Consultation',
                subtitle: 'Detailed recipe review & improvement',
                price: 999,
                features: ['Up to 3 submissions', 'Detailed explanation', 'Voice/video response', '1 follow-up', '48 hr SLA'],
                isPopular: true,
                description: 'Improve taste, fix textures, get restaurant-style results'
            },
            {
                title: 'Menu Planning for Occasion',
                subtitle: 'Complete menu for your event',
                price: 1499,
                features: ['Menu suggestions', 'Quantity planning', 'Cooking sequence', 'Text + voice', '72 hr SLA'],
                description: 'Perfect for birthdays, festivals, functions, or weekly meal planning'
            },
            {
                title: 'Kitchen Setup Audit',
                subtitle: 'Optimize your kitchen workflow',
                price: 1999,
                features: ['Kitchen audit', 'Tool review', 'Workflow tips', 'Buying guide', 'Video response', '72 hr SLA'],
                description: 'Get your kitchen organized for maximum efficiency'
            },
            {
                title: 'Menu Scaling & Bulk Cooking',
                subtitle: 'Scale recipes without losing taste',
                price: 1999,
                features: ['Recipe scaling', 'Spice ratio correction', 'Bulk workflow', 'Storage tips', 'Voice/video'],
                description: 'Perfect for functions, catering, or community cooking'
            },
            {
                title: 'Cooking Vlog Help',
                subtitle: 'Improve your cooking content',
                price: 1999,
                features: ['Review 2-3 videos', 'Presentation feedback', 'Camera & lighting tips', 'Explanation improvement'],
                description: 'For aspiring food creators on YouTube/Instagram'
            },
            {
                title: 'Cooking Setup & Shooting',
                subtitle: 'Complete content creation setup',
                price: 2499,
                features: ['Kitchen review', 'Lighting setup', 'Camera placement', 'Audio suggestions', 'Recording workflow'],
                description: 'End-to-end guidance for serious cooking creators'
            }
        ]
    },
    'tech-talks-nithin': {
        name: 'Tech Talks with Ravi',
        display_name: 'Tech Talks with Ravi',
        niche: 'Technology Podcast',
        vertical: 'resolve',
        bio: 'Weekly tech podcast covering AI, startups, and innovation. Get expert insights!',
        image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
        cover_image_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
        profilePic: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop',
        profile_image_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop',
        fans: '892',
        active_subscribers: 892,
        rating: 4.8,
        items: [
            {
                title: 'Quick Tech Advice',
                subtitle: 'Fast, focused guidance on one question',
                price: 799,
                features: ['1 detailed question', 'Text/voice response', 'Clear recommendation', '24-48 hr SLA'],
                description: 'Perfect for tech stack choices, architecture decisions, or quick validations'
            },
            {
                title: 'Tech Consultation',
                subtitle: 'Structured technical review',
                price: 1499,
                features: ['Context review', 'Detailed breakdown', 'Pros & cons', 'Voice/video explanation', '1 follow-up', '48 hr SLA'],
                isPopular: true,
                description: 'Review architecture, fix performance, improve scalability, or get refactor suggestions'
            },
            {
                title: 'Startup Tech Stack Review',
                subtitle: 'End-to-end stack & architecture audit',
                price: 2999,
                features: ['Full stack review', 'Scalability & cost risks', 'Trade-offs explained', 'Alternative suggestions', 'Written + recorded summary', '72 hr SLA'],
                description: 'CTO-level feedback for early-stage startups and non-tech founders'
            },
            {
                title: 'Career Mentorship',
                subtitle: 'Personalized career guidance',
                price: 3499,
                features: ['Resume/LinkedIn/GitHub review', 'Career path guidance', 'Skill gap analysis', 'Role targeting', '2 async interactions', '5-7 day window'],
                description: 'Practical, role-based advice for students and engineers (0-5 years)'
            }
        ]
    },
    'makeup-divya': {
        name: 'Glam by Divya',
        display_name: 'Glam by Divya',
        niche: 'Bridal Makeup & Beauty',
        vertical: 'resolve',
        bio: 'Professional bridal makeup artist. Transform your look for weddings and special occasions!',
        image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
        cover_image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
        profilePic: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=200&fit=crop',
        profile_image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=200&fit=crop',
        fans: '1247',
        active_subscribers: 1247,
        rating: 4.9,
        items: [
            {
                title: 'Quick Makeup Tip',
                subtitle: 'Solve one makeup problem',
                price: 699,
                features: ['1 photo/video', 'Product recommendation', 'Text/voice reply', '24 hr SLA'],
                description: 'Fix foundation issues, eye makeup problems, or get quick product suggestions'
            },
            {
                title: 'Product Recommendation',
                subtitle: 'Find the perfect products',
                price: 999,
                features: ['Skin analysis', '5-7 product suggestions', 'Budget options', 'Where to buy', '48 hr SLA'],
                isPopular: true,
                description: 'Get personalized product recommendations for your skin type and budget'
            },
            {
                title: 'Bridal Makeup Consultation',
                subtitle: 'Plan your wedding look',
                price: 2499,
                features: ['Look planning', 'Trial guidance', 'Product list', 'Timeline', 'Video call', '72 hr SLA'],
                description: 'Complete bridal makeup planning for your big day'
            },
            {
                title: 'Full Wedding Makeup Planning',
                subtitle: 'Complete wedding beauty plan',
                price: 3999,
                features: ['Multiple looks', 'Pre-wedding skincare', 'Product shopping', 'Artist coordination', '2 video calls'],
                description: 'End-to-end wedding makeup planning including mehendi, sangeet, and wedding day'
            }
        ]
    },
    'stylist-priya': {
        name: "Priya's Closet",
        display_name: "Priya's Closet",
        niche: 'Personal Styling',
        vertical: 'resolve',
        bio: 'Your personal fashion consultant. Wardrobe makeovers and styling for every occasion!',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
        cover_image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
        profilePic: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop',
        profile_image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop',
        fans: '634',
        active_subscribers: 634,
        rating: 4.8,
        items: [
            {
                title: 'Quick Style Advice',
                subtitle: 'Solve one styling problem',
                price: 799,
                features: ['1 outfit review', 'Quick fix', 'Text/voice reply', '24 hr SLA'],
                description: 'Fix an outfit, get color advice, or solve a specific styling problem'
            },
            {
                title: 'Wardrobe Audit',
                subtitle: 'Organize & optimize your closet',
                price: 1499,
                features: ['Wardrobe review', 'Keep/donate list', 'Gap analysis', 'Shopping priorities', 'Video call', '48 hr SLA'],
                isPopular: true,
                description: 'Declutter your wardrobe and identify what you really need'
            },
            {
                title: 'Occasion Styling',
                subtitle: 'Perfect look for your event',
                price: 1999,
                features: ['Event styling', '3 outfit options', 'Accessories guide', 'Shopping links', '72 hr SLA'],
                description: 'Get styled for weddings, parties, interviews, or special occasions'
            },
            {
                title: 'Personal Shopping Guide',
                subtitle: 'Complete shopping assistance',
                price: 2999,
                features: ['Style assessment', 'Shopping list', 'Budget planning', 'Store recommendations', '2 follow-ups'],
                description: 'End-to-end shopping guidance with personalized recommendations'
            }
        ]
    },
    'content-growth-ravi': {
        name: 'Content Growth with Ravi',
        display_name: 'Content Growth with Ravi',
        niche: 'Creator Growth Strategy',
        vertical: 'resolve',
        bio: 'Helping creators grow on Instagram & YouTube. Monetization and content strategy expert!',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        profilePic: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
        profile_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
        fans: '1523',
        active_subscribers: 1523,
        rating: 4.9,
        items: [
            {
                title: 'Quick Channel Review',
                subtitle: 'Fast feedback on your content',
                price: 999,
                features: ['Review 3 posts/videos', 'Quick wins', 'Text/voice feedback', '24-48 hr SLA'],
                description: 'Get immediate actionable feedback on your content'
            },
            {
                title: 'Content Strategy Session',
                subtitle: 'Build your content roadmap',
                price: 2499,
                features: ['Niche analysis', '30-day content plan', 'Posting strategy', 'Video call', '1 follow-up', '48 hr SLA'],
                isPopular: true,
                description: 'Develop a winning content strategy for consistent growth'
            },
            {
                title: 'Monetization Blueprint',
                subtitle: 'Turn followers into income',
                price: 3499,
                features: ['Revenue analysis', 'Monetization options', 'Pricing strategy', 'Implementation plan', '72 hr SLA'],
                description: 'Learn how to monetize your audience effectively'
            },
            {
                title: 'Full Growth Audit',
                subtitle: 'Complete channel optimization',
                price: 4999,
                features: ['Deep analytics review', 'Content audit', 'Growth strategy', 'Monetization plan', '2 video calls', '7-day support'],
                description: 'Comprehensive audit and growth plan for serious creators'
            }
        ]
    },
    'jyotish-sharma': {
        name: 'Jyotish Guru Sharma',
        display_name: 'Jyotish Guru Sharma',
        niche: 'Astrology & Horoscope',
        vertical: 'resolve',
        bio: 'Vedic astrologer with 15+ years experience. Kundali readings, muhurtham, and life guidance.',
        image: 'https://images.unsplash.com/photo-1532798442725-41036acc7489?w=800&q=80',
        cover_image_url: 'https://images.unsplash.com/photo-1532798442725-41036acc7489?w=800&q=80',
        profilePic: 'https://images.unsplash.com/photo-1532798442725-41036acc7489?w=200&h=200&fit=crop',
        profile_image_url: 'https://images.unsplash.com/photo-1532798442725-41036acc7489?w=200&h=200&fit=crop',
        fans: '2156',
        active_subscribers: 2156,
        rating: 5.0,
        items: [
            {
                title: 'Quick Horoscope Question',
                subtitle: 'One specific question answered',
                price: 499,
                features: ['1 question', 'Birth details analysis', 'Text/voice reply', '24 hr SLA'],
                description: 'Get quick answers about career, marriage, health, or any life question'
            },
            {
                title: 'Detailed Kundali Reading',
                subtitle: 'Complete horoscope analysis',
                price: 1499,
                features: ['Full kundali analysis', 'Dasha predictions', 'Remedies', 'Voice/video explanation', '48 hr SLA'],
                isPopular: true,
                description: 'Comprehensive birth chart reading with predictions and remedies'
            },
            {
                title: 'Muhurtham Selection',
                subtitle: 'Auspicious time for events',
                price: 1999,
                features: ['Event analysis', '3 muhurtham options', 'Panchang details', 'Remedy suggestions', '72 hr SLA'],
                description: 'Find the perfect auspicious time for weddings, housewarming, or business launches'
            },
            {
                title: 'Annual Prediction',
                subtitle: 'Year-long guidance',
                price: 2999,
                features: ['12-month forecast', 'Month-wise predictions', 'Remedies', 'Lucky periods', 'Recorded reading', '2 follow-ups'],
                description: 'Complete yearly predictions with guidance for all life areas'
            }
        ]
    },
    'beerbiceps-ranveer': {
        name: 'BeerBiceps - The Ranveer Show',
        display_name: 'BeerBiceps - The Ranveer Show',
        niche: 'Lifestyle & Mindset Podcast',
        vertical: 'resolve',
        bio: "India's #1 podcast on personal growth, fitness, spirituality, and success. Get personalized advice from Ranveer!",
        image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=80',
        cover_image_url: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=80',
        profilePic: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=200&h=200&fit=crop',
        profile_image_url: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=200&h=200&fit=crop',
        fans: '3521',
        active_subscribers: 3521,
        rating: 4.9,
        items: [
            {
                title: 'Quick Life Advice',
                subtitle: 'One specific question answered',
                price: 999,
                features: ['1 question (career/fitness/mindset)', 'Voice note response', '24-48 hr SLA'],
                description: 'Get quick, actionable advice on career decisions, fitness goals, or mindset shifts'
            },
            {
                title: 'Trending Podcast Topic Suggestion',
                subtitle: 'Get viral-worthy topic ideas',
                price: 1299,
                features: ['Trending topic analysis', 'Audience engagement tips', 'Content angle suggestions', '48 hr SLA'],
                description: 'Perfect for podcasters looking for trending topics that resonate with audiences'
            },
            {
                title: 'Personal Growth Roadmap',
                subtitle: 'Customized transformation plan',
                price: 2499,
                features: ['30-min async consultation', 'Personalized growth plan', 'Book/resource recommendations', '1 follow-up', '72 hr SLA'],
                isPopular: true,
                description: 'Comprehensive roadmap for fitness, career, and mindset transformation'
            },
            {
                title: 'Podcast Production Consultation',
                subtitle: 'Lighting, music & editing guidance',
                price: 2999,
                features: ['Lighting setup tips', 'Music & sound design', 'Editing workflow', 'Equipment recommendations', 'Video response'],
                description: 'Complete production guidance to make your podcast look and sound professional'
            },
            {
                title: 'Podcast Guest Prep',
                subtitle: 'Prepare to shine on podcasts',
                price: 3999,
                features: ['Story/pitch review', 'Talking points guidance', 'Confidence coaching', 'Mock Q&A', '1 follow-up'],
                description: 'Get ready to be an amazing podcast guest with expert preparation'
            },
            {
                title: 'Start Your Own Podcast',
                subtitle: 'Complete podcast launch guide',
                price: 6999,
                features: ['Equipment & setup guide', 'Content strategy', 'Guest outreach tips', 'Monetization roadmap', '2 video calls', '2-week support'],
                description: 'Everything you need to launch a successful podcast from scratch'
            }
        ]
    }
};



export default function CreatorProfile() {
    const router = useRouter();
    const params = useParams();
    const slug = typeof params?.slug === 'string' ? params.slug : 'default';

    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        const fetchCreator = async () => {
            // Check if this is a sample creator first
            if (CREATORS[slug]) {
                setCreator(CREATORS[slug]);
                setLoading(false);
                return;
            }

            // Otherwise try to fetch from API
            try {
                const res = await api.get(`/creators/profile/${slug}`);
                setCreator(res.data);
            } catch (err) {
                console.error("Failed to fetch creator:", err);
                // Fallback to mock if available
                if (CREATORS[slug]) {
                    setCreator(CREATORS[slug]);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCreator();
    }, [slug]);

    if (loading) return <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>Loading...</div>;
    if (!creator) return <div className={styles.container}>Creator not found</div>;

    // Split packages
    const items = creator.packages ? creator.packages.filter((p: any) => p.package_type !== 'shoutout') : (creator.items || []);
    const shoutouts = creator.packages ? creator.packages.filter((p: any) => p.package_type === 'shoutout') : (creator.shoutouts || []);


    const handleSelect = (item: any) => {
        // Redirect to booking confirmation page
        // If item has no ID (mock data), use a query param or handle gracefully
        const serviceId = item.id || 'mock-id';
        const params = new URLSearchParams({
            title: item.title,
            price: (item.price || item.price_inr).toString(),
            creatorName: creator.display_name || creator.name,
            creatorId: creator.id || 'mock-creator-id'
        });

        router.push(`/bookings/create/${serviceId}?${params.toString()}`);
    };

    return (
        <main className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.coverImage} style={{ backgroundImage: `url(${creator.cover_image_url || creator.image})` }}>
                    <button className={styles.backButton} onClick={() => router.back()}><ArrowLeft size={24} color="white" /></button>
                    <button className={styles.shareButton}><Share2 size={24} color="white" /></button>
                </div>
            </div>

            {/* Profile Info */}
            <div className={styles.profileInfo} style={{ padding: '0 16px' }}>
                <div className={styles.avatarRow} style={{ marginTop: -40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                    <div className={styles.profilePic} style={{ backgroundImage: `url(${creator.profile_image_url || creator.profilePic})`, width: 80, height: 80, borderRadius: '50%', border: '3px solid white', backgroundColor: '#ddd' }} />
                    <Button variant="primary" style={{ height: 36, fontSize: 13 }}>Message</Button>
                </div>

                <div className={styles.nameRow} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <h1 className={styles.name} style={{ fontSize: 20, fontWeight: 700 }}>{creator.display_name || creator.name}</h1>
                    <div className={styles.badge} style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--success)', fontWeight: 600 }}><ShieldCheck size={14} style={{ marginRight: 2 }} /> Verified</div>
                </div>
                <p className={styles.niche} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{creator.niche} • {creator.active_subscribers || creator.fans} Fans • <Star size={12} fill="orange" strokeWidth={0} style={{ display: 'inline', marginBottom: 2 }} /> {creator.rating || 5.0}</p>

                <p className={styles.bio} style={{ fontSize: 14, lineHeight: 1.5, color: '#333' }}>{creator.bio}</p>
            </div>

            {/* Dynamic Content: Tiers or Packages */}
            <div className={styles.tiersSection} style={{ padding: 16, marginTop: 16 }}>
                <h2 className={styles.sectionTitle} style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                    {creator.vertical === 'connect' ? 'Membership Tiers' : 'Resolution Services'}
                </h2>

                <div className={styles.tierScroll} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map((item: any, index: number) => (
                        <TierCard
                            key={index}
                            title={item.title}
                            subtitle={item.subtitle}
                            price={item.price_inr || item.price}
                            features={item.features}
                            isPopular={item.is_popular || item.isPopular}
                            onSubscribe={() => handleSelect(item)}
                        />
                    ))}
                </div>
            </div>

            {/* Shoutouts (Fun Vertical Only) */}
            {creator.vertical === 'connect' && shoutouts.length > 0 && (
                <div className={styles.tiersSection} style={{ padding: 16, marginTop: 0 }}>
                    <h2 className={styles.sectionTitle} style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                        Book Personal Greetings 📣
                    </h2>
                    <div className={styles.tierScroll} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {shoutouts.map((item: any, index: number) => (
                            <TierCard
                                key={`shoutout-${index}`}
                                title={item.title}
                                price={item.price_inr || item.price}
                                features={item.features}
                                onSubscribe={() => handleSelect(item)}
                                buttonLabel="Book Now"
                                period=""
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Content Preview */}
            <div className={styles.contentSection} style={{ padding: 16, paddingBottom: 100 }}>
                <h2 className={styles.sectionTitle} style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, marginTop: 16 }}>
                    {creator.vertical === 'connect' ? 'Exclusive Content' : 'Client Results'}
                </h2>
                <div className={styles.contentGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={styles.contentPlaceholder} style={{ aspectRatio: '1', backgroundColor: '#f0f0f0', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', border: '1px dashed #ddd' }}>
                            <div className={styles.lockIcon}><MessageCircle size={24} /></div>
                            <span style={{ fontSize: 12, marginTop: 6 }}>{creator.vertical === 'fun' ? 'Locked Post' : 'Success Story'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                amount={selectedItem?.price || 0}
                planName={selectedItem?.title || ''}
            />
        </main>
    );
}
