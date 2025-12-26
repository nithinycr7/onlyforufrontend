import CreatorProfile from './CreatorClient';

// Generate static params for sample creators
export async function generateStaticParams() {
    return [
        { slug: 'vismai-cooks' },
        { slug: 'tech-talks-nithin' },
        { slug: 'makeup-divya' },
        { slug: 'stylist-priya' },
        { slug: 'content-growth-ravi' },
        { slug: 'jyotish-sharma' },
        { slug: 'beerbiceps-ranveer' },
    ];
}

export default function Page() {
    return <CreatorProfile />;
}
