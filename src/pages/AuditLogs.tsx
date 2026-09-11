import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Skeleton, Chip, TablePagination, Autocomplete,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, IconButton, Grid,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { auditService } from '../api/services';
import { colors } from '../theme';
import type { AuditLog, AuditLogFilters } from '../types/api';

const emptyFilters: AuditLogFilters = { actor_email: '', action: '', entity_type: '', entity_id: '', from: '', to: '' };

// Cor por família de acção (prefixo antes do ponto)
const actionColor = (action: string): { color: string; bg: string } => {
  const family = action.split('.')[0];
  if (family === 'payment') return { color: '#6D28D9', bg: '#EDE9FE' };
  if (family === 'auth') return { color: '#1D4ED8', bg: '#DBEAFE' };
  if (family === 'qr') return { color: colors.success, bg: '#D1FAE5' };
  if (action.endsWith('.reject') || action.endsWith('.delete') || action.endsWith('_failed') || action.endsWith('.cancel')) {
    return { color: colors.error, bg: '#FEE2E2' };
  }
  if (action.endsWith('.approve') || action.endsWith('.create')) return { color: colors.success, bg: '#D1FAE5' };
  return { color: colors.grey, bg: '#F3F4F6' };
};

const entityLabels: Record<string, string> = {
  user: 'Utilizador', subscription: 'Subscrição', subscription_plan: 'Plano', booking: 'Reserva',
  event: 'Evento', event_trip: 'Partida', event_booking: 'Reserva evento', trip: 'Viagem', route: 'Rota',
  vehicle: 'Viatura', bank_details: 'Dados bancários', support_request: 'Suporte', app_config: 'Configuração',
  faq: 'FAQ', university: 'Universidade', course: 'Curso',
};

export default function AuditLogs() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [draft, setDraft] = useState<AuditLogFilters>(emptyFilters);
  const [filters, setFilters] = useState<AuditLogFilters>(emptyFilters);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const { data, loading, refetch } = useApiData(
    () => auditService.list({ ...filters, page: page + 1, limit }),
    [filters, page, limit],
  );
  const { data: facets } = useApiData(() => auditService.facets(), []);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const applyFilters = () => { setPage(0); setFilters(draft); };
  const clearFilters = () => { setDraft(emptyFilters); setFilters(emptyFilters); setPage(0); };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <>
      <Header title="Auditoria" subtitle="Registo de acções de administradores, utilizadores, pagamentos e validações" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Filters */}
        <Card sx={{ mb: 3, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <CardContent>
            <Grid container spacing={2} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete
                  freeSolo size="small"
                  options={facets?.actions ?? []}
                  value={draft.action ?? ''}
                  onInputChange={(_, v) => setDraft({ ...draft, action: v })}
                  renderInput={(params) => <TextField {...params} label="Acção" placeholder="ex.: payment." />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Autocomplete
                  size="small"
                  options={facets?.entity_types ?? []}
                  getOptionLabel={(o) => entityLabels[o] ?? o}
                  value={draft.entity_type || null}
                  onChange={(_, v) => setDraft({ ...draft, entity_type: v ?? '' })}
                  renderInput={(params) => <TextField {...params} label="Entidade" />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField fullWidth size="small" label="ID da entidade" value={draft.entity_id}
                  onChange={(e) => setDraft({ ...draft, entity_id: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField fullWidth size="small" label="Actor (email)" value={draft.actor_email}
                  onChange={(e) => setDraft({ ...draft, actor_email: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 6, md: 1.5 }}>
                <TextField fullWidth size="small" type="date" label="De" value={draft.from}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 6, md: 1.5 }}>
                <TextField fullWidth size="small" type="date" label="Até" value={draft.to}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="text" startIcon={<FilterAltOffIcon />} onClick={clearFilters}>Limpar</Button>
                <Tooltip title="Actualizar"><IconButton onClick={refetch}><RefreshIcon /></IconButton></Tooltip>
                <Button variant="contained" onClick={applyFilters}>Filtrar</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Table */}
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={400} /></Box>
          ) : items.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>Sem registos de auditoria</Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Ajuste os filtros ou aguarde novas acções no sistema.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Actor</TableCell>
                      <TableCell>Acção</TableCell>
                      <TableCell>Entidade</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>IP</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((log) => {
                      const c = actionColor(log.action);
                      return (
                        <TableRow key={log.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelected(log)}>
                          <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12, color: colors.grey }}>{fmtDate(log.created_at)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600 }}>{log.actor_email || '—'}</Typography>
                            {log.actor_role && <Typography variant="caption" sx={{ color: colors.grey }}>{log.actor_role}</Typography>}
                          </TableCell>
                          <TableCell>
                            <Chip label={log.action} size="small"
                              sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: 11, fontFamily: 'monospace', height: 24 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 13 }}>{log.entity_type ? (entityLabels[log.entity_type] ?? log.entity_type) : '—'}</Typography>
                            {log.entity_id && (
                              <Typography variant="caption" sx={{ color: colors.grey, fontFamily: 'monospace' }}>{log.entity_id.slice(0, 8)}…</Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 360 }}>
                            <Typography variant="body2" sx={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.description || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, color: colors.grey, whiteSpace: 'nowrap' }}>{log.ip || '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={limit}
                onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[25, 50, 100, 200]}
                labelRowsPerPage="Por página"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              />
            </>
          )}
        </Card>
      </Box>

      {/* Detail dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Detalhe do registo</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 1, columnGap: 2, fontSize: 13 }}>
              <Typography sx={{ color: colors.grey, fontSize: 13 }}>Data</Typography><Typography sx={{ fontSize: 13 }}>{fmtDate(selected.created_at)}</Typography>
              <Typography sx={{ color: colors.grey, fontSize: 13 }}>Actor</Typography><Typography sx={{ fontSize: 13 }}>{selected.actor_email || '—'} {selected.actor_role ? `(${selected.actor_role})` : ''}</Typography>
              <Typography sx={{ color: colors.grey, fontSize: 13 }}>Actor ID</Typography><Typography sx={{ fontSize: 12, fontFamily: 'monospace' }}>{selected.actor_id || '—'}</Typography>
              <Typography sx={{ color: colors.grey, fontSize: 13 }}>Acção</Typography><Typography sx={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700 }}>{selected.action}</Typography>
              <Typography sx={{ color: colors.grey, fontSize: 13 }}>Entidade</Typography><Typography sx={{ fontSize: 13 }}>{selected.entity_type ? (entityLabels[selected.entity_type] ?? selected.entity_type) : '—'}</Typography>
              <Typography sx={{ color: colors.grey, fontSize: 13 }}>Entidade ID</Typography><Typography sx={{ fontSize: 12, fontFamily: 'monospace' }}>{selected.entity_id || '—'}</Typography>
              <Typography sx={{ color: colors.grey, fontSize: 13 }}>Descrição</Typography><Typography sx={{ fontSize: 13 }}>{selected.description || '—'}</Typography>
              <Typography sx={{ color: colors.grey, fontSize: 13 }}>IP</Typography><Typography sx={{ fontSize: 13 }}>{selected.ip || '—'}</Typography>
              <Typography sx={{ color: colors.grey, fontSize: 13 }}>User-Agent</Typography><Typography sx={{ fontSize: 12, wordBreak: 'break-all' }}>{selected.user_agent || '—'}</Typography>
              <Typography sx={{ color: colors.grey, fontSize: 13, alignSelf: 'start' }}>Metadata</Typography>
              <Box component="pre" sx={{ m: 0, p: 1.5, bgcolor: colors.surfaceVariant, borderRadius: 1.5, fontSize: 12, overflowX: 'auto' }}>
                {JSON.stringify(selected.metadata ?? {}, null, 2)}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
