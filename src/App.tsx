/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  Tv, 
  Radio, 
  Smile, 
  Flame, 
  Check, 
  Loader2, 
  Sparkles, 
  Award, 
  BookOpen, 
  Layers, 
  Wifi, 
  User, 
  ChevronRight, 
  Heart,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CricketEvent, CommentaryStyle, CommentaryResponse, MatchScenario } from "./types";

const FALLBACK_SCENARIOS: MatchScenario[] = [
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
    ballsRemaining: 36,
    wicketsLeft: 1,
    baseScore: "281/9",
    currentOver: 84,
    matchFormat: "Test",
    rivalryContext: "Ashes Ashes Ashes"
  }
];

function generateLocalFallbackCommentary(
  batsman: string,
  bowler: string,
  runs: number,
  wicket: boolean,
  shotType: string,
  style: CommentaryStyle
): string {
  if (wicket) {
    if (style === "hindi") {
      return `अरे बाप रे! बड़ा विकेट! ${batsman} को ${bowler} ने पवेलियन का रास्ता दिखा दिया है। दर्शक बिल्कुल सन्न रह गए हैं! क्या लाजवाब गेंदबाजी है!`;
    }
    if (style === "hinglish") {
      return `Oh my god! Huge wicket! ${batsman} is OUT! ${bowler} is absolutely celebrating like crazy! Poora stadium shock mein chale gaya hai!`;
    }
    if (style === "funny_meme") {
      return `And... he is gone! ${batsman} tried to be a hero, but ending up looking like zero. Back to the pavilion, pack your bags!`;
    }
    if (style === "radio") {
      return `And that is out! A magnificent catch there in the deep. ${batsman} departs, and a quiet hush descends upon this historic ground. Beautifully bowled by ${bowler}.`;
    }
    return `OUT! Absolute disaster for the batting side! ${batsman} attempts a big shot but completely miscalculates, handing a simple catch. Excellent delivery from ${bowler}!`;
  }

  if (runs >= 6) {
    if (style === "hindi") {
      return `छक्का!!! शानदार शॉट! ${batsman} ने गेंद को हवाई यात्रा पर भेज दिया है - सीधे दर्शकों के बीच! क्या स्ट्रोक है!`;
    }
    if (style === "hinglish") {
      return `What a shot yaar! Sixer!!! ${batsman} ne poore power ke saath ball ko crowd mein de mara! Amazing helicopter style shot, beauty!`;
    }
    if (style === "funny_meme") {
      return `That ball is in orbit! Elon Musk is considering charging taxes on that one! What a massive six! 100 out of 10 for style.`;
    }
    if (style === "radio") {
      return `Ah, that's clean as a whistle! A sweet sound off the willow. Sent high and handsome over the long-off boundary for a six! Over to you in the studio.`;
    }
    return `SIX RUNS! Incredibly timed! ${batsman} stands tall and launches this ${shotType} miles over the ropes. The crowd goes wild!`;
  }

  if (runs >= 4) {
    if (style === "hindi") {
      return `चौका! खूबसूरत शॉट! ${batsman} ने गैप ढूंढा और गेंद बिजली की गति से सीमा रेखा पार कर गई!`;
    }
    if (style === "hinglish") {
      return `Four runs! Kya classy cover drive khela hai ${batsman} ne. Timed to absolute perfection!`;
    }
    if (style === "funny_meme") {
      return `Stop that, batsman! You are abusing the ball now. Four runs as it races at the speed of sound to the fence.`;
    }
    if (style === "radio") {
      return `A delicious stroke. Just a gentle push through the covers, but it has the legs to cross the boundary rope for four. Superb timing.`;
    }
    return `FOUR! Precision placement! ${batsman} plays a perfect ${shotType} finding the gap with supreme elegance.`;
  }

  if (runs > 0) {
    if (style === "hindi") {
      return `${batsman} ने हल्के हाथों से खेलकर 1 रन आसानी से पूरा कर लिया। दोनों बल्लेबाजों के बीच अच्छा तालमेल।`;
    }
    if (style === "hinglish") {
      return `Single mil gaya, rotation of strike is very important boss. Dhoni and Kohli run really well between the wickets.`;
    }
    return `${batsman} pushes it into the gap and scampers across for a quick single. Good rotation of strike.`;
  }

  if (style === "hindi") {
    return `कोई रन नहीं। बेहतरीन गेंदबाजी ${bowler} द्वारा। बल्लेबाज को बांधकर रखा है।`;
  }
  if (style === "hinglish") {
    return `Dot ball! Aur thoda pressure badhta hua batting team pe. Bowler is on fire today!`;
  }
  return `No run here as ${bowler} fires in a dot ball. Nice tight line.`;
}

function getPersonaName(style: CommentaryStyle): string {
  switch (style) {
    case "ipl_excited": return "Ravi Shastri (Excited Mode)";
    case "professional": return "Harsha Bhogle";
    case "hindi": return "Aakash Chopra (Hindi Feed)";
    case "hinglish": return "Navjot Sidhu (Fun Cocktails)";
    case "radio": return "Jonathan Agnew (TMS)";
    case "funny_meme": return "Meme Bot 4000";
    default: return "Standby Commentator";
  }
}

export default function App() {
  // Scenarios and State Management
  const [scenarios, setScenarios] = useState<MatchScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState("");
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const [commentaryFeed, setCommentaryFeed] = useState<Array<{ event: CricketEvent; commentary: CommentaryResponse }>>([]);
  const [overHistory, setOverHistory] = useState<any[]>([]);
  
  // Form submission states
  const [selectedStyle, setSelectedStyle] = useState<CommentaryStyle>("ipl_excited");
  const [customRuns, setCustomRuns] = useState<number>(4);
  const [isWicket, setIsWicket] = useState<boolean>(false);
  const [selectedShotType, setSelectedShotType] = useState<string>("cover drive");
  const [isExtra, setIsExtra] = useState<boolean>(false);
  const [extraType, setExtraType] = useState<'none' | 'wide' | 'no-ball' | 'leg-bye'>('none');
  const [milestone, setMilestone] = useState<'none' | '50' | '100'>('none');
  const [customBatsman, setCustomBatsman] = useState("");
  const [customBowler, setCustomBowler] = useState("");

  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamMethod, setStreamMethod] = useState<"WebSocket" | "SSE" | "Polling">("Polling");
  const [isMuted, setIsMuted] = useState(false);

  // Audio queue & currently playing commentary tracking
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // Refs for auto-scrolling & streaming triggers
  const feedEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  // Load scenarios & initial match state
  useEffect(() => {
    fetchScenarios();
    fetchMatchState();
    setupStreaming();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (sseRef.current) sseRef.current.close();
    };
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await fetch("/api/scenarios");
      const data = await res.json();
      setScenarios(data);
      if (data.length > 0) {
        setActiveScenarioId(data[0].id);
      }
    } catch (err) {
      console.warn("Failed fetching scenarios from server, using local fallbacks:", err);
      setScenarios(FALLBACK_SCENARIOS);
      setActiveScenarioId(FALLBACK_SCENARIOS[0].id);
    }
  };

  const fetchMatchState = async () => {
    try {
      const res = await fetch("/api/match-state");
      const data = await res.json();
      setMatchInfo(data.matchInfo);
      setCommentaryFeed(data.history);
      setOverHistory(data.overHistory || []);
      if (data.activeScenario) {
        setActiveScenarioId(data.activeScenario.id);
        setCustomBatsman(data.activeScenario.batsman);
        setCustomBowler(data.activeScenario.bowler);
      }
    } catch (err) {
      console.warn("Failed fetching match states from server, initiating client simulation fallback:", err);
      // Construct local fallback state if server is completely unavailable
      const currentScenario = FALLBACK_SCENARIOS.find(s => s.id === activeScenarioId) || FALLBACK_SCENARIOS[0];
      setMatchInfo((prevInfo: any) => {
        if (prevInfo) return prevInfo;
        return {
          battingTeam: currentScenario.battingTeam,
          bowlingTeam: currentScenario.bowlingTeam,
          batsman: currentScenario.batsman,
          bowler: currentScenario.bowler,
          score: currentScenario.baseScore,
          overs: `${currentScenario.currentOver}.0`,
          ballsRemaining: currentScenario.ballsRemaining || 6,
          runsNeeded: currentScenario.runsNeeded || 18,
          requiredRunRate: currentScenario.runsNeeded !== undefined && currentScenario.ballsRemaining !== undefined
            ? parseFloat(((currentScenario.runsNeeded / currentScenario.ballsRemaining) * 6).toFixed(2))
            : currentScenario.requiredRunRate || 18.0,
          currentRunRate: 7.2,
          winProbability: 50,
          matchFormat: currentScenario.matchFormat,
          wicketsLeft: currentScenario.wicketsLeft,
          rivalryContext: currentScenario.rivalryContext,
          situation: `${currentScenario.battingTeam} needs ${currentScenario.runsNeeded || 18} runs off ${currentScenario.ballsRemaining || 6} deliveries`
        };
      });
      setCustomBatsman(prev => prev || currentScenario.batsman);
      setCustomBowler(prev => prev || currentScenario.bowler);
    }
  };

  // Resilient real-time setup (WebSockets -> fallbacks to SSE -> redirects to manual polls)
  const setupStreaming = () => {
    const host = window.location.host;
    const wsUrl = `wss://${host}/live-websocket`;
    
    // 1. Try WebSocket
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStreamMethod("WebSocket");
        console.log("WebSocket stream connected successfully.");
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === "live-commentary") {
          const newData = payload.data;
          handleIncomingLiveCommentary(newData);
        }
      };

      ws.onerror = () => {
        console.log("WebSocket closed or failed. Initiating Server-Sent Events (SSE) stream fallback.");
        setupSSEFallback();
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch (e) {
      setupSSEFallback();
    }
  };

  const setupSSEFallback = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const sse = new EventSource("/api/live-feed");
      sseRef.current = sse;

      sse.onopen = () => {
        setIsConnected(true);
        setStreamMethod("SSE");
        console.log("SSE streaming fallbacks connected successfully.");
      };

      sse.addEventListener("live-commentary", (event: any) => {
        const data = JSON.parse(event.data);
        handleIncomingLiveCommentary(data);
      });

      sse.onerror = () => {
        console.log("SSE failed. Falling back to HTTP Polling triggers.");
        setStreamMethod("Polling");
        setIsConnected(false);
      };
    } catch (e) {
      setStreamMethod("Polling");
      setIsConnected(false);
    }
  };

  const handleIncomingLiveCommentary = (newData: { event: CricketEvent; commentary: CommentaryResponse }) => {
    setCommentaryFeed(prev => {
      // Avoid duplicate lines in feed
      const exists = prev.some(item => item.event.over === newData.event.over);
      if (exists) return prev;
      
      // Auto-speak incoming streaming commentaries in case they're new and NOT muted
      if (!isMuted) {
        speakCommentary(newData.commentary.commentary, newData.commentary.excitementScore, newData.event.over);
      }
      return [newData, ...prev];
    });

    // Refresh dynamic score indicators
    fetchMatchState();
  };

  // API Call to Reset Scenario match state
  const handleScenarioChange = async (scenarioId: string) => {
    try {
      const res = await fetch("/api/match-state/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId })
      });
      const data = await res.json();
      setActiveScenarioId(scenarioId);
      setMatchInfo(data.scenario);
      setCommentaryFeed([]);
      setOverHistory([]);
      
      // Reset form controls to current scenario profiles
      setCustomBatsman(data.scenario.batsman);
      setCustomBowler(data.scenario.bowler);
      
      // Re-fetch match state to calculate probabilities correctly
      fetchMatchState();
    } catch (err) {
      console.warn("Failed to reset scenario match on server, adapting with client-side state reset:", err);
      const targetScenario = FALLBACK_SCENARIOS.find(s => s.id === scenarioId) || FALLBACK_SCENARIOS[0];
      setActiveScenarioId(scenarioId);
      setMatchInfo({
        battingTeam: targetScenario.battingTeam,
        bowlingTeam: targetScenario.bowlingTeam,
        batsman: targetScenario.batsman,
        bowler: targetScenario.bowler,
        score: targetScenario.baseScore,
        overs: `${targetScenario.currentOver}.0`,
        ballsRemaining: targetScenario.ballsRemaining || 6,
        runsNeeded: targetScenario.runsNeeded || 18,
        requiredRunRate: targetScenario.runsNeeded !== undefined && targetScenario.ballsRemaining !== undefined
          ? parseFloat(((targetScenario.runsNeeded / targetScenario.ballsRemaining) * 6).toFixed(2))
          : targetScenario.requiredRunRate || 18.0,
        currentRunRate: 7.2,
        winProbability: 50,
        matchFormat: targetScenario.matchFormat,
        wicketsLeft: targetScenario.wicketsLeft,
        rivalryContext: targetScenario.rivalryContext,
        situation: `${targetScenario.battingTeam} needs ${targetScenario.runsNeeded || 18} runs off ${targetScenario.ballsRemaining || 6} deliveries`
      });
      setCommentaryFeed([]);
      setOverHistory([]);
      setCustomBatsman(targetScenario.batsman);
      setCustomBowler(targetScenario.bowler);
    }
  };

  // TTS browser vocalizer configuration
  const speakCommentary = (text: string, excitement: number, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    // Stop preceding voice lines if playing
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // High excitement speeds up speech, lower excitement keeps it normal
    utterance.rate = excitement >= 8 ? 1.15 : excitement >= 5 ? 1.0 : 0.92;
    utterance.pitch = excitement >= 8 ? 1.15 : excitement >= 5 ? 1.05 : 0.95;

    // Pick English or secondary speech synthesis voice profile
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Premium") || v.lang.startsWith("en-US"));
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    utterance.onstart = () => setCurrentlySpeakingId(id);
    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
    }
  };

  // Submit and simulate a ball event API call
  const triggerBallEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      runs: isWicket ? 0 : customRuns,
      wicket: isWicket,
      style: selectedStyle,
      shotType: selectedShotType,
      isExtra,
      extraType: isExtra ? extraType : 'none',
      batsmanMilestone: milestone,
      batsmanSelected: customBatsman,
      bowlerSelected: customBowler
    };

    try {
      const endpoint = selectedStyle === 'hindi' ? "/api/generate-hindi-commentary" : "/api/generate-commentary";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data: CommentaryResponse = await res.json();

      // Trigger standard manual feedback if in HTTP polling state
      if (streamMethod === "Polling") {
        const dummyEvent: CricketEvent = {
          over: matchInfo?.overs || "19.0",
          batsman: customBatsman || matchInfo?.batsman || "Batsman",
          bowler: customBowler || matchInfo?.bowler || "Bowler",
          runs: isWicket ? 0 : customRuns,
          isExtra,
          wicket: isWicket,
          score: matchInfo?.score || "180/7",
          currentRunRate: 7.2,
          wicketsLeft: matchInfo?.wicketsLeft || 3,
          matchFormat: matchInfo?.matchFormat || "T20"
        };
        const manualHistoryItem = { event: dummyEvent, commentary: data };
        setCommentaryFeed(prev => [manualHistoryItem, ...prev]);
        if (!isMuted) {
          speakCommentary(data.commentary, data.excitementScore, dummyEvent.over);
        }
        fetchMatchState();
      }

      // Reset milestone inputs so they don't fire continuously
      setMilestone('none');
      setIsWicket(false);

    } catch (err) {
      console.warn("Failed simulating ball event from server, running client-side simulation fallback:", err);
      
      const runs = isWicket ? 0 : customRuns;
      const overNum = matchInfo?.overs || "19.0";
      const commentText = generateLocalFallbackCommentary(
        customBatsman || matchInfo?.batsman || "Batsman",
        customBowler || matchInfo?.bowler || "Bowler",
        runs,
        isWicket,
        selectedShotType,
        selectedStyle
      );

      const computedExcitement = runs === 6 ? 9 : runs === 4 ? 8 : isWicket ? 9 : 4;
      const fallbackData: CommentaryResponse = {
        commentary: commentText,
        excitementScore: computedExcitement,
        keyPhrases: ["cricket masterclass", "magnificent strike", "pulsating contest"],
        tone: isWicket ? "Outrageous Loss" : runs >= 4 ? "Electrifying Action" : "Steady Build",
        commentatorPersona: getPersonaName(selectedStyle)
      };

      const fallbackEvent: CricketEvent = {
        over: overNum,
        batsman: customBatsman || matchInfo?.batsman || "Batsman",
        bowler: customBowler || matchInfo?.bowler || "Bowler",
        runs,
        isExtra,
        wicket: isWicket,
        score: matchInfo?.score || "180/7",
        currentRunRate: 7.2,
        wicketsLeft: matchInfo?.wicketsLeft || 3,
        matchFormat: matchInfo?.matchFormat || "T20"
      };

      const manualHistoryItem = { event: fallbackEvent, commentary: fallbackData };
      setCommentaryFeed(prev => [manualHistoryItem, ...prev]);

      if (!isMuted) {
        speakCommentary(fallbackData.commentary, fallbackData.excitementScore, fallbackEvent.over);
      }

      // Update matchInfo state safely locally
      setMatchInfo((prevInfo: any) => {
        if (!prevInfo) return prevInfo;
        const [scRuns, scWickets] = prevInfo.score.split("/").map(Number);
        const newRuns = scRuns + runs;
        const newWickets = scWickets + (isWicket ? 1 : 0);
        
        let [ovMain, ovBalls] = prevInfo.overs.split(".").map(Number);
        ovBalls++;
        if (ovBalls >= 6) {
          ovBalls = 0;
          ovMain++;
        }

        const ballsRemaining = Math.max(0, (prevInfo.ballsRemaining || 6) - 1);
        const runsNeeded = Math.max(0, (prevInfo.runsNeeded || 18) - runs);
        
        return {
          ...prevInfo,
          score: `${newRuns}/${newWickets}`,
          overs: `${ovMain}.${ovBalls}`,
          ballsRemaining,
          runsNeeded,
          requiredRunRate: ballsRemaining > 0 ? parseFloat(((runsNeeded / ballsRemaining) * 6).toFixed(2)) : 0,
          winProbability: isWicket ? Math.max(5, prevInfo.winProbability - 15) : runs >= 4 ? Math.min(95, prevInfo.winProbability + 10) : prevInfo.winProbability
        };
      });

      // Update over history locally for the game board
      setOverHistory(prev => {
        const newBall = { overNum, runs, wicket: isWicket, extra: isExtra };
        return [...prev, newBall].slice(-6);
      });

      setMilestone('none');
      setIsWicket(false);
    } finally {
      setLoading(false);
    }
  };

  // Helper macro generators
  const simulateActionPreset = (runs: number, wicket: boolean, presetShot: string) => {
    setCustomRuns(runs);
    setIsWicket(wicket);
    setSelectedShotType(presetShot);
    setIsExtra(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      
      {/* Top Broadcast Bar (Technical Dashboard Style) */}
      <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-40 sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm tracking-widest text-white shadow-lg shadow-blue-500/20">IND</div>
            <div className="text-2xl font-black tracking-tighter italic text-white flex items-baseline gap-2">
              {matchInfo?.score || "182/7"} 
              <span className="text-slate-500 font-medium text-xs font-mono"> ({matchInfo?.overs || "19.0"} Ov)</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden md:block"></div>
          <div className="hidden md:flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Required Rate</span>
            <span className="text-amber-400 font-mono font-bold text-sm">
              {matchInfo?.requiredRunRate || "12.45"} <span className="text-[10px] text-slate-400">RRR</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="bg-red-600 px-3 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Live Commentary Broadcast
          </div>
          <div className="text-[10px] text-slate-450 mt-1 uppercase tracking-wider font-semibold font-mono hidden sm:block">
            {matchInfo?.rivalryContext || "ICC T20 WORLD CUP • SEMI FINAL"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[9px] uppercase tracking-widest text-slate-505 font-bold italic">Active Style</div>
            <div className="text-xs font-mono font-bold uppercase text-emerald-400">{selectedStyle.replace('_', ' ')}</div>
          </div>
          
          <div className="h-8 w-px bg-slate-700"></div>

          {/* Quick Vocal Options */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(prev => {
                if (!prev) stopSpeaking();
                return !prev;
              })}
              className={`p-2 rounded-lg transition-colors border ${isMuted ? 'bg-rose-950/40 text-rose-450 border-rose-900/50' : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'}`}
              title={isMuted ? "Unmute vocal playback" : "Mute vocal playback"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => handleScenarioChange(activeScenarioId)}
              className="p-2 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-lg border border-slate-700 transition"
              title="Reset match scenario"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Controls & Presets / JSON Visualizers */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Active scenarios card */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-500" /> Choose Preset Scenario
              </span>
              <span className="text-[10px] font-mono text-slate-500">Preset Match Situations</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {scenarios.map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => handleScenarioChange(scen.id)}
                  className={`text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    activeScenarioId === scen.id 
                      ? "bg-slate-850 border-blue-500/80 shadow-md" 
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-950 rounded px-1.5 py-0.5">{scen.matchFormat}</span>
                      <h3 className="font-bold text-xs text-slate-200">{scen.title}</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{scen.description}</p>
                  </div>
                  {activeScenarioId === scen.id && <div className="w-2 h-2 rounded-full bg-blue-550 animate-ping" />}
                </button>
              ))}
            </div>
          </section>

          {/* Interactive Ball-By-Ball Simulator Console */}
          <section className="bg-slate-900/60 border border-slate-805 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                <Play className="w-3.5 h-3.5 text-emerald-400" /> Ball-By-Ball Control console
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">Sim Active</span>
            </div>

            <form onSubmit={triggerBallEvent} className="flex flex-col gap-4">
              
              {/* Row inputs: Batsman + Bowler */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Batsman Facing</label>
                  <input 
                    type="text"
                    value={customBatsman}
                    onChange={(e) => setCustomBatsman(e.target.value)}
                    placeholder="E.g., Hardik Pandya"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Active Bowler</label>
                  <input 
                    type="text"
                    value={customBowler}
                    onChange={(e) => setCustomBowler(e.target.value)}
                    placeholder="E.g., Mitchell Starc"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Selector button grid */}
              <div className="space-y-2">
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Simulate Ball Result</label>
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    type="button"
                    onClick={() => simulateActionPreset(0, false, "solid forward defense")}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${!isWicket && customRuns === 0 ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    Dot Ball (0)
                  </button>
                  <button 
                    type="button"
                    onClick={() => simulateActionPreset(1, false, "flick in past square-leg")}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${!isWicket && customRuns === 1 ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    Single (1)
                  </button>
                  <button 
                    type="button"
                    onClick={() => simulateActionPreset(4, false, "elegant cover drive")}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${!isWicket && customRuns === 4 ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    Boundary (4)
                  </button>
                  <button 
                    type="button"
                    onClick={() => simulateActionPreset(6, false, "monumental slog sweeps")}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${!isWicket && customRuns === 6 ? 'bg-purple-600/20 text-purple-400 border-purple-500/50' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    Maximum (6)
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsWicket(prev => !prev)}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-lg border transition-all ${isWicket ? 'bg-rose-955 text-rose-455 border-rose-500' : 'bg-slate-950 border-slate-800 text-rose-500/80 hover:border-slate-700'}`}
                >
                  💥 Simulate Wicket Out: {isWicket ? "YES [TRIGGERED]" : "NO [CLICK TO TOGGLE]"}
                </button>
              </div>

              {/* Styled layout properties */}
              <div className="grid grid-cols-2 gap-3 pb-1">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Played Shot Type</label>
                  <select 
                    value={selectedShotType}
                    onChange={(e) => setSelectedShotType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-805 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:border-blue-505 focus:outline-none"
                  >
                    <option value="cover drive">Elegant Cover Drive</option>
                    <option value="helicopter shot">Helicopter Shot</option>
                    <option value="slog sweep">Slog Sweep over Midwicket</option>
                    <option value="straight drive">Grand Straight Drive</option>
                    <option value="defense">Solid Defensive Block</option>
                    <option value="pull shot">Aggressive Short Pull Shot</option>
                    <option value="ramp shot">Cheeky Scoop Ramp Shot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Player Milestone</label>
                  <select 
                    value={milestone}
                    onChange={(e: any) => setMilestone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-805 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:border-blue-505 focus:outline-none"
                  >
                    <option value="none">No Milestones</option>
                    <option value="50">Completed 50 runs</option>
                    <option value="100">Completed 100 runs</option>
                  </select>
                </div>
              </div>

              {/* Stylizer Modes Grid */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1.5 block">AI Commentary Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "ipl_excited", label: "EXCITED IPL STYLE", icon: Flame, color: "text-amber-500" },
                    { id: "professional", label: "PROFESSIONAL TV", icon: Award, color: "text-blue-405" },
                    { id: "hindi", label: "PURE HINDI AUDIO", icon: BookOpen, color: "text-red-405" },
                    { id: "hinglish", label: "HINGLISH COCKTAIL", icon: Smile, color: "text-purple-405" },
                    { id: "radio", label: "TMS CLASSIC RADIO", icon: Radio, color: "text-pink-405" },
                    { id: "funny_meme", label: "SARCASTIC MEME", icon: Layers, color: "text-cyan-405" }
                  ].map((mode) => {
                    const IconComponent = mode.icon;
                    const isActive = selectedStyle === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSelectedStyle(mode.id as CommentaryStyle)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold text-left flex items-center justify-between transition-all ${
                          isActive 
                            ? "bg-blue-600 text-white border-blue-400/30 shadow-lg shadow-blue-900/20" 
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : mode.color}`} />
                          {mode.label}
                        </span>
                        {isActive && <div className="w-2 h-2 rounded-full bg-blue-200" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Technical Dashboard Code / JSON Input Mock Live Simulation View */}
              <div className="bg-slate-950 rounded border border-slate-800 p-3.5 font-mono text-[11px] text-emerald-500 shadow-inner">
                <div className="text-slate-650 select-none">// Current Event Data Packet Preview</div>
                <div className="mt-1">
                  {"{"}
                  <div className="pl-4">
                    <span className="text-blue-450 font-semibold">"over"</span>: <span className="text-amber-400">"{matchInfo?.overs || "15.2"}"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-450 font-semibold">"batsman"</span>: <span className="text-amber-400">"{customBatsman || "Virat Kohli"}"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-450 font-semibold">"bowler"</span>: <span className="text-amber-400">"{customBowler || "Mitchell Starc"}"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-450 font-semibold">"runs"</span>: <span className="text-pink-400">{isWicket ? 0 : customRuns}</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-455 font-semibold">"shot_type"</span>: <span className="text-amber-400">"{selectedShotType}"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-blue-455 font-semibold">"wicket"</span>: <span className="text-amber-400">{isWicket ? "true" : "false"}</span>
                  </div>
                  {"}"}
                </div>
              </div>

              {/* Submit triggers */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase rounded py-3 transition-colors tracking-widest flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    GENERATING REAL COMMENTARY FLOW...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Live Commentary
                  </>
                )}
              </button>

            </form>
          </section>

          {/* Model Statistics Panel */}
          <section className="p-4 bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-xl border border-indigo-500/20 shadow-xl">
            <span className="text-[10px] text-indigo-300 font-bold uppercase block mb-2 tracking-widest">Excitement Engine</span>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-500"
                style={{ width: `${(commentaryFeed[0]?.commentary?.excitementScore || 5) * 10}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-slate-500">Normal</span>
              <span className="text-[10px] text-pink-400 font-bold italic">
                {commentaryFeed[0]?.commentary?.excitementScore && commentaryFeed[0].commentary.excitementScore >= 8 ? 'HYPED' : 'CALCULATED'}
              </span>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: commentary list feed & win predictions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Win Probability Panel */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Live Win Probability</label>
            <div className="flex h-9 w-full rounded-lg overflow-hidden border border-slate-700 shadow-inner">
              <div 
                className="h-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                style={{ width: `${matchInfo?.winProbability || 50}%` }}
              >
                {matchInfo?.battingTeam || "IND"} {matchInfo?.winProbability || 50}%
              </div>
              <div 
                className="h-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                style={{ width: `${100 - (matchInfo?.winProbability || 50)}%` }}
              >
                {matchInfo?.bowlingTeam || "PAK"} {100 - (matchInfo?.winProbability || 50)}%
              </div>
            </div>

            {/* Over Progress Tracker */}
            <div className="mt-5">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Over Progression</label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const b = overHistory[index];
                  let bg = "bg-slate-800 text-slate-505";
                  let text = "•";
                  
                  if (b) {
                    text = b.wicket ? "W" : b.runs.toString();
                    if (b.wicket) bg = "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20";
                    else if (b.runs === 6) bg = "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20";
                    else if (b.runs === 4) bg = "bg-purple-600 text-white font-bold";
                    else bg = "bg-slate-705 text-slate-200";
                  }
                  
                  return (
                    <div 
                      key={index}
                      className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold ${bg} transition-all`}
                    >
                      {text}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Commentary list container */}
          <section className="flex-1 bg-slate-900/55 border border-slate-800 rounded-xl flex flex-col min-h-[500px] shadow-2xl">
            
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <h2 className="font-bold tracking-tight text-sm uppercase text-slate-300 flex items-center gap-2">
                <Tv className="w-4 h-4 text-blue-550" /> AI Commentary Live Feed
              </h2>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-slate-950 text-[9px] font-bold text-slate-400 border border-slate-850 uppercase font-mono">EN IN CLOUD</span>
                <span className="px-2 py-1 rounded bg-slate-950 text-[9px] font-bold text-slate-505 border border-slate-850 uppercase font-mono">Hindi Syncable</span>
              </div>
            </div>

            {/* Ball commentary loops */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[600px]">
              <AnimatePresence initial={false}>
                {commentaryFeed.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                    <p className="text-xs font-bold text-slate-300">Awaiting ball data transmission...</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mt-1">Submit combinations of events using the live simulator terminal on the left to invoke Gemini streams!</p>
                  </div>
                ) : (
                  commentaryFeed.map((item, index) => {
                    const id = item.event.over;
                    const runs = item.event.runs;
                    const wicket = item.event.wicket;
                    const exScore = item.commentary.excitementScore || 5;
                    const isSpeaking = currentlySpeakingId === id;

                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-4 group"
                      >
                        {/* Over Badge indicators */}
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-blue-400 text-xs">
                            {id}
                          </div>
                          <div className="flex-1 w-px bg-slate-800 my-2"></div>
                        </div>

                        {/* Text card content bubble */}
                        <div className={`flex-1 rounded-xl p-4 border transition-all ${
                          isSpeaking 
                            ? "bg-slate-900 border-emerald-500/80 shadow-emerald-500/5 shadow-md" 
                            : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                        }`}>
                          <p className="text-slate-200 leading-relaxed italic text-sm">
                            "{item.commentary.commentary}"
                          </p>

                          {/* Technical commentary stats block footer */}
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                            {wicket ? (
                              <span className="text-rose-500">WICKET FALLEN</span>
                            ) : (
                              <span className="text-amber-400">{runs === 6 ? "SIX RUNS" : runs === 4 ? "FOUR RUNS" : runs === 0 ? "DOT BALL" : `${runs} RUNS`}</span>
                            )}
                            <span>•</span>
                            <span>Excitement: {exScore}/10</span>
                            <span>•</span>
                            <span>Persona: {item.commentary.commentatorPersona || "Harsha"}</span>
                            <span>•</span>
                            <span className="text-emerald-500">{item.commentary.tone || "Excited"}</span>
                          </div>

                          {/* Trigger vocal control button */}
                          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                            <div className="text-[10px] text-slate-400 font-mono">
                              Shot: <span className="text-blue-400">{item.event.shotType || "Defense"}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (isSpeaking) {
                                  stopSpeaking();
                                } else {
                                  speakCommentary(item.commentary.commentary, exScore, id);
                                }
                              }}
                              className="text-[10px] font-bold bg-slate-950 text-slate-400 hover:text-white py-1 px-2.5 rounded border border-slate-800 flex items-center gap-1.5 transition-all"
                            >
                              {isSpeaking ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-rose-400" /> Stop Speech
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Speak Commentary
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* WebSocket connection status indicator inside footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 mt-auto rounded-b-xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {isConnected ? `${streamMethod} Streaming Connected` : 'Direct Polling Engine Active'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-650 select-none">STADIUM-VOICE V1.2 // GEMINI-3.5-FLASH</span>
            </div>

          </section>

        </div>

      </main>

    </div>
  );
}
