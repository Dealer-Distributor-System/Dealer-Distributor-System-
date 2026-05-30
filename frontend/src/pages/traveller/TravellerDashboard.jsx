import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getDeliveries, acceptDelivery, updateDeliveryStatus } from '../../api/deliveryApi';
import { OrderStatusBadge } from '../../components/ui/OrderStatusBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Truck, Package, MapPin, CheckCircle2, RefreshCw, ChevronRight, Search, Filter, Calendar, Award, AlertTriangle, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../components/ui/Modal';

const COMMON_LOCATIONS = [
  'Hubli Warehouse',
  'Hubli Vidyanagar',
  'In Transit',
  'Dharwad',
  'Gadag',
  'Haveri',
  'Belgaum',
  'Davanagere',
  'Bangalore',
  'Mysore',
  'Destination',
  'Custom Location...'
];

const TravellerDashboard = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Tabs and History filters
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'delivered', 'failed'

  // Status update modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [locationType, setLocationType] = useState('Hubli Warehouse');
  const [customLocation, setCustomLocation] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await getDeliveries();
      setDeliveries(response.data || []);
    } catch (err) {
      setError('Failed to fetch deliveries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      setUpdatingId(id);
      await acceptDelivery(id);
      toast.success('Delivery accepted successfully!');
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept delivery');
    } finally {
      setUpdatingId(null);
    }
  };

  const openUpdateModal = (id, status) => {
    setSelectedDeliveryId(id);
    setTargetStatus(status);
    setRemark('');
    
    // Set default locations based on status
    if (status === 'picked_up') {
      setLocationType('Hubli Warehouse');
    } else if (status === 'in_transit') {
      setLocationType('In Transit');
    } else if (status === 'delivered') {
      setLocationType('Destination');
    } else {
      setLocationType('Hubli Warehouse');
    }
    setCustomLocation('');
    setModalOpen(true);
  };

  const submitStatusUpdate = async (e) => {
    e.preventDefault();
    const finalLocation = locationType === 'Custom Location...' ? customLocation : locationType;
    if (!finalLocation) {
      toast.error('Please specify a location');
      return;
    }

    try {
      setUpdatingId(selectedDeliveryId);
      setModalOpen(false);
      await updateDeliveryStatus(selectedDeliveryId, { 
        status: targetStatus, 
        location: finalLocation, 
        remark: remark || null 
      });
      toast.success(`Status updated to ${targetStatus.replace('_', ' ')}`);
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const availableDeliveries = deliveries.filter(d => d.status === 'unassigned');
  const pendingDeliveries = deliveries.filter(d => d.status === 'assigned' && Number(d.traveller_id) === Number(user?.id));
  const inProgressDeliveries = deliveries.filter(d => ['picked_up', 'in_transit'].includes(d.status) && Number(d.traveller_id) === Number(user?.id));
  const historyDeliveries = deliveries.filter(d => ['delivered', 'failed'].includes(d.status) && Number(d.traveller_id) === Number(user?.id));

  // Statistics for history
  const historyStats = React.useMemo(() => {
    const total = historyDeliveries.length;
    const successful = historyDeliveries.filter(d => d.status === 'delivered').length;
    const failed = historyDeliveries.filter(d => d.status === 'failed').length;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(0) : 0;
    const totalValue = historyDeliveries
      .filter(d => d.status === 'delivered')
      .reduce((sum, d) => sum + Number(d.total_amount || 0), 0);

    return {
      total,
      successful,
      failed,
      successRate,
      totalValue
    };
  }, [historyDeliveries]);

  // Filtered history list based on search term and status filter
  const filteredHistory = React.useMemo(() => {
    return historyDeliveries.filter(d => {
      const matchesSearch = 
        d.order_number?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.dealer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [historyDeliveries, searchTerm, statusFilter]);

  if (loading && deliveries.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader size="lg" />
        <p className="text-text-light mt-4">Syncing delivery data...</p>
      </div>
    );
  }

  const DeliveryCard = ({ d }) => (
    <Card className="hover:shadow-soft-lg transition-all duration-300 border-gray-100 group">
      <CardContent className="p-0">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">Order {d.order_number}</h3>
              <p className="text-xs text-text-light">Value: ₹{Number(d.total_amount).toFixed(2)}</p>
            </div>
          </div>
          <OrderStatusBadge status={d.status} />
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3 text-gray-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery To</p>
              <p className="text-sm font-semibold text-gray-900">{d.dealer_name}</p>
              <p className="text-xs text-text-light line-clamp-1">{d.delivery_address}</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            {d.status === 'unassigned' && (
              <Button 
                onClick={() => handleAccept(d.id)}
                disabled={updatingId === d.id}
                variant="primary"
                className="w-full h-11"
              >
                {updatingId === d.id ? 'Accepting...' : 'Accept Delivery'}
              </Button>
            )}
            {d.status === 'assigned' && Number(d.traveller_id) === Number(user?.id) && (
              <Button 
                onClick={() => openUpdateModal(d.id, 'picked_up')}
                disabled={updatingId === d.id}
                variant="secondary"
                className="w-full h-11"
              >
                Mark as Picked Up
              </Button>
            )}
            {d.status === 'picked_up' && (
              <Button 
                onClick={() => openUpdateModal(d.id, 'in_transit')}
                disabled={updatingId === d.id}
                variant="primary"
                className="w-full h-11"
              >
                Start Transit
              </Button>
            )}
            {d.status === 'in_transit' && (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => openUpdateModal(d.id, 'delivered')}
                  disabled={updatingId === d.id}
                  className="bg-success hover:bg-success/90 text-white h-11"
                >
                  Delivered
                </Button>
                <Button 
                  onClick={() => openUpdateModal(d.id, 'failed')}
                  disabled={updatingId === d.id}
                  variant="danger"
                  className="h-11"
                >
                  Failed
                </Button>
              </div>
            )}

            <Link 
              to={`/traveller/deliveries/${d.id}`}
              className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-text-light hover:text-primary transition-colors group-hover:translate-x-1 duration-300"
            >
              Details & Timeline <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">Traveller Command</h1>
          <p className="text-text-light mt-1 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            Agent: {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchDeliveries} variant="outline" size="sm" className="bg-white hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-100 pb-px gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-light hover:text-text'
          }`}
        >
          <Truck className="w-4 h-4" />
          Active Tasks
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'active' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
          }`}>
            {availableDeliveries.length + pendingDeliveries.length + inProgressDeliveries.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-light hover:text-text'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Order History
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'history' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
          }`}>
            {historyDeliveries.length}
          </span>
        </button>
      </div>

      {activeTab === 'active' ? (
        <div className="space-y-12 animate-in fade-in duration-300">
          {/* Available Pool Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold">
                +
              </div>
              <h2 className="text-xl font-bold text-gray-900">Available Pool</h2>
              <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{availableDeliveries.length}</span>
            </div>

            {availableDeliveries.length === 0 ? (
              <div className="bg-surface/50 border-2 border-dashed border-gray-100 rounded-[var(--radius-soft-lg)] p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-text-light font-medium">No available deliveries for self-assignment right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableDeliveries.map(d => <DeliveryCard key={d.id} d={d} />)}
              </div>
            )}
          </section>

          {/* New Assignments Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">New Assignments</h2>
              <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{pendingDeliveries.length}</span>
            </div>

            {pendingDeliveries.length === 0 ? (
              <div className="bg-surface/50 border-2 border-dashed border-gray-100 rounded-[var(--radius-soft-lg)] p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-text-light font-medium">No new deliveries assigned to you yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingDeliveries.map(d => <DeliveryCard key={d.id} d={d} />)}
              </div>
            )}
          </section>

          {/* Active Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Active Deliveries</h2>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">{inProgressDeliveries.length}</span>
            </div>

            {inProgressDeliveries.length === 0 ? (
              <div className="bg-surface/50 border-2 border-dashed border-gray-100 rounded-[var(--radius-soft-lg)] p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-text-light font-medium">You don't have any deliveries in progress.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressDeliveries.map(d => <DeliveryCard key={d.id} d={d} />)}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Order History View */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="bg-white border-gray-100 hover:shadow-soft transition-all duration-300">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Handled</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">{historyStats.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 hover:shadow-soft transition-all duration-300">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-success/10 text-success">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Successful</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">{historyStats.successful}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 hover:shadow-soft transition-all duration-300">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-danger/10 text-danger">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Failed / Rejected</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">{historyStats.failed}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 hover:shadow-soft transition-all duration-300">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Value Delivered</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">₹{historyStats.totalValue.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-surface/50 border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history by Order #, Dealer, or Address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-text-light uppercase tracking-wider shrink-0">
                <Filter className="w-3.5 h-3.5" /> Filter Status:
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="delivered">Delivered Successfully</option>
                <option value="failed">Failed Deliveries</option>
              </select>

              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="h-9 px-3 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {filteredHistory.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Calendar className="w-8 h-8" />
              </div>
              <p className="text-gray-900 font-bold text-lg">No historical deliveries found</p>
              <p className="text-xs text-text-light mt-1">Try modifying your search query or status filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHistory.map(d => (
                <Card key={d.id} className="hover:shadow-soft-lg transition-all duration-300 border-gray-100 group bg-white flex flex-col justify-between h-full">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-surface/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          d.status === 'delivered' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                        }`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 leading-tight">Order {d.order_number}</h3>
                          <p className="text-xs text-text-light mt-0.5">Value: ₹{Number(d.total_amount).toFixed(2)}</p>
                        </div>
                      </div>
                      <OrderStatusBadge status={d.status} />
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                          <MapPin className="w-3 h-3 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivered To</p>
                          <p className="text-sm font-semibold text-gray-900">{d.dealer_name}</p>
                          <p className="text-xs text-text-light line-clamp-2 mt-0.5">{d.delivery_address}</p>
                        </div>
                      </div>

                      {/* Timing Section */}
                      <div className="pt-3 border-t border-gray-50 space-y-2 text-xs">
                        <div className="flex justify-between text-text-light">
                          <span>Assigned:</span>
                          <span className="font-semibold text-gray-700">
                            {d.assigned_at ? new Date(d.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-text-light">
                          <span>Completed:</span>
                          <span className="font-semibold text-gray-700">
                            {d.actual_delivery ? new Date(d.actual_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : new Date(d.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Dispatch Instructions */}
                      {d.notes && (
                        <div className="mt-3 bg-gray-50/50 rounded-xl p-3 border border-gray-100 text-xs">
                          <span className="font-bold text-gray-500 uppercase tracking-wider text-[9px] block mb-1">Dispatch Instructions</span>
                          <p className="text-text-light italic">"{d.notes}"</p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="p-5 pt-0 mt-auto border-t border-gray-50/80">
                      <Link 
                        to={`/traveller/deliveries/${d.id}`}
                        className="mt-4 w-full h-10 border border-gray-100 hover:border-primary/30 hover:bg-primary/5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-text-light hover:text-primary transition-all duration-300"
                      >
                        View Details & Tracking <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Update Status: ${targetStatus.replace('_', ' ').toUpperCase()}`}
      >
        <form onSubmit={submitStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Where is the delivery now?</label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {COMMON_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {locationType === 'Custom Location...' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enter Custom Location</label>
              <input
                type="text"
                required
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g. Near Hubli Toll Gate"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks / Notes (Optional)</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add any extra details..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Submit Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TravellerDashboard;
