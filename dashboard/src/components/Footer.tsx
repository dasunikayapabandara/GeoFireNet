import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <span>GeoFireNet v1.0-RC</span>
            <div>
                System Status: <strong style={{ color: 'var(--accent-risk-low)' }}>LIVE API ACTIVE</strong>
            </div>
        </footer>
    );
};

export default Footer;
