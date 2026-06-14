import { Box, Grid, Card, CardContent, Typography, LinearProgress, Stack, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import EventIcon from '@mui/icons-material/Event';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import StatsCard from '../components/StatsCard';
import { useApiData } from '../hooks/useApiData';
import { statsService } from '../api/services';
import { colors } from '../theme';

const badgeBg = (color: string) => `${color}18`;

export default function Dashboard() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { data: stats, loading } = useApiData(() => statsService.get(), []);

  const activeUsers = stats ? Math.max(0, stats.total_users - stats.pending_users) : 0;

  const barData = stats
    ? [
        { name: 'Activos', value: activeUsers, fill: colors.success },
        { name: 'Subscrições', value: stats.active_subscriptions, fill: colors.success },
        { name: 'Pendentes', value: stats.pending_users, fill: colors.warning },
        { name: 'Pagamentos', value: stats.pending_payments, fill: colors.warning },
        { name: 'Reservas', value: stats.pending_event_bookings, fill: colors.secondary },
        { name: 'Viagens', value: stats.upcoming_trips, fill: colors.info },
      ]
    : [];

  const pieData = stats
    ? [
        { name: 'Utilizadores Activos', value: activeUsers, color: colors.success },
        { name: 'Subscrições Activas', value: stats.active_subscriptions, color: '#34D399' },
        { name: 'Pendentes', value: stats.pending_users + stats.pending_payments + stats.pending_event_bookings, color: colors.warning },
        { name: 'Viagens Agendadas', value: stats.upcoming_trips, color: colors.info },
      ]
    : [];

  const pendingItems = stats
    ? [
        { label: 'Utilizadores por aprovar', value: stats.pending_users, icon: <PeopleIcon sx={{ fontSize: 18 }} />, color: colors.warning },
        { label: 'Pagamentos pendentes', value: stats.pending_payments, icon: <ConfirmationNumberIcon sx={{ fontSize: 18 }} />, color: colors.warning },
        { label: 'Reservas de eventos', value: stats.pending_event_bookings, icon: <EventIcon sx={{ fontSize: 18 }} />, color: colors.secondary },
        { label: 'Suporte pendente', value: stats.pending_support_requests, icon: <ContactSupportIcon sx={{ fontSize: 18 }} />, color: '#8B5CF6' },
        { label: 'Próximas viagens', value: stats.upcoming_trips, icon: <DirectionsBusIcon sx={{ fontSize: 18 }} />, color: colors.info },
      ]
    : [];

  const chartTooltip = {
    contentStyle: {
      borderRadius: 12, border: 'none',
      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
      fontSize: 13, fontWeight: 600,
    },
  };

  return (
    <>
      <Header title="Dashboard" subtitle="Visão geral do sistema TransFácil" onMenuClick={onMenuClick} />
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '100%' }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard title="Utilizadores" value={stats?.total_users ?? 0} icon={<PeopleIcon />}
              subtitle={`${stats?.pending_users ?? 0} aguardam aprovação`} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard title="Subscrições Activas" value={stats?.active_subscriptions ?? 0} icon={<ConfirmationNumberIcon />}
              color={colors.success} subtitle={`${stats?.pending_payments ?? 0} com pagamento pendente`} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard title="Próximas Viagens" value={stats?.upcoming_trips ?? 0} icon={<DirectionsBusIcon />}
              color={colors.info} subtitle="Agendadas" loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard title="Reservas Pendentes" value={stats?.pending_event_bookings ?? 0} icon={<EventIcon />}
              color={colors.secondary} subtitle="Aguardam confirmação" loading={loading} />
          </Grid>
        </Grid>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard title="Suporte Pendente" value={stats?.pending_support_requests ?? 0} icon={<ContactSupportIcon />}
              color="#8B5CF6" subtitle="Pedidos por responder" loading={loading} />
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Bar Chart */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', height: '100%' }}>
              <CardContent sx={{ p: 3, pb: '16px !important' }}>
                <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700, mb: 0.5 }}>
                  Panorama Geral
                </Typography>
                <Typography variant="caption" sx={{ color: colors.grey, display: 'block', mb: 2 }}>
                  Distribuição de métricas do sistema
                </Typography>
                  {stats ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
                      barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.greyLighter} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: colors.grey }} axisLine={false} tickLine={false}
                        tickMargin={8} angle={-25} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11, fill: colors.grey }} axisLine={false} tickLine={false} />
                      <Tooltip {...chartTooltip} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}
                        label={{ position: 'top', fontSize: 12, fontWeight: 700, fill: colors.dark }}>
                        {barData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          {/* Donut Chart */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', height: '100%' }}>
              <CardContent sx={{ p: 3, pb: '16px !important' }}>
                <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700, mb: 0.5 }}>
                  Distribuição Geral
                </Typography>
                <Typography variant="caption" sx={{ color: colors.grey, display: 'block', mb: 1 }}>
                  Visão agregada do sistema
                </Typography>
                  {stats ? (
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'center', height: 320, gap: 2 }}>
                    <ResponsiveContainer width="60%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                          dataKey="value" paddingAngle={3} cornerRadius={4}>
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip {...chartTooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box>
                      {pieData.map((e) => (
                        <Box key={e.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: e.color, flexShrink: 0 }} />
                          <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.dark, lineHeight: 1.2 }}>
                              {e.name}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: colors.grey, lineHeight: 1.2 }}>
                              {e.value}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pending Items Summary */}
        <Card sx={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700 }}>
                  Necessita de Atenção
                </Typography>
                <Typography variant="caption" sx={{ color: colors.grey }}>
                  Items pendentes que requerem acção
                </Typography>
              </Box>
              <ScheduleIcon sx={{ color: colors.greyLight, fontSize: 22 }} />
            </Box>
            <Grid container spacing={2}>
              {pendingItems.map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={item.label}>
                  <Box sx={{
                    p: 2, borderRadius: 3,
                    bgcolor: badgeBg(item.color),
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 2.5,
                      bgcolor: `${item.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color, flexShrink: 0,
                    }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1, color: item.color }}>
                        {item.value}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: colors.grey, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
