import React from 'react';
import './../assets/styles/ProgressBar.css';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const stepsArray = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="progress-bar-container">
      {stepsArray.map((step) => (
        <React.Fragment key={step}>
          <div className={`step-circle ${step <= currentStep ? 'active' : ''}`}>
            {step}
          </div>
          {step < totalSteps && (
            <div className={`step-line ${step < currentStep ? 'active' : ''}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressBar;