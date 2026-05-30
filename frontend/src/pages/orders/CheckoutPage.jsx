import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, MapPin, Package, AlertCircle, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import useAuth from '../../hooks/useAuth';
import { createOrder } from '../../api/orderApi';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../services/paymentService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { loadRazorpay } from '../../utils/razorpay';

const SUPPORTED_CITIES = [
  { name: 'Dharwad', distance_km: 20 },
  { name: 'Gadag', distance_km: 55 },
  { name: 'Haveri', distance_km: 75 },
  { name: 'Belgaum (Belagavi)', distance_km: 94 },
  { name: 'Koppal', distance_km: 130 },
  { name: 'Ranebennur', distance_km: 90 },
  { name: 'Hospet (Hosapete)', distance_km: 145 },
  { name: 'Bagalkot', distance_km: 125 },
  { name: 'Harihar', distance_km: 120 },
  { name: 'Davanagere', distance_km: 140 },
  { name: 'Bellary (Ballari)', distance_km: 185 },
  { name: 'Sirsi', distance_km: 100 },
  { name: 'Karwar', distance_km: 175 },
  { name: 'Dandeli', distance_km: 120 },
  { name: 'Gokak', distance_km: 105 },
  { name: 'Nipani', distance_km: 155 },
  { name: 'Chikodi', distance_km: 140 },
  { name: 'Jamkhandi', distance_km: 110 },
  { name: 'Gangavati', distance_km: 170 },
  { name: 'Raichur', distance_km: 230 },
  { name: 'Yadgir', distance_km: 290 },
  { name: 'Gulbarga (Kalaburagi)', distance_km: 280 },
  { name: 'Bidar', distance_km: 370 },
  { name: 'Shimoga (Shivamogga)', distance_km: 170 },
  { name: 'Sagar', distance_km: 155 },
  { name: 'Bhatkal', distance_km: 200 },
  { name: 'Udupi', distance_km: 280 },
  { name: 'Mangalore (Mangaluru)', distance_km: 320 },
  { name: 'Chikmagalur', distance_km: 225 },
  { name: 'Hassan', distance_km: 275 },
  { name: 'Madikeri', distance_km: 310 },
  { name: 'Tumkur (Tumakuru)', distance_km: 325 },
  { name: 'Bangalore (Bengaluru)', distance_km: 410 },
  { name: 'Ramanagara', distance_km: 380 },
  { name: 'Kolar', distance_km: 470 },
  { name: 'Chikkaballapur', distance_km: 440 },
  { name: 'Mandya', distance_km: 350 },
  { name: 'Mysore (Mysuru)', distance_km: 390 },
  { name: 'Chamarajanagar', distance_km: 440 },
];

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState('pickup'); // 'pickup' | 'delivery'
  const [selectedCityName, setSelectedCityName] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Derived state
  const selectedCity = SUPPORTED_CITIES.find(c => c.name === selectedCityName);
  const distance = deliveryType === 'delivery' && selectedCity ? selectedCity.distance_km : 0;
  const deliveryCharge = deliveryType === 'delivery' ? distance * 100 : 0;
  const finalTotal = cartTotal + deliveryCharge;

  // Protect empty cart
  useEffect(() => {
    if (cartItems.length === 0 && !isPlacingOrder) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cartItems, navigate, isPlacingOrder]);

  const handlePayment = async (orderId, amountInPaise) => {
    try {
      // 0. Ensure Razorpay is loaded
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsPlacingOrder(false);
        return;
      }

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
            setIsPlacingOrder(true);
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            };

            // 3. Verify payment on backend
            await verifyRazorpayPayment(verificationData);
            
            toast.success('Payment successful! Order placed.');
            await clearCart();
            navigate('/orders');
          } catch (error) {
            console.error('Verification failed', error);
            toast.error(error?.response?.data?.message || 'Payment verification failed');
            navigate('/orders');
          } finally {
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          address: "Order ID: " + orderId,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function() {
            setIsPlacingOrder(false);
            toast.error('Payment cancelled');
            navigate('/orders');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description || 'Payment failed');
        navigate('/orders');
      });
      rzp.open();

    } catch (error) {
      console.error('Razorpay initialization failed', error);
      toast.error(error?.message || 'Could not initialize payment gateway');
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (deliveryType === 'delivery' && !selectedCity) {
      toast.error('Please select a delivery city.');
      return;
    }

    try {
      setIsPlacingOrder(true);

      const orderPayload = {
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? selectedCity.name : 'Self Pickup – Vidyanagar, Hubli, Karnataka',
        delivery_distance_km: distance,
        notes: `City: ${selectedCityName}, Distance: ${distance}km`,
      };

      // 1. Create internal order first
      const response = await createOrder(orderPayload);
      const orderData = response.data; // This is the 'data' object from {success, message, data}
      const createdOrderId = orderData.id;
      
      // 2. Initiate Razorpay flow
      const amountInPaise = Math.round(orderData.total_amount * 100);
      await handlePayment(createdOrderId, amountInPaise);

    } catch (error) {
      console.error('Failed to place order', error);
      toast.error(error?.response?.data?.message || 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <Link to="/cart" className="inline-flex items-center text-text-light hover:text-primary transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
      </Link>

      <h1 className="text-3xl font-extrabold text-text tracking-tight mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Forms & Options */}
        <div className="flex-1 space-y-6">
          
          {/* Cart Summary Snippet */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" /> Order Items ({cartItems.length})
              </h2>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-[var(--radius-soft)] overflow-hidden shrink-0">
                        <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div>
                        <p className="font-semibold text-text line-clamp-1">{item.name}</p>
                        <p className="text-text-light">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="font-bold text-text shrink-0 ml-4">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-text mb-6 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-primary" /> Delivery Method
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Pickup Option */}
                <label 
                  className={`relative flex items-center p-4 border-2 rounded-[var(--radius-soft)] cursor-pointer transition-all duration-200 ${
                    deliveryType === 'pickup' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="delivery_type" 
                    value="pickup"
                    className="sr-only"
                    checked={deliveryType === 'pickup'}
                    onChange={() => {
                      setDeliveryType('pickup');
                      setSelectedCityName(''); // reset city
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${deliveryType === 'pickup' ? 'text-primary' : 'text-text'}`}>Self Pickup</h3>
                      {deliveryType === 'pickup' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <p className="text-sm text-text-light">Collect from our store in Hubli</p>
                    <p className="text-xs text-text-light mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Vidyanagar, Hubli, Karnataka</p>
                    <p className="text-sm font-bold text-success mt-2">Free</p>
                  </div>
                </label>

                {/* Delivery Option */}
                <label 
                  className={`relative flex items-center p-4 border-2 rounded-[var(--radius-soft)] cursor-pointer transition-all duration-200 ${
                    deliveryType === 'delivery' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="delivery_type" 
                    value="delivery"
                    className="sr-only"
                    checked={deliveryType === 'delivery'}
                    onChange={() => setDeliveryType('delivery')}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${deliveryType === 'delivery' ? 'text-primary' : 'text-text'}`}>Home Delivery</h3>
                      {deliveryType === 'delivery' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <p className="text-sm text-text-light">Delivered by our traveller network</p>
                    <p className="text-sm font-bold text-text mt-2">Distance-based charge</p>
                  </div>
                </label>
              </div>

              {/* City Selection (Only if delivery is chosen) */}
              {deliveryType === 'delivery' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-text mb-2">Select Delivery City</label>
                  <div className="relative">
                    <select
                      value={selectedCityName}
                      onChange={(e) => setSelectedCityName(e.target.value)}
                      className="w-full h-12 rounded-[var(--radius-soft)] border border-gray-200 bg-surface px-10 py-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-shadow"
                    >
                      <option value="" disabled>-- Choose a City --</option>
                      {SUPPORTED_CITIES.sort((a,b) => a.name.localeCompare(b.name)).map(city => (
                        <option key={city.name} value={city.name}>
                          {city.name} ({city.distance_km} km away)
                        </option>
                      ))}
                    </select>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    
                    {/* Custom chevron */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {selectedCity && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-[var(--radius-soft)] flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-text font-medium">Delivery Calculation</p>
                        <p className="text-sm text-text-light mt-1">
                          {selectedCity.distance_km} km × ₹100/km = <span className="font-bold text-text">₹{deliveryCharge.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pricing Breakdown */}
        <div className="w-full lg:w-96 shrink-0">
          <Card className="sticky top-24 border border-gray-100 shadow-soft-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-text mb-6">Payment Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-text-light">
                  <span>Product Total</span>
                  <span className="font-medium text-text">₹{cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-text-light">
                  <span>Delivery Charge</span>
                  <span className={`font-medium ${deliveryCharge === 0 ? 'text-success' : 'text-text'}`}>
                    {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-lg font-bold text-text">Final Total</span>
                    <span className="block text-xs text-text-light mt-1">Includes all taxes</span>
                  </div>
                  <span className="text-3xl font-extrabold text-primary transition-all duration-300">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                className="w-full h-14 text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                onClick={handlePlaceOrder}
                isLoading={isPlacingOrder}
                disabled={isPlacingOrder || (deliveryType === 'delivery' && !selectedCityName)}
              >
                {!isPlacingOrder && <CheckCircle2 className="w-5 h-5" />}
                Pay & Place Order
              </Button>
              
              <div className="mt-4 flex items-start gap-2 text-xs text-text-light">
                <AlertCircle className="w-4 h-4 shrink-0 text-warning" />
                <p>By placing this order, you agree to our dealer terms of service and distance-based delivery fee policies.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
