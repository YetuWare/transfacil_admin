import { useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton, Alert, Snackbar, Switch, IconButton, Typography,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { universitiesService } from '../api/services';
import { colors } from '../theme';
import type { University } from '../types/api';

export default function Universities() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: universities, loading, refetch } = useApiData(() => universitiesService.list(), []);
  const [dialog, setDialog] = useState<{ open: boolean; university?: University }>({ open: false });
  const [name, setName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const openCreate = () => { setName(''); setDialog({ open: true }); };
  const openEdit = (u: University) => { setName(u.name); setDialog({ open: true, university: u }); };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      if (dialog.university) { await universitiesService.update(dialog.university.id, { name: name.trim() }); notify('Universidade actualizada.', 'success'); }
      else { await universitiesService.create(name.trim()); notify('Universidade criada.', 'success'); }
      setDialog({ open: false }); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao guardar', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await universitiesService.delete(deleteId);
      notify('Universidade removida.', 'success');
      setDeleteId(null); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao remover', 'error'); }
  };

  return (
    <>
      <Header title="Universidades" subtitle="Gerir universidades parceiras" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nova Universidade</Button>
        </Box>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : !universities || universities.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhuma universidade encontrada
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Adicione a primeira universidade parceira.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Activo</TableCell>
                    <TableCell width={120} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(universities as University[]).map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{u.name}</Typography>
                      </TableCell>
                      <TableCell><Switch checked={u.is_active} size="small" disabled /></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEdit(u)}
                          sx={{ color: colors.grey, '&:hover': { color: colors.primaryDark, bgcolor: `${colors.primary}15` } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(u.id)}
                          sx={{ '&:hover': { bgcolor: `${colors.error}15` } }}>
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
        <DialogTitle>{dialog.university ? 'Editar Universidade' : 'Nova Universidade'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Nome da Universidade" value={name}
            onChange={(e) => setName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog({ open: false })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!name.trim()}>
            {dialog.university ? 'Actualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.grey }}>
            Tem a certeza que deseja remover esta universidade? Esta acção não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Remover</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
