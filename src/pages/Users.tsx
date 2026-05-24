import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tabs, Tab, Skeleton, Alert, Snackbar, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/StatusBadge';
import { useApiData } from '../hooks/useApiData';
import { usersService, authService } from '../api/services';
import { colors } from '../theme';
import type { User } from '../types/api';

const roleTabs = [
  { label: 'Pendentes', filter: { status: 'pending' } },
  { label: 'Estudantes', filter: { account_type: 'student', status: 'active' } },
  { label: 'General', filter: { account_type: 'general', status: 'active' } },
  { label: 'Administradores', filter: { account_type: 'admin' } },
  { label: 'Todos', filter: {} },
];

export default function Users() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; userId: string }>({ open: false, userId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: '', userName: '' });
  const [createAdminDialog, setCreateAdminDialog] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const activeFilter = roleTabs[tab].filter;
  const fetcher = tab === 0 ? usersService.pending : () => usersService.list(activeFilter);
  const { data: users, loading, refetch } = useApiData(fetcher, [tab]);

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    authService.me().then((u) => setCurrentUserRole(u.role)).catch(() => {});
  }, []);

  const filtered = (users as User[] || []).filter((u) =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const isDeactivated = (u: User) => u.status === 'rejected' && u.rejection_reason === 'Conta desactivada pelo administrador';

  const handleApprove = async (id: string) => {
    try {
      await usersService.approve(id);
      notify('Conta aprovada com sucesso!', 'success');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao aprovar', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await usersService.reject(rejectDialog.userId, rejectReason);
      notify('Conta rejeitada.', 'success');
      setRejectDialog({ open: false, userId: '' });
      setRejectReason('');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao rejeitar', 'error');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await usersService.deactivate(id);
      notify('Conta desactivada.', 'success');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao desactivar', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await usersService.delete(deleteDialog.userId);
      notify('Conta eliminada com sucesso.', 'success');
      setDeleteDialog({ open: false, userId: '', userName: '' });
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao eliminar', 'error');
    }
  };

  const canDelete = (u: User) => {
    if (currentUserRole === 'super_admin') return true;
    return u.role !== 'admin' && u.role !== 'super_admin';
  };

  const handleCreateAdmin = async () => {
    try {
      await usersService.createAdmin(adminForm);
      notify('Administrador criado com sucesso!', 'success');
      setCreateAdminDialog(false);
      setAdminForm({ email: '', password: '', full_name: '', phone: '' });
      if (tab !== 3) setTab(3);
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao criar administrador', 'error');
    }
  };

  return (
    <>
      <Header title="Utilizadores" subtitle="Gerir contas de utilizadores" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Card sx={{ mb: 3, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ pb: '0 !important' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                {roleTabs.map((t, i) => <Tab key={i} label={t.label} />)}
              </Tabs>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {currentUserRole === 'super_admin' && (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateAdminDialog(true)}
                    sx={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                    Novo Admin
                  </Button>
                )}
                <TextField size="small" placeholder="Pesquisar utilizador..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.greyLight }} /></InputAdornment> } }}
                  sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 8 }, mb: 1 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhum utilizador encontrado
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                {search ? 'Tente ajustar a pesquisa.' : 'Não há contas nesta categoria.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Nº Estudante</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Detalhes</TableCell>
                    <TableCell width={200} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{user.full_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey }}>{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13, color: user.student_number ? colors.grey : colors.greyLighter }}>
                          {user.student_number || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell><StatusBadge status={user.account_type} /></TableCell>
                      <TableCell>
                        {isDeactivated(user) ? (
                          <StatusBadge status="inactive" />
                        ) : (
                          <StatusBadge status={user.status} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>
                          {user.account_type === 'student' ? [user.university, user.course].filter(Boolean).join(' · ') : user.phone || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {user.status === 'pending' ? (
                            <>
                              <Button size="small" variant="contained" startIcon={<CheckCircleIcon />}
                                onClick={() => handleApprove(user.id)}
                                sx={{ borderRadius: 2, fontSize: 11, bgcolor: colors.success, '&:hover': { bgcolor: '#059669' } }}>
                                Aprovar
                              </Button>
                              <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                                onClick={() => setRejectDialog({ open: true, userId: user.id })}
                                sx={{ borderRadius: 2, fontSize: 11 }}>
                                Rejeitar
                              </Button>
                            </>
                          ) : user.status === 'active' ? (
                            <>
                              <Button size="small" variant="outlined" color="warning" startIcon={<BlockIcon />}
                                onClick={() => handleDeactivate(user.id)}
                                sx={{ borderRadius: 2, fontSize: 11 }}>
                                Desactivar
                              </Button>
                              {canDelete(user) && (
                                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />}
                                  onClick={() => setDeleteDialog({ open: true, userId: user.id, userName: user.full_name })}
                                  sx={{ borderRadius: 2, fontSize: 11 }}>
                                  Eliminar
                                </Button>
                              )}
                            </>
                          ) : isDeactivated(user) ? (
                            <>
                              <Button size="small" variant="outlined" color="success" startIcon={<CheckCircleIcon />}
                                onClick={async () => { try { await usersService.reactivate(user.id); notify('Conta reactivada com sucesso.', 'success'); refetch(); } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao reactivar', 'error'); } }}
                                sx={{ borderRadius: 2, fontSize: 11 }}>
                                Reactivar
                              </Button>
                              {canDelete(user) && (
                                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />}
                                  onClick={() => setDeleteDialog({ open: true, userId: user.id, userName: user.full_name })}
                                  sx={{ borderRadius: 2, fontSize: 11 }}>
                                  Eliminar
                                </Button>
                              )}
                            </>
                          ) : (
                            <Typography variant="body2" sx={{ color: colors.greyLight, fontSize: 13 }}>—</Typography>
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, userId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeitar Utilizador</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.grey, mb: 2 }}>
            Indique o motivo da rejeição.
          </Typography>
          <TextField autoFocus fullWidth multiline rows={3} label="Motivo"
            value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setRejectDialog({ open: false, userId: '' })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={!rejectReason.trim()}>Rejeitar Conta</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: '', userName: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar Utilizador</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.grey }}>
            Tem a certeza que pretende eliminar <strong>{deleteDialog.userName}</strong>? Esta acção é irreversível.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteDialog({ open: false, userId: '', userName: '' })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog open={createAdminDialog} onClose={() => setCreateAdminDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Administrador</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField fullWidth label="Nome completo" value={adminForm.full_name}
              onChange={(e) => setAdminForm({ ...adminForm, full_name: e.target.value })} />
            <TextField fullWidth label="Email" type="email" value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
            <TextField fullWidth label="Password" type="password" value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
            <TextField fullWidth label="Telefone (opcional)" value={adminForm.phone}
              onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCreateAdminDialog(false)} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateAdmin}
            disabled={!adminForm.full_name || !adminForm.email || !adminForm.password}>Criar Admin</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
