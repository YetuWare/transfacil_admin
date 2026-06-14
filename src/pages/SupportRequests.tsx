import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tabs, Tab, Skeleton, Alert, Snackbar, InputAdornment,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchIcon from '@mui/icons-material/Search';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/StatusBadge';
import { useApiData } from '../hooks/useApiData';
import { supportService } from '../api/services';
import { colors } from '../theme';
import type { SupportRequest } from '../types/api';

const tabs = ['Pendentes', 'Em Curso', 'Resolvidos', 'Todas'];
const statusFilters = ['pending', 'in_progress', 'resolved', undefined];

export default function SupportRequests() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [resolveDialog, setResolveDialog] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [adminResponse, setAdminResponse] = useState('');
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const fetcher = () => supportService.list(statusFilters[tab]);
  const { data: requests, loading, refetch } = useApiData(fetcher, [tab]);

  const allRequests = (requests as SupportRequest[]) || [];
  const filtered = search
    ? allRequests.filter((r) => {
        const q = search.toLowerCase();
        const name = r.user?.full_name?.toLowerCase() || '';
        const email = r.user?.email?.toLowerCase() || '';
        const subject = r.subject?.toLowerCase() || '';
        return name.includes(q) || email.includes(q) || subject.includes(q);
      })
    : allRequests;

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await supportService.updateStatus(id, status);
      notify('Pedido actualizado.', 'success');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao actualizar', 'error');
    }
  };

  const handleResolve = async () => {
    if (!adminResponse.trim()) return;
    try {
      await supportService.updateStatus(resolveDialog.id, 'resolved', adminResponse);
      notify('Pedido resolvido.', 'success');
      setResolveDialog({ open: false, id: '' });
      setAdminResponse('');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao resolver', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Header title="Pedidos de Suporte" subtitle="Gerir pedidos de ajuda dos utilizadores" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TextField size="small" placeholder="Pesquisar utilizador ou assunto..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.greyLight }} /></InputAdornment> } }}
            sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 8 } }} />
        </Box>
        <Card sx={{ mb: 3, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ pb: '0 !important' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              {tabs.map((t) => <Tab key={t} label={t} />)}
            </Tabs>
          </CardContent>
        </Card>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <ContactSupportIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhum pedido encontrado
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                {search ? 'Tente ajustar a pesquisa.' : 'Não há pedidos de suporte.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Utilizador</TableCell>
                    <TableCell>Assunto</TableCell>
                    <TableCell>Mensagem</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Resposta</TableCell>
                    <TableCell width={200} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{r.user?.full_name || '—'}</Typography>
                        <Typography variant="caption" sx={{ color: colors.grey }}>{r.user?.email || ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>{r.subject}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.message}
                        </Typography>
                      </TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: colors.grey, fontSize: 11 }}>{formatDate(r.created_at)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: colors.grey, fontSize: 12 }}>
                          {r.admin_response || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {r.status === 'pending' && (
                            <Button size="small" variant="contained"
                              startIcon={<PlayArrowIcon />}
                              onClick={() => handleStatusUpdate(r.id, 'in_progress')}
                              sx={{ borderRadius: 2, fontSize: 12, bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }}>
                              Em curso
                            </Button>
                          )}
                          {r.status === 'in_progress' && (
                            <Button size="small" variant="contained"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => setResolveDialog({ open: true, id: r.id })}
                              sx={{ borderRadius: 2, fontSize: 12, bgcolor: colors.success, '&:hover': { bgcolor: '#059669' } }}>
                              Resolver
                            </Button>
                          )}
                          {r.status === 'resolved' && (
                            <Button size="small" variant="outlined"
                              startIcon={<ReplayIcon />}
                              onClick={() => handleStatusUpdate(r.id, 'in_progress')}
                              sx={{ borderRadius: 2, fontSize: 12 }}>
                              Reabrir
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>

      <Dialog open={resolveDialog.open} onClose={() => setResolveDialog({ open: false, id: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Resolver Pedido</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline rows={4} label="Resposta (opcional)"
            value={adminResponse} onChange={(e) => setAdminResponse(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setResolveDialog({ open: false, id: '' })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleResolve} sx={{ bgcolor: colors.success, '&:hover': { bgcolor: '#059669' } }}>
            Marcar como Resolvido
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}