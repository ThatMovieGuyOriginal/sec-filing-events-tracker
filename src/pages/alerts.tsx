// src/pages/alerts.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout';
import { CompanySearch } from '../components/CompanySearch';
import { useAnalytics } from '../lib/analytics';

interface AlertType {
  id: string;
  userId: string;
  eventType: string | null;
  cik: string | null;
  ticker: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  company?: {
    name: string;
  };
}

interface CompanyData {
  cik: string;
  name: string;
  ticker?: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newAlert, setNewAlert] = useState({
    eventType: '',
    company: null as CompanyData | null,
  });
  const analytics = useAnalytics();

  // Event types for dropdown selection
  const eventTypes = [
    { value: '', label: 'All Events' },
    { value: 'nameChange', label: 'Name Change' },
    { value: 'tickerChange', label: 'Ticker Change' },
    { value: 'insiderBuying', label: 'Insider Buying' },
    { value: 'activistInvestor', label: 'Activist Investor' },
    { value: 'institutionalInvestor', label: 'Institutional Investor' },
    { value: 'shareBuyback', label: 'Share Buyback' },
    { value: 'reverseStockSplit', label: 'Reverse Stock Split' },
    { value: 'uplisting', label: 'Uplisting' },
    { value: 'fdaApproval', label: 'FDA Approval' },
    { value: 'patentApproval', label: 'Patent Approval' },
    { value: 'spinOff', label: 'Spin-off' },
    { value: 'specialDividend', label: 'Special Dividend' },
    { value: 'debtReduction', label: 'Debt Reduction' },
  ];

  useEffect(() => {
    fetchAlerts();
    fetchAlertHistory();
    
    // Track page view
    analytics.pageView('/alerts');
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/alerts');
      setAlerts(data);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to load alerts' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlertHistory = async () => {
    try {
      const { data } = await axios.get('/api/alerts/history');
      setAlertHistory(data);
    } catch (error) {
      console.error('Failed to load alert history:', error);
      // Don't show error message for history, as it's secondary information
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.eventType && !newAlert.company) {
      setMessage({ type: 'error', text: 'Please select at least an event type or a company' });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        eventType: newAlert.eventType || null,
        cik: newAlert.company?.cik || null,
        ticker: newAlert.company?.ticker || null,
      };

      await axios.post('/api/alerts', payload);
      
      // Reset form and reload alerts
      setNewAlert({ eventType: '', company: null });
      setIsCreating(false);
      await fetchAlerts();
      
      setMessage({ type: 'success', text: 'Alert created successfully' });
      
      // Track event creation
      analytics.trackEvent('alert_created', {
        eventType: payload.eventType,
        hasCompany: !!payload.cik,
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create alert' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`/api/alerts/${id}`);
      
      // Remove the alert from the list
      setAlerts(alerts.filter(alert => alert.id !== id));
      
      setMessage({ type: 'success', text: 'Alert deleted successfully' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete alert' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAlert = async (id: string, currentActiveState: boolean) => {
    setIsLoading(true);
    try {
      await axios.patch(`/api/alerts/${id}`, {
        active: !currentActiveState
      });
      
      // Update the alert in the list
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, active: !alert.active } : alert
      ));
      
      setMessage({ 
        type: 'success', 
        text: `Alert ${!currentActiveState ? 'activated' : 'deactivated'} successfully` 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update alert' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySelection = (cik: string) => {
    // The company search returns a CIK - we need to look up the company info
    axios.get(`/api/companies/${cik}`)
      .then(({ data }) => {
        setNewAlert({
          ...newAlert,
          company: data
        });
      })
      .catch(error => {
        console.error('Failed to fetch company details:', error);
        setMessage({ type: 'error', text: 'Failed to fetch company details' });
      });
  };

  return (
    <Layout title="Alerts">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Alert Settings</h1>

        {message.text && (
          <div 
            className={`mb-6 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex justify-between">
              <h2 className="text-lg font-medium text-gray-900">Your Alerts</h2>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isCreating ? 'Cancel' : 'Create Alert'}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Get notified when important events are detected for specific companies or event types.
            </p>
          </div>

          {isCreating && (
            <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Alert</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
                    Event Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="eventType"
                      name="eventType"
                      value={newAlert.eventType}
                      onChange={(e) => setNewAlert({ ...newAlert, eventType: e.target.value })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Select an event type or "All Events" to be notified of any event.
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Company (Optional)
                  </label>
                  <div className="mt-1">
                    <CompanySearch onSearch={handleCompanySelection} />
                  </div>
                  {newAlert.company && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-md">
                      <div className="text-sm font-medium">{newAlert.company.name}</div>
                      <div className="text-xs text-gray-500">
                        {newAlert.company.ticker ? `${newAlert.company.ticker} | ` : ''}
                        CIK: {newAlert.company.cik}
                      </div>
                      <button 
                        onClick={() => setNewAlert({ ...newAlert, company: null })}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Specify a company to receive alerts only for this company.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateAlert}
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading && alerts.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p>Loading alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-500">
                <p className="mb-2">You don't have any alerts yet.</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Create your first alert
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alert Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {alert.company?.name || (alert.ticker ? `Ticker: ${alert.ticker}` : '')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {alert.eventType ? eventTypes.find(t => t.value === alert.eventType)?.label : 'All Events'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            alert.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {alert.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleToggleAlert(alert.id, alert.active)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          {alert.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Alert History Section */}
        {alertHistory.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Recent Alert Activity</h2>
              <p className="mt-1 text-sm text-gray-500">
                History of recent alerts that have been triggered for your account.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Triggered
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alertHistory.map((history, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {eventTypes.find(t => t.value === history.eventType)?.label || 'Event'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {history.companyName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {history.ticker || `CIK: ${history.cik}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(history.triggeredAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
