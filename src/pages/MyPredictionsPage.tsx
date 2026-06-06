import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Skeleton, Alert,
  Divider,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import api from '../api/client';

interface Prediction {
  id: string;
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number;
  scored_at: string | null;
  utc_date: string;
  match_status: string;
  actual_home: number | null;
  actual_away: number | null;
  home_team_name: string;
  home_team_tla: string;
  home_team_crest: string;
  away_team_name: string;
  away_team_tla: string;
  away_team_crest: string;
}

function PredictionCard({ pred }: { pred: Prediction }) {
  const isFinished = pred.match_status === 'FINISHED' && pred.scored_at;
  const isExact = pred.points_earned === 30;
  const isCorrect = pred.points_earned === 10;
  const isWrong = isFinished && pred.points_earned === 0;

  return (
    <Card sx={{ mb: 1.5, borderLeft: `4px solid ${isExact ? '#FFD600' : isCorrect ? '#2E7D32' : isWrong ? '#C62828' : 'transparent'}` }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(pred.utc_date).toLocaleDateString('es-AR', {
              weekday: 'short', day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit',
            })}
          </Typography>

          {isFinished && (
            <Chip
              icon={isExact ? <StarIcon /> : isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
              label={isExact ? '+30 pts' : isCorrect ? '+10 pts' : '0 pts'}
              size="small"
              color={isExact ? 'warning' : isCorrect ? 'success' : 'error'}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {pred.home_team_crest && (
              <img src={pred.home_team_crest} alt="" width={28} style={{ objectFit: 'contain' }} />
            )}
            <Typography variant="body2" fontWeight={600}>
              {pred.home_team_tla || pred.home_team_name}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" fontWeight={700} color="secondary.main">
              {pred.predicted_home_score} – {pred.predicted_away_score}
            </Typography>
            {isFinished && (
              <Typography variant="caption" color="text.secondary">
                Real: {pred.actual_home} – {pred.actual_away}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
            <Typography variant="body2" fontWeight={600}>
              {pred.away_team_tla || pred.away_team_name}
            </Typography>
            {pred.away_team_crest && (
              <img src={pred.away_team_crest} alt="" width={28} style={{ objectFit: 'contain' }} />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function MyPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/predictions')
      .then((res) => setPredictions(res.data.predictions))
      .catch(() => setError('No se pudieron cargar los pronósticos'))
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points_earned || 0), 0);
  const exactCount = predictions.filter((p) => p.points_earned === 30).length;
  const correctCount = predictions.filter((p) => p.points_earned === 10).length;

  const pending = predictions.filter((p) => !p.scored_at);
  const scored = predictions.filter((p) => p.scored_at);

  return (
    <Box maxWidth={700} mx="auto">
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentIcon color="secondary" /> Mis Pronósticos
      </Typography>

      {/* Stats */}
      {scored.length > 0 && (
        <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)' }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-around', py: 2 }}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} color="secondary.main">{totalPoints}</Typography>
              <Typography variant="caption">Puntos totales</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} color="warning.main">{exactCount}</Typography>
              <Typography variant="caption">Exactos</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} color="success.main">{correctCount}</Typography>
              <Typography variant="caption">Resultados</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 1.5, borderRadius: 3 }} />
        ))
      ) : predictions.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            Todavía no hiciste ningún pronóstico. ¡Andá a Partidos y empezá a jugar!
          </Typography>
        </Box>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Pendientes ({pending.length})
              </Typography>
              {pending.map((p) => <PredictionCard key={p.id} pred={p} />)}
            </>
          )}

          {scored.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Puntuados ({scored.length})
              </Typography>
              {scored.map((p) => <PredictionCard key={p.id} pred={p} />)}
            </>
          )}
        </>
      )}
    </Box>
  );
}
