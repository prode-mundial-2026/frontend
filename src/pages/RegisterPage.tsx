import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setTokenAndUser } = useAuth();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setTokenAndUser(res.data.token, res.data.user);
      navigate('/matches');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

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
            <Typography variant="h5" gutterBottom>Crear cuenta</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={form.email}
              onChange={handleChange('email')}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Nombre de usuario"
              fullWidth
              value={form.username}
              onChange={handleChange('username')}
              sx={{ mb: 2 }}
              required
              inputProps={{ minLength: 3, maxLength: 30 }}
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              value={form.password}
              onChange={handleChange('password')}
              sx={{ mb: 3 }}
              required
              inputProps={{ minLength: 6 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Registrarse'}
            </Button>
          </form>

          <Typography sx={{ mt: 3, textAlign: 'center' }}>
            ¿Ya tenés cuenta?{' '}
            <RouterLink to="/login" style={{ color: '#42A5F5' }}>
              Iniciá sesión
            </RouterLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
