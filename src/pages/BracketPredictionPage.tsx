import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Alert, Button, CircularProgress,
  Autocomplete, TextField, Chip, Snackbar, Grid,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Team {
  id: number;
  name: string;
  short_name: string;
  tla: string;
  crest_url: string;
  group_name: string;
}

// â”€â”€ Sub-componentes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TeamAutocomplete({
  label,
  value,
  onChange,
  options,
  disabledIds,
  disabled,
  color,
}: {
  label: string;
  value: Team | null;
  onChange: (t: Team | null) => void;
  options: Team[];
  disabledIds: Set<number>;
  disabled: boolean;
  color?: 'primary' | 'secondary' | 'warning';
}) {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, v) => onChange(v)}
      disabled={disabled}
      getOptionLabel={(o) => `${o.tla ? o.tla + ' - ' : ''}${o.name}`}
      getOptionDisabled={(o) => disabledIds.has(o.id) && o.id !== value?.id}
      groupBy={(o) => o.group_name ? `Grupo ${o.group_name.replace('GROUP_', '')}` : 'Sin grupo'}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ gap: 1 }}>
          {option.crest_url && (
            <img src={option.crest_url} alt="" width={22} height={22} style={{ objectFit: 'contain', marginRight: 8 }} />
          )}
          <Box>
            <Typography variant="body2" component="span" fontWeight={600}>{option.tla}</Typography>
            <Typography variant="body2" component="span" color="text.secondary"> {option.name}</Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          color={color}
          InputProps={{
            ...params.InputProps,
            startAdornment: value?.crest_url ? (
              <>
                <img src={value.crest_url} alt="" width={18} height={18} style={{ objectFit: 'contain', marginRight: 4 }} />
                {params.InputProps.startAdornment}
              </>
            ) : params.InputProps.startAdornment,
          }}
        />
      )}
      noOptionsText="No se encontró el equipo"
    />
  );
}

// â”€â”€ Página principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function BracketPredictionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  // 4 semifinalistas (sin distinción de llave)
  const [sf1, setSf1] = useState<Team | null>(null);
  const [sf2, setSf2] = useState<Team | null>(null);
  const [sf3, setSf3] = useState<Team | null>(null);
  const [sf4, setSf4] = useState<Team | null>(null);

  // 2 finalistas
  const [finalist1, setFinalist1] = useState<Team | null>(null);
  const [finalist2, setFinalist2] = useState<Team | null>(null);

  // Campeón
  const [champion, setChampion] = useState<Team | null>(null);

  // â”€â”€ Handlers con cascada hacia abajo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSf1Change = useCallback((t: Team | null) => {
    setSf1(t); setFinalist1(null); setFinalist2(null); setChampion(null);
  }, []);
  const handleSf2Change = useCallback((t: Team | null) => {
    setSf2(t); setFinalist1(null); setFinalist2(null); setChampion(null);
  }, []);
  const handleSf3Change = useCallback((t: Team | null) => {
    setSf3(t); setFinalist1(null); setFinalist2(null); setChampion(null);
  }, []);
  const handleSf4Change = useCallback((t: Team | null) => {
    setSf4(t); setFinalist1(null); setFinalist2(null); setChampion(null);
  }, []);
  const handleFinalist1Change = useCallback((t: Team | null) => {
    setFinalist1(t); setChampion(null);
  }, []);
  const handleFinalist2Change = useCallback((t: Team | null) => {
    setFinalist2(t); setChampion(null);
  }, []);

  // â”€â”€ Carga inicial â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    (async () => {
      try {
        const [teamsRes, predRes] = await Promise.all([
          api.get('/teams'),
          api.get('/bracket-predictions/my'),
        ]);

        const loadedTeams: Team[] = teamsRes.data.teams;
        setTeams(loadedTeams);
        setLocked(predRes.data.locked);

        const pred = predRes.data.prediction;
        if (pred) {
          const find = (id: number | null) => (id ? loadedTeams.find((t) => t.id === id) ?? null : null);
          setSf1(find(pred.sf1_id));
          setSf2(find(pred.sf2_id));
          setSf3(find(pred.sf3_id));
          setSf4(find(pred.sf4_id));
          setFinalist1(find(pred.finalist1_id));
          setFinalist2(find(pred.finalist2_id));
          setChampion(find(pred.champion_id));
        }
      } catch {
        setFetchError('No se pudieron cargar los datos. Intentá de nuevo.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  // â”€â”€ IDs ya elegidos (para deshabilitar duplicados) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sfSelected = [sf1, sf2, sf3, sf4].filter(Boolean) as Team[];
  const disabledForSf1 = new Set(sfSelected.filter(t => t.id !== sf1?.id).map(t => t.id));
  const disabledForSf2 = new Set(sfSelected.filter(t => t.id !== sf2?.id).map(t => t.id));
  const disabledForSf3 = new Set(sfSelected.filter(t => t.id !== sf3?.id).map(t => t.id));
  const disabledForSf4 = new Set(sfSelected.filter(t => t.id !== sf4?.id).map(t => t.id));

  // Finalistas: opciones = los 4 SF elegidos; se excluyen entre sí
  const finalistOptions = sfSelected;
  const finalist1Disabled = new Set(finalist2 ? [finalist2.id] : []);
  const finalist2Disabled = new Set(finalist1 ? [finalist1.id] : []);

  // Campeón: solo entre los 2 finalistas
  const championOptions = [finalist1, finalist2].filter(Boolean) as Team[];

  const sfComplete = !!(sf1 && sf2 && sf3 && sf4);
  const finalistsComplete = !!(sfComplete && finalist1 && finalist2);
  const isComplete = !!(finalistsComplete && champion);

  // â”€â”€ Guardar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSave = async () => {
    if (!isComplete) return;
    setSaving(true);
    setSaveError('');
    try {
      await api.post('/bracket-predictions', {
        sf1Id: sf1!.id,
        sf2Id: sf2!.id,
        sf3Id: sf3!.id,
        sf4Id: sf4!.id,
        finalist1Id: finalist1!.id,
        finalist2Id: finalist2!.id,
        championId: champion!.id,
      });
      setSuccessOpen(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSaveError(msg || 'Error al guardar el pronóstico');
    } finally {
      setSaving(false);
    }
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={820} mx="auto">
      {/* Encabezado */}
      <Typography variant="h5" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEventsIcon color="secondary" /> Pronóstico de Fase Final
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Elegí los 4 equipos que llegan a semifinales (tras dieciseisavos, octavos y cuartos), luego los 2 finalistas y el campeón.
        Se bloquea CUANDO TERMINEN TODOS LOS PARTIDOS DE LA JORNADA 2 DE FASE DE GRUPOS.
      </Typography>

      {/* Banner de bloqueo */}
      {locked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2 }}>
          La fase eliminatoria está demasiado próxima. Tu pronóstico está bloqueado.
        </Alert>
      )}

      {/* Info de puntos */}
      <Card sx={{ mb: 2.5, bgcolor: 'rgba(21,101,192,0.12)', border: '1px solid rgba(21,101,192,0.25)' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 4 }, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              {'\u26BD'} Semifinalista correcto <strong style={{ color: '#42A5F5' }}>+50 pts</strong> c/u
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {'🏆'} Finalista correcto <strong style={{ color: '#42A5F5' }}>+100 pts</strong> c/u
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {'👑'} Campeón correcto <strong style={{ color: '#FFD600' }}>+200 pts</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}
      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      {/* â”€â”€ Semifinalistas â”€â”€ */}
      <Card sx={{ mb: 2, borderTop: '3px solid #1565C0' }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#42A5F5', letterSpacing: 1, textTransform: 'uppercase' }}>
            Semifinales — elegí los 4 equipos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TeamAutocomplete label="Semifinalista 1" value={sf1} onChange={handleSf1Change}
                options={teams} disabledIds={disabledForSf1} disabled={locked} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TeamAutocomplete label="Semifinalista 2" value={sf2} onChange={handleSf2Change}
                options={teams} disabledIds={disabledForSf2} disabled={locked} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TeamAutocomplete label="Semifinalista 3" value={sf3} onChange={handleSf3Change}
                options={teams} disabledIds={disabledForSf3} disabled={locked} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TeamAutocomplete label="Semifinalista 4" value={sf4} onChange={handleSf4Change}
                options={teams} disabledIds={disabledForSf4} disabled={locked} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
        <KeyboardArrowDownIcon sx={{ color: sfComplete ? 'text.secondary' : 'text.disabled', fontSize: 36 }} />
      </Box>

      {/* â”€â”€ Finalistas â”€â”€ */}
      <Card sx={{ mb: 2, borderTop: '3px solid #7B1FA2', opacity: sfComplete ? 1 : 0.4, transition: 'opacity 0.2s' }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#CE93D8', letterSpacing: 1, textTransform: 'uppercase' }}>
            Final — ¿quiénes llegan a la final?
          </Typography>
          {sfComplete ? (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TeamAutocomplete label="Finalista 1" value={finalist1} onChange={handleFinalist1Change}
                  options={finalistOptions} disabledIds={finalist1Disabled} disabled={locked} color="secondary" />
              </Grid>
              <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.disabled">vs</Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <TeamAutocomplete label="Finalista 2" value={finalist2} onChange={handleFinalist2Change}
                  options={finalistOptions} disabledIds={finalist2Disabled} disabled={locked} color="secondary" />
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 1 }}>
              Primero elegí los 4 semifinalistas.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
        <KeyboardArrowDownIcon sx={{ color: finalistsComplete ? 'text.secondary' : 'text.disabled', fontSize: 36 }} />
      </Box>

      {/* â”€â”€ Campeón â”€â”€ */}
      <Card sx={{ mb: 2, borderTop: '3px solid #FFD600', bgcolor: 'rgba(255,214,0,0.04)', opacity: finalistsComplete ? 1 : 0.4, transition: 'opacity 0.2s' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip label="CAMPEÓN" size="small" color="warning" sx={{ fontWeight: 700 }} />
            <EmojiEventsIcon sx={{ color: '#FFD600', fontSize: 20 }} />
          </Box>
          {finalistsComplete ? (
            <>
              <TeamAutocomplete
                label="¿Quién va a ganar el Mundial 2026?"
                value={champion}
                onChange={setChampion}
                options={championOptions}
                disabledIds={new Set()}
                disabled={locked}
                color="warning"
              />
              {champion && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,214,0,0.08)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                  {champion.crest_url && (
                    <img src={champion.crest_url} alt="" width={52} height={52} style={{ objectFit: 'contain' }} />
                  )}
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="secondary.main">
                      {'🏆'} {champion.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Tu campeón del Mundial 2026</Typography>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 1 }}>
              Primero elegí los dos finalistas.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Botón guardar */}
      {!locked && (
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleSave}
          disabled={!isComplete || saving}
          sx={{ mb: 3 }}
        >
          {saving
            ? <CircularProgress size={22} color="inherit" />
            : isComplete
              ? 'Guardar pronóstico'
              : 'Completá todos los campos para guardar'}
        </Button>
      )}

      <Snackbar
        open={successOpen}
        autoHideDuration={3500}
        onClose={() => setSuccessOpen(false)}
        message="¡Pronóstico guardado!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
