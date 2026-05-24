import { Chip } from '@mui/material';
import { colors } from '../theme';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: colors.warning, bg: '#FEF3C7' },
  pending_payment: { label: 'Pag. Pendente', color: colors.warning, bg: '#FEF3C7' },
  active: { label: 'Activo', color: colors.success, bg: '#D1FAE5' },
  approved: { label: 'Aprovado', color: colors.success, bg: '#D1FAE5' },
  rejected: { label: 'Rejeitado', color: colors.error, bg: '#FEE2E2' },
  inactive: { label: 'Inactivo', color: '#6B7280', bg: '#F3F4F6' },
  expired: { label: 'Expirado', color: colors.grey, bg: '#F3F4F6' },
  cancelled: { label: 'Cancelado', color: colors.grey, bg: '#F3F4F6' },
  scheduled: { label: 'Agendado', color: '#3B82F6', bg: '#DBEAFE' },
  completed: { label: 'Concluído', color: colors.success, bg: '#D1FAE5' },
  in_progress: { label: 'Em Curso', color: '#8B5CF6', bg: '#EDE9FE' },
  used: { label: 'Usado', color: colors.grey, bg: '#F3F4F6' },
  true: { label: 'Sim', color: colors.success, bg: '#D1FAE5' },
  false: { label: 'Não', color: colors.error, bg: '#FEE2E2' },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: colors.grey, bg: '#F3F4F6' };
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bg, color: config.color, fontWeight: 700, fontSize: 11, px: 0.5,
        height: 26, borderRadius: 1.5,
      }}
    />
  );
}
