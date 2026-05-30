import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../../api/orderApi';
import { reorderFromOrder } from '../../api/cartApi';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../../components/ui/OrderStatusBadge';
import { Button } from '../../components/ui/Button';
import { Search, ShoppingBag, ArrowRight, Calendar, CreditCard } from 'lucide-react';
import { Loader } from '../../components/ui/Loader';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reorderingOrderId, setReorderingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders();
      setOrders(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && order.status === 'pending';
    if (filter === 'progress') return matchesSearch && ['confirmed', 'assigned', 'picked_up', 'in_transit'].includes(order.status);
    if (filter === 'delivered') return matchesSearch && order.status === 'delivered';
    if (filter === 'cancelled') return matchesSearch && (order.status === 'cancelled' || order.status === 'rejected');
    
    return matchesSearch;
  });

  const filterButtons = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'progress', label: 'In Progress' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const handleReorder = async (orderId) => {
    try {
      setReorderingOrderId(orderId);
      const response = await reorderFromOrder(orderId);
      if (response?.success) {
        toast.success(response.message || 'Your order has been added to the cart.');
      }
      if (response?.data?.errors?.length) {
        response.data.errors.forEach((error) => toast.error(error));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reorder this order.');
    } finally {
      setReorderingOrderId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader size="lg" />
      <p className="text-text-light font-medium animate-pulse">Fetching your orders...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tighter">Order <span className="text-primary italic">History.</span></h1>
          <p className="text-text-light text-sm mt-1">Track and manage your recent transactions.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-soft outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
        {filterButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === btn.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white text-text-light hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-soft-xl p-12 text-center border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">No orders found</h3>
          <p className="text-text-light text-sm mb-8 max-w-xs mx-auto">
            {search || filter !== 'all' 
              ? "We couldn't find any orders matching your current filters." 
              : "You haven't placed any orders yet. Start shopping to fill this space!"}
          </p>
          <Link to="/products">
            <Button className="px-8 py-3 rounded-2xl flex items-center gap-2">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Desktop Table View (lg screens) */}
          <div className="hidden lg:block bg-white rounded-[2rem] shadow-soft-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-text-light text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Payment</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="font-bold text-text text-sm">{order.order_number}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-text-light">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-text">₹{Number(order.total_amount).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant={order.payment_status === 'verified' ? 'success' : order.payment_status === 'paid' ? 'primary' : 'warning'}>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-text font-bold hover:bg-gray-100 rounded-xl"
                          onClick={() => handleReorder(order.id)}
                          disabled={reorderingOrderId === order.id}
                        >
                          {reorderingOrderId === order.id ? 'Reordering...' : 'Reorder'}
                        </Button>
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-xl">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 hover:shadow-lg transition-all"
              >
                <Link to={`/orders/${order.id}`} className="block">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Order ID</p>
                    <h3 className="font-black text-text">{order.order_number}</h3>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-light">Date</p>
                      <p className="text-xs font-bold text-text">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-light">Amount</p>
                      <p className="text-xs font-bold text-text">₹{Number(order.total_amount).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <Badge variant={order.payment_status === 'verified' ? 'success' : 'warning'}>
                    {order.payment_status}
                  </Badge>
                  <span className="text-primary text-xs font-bold flex items-center gap-1">
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-text font-bold hover:bg-gray-100 rounded-xl"
                  onClick={() => handleReorder(order.id)}
                  disabled={reorderingOrderId === order.id}
                >
                  {reorderingOrderId === order.id ? 'Reordering...' : 'Reorder'}
                </Button>
                <Link to={`/orders/${order.id}`} className="text-primary text-xs font-bold hover:underline">
                  View Details <ArrowRight className="w-3.5 h-3.5 inline-block" />
                </Link>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
