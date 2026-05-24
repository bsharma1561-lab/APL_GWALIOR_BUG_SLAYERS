/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CricketEvent {
  over: string;            // e.g. "15.2" or "19.6"
  batsman: string;         // e.g. "Virat Kohli"
  bowler: string;          // e.g. "Mitchell Starc"
  runs: number;            // 0, 1, 2, 3, 4, 6
  isExtra: boolean;        // e.g. wide, no-ball
  extraType?: 'wide' | 'no-ball' | 'leg-bye' | 'none';
  shotType?: string;       // e.g. "cover drive", "slog sweep", "pull shot"
  wicket: boolean;         // true/false
  wicketType?: 'caught' | 'bowled' | 'lbw' | 'run out' | 'stumped' | 'none';
  batsmanMilestone?: 'none' | '50' | '100' | 'custom';
  milestoneDetails?: string;
  matchFormat: 'T20' | 'ODI' | 'Test';
  requiredRunRate?: number;
  currentRunRate: number;
  score: string;           // e.g. "145/3"
  wicketsLeft: number;     // e.g. 7
  oversLeft?: number;
  targetRuns?: number;
  rivalryContext?: string; // e.g. "India vs Pakistan clash" or "IPL El Clasico"
  matchSituation?: string; // e.g. "Need 12 runs off 4 balls"
}

export type CommentaryStyle = 
  | 'professional' 
  | 'ipl_excited' 
  | 'hindi' 
  | 'hinglish' 
  | 'radio' 
  | 'funny_meme';

export interface CommentaryRequest {
  event: CricketEvent;
  style: CommentaryStyle;
}

export interface CommentaryResponse {
  commentary: string;
  excitementScore: number; // 1 to 10
  keyPhrases: string[];
  tone: string;           // E.g., "Ecstatic", "Tense", "Calculated"
  commentatorPersona: string;
  matchAnalysisSimulated?: string;
}

export interface MatchScenario {
  id: string;
  title: string;
  description: string;
  battingTeam: string;
  bowlingTeam: string;
  batsman: string;
  bowler: string;
  runsNeeded?: number;
  ballsRemaining?: number;
  wicketsLeft: number;
  baseScore: string;
  currentOver: number;
  matchFormat: 'T20' | 'ODI' | 'Test';
  rivalryContext: string;
  requiredRunRate?: number;
}
