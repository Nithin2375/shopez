import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];
const STATUS_ICONS = { placed: '📋', confirmed: '✅', shipped: '🚚', delivered: '🏠' };

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(orderId)
      .then(res => setOrder(res.data.order))
      .catch(() => setOrder(MOCK_ORDER))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="page"><LoadingSpinner /></div>;

  const currentStep = STATUS_STEPS.indexOf(order?.orderStatus || 'placed');

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 820 }}>

        {/* Success Banner */}
        <div style={{
          textAlign: 'center', padding: '48px 32px', marginBottom: 40,
          background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(139,92,246,0.1))',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 'var(--radius-lg)',
          animation: 'fadeInUp 0.6s ease',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: 'linear-gradient(135deg,#10B981,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', boxShadow: '0 0 30px rgba(16,185,129,0.4)',
          }}>✓</div>
          <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>Order <span className="gradient-text">Confirmed!</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: 16 }}>
            Your order has been placed successfully. We'll notify you when it ships!
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)',
            padding: '8px 20px',
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Order ID:</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)', fontSize: '0.9rem' }}>
              #{(order?._id || orderId).toString().slice(-10).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Order Progress */}
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 28 }}>📍 Order Progress</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress Line */}
            <div style={{ position: 'absolute', top: 24, left: '12.5%', right: '12.5%', height: 2, background: 'var(--border-light)', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 24, left: '12.5%', width: `${(currentStep / (STATUS_STEPS.length - 1)) * 75}%`, height: 2, background: 'linear-gradient(90deg,#8B5CF6,#EC4899)', zIndex: 1, transition: 'width 1s ease' }} />

            {STATUS_STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 2 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: i <= currentStep ? 'linear-gradient(135deg,#8B5CF6,#EC4899)' : 'var(--card)',
                  border: `2px solid ${i <= currentStep ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', transition: 'var(--transition)',
                  boxShadow: i <= currentStep ? '0 0 20px rgba(139,92,246,0.4)' : 'none',
                }}>{STATUS_ICONS[step]}</div>
                <span style={{
                  fontSize: '0.8rem', fontWeight: i === currentStep ? 700 : 500,
                  color: i <= currentStep ? 'var(--text)' : 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Info Grid */}
        <div className="grid-2" style={{ marginBottom: 24 }}>

          {/* Shipping */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📍 Shipping Address</h3>
            {order?.shippingAddress ? (
              <div style={{ color: 'var(--text-soft)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{order.user?.name || 'Customer'}</div>
                <div>{order.shippingAddress.street}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                <div>{order.shippingAddress.zipCode}, {order.shippingAddress.country}</div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>123 Main Street, Mumbai, Maharashtra - 400001, India</p>
            )}
          </div>

          {/* Payment */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>💳 Payment Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Method', value: (order?.paymentMethod || 'cod').toUpperCase() },
                { label: 'Status', value: <span className="badge badge-warning">{order?.paymentStatus || 'Pending'}</span> },
                { label: 'Total', value: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(order?.totalPrice || 2999).toLocaleString()}</span> },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{row.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Items */}
        {order?.orderItems?.length > 0 && (
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>📦 Ordered Items</h3>
            {order.orderItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < order.orderItems.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/products" className="btn btn-primary btn-lg">🛍️ Continue Shopping</Link>
          <Link to="/profile" state={{ activeTab: 'orders' }} className="btn btn-outline btn-lg">📦 View My Orders</Link>
        </div>
      </div>
    </div>
  );
}

const MOCK_ORDER = {
  _id: 'demo123', orderStatus: 'confirmed', paymentStatus: 'pending', paymentMethod: 'cod',
  totalPrice: 2999, user: { name: 'Customer' },
  shippingAddress: { street: '123 Main St', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' },
  orderItems: [{ name: 'Premium Wireless Headphones', quantity: 1, price: 2999 }],
};
