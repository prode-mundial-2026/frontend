import { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import api from '../api/client';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          background: 'linear-gradient(135deg, #0A0E1A 0%, #1a237e 100%)',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 420 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Enlace inválido. Por favor solicitá uno nuevo.
            </Alert>
            <RouterLink to="/forgot-password" style={{ color: '#42A5F5' }}>
              Solicitar nuevo enlace
            </RouterLink>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: 'linear-gradient(135deg, #0A0E1A 0%, #1a237e 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SportsSoccerIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h5" gutterBottom>Nueva contraseña</Typography>
            <Typography color="text.secondary" variant="body2">
              Ingresá tu nueva contraseña.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              ¡Contraseña actualizada! Redirigiendo al inicio de sesión…
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Nueva contraseña"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                required
                autoComplete="new-password"
                inputProps={{ minLength: 6 }}
              />
              <TextField
                label="Confirmar contraseña"
                type="password"
                fullWidth
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                sx={{ mb: 3 }}
                required
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Guardar contraseña'}
              </Button>
            </form>
          )}

          <Typography sx={{ mt: 3, textAlign: 'center' }}>
            <RouterLink to="/login" style={{ color: '#42A5F5' }}>
              ← Volver al inicio de sesión
            </RouterLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
