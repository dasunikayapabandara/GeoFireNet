import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1e1e1e',
            borderTop: '1px solid #333',
            fontSize: '0.8rem',
            color: '#888',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <span>GeoFireNet v1.0-RC</span>
            <div>
                System Status: <strong style={{ color: 'green' }}>LIVE API ACTIVE</strong>
            </div>
        </footer>
    );
};

export default Footer;
