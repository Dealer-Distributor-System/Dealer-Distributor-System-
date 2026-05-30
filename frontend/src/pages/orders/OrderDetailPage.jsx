import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, submitOrderFeedback } from '../../api/orderApi';
import { getOrderTracking } from '../../api/deliveryApi';
import { ArrowLeft, Package, MapPin, Truck, Phone, RefreshCw, Info, ShoppingBag, Star } from 'lucide-react';
import { OrderStatusBadge } from '../../components/ui/OrderStatusBadge';
import { Loader } from '../../components/ui/Loader';
import { Badge } from '../../components/ui/Badge';
import TrackingTimeline from '../../components/orders/TrackingTimeline';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../services/paymentService';
import { loadRazorpay } from '../../utils/razorpay';
import { Button } from '../../components/ui/Button';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState({ data: [], status: 'pending', traveller: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const [isPaying, setIsPaying] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    if (!feedbackRating) {
      toast.error('Please select a star rating.');
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      const response = await submitOrderFeedback(order.id, {
        rating: feedbackRating,
        description: feedbackDescription,
      });

      setOrder((prev) => ({ ...prev, feedback: response.data }));
      toast.success(response.message || 'Feedback submitted successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleRetryPayment = async () => {
    try {
      setIsPaying(true);

      // 0. Ensure Razorpay is loaded
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsPaying(false);
        return;
      }

      const amountInPaise = Math.round(order.total_amount * 100);

      // 1. Create Razorpay order on backend
      const rzpResponse = await createRazorpayOrder(amountInPaise);
      const { razorpay_order_id, amount, currency, key_id } = rzpResponse.data || {};

      if (!razorpay_order_id || !amount || !currency || !key_id) {
        throw new Error('Payment gateway returned an invalid order response');
      }

      // 2. Configure Razorpay Options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "Prince Piping",
        description: "Order Payment",
        image: "/logo.png",
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
            setIsPaying(true);
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order.id,
            };

            // 3. Verify payment on backend
            await verifyRazorpayPayment(verificationData);
            
            toast.success('Payment successful!');
            await fetchData();
          } catch (error) {
            console.error('Verification failed', error);
            toast.error(error?.response?.data?.message || 'Payment verification failed');
            fetchData();
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          address: "Order ID: " + order.id,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function() {
            setIsPaying(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description || 'Payment failed');
        setIsPaying(false);
      });
      rzp.open();

    } catch (error) {
      console.error('Razorpay initialization failed', error);
      toast.error(error?.message || 'Could not initialize payment gateway');
      setIsPaying(false);
    }
  };

  const fetchData = useCallback(async (isAuto = false) => {
    try {
      if (!isAuto) setLoading(true);
      else setRefreshing(true);

      const [orderRes, trackingRes] = await Promise.all([
        getOrderById(id),
        getOrderTracking(id)
      ]);

      setOrder(orderRes.data);
      setTracking(trackingRes);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 10 seconds for real-time tracking
    const interval = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !order) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader size="lg" />
      <p className="text-text-light font-medium animate-pulse">Loading order details...</p>
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-text mb-4">Order not found</h2>
      <Link to="/orders">
        <Button variant="primary">Back to My Orders</Button>
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/orders" className="inline-flex items-center text-sm font-bold text-text-light hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Orders
        </Link>
        <button 
          onClick={() => fetchData()} 
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-bold text-primary hover:underline disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> 
          {refreshing ? 'Updating...' : 'Refresh Status'}
        </button>
      </div>
      
      {/* Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-soft-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-text tracking-tighter">Order <span className="text-primary">{order.order_number}</span></h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-text-light">
            <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> {order.items?.length} Items</span>
            <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Placed {new Date(order.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Total Amount</p>
          <p className="text-3xl font-black text-text">₹{Number(order.total_amount).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Tracking & Items */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Live Tracking Timeline */}
          <div className="bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-text">Live <span className="text-primary italic">Tracking.</span></h2>
                <p className="text-xs text-text-light font-medium mt-1">Real-time status updates from our delivery network.</p>
              </div>
              <Truck className="w-6 h-6 text-primary/40" />
            </div>
            <TrackingTimeline status={order.status} trackingData={tracking.data} />
          </div>

          {/* Items List */}
          <div className="bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black text-text">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item) => (
                <div key={item.order_item_id} className="p-8 flex items-center gap-6 group hover:bg-gray-50/50 transition-colors">
                  <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-text text-lg">{item.product_name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs font-bold text-text-light bg-gray-100 px-2 py-1 rounded-lg">Qty: {item.quantity}</span>
                      <span className="text-xs font-medium text-text-light">₹{Number(item.unit_price).toLocaleString()} / unit</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-text text-xl">₹{Number(item.subtotal).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Details & Traveller */}
        <div className="space-y-8">
          
          {/* Order Summary */}
          <div className="bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100 overflow-hidden p-8">
            <h2 className="text-lg font-black text-text mb-6">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-light font-bold">Subtotal</span>
                <span className="text-text font-black">₹{(Number(order.total_amount) - Number(order.delivery_cost || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-light font-bold">Delivery Fee</span>
                <span className="text-text font-black">₹{Number(order.delivery_cost || 0).toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                <div>
                  <p className="text-xs font-black text-text-light uppercase tracking-widest">Grand Total</p>
                  <p className="text-2xl font-black text-text">₹{Number(order.total_amount).toLocaleString()}</p>
                </div>
                <Badge variant={order.payment_status === 'verified' ? 'success' : 'warning'}>
                  {order.payment_status}
                </Badge>
              </div>
              {user?.role === 'dealer' && order.payment_status !== 'verified' && order.status !== 'cancelled' && (
                <div className="pt-6 border-t border-gray-100 mt-2">
                  <Button
                    variant="primary"
                    className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    onClick={handleRetryPayment}
                    isLoading={isPaying}
                    disabled={isPaying}
                  >
                    Pay / Retry Payment
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Traveller Info */}
          <div className="bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100 overflow-hidden p-8">
            <h2 className="text-lg font-black text-text mb-6">Logistics Details</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Destination</p>
                  <p className="text-xs font-bold text-text leading-relaxed">{order.delivery_address || 'Pickup from Store'}</p>
                </div>
              </div>

              {tracking.traveller && (
                <div className="pt-6 border-t border-gray-50 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Assigned Agent</p>
                      <p className="text-sm font-black text-text">{tracking.traveller.name}</p>
                      <a 
                        href={`tel:${tracking.traveller.phone}`}
                        className="mt-2 flex items-center gap-1.5 text-xs font-bold text-success hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" /> {tracking.traveller.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {!tracking.traveller && order.status !== 'delivered' && (
                <div className="bg-amber-50 rounded-2xl p-4 flex items-start gap-3 border border-amber-100/50">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                    A delivery agent will be assigned shortly once your payment is verified by our team.
                  </p>
                </div>
              )}
            </div>
          </div>

          {user?.role === 'dealer' && order.status === 'delivered' && (
            <div className="bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100 overflow-hidden p-8">
              <h2 className="text-lg font-black text-text mb-2">Order Feedback</h2>
              <p className="text-xs text-text-light font-medium mb-6">Share your experience for this completed order.</p>

              {order.feedback ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${star <= order.feedback.rating ? 'fill-warning text-warning' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  {order.feedback.description && (
                    <p className="text-sm text-text-light leading-relaxed bg-gray-50 rounded-2xl p-4">
                      {order.feedback.description}
                    </p>
                  )}
                  <p className="text-[10px] font-bold text-success uppercase tracking-widest">Feedback submitted</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-text-light uppercase tracking-widest mb-3">
                      Star Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-warning/30"
                          aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-8 h-8 ${star <= feedbackRating ? 'fill-warning text-warning' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-text-light uppercase tracking-widest mb-3">
                      Description
                    </label>
                    <textarea
                      value={feedbackDescription}
                      onChange={(e) => setFeedbackDescription(e.target.value)}
                      rows="4"
                      maxLength={1000}
                      placeholder="Enter your feedback"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-12 text-sm font-bold"
                    isLoading={isSubmittingFeedback}
                    disabled={isSubmittingFeedback}
                  >
                    Submit Feedback
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
