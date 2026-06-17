import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const isShop = location.pathname === '/' || location.pathname.startsWith('/products');

  const handleSearch = (event) => {
    const value = event.target.value;
    if (!isShop) {
      navigate(`/products?keyword=${encodeURIComponent(value)}`);
      return;
    }

    const params = Object.fromEntries(searchParams.entries());
    if (value) params.keyword = value;
    else delete params.keyword;
    setSearchParams(params);
  };

  const handleLogout = () => {
    logout();
    navigate('/products');
  };

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link className="brand" to="/products">
          <span className="brand-mark">S</span>
          <span>SHOPEZ</span>
        </Link>

        <label className="searchbox">
          <span>🔍</span>
          <input
            aria-label="Search products"
            value={keyword}
            onChange={handleSearch}
            placeholder="Search products..."
          />
        </label>

        <nav className="nav-actions">
          <Link className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`} to="/products">
            Shop
          </Link>
          <Link className="nav-link" to="/cart">
            Cart {cartCount > 0 ? `(${cartCount})` : ''}
          </Link>
          <Link className="nav-link" to="/profile">
            {user?.name || 'Demo'}
          </Link>
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <Link className="admin-pill" to="/admin">
              Admin
            </Link>
          )}
          {user ? (
            <button type="button" onClick={handleLogout} style={{ background: '#3b82f6', color: '#ffffff', border: 0, padding: '6px 14px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
              Logout
            </button>
          ) : (
            <Link className="nav-link" to="/login">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
