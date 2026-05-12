import React, { useEffect, useRef, useState } from 'react';
import {
    AlertTriangle,
    Camera,
    CheckCircle2,
    Flame,
    ImageUp,
    RotateCcw,
    ShieldCheck,
    Target,
    Wind,
    X
} from 'lucide-react';
import '../../styles/Predictions.css';

type ImageRiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

interface VisualMetric {
    label: string;
    value: number;
    unit: string;
}

interface ControlPhase {
    title: string;
    actions: string[];
}

interface ImageAssessment {
    riskLevel: ImageRiskLevel;
    riskScore: number;
    confidence: number;
    spreadPotential: string;
    primaryConcern: string;
    metrics: VisualMetric[];
    observations: string[];
    resourcePlan: string[];
    controlPlan: ControlPhase[];
    watchouts: string[];
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getRiskLevel = (score: number): ImageRiskLevel => {
    if (score >= 78) return 'extreme';
    if (score >= 58) return 'high';
    if (score >= 34) return 'moderate';
    return 'low';
};

const formatPercent = (ratio: number) => Number((ratio * 100).toFixed(1));

const buildControlPlan = (riskLevel: ImageRiskLevel): ControlPhase[] => {
    if (riskLevel === 'extreme') {
        return [
            {
                title: 'Immediate Command',
                actions: [
                    'Establish incident command and mark hot zone boundaries before crews move in.',
                    'Request aerial reconnaissance, water drop availability, and evacuation support.',
                    'Prioritize life safety and structure defense before direct flame attack.'
                ]
            },
            {
                title: 'Containment Tactics',
                actions: [
                    'Attack from an anchor point and work along the flanks, not the head fire.',
                    'Use aircraft or engines to cool the active edge while crews secure black line.',
                    'Assign spotter coverage downwind for ember transport and secondary ignitions.'
                ]
            },
            {
                title: 'Sustainment',
                actions: [
                    'Rotate crews around smoke exposure and heat stress limits.',
                    'Keep a fallback line and trigger point for withdrawal.',
                    'Reassess every 15 minutes or after wind, slope, or visibility changes.'
                ]
            }
        ];
    }

    if (riskLevel === 'high') {
        return [
            {
                title: 'Initial Attack',
                actions: [
                    'Confirm wind direction, access route, water source, and escape route.',
                    'Start flank control from the safest anchor point.',
                    'Use hose lays, dozer line, or retardant support where terrain allows.'
                ]
            },
            {
                title: 'Exposure Control',
                actions: [
                    'Protect structures, roads, utilities, and nearby crews from radiant heat.',
                    'Stage resources outside the predicted spread path.',
                    'Monitor smoke column tilt for changes in fire movement.'
                ]
            },
            {
                title: 'Mop-Up Standard',
                actions: [
                    'Check hot spots near the perimeter and heavy fuels.',
                    'Hold patrol until flame length and smoke production trend down.',
                    'Log image evidence and update the operations board.'
                ]
            }
        ];
    }

    if (riskLevel === 'moderate') {
        return [
            {
                title: 'Size-Up',
                actions: [
                    'Verify whether visible smoke is active fire, residual heat, or dust.',
                    'Send a small reconnaissance team with thermal check if available.',
                    'Keep engines positioned for quick escalation.'
                ]
            },
            {
                title: 'Control',
                actions: [
                    'Cool isolated hot spots and clear fine fuels around the visible edge.',
                    'Maintain watch on wind shifts and fuel continuity.',
                    'Prepare a simple containment line before committing crews deeper.'
                ]
            }
        ];
    }

    return [
        {
            title: 'Verification',
            actions: [
                'Confirm there is no active flame front or heavy smoke column.',
                'Patrol the area and document any heat signatures or damaged fuel.',
                'Keep the incident in monitor status until conditions are stable.'
            ]
        }
    ];
};

const buildAssessment = (
    fireRatio: number,
    smokeRatio: number,
    charRatio: number,
    vegetationRatio: number,
    qualityScore: number,
    sampleCount: number
): ImageAssessment => {
    const combinedEvidence = fireRatio + smokeRatio + charRatio;
    const scoreBoost = fireRatio > 0.05 && smokeRatio > 0.16 ? 12 : 0;
    const riskScore = Math.round(clamp(
        fireRatio * 560 + smokeRatio * 180 + charRatio * 95 + vegetationRatio * 28 + scoreBoost,
        0,
        100
    ));
    const riskLevel = getRiskLevel(riskScore);
    const confidence = Math.round(clamp(52 + combinedEvidence * 180 + qualityScore * 0.18 + Math.min(sampleCount / 18000, 8), 45, 96));
    const spreadPotential = riskScore >= 78 ? 'Rapid spread likely' : riskScore >= 58 ? 'Escalation likely' : riskScore >= 34 ? 'Localized spread possible' : 'Limited spread visible';
    const primaryConcern = fireRatio > 0.06
        ? 'Active flame front'
        : smokeRatio > 0.20
            ? 'Dense smoke column'
            : charRatio > 0.10
                ? 'Recently burned fuel'
                : 'Low visual fire evidence';

    const observations = [
        `${formatPercent(fireRatio)}% of sampled pixels match active flame or ember color bands.`,
        `${formatPercent(smokeRatio)}% of sampled pixels match smoke or ash plume color bands.`,
        `${formatPercent(charRatio)}% of sampled pixels indicate dark burned fuel or heavy shadow.`,
        `${formatPercent(vegetationRatio)}% of sampled pixels look like connected vegetation/fuel.`
    ];

    const resourcePlan = riskLevel === 'extreme'
        ? ['Incident commander', 'Engine strike team', 'Air attack or helicopter bucket support', 'Evacuation and traffic control', 'Medical standby']
        : riskLevel === 'high'
            ? ['Type 3 or local incident commander', 'Engines and hand crew', 'Water tender', 'Aerial reconnaissance if available']
            : riskLevel === 'moderate'
                ? ['Recon crew', 'One engine module', 'Thermal camera or drone check', 'Patrol unit']
                : ['Patrol unit', 'Documentation camera', 'Follow-up observation'];

    return {
        riskLevel,
        riskScore,
        confidence,
        spreadPotential,
        primaryConcern,
        metrics: [
            { label: 'Visible Flame', value: formatPercent(fireRatio), unit: '%' },
            { label: 'Smoke Density', value: formatPercent(smokeRatio), unit: '%' },
            { label: 'Burned Fuel', value: formatPercent(charRatio), unit: '%' },
            { label: 'Fuel Continuity', value: formatPercent(vegetationRatio), unit: '%' },
            { label: 'Image Quality', value: Math.round(qualityScore), unit: '%' }
        ],
        observations,
        resourcePlan,
        controlPlan: buildControlPlan(riskLevel),
        watchouts: [
            'Wind shifts can invalidate image-only spread assumptions.',
            'Hidden slope, fuel depth, and structures are not fully visible from one image.',
            'Use this assessment as decision support with field command confirmation.'
        ]
    };
};

const analyzeImage = (imageUrl: string): Promise<ImageAssessment> => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 420;
        const scale = Math.min(1, maxWidth / image.naturalWidth);
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            reject(new Error('Unable to read image pixels.'));
            return;
        }

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let firePixels = 0;
        let smokePixels = 0;
        let charPixels = 0;
        let vegetationPixels = 0;
        let clippedPixels = 0;
        let sampleCount = 0;

        for (let index = 0; index < pixels.length; index += 16) {
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const brightness = (r + g + b) / 3;
            const saturation = max === 0 ? 0 : (max - min) / max;

            const isFire = r > 150 && g > 45 && g < 205 && b < 135 && r > g * 1.05 && r > b * 1.45;
            const isSmoke = brightness > 72 && brightness < 232 && saturation < 0.20 && Math.abs(r - g) < 34 && Math.abs(g - b) < 34;
            const isChar = brightness < 72 && saturation < 0.42;
            const isVegetation = g > 60 && g > r * 1.05 && g > b * 1.05 && brightness < 185;
            const isClipped = brightness < 12 || brightness > 245;

            if (isFire) firePixels += 1;
            if (isSmoke) smokePixels += 1;
            if (isChar) charPixels += 1;
            if (isVegetation) vegetationPixels += 1;
            if (isClipped) clippedPixels += 1;
            sampleCount += 1;
        }

        const qualityScore = clamp(100 - (clippedPixels / sampleCount) * 120, 25, 100);
        resolve(buildAssessment(
            firePixels / sampleCount,
            smokePixels / sampleCount,
            charPixels / sampleCount,
            vegetationPixels / sampleCount,
            qualityScore,
            sampleCount
        ));
    };
    image.onerror = () => reject(new Error('Unable to load this image.'));
    image.src = imageUrl;
});

const WildfireImageAssessment: React.FC = () => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const objectUrlRef = useRef<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [analysis, setAnalysis] = useState<ImageAssessment | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    }, []);

    const runAnalysis = async (imageUrl: string) => {
        setIsAnalyzing(true);
        setError(null);
        try {
            const result = await analyzeImage(imageUrl);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Image analysis failed.');
            setAnalysis(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Select a valid image file.');
            return;
        }

        if (file.size > 12 * 1024 * 1024) {
            setError('Image file must be smaller than 12 MB.');
            return;
        }

        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const nextUrl = URL.createObjectURL(file);
        objectUrlRef.current = nextUrl;
        setPreviewUrl(nextUrl);
        setFileName(file.name);
        setAnalysis(null);
        void runAnalysis(nextUrl);
    };

    const clearImage = () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
        setPreviewUrl(null);
        setFileName('');
        setAnalysis(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="card wildfire-image-card">
            <div className="image-assessment-header">
                <div>
                    <h3 className="section-title"><Camera size={20} /> Aerial Wildfire Image Assessment</h3>
                    <p className="text-muted small">Visual decision support for field reports and flight observations.</p>
                </div>
                <div className="image-assessment-actions">
                    <button type="button" className="btn btn-outline" onClick={() => inputRef.current?.click()}>
                        <ImageUp size={16} />
                        Upload Image
                    </button>
                    {previewUrl && (
                        <button type="button" className="btn btn-ghost" onClick={clearImage} title="Clear image">
                            <X size={16} />
                        </button>
                    )}
                </div>
                <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
            </div>

            {error && <div className="settings-alert error">{error}</div>}

            <div className="image-assessment-grid">
                <div className="image-drop-zone" onClick={() => inputRef.current?.click()}>
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} alt="Uploaded wildfire field report" />
                            <div className="image-file-name">{fileName}</div>
                        </>
                    ) : (
                        <div className="image-empty-state">
                            <ImageUp size={42} />
                            <span>Upload wildfire photo</span>
                        </div>
                    )}
                </div>

                <div className="image-analysis-panel">
                    {!analysis && !isAnalyzing && (
                        <div className="analysis-placeholder">
                            <Flame size={36} />
                            <h4>Awaiting Image Evidence</h4>
                            <p className="text-muted small">Aerial or ground photo assessment appears here after upload.</p>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="analysis-placeholder">
                            <RotateCcw size={36} className="animate-spin" />
                            <h4>Analyzing Visual Signals</h4>
                            <p className="text-muted small">Scanning flame, smoke, burn scar, and vegetation continuity.</p>
                        </div>
                    )}

                    {analysis && (
                        <>
                            <div className={`image-risk-summary image-risk-${analysis.riskLevel}`}>
                                <div>
                                    <span className="summary-label">Visual Risk</span>
                                    <strong>{analysis.riskLevel.toUpperCase()}</strong>
                                </div>
                                <div>
                                    <span className="summary-label">Score</span>
                                    <strong>{analysis.riskScore}/100</strong>
                                </div>
                                <div>
                                    <span className="summary-label">Confidence</span>
                                    <strong>{analysis.confidence}%</strong>
                                </div>
                            </div>

                            <div className="assessment-status-row">
                                <span><Target size={16} /> {analysis.primaryConcern}</span>
                                <span><Wind size={16} /> {analysis.spreadPotential}</span>
                            </div>

                            <div className="visual-metrics-grid">
                                {analysis.metrics.map((metric) => (
                                    <div key={metric.label} className="visual-metric">
                                        <span>{metric.label}</span>
                                        <strong>{metric.value}{metric.unit}</strong>
                                        <div className="metric-bar">
                                            <span style={{ width: `${clamp(metric.value, 0, 100)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="analysis-section">
                                <h4><AlertTriangle size={18} /> Image-Derived Details</h4>
                                <ul>
                                    {analysis.observations.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            </div>

                            <div className="analysis-section">
                                <h4><ShieldCheck size={18} /> Control Plan</h4>
                                <div className="control-plan-grid">
                                    {analysis.controlPlan.map((phase) => (
                                        <div key={phase.title} className="control-phase">
                                            <strong>{phase.title}</strong>
                                            <ul>
                                                {phase.actions.map((action) => <li key={action}>{action}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="analysis-section resource-section">
                                <h4><CheckCircle2 size={18} /> Suggested Resource Package</h4>
                                <div className="resource-chip-list">
                                    {analysis.resourcePlan.map((resource) => <span key={resource}>{resource}</span>)}
                                </div>
                            </div>

                            <div className="watchout-panel">
                                {analysis.watchouts.map((watchout) => <p key={watchout}>{watchout}</p>)}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WildfireImageAssessment;
