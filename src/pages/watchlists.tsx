
// src/pages/watchlists.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { Layout } from '../components/Layout';
import { CompanySearch } from '../components/CompanySearch';
import Link from 'next/link';

interface Watchlist {
  id: string;
  name: string;
  createdAt: string;
  companies: Company[];
}

interface Company {
  cik: string;
  name: string;
  tickers: string[];
}

export default function Watchlists() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlist, setActiveWatchlist] = useState<Watchlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/watchlists');
      setWatchlists(data);
      if (data.length > 0) {
        setActiveWatchlist(data[0]);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to load watchlists' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchlistName.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/watchlists', {
        name: newWatchlistName
      });
      setWatchlists([...watchlists, data]);
      setActiveWatchlist(data);
      setNewWatchlistName('');
      setIsCreating(false);
      setMessage({ type: 'success', text: 'Watchlist created successfully' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create watchlist' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this watchlist?')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`/api/watchlists/${id}`);
      const updatedWatchlists = watchlists.filter(w => w.id !== id);
      setWatchlists(updatedWatchlists);
      if (activeWatchlist?.id === id) {
        setActiveWatchlist(updatedWatchlists.length > 0 ? updatedWatchlists[0] : null);
      }
      setMessage({ type: 'success', text: 'Watchlist deleted successfully' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete watchlist' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = async (identifier: string) => {
    if (!activeWatchlist) return;

    setIsLoading(true);
    try {
      await axios.post(`/api/watchlists/${activeWatchlist.id}/companies`, {
        cik: identifier
      });
      
      // Refresh the active watchlist
      const { data } = await axios.get(`/api/watchlists/${activeWatchlist.id}`);
      setActiveWatchlist(data);
      
      // Update the watchlist in the overall list
      setWatchlists(watchlists.map(w => 
        w.id === activeWatchlist.id ? data : w
      ));
      
      setMessage({ type: 'success', text: 'Company added to watchlist' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add company to watchlist' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCompany = async (cik: string) => {
    if (!activeWatchlist) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/watchlists/${activeWatchlist.id}/companies`, {
        data: { cik }
      });
      
      // Refresh the active watchlist
      const { data } = await axios.get(`/api/watchlists/${activeWatchlist.id}`);
      setActiveWatchlist(data);
      
      // Update the watchlist in the overall list
      setWatchlists(watchlists.map(w => 
        w.id === activeWatchlist.id ? data : w
      ));
      
      setMessage({ type: 'success', text: 'Company removed from watchlist' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to remove company from watchlist' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Watchlists">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Watchlists</h1>

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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">My Watchlists</h2>
              <button
                onClick={() => setIsCreating(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleCreateWatchlist} className="mb-4">
                <div className="flex">
                  <input
                    type="text"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    placeholder="Watchlist name"
                    className="flex-1 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {isLoading && watchlists.length === 0 ? (
              <div className="py-4 text-center text-gray-500">Loading...</div>
            ) : watchlists.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No watchlists found</div>
            ) : (
              <ul className="space-y-2">
                {watchlists.map((watchlist) => (
                  <li
                    key={watchlist.id}
                    className={`px-3 py-2 rounded-md cursor-pointer flex justify-between items-center ${
                      activeWatchlist?.id === watchlist.id
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveWatchlist(watchlist)}
                  >
                    <span className="truncate">{watchlist.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWatchlist(watchlist.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 bg-white rounded-lg shadow p-6">
            {!activeWatchlist ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No watchlist selected</h3>
                <p className="text-gray-500 mb-6">Select a watchlist from the sidebar or create a new one</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Watchlist
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{activeWatchlist.name}</h2>
                  <p className="text-gray-500">
                    {activeWatchlist.companies?.length || 0} {activeWatchlist.companies?.length === 1 ? 'company' : 'companies'}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Add Company</h3>
                  <CompanySearch onSearch={handleAddCompany} />
                </div>

                {activeWatchlist.companies?.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No companies in this watchlist yet. Use the search above to add companies.
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Companies</h3>
                    <div className="bg-gray-50 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIK</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeWatchlist.companies?.map((company) => (
                            <tr key={company.cik}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                <div className="text-sm text-gray-500">{company.tickers?.[0] || 'No ticker'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {company.cik}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-3">
                                  <Link href={`/companies/${company.cik}`}>
                                    <a className="text-blue-600 hover:text-blue-800">View Events</a>
                                  </Link>
                                  <button
                                    onClick={() => handleRemoveCompany(company.cik)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
