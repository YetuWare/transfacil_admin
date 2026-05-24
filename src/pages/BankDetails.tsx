import { useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton, Alert, Snackbar, Switch, IconButton, Grid, Typography,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { bankDetailsService } from '../api/services';
import { colors } from '../theme';
import type { BankDetail } from '../types/api';

const emptyForm = { bank_name: '', account_name: '', account_number: '', iban: '', is_active: true };

export default function BankDetails() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: banks, loading, refetch } = useApiData(() => bankDetailsService.list(), []);
  const [dialog, setDialog] = useState<{ open: boolean; bank?: BankDetail }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const openCreate = () => { setForm(emptyForm); setDialog({ open: true }); };
  const openEdit = (b: BankDetail) => {
    setForm({
      bank_name: b.bank_name, account_name: b.account_name,
      account_number: b.account_number, iban: b.iban || '', is_active: b.is_active,
    });
    setDialog({ open: true, bank: b });
  };

  const handleSave = async () => {
    try {
      if (dialog.bank) { await bankDetailsService.update(dialog.bank.id, form); notify('Conta actualizada.', 'success'); }
      else { await bankDetailsService.create(form); notify('Conta criada.', 'success'); }
      setDialog({ open: false }); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao guardar', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await bankDetailsService.delete(deleteId);
      notify('Conta eliminada com sucesso.', 'success');
      setDeleteId(null); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao eliminar', 'error'); }
  };

  return (
    <>
      <Header title="Dados Bancários" subtitle="Gerir contas bancárias para pagamentos" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nova Conta</Button>
        </Box>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : !banks || banks.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <AccountBalanceIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhuma conta bancária encontrada
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Adicione uma conta bancária para receber pagamentos.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Banco</TableCell>
                    <TableCell>Titular</TableCell>
                    <TableCell>Nº Conta</TableCell>
                    <TableCell>IBAN</TableCell>
                    <TableCell>Activo</TableCell>
                    <TableCell width={120} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(banks as BankDetail[]).map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{b.bank_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>{b.account_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{b.account_number}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, color: colors.grey }}>{b.iban || '—'}</Typography>
                      </TableCell>
                      <TableCell><Switch checked={b.is_active} size="small" disabled /></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEdit(b)}
                          sx={{ color: colors.grey, '&:hover': { color: colors.primaryDark, bgcolor: `${colors.primary}15` } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteId(b.id)}
                          sx={{ color: colors.grey, '&:hover': { color: '#ef4444', bgcolor: '#fee2e215' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.bank ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={6}>
              <TextField fullWidth label="Banco" value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Titular" value={form.account_name}
                onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Nº Conta" value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="IBAN" value={form.iban}
                onChange={(e) => setForm({ ...form, iban: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch checked={form.is_active} size="small" onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>Conta activa</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog({ open: false })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{dialog.bank ? 'Actualizar' : 'Criar'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar Conta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.grey }}>
            Tem a certeza que pretende eliminar esta conta bancária? Esta acção é irreversível.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
