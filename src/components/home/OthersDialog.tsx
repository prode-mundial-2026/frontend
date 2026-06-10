import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Avatar, Alert, LinearProgress,
} from '@mui/material';
import { Match, OtherPrediction } from './types';
import api from '../../api/client';

interface Props {
  match: Match | null;
  open: boolean;
  onClose: () => void;
}

export default function OthersDialog({ match, open, onClose }: Props) {
  const [predictions, setPredictions] = useState<OtherPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !match) return;
    setLoading(true);
    setError('');
    api.get(`/predictions/match/${match.id}`)
      .then((r) => setPredictions(r.data.predictions))
      .catch(() => setError('No se pudieron cargar los pronósticos'))
      .finally(() => setLoading(false));
  }, [open, match]);

  if (!match) return null;

  const { homeTeam, awayTeam } = match;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Pronósticos: {homeTeam.tla || homeTeam.name} vs {awayTeam.tla || awayTeam.name}
      </DialogTitle>
      <DialogContent>
        {loading && <LinearProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && predictions.length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={2}>
            Nadie pronosticó este partido aún.
          </Typography>
        )}
        {predictions.map((p) => (
          <Box key={p.username} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            py: 1, borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={p.avatar_url ?? undefined} sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
                {p.username[0].toUpperCase()}
              </Avatar>
              <Typography variant="body2">{p.username}</Typography>
            </Box>
            <Typography variant="body2" fontWeight={700} color="secondary.main">
              {p.predicted_home_score} — {p.predicted_away_score}
            </Typography>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
