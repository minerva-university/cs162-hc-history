import HCScoreFrequency from '../components/HCScoreFrequency';

function HCDetails() {
  // Assuming you have the HC ID from URL params or props
  const { hcId } = useParams();  // or however you're getting the HC ID
  
  return (
    <div className="hc-details-page">
      {/* Your existing HC details components */}
      
      {/* Add the new score frequency component */}
      <div className="score-analysis-section">
        <HCScoreFrequency hcId={hcId} />
      </div>
    </div>
  );
}

export default HCDetails; 