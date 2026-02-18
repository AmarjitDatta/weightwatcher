import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function WeightTracker({ user, setUser }) {
  const [weights, setWeights] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editWeight, setEditWeight] = useState({ weightId: null, weight: '' });
  const navigate = useNavigate();

  // Form states
  const [newWeight, setNewWeight] = useState('');

  // Fetch weights for logged-in user
  const fetchWeights = async () => {
    try {
      const response = await axios.get(`${API_URL}/weights`, {
        params: { userId: user.userId }
      });
      setWeights(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch weights');
      setWeights([]);
    }
  };

  // Load weights on component mount
  useEffect(() => {
    if (user && user.userId) {
      fetchWeights();
    }
  }, [user]);

  // Add new weight
  const handleAddWeight = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/weights`, {
        userId: user.userId,
        weight: parseFloat(newWeight)
      });
      setSuccess(`Weight added successfully! Weight ID: ${response.data.weightId}`);
      setNewWeight('');
      setError('');
      fetchWeights();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add weight');
    }
  };

  // Start editing
  const startEdit = (weight) => {
    setIsEditing(true);
    setEditWeight({ weightId: weight.weightId, weight: weight.weight });
    setSelectedRow(weight);
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditWeight({ weightId: null, weight: '' });
    setSelectedRow(null);
  };

  // Update weight
  const handleUpdateWeight = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/weights`, 
        { weight: parseFloat(editWeight.weight) },
        {
          params: {
            userId: user.userId,
            weightId: editWeight.weightId
          }
        }
      );
      setSuccess('Weight updated successfully!');
      setError('');
      setIsEditing(false);
      setEditWeight({ weightId: null, weight: '' });
      setSelectedRow(null);
      fetchWeights();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update weight');
    }
  };

  // Delete weight
  const handleDeleteWeight = async (weight) => {
    if (!window.confirm(`Delete weight record (${weight.weight} lb from ${new Date(weight.timestamp).toLocaleDateString()})?`)) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/weights`, {
        params: {
          userId: user.userId,
          weightId: weight.weightId
        }
      });
      setSuccess('Weight deleted successfully!');
      setError('');
      fetchWeights();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete weight');
    }
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Auto-clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Prepare chart data
  const chartData = {
    labels: weights.map(w => new Date(w.timestamp)),
    datasets: [
      {
        label: 'Weight (lb)',
        data: weights.map(w => w.weight),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weight Progress Over Time',
        font: {
          size: 18
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Weight: ${context.parsed.y} lb`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d, yyyy'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Weight (lb)'
        },
        beginAtZero: false
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weight Tracker</h1>
        <div className="user-info">
          <span>Welcome, {user.fullName}!</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="container">
        {/* Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Add Weight Form */}
        <div className="section">
          <h2>Add New Weight Entry</h2>
          <form onSubmit={handleAddWeight} className="form inline-form">
            <div className="form-group">
              <label>Weight (lb):</label>
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="input"
                placeholder="Enter weight"
              />
            </div>
            <button type="submit" className="btn btn-success">Add Weight</button>
          </form>
        </div>

        {/* Weight Progress Chart */}
        {weights.length > 0 && (
          <div className="section">
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Weights History */}
        <div className="section">
          <h2>Your Weight History</h2>
          
          {weights.length === 0 ? (
            <p className="empty-message">No weight entries yet. Add your first weight above!</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Weight (lb)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {weights.map((weight) => (
                    <tr key={weight.weightId}>
                      <td>{new Date(weight.timestamp).toLocaleString()}</td>
                      <td>
                        {isEditing && selectedRow?.weightId === weight.weightId ? (
                          <form onSubmit={handleUpdateWeight} className="inline-edit-form">
                            <input
                              type="number"
                              step="0.1"
                              required
                              value={editWeight.weight}
                              onChange={(e) => setEditWeight({ ...editWeight, weight: e.target.value })}
                              className="input input-sm"
                              autoFocus
                            />
                            <button type="submit" className="btn btn-sm btn-success">Save</button>
                            <button type="button" onClick={cancelEdit} className="btn btn-sm btn-secondary">Cancel</button>
                          </form>
                        ) : (
                          weight.weight
                        )}
                      </td>
                      <td>
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => startEdit(weight)}
                              className="btn btn-sm btn-primary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteWeight(weight)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeightTracker;
