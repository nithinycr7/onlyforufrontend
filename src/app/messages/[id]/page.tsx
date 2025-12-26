import { Suspense } from 'react';
import RequestDetailPage from './MessageClient';

export async function generateStaticParams() {
    return [
        { id: '1' },
        { id: '2' }
    ];
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RequestDetailPage />
        </Suspense>
    );
}
