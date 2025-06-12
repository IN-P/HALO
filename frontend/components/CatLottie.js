// components/CatLottie.js
import React from 'react';
import Lottie from 'lottie-react';
import catAnimation from '../public/lottie/cat.json';

const CatLottie = ({ width = 150, height = 150 }) => {
  return (
    <div style={{ width, height }}>
      <Lottie animationData={catAnimation} loop={true} />
    </div>
  );
};

export default CatLottie;
