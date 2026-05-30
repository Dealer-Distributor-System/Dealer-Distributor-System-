import React, { useState, useEffect } from 'react';
import { getPayments, verifyPayment, rejectPayment } from '../../api/paymentApi';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getPayments();
      setPayments(res.data || res || []);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm('Are you sure you want to verify this payment?')) return;
    try {
      await verifyPayment(id);
      toast.success('Payment verified successfully');
      fetchPayments();
    } catch (err) {
      toast.error('Failed to verify payment');
    }
  };

  const openRejectModal = (id) => {
    setCurrentPaymentId(id);
    setRejectRemark('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectRemark.trim()) {
      toast.error('Remark is required for rejection');
      return;
    }
    try {
      await rejectPayment(currentPaymentId, rejectRemark);
      toast.success('Payment rejected successfully');
      setIsRejectModalOpen(false);
      fetchPayments();
    } catch (err) {
      toast.error('Failed to reject payment');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified': return <Badge variant="success">Verified</Badge>;
      case 'rejected': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  if (loading && payments.length === 0) return <div className="p-8 text-center text-gray-500">Loading payments...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Payments</h1>
        <Button onClick={fetchPayments} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Ref Number</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">#{payment.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">#{payment.order_id}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">₹{Number(payment.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">{payment.reference_number || 'N/A'}</td>
                  <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {payment.status === 'pending' && (
                      <>
                        <Button onClick={() => handleVerify(payment.id)} variant="primary" size="sm">
                          Verify
                        </Button>
                        <Button onClick={() => openRejectModal(payment.id)} variant="danger" size="sm">
                          Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Payment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
            <Input 
              required
              placeholder="e.g. Invalid reference number"
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button onClick={() => setIsRejectModalOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleReject} variant="danger">
            Confirm Rejection
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPaymentsPage;
