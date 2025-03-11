import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HCScoreFrequency = ({ hcId }) => {
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScoreFrequencies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/hc/score-frequency/${hcId}`);
        setFrequencies(response.data.frequencies);
        setLoading(false);
      } catch (err) {
        setError('Failed to load score frequency data');
        setLoading(false);
        console.error(err);
      }
    };

    if (hcId) {
      fetchScoreFrequencies();
    }
  }, [hcId]);

  if (loading) return <div>Loading score frequency data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (frequencies.length === 0) return <div>No score data available for this HC</div>;

  return (
    <div className="score-frequency-container">
      <h3>Score Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={frequencies}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="score" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="frequency" fill="#8884d8" name="Frequency" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="frequency-table">
        <h4>Score Frequency Table</h4>
        <table>
          <thead>
            <tr>
              <th>Score</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            {frequencies.map((item) => (
              <tr key={item.score}>
                <td>{item.score}</td>
                <td>{item.frequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HCScoreFrequency; 