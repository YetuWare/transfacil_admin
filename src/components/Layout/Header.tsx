import { Box, Typography, IconButton, Badge, Avatar, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { colors } from '../../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  return (
    <Box sx={{
      position: 'sticky', top: 0, zIndex: 110,
      bgcolor: colors.surface,
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      px: { xs: 2, md: 4 }, py: 1.5,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {onMenuClick && (
            <IconButton onClick={onMenuClick} sx={{ display: { md: 'none' }, color: colors.dark }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: colors.dark }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ color: colors.grey, fontSize: 13, fontWeight: 450, mt: 0.1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Notificações">
            <IconButton size="small" sx={{ color: colors.grey }}>
              <Badge variant="dot" color="error">
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Perfil">
            <IconButton size="small">
              <Avatar sx={{ width: 30, height: 30, bgcolor: colors.primary, color: colors.dark, fontWeight: 700, fontSize: 12 }}>
                A
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
