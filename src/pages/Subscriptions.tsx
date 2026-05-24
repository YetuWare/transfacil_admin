import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tabs, Tab, Skeleton, Alert, Snackbar, InputAdornment,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SearchIcon from '@mui/icons-material/Search';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/StatusBadge';
import { useApiData } from '../hooks/useApiData';
import { subscriptionsService } from '../api/services';
import { colors } from '../theme';
import type { Subscription } from '../types/api';

const statusTabs = [
  { label: 'Pendentes', filter: 'pending_payment' },
  { label: 'Activas', filter: 'active' },
  { label: 'Expiradas', filter: 'expired' },
  { label: 'Rejeitadas', filter: 'rejected' },
  { label: 'Todas', filter: '' },
];

export default function Subscriptions() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [rejectNotes, setRejectNotes] = useState('');
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const statusFilter = statusTabs[tab].filter;
  const fetcher = () => subscriptionsService.list(statusFilter || undefined);
  const { data: subs, loading, refetch } = useApiData(fetcher, [tab]);

  const allSubs = (subs as Subscription[]) || [];
  const filtered = search
    ? allSubs.filter((s) => {
        const q = search.toLowerCase();
        const name = s.users?.full_name?.toLowerCase() || '';
        const email = s.users?.email?.toLowerCase() || '';
        const plan = s.subscription_plans?.name?.toLowerCase() || '';
        return name.includes(q) || email.includes(q) || plan.includes(q);
      })
    : allSubs;

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const handleApprove = async () => {
    try {
      await subscriptionsService.approve(approveDialog.id, startDate);
      notify('Subscrição aprovada com sucesso!', 'success');
      setApproveDialog({ open: false, id: '' });
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao aprovar', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) return;
    try {
      await subscriptionsService.reject(rejectDialog.id, rejectNotes);
      notify('Subscrição rejeitada.', 'success');
      setRejectDialog({ open: false, id: '' });
      setRejectNotes('');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao rejeitar', 'error');
    }
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-PT') : '—';

  return (
    <>
      <Header title="Subscrições" subtitle="Gerir subscrições de estudantes" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Card sx={{ mb: 3, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ pb: '0 !important' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                {statusTabs.map((t, i) => <Tab key={i} label={t.label} />)}
              </Tabs>
              <TextField size="small" placeholder="Pesquisar estudante, email ou plano..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.greyLight }} /></InputAdornment> } }}
                sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 8 } }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <ConfirmationNumberIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhuma subscrição encontrada
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                {search ? 'Tente ajustar a pesquisa.' : 'Ainda não existem subscrições registadas.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Estudante</TableCell>
                    <TableCell>Plano</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell>Comprovativo</TableCell>
                    <TableCell width={200} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((s: Subscription) => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{s.users?.full_name || '—'}</Typography>
                        <Typography variant="caption" sx={{ color: colors.grey }}>{s.users?.email || ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.subscription_plans?.name || '—'}</Typography>
                        <Typography variant="caption" sx={{ color: colors.grey }}>
                          {s.subscription_plans ? `${s.subscription_plans.price.toLocaleString()} Kz / ${s.subscription_plans.duration_months}m` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13, color: colors.grey }}>
                          {fmtDate(s.start_date)} → {fmtDate(s.end_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {s.payment_proof_url ? (
                          <Button size="small" variant="text"
                            href={s.payment_proof_url} target="_blank"
                            sx={{ fontSize: 12, textTransform: 'none', fontWeight: 600, color: colors.info }}>
                            Ver Comprovativo
                          </Button>
                        ) : <Typography variant="body2" sx={{ color: colors.greyLight, fontSize: 13 }}>—</Typography>}
                      </TableCell>
                      <TableCell align="center">
                        {s.status === 'pending_payment' ? (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Button size="small" variant="contained"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => { setApproveDialog({ open: true, id: s.id }); setStartDate(new Date().toISOString().split('T')[0]); }}
                              sx={{ borderRadius: 2, fontSize: 12, bgcolor: colors.success, '&:hover': { bgcolor: '#059669' } }}>
                              Aprovar
                            </Button>
                            <Button size="small" variant="outlined" color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => setRejectDialog({ open: true, id: s.id })}
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

      <Dialog open={approveDialog.open} onClose={() => setApproveDialog({ open: false, id: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Aprovar Subscrição</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.grey, mb: 2 }}>
            Defina a data de início da subscrição para activar o plano.
          </Typography>
          <TextField fullWidth type="date" label="Data de Início"
            value={startDate} onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setApproveDialog({ open: false, id: '' })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleApprove}
            sx={{ bgcolor: colors.success, '&:hover': { bgcolor: '#059669' } }}>
            Aprovar e Activar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeitar Subscrição</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline rows={3} label="Notas / Motivo"
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
