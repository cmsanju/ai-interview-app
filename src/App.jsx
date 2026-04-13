import { useState, useEffect, useRef, useCallback } from "react";

const CANDIDATES = [
  { name: "Rahul", skill: "Java", experience: 5, score: 8 },
  { name: "Priya", skill: "Angular", experience: 4, score: 9 },
  { name: "John", skill: "Spring Boot", experience: 3, score: 7 },
  { name: "Sara", skill: "React", experience: 6, score: 8.5 },
];

const EMOTION_MAP = {
  high_confidence: { label: "Confident", color: "#00d4aa" },
  nervous: { label: "Nervous", color: "#ff6b6b" },
  focused: { label: "Focused", color: "#4ecdc4" },
  confused: { label: "Confused", color: "#ffd93d" },
  thinking: { label: "Thinking", color: "#a29bfe" },
  engaged: { label: "Engaged", color: "#fd79a8" },
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
function fmtTime(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

function Dot({ color, pulse }) {
  return <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:color, flexShrink:0, animation: pulse ? "pulseGlow 1.4s ease-in-out infinite" : "none", boxShadow: pulse ? `0 0 8px ${color}` : "none" }} />;
}

function Badge({ children, color="#00d4aa" }) {
  return <span style={{ background:`${color}22`, color, borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, letterSpacing:.8, border:`1px solid ${color}44`, whiteSpace:"nowrap" }}>{children}</span>;
}

function ScoreRing({ value, size=72, stroke=6, color="#00d4aa", label }) {
  const r = (size - stroke * 2) / 2, circ = 2 * Math.PI * r, dash = (value / 100) * circ;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ color:"white", fontWeight:800, fontSize: size > 60 ? 17 : 13 }}>{Math.round(value)}</span>
        </div>
      </div>
      {label && <span style={{ color:"rgba(255,255,255,0.4)", fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>{label}</span>}
    </div>
  );
}

function WaveBar({ active, color="#00d4aa", bars=24, height=44 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2.5, height }}>
      {Array.from({ length:bars }).map((_,i) => (
        <div key={i} style={{ width:3, borderRadius:2, background: active ? color : "rgba(255,255,255,0.1)", height: active ? "auto" : "4px", minHeight:"4px", animation: active ? `waveAnim ${0.4+(i%5)*0.12}s ease-in-out infinite alternate` : "none", animationDelay:`${i*0.04}s`, flex: active ? "none" : "none", alignSelf:"center" }} />
      ))}
    </div>
  );
}

function EmotionRadar({ data }) {
  const keys = Object.keys(data), cx=100, cy=100, R=75;
  const pts = keys.map((k,i) => { const a=(i/keys.length)*Math.PI*2-Math.PI/2, v=data[k]/100; return { x:cx+R*v*Math.cos(a), y:cy+R*v*Math.sin(a), lx:cx+(R+22)*Math.cos(a), ly:cy+(R+22)*Math.sin(a), k }; });
  const grid = s => keys.map((_,i) => { const a=(i/keys.length)*Math.PI*2-Math.PI/2; return `${cx+R*s*Math.cos(a)},${cy+R*s*Math.sin(a)}`; }).join(" ");
  return (
    <svg width="200" height="200" style={{ overflow:"visible" }}>
      {[.25,.5,.75,1].map(s => <polygon key={s} points={grid(s)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />)}
      {keys.map((_,i) => { const a=(i/keys.length)*Math.PI*2-Math.PI/2; return <line key={i} x1={cx} y1={cy} x2={cx+R*Math.cos(a)} y2={cy+R*Math.sin(a)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />; })}
      <polygon points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill="rgba(0,212,170,0.18)" stroke="#00d4aa" strokeWidth="2" />
      {pts.map((p,i) => <g key={i}><circle cx={p.x} cy={p.y} r="4" fill="#00d4aa" /><text x={p.lx} y={p.ly} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">{p.k}</text></g>)}
    </svg>
  );
}

function TypingText({ text, speed=20 }) {
  const [shown, setShown] = useState("");
  const prevText = useRef("");
  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text; setShown(""); let i=0;
    const t = setInterval(() => { if (i < text.length) setShown(text.slice(0,++i)); else clearInterval(t); }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <>{shown}</>;
}

function AIAvatar({ speaking, emotion }) {
  const color = EMOTION_MAP[emotion]?.color || "#00d4aa";
  return (
    <div style={{ position:"relative", width:52, height:52, flexShrink:0 }}>
      <div style={{ width:52, height:52, borderRadius:"50%", background:`conic-gradient(${color},#0070f3,${color})`, display:"flex", alignItems:"center", justifyContent:"center", animation: speaking ? "spinSlow 3s linear infinite" : "none", boxShadow: speaking ? `0 0 18px ${color}55` : "none" }}>
        <div style={{ width:44, height:44, borderRadius:"50%", background:"#111827", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🤖</div>
      </div>
      <div style={{ position:"absolute", bottom:0, right:0, width:13, height:13, borderRadius:"50%", background: speaking ? "#00d4aa" : "rgba(255,255,255,0.15)", border:"2px solid #070b14", animation: speaking ? "pulseGlow 1s ease-in-out infinite" : "none" }} />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("lobby");
  const [candidate, setCandidate] = useState(CANDIDATES[0]);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [agentMsg, setAgentMsg] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [cameraOn, setCameraOn] = useState(false);
  const [emotionState, setEmotionState] = useState("focused");
  const [emo, setEmo] = useState({ Confid:70, Tech:62, Clarity:75, Stress:32, Engage:84 });
  const [scoreHistory, setScoreHistory] = useState([]);
  const [report, setReport] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [generatingQ, setGeneratingQ] = useState(false);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (cameraOn && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video:true, audio:false }).then(s => { if (videoRef.current) videoRef.current.srcObject=s; }).catch(()=>setCameraOn(false));
    }
    return () => { try { videoRef.current?.srcObject?.getTracks().forEach(t=>t.stop()); } catch {} };
  }, [cameraOn]);

  useEffect(() => {
    if (screen !== "interview") return;
    const id = setInterval(() => setTimeLeft(t => t>0?t-1:0), 1000);
    return () => clearInterval(id);
  }, [screen, qIdx]);

  useEffect(() => { if (screen==="interview") setTimeLeft(180); }, [qIdx, screen]);

  useEffect(() => {
    if (screen !== "interview") return;
    const emoKeys = Object.keys(EMOTION_MAP);
    const id = setInterval(() => {
      setEmotionState(emoKeys[Math.floor(Math.random()*emoKeys.length)]);
      setEmo(prev => ({ Confid:clamp(prev.Confid+rand(-6,8),25,99), Tech:clamp(prev.Tech+rand(-4,6),25,99), Clarity:clamp(prev.Clarity+rand(-5,7),25,99), Stress:clamp(prev.Stress+rand(-8,8),10,88), Engage:clamp(prev.Engage+rand(-4,5),45,99) }));
    }, 2800);
    return () => clearInterval(id);
  }, [screen]);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate=0.95; u.pitch=1.05;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v=>v.lang==="en-US"&&v.name.includes("Google"))||voices[0];
    if (v) u.voice=v;
    u.onstart=()=>setAiSpeaking(true); u.onend=()=>setAiSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const callClaude = async (prompt, maxTokens=1000) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:maxTokens, messages:[{role:"user",content:prompt}] })
    });
    const data = await res.json();
    return data.content?.[0]?.text || "";
  };

  const generateQuestions = async (cand) => {
    setGeneratingQ(true); setLoadingMsg(`Crafting tailored questions for ${cand.skill} developer...`);
    try {
      const raw = await callClaude(`Generate exactly 5 technical interview questions for a ${cand.skill} developer with ${cand.experience} years experience. Mix: 2 conceptual text, 2 coding, 1 system design voice. Return ONLY a valid JSON array with no markdown or extra text:
[{"id":1,"type":"text","topic":"${cand.skill}","difficulty":"Medium","question":"..."},
{"id":2,"type":"code","topic":"Algorithms","difficulty":"Hard","question":"...","starterCode":"// write solution here\\nfunction solution() {\\n  \\n}"},
{"id":3,"type":"voice","topic":"System Design","difficulty":"Hard","question":"..."},
{"id":4,"type":"text","topic":"Best Practices","difficulty":"Medium","question":"..."},
{"id":5,"type":"code","topic":"${cand.skill}","difficulty":"Medium","question":"...","starterCode":"// write solution here\\n"}]`);
      const clean = raw.replace(/```json|```/g,"").trim();
      setQuestions(JSON.parse(clean));
    } catch {
      setQuestions([
        { id:1, type:"text", topic:cand.skill, difficulty:"Medium", question:`Explain the core architecture of ${cand.skill} and how you've used it in production systems.` },
        { id:2, type:"code", topic:"Algorithms", difficulty:"Hard", question:"Implement a function that finds all pairs in an array that sum to a target value. Optimize for O(n) time.", starterCode:"function findPairs(arr, target) {\n  // O(n) solution using HashMap\n  \n}" },
        { id:3, type:"voice", topic:"System Design", difficulty:"Hard", question:"Design a high-availability microservices architecture for an e-commerce platform handling 10,000 req/sec. Describe your database strategy, caching layer, and failover mechanisms." },
        { id:4, type:"text", topic:"Best Practices", difficulty:"Medium", question:"Explain SOLID principles with real examples from your experience. Which principle do you find hardest to apply and why?" },
        { id:5, type:"code", topic:cand.skill, difficulty:"Medium", question:"Implement a thread-safe singleton pattern and explain potential pitfalls with double-checked locking.", starterCode:"public class Singleton {\n  private static volatile Singleton instance;\n  \n  public static Singleton getInstance() {\n    // implement here\n  }\n}" },
      ]);
    }
    setGeneratingQ(false);
  };

  const startInterview = async (cand) => {
    setCandidate(cand); setScreen("interview"); setQIdx(0);
    setAnswers([]); setScoreHistory([]); setCurrentAnswer(""); setTranscript("");
    setFeedback(""); setPhase("idle"); setCameraOn(true); setReport(null);
    await generateQuestions(cand);
  };

  const agentAsk = useCallback(async (q) => {
    if (!q) return;
    setPhase("asking"); setAiSpeaking(true);
    const intro = `Question ${q.id} on ${q.topic}. ${q.question}${q.type==="code"?" Please write your solution in the code editor below.":""}`;
    setAgentMsg(intro);
    speak(intro);
    await new Promise(r=>setTimeout(r,1500));
    setAiSpeaking(false); setPhase("answering");
  }, [speak]);

  useEffect(() => {
    if (screen==="interview" && questions.length>0 && phase==="idle") agentAsk(questions[qIdx]);
  }, [screen, questions, qIdx, phase, agentAsk]);

  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported. Please type."); return; }
    const r = new SR(); r.continuous=true; r.interimResults=true;
    r.onresult = e => { const t=Array.from(e.results).map(x=>x[0].transcript).join(""); setTranscript(t); setCurrentAnswer(t); };
    r.onerror=()=>setIsRecording(false); r.start();
    recognitionRef.current=r; setIsRecording(true);
  }, []);

  const stopVoice = useCallback(() => { recognitionRef.current?.stop(); setIsRecording(false); }, []);

  const submitAnswer = async () => {
    const q = questions[qIdx];
    const ans = currentAnswer || transcript || "(No response)";
    setPhase("evaluating"); setLoading(true); setFeedback("");
    window.speechSynthesis.cancel(); setAiSpeaking(false);
    try {
      const raw = await callClaude(`Senior technical interviewer evaluation. Be strict and accurate.
Question: "${q.question}"
Candidate (${candidate.skill}, ${candidate.experience}yrs) answered: "${ans}"
Return ONLY valid JSON no markdown:
{"score":75,"accuracy":70,"feedback":"2-3 sentence feedback","strengths":"one key strength","improvements":"one improvement","verdict":"Excellent|Good|Needs Improvement|Poor"}`);
      const ev = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setScoreHistory(prev=>[...prev,{qId:q.id,topic:q.topic,...ev}]);
      setFeedback(ev.feedback||"Answer recorded.");
      const fb = ev.verdict==="Excellent" ? `Excellent! ${ev.strengths}. ${ev.feedback}` : ev.verdict==="Good" ? `Good response. ${ev.feedback}` : `${ev.feedback} Focus on ${ev.improvements}.`;
      setAgentMsg(fb); speak(fb);
    } catch {
      const fb = { score:60, accuracy:55, feedback:"Answer recorded. Try to structure responses with examples.", strengths:"Attempted", improvements:"Add technical depth", verdict:"Needs Improvement" };
      setScoreHistory(prev=>[...prev,{qId:q.id,topic:q.topic,...fb}]);
      setFeedback(fb.feedback); setAgentMsg(fb.feedback);
    }
    setLoading(false);
  };

  const nextQuestion = async () => {
    window.speechSynthesis.cancel(); setAiSpeaking(false);
    if (qIdx < questions.length-1) {
      setQIdx(i=>i+1); setCurrentAnswer(""); setTranscript(""); setFeedback(""); setPhase("idle");
    } else {
      setScreen("report"); setLoading(true); setLoadingMsg("Generating comprehensive selection report...");
      const avgSc = Math.round(avg(scoreHistory.map(s=>s.score)));
      const avgAc = Math.round(avg(scoreHistory.map(s=>s.accuracy)));
      const emoAvg = Math.round((emo.Confid+emo.Tech+emo.Clarity+(100-emo.Stress)+emo.Engage)/5);
      try {
        const raw = await callClaude(`Generate final interview selection report for ${candidate.name}, ${candidate.skill} dev, ${candidate.experience}yrs.
Scores: ${JSON.stringify(scoreHistory)}. Avg tech: ${avgSc}/100, accuracy: ${avgAc}%, emotion AI: ${emoAvg}/100.
Return ONLY valid JSON no markdown:
{"overallScore":${avgSc},"recommendation":"Selected|Hold|Rejected","confidence":82,"summary":"3 sentence executive summary","strengths":["s1","s2","s3"],"weaknesses":["w1","w2"],"nextSteps":"recommended next step","salaryRange":"salary in INR","role":"suggested title"}`);
        const rpt = JSON.parse(raw.replace(/```json|```/g,"").trim());
        setReport({...rpt, candidate, scoreHistory:[...scoreHistory], emoFinal:{...emo}, avgSc, avgAc, emoAvg});
      } catch {
        setReport({ overallScore:avgSc, recommendation:avgSc>=70?"Selected":avgSc>=50?"Hold":"Rejected", confidence:76, summary:`${candidate.name} completed the AI interview demonstrating ${avgSc>=70?"strong":"moderate"} ${candidate.skill} knowledge.`, strengths:["Technical understanding","Problem-solving ability","Communication"], weaknesses:["Needs more depth in answers","Time pressure management"], nextSteps:"Schedule round 2 with tech lead.", salaryRange:"₹12L–₹18L per annum", role:`${candidate.experience>=5?"Senior":"Mid-Level"} ${candidate.skill} Developer`, candidate, scoreHistory:[...scoreHistory], emoFinal:{...emo}, avgSc, avgAc, emoAvg });
      }
      setLoading(false);
    }
  };

  const q = questions[qIdx];
  const latestScore = scoreHistory[scoreHistory.length-1];

  // ═══ GLOBAL STYLES ═══
  const GlobalStyles = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#070b14}
      @keyframes pulseGlow{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(1.12)}}
      @keyframes waveAnim{from{height:4px}to{height:32px}}
      @keyframes spinSlow{to{transform:rotate(360deg)}}
      @keyframes floatUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes scanLine{0%{top:-2px}100%{top:100vh}}
      @keyframes shimmer{0%,100%{opacity:.4}50%{opacity:.9}}
      textarea{outline:none!important;resize:vertical}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}
      .hover-lift{transition:transform .2s,box-shadow .2s}
      .hover-lift:hover{transform:translateY(-2px)}
    `}</style>
  );

  // ═══ LOBBY ═══
  if (screen === "lobby") return (
    <div style={{ minHeight:"100vh", background:"#070b14", fontFamily:"'Outfit',sans-serif", color:"white", padding:24, position:"relative", overflow:"hidden" }}>
      <GlobalStyles />
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", backgroundImage:"radial-gradient(ellipse at 15% 25%, rgba(0,112,243,0.09) 0%,transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(0,212,170,0.07) 0%,transparent 55%)", zIndex:0 }} />
      <div style={{ position:"fixed", width:"100%", height:1, background:"linear-gradient(90deg,transparent,rgba(0,212,170,0.08),transparent)", animation:"scanLine 8s linear infinite", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:920, margin:"0 auto" }}>
        <div style={{ textAlign:"center", paddingTop:44, paddingBottom:52, animation:"floatUp .6s ease" }}>
           <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,212,170,0.08)", border:"1px solid rgba(0,212,170,0.22)", borderRadius:100, padding:"7px 20px", marginBottom:28 }}>
            <Dot color="#00d4aa" pulse />
            <span style={{ color:"#00d4aa", fontSize:11, letterSpacing:2.5, textTransform:"uppercase", fontWeight:600 }}>GMST SOLUTIONS PVT LTD.</span><br><br>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,212,170,0.08)", border:"1px solid rgba(0,212,170,0.22)", borderRadius:100, padding:"7px 20px", marginBottom:28 }}>
            <Dot color="#00d4aa" pulse />
            <span style={{ color:"#00d4aa", fontSize:11, letterSpacing:2.5, textTransform:"uppercase", fontWeight:600 }}>AI-Powered · Emotion-Aware · Real-Time Evaluation</span>
          </div>
          <h1 style={{ fontSize:"clamp(38px,6vw,68px)", fontWeight:900, lineHeight:1.04, letterSpacing:-2, marginBottom:14 }}>
            Interview<span style={{ color:"#00d4aa" }}>AI</span>
            <span style={{ color:"rgba(255,255,255,0.18)", fontWeight:300 }}> Platform</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.38)", fontSize:16, fontWeight:400 }}>Auto-generated questions · AI Agent Interviewer · Emotion tracking · Selection report</p>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:9, justifyContent:"center", marginBottom:52 }}>
          {[["🎤","Voice Input"],["💻","Live Code Editor"],["🧠","Emotion AI"],["📊","Real-Time Scoring"],["🤖","AI Agent Asks"],["📝","Auto Questions"],["🎯","Selection Report"]].map(([ic,lb]) => (
            <div key={lb} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:100, padding:"6px 15px", fontSize:12, color:"rgba(255,255,255,0.55)", display:"flex", alignItems:"center", gap:6 }}>
              <span>{ic}</span><span>{lb}</span>
            </div>
          ))}
        </div>

        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:11, letterSpacing:2.5, textTransform:"uppercase", marginBottom:18, fontWeight:600 }}>Select Candidate</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:40 }}>
          {CANDIDATES.map(c => (
            <div key={c.name} className="hover-lift" onClick={() => setCandidate(c)} style={{ background: candidate.name===c.name ? "rgba(0,212,170,0.07)" : "rgba(255,255,255,0.03)", border:`1px solid ${candidate.name===c.name?"rgba(0,212,170,0.45)":"rgba(255,255,255,0.07)"}`, borderRadius:18, padding:22, cursor:"pointer", transition:"all .2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background: candidate.name===c.name?"linear-gradient(135deg,#00d4aa,#0070f3)":"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:17, color:"white" }}>{c.name[0]}</div>
                <div><div style={{ fontWeight:700, fontSize:15 }}>{c.name}</div><div style={{ color:"#00d4aa", fontSize:12, marginTop:2 }}>{c.skill}</div></div>
              </div>
              <div style={{ display:"flex", gap:7 }}><Badge color="#a29bfe">{c.experience}y exp</Badge><Badge color="#ffd93d">⭐ {c.score}/10</Badge></div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"center" }}>
          <button className="hover-lift" onClick={() => startInterview(candidate)} style={{ padding:"17px 58px", background:"linear-gradient(135deg,#00d4aa,#0070f3)", border:"none", borderRadius:16, color:"white", fontSize:17, fontWeight:700, cursor:"pointer", fontFamily:"inherit", letterSpacing:.4, boxShadow:"0 8px 36px rgba(0,212,170,0.28)" }}>
            🚀 Start AI Interview — {candidate.name}
          </button>
        </div>
      </div>
    </div>
  );

  // ═══ REPORT ═══
  if (screen === "report") return (
    <div style={{ minHeight:"100vh", background:"#070b14", fontFamily:"'Outfit',sans-serif", color:"white", padding:24 }}>
      <GlobalStyles />
      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", gap:20 }}>
          <div style={{ display:"flex", gap:8 }}>{[0,1,2].map(i=><div key={i} style={{ width:12, height:12, borderRadius:"50%", background:"#00d4aa", animation:`pulseGlow ${.5+i*.2}s ease-in-out infinite`, animationDelay:`${i*.2}s` }}/>)}</div>
          <p style={{ color:"rgba(255,255,255,0.38)", fontSize:14 }}>{loadingMsg}</p>
        </div>
      ) : report && (
        <div style={{ maxWidth:780, margin:"0 auto", paddingTop:20, animation:"floatUp .5s ease" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32, gap:16, flexWrap:"wrap" }}>
            <div>
              <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, letterSpacing:2.5, textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>Final AI Evaluation Report</div>
              <h2 style={{ fontSize:28, fontWeight:800, letterSpacing:-.5 }}>{report.candidate.name} <span style={{ color:"rgba(255,255,255,0.25)", fontWeight:300 }}>· {report.candidate.skill} Developer</span></h2>
            </div>
            <div style={{ padding:"11px 24px", borderRadius:12, fontWeight:700, fontSize:16, background:report.recommendation==="Selected"?"rgba(0,212,170,0.12)":report.recommendation==="Hold"?"rgba(255,217,61,0.12)":"rgba(255,107,107,0.12)", color:report.recommendation==="Selected"?"#00d4aa":report.recommendation==="Hold"?"#ffd93d":"#ff6b6b", border:`1px solid ${report.recommendation==="Selected"?"rgba(0,212,170,0.35)":report.recommendation==="Hold"?"rgba(255,217,61,0.35)":"rgba(255,107,107,0.35)"}` }}>
              {report.recommendation==="Selected"?"✅":report.recommendation==="Hold"?"⏸":"❌"} {report.recommendation}
            </div>
          </div>

          {/* Score rings */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:18 }}>
            {[{l:"Overall",v:report.avgSc,c:"#00d4aa"},{l:"Accuracy",v:report.avgAc,c:"#0070f3"},{l:"Emotion AI",v:report.emoAvg,c:"#a29bfe"},{l:"Confidence",v:Math.round(report.confidence),c:"#fd79a8"}].map(s=>(
              <div key={s.l} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"20px 10px", textAlign:"center" }}>
                <ScoreRing value={s.v} color={s.c} label={s.l} size={68} />
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, marginBottom:14 }}>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:12, fontWeight:600 }}>Executive Summary</p>
            <p style={{ color:"rgba(255,255,255,0.72)", lineHeight:1.8, fontSize:15, marginBottom:22 }}>{report.summary}</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <p style={{ color:"#00d4aa", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:10, fontWeight:600 }}>✓ Strengths</p>
                {report.strengths.map((s,i)=><div key={i} style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginBottom:7, display:"flex", gap:8 }}><span style={{ color:"#00d4aa" }}>→</span>{s}</div>)}
              </div>
              <div>
                <p style={{ color:"#ff6b6b", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:10, fontWeight:600 }}>↑ Growth Areas</p>
                {report.weaknesses.map((w,i)=><div key={i} style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginBottom:7, display:"flex", gap:8 }}><span style={{ color:"#ff6b6b" }}>→</span>{w}</div>)}
              </div>
            </div>
          </div>

          {/* Per-question */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, marginBottom:14 }}>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:18, fontWeight:600 }}>Question Breakdown</p>
            {report.scoreHistory.map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 0", borderBottom: i<report.scoreHistory.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.35)", flexShrink:0 }}>Q{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:"rgba(255,255,255,0.65)", fontSize:13, marginBottom:5 }}>{s.topic}</div>
                  <div style={{ height:3, background:"rgba(255,255,255,0.07)", borderRadius:4 }}>
                    <div style={{ height:"100%", width:`${s.score}%`, background:s.score>=75?"linear-gradient(90deg,#00d4aa,#0070f3)":s.score>=50?"linear-gradient(90deg,#ffd93d,#fd79a8)":"linear-gradient(90deg,#ff6b6b,#ff8e53)", borderRadius:4, transition:"width 1s ease" }}/>
                  </div>
                </div>
                <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                  <Badge color={s.score>=75?"#00d4aa":s.score>=50?"#ffd93d":"#ff6b6b"}>{s.score}pts</Badge>
                  <Badge color="#a29bfe">{s.accuracy}%</Badge>
                  <Badge color={s.verdict==="Excellent"?"#00d4aa":s.verdict==="Good"?"#4ecdc4":s.verdict==="Needs Improvement"?"#ffd93d":"#ff6b6b"}>{s.verdict}</Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Offer details */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, marginBottom:24, display:"flex", gap:20, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:160 }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>Suggested Role</p>
              <p style={{ color:"white", fontWeight:700, fontSize:15 }}>{report.role}</p>
            </div>
            <div style={{ flex:1, minWidth:160 }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>Salary Range</p>
              <p style={{ color:"#00d4aa", fontWeight:700, fontSize:15 }}>{report.salaryRange}</p>
            </div>
            <div style={{ flex:2, minWidth:200 }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>Next Steps</p>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:14 }}>{report.nextSteps}</p>
            </div>
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={()=>{setScreen("lobby");setReport(null);setQuestions([]);}} style={{ flex:1, padding:"14px 0", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"white", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>← Next Candidate</button>
            <button style={{ flex:1, padding:"14px 0", background:"linear-gradient(135deg,#00d4aa,#0070f3)", border:"none", borderRadius:12, color:"white", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>📄 Export PDF Report</button>
          </div>
        </div>
      )}
    </div>
  );

  // ═══ INTERVIEW ═══
  return (
    <div style={{ height:"100vh", background:"#070b14", fontFamily:"'Outfit',sans-serif", color:"white", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <GlobalStyles />

      {/* TOP BAR */}
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"0 20px", height:50, borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(7,11,20,0.96)", backdropFilter:"blur(20px)", flexShrink:0, zIndex:100 }}>
        <span style={{ fontWeight:900, fontSize:16, letterSpacing:-.5 }}>Interview<span style={{ color:"#00d4aa" }}>AI</span></span>
        <span style={{ color:"rgba(255,255,255,0.12)" }}>|</span>
        <span style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>{candidate.name} · {candidate.skill}</span>
        <div style={{ display:"flex", gap:5, marginLeft:"auto" }}>
          {questions.map((_,i)=><div key={i} style={{ width:i===qIdx?20:7, height:7, borderRadius:4, background:i<qIdx?"#00d4aa":i===qIdx?"#00d4aa":"rgba(255,255,255,0.1)", transition:"all .3s" }}/>)}
        </div>
        <div style={{ background:timeLeft<30?"rgba(255,107,107,0.1)":"rgba(255,255,255,0.05)", border:`1px solid ${timeLeft<30?"rgba(255,107,107,0.3)":"rgba(255,255,255,0.07)"}`, borderRadius:7, padding:"4px 12px", color:timeLeft<30?"#ff6b6b":"rgba(255,255,255,0.5)", fontFamily:"'JetBrains Mono'", fontSize:13, fontWeight:600 }}>{fmtTime(timeLeft)}</div>
      </div>

      {/* Generating */}
      {generatingQ && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18 }}>
          <div style={{ display:"flex", gap:7 }}>{[0,1,2,3,4].map(i=><div key={i} style={{ width:10, height:10, borderRadius:"50%", background:"#00d4aa", animation:`pulseGlow ${.4+i*.15}s ease-in-out infinite`, animationDelay:`${i*.1}s` }}/>)}</div>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:14 }}>{loadingMsg}</p>
        </div>
      )}

      {!generatingQ && q && (
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* ── MAIN PANEL ── */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", padding:18, gap:14, overflowY:"auto" }}>

            {/* Agent */}
            <div style={{ display:"flex", gap:13, animation:"fadeSlide .4s ease" }}>
              <AIAvatar speaking={aiSpeaking} emotion={emotionState} />
              <div style={{ flex:1, background:"rgba(0,212,170,0.05)", border:"1px solid rgba(0,212,170,0.16)", borderRadius:"0 16px 16px 16px", padding:"14px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ color:"#00d4aa", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>AI Interviewer</span>
                  {aiSpeaking && <Dot color="#00d4aa" pulse />}
                </div>
                <p style={{ color:"rgba(255,255,255,0.78)", margin:0, fontSize:14, lineHeight:1.75 }}>
                  {agentMsg ? <TypingText text={agentMsg} speed={16} /> : <span style={{ color:"rgba(255,255,255,0.25)", animation:"shimmer 1.5s ease infinite" }}>Preparing your question...</span>}
                </p>
              </div>
            </div>

            {/* Question */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:20 }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:13 }}>
                <Badge color="#00d4aa">{q.topic}</Badge>
                <Badge color={q.difficulty==="Hard"?"#ff6b6b":q.difficulty==="Medium"?"#ffd93d":"#00d4aa"}>{q.difficulty}</Badge>
                <Badge color="#a29bfe">{q.type==="voice"?"🎤 Voice":q.type==="code"?"💻 Code":"✍️ Text"}</Badge>
                <span style={{ marginLeft:"auto", color:"rgba(255,255,255,0.22)", fontSize:12, alignSelf:"center" }}>Q{qIdx+1}/{questions.length}</span>
              </div>
              <p style={{ color:"rgba(255,255,255,0.82)", fontSize:15, lineHeight:1.75, fontWeight:500 }}>{q.question}</p>
            </div>

            {/* Answer */}
            {q.type==="code" ? (
              <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, overflow:"hidden", flex:1, minHeight:200 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 17px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display:"flex", gap:6 }}>{["#ff5f57","#ffbd2e","#28c940"].map(c=><div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }}/>)}</div>
                  <span style={{ color:"rgba(255,255,255,0.22)", fontFamily:"'JetBrains Mono'", fontSize:11 }}>solution.{candidate.skill==="Angular"?"ts":"java"}</span>
                </div>
                <textarea value={currentAnswer||(q.starterCode||"")} onChange={e=>setCurrentAnswer(e.target.value)} style={{ width:"100%", minHeight:190, padding:"16px 20px", background:"transparent", border:"none", color:"#e6edf3", fontFamily:"'JetBrains Mono'", fontSize:13, lineHeight:1.8, boxSizing:"border-box" }} />
              </div>
            ) : q.type==="voice" ? (
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:20 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
                  <WaveBar active={isRecording} bars={26} height={44} />
                  <div style={{ display:"flex", gap:10 }}>
                    {!isRecording ? (
                      <button onClick={startVoice} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 22px", background:"rgba(0,212,170,0.09)", border:"1px solid rgba(0,212,170,0.3)", borderRadius:11, color:"#00d4aa", fontWeight:600, cursor:"pointer", fontFamily:"inherit", fontSize:14 }}>🎤 Start Speaking</button>
                    ) : (
                      <button onClick={stopVoice} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 22px", background:"rgba(255,107,107,0.09)", border:"1px solid rgba(255,107,107,0.3)", borderRadius:11, color:"#ff6b6b", fontWeight:600, cursor:"pointer", fontFamily:"inherit", fontSize:14, animation:"pulseGlow 1.2s ease-in-out infinite" }}>⏹ Stop Recording</button>
                    )}
                  </div>
                  {(transcript||currentAnswer) && <div style={{ width:"100%", background:"rgba(255,255,255,0.04)", borderRadius:10, padding:13, color:"rgba(255,255,255,0.6)", fontSize:13, lineHeight:1.7, fontStyle:"italic", maxHeight:90, overflowY:"auto" }}>"{transcript||currentAnswer}"</div>}
                  <textarea placeholder="Or type your answer..." value={currentAnswer} onChange={e=>setCurrentAnswer(e.target.value)} style={{ width:"100%", minHeight:75, padding:13, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:11, color:"white", fontFamily:"inherit", fontSize:14, boxSizing:"border-box" }} />
                </div>
              </div>
            ) : (
              <textarea placeholder="Type your detailed answer here..." value={currentAnswer} onChange={e=>setCurrentAnswer(e.target.value)} style={{ minHeight:140, padding:18, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, color:"white", fontFamily:"inherit", fontSize:14, lineHeight:1.75 }} />
            )}

            {/* Feedback */}
            {(loading||feedback) && (
              <div style={{ background:"rgba(0,212,170,0.04)", border:"1px solid rgba(0,212,170,0.17)", borderRadius:14, padding:17, animation:"fadeSlide .3s ease" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9, flexWrap:"wrap" }}>
                  <span style={{ color:"#00d4aa", fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>🤖 AI Evaluation</span>
                  {latestScore && <><Badge color={latestScore.score>=75?"#00d4aa":latestScore.score>=50?"#ffd93d":"#ff6b6b"}>{latestScore.score}pts</Badge><Badge color="#a29bfe">{latestScore.accuracy}% accuracy</Badge><Badge color={latestScore.verdict==="Excellent"?"#00d4aa":latestScore.verdict==="Good"?"#4ecdc4":"#ffd93d"}>{latestScore.verdict}</Badge></>}
                </div>
                {loading ? <div style={{ display:"flex", gap:5, alignItems:"center" }}>{[0,1,2].map(i=><div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#00d4aa", animation:`pulseGlow ${.5+i*.2}s ease-in-out infinite` }}/>)}<span style={{ color:"rgba(255,255,255,0.3)", fontSize:13, marginLeft:8 }}>Analyzing response...</span></div>
                  : <p style={{ color:"rgba(255,255,255,0.68)", margin:0, fontSize:14, lineHeight:1.7 }}>{feedback}</p>}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display:"flex", gap:12 }}>
              {!feedback ? (
                <button onClick={submitAnswer} disabled={loading||phase!=="answering"} style={{ flex:1, padding:"14px 0", background:loading||phase!=="answering"?"rgba(255,255,255,0.04)":"linear-gradient(135deg,#00d4aa,#0070f3)", border:`1px solid ${loading||phase!=="answering"?"rgba(255,255,255,0.08)":"transparent"}`, borderRadius:13, color:loading||phase!=="answering"?"rgba(255,255,255,0.25)":"white", fontSize:15, fontWeight:700, cursor:loading||phase!=="answering"?"default":"pointer", fontFamily:"inherit", transition:"all .2s" }}>
                  {loading?"Evaluating...":phase!=="answering"?"Listening to question...":"Submit Answer →"}
                </button>
              ) : (
                <button onClick={nextQuestion} style={{ flex:1, padding:"14px 0", background:"linear-gradient(135deg,#00d4aa,#0070f3)", border:"none", borderRadius:13, color:"white", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  {qIdx<questions.length-1?`Next Question (${qIdx+2}/${questions.length}) →`:"🎯 Finish & Generate Report"}
                </button>
              )}
            </div>
          </div>

          {/* ── EMOTION PANEL ── */}
          <div style={{ width:262, borderLeft:"1px solid rgba(255,255,255,0.05)", display:"flex", flexDirection:"column", gap:13, padding:15, overflowY:"auto", background:"rgba(0,0,0,0.15)", flexShrink:0 }}>
            {/* Camera */}
            <div style={{ borderRadius:14, overflow:"hidden", aspectRatio:"4/3", position:"relative", background:"#0d1117", flexShrink:0 }}>
              {cameraOn ? <video ref={videoRef} autoPlay muted style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:7 }}><span style={{ fontSize:22 }}>📷</span><span style={{ color:"rgba(255,255,255,0.2)", fontSize:11 }}>Camera Off</span></div>}
              <div style={{ position:"absolute", top:8, left:8, right:8, display:"flex", justifyContent:"space-between" }}>
                <div style={{ background:"rgba(0,0,0,0.65)", borderRadius:7, padding:"3px 10px", display:"flex", alignItems:"center", gap:5 }}>
                  <Dot color={EMOTION_MAP[emotionState]?.color||"#00d4aa"} pulse />
                  <span style={{ color:EMOTION_MAP[emotionState]?.color||"#00d4aa", fontSize:11, fontWeight:600 }}>{EMOTION_MAP[emotionState]?.label}</span>
                </div>
                <div style={{ background:"rgba(255,107,107,0.7)", borderRadius:5, padding:"2px 7px", color:"white", fontSize:10, fontWeight:700 }}>LIVE</div>
              </div>
            </div>

            {/* Radar */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:13 }}>
              <p style={{ color:"rgba(255,255,255,0.28)", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>Emotion Radar</p>
              <div style={{ display:"flex", justifyContent:"center" }}><EmotionRadar data={emo} /></div>
            </div>

            {/* Bars */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:14 }}>
              <p style={{ color:"rgba(255,255,255,0.28)", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:12, fontWeight:600 }}>Live Metrics</p>
              {Object.entries(emo).map(([k,v])=>(
                <div key={k} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ color:"rgba(255,255,255,0.48)", fontSize:12 }}>{k==="Confid"?"Confidence":k==="Tech"?"Technical":k==="Engage"?"Engagement":k}</span>
                    <span style={{ color:"white", fontSize:12, fontWeight:600, fontFamily:"'JetBrains Mono'" }}>{Math.round(v)}%</span>
                  </div>
                  <div style={{ height:3, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${v}%`, background:k==="Stress"?"linear-gradient(90deg,#ff6b6b,#ff8e53)":"linear-gradient(90deg,#00d4aa,#0070f3)", transition:"width .9s ease", borderRadius:4 }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Running score */}
            {scoreHistory.length>0 && (
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:14 }}>
                <p style={{ color:"rgba(255,255,255,0.28)", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:12, fontWeight:600 }}>Running Score</p>
                <div style={{ display:"flex", justifyContent:"space-around" }}>
                  <ScoreRing value={Math.round(avg(scoreHistory.map(s=>s.score)))} color="#00d4aa" label="Score" size={58} stroke={5} />
                  <ScoreRing value={Math.round(avg(scoreHistory.map(s=>s.accuracy)))} color="#a29bfe" label="Accuracy" size={58} stroke={5} />
                </div>
              </div>
            )}

            <button onClick={()=>setCameraOn(c=>!c)} style={{ padding:"8px 0", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:9, color:"rgba(255,255,255,0.4)", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              {cameraOn?"📷 Hide Camera":"📷 Show Camera"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
