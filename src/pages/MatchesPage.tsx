import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Tab, Tabs,
  Skeleton, Alert, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LockIcon from '@mui/icons-material/Lock';
import api from '../api/client';

interface Team {
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

interface Match {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string;
  matchday: number;
  venue: string;
  homeTeam: Team;
  awayTeam: Team;
  score: { home: number | null; away: number | null };
}

interface Prediction {
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
}

// Orden canónico de stages
const STAGE_ORDER = [
  'GROUP_STAGE',
  'LAST_32',
  'LAST_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL',
];

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Fase de Grupos',
  LAST_32: 'Dieciseisavos de Final',
  LAST_16: 'Octavos de Final',
  QUARTER_FINALS: 'Cuartos de Final',
  SEMI_FINALS: 'Semifinales',
  THIRD_PLACE: 'Tercer Puesto',
  FINAL: 'Final',
};

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  SCHEDULED: 'default',
  TIMED: 'default',
  IN_PLAY: 'warning',
  PAUSED: 'warning',
  FINISHED: 'success',
  POSTPONED: 'error',
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  TIMED: 'Programado',
  IN_PLAY: 'En juego',
  PAUSED: 'En descanso',
  FINISHED: 'Finalizado',
  POSTPONED: 'Postergado',
};

// Un partido tiene ambos equipos confirmados cuando los IDs no son null
function teamsConfirmed(match: Match): boolean {
  return match.homeTeam.id !== null && match.awayTeam.id !== null;
}

function TeamDisplay({ team }: { team: Team }) {
  if (!team.id) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <Box sx={{
          width: 36, height: 36,
          border: '2px dashed rgba(255,255,255,0.15)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography color="text.disabled" fontSize={18}>?</Typography>
        </Box>
        <Typography variant="body2" color="text.disabled" textAlign="center" sx={{ mt: 0.5 }}>
          Por definir
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
      {team.crest && (
        <img src={team.crest} alt={team.name ?? ''} width={36} height={36} style={{ objectFit: 'contain' }} />
      )}
      <Typography variant="body2" fontWeight={600} textAlign="center" sx={{ mt: 0.5 }}>
        {team.tla || team.shortName || team.name}
      </Typography>
    </Box>
  );
}

function MatchCard({
  match,
  prediction,
  onPredict,
}: {
  match: Match;
  prediction?: Prediction;
  onPredict: (match: Match) => void;
}) {
  const matchDate = new Date(match.utcDate);
  const confirmed = teamsConfirmed(match);
  const canPredict = confirmed &&
    (match.status === 'SCHEDULED' || match.status === 'TIMED') &&
    matchDate.getTime() - Date.now() > 5 * 60 * 1000;

  return (
    <Card sx={{ mb: 1.5, opacity: confirmed ? 1 : 0.75 }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {matchDate.toLocaleDateString('es-AR', {
              weekday: 'short', day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit',
            })}
            {match.venue ? ` · ${match.venue}` : ''}
          </Typography>
          {confirmed ? (
            <Chip
              label={STATUS_LABELS[match.status] || match.status}
              color={STATUS_COLORS[match.status] || 'default'}
              size="small"
            />
          ) : (
            <Chip label="Equipos por definir" size="small" variant="outlined" />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <TeamDisplay team={match.homeTeam} />

          <Box sx={{ textAlign: 'center', minWidth: 60 }}>
            {confirmed && (match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'PAUSED') ? (
              <Typography variant="h5" fontWeight={700} color="secondary.main">
                {match.score.home ?? '?'} — {match.score.away ?? '?'}
              </Typography>
            ) : (
              <Typography variant="h6" color="text.secondary">vs</Typography>
            )}
          </Box>

          <TeamDisplay team={match.awayTeam} />
        </Box>

        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {prediction ? (
            <Chip
              label={`Tu pronóstico: ${prediction.predicted_home_score} — ${prediction.predicted_away_score}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          ) : (
            <Box />
          )}
          {!confirmed ? (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LockIcon sx={{ fontSize: 13 }} /> Disponible cuando se confirmen los equipos
            </Typography>
          ) : canPredict ? (
            <Button size="small" variant="contained" onClick={() => onPredict(match)}>
              {prediction ? 'Editar pronóstico' : 'Pronosticar'}
            </Button>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}

function PredictDialog({
  match,
  existing,
  open,
  onClose,
  onSaved,
}: {
  match: Match | null;
  existing?: Prediction;
  open: boolean;
  onClose: () => void;
  onSaved: (pred: Prediction) => void;
}) {
  const [home, setHome] = useState(existing?.predicted_home_score ?? 0);
  const [away, setAway] = useState(existing?.predicted_away_score ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setHome(existing.predicted_home_score);
      setAway(existing.predicted_away_score);
    } else {
      setHome(0);
      setAway(0);
    }
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
          <Box sx={{ textAlign: 'center' }}>
            {match.homeTeam.crest && (
              <img src={match.homeTeam.crest} alt="" width={40} style={{ objectFit: 'contain' }} />
            )}
            <Typography variant="body2" fontWeight={600}>{match.homeTeam.tla}</Typography>
            <TextField
              type="number"
              value={home}
              onChange={(e) => setHome(Math.max(0, parseInt(e.target.value) || 0))}
              inputProps={{ min: 0, max: 30, style: { textAlign: 'center', fontSize: 24, width: 60 } }}
              sx={{ mt: 1 }}
            />
          </Box>
          <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>—</Typography>
          <Box sx={{ textAlign: 'center' }}>
            {match.awayTeam.crest && (
              <img src={match.awayTeam.crest} alt="" width={40} style={{ objectFit: 'contain' }} />
            )}
            <Typography variant="body2" fontWeight={600}>{match.awayTeam.tla}</Typography>
            <TextField
              type="number"
              value={away}
              onChange={(e) => setAway(Math.max(0, parseInt(e.target.value) || 0))}
              inputProps={{ min: 0, max: 30, style: { textAlign: 'center', fontSize: 24, width: 60 } }}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            {'🎯'} Acierto de resultado: <strong>10 pts</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            {'⚡'} Marcador exacto: <strong>30 pts</strong>
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

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stageTab, setStageTab] = useState(0);
  const [predictMatch, setPredictMatch] = useState<Match | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [matchRes, predRes] = await Promise.all([
          api.get('/matches'),
          api.get('/predictions').catch(() => ({ data: { predictions: [] } })),
        ]);
        setMatches(matchRes.data.matches);
        setPredictions(predRes.data.predictions);
      } catch {
        setError('No se pudieron cargar los partidos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const predictionMap = Object.fromEntries(predictions.map((p) => [p.match_id, p]));

  // Stages presentes en la DB, en orden canónico
  const presentStages = STAGE_ORDER.filter(
    (s) => matches.some((m) => m.stage === s)
  );

  // Tabs: "Todos" + cada stage presente
  const tabs = ['ALL', ...presentStages];

  const filteredMatches = stageTab === 0
    ? matches
    : matches.filter((m) => m.stage === tabs[stageTab]);

  // Agrupar por matchday/fecha dentro de la vista actual
  const groupedMatches = filteredMatches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.matchday
      ? `Jornada ${m.matchday}`
      : new Date(m.utcDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const handlePredictionSaved = (pred: Prediction) => {
    setPredictions((prev) => {
      const idx = prev.findIndex((p) => p.match_id === pred.match_id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = pred;
        return updated;
      }
      return [...prev, pred];
    });
  };

  return (
    <Box maxWidth={700} mx="auto">
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SportsSoccerIcon color="secondary" /> Partidos
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs
        value={stageTab}
        onChange={(_, v) => setStageTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {tabs.map((s, i) => (
          <Tab key={s} label={s === 'ALL' ? 'Todos' : (STAGE_LABELS[s] || s)} value={i} />
        ))}
      </Tabs>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 1.5, borderRadius: 3 }} />
        ))
      ) : filteredMatches.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            Aún no hay partidos cargados. Los datos se sincronizarán automáticamente.
          </Typography>
        </Box>
      ) : (
        Object.entries(groupedMatches).map(([groupLabel, groupMatches]) => (
          <Box key={groupLabel} sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              color="text.disabled"
              sx={{ display: 'block', mb: 1, letterSpacing: 1.5, fontSize: '0.7rem' }}
            >
              {groupLabel}
            </Typography>
            {groupMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictionMap[match.id]}
                onPredict={setPredictMatch}
              />
            ))}
          </Box>
        ))
      )}

      <PredictDialog
        match={predictMatch}
        existing={predictMatch ? predictionMap[predictMatch.id] : undefined}
        open={Boolean(predictMatch)}
        onClose={() => setPredictMatch(null)}
        onSaved={handlePredictionSaved}
      />
    </Box>
  );
}
