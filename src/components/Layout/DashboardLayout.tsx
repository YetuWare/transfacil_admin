import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, useMediaQuery, Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import RouteIcon from '@mui/icons-material/Route';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EventIcon from '@mui/icons-material/Event';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { colors } from '../../theme';
import { authService } from '../../api/services';

const DRAWER_WIDTH = 260;

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Utilizadores', icon: <PeopleIcon />, path: '/users' },
  { label: 'Subscrições', icon: <ConfirmationNumberIcon />, path: '/subscriptions' },
  { label: 'Reservas', icon: <BookOnlineIcon />, path: '/bookings' },
  { label: 'Viagens', icon: <DirectionsBusIcon />, path: '/trips' },
  { label: 'Planos', icon: <CardMembershipIcon />, path: '/subscription-plans' },
  { label: 'Rotas', icon: <RouteIcon />, path: '/routes' },
  { label: 'Viaturas', icon: <LocalShippingIcon />, path: '/vehicles' },
  { label: 'Eventos', icon: <EventIcon />, path: '/events' },
  { label: 'Reservas Eventos', icon: <EventNoteIcon />, path: '/event-bookings' },
  { label: 'Dados Bancários', icon: <AccountBalanceIcon />, path: '/bank-details' },
  { label: 'Universidades', icon: <SchoolIcon />, path: '/universities' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const goTo = (path: string) => { navigate(path); onClose?.(); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: colors.dark, color: '#fff' }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img src="/logo.png" alt="TransFácil" style={{ height: 28 }} />
      </Box>
      <List sx={{ px: 1, py: 1, flex: 1, overflow: 'auto' }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItemButton key={item.path} onClick={() => goTo(item.path)}
              sx={{
                mb: 0.2, py: 1, px: 1.5,
                bgcolor: active ? 'rgba(200, 230, 0, 0.12)' : 'transparent',
                borderLeft: active ? `3px solid ${colors.primary}` : '3px solid transparent',
                '&:hover': { bgcolor: active ? 'rgba(200, 230, 0, 0.18)' : 'rgba(255,255,255,0.06)' },
              }}>
              <ListItemIcon sx={{ minWidth: 34, color: active ? colors.primary : 'rgba(255,255,255,0.4)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label}
                slotProps={{ primary: { fontWeight: active ? 700 : 400, fontSize: 14 } } as any} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <List sx={{ px: 1, py: 1 }}>
        <ListItemButton onClick={async () => { try { await authService.logout(); } catch {} finally { window.location.href = '/login'; } }}
          sx={{ py: 1, px: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 34, color: 'rgba(255,255,255,0.3)' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Sair" slotProps={{ primary: { fontSize: 14, color: 'rgba(255,255,255,0.5)' } } as any} />
        </ListItemButton>
      </List>
    </Box>
  );
}

export default function DashboardLayout() {
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    authService.me()
      .then((user) => {
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          navigate('/login', { replace: true });
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, []);

  if (checking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: colors.dark }}>
        <Typography sx={{ color: '#fff', fontSize: 14 }}>A verificar autenticação…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.background }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: isMobile ? 0 : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: colors.dark,
            backgroundImage: 'linear-gradient(180deg, #111827 0%, #1a1a2e 100%)',
            borderRight: 'none',
          },
        }}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Outlet context={{ onMenuClick: () => setMobileOpen(!mobileOpen) }} />
      </Box>
    </Box>
  );
}
