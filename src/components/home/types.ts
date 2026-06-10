export interface Team {
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  matchday: number | null;
  venue: string | null;
  homeTeam: Team;
  awayTeam: Team;
  score: { home: number | null; away: number | null };
}

export interface Prediction {
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
}

export interface PredictionSummary {
  total: number;
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
}

export interface OtherPrediction {
  username: string;
  avatar_url: string | null;
  predicted_home_score: number;
  predicted_away_score: number;
}

export interface ExactHit {
  username: string;
  avatar_url: string | null;
  predicted_home_score: number;
  predicted_away_score: number;
  actual_home: number;
  actual_away: number;
  home_team_name: string;
  home_team_crest: string | null;
  away_team_name: string;
  away_team_crest: string | null;
  utc_date: string;
}

export interface Top3User {
  username: string;
  avatar_url: string | null;
  daily_points: number;
}

export interface DailyStats {
  exactHits: ExactHit[];
  top3: Top3User[];
}
