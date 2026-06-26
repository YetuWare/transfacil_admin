import { useState, useEffect } from 'react';
import {
  Box, Card, Button, TextField, Skeleton, Alert, Snackbar, Typography, Grid,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import Header from '../components/Layout/Header';
import { configService } from '../api/services';
import { colors } from '../theme';
import type { AppConfig } from '../types/api';

const emptyForm = { contact_email: '', contact_phone: '', contact_hours_pt: '', contact_hours_en: '' };

export default function Config() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', severity: 'success' });

  const notify = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    (async () => {
      try {
        const res = await configService.get();
        if (res.data) {
          setForm({
            contact_email: res.data.contact_email || '',
            contact_phone: res.data.contact_phone || '',
            contact_hours_pt: res.data.contact_hours_pt || '',
            contact_hours_en: res.data.contact_hours_en || '',
          });
        }
      } catch {
        // empty form is fine
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await configService.update(form);
      notify('Configuração actualizada com sucesso.', 'success');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = form.contact_email !== '' || form.contact_phone !== '' || form.contact_hours_pt !== '' || form.contact_hours_en !== '';

  return (
    <>
      <Header title="Configurações" subtitle="Gerir informações de contacto da aplicação" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Card sx={{ p: 4, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={300} /></Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SettingsIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Contactos</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Email de Contacto" value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Telefone de Contacto" value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Horário (PT)" value={form.contact_hours_pt}
                    onChange={(e) => setForm({ ...form, contact_hours_pt: e.target.value })} placeholder="Ex: Seg-Sex, 08h00 - 18h00" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Horário (EN)" value={form.contact_hours_en}
                    onChange={(e) => setForm({ ...form, contact_hours_en: e.target.value })} placeholder="Ex: Mon-Fri, 08:00 - 18:00" />
                </Grid>
              </Grid>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
                  {saving ? 'A guardar...' : 'Guardar'}
                </Button>
              </Box>
            </>
          )}
        </Card>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
