import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const navigate = useNavigate();

  const tax = cartSubtotal * 0.18;
  const shipping = cartSubtotal > 500 ? 0 : 50;
  const total = cartSubtotal + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 16 }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 32 }}>Your <span className="gradient-text">Cart</span></h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32, alignItems: 'start' }}>
          
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cartItems.map(item => (
              <div key={item._id} className="card" style={{ display: 'flex', padding: 16, gap: 20, alignItems: 'center' }}>
                <img 
                  src={item.images?.[0]?.url || 'https://placehold.co/100x100/111127/8B5CF6?text=Product'} 
                  alt={item.name}
                  style={{ width: 100, height: 100, borderRadius: 10, objectFit: 'cover', background: 'var(--surface)' }}
                />
                
                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item._id}`} style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8, display: 'block' }}>
                    {item.name}
                  </Link>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
                    ₹{item.price.toLocaleString()}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              updateQuantity(item._id, Math.min(item.stock, Math.max(1, val)));
                            } else {
                              updateQuantity(item._id, 1);
                            }
                          }}
                          style={{
                            width: '40px',
                            textAlign: 'center',
                            background: 'transparent',
                            border: 'none',
                            color: 'inherit',
                            outline: 'none',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            padding: 0
                          }}
                        />
                        <button className="qty-btn" onClick={() => updateQuantity(item._id, Math.min(item.stock, item.quantity + 1))}>+</button>
                      </div>
                      <span className="muted" style={{ fontSize: '0.8rem' }}>({item.stock} available)</span>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      style={{ background: 'transparent', color: 'var(--error)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24 }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span style={{ fontWeight: 500 }}>₹{cartSubtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Tax (18%)</span>
                <span style={{ fontWeight: 500 }}>₹{tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                <span style={{ fontWeight: 500 }}>
                  {shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `₹${shipping}`}
                </span>
              </div>
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }} className="gradient-text">
                ₹{total.toLocaleString()}
              </span>
            </div>

            <button 
              className="btn btn-primary btn-full btn-lg"
              onClick={() => navigate('/order/checkout')}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
