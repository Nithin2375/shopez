import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage             from './pages/HomePage';
import ProductsPage         from './pages/ProductsPage';
import ProductDetailPage    from './pages/ProductDetailPage';
import OrderDetailsPage     from './pages/OrderDetailsPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import CartPage             from './pages/CartPage';
import LoginPage            from './pages/LoginPage';
import RegisterPage         from './pages/RegisterPage';
import ProfilePage          from './pages/ProfilePage';
import AdminDashboardPage   from './pages/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/"                        element={<HomePage />} />
            <Route path="/products"                element={<ProductsPage />} />
            <Route path="/products/:id"            element={<ProductDetailPage />} />
            <Route path="/login"                   element={<LoginPage />} />
            <Route path="/register"                element={<RegisterPage />} />
            <Route path="/admin"                   element={<AdminDashboardPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart"                  element={<CartPage />} />
              <Route path="/order/:productId"      element={<OrderDetailsPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="/profile"               element={<ProfilePage />} />
            </Route>
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
