import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDeliveryDetail, getDeliveryTracking, updateDeliveryStatus, acceptDelivery } from '../../api/deliveryApi';
import { ArrowLeft, MapPin, Package, Phone, User, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import DeliveryTrackingTimeline from '../../components/delivery/DeliveryTrackingTimeline';
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

const TravellerDeliveryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status update modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [locationType, setLocationType] = useState('Hubli Warehouse');
  const [customLocation, setCustomLocation] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [detailRes, trackingRes] = await Promise.all([
        getDeliveryDetail(id),
        getDeliveryTracking(id)
      ]);
      setDelivery(detailRes.data);
      setTracking(trackingRes.data || []);
    } catch (err) {
      toast.error('Failed to load delivery details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async () => {
    try {
      setUpdating(true);
      await acceptDelivery(id);
      toast.success('Delivery accepted successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept delivery');
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = (status) => {
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
      setUpdating(true);
      setModalOpen(false);
      await updateDeliveryStatus(id, { 
        status: targetStatus, 
        location: finalLocation, 
        remark: remark || null 
      });
      toast.success(`Status updated to ${targetStatus.replace('_', ' ')}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading delivery details...</div>;
  if (!delivery) return <div className="p-8 text-center text-red-500">Delivery not found</div>;

  const isTerminal = ['delivered', 'failed'].includes(delivery.status);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <Link to="/traveller/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Delivery #{delivery.order_number}</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Assigned {new Date(delivery.assigned_at).toLocaleString()}
            </p>
          </div>
          <Badge variant={delivery.status === 'delivered' ? 'success' : 'primary'}>
            {delivery.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" /> Pickup From
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-900 font-medium">Prince Piping Warehouse</p>
                <p className="text-sm text-gray-600 mt-1">{delivery.pickup_address}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Deliver To
              </h3>
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <p className="text-sm text-gray-900 font-bold">{delivery.business_name}</p>
                <p className="text-sm text-gray-600 mt-1">{delivery.delivery_address}</p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Contact Details
              </h3>
              <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Recipient</span>
                  <span className="text-sm text-gray-900 font-medium">{delivery.dealer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Phone</span>
                  <span className="text-sm text-gray-900 font-medium">{delivery.dealer_phone || '+91 9876543210'}</span>
                </div>
              </div>
            </section>

            {!isTerminal && (
              <section className="pt-4">
                <div className="grid grid-cols-1 gap-3">
                  {delivery.status === 'unassigned' && (
                    <Button onClick={handleAcceptDelivery} disabled={updating} variant="primary" className="w-full h-12">
                      Accept Delivery
                    </Button>
                  )}
                  {delivery.status === 'assigned' && (
                    <Button onClick={() => openUpdateModal('picked_up')} disabled={updating} variant="primary" className="w-full h-12">
                      Confirm Pickup
                    </Button>
                  )}
                  {delivery.status === 'picked_up' && (
                    <Button onClick={() => openUpdateModal('in_transit')} disabled={updating} variant="primary" className="w-full h-12">
                      Start Transit
                    </Button>
                  )}
                  {delivery.status === 'in_transit' && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => openUpdateModal('delivered')} disabled={updating} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white">
                        Delivered
                      </Button>
                      <Button onClick={() => openUpdateModal('failed')} disabled={updating} variant="danger" className="w-full h-12">
                        Failed
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Items List Section */}
        <div className="p-6 border-t border-gray-50">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Package className="w-3.5 h-3.5" /> Order Items
          </h3>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
            {delivery.items && delivery.items.length > 0 ? (
              delivery.items.map((item) => (
                <div key={item.order_item_id} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-500">{item.category_name} • Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{Number(item.subtotal).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-sm text-gray-500 italic">No items found for this order.</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50/50 border-t border-gray-100">
          <DeliveryTrackingTimeline tracking={tracking} currentStatus={delivery.status} />
        </div>
      </div>

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

export default TravellerDeliveryDetailPage;
