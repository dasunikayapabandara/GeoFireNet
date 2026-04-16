import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, Loader2, RotateCw, Upload } from 'lucide-react';
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
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure permissions are granted.");
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
            const response = await fetch('http://localhost:8000/predict/reactive', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Analysis error:", err);
            setError("Failed to connect to backend. Please ensure the backend is running.");
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

            <div className="reactive-footer">
                <div className="info-card">
                    <h4>Why "Reactive"?</h4>
                    <p>Traditional systems react to sensors (like visuals or smoke detectors) AFTER ignition. GeoFireNet's Reactive mode demonstrates this immediate detection capability.</p>
                </div>
            </div>
        </div>
    );
};

export default ReactiveCapture;
