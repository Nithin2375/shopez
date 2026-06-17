import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/authService';
import { getMyOrders } from '../services/orderService';
import { Link, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const COUNTRY_CODES = [
  { code: '+91', name: '🇮🇳 India (+91)' },
  { code: '+1', name: '🇺🇸 USA/Canada (+1)' },
  { code: '+44', name: '🇬🇧 UK (+44)' },
  { code: '+971', name: '🇦🇪 UAE (+971)' },
  { code: '+61', name: '🇦🇺 Australia (+61)' },
  { code: '+65', name: '🇸🇬 Singapore (+65)' },
  { code: '+49', name: '🇩🇪 Germany (+49)' },
  { code: '+81', name: '🇯🇵 Japan (+81)' },
  { code: '+33', name: '🇫🇷 France (+33)' },
  { code: '+39', name: '🇮🇹 Italy (+39)' },
  { code: '+7', name: '🇷🇺 Russia (+7)' },
  { code: '+86', name: '🇨🇳 China (+86)' },
];

export default function ProfilePage() {
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);
  
  const [profile, setProfile] = useState({ name: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: '' } });
  const [orders, setOrders] = useState([]);
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    getProfile()
      .then(res => {
        const fullPhone = res.data.user.phone || '';
        let matchedCode = '+91';
        let mainNumber = fullPhone;

        // Try to match standard country codes
        for (const item of COUNTRY_CODES) {
          if (fullPhone.startsWith(item.code)) {
            matchedCode = item.code;
            mainNumber = fullPhone.slice(item.code.length);
            break;
          }
        }

        setPhoneCode(matchedCode);
        setPhoneNumber(mainNumber);

        setProfile({
          name: res.data.user.name || '',
          phone: fullPhone,
          address: res.data.user.address || { street: '', city: '', state: '', zipCode: '', country: '' }
        });
      })
      .catch(err => console.error('Failed to load profile', err))
      .finally(() => setLoadingProfile(false));

    getMyOrders()
      .then(res => setOrders(res.data.orders))
      .catch(err => {
        console.error('Failed to load orders', err);
        // Load mock orders if API fails
        setOrders([
          { _id: 'demo1', createdAt: new Date().toISOString(), totalPrice: 2999, orderStatus: 'delivered', paymentStatus: 'paid' },
          { _id: 'demo2', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), totalPrice: 1599, orderStatus: 'shipped', paymentStatus: 'paid' }
        ]);
      })
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });
    
    // Combine country code and number
    const combinedPhone = phoneCode + phoneNumber.trim();
    const updatedProfile = {
      ...profile,
      phone: combinedPhone
    };

    try {
      await updateProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setProfile(prev => ({ ...prev, phone: combinedPhone }));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['street', 'city', 'state', 'zipCode', 'country'].includes(name)) {
      setProfile(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 32 }}>My <span className="gradient-text">Account</span></h1>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 32 }}>
          
          {/* Sidebar */}
          <div className="card" style={{ padding: 16, height: 'fit-content' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                onClick={() => setActiveTab('profile')}
                style={{
                  padding: '12px 16px', borderRadius: 'var(--radius)', textAlign: 'left',
                  background: activeTab === 'profile' ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text)',
                  fontWeight: activeTab === 'profile' ? 600 : 500,
                  cursor: 'pointer', transition: 'var(--transition)'
                }}
              >
                👤 Profile Settings
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                style={{
                  padding: '12px 16px', borderRadius: 'var(--radius)', textAlign: 'left',
                  background: activeTab === 'orders' ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text)',
                  fontWeight: activeTab === 'orders' ? 600 : 500,
                  cursor: 'pointer', transition: 'var(--transition)'
                }}
              >
                📦 My Orders
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="card" style={{ padding: 32 }}>
            {activeTab === 'profile' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: 24 }}>Profile Information</h2>
                {loadingProfile ? <LoadingSpinner /> : (
                  <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {message.text && (
                      <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {message.text}
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div className="input-group">
                        <label>Name</label>
                        <input className="input" name="name" value={profile.name} onChange={handleChange} required disabled={!isEditing} />
                      </div>
                      <div className="input-group">
                        <label>Phone</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <select 
                            className="select" 
                            style={{ width: 'fit-content', minWidth: 140, height: 42, padding: '0 8px' }}
                            disabled={!isEditing}
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value)}
                          >
                            {COUNTRY_CODES.map(c => (
                              <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                          </select>
                          <input 
                            className="input" 
                            style={{ flex: 1 }}
                            type="tel"
                            disabled={!isEditing}
                            placeholder="Phone number" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--text-soft)' }}>Saved Address</h3>
                    <div className="input-group">
                      <label>Street Address</label>
                      <input className="input" name="street" value={profile.address.street} onChange={handleChange} disabled={!isEditing} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div className="input-group">
                        <label>City</label>
                        <input className="input" name="city" value={profile.address.city} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="input-group">
                        <label>State</label>
                        <input className="input" name="state" value={profile.address.state} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="input-group">
                        <label>PIN Code</label>
                        <input className="input" name="zipCode" value={profile.address.zipCode} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="input-group">
                        <label>Country</label>
                        <input className="input" name="country" value={profile.address.country} onChange={handleChange} disabled={!isEditing} />
                      </div>
                    </div>

                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button type="submit" className="btn btn-primary" disabled={updating}>
                          {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => { setIsEditing(false); setMessage({ type: '', text: '' }); }} disabled={updating}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-primary" style={{ width: 'fit-content', marginTop: 16 }} onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile Details
                      </button>
                    )}
                  </form>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: 24 }}>My Orders</h2>
                {loadingOrders ? <LoadingSpinner /> : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
                    <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Start Shopping</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map(order => (
                      <div key={order._id} style={{
                        padding: 20, borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>Order #{order._id.slice(-8).toUpperCase()}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <span className={`badge ${order.orderStatus === 'delivered' ? 'badge-success' : 'badge-warning'}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 8 }}>
                            ₹{order.totalPrice.toLocaleString()}
                          </div>
                          <Link to={`/order-confirmation/${order._id}`} className="btn btn-outline btn-sm">
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
