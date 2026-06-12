import { Box, Typography, Tooltip, Avatar } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { DailyStats, ExactHit } from './types';

interface MatchGroup {
  key: string;
  home_team_name: string;
  home_team_crest: string | null;
  away_team_name: string;
  away_team_crest: string | null;
  actual_home: number;
  actual_away: number;
  users: Pick<ExactHit, 'username' | 'avatar_url'>[];
}

function groupHitsByMatch(hits: ExactHit[]): MatchGroup[] {
  const map = new Map<string, MatchGroup>();
  for (const hit of hits) {
    const key = `${hit.home_team_name}-${hit.away_team_name}-${hit.actual_home}-${hit.actual_away}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        home_team_name: hit.home_team_name,
        home_team_crest: hit.home_team_crest,
        away_team_name: hit.away_team_name,
        away_team_crest: hit.away_team_crest,
        actual_home: hit.actual_home,
        actual_away: hit.actual_away,
        users: [],
      });
    }
    map.get(key)!.users.push({ username: hit.username, avatar_url: hit.avatar_url });
  }
  return Array.from(map.values());
}

export default function DailyStatsSection({ stats }: { stats: DailyStats | null }) {
  if (!stats || (!stats.exactHits.length && !stats.top3.length)) return null;

  const matchGroups = groupHitsByMatch(stats.exactHits);

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {/* Aciertos exactos de ayer */}
      {matchGroups.length > 0 && (
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {matchGroups.map((group) => (
              <Tooltip
                key={group.key}
                arrow
                enterTouchDelay={0}
                leaveTouchDelay={3000}
                title={
                  <Box>
                    <Typography variant="caption" display="block" fontWeight={700} sx={{ mb: 0.5 }}>
                      Acertaron el marcador exacto:
                    </Typography>
                    {group.users.map((u) => (
                      <Box key={u.username} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                        <Avatar src={u.avatar_url ?? undefined} sx={{ width: 16, height: 16, fontSize: 9, bgcolor: 'success.dark' }}>
                          {u.username[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" color="success.light">{u.username}</Typography>
                      </Box>
                    ))}
                  </Box>
                }
              >
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1, cursor: 'default',
                  bgcolor: 'rgba(76, 175, 80, 0.10)', borderRadius: 2, px: 1.25, py: 0.5,
                  border: '1px solid rgba(76, 175, 80, 0.25)',
                  '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.20)' },
                  transition: 'background 0.15s',
                }}>
                  {group.home_team_crest && (
                    <Box component="img" src={group.home_team_crest} alt={group.home_team_name}
                      sx={{ width: 18, height: 18, objectFit: 'contain' }} />
                  )}
                  <Typography variant="caption" fontWeight={600} color="text.primary" noWrap sx={{ maxWidth: 80 }}>
                    {group.home_team_name}
                  </Typography>
                  <Typography variant="caption" fontWeight={800} color="success.light" sx={{ mx: 0.25 }}>
                    {group.actual_home} — {group.actual_away}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="text.primary" noWrap sx={{ maxWidth: 80 }}>
                    {group.away_team_name}
                  </Typography>
                  {group.away_team_crest && (
                    <Box component="img" src={group.away_team_crest} alt={group.away_team_name}
                      sx={{ width: 18, height: 18, objectFit: 'contain' }} />
                  )}
                  <Box sx={{ display: 'flex', ml: 0.5 }}>
                    {group.users.slice(0, 3).map((u) => (
                      <Avatar key={u.username} src={u.avatar_url ?? undefined}
                        sx={{ width: 18, height: 18, fontSize: 9, bgcolor: 'success.dark', ml: -0.5, border: '1px solid rgba(76,175,80,0.4)' }}>
                        {u.username[0].toUpperCase()}
                      </Avatar>
                    ))}
                    {group.users.length > 3 && (
                      <Avatar sx={{ width: 18, height: 18, fontSize: 9, bgcolor: 'success.dark', ml: -0.5, border: '1px solid rgba(76,175,80,0.4)' }}>
                        +{group.users.length - 3}
                      </Avatar>
                    )}
                  </Box>
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
