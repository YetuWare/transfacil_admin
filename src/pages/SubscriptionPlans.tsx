import { useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton, Alert, Snackbar, Switch, IconButton, Grid, Typography,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { plansService } from '../api/services';
import { colors } from '../theme';
import type { SubscriptionPlan } from '../types/api';

const emptyForm = { name: '', price: 0, duration_months: 1, is_active: true };

export default function SubscriptionPlans() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: plans, loading, refetch } = useApiData(() => plansService.list(), []);
  const [dialog, setDialog] = useState<{ open: boolean; plan?: SubscriptionPlan }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const openCreate = () => { setForm(emptyForm); setDialog({ open: true }); };
  const openEdit = (p: SubscriptionPlan) => {
    setForm({ name: p.name, price: p.price, duration_months: p.duration_months, is_active: p.is_active });
    setDialog({ open: true, plan: p });
  };

  const handleSave = async () => {
    try {
      if (dialog.plan) { await plansService.update(dialog.plan.id, form); notify('Plano actualizado.', 'success'); }
      else { await plansService.create(form); notify('Plano criado.', 'success'); }
      setDialog({ open: false }); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao guardar', 'error'); }
  };

  return (
    <>
      <Header title="Planos de Subscrição" subtitle="Gerir planos de subscrição" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Novo Plano</Button>
        </Box>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : !plans || plans.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <CardMembershipIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhum plano encontrado
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Crie o primeiro plano de subscrição.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Preço</TableCell>
                    <TableCell>Duração</TableCell>
                    <TableCell>Activo</TableCell>
                    <TableCell width={80} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(plans as SubscriptionPlan[]).map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{p.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{p.price.toLocaleString()} Kz</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>
                          {p.duration_months} {p.duration_months === 1 ? 'mês' : 'meses'}
                        </Typography>
                      </TableCell>
                      <TableCell><Switch checked={p.is_active} size="small" disabled /></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEdit(p)}
                          sx={{ color: colors.grey, '&:hover': { color: colors.primaryDark, bgcolor: `${colors.primary}15` } }}>
                          <EditIcon fontSize="small" />
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
        <DialogTitle>{dialog.plan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}>
              <TextField fullWidth label="Nome" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Preço (Kz)" type="number" value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Duração (meses)" type="number" value={form.duration_months}
                onChange={(e) => setForm({ ...form, duration_months: Number(e.target.value) })} />
            </Grid>
            <Grid size={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%', pt: 1 }}>
                <Switch checked={form.is_active} size="small" onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>Plano activo</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog({ open: false })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{dialog.plan ? 'Actualizar' : 'Criar'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
