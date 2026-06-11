import { Box, Card, CardContent, Chip, Button, Tooltip, LinearProgress, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import { Match, Prediction, PredictionSummary, LiveMatchData } from './types';
import { isMatchLocked, STATUS_LABELS, STATUS_COLORS } from './matchUtils';
import TeamMini from './TeamMini';
import PredictionBar from './PredictionBar';

interface Props {
  match: Match;
  prediction?: Prediction;
  summary?: PredictionSummary;
  liveData?: LiveMatchData;
  onPredict: (m: Match) => void;
  onViewOthers: (m: Match) => void;
}

/** Convierte un marcador en resultado: 'home' | 'draw' | 'away' | null */
function getResult(home: number | null, away: number | null): 'home' | 'draw' | 'away' | null {
  if (home === null || away === null) return null;
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'draw';
}

export default function MatchCard({ match, prediction, summary, liveData, onPredict, onViewOthers }: Props) {
  const locked = isMatchLocked(match);
  const confirmed = match.homeTeam.id !== null && match.awayTeam.id !== null;
  const timeStr = new Date(match.utcDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isPaused = match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';

  // Score a mostrar: priorizar datos en vivo de la API
  const displayScore = liveData?.score ?? match.score;

  // Minuto: solo si hay datos en vivo
  const minute = liveData?.minute ?? null;
  const injuryTime = liveData?.injuryTime ?? null;
  const minuteLabel = minute !== null
    ? injuryTime ? `${minute}+${injuryTime}'` : `${minute}'`
    : isPaused ? 'ET'
    : null;

  // Feedback visual solo para partidos finalizados con pronóstico
  const isExact =
    isFinished &&
    prediction !== undefined &&
    prediction.predicted_home_score === match.score.home &&
    prediction.predicted_away_score === match.score.away;

  const isCorrect =
    !isExact &&
    isFinished &&
    prediction !== undefined &&
    getResult(prediction.predicted_home_score, prediction.predicted_away_score) ===
      getResult(match.score.home, match.score.away);

  const isWrong =
    isFinished &&
    prediction !== undefined &&
    !isExact &&
    !isCorrect;

  // Estilos de borde/fondo según resultado
  let cardBorder = isLive
    ? '1px solid rgba(255, 167, 38, 0.4)'
    : '1px solid rgba(255,255,255,0.06)';
  let cardBg = 'transparent';

  if (isExact) {
    cardBorder = '1px solid rgba(76, 175, 80, 0.6)';
    cardBg = 'rgba(76, 175, 80, 0.08)';
  } else if (isCorrect) {
    cardBorder = '1px solid rgba(76, 175, 80, 0.35)';
    cardBg = 'rgba(76, 175, 80, 0.05)';
  } else if (isWrong) {
    cardBorder = '1px solid rgba(244, 67, 54, 0.4)';
    cardBg = 'rgba(244, 67, 54, 0.06)';
  }

  return (
    <Card sx={{
      mb: 1.5,
      opacity: confirmed ? 1 : 0.7,
      border: cardBorder,
      bgcolor: cardBg,
      transition: 'border-color 0.3s, background-color 0.3s',
    }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        {/* Cabecera */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {timeStr}{match.venue ? ` · ${match.venue}` : ''}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {/* Badge de resultado exacto */}
            {isExact && (
              <Chip
                icon={<StarIcon sx={{ fontSize: '13px !important' }} />}
                label="¡Exacto!"
                size="small"
                sx={{
                  bgcolor: 'rgba(76, 175, 80, 0.2)',
                  border: '1px solid rgba(76, 175, 80, 0.5)',
                  color: 'success.light',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  '& .MuiChip-icon': { color: 'success.light' },
                }}
              />
            )}
            {confirmed ? (
              isLive ? (
                /* Badge estilo Google: punto rojo pulsante + minuto */
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%',
                    bgcolor: '#f44336',
                    animation: 'livePulse 1.2s infinite',
                    '@keyframes livePulse': {
                      '0%,100%': { opacity: 1, transform: 'scale(1)' },
                      '50%': { opacity: 0.5, transform: 'scale(0.75)' },
                    },
                  }} />
                  <Typography variant="caption" fontWeight={700} color="#f44336" sx={{ lineHeight: 1 }}>
                    {minuteLabel ?? (isPaused ? 'ET' : 'EN JUEGO')}
                  </Typography>
                </Box>
              ) : (
                <Chip
                  label={STATUS_LABELS[match.status] || match.status}
                  color={STATUS_COLORS[match.status] || 'default'}
                  size="small"
                />
              )
            ) : (
              <Chip label="Equipos por definir" size="small" variant="outlined" />
            )}
          </Box>
        </Box>

        {/* Equipos + marcador */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <TeamMini team={match.homeTeam} />
          <Box sx={{ textAlign: 'center', minWidth: 56 }}>
            {confirmed && (isLive || isFinished) ? (
              <Typography variant="h5" fontWeight={700} color={isLive ? 'warning.main' : 'secondary.main'}>
                {displayScore.home ?? '?'} — {displayScore.away ?? '?'}
              </Typography>
            ) : (
              <Typography variant="h6" color="text.secondary">vs</Typography>
            )}
          </Box>
          <TeamMini team={match.awayTeam} />
        </Box>

        {/* Pronóstico del usuario con feedback de color */}
        {prediction && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Chip
              label={`Tu pronóstico: ${prediction.predicted_home_score} — ${prediction.predicted_away_score}`}
              size="small"
              variant="outlined"
              sx={
                isExact
                  ? { borderColor: 'success.main', color: 'success.light', fontWeight: 700 }
                  : isCorrect
                  ? { borderColor: 'success.dark', color: 'success.light' }
                  : isWrong
                  ? { borderColor: 'error.dark', color: 'error.light' }
                  : { borderColor: 'primary.main', color: 'primary.light' }
              }
              icon={
                isExact
                  ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: 'success.main !important' }} />
                  : isCorrect
                  ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: 'success.dark !important' }} />
                  : isWrong
                  ? <CancelIcon sx={{ fontSize: '14px !important', color: 'error.main !important' }} />
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
