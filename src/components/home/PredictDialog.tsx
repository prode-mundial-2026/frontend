import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert,
} from '@mui/material';
import { Match, Prediction } from './types';
import api from '../../api/client';

interface Props {
  match: Match | null;
  existing?: Prediction;
  open: boolean;
  onClose: () => void;
  onSaved: (p: Prediction) => void;
}

export default function PredictDialog({ match, existing, open, onClose, onSaved }: Props) {
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setHome(existing?.predicted_home_score ?? 0);
    setAway(existing?.predicted_away_score ?? 0);
    setError('');
  }, [match, existing]);

  const handleSave = async () => {
    if (!match) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/predictions', {
        matchId: match.id,
        predictedHomeScore: home,
        predictedAwayScore: away,
      });
      onSaved({ match_id: match.id, predicted_home_score: home, predicted_away_score: away });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (!match) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Pronosticar partido</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, justifyContent: 'center' }}>
          {(['homeTeam', 'awayTeam'] as const).map((side, i) => (
            <>
              {i === 1 && (
                <Typography key="sep" variant="h5" color="text.secondary" sx={{ mt: 3 }}>—</Typography>
              )}
              <Box key={side} sx={{ textAlign: 'center' }}>
                {match[side].crest && (
                  <img src={match[side].crest!} alt="" width={40} style={{ objectFit: 'contain' }} />
                )}
                <Typography variant="body2" fontWeight={600}>{match[side].tla}</Typography>
                <TextField
                  type="number"
                  value={side === 'homeTeam' ? home : away}
                  onChange={(e) => {
                    const v = Math.max(0, parseInt(e.target.value) || 0);
                    side === 'homeTeam' ? setHome(v) : setAway(v);
                  }}
                  onFocus={(e) => e.target.select()}
                  inputProps={{ min: 0, max: 30, style: { textAlign: 'center', fontSize: 24, width: 60 } }}
                  sx={{ mt: 1 }}
                />
              </Box>
            </>
          ))}
        </Box>
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            🎯 Acierto de resultado: <strong>10 pts</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            ⚡ Marcador exacto: <strong>30 pts</strong>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar pronóstico'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
