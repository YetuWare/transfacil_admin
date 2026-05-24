import { useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton, Alert, Snackbar, Switch, IconButton, Grid, Typography,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RouteIcon from '@mui/icons-material/Route';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { routesService } from '../api/services';
import { colors } from '../theme';
import type { Route } from '../types/api';

const emptyForm = { origin: '', destination: '', estimated_duration_min: 0, is_active: true };

export default function Routes() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: routes, loading, refetch } = useApiData(() => routesService.list(), []);
  const [dialog, setDialog] = useState<{ open: boolean; route?: Route }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const openCreate = () => { setForm(emptyForm); setDialog({ open: true }); };
  const openEdit = (r: Route) => {
    setForm({
      origin: r.origin, destination: r.destination,
      estimated_duration_min: r.estimated_duration_min ?? 0, is_active: r.is_active,
    });
    setDialog({ open: true, route: r });
  };

  const handleSave = async () => {
    try {
      if (dialog.route) { await routesService.update(dialog.route.id, form); notify('Rota actualizada.', 'success'); }
      else { await routesService.create(form); notify('Rota criada.', 'success'); }
      setDialog({ open: false }); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao guardar', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await routesService.delete(deleteId);
      notify('Rota desactivada com sucesso.', 'success');
      setDeleteId(null); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao desactivar', 'error'); }
  };

  return (
    <>
      <Header title="Rotas" subtitle="Gerir rotas de transporte" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nova Rota</Button>
        </Box>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : !routes || routes.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <RouteIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhuma rota encontrada
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Crie a primeira rota de transporte.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Origem</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Duração</TableCell>
                    <TableCell>Activo</TableCell>
                    <TableCell width={120} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(routes as Route[]).map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{r.origin}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{r.destination}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>{r.estimated_duration_min ?? '—'} min</Typography>
                      </TableCell>
                      <TableCell><Switch checked={r.is_active} size="small" disabled /></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEdit(r)}
                          sx={{ color: colors.grey, '&:hover': { color: colors.primaryDark, bgcolor: `${colors.primary}15` } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteId(r.id)}
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
        <DialogTitle>{dialog.route ? 'Editar Rota' : 'Nova Rota'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={6}>
              <TextField fullWidth label="Origem" value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Destino" value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Duração (min)" type="number" value={form.estimated_duration_min}
                onChange={(e) => setForm({ ...form, estimated_duration_min: Number(e.target.value) })} />
            </Grid>
            <Grid size={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%', pt: 1 }}>
                <Switch checked={form.is_active} size="small" onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>Rota activa</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog({ open: false })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{dialog.route ? 'Actualizar' : 'Criar'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Desactivar Rota</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.grey }}>
            Tem a certeza que pretende desactivar esta rota? Esta acção pode ser revertida editando a rota.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Desactivar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
