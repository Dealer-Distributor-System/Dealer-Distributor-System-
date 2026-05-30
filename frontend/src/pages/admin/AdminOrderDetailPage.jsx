import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../api/orderApi';
import { getTravellers } from '../../api/userApi';
import { assignDelivery, getOrderTracking } from '../../api/deliveryApi';
import { ArrowLeft, Truck } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { OrderStatusBadge } from '../../components/ui/OrderStatusBadge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import TrackingTimeline from '../../components/orders/TrackingTimeline';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState({ data: [], status: 'pending', traveller: null });
  
  // Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [travellers, setTravellers] = useState([]);
  const [selectedTraveller, setSelectedTraveller] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const [orderRes, trackingRes] = await Promise.all([
        getOrderById(id),
        getOrderTracking(id).catch(() => ({ data: [], status: 'pending', traveller: null }))
      ]);
      setOrder(orderRes.data);
      setTracking(trackingRes || { data: [], status: 'pending', traveller: null });
    } catch (err) {
      setError('Failed to fetch order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    try {
      const response = await getTravellers();
      setTravellers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch travellers', err);
      alert('Failed to load travellers');
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedTraveller) {
      alert("Please select a traveller");
      return;
    }

    const traveller = travellers.find(t => t.id === parseInt(selectedTraveller));
    if (!window.confirm(`Are you sure you want to assign this delivery to ${traveller?.name || 'this traveller'}?`)) {
      return;
    }

    try {
      setAssigning(true);
      await assignDelivery(order.id, selectedTraveller);
      alert('Delivery assigned successfully!');
      setIsAssignModalOpen(false);
      fetchOrder(); // Refresh order details
    } catch (err) {
      console.error('Failed to assign delivery', err);
      alert(err.response?.data?.message || 'Failed to assign delivery');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_transit': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  if (error || !order) return <div className="p-8 text-center text-red-500">{error || 'Order not found'}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <Link to="/admin/orders" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
      </Link>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed by {order.dealer_name} on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {['confirmed', 'approved'].includes(order.status) && order.delivery_type === 'delivery' && (
            <Button 
              onClick={handleOpenAssignModal}
              variant="secondary"
            >
              Assign Delivery
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Tracking Timeline */}
          {order.delivery_type === 'delivery' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Live Delivery Tracking</h2>
                  <p className="text-xs text-gray-500 mt-1">Real-time status updates from our delivery network.</p>
                </div>
                <Truck className="w-5 h-5 text-primary/45" />
              </div>
              <TrackingTimeline status={order.status} trackingData={tracking.data} />
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item.order_item_id} className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">No img</span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{Number(item.subtotal).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{(Number(order.total_amount) - Number(order.delivery_cost || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Cost</span>
                <span>₹{Number(order.delivery_cost || 0).toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Dealer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Dealer</p>
                <p className="text-sm text-gray-900 font-medium">{order.business_name}</p>
                <p className="text-sm text-gray-600">{order.dealer_name} ({order.dealer_email})</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Delivery Type</p>
                <p className="text-sm text-gray-900 capitalize font-medium">{order.delivery_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Address</p>
                <p className="text-sm text-gray-900 leading-relaxed">{order.delivery_address || 'Pickup from store'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Delivery"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Traveller</label>
            <Select
              value={selectedTraveller}
              onChange={(e) => setSelectedTraveller(e.target.value)}
              className="w-full"
            >
              <option value="">-- Choose Traveller --</option>
              {travellers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.current_status || 'available'})</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button 
            onClick={() => setIsAssignModalOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignDelivery}
            disabled={assigning || !selectedTraveller}
            variant="primary"
          >
            {assigning ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrderDetailPage;
