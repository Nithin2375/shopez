import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProductById } from '../services/productService';
import { getDemoProductById } from '../data/demoProducts';
import LoadingSpinner from '../components/LoadingSpinner';

function Stars({ value = 0 }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(value) ? '' : 'star-empty'}>*</span>
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then((res) => setProduct(res.data.product || getDemoProductById(id)))
      .catch(() => setProduct(getDemoProductById(id)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="page"><LoadingSpinner /></main>;
  }

  if (!product) {
    return <main className="page"><div className="container">Product not found.</div></main>;
  }

  const image = product.images?.[0]?.url;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleShopNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/order/${product._id}`, { state: { quantity } });
  };

  return (
    <main className="page">
      <div className="container" style={{ padding: '46px 0 70px' }}>
        <button className="button" type="button" onClick={() => navigate('/products')} style={{ marginBottom: 24 }}>
          Back to shop
        </button>

        <section className="panel" style={{ padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 0.9fr) 1fr', gap: 34, alignItems: 'start' }}>
            <div className="product-media" style={{ height: 440, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <img src={image} alt={product.name} />
              <span className="tag">{product.category}</span>
            </div>

            <div>
              <span className="tag">{product.category}</span>
              <h1 style={{ margin: '18px 0 10px', fontSize: '2.2rem' }}>{product.name}</h1>
              <p className="muted" style={{ lineHeight: 1.7 }}>{product.description}</p>

              <div style={{ marginTop: 18 }}>
                <Stars value={product.ratings?.average || 0} />
                <span className="muted" style={{ marginLeft: 10 }}>({product.ratings?.count || 0} reviews)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, margin: '26px 0' }}>
                <strong className="price">₹{product.price.toLocaleString()}</strong>
                {product.originalPrice && <span className="muted" style={{ textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString()}</span>}
                {discount > 0 && <span className="tag">{discount}% off</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <span className="muted">Quantity</span>
                <div className="qty-control">
                  <button className="qty-btn" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setQuantity(Math.min(product.stock, Math.max(1, val)));
                      } else {
                        setQuantity(1);
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
                  <button className="qty-btn" type="button" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}>+</button>
                </div>
                <span className="muted" style={{ fontSize: '0.9rem' }}>({product.stock} items available)</span>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="button" type="button" onClick={() => addToCart(product, quantity)}>
                  Add to Cart
                </button>
                <button className="button primary" type="button" onClick={handleShopNow}>
                  Shop Now
                </button>
              </div>

              <div className="dashboard-grid" style={{ marginTop: 28 }}>
                {['Secure checkout', 'Fast delivery', 'Easy order details', 'Admin managed'].map((item) => (
                  <div className="card" style={{ padding: 16 }} key={item}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
