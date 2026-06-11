import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, Skeleton, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Pagination,
} from '@mui/material';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

interface RankEntry {
  id: string;
  username: string;
  avatar_url: string;
  total_points: number;
  exact_results: number;
  correct_results: number;
  total_predictions: number;
  rank: number;
  lucky_team_tla?: string;
  lucky_team_crest?: string;
  lucky_team_name?: string;
}

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function RankingPage() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/ranking?page=${page}&limit=20`)
      .then((res) => {
        setRanking(res.data.ranking);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch(() => setError('No se pudo cargar el ranking'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Box maxWidth={700} mx="auto">
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LeaderboardIcon color="secondary" /> Ranking Global
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Top 3 en cards */}
      {!loading && ranking.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', pb: 1 }}>
          {ranking.slice(0, 3).map((entry) => (
            <Card
              key={entry.id}
              sx={{
                flex: '0 0 auto',
                minWidth: 140,
                textAlign: 'center',
                border: `2px solid ${MEDAL_COLORS[entry.rank - 1] || 'transparent'}`,
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <EmojiEventsIcon sx={{ color: MEDAL_COLORS[entry.rank - 1], fontSize: 28 }} />
                <Avatar
                  src={entry.avatar_url}
                  sx={{ width: 44, height: 44, mx: 'auto', mt: 0.5, bgcolor: 'primary.main' }}
                >
                  {entry.username[0].toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }} noWrap>
                  {entry.username}
                </Typography>
                <Typography variant="h6" color="secondary.main" fontWeight={700}>
                  {entry.total_points} pts
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Jugador</TableCell>
              <TableCell align="right">Pts</TableCell>
              <TableCell align="right">
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>⚡ Exactos</Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>⚡</Box>
              </TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Resultados</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton variant="text" height={40} />
                    </TableCell>
                  </TableRow>
                ))
              : ranking.map((entry) => (
                  <TableRow
                    key={entry.id}
                    sx={{
                      bgcolor: entry.id === user?.id ? 'rgba(21, 101, 192, 0.15)' : 'transparent',
                    }}
                  >
                    <TableCell>
                      <Typography
                        fontWeight={entry.rank <= 3 ? 700 : 400}
                        sx={{ color: entry.rank <= 3 ? MEDAL_COLORS[entry.rank - 1] : 'text.primary' }}
                      >
                        {entry.rank}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={entry.avatar_url}
                          sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}
                        >
                          {entry.username[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" fontWeight={entry.id === user?.id ? 700 : 400} noWrap>
                              {entry.username}
                            </Typography>
                            {entry.id === user?.id && (
                              <Chip label="vos" size="small" color="primary" sx={{ height: 16 }} />
                            )}
                          </Box>
                          {entry.lucky_team_crest && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <img
                                src={entry.lucky_team_crest}
                                alt={entry.lucky_team_tla}
                                width={14}
                                height={14}
                                style={{ objectFit: 'contain' }}
                              />
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                                {entry.lucky_team_tla}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700} color="secondary.main">
                        {entry.total_points}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      ⚡ {entry.exact_results}
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      ✓ {entry.correct_results}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
