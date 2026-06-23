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
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

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
  const [bracketReminderOpen, setBracketReminderOpen] = useState(false);
  const [lastMatchday2Date, setLastMatchday2Date] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) return;
    const sessionKey = `bracketReminderShown_${user.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    let cancelled = false;
    Promise.all([
      api.get('/bracket-predictions/my'),
      api.get('/matches', { params: { matchday: 2 } }),
    ]).then(([bracketRes, matchesRes]) => {
      if (cancelled) return;
      const hasPrediction = bracketRes.data.prediction !== null;
      const locked = bracketRes.data.locked;
      if (hasPrediction || locked) return;

      const matches: { utcDate: string }[] = matchesRes.data.matches ?? [];
      if (matches.length === 0) return;
      const sorted = [...matches].sort(
        (a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
      );
      setLastMatchday2Date(new Date(sorted[0].utcDate));
      setBracketReminderOpen(true);
    }).catch(() => { /* silenciar errores */ });

    return () => { cancelled = true; };
  }, [user]);

  const handleCloseReminder = () => {
    if (user) sessionStorage.setItem(`bracketReminderShown_${user.id}`, '1');
    setBracketReminderOpen(false);
  };

  const handleGoToBracket = () => {
    handleCloseReminder();
    navigate('/llaves');
  };

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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {user.username}
                    </Typography>
                    {user.lucky_team_crest && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <img
                          src={user.lucky_team_crest}
                          alt={user.lucky_team_tla}
                          width={18}
                          height={18}
                          style={{ objectFit: 'contain' }}
                        />
                        <Typography variant="caption" color="text.disabled">
                          {user.lucky_team_tla}
                        </Typography>
                      </Box>
                    )}
                  </Box>
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

      <Dialog open={bracketReminderOpen} onClose={handleCloseReminder} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon color="warning" />
          ¡Recordatorio: Pronóstico de Fase Final!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Todavía no seleccionaste tu pronóstico de la <strong>Fase Final</strong> (Semifinales, Finalistas y Campeón).
          </Typography>
          {lastMatchday2Date && (
            <Typography variant="body2" color="text.secondary">
              Tenés tiempo hasta el último partido de la Jornada 2:&nbsp;
              <strong>
                {lastMatchday2Date.toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {' a las '}
                {lastMatchday2Date.toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Argentina/Buenos_Aires',
                })}
                {' (hora Argentina)'}
              </strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReminder}>Cerrar</Button>
          <Button variant="contained" color="warning" onClick={handleGoToBracket}>
            Ir a Llaves
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
