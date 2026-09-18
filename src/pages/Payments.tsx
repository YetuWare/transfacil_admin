import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Skeleton, Chip, TablePagination, MenuItem,
  Select, InputLabel, FormControl, Button, IconButton, Tooltip, Grid, InputAdornment,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PaymentsIcon from '@mui/icons-material/Payments';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import DownloadIcon from '@mui/icons-material/Download';
import Header from '../components/Layout/Header';
import { useApiData } from '../hooks/useApiData';
import { paymentsService } from '../api/services';
import { colors } from '../theme';
import type { PaymentRow, PaymentFilters } from '../types/api';

const emptyFilters: PaymentFilters = { type: '', status: '', method: '', from: '', to: '', q: '' };

const typeLabels: Record<string, string> = {
  subscription: 'Passe',
  event: 'Evento',
  trip: 'Viagem extra',
};

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'Pago', color: '#0F7B4F', bg: '#E6F6EE' },
  pending: { label: 'Pendente', color: '#9A6200', bg: '#FEF4E4' },
  expired: { label: 'Expirado', color: colors.grey, bg: '#F3F4F6' },
  failed: { label: 'Falhado', color: '#B42318', bg: '#FEE4E2' },
};

const kwanza = (v: number) =>
  `${Number(v || 0).toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Kz`;

export default function Payments() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [draft, setDraft] = useState<PaymentFilters>(emptyFilters);
  const [filters, setFilters] = useState<PaymentFilters>(emptyFilters);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);

  const { data, loading, refetch } = useApiData(
    () => paymentsService.list({ ...filters, page: page + 1, limit }),
    [filters, page, limit],
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const summary = data?.summary;

  const applyFilters = () => { setPage(0); setFilters(draft); };
  const clearFilters = () => { setDraft(emptyFilters); setFilters(emptyFilters); setPage(0); };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  // Exporta o que está na página actual; os filtros definem o conteúdo
  const exportCsv = () => {
    const header = ['Tipo', 'Descrição', 'Utilizador', 'Email', 'Valor', 'Estado', 'Método', 'Referência', 'Transacção', 'Pago em', 'Criado em'];
    const rows = items.map((p) => [
      typeLabels[p.type] ?? p.type, p.title, p.user_name ?? '', p.user_email ?? '',
      Number(p.amount || 0).toFixed(2), statusStyles[p.status]?.label ?? p.status,
      p.payment_method ?? '', p.payment_reference ?? '', p.merchant_transaction_id ?? '',
      p.paid_at ?? '', p.created_at,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagamentos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tiles: Array<{ key: 'paid' | 'pending' | 'expired' | 'failed'; label: string }> = [
    { key: 'paid', label: 'Recebido' },
    { key: 'pending', label: 'Pendente' },
    { key: 'expired', label: 'Expirado' },
    { key: 'failed', label: 'Falhado' },
  ];

  return (
    <>
      <Header title="Pagamentos" subtitle="Passes, reservas de eventos e viagens extra num só lugar" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>

        {/* Totais — correspondem aos filtros, não só à página visível */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {tiles.map((t) => {
            const s = summary?.[t.key];
            const style = statusStyles[t.key];
            return (
              <Grid size={{ xs: 6, md: 3 }} key={t.key}>
                <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%' }}>
                  <CardContent>
                    <Typography variant="caption" sx={{ color: colors.grey, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {t.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 22, color: style.color, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                      {loading ? '—' : kwanza(s?.amount ?? 0)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.greyLight }}>
                      {loading ? '' : `${s?.count ?? 0} pagamento(s)`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Filtros */}
        <Card sx={{ mb: 3, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <CardContent>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth size="small" placeholder="Nome, email, referência…" value={draft.q}
                  onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.greyLight }} /></InputAdornment> } }} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select value={draft.type} label="Tipo" onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="subscription">Passe</MenuItem>
                    <MenuItem value="event">Evento</MenuItem>
                    <MenuItem value="trip">Viagem extra</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select value={draft.status} label="Estado" onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="paid">Pago</MenuItem>
                    <MenuItem value="pending">Pendente</MenuItem>
                    <MenuItem value="expired">Expirado</MenuItem>
                    <MenuItem value="failed">Falhado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Método</InputLabel>
                  <Select value={draft.method} label="Método" onChange={(e) => setDraft({ ...draft, method: e.target.value })}>
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="REF">Referência</MenuItem>
                    <MenuItem value="GPO">MCX Express</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 1.75 }}>
                <TextField fullWidth size="small" type="date" label="De" value={draft.from}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 6, md: 1.75 }}>
                <TextField fullWidth size="small" type="date" label="Até" value={draft.to}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="text" startIcon={<FilterAltOffIcon />} onClick={clearFilters}>Limpar</Button>
                <Tooltip title="Exportar a página actual em CSV">
                  <span>
                    <IconButton onClick={exportCsv} disabled={items.length === 0}><DownloadIcon /></IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Actualizar"><IconButton onClick={refetch}><RefreshIcon /></IconButton></Tooltip>
                <Button variant="contained" onClick={applyFilters}>Filtrar</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <Box sx={{ p: 3 }}><Skeleton variant="rounded" height={400} /></Box>
          ) : items.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <PaymentsIcon sx={{ fontSize: 48, color: colors.greyLighter, mb: 2 }} />
              <Typography sx={{ color: colors.grey, fontWeight: 600, fontSize: 15 }}>Nenhum pagamento encontrado</Typography>
              <Typography variant="caption" sx={{ color: colors.greyLight, mt: 0.5, display: 'block' }}>
                Ajuste os filtros ou aguarde novos pagamentos.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Utilizador</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Método</TableCell>
                      <TableCell>Referência</TableCell>
                      <TableCell>Pago em</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((p: PaymentRow) => {
                      const st = statusStyles[p.status] ?? statusStyles.failed;
                      return (
                        <TableRow key={`${p.type}-${p.id}`} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>{p.user_name ?? '—'}</Typography>
                            <Typography variant="caption" sx={{ color: colors.grey }}>{p.user_email ?? ''}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 13 }}>{p.title}</Typography>
                            <Chip label={typeLabels[p.type] ?? p.type} size="small"
                              sx={{ mt: 0.3, height: 19, fontSize: 10, fontWeight: 700, bgcolor: colors.surfaceVariant, color: colors.grey }} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                              {kwanza(p.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={st.label} size="small"
                              sx={{ bgcolor: st.bg, color: st.color, fontWeight: 700, fontSize: 11, height: 24 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 12, color: colors.grey, whiteSpace: 'nowrap' }}>
                              {p.payment_method === 'REF' ? 'Referência' : p.payment_method === 'GPO' ? 'MCX Express' : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'monospace' }}>
                              {p.payment_reference ?? '—'}
                            </Typography>
                            {p.merchant_transaction_id && (
                              <Typography variant="caption" sx={{ color: colors.greyLight, fontFamily: 'monospace' }}>
                                {p.merchant_transaction_id}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: 12, color: colors.grey, whiteSpace: 'nowrap' }}>
                              {fmt(p.paid_at)}
                            </Typography>
                          </TableCell>
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
    </>
  );
}
