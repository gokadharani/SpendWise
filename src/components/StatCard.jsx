import React from 'react';

const StatCard = ({
  iconClass,
  label,
  value,
  metaText,
  metaId,
  cardClass
}) => {
  return (
    <div className={`stat-card ${cardClass}`}>
      <div className="stat-icon-wrapper">
        <i className={iconClass}></i>
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <h3 className="stat-value">{value}</h3>
        <span className="stat-meta" id={metaId}>{metaText}</span>
      </div>
    </div>
  );
};

export default StatCard;
