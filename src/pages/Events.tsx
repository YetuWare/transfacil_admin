import { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton, Alert, Snackbar, Switch, IconButton, Grid, Typography, MenuItem,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ImageIcon from '@mui/icons-material/Image';
import EventIcon from '@mui/icons-material/Event';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { eventsService, eventTripsService, vehiclesService, usersService } from '../api/services';
import { colors } from '../theme';
import type { EventData, EventTrip, Vehicle } from '../types/api';

interface FormUser { id: string; full_name: string; }

const emptyForm = {
  title: '', description: '', event_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
  origin: '', destination: '', price_one_way: 0, price_return: 0, price_round_trip: 0, is_active: true,
  max_seats_per_user: '',
};

const emptyTripForm = {
  vehicle_id: '', driver_id: '',
  departure_time: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
  return_departure_time: '',
  available_seats: 50, total_seats: 50,
};

export default function Events() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: events, loading, refetch } = useApiData(() => eventsService.list(), []);
  const [dialog, setDialog] = useState<{ open: boolean; event?: EventData }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<FormUser[]>([]);
  const [tripDialog, setTripDialog] = useState<{ open: boolean; event: EventData; trip?: EventTrip }>({ open: false, event: null! });
  const [tripForm, setTripForm] = useState(emptyTripForm);

  useEffect(() => {
    vehiclesService.list().then(setVehicles).catch(() => {});
    usersService.list({ account_type: 'general' }).then((u) => {
      setDrivers((u as any[]).filter((x: any) => x.role === 'driver').map((x: any) => ({ id: x.id, full_name: x.full_name })));
    }).catch(() => {});
  }, []);

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const openCreate = () => { setForm(emptyForm); setImageFile(null); setDialog({ open: true }); };
  const openEdit = (e: EventData) => {
    setForm({
      title: e.title, description: e.description || '',
      event_date: e.event_date.slice(0, 16), origin: e.origin, destination: e.destination,
      price_one_way: e.price_one_way, price_return: e.price_return, price_round_trip: e.price_round_trip,
      is_active: e.is_active,
      max_seats_per_user: e.max_seats_per_user?.toString() ?? '',
    });
    setImageFile(null);
    setDialog({ open: true, event: e });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        max_seats_per_user: form.max_seats_per_user ? Number(form.max_seats_per_user) : undefined,
      };
      if (dialog.event) {
        await eventsService.update(dialog.event.id, payload);
        if (imageFile) {
          setUploading(true);
          await eventsService.uploadImage(dialog.event.id, imageFile);
          setUploading(false);
        }
        notify('Evento actualizado com sucesso.', 'success');
      } else {
        const created = await eventsService.create(payload);
        if (imageFile) {
          setUploading(true);
          await eventsService.uploadImage((created as any).id, imageFile);
          setUploading(false);
        }
        notify('Evento criado com sucesso.', 'success');
      }
      setDialog({ open: false });
      refetch();
    } catch (err: unknown) {
      setUploading(false);
      notify(err instanceof Error ? err.message : 'Erro ao guardar evento', 'error');
    }
  };

  const openTripCreate = (event: EventData) => {
    setTripForm(emptyTripForm);
    setTripDialog({ open: true, event, trip: undefined });
  };
  const openTripEdit = (event: EventData, trip: EventTrip) => {
    setTripForm({
      vehicle_id: trip.vehicle_id,
      driver_id: trip.driver_id,
      departure_time: trip.departure_time.slice(0, 16),
      return_departure_time: trip.return_departure_time ? trip.return_departure_time.slice(0, 16) : '',
      available_seats: trip.available_seats,
      total_seats: trip.total_seats,
    });
    setTripDialog({ open: true, event, trip });
  };

  const handleSaveTrip = async () => {
    const { event: ev, trip } = tripDialog;
    try {
      if (trip) {
        await eventTripsService.update(ev.id, trip.id, tripForm);
        notify('Partida actualizada com sucesso.', 'success');
      } else {
        await eventTripsService.create(ev.id, tripForm);
        notify('Partida criada com sucesso.', 'success');
      }
      setTripDialog({ open: false, event: null! });
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao guardar partida', 'error');
    }
  };

  const handleDeleteTrip = async (eventId: string, tripId: string) => {
    try {
      await eventTripsService.delete(eventId, tripId);
      notify('Partida removida com sucesso.', 'success');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao remover partida', 'error');
    }
  };

  return (
    <>
      <Header title="Eventos" subtitle="Gerir eventos de transporte" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Novo Evento
          </Button>
        </Box>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : !events || events.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhum evento encontrado
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Crie o primeiro evento para começar.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Percurso</TableCell>
                    <TableCell>Partidas</TableCell>
                    <TableCell>Preços</TableCell>
                    <TableCell>Lugares</TableCell>
                    <TableCell>Activo</TableCell>
                    <TableCell width={80} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(events as EventData[]).map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{e.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13, color: colors.grey }}>
                          {new Date(e.event_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13, color: colors.grey }}>
                          {e.origin} → {e.destination}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {(e.event_trips || []).map((t: EventTrip) => (
                            <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12, color: colors.grey }}>
                              <DirectionsCarIcon sx={{ fontSize: 14 }} />
                              <span>
                                {new Date(t.departure_time).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {t.return_departure_time && (
                                <>
                                  <span>↩</span>
                                  <span>
                                    {new Date(t.return_departure_time).toLocaleString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </>
                              )}
                              <span>·</span>
                              <span>{t.vehicles?.plate || '—'}</span>
                              <span>·</span>
                              <span>{t.available_seats}/{t.total_seats}</span>
                              <IconButton size="small" onClick={() => openTripEdit(e, t)} sx={{ fontSize: 12, color: colors.greyLight }}>
                                <EditIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteTrip(e.id, t.id)} sx={{ fontSize: 12, color: colors.error }}>
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          ))}
                          <Button size="small" startIcon={<AddIcon />} onClick={() => openTripCreate(e)}
                            sx={{ fontSize: 11, textTransform: 'none', color: colors.primaryDark }}>
                            Nova Partida
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 12 }}>
                          <Box component="span" sx={{ fontWeight: 600 }}>Ida:</Box> {e.price_one_way.toLocaleString()} Kz<br />
                          <Box component="span" sx={{ fontWeight: 600 }}>Volta:</Box> {e.price_return.toLocaleString()} Kz<br />
                          <Box component="span" sx={{ fontWeight: 600 }}>I+V:</Box> {e.price_round_trip.toLocaleString()} Kz
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>
                          {e.available_seats}/{e.total_seats}
                        </Typography>
                      </TableCell>
                      <TableCell><Switch checked={e.is_active} size="small" disabled /></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEdit(e)}
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

      {/* Event Edit/Create Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false })} maxWidth="md" fullWidth>
        <DialogTitle>{dialog.event ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}>
              <TextField fullWidth label="Título" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Descrição" multiline rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Origem" value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Destino" value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Data do Evento" type="datetime-local" value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%', pt: 1 }}>
                <Switch checked={form.is_active} size="small" onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>Evento activo</Typography>
              </Box>
            </Grid>
            <Grid size={4}>
              <TextField fullWidth label="Preço Ida (Kz)" type="number" value={form.price_one_way}
                onChange={(e) => setForm({ ...form, price_one_way: Number(e.target.value) })} />
            </Grid>
            <Grid size={4}>
              <TextField fullWidth label="Preço Volta (Kz)" type="number" value={form.price_return}
                onChange={(e) => setForm({ ...form, price_return: Number(e.target.value) })} />
            </Grid>
            <Grid size={4}>
              <TextField fullWidth label="Preço I+V (Kz)" type="number" value={form.price_round_trip}
                onChange={(e) => setForm({ ...form, price_round_trip: Number(e.target.value) })} />
            </Grid>
            <Grid size={12}>
              <Button variant="outlined" component="label" startIcon={<ImageIcon />}
                sx={{ borderRadius: 2, textTransform: 'none' }}>
                {imageFile ? imageFile.name : 'Upload Imagem'}
                <input hidden type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </Button>
              {imageFile && (
                <Typography variant="caption" sx={{ ml: 2, color: colors.success }}>
                  {imageFile.name} seleccionado
                </Typography>
              )}
              {dialog.event?.image_url && !imageFile && (
                <Typography variant="caption" sx={{ ml: 2, color: colors.grey }}>
                  Já tem imagem. Seleccione uma para substituir.
                </Typography>
              )}
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Máx. lugares por utilizador" type="number" value={form.max_seats_per_user}
                onChange={(e) => setForm({ ...form, max_seats_per_user: e.target.value })}
                helperText="Deixe vazio para ilimitado" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog({ open: false })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={uploading}>
            {uploading ? 'A enviar imagem...' : (dialog.event ? 'Actualizar Evento' : 'Criar Evento')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Trip Create/Edit Dialog */}
      <Dialog open={tripDialog.open} onClose={() => setTripDialog({ open: false, event: null! })} maxWidth="sm" fullWidth>
        <DialogTitle>{tripDialog.trip ? 'Editar Partida' : 'Nova Partida'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}>
              <TextField fullWidth label="Data/Hora de Partida" type="datetime-local" value={tripForm.departure_time}
                onChange={(e) => setTripForm({ ...tripForm, departure_time: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Data/Hora de Regresso (ida e volta)" type="datetime-local" value={tripForm.return_departure_time}
                onChange={(e) => setTripForm({ ...tripForm, return_departure_time: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth select label="Viatura" value={tripForm.vehicle_id}
                onChange={(e) => setTripForm({ ...tripForm, vehicle_id: e.target.value })}>
                <MenuItem value="">— Seleccione —</MenuItem>
                {vehicles.filter(v => v.is_active).map((v) => (
                  <MenuItem key={v.id} value={v.id}>{v.plate} {v.model ? `· ${v.model}` : ''}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField fullWidth select label="Motorista" value={tripForm.driver_id}
                onChange={(e) => setTripForm({ ...tripForm, driver_id: e.target.value })}>
                <MenuItem value="">— Seleccione —</MenuItem>
                {drivers.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.full_name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Lugares Disponíveis" type="number" value={tripForm.available_seats}
                onChange={(e) => setTripForm({ ...tripForm, available_seats: Number(e.target.value) })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Total de Lugares" type="number" value={tripForm.total_seats}
                onChange={(e) => setTripForm({ ...tripForm, total_seats: Number(e.target.value) })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setTripDialog({ open: false, event: null! })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveTrip}>
            {tripDialog.trip ? 'Actualizar Partida' : 'Criar Partida'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
