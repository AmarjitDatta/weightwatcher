import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [weights, setWeights] = useState([]);
  const [userId, setUserId] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [addForm, setAddForm] = useState({ userId: '', weight: '' });
  const [updateForm, setUpdateForm] = useState({ userId: '', weightId: '', weight: '' });

  // Fetch weights for a user
  const fetchWeights = async () => {
    if (!userId) {
      setError('Please enter a User ID to fetch weights');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/weights`, {
        params: { userId: parseInt(userId) }
      });
      setWeights(response.data);
      setError('');
      setSuccess('Weights loaded successfully');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch weights');
      setWeights([]);
    }
  };

  // Add new weight
  const handleAddWeight = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/weights`, {
        userId: parseInt(addForm.userId),
        weight: parseFloat(addForm.weight)
      });
      setSuccess(`Weight added successfully! Weight ID: ${response.data.weightId}`);
      setAddForm({ userId: '', weight: '' });
      setError('');
      // Refresh if viewing the same user
      if (userId === addForm.userId) {
        fetchWeights();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add weight');
    }
  };

  // Update weight
  const handleUpdateWeight = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/weights`, 
        { weight: parseFloat(updateForm.weight) },
        {
          params: {
            userId: parseInt(updateForm.userId),
            weightId: parseInt(updateForm.weightId)
          }
        }
      );
      setSuccess('Weight updated successfully!');
      setUpdateForm({ userId: '', weightId: '', weight: '' });
      setError('');
      // Refresh if viewing the same user
      if (userId === updateForm.userId) {
        fetchWeights();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update weight');
    }
  };

  // Delete weight
  const handleDeleteWeight = async () => {
    if (!selectedRow) {
      setError('Please select a row to delete');
      return;
    }
    if (!window.confirm(`Delete weight record (Weight ID: ${selectedRow.weightId})?`)) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/weights`, {
        params: {
          userId: selectedRow.userId,
          weightId: selectedRow.weightId
        }
      });
      setSuccess('Weight deleted successfully!');
      setSelectedRow(null);
      setError('');
      fetchWeights();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete weight');
    }
  };

  // Auto-clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weight Tracker</h1>
      </header>

      <div className="container">
        {/* Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Fetch Weights Section */}
        <div className="section">
          <h2>View Weight Records</h2>
          <div className="form-group">
            <input
              type="number"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="input"
            />
            <button onClick={fetchWeights} className="btn btn-primary">
              Load Weights
            </button>
          </div>

          {/* Weights Table */}
          {weights.length > 0 && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Weight ID</th>
                    <th>User ID</th>
                    <th>Weight (lb)</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {weights.map((weight) => (
                    <tr
                      key={`${weight.userId}-${weight.weightId}`}
                      className={selectedRow?.weightId === weight.weightId ? 'selected' : ''}
                    >
                      <td>
                        <input
                          type="radio"
                          name="selectedWeight"
                          checked={selectedRow?.weightId === weight.weightId}
                          onChange={() => setSelectedRow(weight)}
                        />
                      </td>
                      <td>{weight.weightId}</td>
                      <td>{weight.userId}</td>
                      <td>{weight.weight}</td>
                      <td>{new Date(weight.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={handleDeleteWeight}
                className="btn btn-danger"
                disabled={!selectedRow}
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Add Weight Form */}
        <div className="section">
          <h2>Add New Weight</h2>
          <form onSubmit={handleAddWeight} className="form">
            <div className="form-group">
              <label>User ID:</label>
              <input
                type="number"
                required
                value={addForm.userId}
                onChange={(e) => setAddForm({ ...addForm, userId: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Weight (lb):</label>
              <input
                type="number"
                step="0.1"
                required
                value={addForm.weight}
                onChange={(e) => setAddForm({ ...addForm, weight: e.target.value })}
                className="input"
              />
            </div>
            <button type="submit" className="btn btn-success">Add Weight</button>
          </form>
        </div>

        {/* Update Weight Form */}
        <div className="section">
          <h2>Update Weight</h2>
          <form onSubmit={handleUpdateWeight} className="form">
            <div className="form-group">
              <label>User ID:</label>
              <input
                type="number"
                required
                value={updateForm.userId}
                onChange={(e) => setUpdateForm({ ...updateForm, userId: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Weight ID:</label>
              <input
                type="number"
                required
                value={updateForm.weightId}
                onChange={(e) => setUpdateForm({ ...updateForm, weightId: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>New Weight (lb):</label>
              <input
                type="number"
                step="0.1"
                required
                value={updateForm.weight}
                onChange={(e) => setUpdateForm({ ...updateForm, weight: e.target.value })}
                className="input"
              />
            </div>
            <button type="submit" className="btn btn-warning">Update Weight</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
