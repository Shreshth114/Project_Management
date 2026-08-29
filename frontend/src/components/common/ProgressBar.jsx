import React from 'react';

export const ProgressBar = ({ progress = 0, showLabel = true, height = 10 }) => {
  let barColor = 'progress-bar';
  if (progress >= 80) barColor += ' success';
  else if (progress >= 40) barColor += ' warning';

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>
          <span>Overall Project Progress</span>
          <span style={{ color: '#B82226' }}>{progress}%</span>
        </div>
      )}
      <div className="progress-container" style={{ height: `${height}px` }}>
        <div className={barColor} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </div>
  );
};
