import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Subscriptions from './pages/Subscriptions';
import Bookings from './pages/Bookings';
import SubscriptionPlans from './pages/SubscriptionPlans';
import RoutesPage from './pages/Routes';
import Vehicles from './pages/Vehicles';
import Events from './pages/Events';
import EventBookings from './pages/EventBookings';
import BankDetails from './pages/BankDetails';
import Universities from './pages/Universities';
import Trips from './pages/Trips';
import SupportRequests from './pages/SupportRequests';
import Login from './pages/Login';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/subscription-plans" element={<SubscriptionPlans />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/events" element={<Events />} />
            <Route path="/event-bookings" element={<EventBookings />} />
            <Route path="/bank-details" element={<BankDetails />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/support-requests" element={<SupportRequests />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
