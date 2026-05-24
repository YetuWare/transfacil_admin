import { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton, Alert, Snackbar, Switch, IconButton, Grid, Typography, MenuItem, Select, InputLabel, FormControl,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { vehiclesService, usersService } from '../api/services';
import { colors } from '../theme';
import type { Vehicle, User } from '../types/api';

const emptyForm = { plate: '', model: '', capacity: 40, driver_id: '', is_active: true };

export default function Vehicles() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: vehicles, loading, refetch } = useApiData(() => vehiclesService.list(), []);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [dialog, setDialog] = useState<{ open: boolean; vehicle?: Vehicle }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    usersService.list({ account_type: 'general' }).then((all) => {
      setDrivers((all as User[]).filter((u) => u.role === 'driver'));
    }).catch(() => {});
  }, []);

  const openCreate = () => { setForm(emptyForm); setDialog({ open: true }); };
  const openEdit = (v: Vehicle) => {
    setForm({ plate: v.plate, model: v.model ?? '', capacity: v.capacity, driver_id: v.driver_id ?? '', is_active: v.is_active });
    setDialog({ open: true, vehicle: v });
  };

  const handleSave = async () => {
    try {
      const data = { ...form, driver_id: form.driver_id || undefined };
      if (dialog.vehicle) { await vehiclesService.update(dialog.vehicle.id, data); notify('Veículo actualizado.', 'success'); }
      else { await vehiclesService.create(data); notify('Veículo criado.', 'success'); }
      setDialog({ open: false }); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao guardar', 'error'); }
  };

  return (
    <>
      <Header title="Veículos" subtitle="Gerir viaturas da frota" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Novo Veículo</Button>
        </Box>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : !vehicles || vehicles.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <LocalShippingIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhum veículo encontrado
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Adicione o primeiro veículo à frota.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Matrícula</TableCell>
                    <TableCell>Modelo</TableCell>
                    <TableCell>Capacidade</TableCell>
                    <TableCell>Motorista</TableCell>
                    <TableCell>Activo</TableCell>
                    <TableCell width={80} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(vehicles as Vehicle[]).map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                          {v.plate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>{v.model || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>{v.capacity} lugares</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>{v.users?.full_name || '—'}</Typography>
                      </TableCell>
                      <TableCell><Switch checked={v.is_active} size="small" disabled /></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEdit(v)}
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
        <DialogTitle>{dialog.vehicle ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={6}>
              <TextField fullWidth label="Matrícula" value={form.plate} placeholder="LD-00-00-AA"
                onChange={(e) => setForm({ ...form, plate: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Modelo" value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Capacidade" type="number" value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="medium">
                <InputLabel>Motorista</InputLabel>
                <Select value={form.driver_id} label="Motorista" onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                  <MenuItem value=""><em>Sem motorista</em></MenuItem>
                  {drivers.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.full_name} — {d.email}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch checked={form.is_active} size="small" onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>Veículo activo</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog({ open: false })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{dialog.vehicle ? 'Actualizar' : 'Criar'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
