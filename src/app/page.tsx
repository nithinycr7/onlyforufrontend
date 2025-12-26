'use client';

import { useRouter } from 'next/navigation';
import { Zap, Users, ArrowRight, CheckCircle, ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import styles from './page.module.css';

const FEATURED_CREATORS = [
  {
    slug: 'beerbiceps-ranveer',
    name: 'BeerBiceps - The Ranveer Show',
    niche: 'Lifestyle Podcast',
    image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&h=400&fit=crop',
    subscribers: '3.5K'
  },
  {
    slug: 'vismai-cooks',
    name: 'Vismai Cooks',
    niche: 'Cooking',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop',
    subscribers: '245'
  },
  {
    slug: 'tech-talks-nithin',
    name: 'Tech Talks with Ravi',
    niche: 'Technology',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
    subscribers: '892'
  },
  {
    slug: 'makeup-divya',
    name: 'Glam by Divya',
    niche: 'Bridal Makeup',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop',
    subscribers: '1.2K'
  },
  {
    slug: 'stylist-priya',
    name: "Priya's Closet",
    niche: 'Personal Styling',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop',
    subscribers: '634'
  },
  {
    slug: 'content-growth-ravi',
    name: 'Content Growth with Ravi',
    niche: 'Creator Strategy',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
    subscribers: '1.5K'
  },
  {
    slug: 'jyotish-sharma',
    name: 'Jyotish Guru Sharma',
    niche: 'Astrology',
    image: 'https://images.unsplash.com/photo-1532798442725-41036acc7489?w=400&h=400&fit=crop',
    subscribers: '2.1K'
  }
];

export default function LandingPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 1.5; // Increased from 0.5 for faster scrolling

    const scroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    };

    const intervalId = setInterval(scroll, 20);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="OnlyForU" className={styles.logo} />
          </div>
          <h1 className={styles.heroTitle}>
            OnlyForU
          </h1>
          <p className={styles.heroTagline}>
            Connect with Creators. Resolve Your Queries.
          </p>
          <p className={styles.heroDescription}>
            The platform where creators offer professional services and build engaged communities
          </p>

          <div className={styles.ctaButtons}>
            <button
              className={styles.primaryBtn}
              onClick={() => router.push('/auth')}
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => router.push('/home')}
            >
              Browse Creators
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <ChevronDown size={32} className={styles.scrollIcon} />
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Zap size={32} />
          </div>
          <h2>Resolve</h2>
          <p>Get expert help and professional services with SLA-backed response times</p>
          <ul className={styles.featureList}>
            <li><CheckCircle size={16} /> One-on-one consultations</li>
            <li><CheckCircle size={16} /> Expert problem-solving</li>
            <li><CheckCircle size={16} /> Guaranteed response times</li>
          </ul>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Users size={32} />
          </div>
          <h2>Connect</h2>
          <p>Join exclusive communities and engage directly with your favorite creators</p>
          <ul className={styles.featureList}>
            <li><CheckCircle size={16} /> Exclusive content drops</li>
            <li><CheckCircle size={16} /> Direct messaging</li>
            <li><CheckCircle size={16} /> Community membership</li>
          </ul>
        </div>
      </section>

      {/* Featured Creators Carousel */}
      <section className={styles.creatorsSection}>
        <h2 className={styles.sectionTitle}>Featured Creators</h2>
        <p className={styles.sectionSubtitle}>Discover experts across diverse fields</p>

        <div className={styles.carouselContainer}>
          <div className={styles.carouselTrack} ref={scrollRef}>
            {/* Duplicate creators for infinite scroll effect */}
            {[...FEATURED_CREATORS, ...FEATURED_CREATORS].map((creator, index) => (
              <div
                key={`${creator.slug}-${index}`}
                className={styles.creatorCard}
                onClick={() => router.push(`/creator/${creator.slug}`)}
              >
                <div className={styles.creatorImage}>
                  <img src={creator.image} alt={creator.name} />
                </div>
                <div className={styles.creatorInfo}>
                  <h3>{creator.name}</h3>
                  <p className={styles.creatorNiche}>{creator.niche}</p>
                  <p className={styles.creatorStats}>{creator.subscribers} subscribers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials */}
      <section className={styles.testimonials}>
        <h2 className={styles.sectionTitle}>Success Stories</h2>
        <p className={styles.sectionSubtitle}>Real results from our community</p>

        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialQuote}>"</div>
            <p className={styles.testimonialText}>
              "Got my kitty party menu planned in 2 days! Vismai's guidance helped me cook for 50 guests without stress. Everything turned out perfect!"
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorInfo}>
                <h4>Priya M.</h4>
                <p>Used: Menu Planning Service</p>
              </div>
              <div className={styles.testimonialResult}>
                <span className={styles.resultBadge}>✓ Wedding Success</span>
              </div>
            </div>
          </div>

          <div className={styles.testimonialCard}>
            <div className={styles.testimonialQuote}>"</div>
            <p className={styles.testimonialText}>
              "Ravi answered my podcast setup questions in detail! His equipment recommendations and recording tips helped me launch my show with confidence."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorInfo}>
                <h4>Arjun K.</h4>
                <p>Used: Podcast Q&A Session</p>
              </div>
              <div className={styles.testimonialResult}>
                <span className={styles.resultBadge}>✓ Podcast Launched</span>
              </div>
            </div>
          </div>

          <div className={styles.testimonialCard}>
            <div className={styles.testimonialQuote}>"</div>
            <p className={styles.testimonialText}>
              "Divya's bridal consultation gave me confidence for my big day. Her product recommendations were spot-on and budget-friendly!"
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorInfo}>
                <h4>Sneha R.</h4>
                <p>Used: Bridal Makeup Consultation</p>
              </div>
              <div className={styles.testimonialResult}>
                <span className={styles.resultBadge}>✓ Dream Wedding</span>
              </div>
            </div>
          </div>

          <div className={styles.testimonialCard}>
            <div className={styles.testimonialQuote}>"</div>
            <p className={styles.testimonialText}>
              "My YouTube channel grew from 500 to 5K subscribers in 3 months after implementing Ravi's content strategy!"
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorInfo}>
                <h4>Rahul S.</h4>
                <p>Used: Content Strategy Session</p>
              </div>
              <div className={styles.testimonialResult}>
                <span className={styles.resultBadge}>✓ 10x Growth</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>Ready to get started?</h2>
        <p>Join as a creator or fan today</p>
        <div className={styles.ctaButtons} style={{ justifyContent: 'center', marginTop: '24px' }}>
          <button
            className={styles.primaryBtn}
            onClick={() => router.push('/auth?role=creator')}
          >
            Join as Creator
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => router.push('/auth?role=fan')}
          >
            Join as Fan
          </button>
        </div>
      </section>
    </main>
  );
}
