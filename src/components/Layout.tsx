import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, BottomNavigation,
  BottomNavigationAction, Avatar, IconButton, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import HomeIcon from '@mui/icons-material/Home';

const NAV_ITEMS = [
  { label: 'Hoy', icon: <HomeIcon />, path: '/home' },
  { label: 'Partidos', icon: <SportsSoccerIcon />, path: '/matches' },
  { label: 'Mis Pronósticos', icon: <AssignmentIcon />, path: '/mis-predicciones' },
  { label: 'Llaves', icon: <EmojiEventsIcon />, path: '/llaves' },
  { label: 'Ranking', icon: <LeaderboardIcon />, path: '/ranking' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUsername } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameError, setRenameError] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  const currentTab = NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.path));

  const handleOpenRename = () => {
    setAnchorEl(null);
    setNewName(user?.username ?? '');
    setRenameError('');
    setRenameOpen(true);
  };

  const handleRename = async () => {
    setRenameLoading(true);
    setRenameError('');
    try {
      await updateUsername(newName.trim());
      setRenameOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setRenameError(msg || 'Error al actualizar el nombre');
    } finally {
      setRenameLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <SportsSoccerIcon sx={{ mr: 1, color: 'secondary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Prode Mundial 2026 por Santi Lapiana (y Claude)
          </Typography>

          {user && (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar
                  src={user.avatar_url}
                  alt={user.username}
                  sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                >
                  {user.username[0].toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user.username}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleOpenRename}>
                  Cambiar nombre
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate('/login'); }}>
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, pb: 8, px: { xs: 1, sm: 2, md: 3 }, pt: 2 }}>
        <Outlet />
      </Box>

      <BottomNavigation
        value={currentTab}
        onChange={(_, newValue) => navigate(NAV_ITEMS[newValue].path)}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Cambiar nombre de perfil</DialogTitle>
        <DialogContent>
          {renameError && <Alert severity="error" sx={{ mb: 2 }}>{renameError}</Alert>}
          <TextField
            autoFocus
            fullWidth
            label="Nuevo nombre"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onFocus={(e) => e.target.select()}
            inputProps={{ maxLength: 30 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleRename}
            disabled={renameLoading || newName.trim().length < 3}
          >
            {renameLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
