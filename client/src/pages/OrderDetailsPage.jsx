import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { placeOrder } from '../services/orderService';
import { getProfile } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDemoProductById } from '../data/demoProducts';

const PAYMENT_METHODS = [
  { value: 'cod',        label: '💵 Cash on Delivery', desc: 'Pay when you receive' },
  { value: 'card',       label: '💳 Credit / Debit Card', desc: 'Secure card payment' },
  { value: 'upi',        label: '📱 UPI',              desc: 'Google Pay, PhonePe, etc.' },
  { value: 'netbanking', label: '🏦 Net Banking',       desc: 'All major banks supported' },
];

export default function OrderDetailsPage() {
  const { productId } = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();
  const { user }      = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();

  const isCartCheckout = productId === 'checkout';

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [placing, setPlacing]   = useState(false);
  const [error,   setError]     = useState('');
  const [qty,     setQty]       = useState(location.state?.quantity || 1);
  const [payment, setPayment]   = useState('cod');
  const [address, setAddress]   = useState({
    street: '', city: '', state: '', country: 'India', zipCode: '',
  });
  const [storedAddress, setStoredAddress] = useState(null);

  useEffect(() => {
    // Fetch profile to get stored address
    getProfile()
      .then(res => {
        if (res.data?.user?.address) {
          setStoredAddress(res.data.user.address);
        }
      })
      .catch(err => console.error('Failed to load profile address:', err));

    if (isCartCheckout) {
      setLoading(false);
    } else {
      getProductById(productId)
        .then(res => setProduct(res.data.product))
        .catch(() => setProduct(getDemoProductById(productId)))
        .finally(() => setLoading(false));
    }
  }, [productId, isCartCheckout]);

  const handleAddressChange = (e) => {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const itemsPrice    = isCartCheckout ? cartSubtotal : (product ? product.price * qty : 0);
  const taxPrice      = parseFloat((itemsPrice * 0.18).toFixed(2));
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice    = itemsPrice + taxPrice + shippingPrice;

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      setError('Please fill in all address fields.'); return;
    }
    setError('');
    setPlacing(true);

    try {
      let orderItems = [];
      if (isCartCheckout) {
        orderItems = cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          name: item.name,
          price: item.price
        }));
      } else {
        orderItems = [{
          product: product._id,
          quantity: qty,
          name: product.name,
          price: product.price
        }];
      }

      const payload = {
        orderItems,
        shippingAddress: address,
        paymentMethod: payment,
      };
      const res = await placeOrder(payload);
      
      if (isCartCheckout) {
        clearCart();
      }
      
      navigate(`/order-confirmation/${res.data.order._id}`);
    } catch (err) {
      console.error('PLACE ORDER ERROR:', err.response?.data || err);
      setError(err.response?.data?.message || 'Order placement failed');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="page"><LoadingSpinner /></div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 1100 }}>
        <h1 style={{ fontSize: '1.9rem', marginBottom: 8 }}>Order <span className="gradient-text">Details</span></h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>Review your order and provide shipping information</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>⚠️ {error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>

          {/* ── Left: Forms ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Product Summary */}
            {isCartCheckout ? (
              <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>📦 Cart Items ({cartItems.length})</h2>
                {cartItems.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-soft)' }}>
                    <img src={item.images?.[0]?.url || ''} alt={item.name}
                      style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', background: 'var(--surface)' }}
                      onError={e => { e.target.src = 'https://placehold.co/60x60/111127/8B5CF6?text=P'; }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{item.name}</h3>
                      <div className="muted" style={{ fontSize: '0.82rem' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              product && (
                <div className="card" style={{ padding: 24 }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>📦 Product</h2>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <img src={product.images?.[0]?.url || ''} alt={product.name}
                      style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', background: 'var(--surface)' }}
                      onError={e => { e.target.src = 'https://placehold.co/80x80/111127/8B5CF6?text=P'; }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{product.name}</h3>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{product.category}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700 }} className="gradient-text">₹{product.price?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="divider" />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Quantity:</span>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                      <span className="qty-value">{qty}</span>
                      <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Shipping Address */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>📍 Shipping Address</h2>
                {storedAddress && (
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--primary)', color: 'var(--primary)', minHeight: 32 }}
                    onClick={() => setAddress(storedAddress)}
                  >
                    📋 Use Saved Address
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Street Address *</label>
                  <input className="input" name="street" value={address.street} onChange={handleAddressChange} placeholder="House no., Street, Area" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="input-group">
                    <label>City *</label>
                    <input className="input" name="city" value={address.city} onChange={handleAddressChange} placeholder="City" />
                  </div>
                  <div className="input-group">
                    <label>State *</label>
                    <input className="input" name="state" value={address.state} onChange={handleAddressChange} placeholder="State" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="input-group">
                    <label>PIN Code *</label>
                    <input className="input" name="zipCode" value={address.zipCode} onChange={handleAddressChange} placeholder="PIN Code" />
                  </div>
                  <div className="input-group">
                    <label>Country</label>
                    <input className="input" name="country" value={address.country} onChange={handleAddressChange} placeholder="Country" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>💰 Payment Method</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.value} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 'var(--radius)',
                    border: `1.5px solid ${payment === m.value ? 'var(--primary)' : 'var(--border-light)'}`,
                    background: payment === m.value ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: 'var(--transition)',
                  }}>
                    <input type="radio" name="payment" value={m.value} checked={payment === m.value}
                      onChange={() => setPayment(m.value)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.label}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{m.desc}</div>
                    </div>
                    {payment === m.value && <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24 }}>🧾 Order Summary</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Items Price', value: `₹${itemsPrice.toLocaleString()}` },
                  { label: `Tax (18% GST)`, value: `₹${taxPrice.toFixed(2)}` },
                  { label: 'Shipping', value: shippingPrice === 0 ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span> : `₹${shippingPrice}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{row.label}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{row.value}</span>
                  </div>
                ))}
                <div className="divider" style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'var(--accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {shippingPrice === 0 && (
                <div className="alert alert-success" style={{ marginBottom: 20, padding: '10px 14px', fontSize: '0.82rem' }}>
                  🎉 You qualify for <strong>FREE delivery</strong>!
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn btn-primary btn-full btn-lg"
              >
                {placing ? '⏳ Placing Order...' : '✅ Place Order'}
              </button>

              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                🔒 Secured by 256-bit SSL encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
