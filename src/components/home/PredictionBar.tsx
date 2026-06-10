import { Box, Typography } from '@mui/material';
import { PredictionSummary, Team } from './types';

interface Props {
  summary: PredictionSummary;
  homeTeam: Team;
  awayTeam: Team;
}

export default function PredictionBar({ summary, homeTeam, awayTeam }: Props) {
  if (summary.total === 0) {
    return <Typography variant="caption" color="text.disabled">Sin pronósticos aún</Typography>;
  }

  return (
    <Box sx={{ width: '100%', mt: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {homeTeam.crest && <img src={homeTeam.crest} alt="" width={14} height={14} style={{ objectFit: 'contain' }} />}
          <Typography variant="caption" color="text.secondary" fontWeight={600}>{summary.homeWinPct}%</Typography>
        </Box>
        <Typography variant="caption" color="text.disabled">{summary.drawPct}% empate</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>{summary.awayWinPct}%</Typography>
          {awayTeam.crest && <img src={awayTeam.crest} alt="" width={14} height={14} style={{ objectFit: 'contain' }} />}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.06)' }}>
        <Box sx={{ width: `${summary.homeWinPct}%`, bgcolor: 'primary.main', transition: 'width 0.4s' }} />
        <Box sx={{ width: `${summary.drawPct}%`, bgcolor: 'rgba(255,255,255,0.25)', transition: 'width 0.4s' }} />
        <Box sx={{ width: `${summary.awayWinPct}%`, bgcolor: 'secondary.main', transition: 'width 0.4s' }} />
      </Box>
      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block', textAlign: 'center' }}>
        {summary.total} pronóstico{summary.total !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );
}
