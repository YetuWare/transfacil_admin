import { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton,
  Alert, Snackbar, IconButton, Grid, Typography, MenuItem, Select, InputLabel,
  FormControl, Chip,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { tripsService, routesService, vehiclesService, usersService } from '../api/services';
import { colors } from '../theme';
import type { Trip, Route, Vehicle, User } from '../types/api';

const emptyForm = {
  route_id: '', vehicle_id: '', driver_id: '', departure_time: '',
  available_seats: 40, total_seats: 40, status: 'scheduled', stops: [],
};

const statusColors: Record<string, string> = {
  scheduled: '#1976d2',
  in_progress: '#ed6c02',
  completed: '#2e7d32',
  cancelled: '#d32f2f',
};

export default function Trips() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: trips, loading, refetch } = useApiData(() => tripsService.list(), []);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [dialog, setDialog] = useState<{ open: boolean; trip?: Trip }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    routesService.list().then(setRoutes).catch(() => {});
    vehiclesService.list().then(setVehicles).catch(() => {});
    usersService.list({ account_type: 'general' }).then((all) => {
      setDrivers((all as User[]).filter((u) => u.role === 'driver'));
    }).catch(() => {});
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setDialog({ open: true });
  };

  const openEdit = (t: Trip) => {
    setForm({
      route_id: t.route_id,
      vehicle_id: t.vehicle_id,
      driver_id: t.driver_id,
      departure_time: t.departure_time.slice(0, 16),
      available_seats: t.available_seats,
      total_seats: t.total_seats,
      status: t.status,
      stops: t.stops ?? [],
    });
    setDialog({ open: true, trip: t });
  };

  const handleSave = async () => {
    try {
      if (dialog.trip) {
        await tripsService.update(dialog.trip.id, {
          ...form,
          departure_time: new Date(form.departure_time).toISOString(),
        });
        notify('Viagem actualizada.', 'success');
      } else {
        await tripsService.create({
          ...form,
          departure_time: new Date(form.departure_time).toISOString(),
        });
        notify('Viagem criada.', 'success');
      }
      setDialog({ open: false });
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao guardar', 'error');
    }
  };

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Header title="Viagens" subtitle="Gerir viagens regulares" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nova Viagem
          </Button>
        </Box>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : !trips || trips.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <DirectionsBusIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhuma viagem encontrada
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Crie a primeira viagem para começar.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rota</TableCell>
                    <TableCell>Partida</TableCell>
                    <TableCell>Viatura</TableCell>
                    <TableCell>Motorista</TableCell>
                    <TableCell>Lugares</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell width={80} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(trips as Trip[]).map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                          {t.routes?.origin} → {t.routes?.destination}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>
                          {formatDate(t.departure_time)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>
                          {t.vehicles?.plate || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>
                          {t.users?.full_name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                          {t.available_seats}/{t.total_seats}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.status === 'scheduled' ? 'Agendada' : t.status === 'in_progress' ? 'Em Curso' : t.status === 'completed' ? 'Concluída' : 'Cancelada'}
                          size="small"
                          sx={{
                            color: '#fff',
                            bgcolor: statusColors[t.status] || colors.grey,
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEdit(t)}
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
        <DialogTitle>{dialog.trip ? 'Editar Viagem' : 'Nova Viagem'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Rota</InputLabel>
                <Select value={form.route_id} label="Rota" onChange={(e) => setForm({ ...form, route_id: e.target.value })}>
                  {routes.map((r) => (
                    <MenuItem key={r.id} value={r.id}>{r.name} ({r.origin} → {r.destination})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Viatura</InputLabel>
                <Select value={form.vehicle_id} label="Viatura" onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                  {vehicles.filter((v) => v.is_active).map((v) => (
                    <MenuItem key={v.id} value={v.id}>{v.plate} — {v.model}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Motorista</InputLabel>
                <Select value={form.driver_id} label="Motorista" onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                  {drivers.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.full_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Data e Hora de Partida" type="datetime-local" value={form.departure_time}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(e) => setForm({ ...form, departure_time: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Lugares Disponíveis" type="number" value={form.available_seats}
                onChange={(e) => setForm({ ...form, available_seats: Number(e.target.value) })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Lugares Totais" type="number" value={form.total_seats}
                onChange={(e) => setForm({ ...form, total_seats: Number(e.target.value) })} />
            </Grid>
            {dialog.trip && (
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select value={form.status} label="Estado"
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <MenuItem value="scheduled">Agendada</MenuItem>
                    <MenuItem value="in_progress">Em Curso</MenuItem>
                    <MenuItem value="completed">Concluída</MenuItem>
                    <MenuItem value="cancelled">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog({ open: false })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{dialog.trip ? 'Actualizar' : 'Criar'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
