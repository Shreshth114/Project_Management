import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Info, Shield } from 'lucide-react';

export const Badge = ({ children, variant, style = {} }) => {
  const val = String(children).toLowerCase();

  let badgeClass = 'badge-info';
  let Icon = Info;

  if (variant === 'success' || val.includes('submitted') || val.includes('completed') || val.includes('approved') || val.includes('closed')) {
    badgeClass = 'badge-success';
    Icon = CheckCircle2;
  } else if (variant === 'warning' || val.includes('progress') || val.includes('review') || val.includes('active')) {
    badgeClass = 'badge-warning';
    Icon = Clock;
  } else if (variant === 'danger' || val.includes('overdue') || val.includes('error') || val.includes('failed') || val.includes('rejected')) {
    badgeClass = 'badge-danger';
    Icon = AlertTriangle;
  } else if (variant === 'info' || val.includes('pending')) {
    badgeClass = 'badge-info';
    Icon = AlertCircle;
  } else if (variant === 'navy') {
    badgeClass = 'badge-navy';
    Icon = Shield;
  }

  return (
    <span className={`badge ${badgeClass}`} style={style}>
      <Icon size={12} />
      <span>{children}</span>
    </span>
  );
};
