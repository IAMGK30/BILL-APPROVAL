import React from 'react';

const Spinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 18, md: 32, lg: 48 };
  const px = sizes[size] || 32;
  return (
    <div className="spinner-wrap">
      <div
        className="spinner"
        style={{ width: px, height: px, borderWidth: size === 'sm' ? 2 : 3 }}
      />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;
