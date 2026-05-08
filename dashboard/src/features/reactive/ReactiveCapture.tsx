import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, Loader2, RotateCw, Upload, Video, VideoOff } from 'lucide-react';
import { apiUrl } from '../../config/api';
import '../../styles/ReactiveCapture.css';

const ReactiveCapture: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [result, setResult] = useState<{ is_fire: boolean; confidence: number; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            analyzeImage(file);
        }
        if (event.target) event.target.value = '';
    };

    const startCamera = async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access the camera. Please check permissions.");
        }
    };

    const toggleCamera = () => {
        if (stream) {
            // Turn off
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        } else {
            // Turn on
            startCamera();
        }
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        // Optionally, one could apply the rotation mathematically on canvas, but typically backend handles all-angle detection
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
                if (blob) {
                    await analyzeImage(blob);
                }
            }, 'image/jpeg');
        }
    };

    const analyzeImage = async (blob: Blob) => {
        setIsLoading(true);
        setResult(null);
        setError(null);

        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');

        try {
            const url = apiUrl('/predict/reactive');
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Analysis failed at ${url} with status ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Analysis error:", err);
            setError(err instanceof Error ? err.message : "Failed to connect to backend. Please ensure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const rotateCamera = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const reset = () => {
        setResult(null);
        setError(null);
        setRotation(0);
    };

    return (
        <div className="reactive-container">
            <div className="reactive-header">
                <h2>Vision-Based Reactive Prediction</h2>
                <p>Simulating the "Reactive" paradigm: Automated fire detection from visuals.</p>
            </div>

            <div className="reactive-content">
                <div className="camera-section">
                    <div className="video-wrapper">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            style={{ 
                                /* Note order is important: scaleX flips it like a mirror BEFORE rotation */
                                transform: `scaleX(-1) rotate(${rotation}deg)`, 
                                transition: 'transform 0.3s ease',
                                // If 90 or 270, adjust scale to cover black bars assuming 4:3 aspect
                                scale: (rotation === 90 || rotation === 270) ? '1.3' : '1'
                            }} 
                        />
                        {!stream && !error && !isLoading && (
                            <div className="camera-off-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: 'white', zIndex: 5 }}>
                                <VideoOff size={48} style={{ marginBottom: '1rem', opacity: 0.7 }} />
                                <span>Camera is Off</span>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden-canvas" />
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                        {isLoading && (
                            <div className="loading-overlay">
                                <Loader2 className="animate-spin" size={48} />
                                <span>Analyzing Frame...</span>
                            </div>
                        )}
                    </div>

                    <div className="controls">
                        <button
                            className="capture-btn"
                            onClick={captureImage}
                            disabled={isLoading || !!error}
                        >
                            <Camera size={20} />
                            Capture & Analyze
                        </button>
                        <button 
                            className="reset-btn" 
                            onClick={toggleCamera} 
                            type="button" 
                            disabled={isLoading}
                        >
                            {stream ? <VideoOff size={20} /> : <Video size={20} />}
                            {stream ? "Turn Off" : "Turn On"}
                        </button>
                        <button 
                            className="reset-btn" 
                            onClick={() => fileInputRef.current?.click()} 
                            type="button" 
                            disabled={isLoading}
                        >
                            <Upload size={20} />
                            Upload Photo
                        </button>
                        <button className="reset-btn" onClick={rotateCamera} type="button">
                            <RotateCw size={20} />
                            Rotate
                        </button>
                        <button className="reset-btn" onClick={reset}>
                            <RefreshCw size={20} />
                            Reset
                        </button>
                    </div>
                </div>

                <div className="result-section">
                    <h3>Analysis Result</h3>
                    {!result && !error && !isLoading && (
                        <div className="result-placeholder">
                            <p>Capture an image to begin analysis.</p>
                        </div>
                    )}

                    {error && (
                        <div className="result-card error">
                            <AlertTriangle size={32} />
                            <p>{error}</p>
                            <button onClick={startCamera}>Retry Camera</button>
                        </div>
                    )}

                    {result && (
                        <div className={`result-card ${result.is_fire ? 'fire' : 'clear'}`}>
                            {result.is_fire ? <AlertTriangle size={48} /> : <CheckCircle2 size={48} />}
                            <div className="result-details">
                                <h4>{result.is_fire ? "FIRE DETECTED" : "NO FIRE DETECTED"}</h4>
                                <p className="confidence">Confidence: {(result.confidence * 100).toFixed(2)}%</p>
                                <p className="message">{result.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

export default ReactiveCapture;
