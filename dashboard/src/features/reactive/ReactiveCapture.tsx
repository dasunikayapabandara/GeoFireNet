import React from 'react';
import WildfireImageAssessment from '../../components/predictions/WildfireImageAssessment';
import '../../styles/ReactiveCapture.css';

const ReactiveCapture: React.FC = () => {
    return (
        <div className="reactive-container">
            <div className="reactive-header">
                <h2>Aerial Wildfire Image Assessment</h2>
                <p>Analyze field, drone, or pilot wildfire photos for visual risk evidence and response planning.</p>
            </div>

            <WildfireImageAssessment />
        </div>
    );
};

export default ReactiveCapture;
