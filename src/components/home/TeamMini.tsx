import { Box, Typography } from '@mui/material';
import { Team } from './types';

export default function TeamMini({ team }: { team: Team }) {
  if (!team.id) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <Box sx={{
          width: 32, height: 32, border: '2px dashed rgba(255,255,255,0.15)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography color="text.disabled" fontSize={16}>?</Typography>
        </Box>
        <Typography variant="caption" color="text.disabled" textAlign="center" sx={{ mt: 0.5 }} noWrap>
          Por definir
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
      {team.crest
        ? <img src={team.crest} alt={team.name ?? ''} width={32} height={32} style={{ objectFit: 'contain' }} />
        : <Box sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
      }
      <Typography variant="caption" fontWeight={600} textAlign="center" sx={{ mt: 0.5 }} noWrap>
        {team.tla || team.shortName || team.name}
      </Typography>
    </Box>
  );
}
