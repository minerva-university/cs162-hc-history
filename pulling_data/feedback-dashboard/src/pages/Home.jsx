import React from 'react';
import ScoreFrequencyGraph from '../components/ScoreFrequencyGraph';

function Home() {
  return (
    <div className="home-page">
      {/* Your existing content */}
      
      {/* Add the score frequency graph */}
      <div className="dashboard-section">
        <ScoreFrequencyGraph />
      </div>
    </div>
  );
}

export default Home; 