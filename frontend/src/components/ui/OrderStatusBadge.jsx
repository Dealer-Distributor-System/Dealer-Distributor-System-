import React from 'react';
import { Badge } from './Badge';

export const OrderStatusBadge = ({ status }) => {
  const getBadgeProps = (s) => {
    switch (s?.toLowerCase()) {
      case 'pending':
        return { variant: 'warning', text: 'Pending' };
      case 'confirmed':
        return { variant: 'primary', text: 'Confirmed' };
      case 'assigned':
        return { variant: 'secondary', text: 'Assigned' };
      case 'picked_up':
        return { variant: 'secondary', text: 'Picked Up' };
      case 'in_transit':
        return { variant: 'primary', text: 'In Transit' };
      case 'delivered':
        return { variant: 'success', text: 'Delivered' };
      case 'cancelled':
        return { variant: 'danger', text: 'Cancelled' };
      case 'rejected':
      case 'failed':
        return { variant: 'danger', text: s.charAt(0).toUpperCase() + s.slice(1) };
      default:
        return { variant: 'ghost', text: s || 'Unknown' };
    }
  };

  const { variant, text } = getBadgeProps(status);

  return (
    <Badge variant={variant} className="whitespace-nowrap shadow-sm">
      {text}
    </Badge>
  );
};
