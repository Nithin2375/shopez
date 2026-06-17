import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { DEMO_PRODUCTS } from '../data/demoProducts';

const PLACEHOLDER = DEMO_PRODUCTS[0].images[0].url;

function StarRating({ value = 0 }) {
  return (
    <span className="stars" aria-label={`${value} star rating`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(value) ? '' : 'star-empty'}>*</span>
      ))}
    </span>
  );
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const image = product.images?.[0]?.url || PLACEHOLDER;
  const reviewCount = product.ratings?.count || product.reviews?.length || 0;

  const handleAdd = (event) => {
    event.stopPropagation();
    addToCart(product, quantity);
  };

  const handleShopNow = (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/order/${product._id}`, { state: { quantity } });
  };

  return (
    <article className="card product-card" onClick={() => navigate(`/products/${product._id}`)}>
      <div className="product-media">
        <img src={image} alt={product.name} onError={(event) => { event.currentTarget.src = PLACEHOLDER; }} />
        <span className="tag">{product.category}</span>
      </div>

      <div className="product-body">
        <div className="eyebrow">{product.category}</div>
        <h3 className="product-title">{product.name}</h3>
        <div>
          <StarRating value={product.ratings?.average || 0} />
          <span className="muted" style={{ marginLeft: 8 }}>({reviewCount})</span>
        </div>

        <div style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Available: <strong style={{ color: product.stock === 0 ? 'var(--danger)' : 'var(--success)' }}>{product.stock} units</strong>
        </div>

        <div className="product-bottom" style={{ flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
          <div>
            <div className="price">₹{product.price?.toLocaleString()}</div>
            {product.originalPrice && (
              <div className="muted" style={{ textDecoration: 'line-through' }}>
                ₹{product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => {
                const val = parseInt(event.target.value);
                if (!isNaN(val)) {
                  setQuantity(Math.min(product.stock, Math.max(1, val)));
                } else {
                  setQuantity(1);
                }
              }}
              style={{
                width: '46px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'inherit',
                padding: '4px',
                fontSize: '0.88rem',
                fontWeight: 'bold',
                height: '32px',
                outline: 'none',
              }}
            />
            <button
              className="icon-button"
              title="Add to cart"
              type="button"
              onClick={handleAdd}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                fontSize: '1.2rem',
                lineHeight: 1,
                cursor: 'pointer',
                border: '1px solid var(--border)',
                background: 'transparent',
              }}
            >
              +
            </button>
            <button className="button primary btn-sm" type="button" onClick={handleShopNow} style={{ padding: '6px 12px', fontSize: '0.88rem', height: '32px' }}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
