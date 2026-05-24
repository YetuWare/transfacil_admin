import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../theme';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  subtitle?: string;
  loading?: boolean;
}

export default function StatsCard({ title, value, icon, color = colors.primary, subtitle, loading }: StatsCardProps) {
  if (loading) {
    return <Skeleton variant="rounded" height={130} sx={{ borderRadius: 4 }} />;
  }

  return (
    <Card sx={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      border: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      '&:hover': {
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        transform: 'translateY(-2px)',
      },
      transition: 'all 0.25s ease',
    }}>
      {/* Gradient accent bar */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
      }} />

      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: colors.greyLight, mb: 1, textTransform: 'uppercase',
            }}>
              {title}
            </Typography>
            <Typography sx={{
              fontWeight: 800, fontSize: 30, lineHeight: 1.1, letterSpacing: '-0.03em',
              color: colors.dark, mb: 0.3,
            }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: colors.grey, fontWeight: 500, fontSize: 12 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: 3,
            background: `linear-gradient(135deg, ${color}18, ${color}08)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color, flexShrink: 0, ml: 2,
            '& .MuiSvgIcon-root': { fontSize: 24 },
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
