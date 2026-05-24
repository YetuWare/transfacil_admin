import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Skeleton, Alert, Snackbar, Chip, Tabs, Tab, InputAdornment, TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/StatusBadge';
import { useApiData } from '../hooks/useApiData';
import { bookingsService } from '../api/services';
import { colors } from '../theme';
import type { Booking } from '../types/api';

const statusTabs = [
  { label: 'Activas', filter: 'active' },
  { label: 'Usadas', filter: 'used' },
  { label: 'Canceladas', filter: 'cancelled' },
  { label: 'Todas', filter: '' },
];

export default function Bookings() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: bookings, loading, refetch } = useApiData(() => bookingsService.list(), []);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const statusFilter = statusTabs[tab].filter;

  const filtered = ((bookings as Booking[]) || []).filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = b.users?.full_name?.toLowerCase() || '';
      const email = b.users?.email?.toLowerCase() || '';
      const route = b.trips?.routes?.name?.toLowerCase() || '';
      return name.includes(q) || email.includes(q) || route.includes(q);
    }
    return true;
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <Header title="Reservas de Viagens" subtitle="Gerir reservas de transporte dos estudantes" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Filters */}
        <Card sx={{ mb: 3, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ pb: '0 !important' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                {statusTabs.map((t, i) => <Tab key={i} label={`${t.label}${!t.filter ? ` (${(bookings as Booking[])?.length || 0})` : ''}`} />)}
              </Tabs>
              <TextField size="small" placeholder="Pesquisar estudante, email ou rota..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.greyLight }} /></InputAdornment> } }}
                sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 8 }, mb: 1 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Table */}
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <DirectionsBusIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhuma reserva encontrada
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                {search ? 'Tente ajustar a pesquisa.' : 'Ainda não existem reservas nesta categoria.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Estudante</TableCell>
                    <TableCell>Rota</TableCell>
                    <TableCell>Data/Hora</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>QR Code</TableCell>
                    <TableCell>Validação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{b.users?.full_name || '—'}</Typography>
                        <Typography variant="caption" sx={{ color: colors.grey }}>{b.users?.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>
                          {b.trips?.routes?.origin && b.trips?.routes?.destination
                            ? `${b.trips.routes.origin} → ${b.trips.routes.destination}`
                            : b.trips?.routes?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13, color: colors.grey, whiteSpace: 'nowrap' }}>
                          {b.trips?.departure_time ? fmtDate(b.trips.departure_time) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell><StatusBadge status={b.status} /></TableCell>
                      <TableCell>
                        <Chip label={b.qr_token?.slice(0, 8) + '…'} size="small"
                          sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: colors.surfaceVariant, color: colors.grey }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 12, color: colors.grey }}>
                          {b.validated_at ? fmtDate(b.validated_at) : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
