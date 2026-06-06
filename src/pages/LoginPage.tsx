import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Divider, Alert, CircularProgress,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { useAuth } from '../context/AuthContext';

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/google`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/matches');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Error al iniciar sesión');
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
            <Typography variant="h4" gutterBottom>Alto Fixture</Typography>
            <Typography color="text.secondary">Prode Mundial 2026</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
              autoComplete="email"
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar sesión'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>o</Divider>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            href={GOOGLE_AUTH_URL}
            startIcon={
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width={20}
              />
            }
          >
            Continuar con Google
          </Button>

          <Typography sx={{ mt: 3, textAlign: 'center' }}>
            ¿No tenés cuenta?{' '}
            <RouterLink to="/register" style={{ color: '#42A5F5' }}>
              Registrate
            </RouterLink>
          </Typography>

          <Divider sx={{ my: 2 }} />
          <Typography sx={{ textAlign: 'center' }}>
            <RouterLink to="/ranking" style={{ color: '#FFD600' }}>
              Ver ranking público →
            </RouterLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
