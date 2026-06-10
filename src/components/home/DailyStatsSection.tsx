import { Box, Typography, Tooltip, Avatar } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { DailyStats } from './types';

export default function DailyStatsSection({ stats }: { stats: DailyStats | null }) {
  if (!stats || (!stats.exactHits.length && !stats.top3.length)) return null;

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {/* Aciertos exactos de ayer */}
      {stats.exactHits.length > 0 && (
        <Box sx={{
          flex: 1, minWidth: 200, p: 1.5, borderRadius: 2,
          bgcolor: 'rgba(76, 175, 80, 0.08)',
          border: '1px solid rgba(76, 175, 80, 0.2)',
        }}>
          <Typography variant="caption" color="success.light" fontWeight={700}
            sx={{ letterSpacing: 1, textTransform: 'uppercase', display: 'block' }}>
            🎯 Aciertos del día
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
            Marcador exacto ayer
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {stats.exactHits.map((hit, i) => (
              <Tooltip
                key={`${hit.username}-${i}`}
                arrow
                title={
                  <Box>
                    <Typography variant="caption" display="block" fontWeight={700}>
                      {hit.home_team_name} {hit.actual_home} — {hit.actual_away} {hit.away_team_name}
                    </Typography>
                    <Typography variant="caption" color="success.light">
                      ✓ Pronóstico: {hit.predicted_home_score} — {hit.predicted_away_score}
                    </Typography>
                  </Box>
                }
              >
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'default',
                  bgcolor: 'rgba(76, 175, 80, 0.12)', borderRadius: 4, px: 1, py: 0.25,
                  border: '1px solid rgba(76, 175, 80, 0.25)',
                  '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.22)' },
                  transition: 'background 0.15s',
                }}>
                  <Avatar src={hit.avatar_url ?? undefined} sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'success.dark' }}>
                    {hit.username[0].toUpperCase()}
                  </Avatar>
                  <Typography variant="caption" fontWeight={600} color="success.light">{hit.username}</Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}

      {/* Top 3 de ayer */}
      {stats.top3.length > 0 && (
        <Box sx={{
          flex: 1, minWidth: 180, p: 1.5, borderRadius: 2,
          bgcolor: 'rgba(255, 214, 0, 0.06)',
          border: '1px solid rgba(255, 214, 0, 0.18)',
        }}>
          <Typography variant="caption" color="secondary.light" fontWeight={700}
            sx={{ letterSpacing: 1, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EmojiEventsIcon sx={{ fontSize: 14 }} /> Top 3 de ayer
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
            Más puntos el día anterior
          </Typography>
          {stats.top3.map((user, idx) => (
            <Box key={user.username} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{ fontSize: 14, lineHeight: 1, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
              </Typography>
              <Avatar src={user.avatar_url ?? undefined} sx={{ width: 22, height: 22, fontSize: 10, bgcolor: 'secondary.dark' }}>
                {user.username[0].toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ flex: 1 }} noWrap>{user.username}</Typography>
              <Typography variant="body2" fontWeight={700} color="secondary.main">+{user.daily_points}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
