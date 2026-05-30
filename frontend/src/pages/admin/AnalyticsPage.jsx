import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../../api/analyticsApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import OrdersChart from '../../components/analytics/OrdersChart';
import RevenueChart from '../../components/analytics/RevenueChart';
import DeliveryChart from '../../components/analytics/DeliveryChart';
import TopProductsChart from '../../components/analytics/TopProductsChart';
import { TrendingUp, ShoppingCart, Truck, Award, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAnalytics();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader size="lg" />
        <p className="text-text-light font-medium animate-pulse">Analyzing business data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-text-light">No analytics data available at the moment.</p>
        <button onClick={fetchAnalytics} className="mt-4 text-primary font-bold hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tighter">Business <span className="text-primary italic">Insights.</span></h1>
          <p className="text-text-light text-sm mt-1">Real-time performance tracking and data visualization.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-soft hover:bg-gray-50 transition-all text-xs font-bold text-text"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Orders Trend */}
        <Card className="border-none shadow-soft-xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text">Orders Per Day</h3>
                  <p className="text-[10px] text-text-light uppercase tracking-widest">Last 30 Days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-text">{data.ordersPerDay.reduce((acc, curr) => acc + curr.orders, 0)}</p>
                <p className="text-[10px] text-success font-bold uppercase">Total Orders</p>
              </div>
            </div>
            <OrdersChart data={data.ordersPerDay} />
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="border-none shadow-soft-xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text">Revenue Trend</h3>
                  <p className="text-[10px] text-text-light uppercase tracking-widest">Verified Payments Only</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-text">₹{Math.round(data.revenueTrend.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0)).toLocaleString()}</p>
                <p className="text-[10px] text-success font-bold uppercase">Total Revenue</p>
              </div>
            </div>
            <RevenueChart data={data.revenueTrend} />
          </CardContent>
        </Card>

        {/* Delivery Distribution */}
        <Card className="border-none shadow-soft-xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text">Delivery Distribution</h3>
                <p className="text-[10px] text-text-light uppercase tracking-widest">Real-time Status</p>
              </div>
            </div>
            <DeliveryChart data={data.deliveryStatus} />
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="border-none shadow-soft-xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text">Top Performance</h3>
                <p className="text-[10px] text-text-light uppercase tracking-widest">Highest Volume SKUs</p>
              </div>
            </div>
            <TopProductsChart data={data.topProducts} />
          </CardContent>
        </Card>

      </div>

      {/* Date Notice */}
      <div className="bg-surface p-4 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 text-xs text-text-light font-medium">
        <Calendar className="w-4 h-4" /> Data visualized for period: {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date().toLocaleDateString()}
      </div>

    </div>
  );
};

export default AnalyticsPage;
