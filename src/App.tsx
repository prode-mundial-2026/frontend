import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MatchesPage from './pages/MatchesPage';
import MyPredictionsPage from './pages/MyPredictionsPage';
import RankingPage from './pages/RankingPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import BracketPredictionPage from './pages/BracketPredictionPage';
import HomePage from './pages/HomePage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Rutas con Layout (navbar + bottom nav) */}
      <Route element={<Layout />}>
        {/* Pública */}
        <Route path="/ranking" element={<RankingPage />} />

        {/* Privadas */}
        <Route path="/home" element={
          <PrivateRoute><HomePage /></PrivateRoute>
        } />
        <Route path="/matches" element={
          <PrivateRoute><MatchesPage /></PrivateRoute>
        } />
        <Route path="/mis-predicciones" element={
          <PrivateRoute><MyPredictionsPage /></PrivateRoute>
        } />
        <Route path="/llaves" element={
          <PrivateRoute><BracketPredictionPage /></PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
