import { useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton, Alert, Snackbar, Switch, IconButton, Typography, Grid,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { faqsService } from '../api/services';
import { colors } from '../theme';
import type { Faq } from '../types/api';

const emptyForm = { question_pt: '', question_en: '', answer_pt: '', answer_en: '', sort_order: 0, is_active: true };

export default function Faqs() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: faqs, loading, refetch } = useApiData(() => faqsService.list(), []);
  const [dialog, setDialog] = useState<{ open: boolean; faq?: Faq }>({ open: false });
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const openCreate = () => { setForm(emptyForm); setDialog({ open: true }); };
  const openEdit = (f: Faq) => {
    setForm({
      question_pt: f.question_pt, question_en: f.question_en,
      answer_pt: f.answer_pt, answer_en: f.answer_en,
      sort_order: f.sort_order, is_active: f.is_active,
    });
    setDialog({ open: true, faq: f });
  };

  const handleSave = async () => {
    if (!form.question_pt.trim() || !form.question_en.trim() || !form.answer_pt.trim() || !form.answer_en.trim()) return;
    try {
      if (dialog.faq) { await faqsService.update(dialog.faq.id, form); notify('FAQ actualizada.', 'success'); }
      else { await faqsService.create(form); notify('FAQ criada.', 'success'); }
      setDialog({ open: false }); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao guardar', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await faqsService.delete(deleteId);
      notify('FAQ removida.', 'success');
      setDeleteId(null); refetch();
    } catch (err: unknown) { notify(err instanceof Error ? err.message : 'Erro ao remover', 'error'); }
  };

  return (
    <>
      <Header title="FAQs" subtitle="Gerir perguntas frequentes" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nova FAQ</Button>
        </Box>
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : !faqs || faqs.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <HelpIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>
                Nenhuma FAQ encontrada
              </Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Adicione a primeira FAQ.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pergunta (PT)</TableCell>
                    <TableCell>Pergunta (EN)</TableCell>
                    <TableCell width={80}>Ordem</TableCell>
                    <TableCell width={80}>Activo</TableCell>
                    <TableCell width={120} align="center">Acções</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(faqs as Faq[]).map((f) => (
                    <TableRow key={f.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>{f.question_pt}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>{f.question_en}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>{f.sort_order}</Typography>
                      </TableCell>
                      <TableCell><Switch checked={f.is_active} size="small" disabled /></TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEdit(f)}
                          sx={{ color: colors.grey, '&:hover': { color: colors.primaryDark, bgcolor: `${colors.primary}15` } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(f.id)}
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

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false })} maxWidth="md" fullWidth>
        <DialogTitle>{dialog.faq ? 'Editar FAQ' : 'Nova FAQ'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Pergunta (PT)" value={form.question_pt}
                onChange={(e) => setForm({ ...form, question_pt: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Pergunta (EN)" value={form.question_en}
                onChange={(e) => setForm({ ...form, question_en: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Resposta (PT)" value={form.answer_pt} multiline rows={3}
                onChange={(e) => setForm({ ...form, answer_pt: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Resposta (EN)" value={form.answer_en} multiline rows={3}
                onChange={(e) => setForm({ ...form, answer_en: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField fullWidth label="Ordem" type="number" value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch checked={form.is_active} size="small"
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <Typography variant="body2" sx={{ color: colors.grey, fontSize: 13 }}>Activo</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialog({ open: false })} sx={{ color: colors.grey }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={!form.question_pt.trim() || !form.question_en.trim() || !form.answer_pt.trim() || !form.answer_en.trim()}>
            {dialog.faq ? 'Actualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.grey }}>
            Tem a certeza que deseja remover esta FAQ? Esta acção não pode ser desfeita.
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
