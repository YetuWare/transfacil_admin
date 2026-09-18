import { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton,
  Alert, Snackbar, IconButton, Grid, Typography, MenuItem, Select, InputLabel,
  FormControl, Chip, ToggleButton, ToggleButtonGroup, Tooltip, FormHelperText,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { tripSchedulesService, routesService, vehiclesService, usersService } from '../api/services';
import { colors } from '../theme';
import type { TripSchedule, Route, Vehicle, User } from '../types/api';

const WEEKDAYS = [
  { value: 1, short: 'Seg' },
  { value: 2, short: 'Ter' },
  { value: 3, short: 'Qua' },
  { value: 4, short: 'Qui' },
  { value: 5, short: 'Sex' },
  { value: 6, short: 'Sáb' },
  { value: 7, short: 'Dom' },
];

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  route_id: '',
  vehicle_id: '',
  driver_id: '',
  departure_time: '07:00',
  return_departure_time: '17:00',
  hasReturn: true,
  weekdays: [1, 2, 3, 4, 5] as number[],
  valid_from: today(),
  valid_until: '',
  total_seats: 40,
};

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '');

export default function TripSchedules() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: schedules, loading, refetch } = useApiData(() => tripSchedulesService.list(), []);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [dialog, setDialog] = useState<{ open: boolean; schedule?: TripSchedule }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' },
  );

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    routesService.list().then(setRoutes).catch(() => {});
    vehiclesService.list().then(setVehicles).catch(() => {});
    usersService.list({ account_type: 'general' })
      .then((all) => setDrivers((all as User[]).filter((u) => u.role === 'driver')))
      .catch(() => {});
  }, []);

  const openCreate = () => { setForm(emptyForm); setDialog({ open: true }); };

  const openEdit = (s: TripSchedule) => {
    setForm({
      route_id: s.route_id,
      vehicle_id: s.vehicle_id,
      driver_id: s.driver_id,
      departure_time: hhmm(s.departure_time),
      return_departure_time: hhmm(s.return_departure_time) || '17:00',
      hasReturn: !!s.return_departure_time,
      weekdays: s.weekdays ?? [1, 2, 3, 4, 5],
      valid_from: s.valid_from?.slice(0, 10) ?? today(),
      valid_until: s.valid_until?.slice(0, 10) ?? '',
      total_seats: s.total_seats,
    });
    setDialog({ open: true, schedule: s });
  };

  const invalid =
    !form.route_id || !form.vehicle_id || !form.driver_id ||
    form.weekdays.length === 0 ||
    (form.hasReturn && form.return_departure_time <= form.departure_time) ||
    (!!form.valid_until && form.valid_until < form.valid_from);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        route_id: form.route_id,
        vehicle_id: form.vehicle_id,
        driver_id: form.driver_id,
        departure_time: form.departure_time,
        return_departure_time: form.hasReturn ? form.return_departure_time : null,
        weekdays: [...form.weekdays].sort((a, b) => a - b),
        valid_from: form.valid_from,
        valid_until: form.valid_until || null,
        total_seats: Number(form.total_seats),
      } as Partial<TripSchedule>;

      const saved = dialog.schedule
        ? await tripSchedulesService.update(dialog.schedule.id, payload)
        : await tripSchedulesService.create(payload);

      const created = saved?.generated?.created ?? 0;
      notify(
        dialog.schedule
          ? `Horário actualizado. ${created} viagem(ns) nova(s) gerada(s).`
          : `Horário criado. ${created} viagem(ns) gerada(s) para os próximos dias.`,
        'success',
      );
      setDialog({ open: false });
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (s: TripSchedule) => {
    if (!confirm(`Desactivar "${s.routes?.name ?? 'horário'}"?\n\nAs viagens futuras que ainda ninguém reservou são removidas. As que já têm reservas mantêm-se — para as cancelar, use a página Viagens.`)) return;
    try {
      const res = await tripSchedulesService.deactivate(s.id);
      notify(`Horário desactivado. ${res.trips_removed} viagem(ns) sem reservas removida(s).`, 'success');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao desactivar', 'error');
    }
  };

  const handleGenerate = async () => {
    try {
      const res = await tripSchedulesService.generate();
      notify(`${res.created} viagem(ns) gerada(s), ${res.closed} viagem(ns) passada(s) fechada(s).`, 'success');
      refetch();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao gerar', 'error');
    }
  };

  const list = (schedules as TripSchedule[]) || [];

  return (
    <>
      <Header
        title="Horários"
        subtitle="Viagens recorrentes — o horário gera automaticamente as viagens de cada dia"
        onMenuClick={onMenuClick}
      />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end', mb: 2 }}>
          <Tooltip title="Normalmente isto corre sozinho de hora a hora">
            <Button variant="text" startIcon={<AutorenewIcon />} onClick={handleGenerate}>
              Gerar agora
            </Button>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Novo horário
          </Button>
        </Box>

        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : list.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <EventRepeatIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Ainda não há horários
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block', maxWidth: 460, mx: 'auto' }}>
                Um horário cria as viagens de cada dia automaticamente — por exemplo, Talatona ↔ Campus às 07:00 e 17:00, de segunda a sexta.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rota</TableCell>
                    <TableCell>Horas</TableCell>
                    <TableCell>Dias</TableCell>
                    <TableCell>Viatura / Motorista</TableCell>
                    <TableCell>Validade</TableCell>
                    <TableCell align="right">Lugares</TableCell>
                    <TableCell align="right">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((s) => (
                    <TableRow key={s.id} hover sx={{ opacity: s.is_active ? 1 : 0.5 }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>
                          {s.routes?.name ?? '—'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.grey }}>
                          {s.routes ? `${s.routes.origin} → ${s.routes.destination}` : ''}
                        </Typography>
                        {!s.is_active && <Chip label="Inactivo" size="small" sx={{ ml: 1, height: 20, fontSize: 10 }} />}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip label={`Ida ${hhmm(s.departure_time)}`} size="small"
                          sx={{ fontWeight: 700, fontSize: 11, bgcolor: '#E8F5E9', color: '#1B5E20', mr: 0.5 }} />
                        {s.return_departure_time && (
                          <Chip label={`Volta ${hhmm(s.return_departure_time)}`} size="small"
                            sx={{ fontWeight: 700, fontSize: 11, bgcolor: '#E3F2FD', color: '#0D47A1' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.3 }}>
                          {WEEKDAYS.map((d) => (
                            <Box key={d.value}
                              sx={{
                                width: 26, height: 22, borderRadius: 0.8, display: 'grid', placeItems: 'center',
                                fontSize: 10, fontWeight: 700,
                                bgcolor: s.weekdays?.includes(d.value) ? colors.primary : colors.surfaceVariant,
                                color: s.weekdays?.includes(d.value) ? colors.dark : colors.greyLight,
                              }}>
                              {d.short[0]}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>{s.vehicles?.plate ?? '—'}</Typography>
                        <Typography variant="caption" sx={{ color: colors.grey }}>{s.users?.full_name ?? '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 12, color: colors.grey, whiteSpace: 'nowrap' }}>
                          {s.valid_from?.slice(0, 10)} {s.valid_until ? `— ${s.valid_until.slice(0, 10)}` : '— sem fim'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{s.total_seats}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton>
                        {s.is_active && (
                          <Tooltip title="Desactivar">
                            <IconButton size="small" onClick={() => handleDeactivate(s)}>
                              <PowerSettingsNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {dialog.schedule ? 'Editar horário' : 'Novo horário'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Rota</InputLabel>
                <Select value={form.route_id} label="Rota" onChange={(e) => setForm({ ...form, route_id: e.target.value })}>
                  {routes.map((r) => (
                    <MenuItem key={r.id} value={r.id}>{r.name} · {r.origin} → {r.destination}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>A volta usa a mesma rota com os extremos trocados.</FormHelperText>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Viatura</InputLabel>
                <Select value={form.vehicle_id} label="Viatura" onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                  {vehicles.map((v) => <MenuItem key={v.id} value={v.id}>{v.plate} {v.model ? `· ${v.model}` : ''}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Motorista</InputLabel>
                <Select value={form.driver_id} label="Motorista" onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                  {drivers.map((d) => <MenuItem key={d.id} value={d.id}>{d.full_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ color: colors.grey, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Dias da semana
              </Typography>
              <ToggleButtonGroup
                value={form.weekdays}
                onChange={(_, v: number[]) => setForm({ ...form, weekdays: v })}
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}
              >
                {WEEKDAYS.map((d) => (
                  <ToggleButton key={d.value} value={d.value}
                    sx={{ flex: '1 0 56px', py: 0.7, border: '1px solid rgba(0,0,0,0.12) !important', borderRadius: '8px !important', fontSize: 12, fontWeight: 700 }}>
                    {d.short}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              {form.weekdays.length === 0 && (
                <FormHelperText error>Escolha pelo menos um dia.</FormHelperText>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" type="time" label="Hora de ida" value={form.departure_time}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(e) => setForm({ ...form, departure_time: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" type="time" label="Hora de volta" value={form.return_departure_time}
                disabled={!form.hasReturn}
                slotProps={{ inputLabel: { shrink: true } }}
                error={form.hasReturn && form.return_departure_time <= form.departure_time}
                helperText={
                  form.hasReturn && form.return_departure_time <= form.departure_time
                    ? 'A volta tem de ser depois da ida'
                    : ' '
                }
                onChange={(e) => setForm({ ...form, return_departure_time: e.target.value })} />
              <Button size="small" onClick={() => setForm({ ...form, hasReturn: !form.hasReturn })} sx={{ mt: -1 }}>
                {form.hasReturn ? 'Remover volta' : 'Adicionar volta'}
              </Button>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" type="date" label="Início" value={form.valid_from}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" type="date" label="Fim (opcional)" value={form.valid_until}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!form.valid_until && form.valid_until < form.valid_from}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth size="small" type="number" label="Lugares" value={form.total_seats}
                slotProps={{ htmlInput: { min: 1 } }}
                onChange={(e) => setForm({ ...form, total_seats: Number(e.target.value) })} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                As viagens são criadas para os próximos 14 dias e vão sendo estendidas automaticamente.
                Editar o horário não altera viagens que já tenham reservas.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false })}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={invalid || saving}>
            {saving ? 'A guardar...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
