import React, { useState, useEffect } from 'react';

const TouristListPage = () => {
  const [tourists, setTourists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTourists = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/tourists/');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setTourists(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTourists();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '1rem' }}>Tourist Users</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#1d4ed8', color: 'white' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tourist ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>User Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {tourists.map((t) => (
                <tr key={t.tourist_id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.75rem' }}>{t.tourist_id}</td>
                  <td style={{ padding: '0.75rem' }}>{t.name || 'Anonymous'}</td>
                  <td style={{ padding: '0.75rem' }}>{t.phone || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{t.email || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{t.user_type}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TouristListPage;
