/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_COMMENTATOR_INSTRUCTION, getPromptForEvent } from "./prompts/commentary_prompts";
import { CricketEvent, CommentaryStyle, CommentaryResponse, MatchScenario } from "./src/types";

// Load Environment Variables safely
dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// Initialize Gemini SDK with custom telemetry headers
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Create standard HTTP server so we can hook WebSockets and Express endpoints together
const server = http.createServer(app);

// Keep track of connected WebSockets
const wss = new WebSocketServer({ noServer: true });
let wsClients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  wsClients.add(ws);
  // Send initial hello
  ws.send(JSON.stringify({ type: "connection", message: "Connected to Cricket Live Stream" }));
  
  ws.on("close", () => {
    wsClients.delete(ws);
  });
});

// Keep track of SSE Clients
let sseClients: Response[] = [];

// Helper to broadcast streaming commentary to all real-time listeners (WS + SSE)
function broadcastRealtimeCommentary(data: { event: CricketEvent; commentary: CommentaryResponse }) {
  // 1. Broadcast over SSE
  const ssePayload = `event: live-commentary\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(ssePayload);
    } catch (err) {
      console.error("Error writing to SSE client:", err);
    }
  });

  // 2. Broadcast over WebSockets
  const wsPayload = JSON.stringify({
    type: "live-commentary",
    data: data
  });
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(wsPayload);
      } catch (err) {
        console.error("Error sending to WS client:", err);
      }
    }
  });
}

// Global Match Scenario simulated database & default setups
const SCENARIOS: MatchScenario[] = [
  {
    id: "ipl_final",
    title: "IPL Final Sizzler (MI vs CSK)",
    description: "CSK needs 18 runs off the final over (6 balls). Mahendra Singh Dhoni is on strike, Ravindra Jadeja is non-striker. Lasith Malinga has the ball.",
    battingTeam: "Chennai Super Kings",
    bowlingTeam: "Mumbai Indians",
    batsman: "MS Dhoni",
    bowler: "Lasith Malinga",
    runsNeeded: 18,
    ballsRemaining: 6,
    wicketsLeft: 3,
    baseScore: "182/7",
    currentOver: 19,
    matchFormat: "T20",
    rivalryContext: "IPL El Clasico Elation"
  },
  {
    id: "rivalry_clash",
    title: "India vs Pakistan Epic Finish",
    description: "India requires 8 runs off 3 balls. Virat Kohli is batting like a beast at 82*. Haris Rauf is running in with roaring crowds at a packed MCG stadium.",
    battingTeam: "India",
    bowlingTeam: "Pakistan",
    batsman: "Virat Kohli",
    bowler: "Haris Rauf",
    runsNeeded: 8,
    ballsRemaining: 3,
    wicketsLeft: 4,
    baseScore: "152/6",
    currentOver: 19,
    matchFormat: "T20",
    rivalryContext: "India vs Pakistan High-Voltage T20 World Cup Clash"
  },
  {
    id: "test_cliffhanger",
    title: "Lord's Test Day 5 Thriller",
    description: "England needs 1 final wicket to win. Australia's tailenders Cummins and Lyon are battling out. James Anderson has the brand new ball.",
    battingTeam: "Australia",
    bowlingTeam: "England",
    batsman: "Pat Cummins",
    bowler: "James Anderson",
    runsNeeded: 14,
    ballsRemaining: 36, // 6 overs left on day 5 bowl-out
    wicketsLeft: 1,
    baseScore: "281/9",
    currentOver: 84,
    matchFormat: "Test",
    rivalryContext: "Ashes Ashes Ashes"
  }
];

// Memory state holders
let activeScenario: MatchScenario = { ...SCENARIOS[0] };
let currentScoreRuns = 182;
let currentWickets = 7;
let ballsInActiveOver = 0; // tracking ball-by-ball indexing (0 to 5)
let matchHistory: Array<{ event: CricketEvent; commentary: CommentaryResponse }> = [];

// Reset match state helper
function resetMatchToScenario(scenario: MatchScenario) {
  activeScenario = { ...scenario };
  const scoreParts = scenario.baseScore.split("/");
  currentScoreRuns = parseInt(scoreParts[0]) || 0;
  currentWickets = parseInt(scoreParts[1]) || 0;
  ballsInActiveOver = 0;
  matchHistory = [];
}

// Calculate the Excitement Score based on event attributes
function calculateExcitement(event: CricketEvent): number {
  let score = 2; // base score (dot or minor action)

  if (event.wicket) {
    score += 6; // Wickets are highly exciting!
  } else if (event.runs === 6) {
    score += 7; // Sixes are extremely high excitement!
  } else if (event.runs === 4) {
    score += 5; // Fours are beautiful highlights
  } else if (event.runs >= 2) {
    score += 2;
  }

  // Multiply based on pressure (run rates, death over context)
  if (event.matchSituation && event.matchSituation.toLowerCase().includes("need")) {
    score += 1;
  }
  
  if (event.batsmanMilestone && event.batsmanMilestone !== 'none') {
    score += 2; // Century / Half-century is massive!
  }

  // Bound it between 1 and 10
  return Math.max(1, Math.min(10, score));
}

// AI COMMENTARY PIPELINE
async function generateAICommentary(event: CricketEvent, style: CommentaryStyle): Promise<CommentaryResponse> {
  const eventJsonStr = JSON.stringify(event, null, 2);
  const prompt = getPromptForEvent(eventJsonStr, style);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_COMMENTATOR_INSTRUCTION,
        temperature: 0.85,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const resultObj: CommentaryResponse = JSON.parse(cleanedText);
    
    // Ensure excitement rating values are safe
    if (!resultObj.excitementScore) {
      resultObj.excitementScore = calculateExcitement(event);
    }
    
    return resultObj;
  } catch (err: any) {
    console.error("Gemini API call failed:", err);
    // Graceful fallback commentary in case of offline/lack of credentials
    return {
      commentary: `An extraordinary shot from ${event.batsman}! That ball went high into the sky and ${event.wicket ? 'finds the fielder!' : 'clears the line!'} The bowler ${event.bowler} looks on in disbelief!`,
      excitementScore: calculateExcitement(event),
      keyPhrases: ["cricket masterclass", "unbelievable moments"],
      tone: event.wicket ? "Incredible Shock" : "Rousing Excitement",
      commentatorPersona: "Standby Commentary Booth"
    };
  }
}

// API ENDPOINTS

// 1. GET match scenario & active values
const getMatchStateFn = (req: Request, res: Response) => {
  const currentOverFloat = `${activeScenario.currentOver}.${ballsInActiveOver}`;
  const overHistory = matchHistory.map(item => ({
    overNum: item.event.over,
    runs: item.event.runs,
    wicket: item.event.wicket,
    extra: item.event.isExtra
  }));

  // Win probability calculation engine
  let winChance = 50;
  if (activeScenario.runsNeeded !== undefined && activeScenario.ballsRemaining !== undefined) {
    const runs = activeScenario.runsNeeded;
    const balls = activeScenario.ballsRemaining;
    if (balls <= 0) {
      winChance = runs <= 0 ? 100 : 0;
    } else {
      const runRateReq = (runs / balls) * 6;
      if (runRateReq > 18) winChance = 5;
      else if (runRateReq > 12) winChance = 25;
      else if (runRateReq > 9) winChance = 45;
      else if (runRateReq < 4) winChance = 90;
      else winChance = 60;

      // Adjust for wickets count
      const wicketsFactor = activeScenario.wicketsLeft * 8;
      winChance = Math.max(2, Math.min(98, winChance + (wicketsFactor - 15)));
    }
  }

  res.json({
    activeScenario,
    matchInfo: {
      battingTeam: activeScenario.battingTeam,
      bowlingTeam: activeScenario.bowlingTeam,
      batsman: activeScenario.batsman,
      bowler: activeScenario.bowler,
      score: `${currentScoreRuns}/${currentWickets}`,
      overs: currentOverFloat,
      ballsRemaining: activeScenario.ballsRemaining,
      runsNeeded: activeScenario.runsNeeded,
      requiredRunRate: activeScenario.runsNeeded !== undefined && activeScenario.ballsRemaining !== undefined 
        ? parseFloat(((activeScenario.runsNeeded / activeScenario.ballsRemaining) * 6).toFixed(2)) 
        : activeScenario.requiredRunRate || 8.4,
      currentRunRate: parseFloat(((currentScoreRuns / (activeScenario.currentOver * 6 + ballsInActiveOver)) * 6).toFixed(2)) || 7.2,
      winProbability: winChance,
      matchFormat: activeScenario.matchFormat,
      wicketsLeft: activeScenario.wicketsLeft,
      rivalryContext: activeScenario.rivalryContext,
      situation: activeScenario.runsNeeded !== undefined && activeScenario.ballsRemaining !== undefined
        ? `CSK needs ${activeScenario.runsNeeded} off ${activeScenario.ballsRemaining} balls`
        : "Dynamic Match Progression"
    },
    history: matchHistory,
    overHistory: overHistory.slice(-6) // last 6 ball states for progress tracker
  });
};

app.get("/api/match-state", getMatchStateFn);
app.get("/match-state", getMatchStateFn);

// Reset Match State Endpoint
app.post("/api/match-state/reset", (req, res) => {
  const { scenarioId } = req.body;
  const targetScenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];
  resetMatchToScenario(targetScenario);
  res.json({ status: "success", message: "Match state reset", scenario: activeScenario });
});

// GET scenarios lists
app.get("/api/scenarios", (req, res) => {
  res.json(SCENARIOS);
});

// Real-time Event Streaming SSE Endpoint
const liveFeedSseFn = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Push clients to listener lists
  sseClients.push(res);
  
  // Heartbeat ping every 15s
  const intervalId = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 15000);

  req.on('close', () => {
    clearInterval(intervalId);
    sseClients = sseClients.filter(c => c !== res);
  });
};

app.get("/api/live-feed", liveFeedSseFn);
app.get("/live-feed", liveFeedSseFn);

// POST /api/generate-commentary
const generateCommentaryFn = async (req: Request, res: Response) => {
  const { runs, wicket, style, shotType, isExtra, extraType, batsmanMilestone, bowlerSelected, batsmanSelected } = req.body;
  const chosenStyle: CommentaryStyle = style || 'professional';

  // Construct dynamic ball event state
  const previousOverFloat = `${activeScenario.currentOver}.${ballsInActiveOver}`;
  
  // Update ball score counters
  let addedRuns = runs || 0;
  let addedWicket = wicket ? 1 : 0;

  // Increment ball counting logic
  ballsInActiveOver++;
  if (ballsInActiveOver >= 6) {
    ballsInActiveOver = 0;
    activeScenario.currentOver++;
  }

  // Adjust Scoreboard State variables
  currentScoreRuns += addedRuns;
  currentWickets += addedWicket;

  if (activeScenario.runsNeeded !== undefined) {
    activeScenario.runsNeeded = Math.max(0, activeScenario.runsNeeded - addedRuns);
  }
  if (activeScenario.ballsRemaining !== undefined) {
    activeScenario.ballsRemaining = Math.max(0, activeScenario.ballsRemaining - 1);
  }
  if (activeScenario.wicketsLeft !== undefined && wicket) {
    activeScenario.wicketsLeft = Math.max(0, activeScenario.wicketsLeft - 1);
  }

  const ballOutcome: CricketEvent = {
    over: previousOverFloat,
    batsman: batsmanSelected || activeScenario.batsman,
    bowler: bowlerSelected || activeScenario.bowler,
    runs: addedRuns,
    isExtra: !!isExtra,
    extraType: extraType || 'none',
    shotType: shotType || (wicket ? 'none' : 'forward defensive'),
    wicket: !!wicket,
    wicketType: wicket ? 'caught' : 'none',
    batsmanMilestone: batsmanMilestone || 'none',
    milestoneDetails: batsmanMilestone === '50' ? 'Half-century milestone' : batsmanMilestone === '100' ? 'Century milestone' : undefined,
    matchFormat: activeScenario.matchFormat,
    score: `${currentScoreRuns}/${currentWickets}`,
    requiredRunRate: activeScenario.runsNeeded !== undefined && activeScenario.ballsRemaining !== undefined
      ? parseFloat(((activeScenario.runsNeeded / activeScenario.ballsRemaining) * 6).toFixed(2))
      : undefined,
    currentRunRate: parseFloat(((currentScoreRuns / (activeScenario.currentOver * 6 + ballsInActiveOver)) * 6).toFixed(2)) || 7.2,
    wicketsLeft: activeScenario.wicketsLeft,
    rivalryContext: activeScenario.rivalryContext,
    matchSituation: activeScenario.runsNeeded !== undefined && activeScenario.ballsRemaining !== undefined
      ? `${activeScenario.battingTeam} needs ${activeScenario.runsNeeded} runs off ${activeScenario.ballsRemaining} deliveries!`
      : undefined
  };

  try {
    // Generate simulated commentary via Gemini LLM (or falling back safely)
    const commentaryResponse = await generateAICommentary(ballOutcome, chosenStyle);
    
    // Save to match history feeds
    const historyItem = { event: ballOutcome, commentary: commentaryResponse };
    matchHistory.unshift(historyItem); // insert at start of feed

    // Stream and publish updates in real-time (SSE and WebSockets)
    broadcastRealtimeCommentary(historyItem);

    res.json(commentaryResponse);
  } catch (error) {
    console.error("Failed generating live commentary:", error);
    res.status(500).json({ error: "Failed generating commentary from AI model." });
  }
};

app.post("/api/generate-commentary", generateCommentaryFn);
app.post("/generate-commentary", generateCommentaryFn);

// POST /api/generate-hindi-commentary
const generateHindiCommentaryFn = async (req: Request, res: Response) => {
  // Overrides standard style into hindi commentary and generates
  req.body.style = 'hindi';
  return generateCommentaryFn(req, res);
};

app.post("/api/generate-hindi-commentary", generateHindiCommentaryFn);
app.post("/generate-hindi-commentary", generateHindiCommentaryFn);

// Integrating Vite as middleware for full client-side hot serving in development
const serveViteAppAndListen = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Static folders compiled distribution
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind WebSocket server upgrading handler smoothly
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/live-websocket" || pathname === "/api/live-feed" || pathname === "/live-feed") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 Full-stack Commentary Server active on http://0.0.0.0:${PORT}`);
  });
};

serveViteAppAndListen();
