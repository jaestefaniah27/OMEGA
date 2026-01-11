import React from 'react';

export const MedievalButton = ({ title }: { title: string }) => {
    return (
        <div style={{
            padding: '10px 20px',
            backgroundColor: '#3d2b1f',
            border: '2px solid #ffd700',
            borderRadius: '5px',
            color: '#f5e6c6',
            fontWeight: 'bold',
            textAlign: 'center',
            display: 'inline-block',
            cursor: 'pointer'
        }}>
            {title}
        </div>
    );
};
