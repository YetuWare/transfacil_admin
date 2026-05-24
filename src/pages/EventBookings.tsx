import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tabs, Tab, Skeleton, Alert, Snackbar, InputAdornment,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SearchIcon from '@mui/icons-material/Search';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/StatusBadge';
import { useApiData } from '../hooks/useApiData';
import { eventBookingsService } from '../api/services';
import { colors } from '../theme';
import type { EventBooking } from '../types/api';

export default function EventBookings() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [rejectNotes, setRejectNotes] = useState('');
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const fetcher = tab === 0 ? () => eventBookingsService.list('pending') : () => eventBookingsService.list();
  const { data: bookings, loading, refetch } = useApiData(fetcher, [tab]);

  const allBookings = (bookings as EventBooking[]) || [];
  const filtered = search
    ? allBookings.filter((b) => {
        const q = search.toLowerCase();
        const name = b.users?.full_name?.toLowerCase() || '';
        const email = b.users?.email?.toLowerCase() || '';
        const event = b.events?.title?.toLowerCase() || '';
        return name.includes(q) || email.includes(q) || event.includes(q);
      })
    : allBookings;

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const handleApprove = async (id: string) => {
    try {
      await eventBookingsService.approve(id);
      notify('Reserva aprovada! QR code enviado.', 'success');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao aprovar', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) return;
    try {
      await eventBookingsService.reject(rejectDialog.id, rejectNotes);
      notify('Reserva rejeitada.', 'success');
      setRejectDialog({ open: false, id: '' });
      setRejectNotes('');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao rejeitar', 'error');
    }
  };

  return (
    <>
      <Header title="Reservas de Eventos" subtitle="Gerir reservas de transporte para eventos" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TextField size="small" placeholder="Pesquisar estudante, email ou evento..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.greyLight }} /></InputAdornment> } }}
            sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 8 } }} />
        </Box>
        <Card sx={{ mb: 3, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ pb: '0 !important' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Pendentes" />
              <Tab label="Todas" />
            </Tabs>
          </CardContent>
        </Card>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <EventNoteIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhuma reserva encontrada
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                {search ? 'Tente ajustar a pesquisa.' : tab === 0 ? 'Não há reservas pendentes.' : 'Ainda não existem reservas.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                    <TableRow>
                      <TableCell>Utilizador</TableCell>
                      <TableCell>Evento</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Comprovativo</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell width={200} align="center">Acções</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{b.users?.full_name || '—'}</Typography>
                        <Typography variant="caption" sx={{ color: colors.grey }}>{b.users?.email || ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>{b.events?.title || '—'}</Typography>
                      </TableCell>
                      <TableCell><StatusBadge status={b.trip_type} /></TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>
                          {b.amount.toLocaleString()} Kz
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {b.payment_proof_url ? (
                          <Button size="small" sx={{ borderRadius: 2, fontSize: 11, textTransform: 'none' }}
                            href={b.payment_proof_url} target="_blank" rel="noopener">
                            Comprovativo
                          </Button>
                        ) : (
                          <Typography variant="caption" sx={{ color: colors.greyLight }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell><StatusBadge status={b.payment_status} /></TableCell>
                      <TableCell align="center">
                        {b.payment_status === 'pending' ? (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Button size="small" variant="contained"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleApprove(b.id)}
                              sx={{ borderRadius: 2, fontSize: 12, bgcolor: colors.success, '&:hover': { bgcolor: '#059669' } }}>
                              Aprovar
                            </Button>
                            <Button size="small" variant="outlined" color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => setRejectDialog({ open: true, id: b.id })}
                              sx={{ borderRadius: 2, fontSize: 12 }}>
                              Rejeitar
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: colors.greyLight, fontSize: 13 }}>—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeitar Reserva</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline rows={3} label="Motivo da rejeição"
            value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setRejectDialog({ open: false, id: '' })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={!rejectNotes.trim()}>Rejeitar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
