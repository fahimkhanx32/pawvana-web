import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import Home from '@/pages/store/Home';
import Shop from '@/pages/store/Shop';
import ProductDetail from '@/pages/store/ProductDetail';
import Cart from '@/pages/store/Cart';
import Checkout from '@/pages/store/Checkout';
import OrderSuccess from '@/pages/store/OrderSuccess';
import Wishlist from '@/pages/store/Wishlist';
import NotFound from '@/pages/store/NotFound';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import AccountShell from '@/pages/account/AccountShell';
import Profile from '@/pages/account/Profile';
import Orders from '@/pages/account/Orders';

// The dashboard is lazy-loaded so shoppers never download admin code.
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const Overview = lazy(() => import('@/pages/admin/Overview'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminCategories = lazy(() => import('@/pages/admin/Categories'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'));

const Fallback = () => <div className="grid min-h-[50vh] place-items-center text-brand"><LoaderCircle className="animate-spin" size={32} aria-label="Loading" /></div>;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

/**
 * NOTE: these guards only hide screens. The backend has no authentication on its routes,
 * so real protection has to be added server-side (see README).
 */
function RequireAuth() {
  const { isAuthed } = useAuth();
  const location = useLocation();
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
function RequireStaff({ adminOnly }) {
  const { isStaff, isAdmin } = useAuth();
  return (adminOnly ? isAdmin : isStaff) ? <Outlet /> : <Navigate to="/" replace />;
}
function GuestOnly() {
  const { isAuthed } = useAuth();
  return isAuthed ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:slug" element={<ProductDetail />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="order-success" element={<OrderSuccess />} />
            <Route element={<RequireAuth />}>
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="account" element={<AccountShell />}>
                <Route index element={<Profile />} />
                <Route path="orders" element={<Orders />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route element={<GuestOnly />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>
            {/* exact paths used by the links in the backend's emails */}
            <Route path="resetpassword/:token" element={<ResetPassword />} />
            <Route path="verifyemail/:token" element={<VerifyEmail />} />
          </Route>

          <Route element={<RequireStaff />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route element={<RequireStaff adminOnly />}>
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
