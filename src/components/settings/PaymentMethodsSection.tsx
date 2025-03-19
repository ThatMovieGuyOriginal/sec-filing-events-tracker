// src/components/settings/PaymentMethodsSection.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const PaymentMethodsSection = ({ userData }: { userData: any }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/user/payment-methods');
      setPaymentMethods(data);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to load payment methods' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.delete(`/api/user/payment-methods/${id}`);
      setMessage({ type: 'success', text: 'Payment method removed successfully' });
      fetchPaymentMethods();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to remove payment method' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setIsLoading(true);
    try {
      await axios.post(`/api/user/payment-methods/${id}/set-default`);
      setMessage({ type: 'success', text: 'Default payment method updated' });
      fetchPaymentMethods();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update default payment method' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && paymentMethods.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h2>
      
      {message.text && (
        <div 
          className={`mb-4 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {paymentMethods.length === 0 ? (
        <div className="py-4 text-gray-500">
          No payment methods found. Add a payment method to manage your subscription.
        </div>
      ) : (
        <div className="space-y-6">
          {paymentMethods.map((method: any) => (
            <div key={method.id} className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {method.cardBrand} •••• {method.cardLast4}
                  {method.isDefault && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Expires {method.expMonth}/{method.expYear}
                </div>
              </div>
              <div className="flex space-x-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => {
            /* Implement add payment method flow */
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Payment Method
        </button>
      </div>
    </div>
  );
};
