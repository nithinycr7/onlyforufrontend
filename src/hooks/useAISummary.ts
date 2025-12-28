'use client';

import { useState, useEffect } from 'react';

interface AISummary {
    booking_id: string;
    ai_summary: string | null;
    ai_sentiment: string | null;
    ai_stakes: string | null;
    ai_key_points: string[] | null;
    ai_processing_status: 'pending' | 'processing' | 'completed' | 'failed';
    ai_processing_error: string | null;
    detected_languages: Record<string, string> | null;
    ai_summary_language: string | null;
}

interface UseAISummaryOptions {
    bookingId: string;
    enabled?: boolean;
    pollInterval?: number; // Poll while processing (ms)
}

export function useAISummary({
    bookingId,
    enabled = true,
    pollInterval = 3000, // Poll every 3 seconds
}: UseAISummaryOptions) {
    const [data, setData] = useState<AISummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !bookingId) {
            return;
        }

        let intervalId: NodeJS.Timeout | null = null;

        const fetchSummary = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/bookings/${bookingId}/summary`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        },
                    }
                );

                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error('Only creators can view AI summaries');
                    }
                    throw new Error('Failed to fetch AI summary');
                }

                const summaryData: AISummary = await response.json();
                setData(summaryData);
                setError(null);

                // Stop polling if processing is complete or failed
                if (
                    summaryData.ai_processing_status === 'completed' ||
                    summaryData.ai_processing_status === 'failed'
                ) {
                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchSummary();

        // Set up polling if status is pending or processing
        if (data?.ai_processing_status === 'pending' || data?.ai_processing_status === 'processing') {
            intervalId = setInterval(fetchSummary, pollInterval);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [bookingId, enabled, pollInterval, data?.ai_processing_status]);

    const regenerateSummary = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/bookings/${bookingId}/regenerate-summary`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to regenerate summary');
            }

            const newData: AISummary = await response.json();
            setData(newData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to regenerate');
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        regenerateSummary,
        isProcessing: data?.ai_processing_status === 'processing' || data?.ai_processing_status === 'pending',
    };
}
