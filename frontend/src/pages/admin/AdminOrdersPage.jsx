import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/orderApi';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../../components/ui/OrderStatusBadge';
import { Button } from '../../components/ui/Button';
import { Download } from 'lucide-react';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      setOrders(response.data || []);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders(); // Refresh list
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  const exportToCSV = () => {
    const headers = ['Order Number', 'Dealer', 'Amount', 'Status', 'Date'];
    const csvData = orders.map(o => [
      o.order_number,
      `"${o.dealer_name}"`,
      o.total_amount,
      o.status,
      new Date(o.created_at).toLocaleDateString()
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && orders.length === 0) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Dealer Name</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {order.dealer_name}
                    <div className="text-xs text-gray-500">{order.business_name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">₹{Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {order.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          variant="primary"
                          size="sm"
                        >
                          Confirm
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          variant="danger"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    <Link to={`/admin/orders/${order.id}`} className="text-xs px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors inline-block">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
