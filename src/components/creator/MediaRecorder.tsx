import { useState, useRef, useEffect } from 'react';
import { Mic, Video, Square, Play, Trash2 } from 'lucide-react';
import styles from './MediaRecorder.module.css';

interface MediaRecorderProps {
    type: 'audio' | 'video';
    onRecordingComplete: (blob: Blob, filename: string) => void;
}

export const MediaRecorderComponent = ({ type, onRecordingComplete }: MediaRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            stopStream();
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startRecording = async () => {
        try {
            const constraints = type === 'audio'
                ? { audio: true }
                : { audio: true, video: { width: 1280, height: 720 } };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            // Show video preview while recording
            if (type === 'video' && videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
                videoPreviewRef.current.play();
            }

            const mimeType = type === 'audio'
                ? 'audio/webm;codecs=opus'
                : 'video/webm;codecs=vp8,opus';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setRecordedBlob(blob);

                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);

                // Stop the stream
                stopStream();

                // Generate filename
                const timestamp = Date.now();
                const extension = type === 'audio' ? 'webm' : 'webm';
                const filename = `${type}_response_${timestamp}.${extension}`;

                onRecordingComplete(blob, filename);
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start timer
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Failed to access camera/microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const deleteRecording = () => {
        setRecordedBlob(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setRecordingTime(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.container}>
            {!recordedBlob ? (
                <div className={styles.recordingArea}>
                    {type === 'video' && (
                        <video
                            ref={videoPreviewRef}
                            className={styles.videoPreview}
                            muted
                            playsInline
                        />
                    )}

                    {!isRecording ? (
                        <button
                            className={styles.startBtn}
                            onClick={startRecording}
                        >
                            {type === 'audio' ? <Mic size={32} /> : <Video size={32} />}
                            <span>Start Recording</span>
                        </button>
                    ) : (
                        <div className={styles.recordingControls}>
                            <div className={styles.recordingIndicator}>
                                <div className={styles.pulse} />
                                <span>Recording... {formatTime(recordingTime)}</span>
                            </div>
                            <button
                                className={styles.stopBtn}
                                onClick={stopRecording}
                            >
                                <Square size={24} />
                                Stop Recording
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.previewArea}>
                    <div className={styles.previewHeader}>
                        <span>✅ Recording Complete ({formatTime(recordingTime)})</span>
                        <button onClick={deleteRecording} className={styles.deleteBtn}>
                            <Trash2 size={18} />
                        </button>
                    </div>

                    {type === 'audio' ? (
                        <audio controls src={previewUrl || ''} className={styles.audioPreview} />
                    ) : (
                        <video controls src={previewUrl || ''} className={styles.videoPreviewPlayback} />
                    )}

                    <p className={styles.hint}>Recording ready to submit</p>
                </div>
            )}
        </div>
    );
};
