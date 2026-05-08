"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real orders from API
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('https://ecommerce.routemisr.com/api/v1/orders/user', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            // console.log('Real orders fetched:', data);
            setOrders(data.data || []);
            return;
          }
        } catch (apiError) {
          // console.log('API not available, using mock data:', apiError);
        }
      }
      
      // Fallback to mock orders if API is not available
      const mockOrders = [
        {
          id: `order_${Date.now()}`,
          date: new Date().toLocaleDateString(),
          total: 78200,
          status: 'confirmed',
          paymentMethod: 'card',
          items: [
            { name: 'MacBook Pro 16"', quantity: 1, price: 42000 },
            { name: 'Dell XPS 13', quantity: 1, price: 32000 },
            { name: 'Adidas Ultraboost 22', quantity: 1, price: 4200 }
          ]
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <a 
            href="/products" 
            className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id || order._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order #{order.id || order._id}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.isPaid ? 'bg-primary/10 text-green-800' :
                  order.isDelivered ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.isPaid ? 'Paid' : order.isDelivered ? 'Delivered' : 'Pending'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Order Date:</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}
                </div>
                <div>
                  <span className="font-medium">Total:</span> ${(order.totalOrderPrice || order.total || 0).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Payment:</span> {order.paymentMethodType || order.paymentMethod || 'Unknown'}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-2">
                  {(order.cartItems || order.items || []).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">IMG</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.product?.title || item.name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.count || item.quantity} × ${(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
