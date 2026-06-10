import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, Alert, Skeleton, Chip, Divider, IconButton, Button,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import api from '../api/client';
import { Match, Prediction, PredictionSummary, DailyStats } from '../components/home/types';
import { todayArgentina, addDays, formatDateLabel } from '../components/home/dateUtils';
import { isMatchLocked } from '../components/home/matchUtils';
import MatchCard from '../components/home/MatchCard';
import PredictDialog from '../components/home/PredictDialog';
import OthersDialog from '../components/home/OthersDialog';
import DailyStatsSection from '../components/home/DailyStatsSection';

// ─── Página principal ─────────────────────────────────────────────────────────

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(todayArgentina());
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [summaries, setSummaries] = useState<Record<number, PredictionSummary>>({});
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [predictMatch, setPredictMatch] = useState<Match | null>(null);
  const [othersMatch, setOthersMatch] = useState<Match | null>(null);
  const [othersOpen, setOthersOpen] = useState(false);

  const loadData = useCallback(async (date: string) => {
    setLoading(true);
    setError('');
    setSummaries({});
    try {
      const [matchRes, predRes] = await Promise.all([
        api.get('/matches', { params: { date } }),
        api.get('/predictions').catch(() => ({ data: { predictions: [] } })),
      ]);
      const fetchedMatches: Match[] = matchRes.data.matches;
      setMatches(fetchedMatches);
      setPredictions(predRes.data.predictions);

      const lockedIds = fetchedMatches
        .filter((m) => m.homeTeam.id !== null && isMatchLocked(m))
        .map((m) => m.id);

      if (lockedIds.length > 0) {
        const results = await Promise.allSettled(
          lockedIds.map((id) =>
            api.get(`/predictions/match/${id}/summary`).then((r) => ({ id, data: r.data as PredictionSummary }))
          )
        );
        const map: Record<number, PredictionSummary> = {};
        results.forEach((r) => { if (r.status === 'fulfilled') map[r.value.id] = r.value.data; });
        setSummaries(map);
      }
    } catch {
      setError('No se pudieron cargar los partidos del día');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get('/ranking/daily-stats')
      .then((r) => setDailyStats(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => { loadData(selectedDate); }, [selectedDate, loadData]);

  const predictionMap = Object.fromEntries(predictions.map((p) => [p.match_id, p]));

  const handlePredictionSaved = (pred: Prediction) => {
    setPredictions((prev) => {
      const idx = prev.findIndex((p) => p.match_id === pred.match_id);
      if (idx >= 0) { const u = [...prev]; u[idx] = pred; return u; }
      return [...prev, pred];
    });
  };

  const navigateDate = (delta: number) => {
    setSelectedDate((d) => addDays(d, delta));
    setSearchQuery('');
  };

  const filteredMatches = matches.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.homeTeam.name?.toLowerCase().includes(q) ||
      m.homeTeam.tla?.toLowerCase().includes(q) ||
      m.awayTeam.name?.toLowerCase().includes(q) ||
      m.awayTeam.tla?.toLowerCase().includes(q)
    );
  });

  return (
    <Box maxWidth={700} mx="auto">
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, letterSpacing: '-0.5px' }}>
          <SportsSoccerIcon color="secondary" /> Hoy en el Mundial
        </Typography>
      </Box>

      <DailyStatsSection stats={dailyStats} />

      {/* Selector de fecha */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1,
        bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <IconButton size="small" onClick={() => navigateDate(-1)}><ChevronLeftIcon /></IconButton>
        <Typography variant="body2" fontWeight={700} sx={{ flex: 1, textAlign: 'center', textTransform: 'capitalize' }}>
          {formatDateLabel(selectedDate)}
          {selectedDate !== todayArgentina() && (
            <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>
              ({selectedDate})
            </Typography>
          )}
        </Typography>
        <IconButton size="small" onClick={() => navigateDate(1)}><ChevronRightIcon /></IconButton>
        {selectedDate !== todayArgentina() && (
          <Button size="small" onClick={() => setSelectedDate(todayArgentina())} sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}>
            Hoy
          </Button>
        )}
      </Box>

      {/* Buscador */}
      <TextField
        size="small"
        placeholder="Buscar equipo..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{ startAdornment: <SportsSoccerIcon sx={{ fontSize: 18, mr: 0.75, color: 'text.disabled' }} /> }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={130} sx={{ mb: 1.5, borderRadius: 2 }} />
        ))
      ) : filteredMatches.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            {searchQuery
              ? `No hay partidos que coincidan con "${searchQuery}"`
              : `No hay partidos programados para ${formatDateLabel(selectedDate).toLowerCase()}`
            }
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 1.5 }}>
            <Chip
              label={`${filteredMatches.length} partido${filteredMatches.length !== 1 ? 's' : ''}`}
              size="small" variant="outlined" sx={{ fontSize: '0.72rem' }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictionMap[match.id]}
              summary={summaries[match.id]}
              onPredict={setPredictMatch}
              onViewOthers={(m) => { setOthersMatch(m); setOthersOpen(true); }}
            />
          ))}
        </>
      )}

      <PredictDialog
        match={predictMatch}
        existing={predictMatch ? predictionMap[predictMatch.id] : undefined}
        open={Boolean(predictMatch)}
        onClose={() => setPredictMatch(null)}
        onSaved={handlePredictionSaved}
      />

      <OthersDialog
        match={othersMatch}
        open={othersOpen}
        onClose={() => setOthersOpen(false)}
      />
    </Box>
  );
}
