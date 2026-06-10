import { Box, Card, CardContent, Chip, Button, Tooltip, LinearProgress, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Match, Prediction, PredictionSummary } from './types';
import { isMatchLocked, STATUS_LABELS, STATUS_COLORS } from './matchUtils';
import TeamMini from './TeamMini';
import PredictionBar from './PredictionBar';

interface Props {
  match: Match;
  prediction?: Prediction;
  summary?: PredictionSummary;
  onPredict: (m: Match) => void;
  onViewOthers: (m: Match) => void;
}

export default function MatchCard({ match, prediction, summary, onPredict, onViewOthers }: Props) {
  const locked = isMatchLocked(match);
  const confirmed = match.homeTeam.id !== null && match.awayTeam.id !== null;
  const timeStr = new Date(match.utcDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';

  return (
    <Card sx={{
      mb: 1.5,
      opacity: confirmed ? 1 : 0.7,
      border: isLive ? '1px solid rgba(255, 167, 38, 0.4)' : '1px solid rgba(255,255,255,0.06)',
      transition: 'border-color 0.3s',
    }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        {/* Cabecera */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {timeStr}{match.venue ? ` · ${match.venue}` : ''}
          </Typography>
          {confirmed ? (
            <Chip
              label={STATUS_LABELS[match.status] || match.status}
              color={STATUS_COLORS[match.status] || 'default'}
              size="small"
              sx={isLive ? {
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
              } : {}}
            />
          ) : (
            <Chip label="Equipos por definir" size="small" variant="outlined" />
          )}
        </Box>

        {/* Equipos + marcador */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <TeamMini team={match.homeTeam} />
          <Box sx={{ textAlign: 'center', minWidth: 56 }}>
            {confirmed && (isLive || isFinished) ? (
              <Typography variant="h5" fontWeight={700} color={isLive ? 'warning.main' : 'secondary.main'}>
                {match.score.home ?? '?'} — {match.score.away ?? '?'}
              </Typography>
            ) : (
              <Typography variant="h6" color="text.secondary">vs</Typography>
            )}
          </Box>
          <TeamMini team={match.awayTeam} />
        </Box>

        {/* Pronóstico del usuario */}
        {prediction && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={`Tu pronóstico: ${prediction.predicted_home_score} — ${prediction.predicted_away_score}`}
              size="small"
              color="primary"
              variant="outlined"
              icon={
                isFinished &&
                prediction.predicted_home_score === match.score.home &&
                prediction.predicted_away_score === match.score.away
                  ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: 'success.main !important' }} />
                  : undefined
              }
            />
          </Box>
        )}

        {/* Footer: botón / barra + ver otros */}
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {!locked && confirmed ? (
            <Button size="small" variant="contained" onClick={() => onPredict(match)}>
              {prediction ? 'Editar pronóstico' : 'Pronosticar'}
            </Button>
          ) : locked && confirmed ? (
            <Box sx={{ flex: 1 }}>
              {summary
                ? <PredictionBar summary={summary} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
                : <LinearProgress sx={{ height: 6, borderRadius: 3, my: 0.5 }} />
              }
            </Box>
          ) : null}

          {locked && confirmed && (
            <Tooltip title="Ver pronósticos de otros usuarios" arrow>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
                onClick={() => onViewOthers(match)}
                sx={{
                  fontSize: '0.7rem', py: 0.3, px: 1,
                  borderColor: 'rgba(255,255,255,0.15)', color: 'text.secondary',
                  '&:hover': { borderColor: 'primary.light', color: 'primary.light' },
                }}
              >
                Ver
              </Button>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
