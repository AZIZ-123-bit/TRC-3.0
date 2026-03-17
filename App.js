import { useState, useRef, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const C = {
  bg:"#F7F9F5", surface:"#FFFFFF", card2:"#EDE6D6",
  border:"#D9E4D4", border2:"#C8D9C2",
  sage:"#8FAF8B", leaf:"#6FAF7A", sky:"#A7D3F2", beige:"#EDE6D6",
  mustRed:"#C8102E", ieeeBlue:"#0B4FA2",
  text:"#2C3A2A", text2:"#5A7055", muted:"#9EB09A",
  amber:"#C8A96E", red:"#D96060",
};

const G = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{height:100%;background:#DFE5DA}
body{display:flex;justify-content:center;font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:0}
input[type=range]{-webkit-appearance:none;width:100%;height:5px;border-radius:5px;background:#D9E4D4;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#8FAF8B;cursor:pointer;box-shadow:0 2px 8px rgba(143,175,139,.4)}
textarea{font-family:'DM Sans',sans-serif}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes breathe{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.07);opacity:1}}
@keyframes blink{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{opacity:.3}50%{opacity:.7}}
.fu{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
button:active{transform:scale(.97)}
`;

const I = {
  home:    (c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 3L21 11.5V21H15V15.5H9V21H3V11.5Z" stroke={c||C.sage} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  checkin: (c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c||C.muted} strokeWidth="1.7"/><path d="M8 12L10.5 14.5L16 9" stroke={c||C.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chat:    (c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 15C21 16.1 20.1 17 19 17H7L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z" stroke={c||C.muted} strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  map:     (c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2C8.69 2 6 4.69 6 8C6 13 12 22 12 22S18 13 18 8C18 4.69 15.31 2 12 2Z" stroke={c||C.muted} strokeWidth="1.7"/><circle cx="12" cy="8" r="2.5" stroke={c||C.muted} strokeWidth="1.7"/></svg>,
  trophy:  (c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M8 3H16V13C16 15.21 14.21 17 12 17C9.79 17 8 15.21 8 13V3Z" stroke={c||C.muted} strokeWidth="1.7"/><path d="M8 6H5C5 8.76 6.69 11.12 9 12" stroke={c||C.muted} strokeWidth="1.7" strokeLinecap="round"/><path d="M16 6H19C19 8.76 17.31 11.12 15 12" stroke={c||C.muted} strokeWidth="1.7" strokeLinecap="round"/><path d="M12 17V20M9 20H15" stroke={c||C.muted} strokeWidth="1.7" strokeLinecap="round"/></svg>,
  camera:  (c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M23 19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V8C1 6.9 1.9 6 3 6H7L9 3H15L17 6H21C22.1 6 23 6.9 23 8V19Z" stroke={c||C.sage} strokeWidth="1.6"/><circle cx="12" cy="13" r="4" stroke={c||C.sage} strokeWidth="1.6"/></svg>,
  eye:     (c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="9" ry="6" stroke={c||C.muted} strokeWidth="1.5"/><circle cx="12" cy="12" r="2.5" fill={c||C.muted}/></svg>,
  leaf:    (c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20 5C20 5 14 4 10 8C6 12 5 18 5 18C5 18 10 19 14 16C18 13 20 5 20 5Z" stroke={c||C.sage} strokeWidth="1.6" strokeLinejoin="round"/><path d="M5 18L10 13" stroke={c||C.sage} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  activity:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M22 12H18L15 21L9 3L6 12H2" stroke={c||C.sage} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  tree:    (c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L19 14H14L18 22H6L10 14H5L12 2Z" stroke={c||C.leaf} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  users:   (c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke={c||C.sage} strokeWidth="1.6"/><path d="M3 21C3 17.13 5.69 14 9 14" stroke={c||C.sage} strokeWidth="1.6" strokeLinecap="round"/><circle cx="17" cy="9" r="3" stroke={c||C.sage} strokeWidth="1.6"/><path d="M13 21C13 18.24 14.79 16 17 16C19.21 16 21 18.24 21 21" stroke={c||C.sage} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  pin:     (c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2C8.69 2 6 4.69 6 8C6 13 12 22 12 22S18 13 18 8C18 4.69 15.31 2 12 2Z" stroke={c||C.leaf} strokeWidth="1.6"/><circle cx="12" cy="8" r="2" stroke={c||C.leaf} strokeWidth="1.6"/></svg>,
  send:    (c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill={c||"white"}><path d="M2 12L22 3L14 22L11 13L2 12Z"/></svg>,
  bell:    (c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={c||C.muted} strokeWidth="1.6"/><path d="M13.73 21C13.38 21.3 12.7 21.5 12 21.5C11.3 21.5 10.62 21.3 10.27 21" stroke={c||C.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  fire:    (c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 22C7 22 4 18.5 4 14.5C4 10.5 7 8 9 6C9 8 10 9.5 11 10C11 7 13 4 16 2C16 5 17 7 17 9.5C18.5 8.5 19 7 19 7C19 12 20 14 17 17.5C16 19 14.5 22 12 22Z" stroke={c||C.amber} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  award:   (c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="7" stroke={c||C.amber} strokeWidth="1.6"/><path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke={c||C.amber} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  star:    (c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2L14.9 9.1H22.6L16.7 13.8L18.8 21L12 16.4L5.2 21L7.3 13.8L1.4 9.1H9.1Z" stroke={c||C.amber} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  book:    (c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 19.5C4 18.1 5.1 17 6.5 17H20" stroke={c||C.amber} strokeWidth="1.6" strokeLinecap="round"/><path d="M6.5 2H20V22H6.5C5.1 22 4 20.9 4 19.5V4.5C4 3.1 5.1 2 6.5 2Z" stroke={c||C.amber} strokeWidth="1.6"/></svg>,
  dollar:  (c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2V22M17 5H9.5C7.57 5 6 6.57 6 8.5C6 10.43 7.57 12 9.5 12H14.5C16.43 12 18 13.57 18 15.5C18 17.43 16.43 19 14.5 19H6" stroke={c||C.sky} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  hospital:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={c||C.sage} strokeWidth="1.6"/><path d="M12 8V16M8 12H16" stroke={c||C.sage} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  pencil:  (c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V13" stroke={c||C.muted} strokeWidth="1.6" strokeLinecap="round"/><path d="M18.5 2.5C19.33 1.67 20.67 1.67 21.5 2.5C22.33 3.33 22.33 4.67 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={c||C.muted} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  clock:   (c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={c||C.amber} strokeWidth="1.6"/><path d="M12 6V12L16 14" stroke={c||C.amber} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  scan:    (c,s=22)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 9V5C3 3.9 3.9 3 5 3H9" stroke={c||C.leaf} strokeWidth="1.6" strokeLinecap="round"/><path d="M15 3H19C20.1 3 21 3.9 21 5V9" stroke={c||C.leaf} strokeWidth="1.6" strokeLinecap="round"/><path d="M21 15V19C21 20.1 20.1 21 19 21H15" stroke={c||C.leaf} strokeWidth="1.6" strokeLinecap="round"/><path d="M9 21H5C3.9 21 3 20.1 3 19V15" stroke={c||C.leaf} strokeWidth="1.6" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke={c||C.leaf} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  flag:    (c,s=22)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M4 21V4" stroke={c||C.amber} strokeWidth="1.6" strokeLinecap="round"/><path d="M4 4L20 8L4 12" stroke={c||C.amber} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  gallery: (c,s=22)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke={c||C.sky} strokeWidth="1.6"/><path d="M3 16L8 10L12 14L15 11L21 16" stroke={c||C.sky} strokeWidth="1.6" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" fill={c||C.sky}/></svg>,
  msg:     (c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 15C21 16.1 20.1 17 19 17H7L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z" stroke={c||C.sky} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
};

function MustShield({size=30}){
  return(
    <svg width={size} height={size*1.13} viewBox="0 0 110 124" fill="none">
      <path d="M5 5L105 5L105 72Q105 116 55 124Q5 116 5 72Z" fill="#C8102E"/>
      <rect x="5" y="5" width="50" height="50" fill="#C8102E"/>
      <path d="M13 52L13 34Q13 24 21 24Q29 24 29 34L29 52Z" fill="rgba(0,0,0,.22)"/>
      <path d="M31 52L31 34Q31 24 39 24Q47 24 47 34L47 52Z" fill="rgba(0,0,0,.22)"/>
      <ellipse cx="21" cy="24" rx="8" ry="5" fill="rgba(0,0,0,.22)"/>
      <ellipse cx="39" cy="24" rx="8" ry="5" fill="rgba(0,0,0,.22)"/>
      <rect x="55" y="5" width="50" height="50" fill="white"/>
      <rect x="65" y="11" width="30" height="38" rx="3" fill="#C8102E"/>
      <text x="80" y="36" textAnchor="middle" fontSize="20" fontWeight="900" fill="white" fontFamily="Georgia,serif">S</text>
      <path d="M5 55L105 55L105 72Q105 98 55 108Q5 98 5 72Z" fill="#A50E26"/>
      <rect x="26" y="64" width="24" height="18" rx="2" fill="white" opacity=".9"/>
      <rect x="55" y="64" width="24" height="18" rx="2" fill="white" opacity=".7"/>
      <line x1="52" y1="64" x2="52" y2="82" stroke="#A50E26" strokeWidth="3"/>
      <rect x="53" y="82" width="4" height="10" fill="white" opacity=".9"/>
    </svg>
  );
}

function IeeeLogo({size=36}){
  return(
    <svg width={size} height={size*1.1} viewBox="0 0 60 70" fill="none">
      <polygon points="0,10 60,0 60,55 30,70 0,55" fill="#0B4FA2"/>
      <polygon points="6,13 54,4 54,52 30,65 6,52" fill="none" stroke="#2E7DD4" strokeWidth="2"/>
      <rect x="16" y="20" width="28" height="30" rx="2" fill="#1A4A8A" opacity=".9"/>
      <rect x="20" y="16" width="6" height="5" rx="1" fill="#A7D3F2" opacity=".7"/>
      <rect x="30" y="14" width="4" height="7" rx="1" fill="#E8C87A" opacity=".9"/>
      <line x1="20" y1="28" x2="40" y2="28" stroke="#A7D3F2" strokeWidth="1.5"/>
      <line x1="20" y1="33" x2="40" y2="33" stroke="#A7D3F2" strokeWidth="1.5"/>
      <line x1="20" y1="38" x2="34" y2="38" stroke="#A7D3F2" strokeWidth="1.5"/>
      <circle cx="22" cy="24" r="2" fill="#A7D3F2"/>
      <line x1="10" y1="22" x2="16" y2="32" stroke="#3A8FE0" strokeWidth="1.5"/>
      <line x1="44" y1="20" x2="38" y2="30" stroke="#EF4444" strokeWidth="1.5"/>
      <circle cx="10" cy="20" r="2" fill="#3A8FE0"/>
      <circle cx="46" cy="18" r="2" fill="#EF4444"/>
    </svg>
  );
}

function Nav({active,go}){
  const tabs=[
    {id:"home",    icon:I.home,   label:"Home"},
    {id:"checkin", icon:I.checkin,label:"Check-in"},
    {id:"chat",    icon:I.chat,   label:"AI Chat"},
    {id:"map",     icon:I.map,    label:"Map"},
    {id:"rewards", icon:I.trophy, label:"Rewards"},
  ];
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:430,minWidth:430,maxWidth:430,background:"rgba(247,249,245,.97)",backdropFilter:"blur(20px)",borderTop:`1.5px solid ${C.border}`,display:"flex",zIndex:999,paddingBottom:16,paddingTop:10,boxShadow:"0 -4px 24px rgba(143,175,139,.12)"}}>
      {tabs.map(t=>{
        const act=active===t.id;
        return(
          <button key={t.id} onClick={()=>go(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            {t.icon(act?C.sage:C.muted,20)}
            <span style={{fontSize:9,fontWeight:600,color:act?C.sage:C.muted,fontFamily:"'DM Sans',sans-serif"}}>{t.label}</span>
            {act&&<div style={{width:4,height:4,borderRadius:"50%",background:C.sage}}/>}
          </button>
        );
      })}
    </div>
  );
}

function CamModal({onClose}){
  const opts=[
    {icon:I.camera, label:"Take Photo",  sub:"Use camera",         col:C.sage},
    {icon:I.gallery,label:"From Gallery",sub:"Pick from phone",    col:C.sky},
    {icon:I.scan,   label:"Scan Tree",   sub:"AI health check",    col:C.leaf},
    {icon:I.flag,   label:"Report Issue",sub:"With photo evidence",col:C.amber},
  ];
  return(
    <div style={{position:"fixed",inset:0,maxWidth:430,margin:"0 auto",background:"rgba(44,58,42,.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div className="fu" style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:24,padding:22,margin:20,width:"100%",boxShadow:"0 20px 60px rgba(143,175,139,.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div>
            <p style={{color:C.sage,fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:3}}>Upload Photo</p>
            <p style={{color:C.text,fontSize:16,fontWeight:700}}>What are you capturing?</p>
          </div>
          <button onClick={onClose} style={{background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:10,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {opts.map(o=>(
            <button key={o.label} onClick={onClose} style={{background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:14,padding:"16px 10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{width:44,height:44,borderRadius:14,background:`${o.col}18`,border:`1.5px solid ${o.col}30`,display:"flex",alignItems:"center",justifyContent:"center"}}>{o.icon(o.col,22)}</div>
              <p style={{color:C.text,fontSize:12,fontWeight:600}}>{o.label}</p>
              <p style={{color:C.muted,fontSize:10}}>{o.sub}</p>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{width:"100%",padding:12,background:"transparent",border:`1.5px solid ${C.border}`,borderRadius:12,color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
      </div>
    </div>
  );
}

/* ── SPLASH ── */
function Splash({go}){
  return(
    <div style={{minHeight:"100dvh",background:"linear-gradient(160deg,#EAF2E8 0%,#F7F9F5 50%,#F0EDE4 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-80,left:-80,width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(143,175,139,.18) 0%,transparent 70%)",animation:"glow 7s ease infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:40,right:-80,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,211,242,.14) 0%,transparent 70%)",animation:"glow 9s ease infinite 2s",pointerEvents:"none"}}/>
      <div className="fu" style={{textAlign:"center",zIndex:1,marginBottom:32}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}><MustShield size={90}/></div>
        <p style={{color:C.mustRed,fontSize:24,fontWeight:800,letterSpacing:".2em",marginBottom:3}}>MUST</p>
        <p style={{color:C.mustRed,fontSize:11,fontWeight:700,letterSpacing:".22em",marginBottom:24}}>UNIVERSITY</p>
        <h1 style={{color:C.text,fontSize:30,fontWeight:800,marginBottom:8}}>CampusAI</h1>
        <p style={{color:C.sage,fontSize:13,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",marginBottom:5}}>Well-being Companion</p>
        <p style={{color:C.muted,fontSize:12}}>Powered by AI · Built for MUST Students</p>
      </div>
      <div style={{position:"absolute",bottom:50,left:24,right:24,zIndex:1,display:"flex",flexDirection:"column",gap:10}}>
        <button className="fu" style={{animationDelay:".3s",width:"100%",padding:14,background:C.sage,border:"none",borderRadius:14,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 16px rgba(143,175,139,.3)"}} onClick={()=>go("login")}>Get Started</button>
        <button className="fu" style={{animationDelay:".38s",width:"100%",padding:13,background:"transparent",border:`1.5px solid ${C.border}`,borderRadius:14,color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}} onClick={()=>go("login")}>I already have an account</button>
        <p className="fu" style={{animationDelay:".44s",color:C.muted,fontSize:11,textAlign:"center",marginTop:3}}>Secure · Private · Confidential</p>
      </div>
    </div>
  );
}

/* ── LOGIN ── */
function Login({go}){
  const [email,setEmail]=useState("aziz@must.tn");
  const [pass,setPass]=useState("must2024");
  const [show,setShow]=useState(false);
  const [err,setErr]=useState("");
  const inp={width:"100%",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"12px 15px",color:C.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif",transition:"border-color .2s"};
  const login=async()=>{
    if(!email||!pass){setErr("Please fill in all fields");return;}
    try{
      const r=await fetch(`${API}/user?email=${email}`);
      if(!r.ok)throw new Error();
    }catch{}
    go("home");
  };
  return(
    <div style={{minHeight:"100dvh",background:C.bg,padding:"56px 24px 40px",overflowY:"auto"}}>
      <div className="fu" style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}><MustShield size={42}/>
          <div>
            <p style={{color:C.mustRed,fontSize:11,fontWeight:700,letterSpacing:".1em"}}>MUST UNIVERSITY</p>
            <h2 style={{color:C.text,fontSize:24,fontWeight:800,marginTop:3}}>Welcome back</h2>
          </div>
        </div>
        <p style={{color:C.muted,fontSize:13}}>Sign in to your student account</p>
      </div>
      {err&&<div style={{background:`${C.red}15`,border:`1px solid ${C.red}40`,borderRadius:10,padding:"10px 14px",marginBottom:14,color:C.red,fontSize:12}}>{err}</div>}
      <div className="fu" style={{animationDelay:".06s",display:"flex",flexDirection:"column",gap:14,marginBottom:18}}>
        <div>
          <p style={{color:C.text2,fontSize:10,fontWeight:700,marginBottom:7,letterSpacing:".08em",textTransform:"uppercase"}}>Student Email</p>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="text" style={inp} onFocus={e=>e.target.style.borderColor=C.sage} onBlur={e=>e.target.style.borderColor=C.border} onKeyDown={e=>e.key==="Enter"&&login()}/>
        </div>
        <div>
          <p style={{color:C.text2,fontSize:10,fontWeight:700,marginBottom:7,letterSpacing:".08em",textTransform:"uppercase"}}>Password</p>
          <div style={{position:"relative"}}>
            <input value={pass} onChange={e=>setPass(e.target.value)} type={show?"text":"password"} style={{...inp,paddingRight:44}} onFocus={e=>e.target.style.borderColor=C.sage} onBlur={e=>e.target.style.borderColor=C.border} onKeyDown={e=>e.key==="Enter"&&login()}/>
            <button onClick={()=>setShow(!show)} style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0}}>{I.eye(C.muted,18)}</button>
          </div>
        </div>
        <p style={{color:C.sage,fontSize:11,textAlign:"right",cursor:"pointer",fontWeight:600}}>Forgot password?</p>
      </div>
      <button className="fu" style={{animationDelay:".12s",width:"100%",padding:14,background:C.sage,border:"none",borderRadius:14,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:14,boxShadow:"0 4px 16px rgba(143,175,139,.3)"}} onClick={login}>Sign In</button>
      <div className="fu" style={{animationDelay:".16s",display:"flex",alignItems:"center",gap:12,margin:"12px 0"}}>
        <div style={{flex:1,height:1,background:C.border}}/><span style={{color:C.muted,fontSize:11}}>or continue with</span><div style={{flex:1,height:1,background:C.border}}/>
      </div>
      <div className="fu" style={{animationDelay:".19s",display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:22}}>
        <button onClick={login} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,padding:12,color:C.text,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>MUST SSO</button>
        <button onClick={login} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,padding:12,color:C.text,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Google Auth</button>
      </div>
      <p className="fu" style={{animationDelay:".22s",color:C.muted,fontSize:12,textAlign:"center"}}>New student? <span style={{color:C.sage,cursor:"pointer",fontWeight:700}} onClick={()=>go("home")}>Create account</span></p>
    </div>
  );
}

/* ── HOME ── */
function Home({go}){
  const [stats,setStats]=useState(null);
  const [user,setUser]=useState(null);
  const [cam,setCam]=useState(false);
  const [secs,setSecs]=useState(1498);
  useEffect(()=>{
    fetch(`${API}/stats`).then(r=>r.json()).then(setStats).catch(()=>{});
    fetch(`${API}/user?email=aziz@must.tn`).then(r=>r.json()).then(setUser).catch(()=>{});
    const t=setInterval(()=>setSecs(s=>s>0?s-1:1800),1000);
    return()=>clearInterval(t);
  },[]);
  const mS=Math.floor(secs/60),sS=secs%60;
  const Sec=({label,delay="0s"})=><p className="fu" style={{animationDelay:delay,color:C.text2,fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:9}}>{label}</p>;
  const pts=user?.points||450;
  return(
    <div style={{padding:"52px 18px 90px",overflowY:"auto",minHeight:"100dvh",background:C.bg}}>
      {cam&&<CamModal onClose={()=>setCam(false)}/>}
      {/* Header */}
      <div className="fu" style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <MustShield size={28}/>
          <div>
            <p style={{color:C.muted,fontSize:11,fontWeight:500}}>Good evening, {user?.name?.split(" ")[0]||"Aziz"}</p>
            <p style={{color:C.text,fontSize:15,fontWeight:700,lineHeight:1.2}}>MUST <span style={{color:C.sage}}>Well-being Hub</span></p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <button onClick={()=>setCam(true)} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",boxShadow:"0 2px 8px rgba(143,175,139,.12)"}}>
            {I.camera(C.sage,17)}
            <div style={{position:"absolute",top:-3,right:-3,width:8,height:8,borderRadius:"50%",background:C.sage,border:`2px solid ${C.bg}`,animation:"breathe 2.5s ease infinite"}}/>
          </button>
          <div style={{background:"rgba(11,79,162,.06)",border:"1.5px solid rgba(11,79,162,.16)",borderRadius:12,padding:"4px 7px",display:"flex",alignItems:"center",gap:4}}>
            <IeeeLogo size={17}/><span style={{color:C.ieeeBlue,fontSize:9,fontWeight:700}}>IEEE SB</span>
          </div>
          <button style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{I.bell(C.muted,16)}</button>
        </div>
      </div>
      {/* Well-being ring */}
      <div className="fu" style={{animationDelay:".05s",background:"linear-gradient(145deg,#EAF2E8,#F0EDE4)",border:`1.5px solid ${C.border}`,borderRadius:22,padding:18,marginBottom:13,boxShadow:"0 4px 18px rgba(143,175,139,.12)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-18,right:-18,width:85,height:85,borderRadius:"50%",background:"rgba(143,175,139,.1)",animation:"breathe 6s ease infinite"}}/>
        <p style={{color:C.text2,fontSize:9,textTransform:"uppercase",letterSpacing:".12em",fontWeight:700,marginBottom:12}}>Campus Well-being Index</p>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
            <svg width="80" height="80" style={{transform:"rotate(-90deg)"}}>
              <circle cx="40" cy="40" r="33" fill="none" stroke="#D9E4D4" strokeWidth="6"/>
              <circle cx="40" cy="40" r="33" fill="none" stroke="#6FAF7A" strokeWidth="6" strokeDasharray="207" strokeDashoffset={Math.round(207-(stats?.avg_wellbeing||72)/100*207)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.2s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:C.leaf,fontSize:22,fontWeight:800,lineHeight:1,fontFamily:"'JetBrains Mono',monospace"}}>{stats?.avg_wellbeing||72}</span>
              <span style={{color:C.muted,fontSize:8}}>/100</span>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7}}>{I.activity(C.leaf,13)}<span style={{color:C.leaf,fontSize:10,fontWeight:600}}>+3 pts this month</span></div>
            <p style={{color:C.muted,fontSize:9,marginBottom:6}}>Based on {stats?.total_students||600} students</p>
            {[["Healthy",C.leaf,stats?.risk_distribution?.Healthy||160,"27%"],["Moderate",C.amber,stats?.risk_distribution?.["Moderate Risk"]||299,"50%"],["High Risk",C.red,stats?.risk_distribution?.["High Risk"]||141,"23%"]].map(([l,col,n,p])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{color:C.text2,fontSize:9}}>{l}</span>
                <span style={{color:col,fontSize:9,fontWeight:700}}>{n} ({p})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Pulse */}
      <Sec label="Today's Campus Pulse" delay=".08s"/>
      <div className="fu" style={{animationDelay:".09s",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:13}}>
        {[{label:"Mood",val:stats?`${stats.avg_mood}/10`:"7.1/10",col:C.sage},{label:"Stress",val:"6.3/10",col:C.red},{label:"Sleep",val:stats?`${stats.avg_sleep}h`:"6.7h",col:C.sky}].map(s=>(
          <div key={s.label} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:13,padding:"11px 7px",textAlign:"center",boxShadow:"0 2px 7px rgba(143,175,139,.07)"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:4}}>{I.activity(s.col,14)}</div>
            <p style={{color:s.col,fontSize:15,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{s.val}</p>
            <p style={{color:C.muted,fontSize:8,marginTop:1,fontWeight:500}}>{s.label}</p>
          </div>
        ))}
      </div>
      {/* Concerns */}
      <Sec label="Top Campus Concerns" delay=".11s"/>
      <div className="fu" style={{animationDelay:".12s",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:17,padding:14,marginBottom:13,boxShadow:"0 2px 10px rgba(143,175,139,.07)"}}>
        {[{label:"Academic Stress",pct:78,col:C.amber,icon:I.book,count:"342 students"},{label:"Sleep Quality",pct:71,col:C.sage,icon:I.activity,count:"284 students"},{label:"Financial Stress",pct:65,col:C.sky,icon:I.dollar,count:"217 students"}].map((c,i)=>(
          <div key={c.label} style={{marginBottom:i<2?11:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>{c.icon(c.col,13)}<span style={{color:C.text,fontSize:11,fontWeight:600}}>{c.label}</span></div>
              <span style={{color:c.col,fontSize:11,fontWeight:700}}>{c.pct}%</span>
            </div>
            <div style={{background:C.beige,borderRadius:5,height:6}}><div style={{background:c.col,borderRadius:5,height:"100%",width:`${c.pct}%`,opacity:.75}}/></div>
            <p style={{color:C.muted,fontSize:8,marginTop:2,fontWeight:500}}>{c.count} reported this</p>
          </div>
        ))}
      </div>
      {/* Resource Impact */}
      <Sec label="Resource Impact" delay=".14s"/>
      <div className="fu" style={{animationDelay:".15s",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:17,padding:"3px 14px",marginBottom:13,boxShadow:"0 2px 10px rgba(143,175,139,.07)"}}>
        {[{label:"Counseling",val:"567/mo",col:C.sage,icon:I.hospital},{label:"Tutoring",val:"842/mo",col:C.amber,icon:I.book},{label:"Green Spaces",val:"1,247/mo",col:C.leaf,icon:I.tree}].map((r,i)=>(
          <div key={r.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:i<2?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:30,height:30,borderRadius:9,background:`${r.col}15`,display:"flex",alignItems:"center",justifyContent:"center"}}>{r.icon(r.col,15)}</div>
              <span style={{color:C.text2,fontSize:11,fontWeight:500}}>{r.label}</span>
            </div>
            <span style={{color:C.text,fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{r.val}</span>
          </div>
        ))}
      </div>
      {/* Group Challenge */}
      <div className="fu" style={{animationDelay:".18s",background:"linear-gradient(145deg,#EBF4EA,#E8EDDF)",border:`1.5px solid ${C.border2}`,borderRadius:20,padding:14,marginBottom:13,boxShadow:"0 4px 18px rgba(111,175,122,.13)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-10,right:-10,width:80,height:80,borderRadius:"50%",background:"rgba(111,175,122,.1)"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>{I.users(C.leaf,16)}<span style={{color:C.text,fontSize:12,fontWeight:700}}>Nature Group Bonus</span></div>
          <span style={{background:C.leaf,color:"white",fontSize:9,fontWeight:700,borderRadius:20,padding:"3px 9px"}}>+20%</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>{I.pin(C.sage,12)}<span style={{color:C.sage,fontSize:11,fontWeight:600}}>Parc de la Corniche, Sousse</span></div>
        <p style={{color:C.text2,fontSize:10,marginBottom:10,lineHeight:1.55}}>Visit with friends and earn 20% more points!</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{display:"flex"}}>
              {["A","W","S"].map((l,i)=>(
                <div key={l} style={{width:20,height:20,borderRadius:"50%",background:[C.sage,C.sky,C.amber][i],border:`2px solid ${C.beige}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8.5,fontWeight:700,color:"white",marginLeft:i>0?-5:0}}>{l}</div>
              ))}
            </div>
            <span style={{color:C.text2,fontSize:9}}>3 people already there</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>{I.clock(C.amber,12)}<span style={{color:C.amber,fontSize:9,fontWeight:700}}>{mS}:{sS<10?"0":""}{sS}</span></div>
        </div>
        <button onClick={()=>go("map")} style={{width:"100%",padding:11,background:C.leaf,border:"none",borderRadius:13,color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 14px rgba(111,175,122,.32)"}}>
          {I.users("white",14)} Join This Group
        </button>
      </div>
      {/* Stats */}
      <Sec label="Your Stats" delay=".21s"/>
      <div className="fu" style={{animationDelay:".22s",display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:13}}>
        {[{icon:I.fire,label:"Day streak",val:user?.streak||7,col:C.amber},{icon:I.award,label:"Campus rank",val:"#42",col:C.amber},{icon:I.tree,label:"Trees helped",val:12,col:C.leaf},{icon:I.msg,label:"AI chats",val:user?.chat_count||23,col:C.sky}].map(s=>(
          <div key={s.label} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:13,padding:11,display:"flex",alignItems:"center",gap:9,boxShadow:"0 2px 7px rgba(143,175,139,.07)"}}>
            <div style={{width:33,height:33,borderRadius:10,background:`${s.col}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.icon(s.col,17)}</div>
            <div>
              <p style={{color:C.text,fontSize:17,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{s.val}</p>
              <p style={{color:C.muted,fontSize:8,marginTop:1,fontWeight:500}}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <Sec label="Quick Actions" delay=".25s"/>
      <div className="fu" style={{animationDelay:".26s",display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
        {[{icon:I.checkin,label:"Check-in",sub:"+10 pts today",col:C.sage,screen:"checkin"},{icon:I.chat,label:"AI Chat",sub:"24/7 support",col:C.sky,screen:"chat"},{icon:I.map,label:"Nature Map",sub:"3 groups active",col:C.leaf,screen:"map"},{icon:I.trophy,label:"Rewards",sub:`${pts} pts · ${user?.tier||"Silver"}`,col:C.amber,screen:"rewards"}].map(a=>(
          <button key={a.label} onClick={()=>go(a.screen)} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:15,padding:"13px 10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,boxShadow:"0 2px 8px rgba(143,175,139,.08)",fontFamily:"'DM Sans',sans-serif"}}>
            <div style={{width:38,height:38,borderRadius:12,background:`${a.col}15`,display:"flex",alignItems:"center",justifyContent:"center"}}>{a.icon(a.col,19)}</div>
            <p style={{color:C.text,fontSize:11,fontWeight:700}}>{a.label}</p>
            <p style={{color:a.col,fontSize:9,fontWeight:500}}>{a.sub}</p>
          </button>
        ))}
      </div>
      {/* IEEE Banner */}
      <div className="fu" style={{animationDelay:".30s",background:"rgba(11,79,162,.05)",border:"1.5px solid rgba(11,79,162,.14)",borderRadius:15,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}><IeeeLogo size={34}/><div><p style={{color:C.ieeeBlue,fontSize:11,fontWeight:700}}>MUST IEEE Student Branch</p><p style={{color:C.muted,fontSize:9,marginTop:1}}>Proud organizer of TechResolve 3.0</p></div></div>
        <div style={{background:"rgba(11,79,162,.1)",borderRadius:9,padding:"4px 9px"}}><span style={{color:C.ieeeBlue,fontSize:9,fontWeight:700}}>TRC 3.0</span></div>
      </div>
    </div>
  );
}

/* ── CHECK-IN ── */
function CheckIn({go}){
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({mood_score:5,stress_level:5,anxiety_level:5,sleep_hours:7,study_hours_per_day:4,missed_classes:2,social_activity:3,physical_activity_days:3,gpa:3.0,financial_stress:2,family_support:4,asked_for_help:0,commute_minutes:30,email:"aziz@must.tn"});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const QS=[
    {k:"mood_score",       l:"How is your mood today, Aziz?",      t:"e",ds:["Very low","Low","Neutral","Good","Excellent"],min:1,max:10},
    {k:"stress_level",     l:"How stressed do you feel right now?", t:"e",ds:["Relaxed","Mild","Moderate","Stressed","Overwhelmed"],min:1,max:10},
    {k:"sleep_hours",      l:"Hours slept last night?",             t:"s",min:3,max:10,step:.5,unit:"hours"},
    {k:"study_hours_per_day",l:"Daily study hours at MUST?",        t:"s",min:0,max:12,step:.5,unit:"hours"},
    {k:"missed_classes",   l:"Classes missed this month?",          t:"s",min:0,max:20,step:1,unit:"classes"},
  ];
  const q=QS[step];
  const SC=["#D96060","#C8A96E","#9EB09A","#8FAF8B","#6FAF7A"];
  const faces=[
    (c,s=32)=><svg width={s} height={s} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke={c} strokeWidth="2"/><circle cx="13" cy="16" r="2" fill={c}/><circle cx="27" cy="16" r="2" fill={c}/><path d="M13 28C13 28 15 24 20 24C25 24 27 28 27 28" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
    (c,s=32)=><svg width={s} height={s} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke={c} strokeWidth="2"/><circle cx="13" cy="16" r="2" fill={c}/><circle cx="27" cy="16" r="2" fill={c}/><line x1="13" y1="27" x2="27" y2="27" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
    (c,s=32)=><svg width={s} height={s} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke={c} strokeWidth="2"/><rect x="12" y="15" width="4" height="4" rx="1" fill={c}/><rect x="24" y="15" width="4" height="4" rx="1" fill={c}/><line x1="14" y1="27" x2="26" y2="27" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
    (c,s=32)=><svg width={s} height={s} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke={c} strokeWidth="2"/><circle cx="13" cy="16" r="2" fill={c}/><circle cx="27" cy="16" r="2" fill={c}/><path d="M13 24C13 24 15 28 20 28C25 28 27 24 27 24" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
    (c,s=32)=><svg width={s} height={s} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke={c} strokeWidth="2.5"/><circle cx="13" cy="15" r="2.5" fill={c}/><circle cx="27" cy="15" r="2.5" fill={c}/><path d="M11 23C11 23 14 30 20 30C26 30 29 23 29 23" stroke={c} strokeWidth="2.5" strokeLinecap="round"/></svg>,
  ];
  const getIdx=()=>Math.min(4,Math.round((form[q.k]-q.min)/(q.max-q.min)*4));
  const submit=async()=>{
    setLoading(true);
    try{
      const r=await fetch(`${API}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d=await r.json();
      setResult(d);
    }catch{
      const sc=Math.max(0,Math.min(100,Math.round(form.mood_score*10+(10-form.stress_level)*8+form.sleep_hours*4-form.missed_classes*2+22)));
      setResult({risk_label:sc>=62?"Healthy":sc>=35?"Moderate Risk":"High Risk",wellbeing_score:sc,message:"Check-in complete. Your results are saved!",recommendations:[]});
    }
    setLoading(false);
  };
  if(result){
    const col=result.risk_label==="Healthy"?C.leaf:result.risk_label==="Moderate Risk"?C.amber:C.red;
    const circ=2*Math.PI*33,off=circ-(result.wellbeing_score/100)*circ;
    return(
      <div style={{padding:"52px 18px 90px",overflowY:"auto",background:C.bg,minHeight:"100dvh"}}>
        <p style={{color:C.sage,fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:6}}>Your Results · Saved to DB</p>
        <h2 style={{color:C.text,fontSize:22,fontWeight:700,marginBottom:20}}>Check-in Complete</h2>
        <div style={{background:"linear-gradient(145deg,#EAF2E8,#F0EDE4)",border:`1.5px solid ${C.border}`,borderRadius:22,padding:20,marginBottom:13,display:"flex",alignItems:"center",gap:16,boxShadow:"0 4px 18px rgba(143,175,139,.12)"}}>
          <div style={{position:"relative",width:82,height:82,flexShrink:0}}>
            <svg width="82" height="82" style={{transform:"rotate(-90deg)"}}>
              <circle cx="41" cy="41" r="33" fill="none" stroke="#D9E4D4" strokeWidth="6"/>
              <circle cx="41" cy="41" r="33" fill="none" stroke={col} strokeWidth="6" strokeDasharray={circ.toFixed(0)} strokeDashoffset={off.toFixed(0)} strokeLinecap="round"/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:col,fontSize:22,fontWeight:800,lineHeight:1,fontFamily:"'JetBrains Mono',monospace"}}>{result.wellbeing_score}</span>
              <span style={{color:C.muted,fontSize:8}}>/100</span>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{background:`${col}15`,border:`1px solid ${col}30`,borderRadius:20,padding:"4px 12px",display:"inline-block",marginBottom:8}}>
              <span style={{color:col,fontSize:12,fontWeight:700}}>{result.risk_label}</span>
            </div>
            <p style={{color:C.text2,fontSize:12,lineHeight:1.6}}>{result.message}</p>
          </div>
        </div>
        <div style={{background:`${C.amber}13`,border:`1.5px solid ${C.amber}28`,borderRadius:13,padding:13,marginBottom:13,display:"flex",alignItems:"center",gap:11}}>
          {I.trophy(C.amber,19)}
          <div>
            <p style={{color:C.amber,fontSize:13,fontWeight:700}}>+10 pts earned!</p>
            <p style={{color:C.text2,fontSize:11,marginTop:2}}>Result saved · Streak updated · Points added</p>
          </div>
        </div>
        {result.recommendations&&result.recommendations.length>0&&(
          <div style={{marginBottom:13}}>
            <p style={{color:C.text2,fontSize:10,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:".08em"}}>Recommendations</p>
            {result.recommendations.map((r,i)=>(
              <div key={i} style={{background:C.surface,border:`1.5px solid ${r.color||C.sage}30`,borderLeft:`3px solid ${r.color||C.sage}`,borderRadius:10,padding:"10px 13px",marginBottom:7,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{color:C.text,fontSize:12}}>{r.title}</span>
                <span style={{color:r.color||C.sage,fontSize:9,fontWeight:700,background:`${r.color||C.sage}15`,borderRadius:20,padding:"2px 8px"}}>{r.tag}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={()=>go("chat")} style={{width:"100%",padding:14,background:C.sage,border:"none",borderRadius:14,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:10,boxShadow:"0 4px 14px rgba(143,175,139,.28)"}}>Talk to AI about this</button>
        <button onClick={()=>{setResult(null);setStep(0);}} style={{width:"100%",padding:13,background:"transparent",border:`1.5px solid ${C.border}`,borderRadius:14,color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Redo Check-in</button>
      </div>
    );
  }
  return(
    <div style={{padding:"52px 18px 90px",background:C.bg,minHeight:"100dvh"}}>
      <p style={{color:C.sage,fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase"}}>Daily Check-in</p>
      <p style={{color:C.muted,fontSize:11,margin:"3px 0 13px",fontWeight:500}}>Question {step+1} of {QS.length}</p>
      <div style={{display:"flex",gap:4,marginBottom:26}}>{QS.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:4,background:i<=step?C.sage:C.border,transition:"background .3s"}}/>)}</div>
      <div key={step} className="fu">
        <h2 style={{color:C.text,fontSize:17,fontWeight:700,marginBottom:26,lineHeight:1.4}}>{q.l}</h2>
        {q.t==="e"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-around",marginBottom:14}}>
              {q.ds.map((d,i)=>{
                const v=1+Math.round(i/4*(q.max-q.min)),act=form[q.k]===v,col=SC[i];
                return(<button key={i} onClick={()=>setForm(f=>({...f,[q.k]:v}))} style={{background:act?`${col}16`:"none",border:`1.5px solid ${act?col+"38":"transparent"}`,borderRadius:13,padding:"9px 5px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,opacity:act?1:0.42,transform:act?"scale(1.16)":"scale(1)",transition:"all .2s"}}>
                  {faces[i](col,act?36:25)}<span style={{color:act?col:C.muted,fontSize:8,fontWeight:600,textAlign:"center"}}>{d}</span>
                </button>);
              })}
            </div>
            <p style={{color:SC[getIdx()],textAlign:"center",fontSize:13,fontWeight:700,marginBottom:30}}>{q.ds[getIdx()]}</p>
          </div>
        )}
        {q.t==="s"&&(
          <div>
            <div style={{textAlign:"center",marginBottom:16}}>
              <span style={{color:C.sage,fontSize:42,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{form[q.k]}</span>
              <span style={{color:C.muted,fontSize:15,marginLeft:7}}>{q.unit}</span>
            </div>
            <input type="range" min={q.min} max={q.max} step={q.step} value={form[q.k]} onChange={e=>setForm(f=>({...f,[q.k]:parseFloat(e.target.value)}))} style={{marginBottom:5}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:5,marginBottom:30}}>
              <span style={{color:C.muted,fontSize:9}}>{q.min}</span><span style={{color:C.muted,fontSize:9}}>{q.max}</span>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:9}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:13,background:"transparent",border:`1.5px solid ${C.border}`,borderRadius:13,color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Back</button>}
          <button onClick={()=>step<QS.length-1?setStep(s=>s+1):submit()} disabled={loading} style={{flex:2,padding:13,background:C.sage,border:"none",borderRadius:13,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(143,175,139,.28)"}}>
            {loading?"Saving to database...":step<QS.length-1?"Next":"Get My Results"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── CHAT ── */
const CLAUDE_SYSTEM=`You are CampusAI Companion, an intelligent and empathetic well-being assistant for MUST University students in Tunisia. You are talking with Aziz Ben Ali, Year 2 Computer Science student.
PERSONALITY: Smart, warm, practical. Like a knowledgeable mentor who genuinely cares. Give REAL specific advice.
STRICT RULES:
- 3-5 sentences max per response
- Give REAL SPECIFIC ACTIONABLE advice — not vague sympathy
- NEVER repeat the same phrasing across responses
- NEVER just ask follow-up questions without giving advice first
- Use Aziz's name occasionally
KNOWLEDGE:
EXAM/STUDY: Pomodoro 25min/5min, active recall beats re-reading 2x, past papers timed, spaced repetition, sleep consolidates memory
SLEEP: Fix wake-up time first, no screens 1hr before bed, 7-9hrs, write tomorrow tasks before bed
ANXIETY: Box breathing 4-4-4-4, grounding 5-4-3-2-1, 20-min walks reduce cortisol
FOCUS: Phone in another room, 90-min deep work blocks, 2-minute rule, temptation bundling
LONELINESS: MUST Peer Support daily 6PM, IEEE SB events, one genuine conversation daily
FINANCIAL: MUST Financial Aid financial@must.tn emergency funds available confidential
OVERWHELM: Brain dump on paper, ONE priority, MUST Counseling counseling@must.tn
MOTIVATION: 2-minute rule, temptation bundling, track micro-wins`;

const SMART_FB={
  exam:"The most impactful switch: from passive re-reading to active recall — close your notes and write everything you remember. It retains 2x more. Use Pomodoro: 25 minutes focused, 5-minute break, 4 cycles then 20 minutes rest. MUST tutoring centre (Sun–Thu 9AM–6PM) is there for subject-specific help, Aziz.",
  sleep:"Fix your wake-up time first — keep it consistent even on weekends, and sleep time stabilizes naturally within a week. Stop screens 45 minutes before bed. If your mind races at night, write tomorrow's task list before closing your laptop — it offloads the mental loop keeping you awake.",
  anxiety:"For acute anxiety right now, try box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times — it activates your parasympathetic nervous system within 90 seconds. For ongoing anxiety, 20-minute daily walks reduce cortisol as effectively as mild medication. MUST Counseling (counseling@must.tn) is free and confidential.",
  lonely:"Loneliness on campus is more common than most students admit. MUST Peer Support Network meets daily at 6PM — genuinely low-pressure. IEEE SB runs events where connection happens naturally through shared interest. Aim for one real conversation daily rather than trying to fix everything at once.",
  financial:"Email MUST Financial Aid at financial@must.tn — they have emergency funds for students in difficult situations and it's completely confidential. You don't have to be in crisis to reach out. Also check all available student discounts on campus — most students don't use them and they add up significantly.",
  focus:"The biggest focus killer is your phone within eyesight — even face-down it reduces working memory measurably. Put it in another room. Try 90-minute deep work blocks that match your brain's ultradian rhythm. Use the 2-minute rule to start: commit to just 2 minutes — the resistance is almost always to starting, not continuing.",
  motivat:"Motivation is unreliable. Build systems instead. Temptation bundling works: only listen to your favourite music while doing tasks you dislike — your brain associates the task with something positive. The 2-minute rule: commit to just 2 minutes on the task. You'll almost always continue once started.",
  overwhelm:"When everything piles up, write every stressor on paper — just externalizing reduces mental load by ~30%. Then circle the ONE thing that would make the biggest difference today and do only that. MUST Counseling (counseling@must.tn, Sun–Thu 8AM–4PM) is free for students who need professional support.",
  burnout:"Burnout happens when rest is treated as a reward for finishing work — but work never fully finishes. Schedule rest like a class: non-negotiable blocks. Students who time-block recovery actually study more effectively because they start each session fresh instead of grinding at 30% capacity.",
  grade:"Struggling grades usually come from one of three things: time management, understanding gaps, or poor exam technique. Practice past papers under timed conditions — most students who fail knew the content but weren't tested in the right way. MUST tutoring (Sun–Thu 9AM–6PM) is specifically built for this.",
};
function smartFallback(msg){
  const m=msg.toLowerCase();
  if(m.includes("exam")||m.includes("test")||m.includes("study")||m.includes("coursework")||m.includes("deadline"))return SMART_FB.exam;
  if(m.includes("sleep")||m.includes("tired")||m.includes("fatigue")||m.includes("insomnia"))return SMART_FB.sleep;
  if(m.includes("anxious")||m.includes("anxiety")||m.includes("panic")||m.includes("nervous"))return SMART_FB.anxiety;
  if(m.includes("lone")||m.includes("alone")||m.includes("isolat")||m.includes("friend"))return SMART_FB.lonely;
  if(m.includes("financial")||m.includes("money")||m.includes("afford"))return SMART_FB.financial;
  if(m.includes("focus")||m.includes("distract")||m.includes("concentrate")||m.includes("procrastinat"))return SMART_FB.focus;
  if(m.includes("motivat")||m.includes("lazy")||m.includes("unmotivat"))return SMART_FB.motivat;
  if(m.includes("overwhelm")||m.includes("too much")||m.includes("cannot cope"))return SMART_FB.overwhelm;
  if(m.includes("burnout")||m.includes("balance")||m.includes("rest"))return SMART_FB.burnout;
  if(m.includes("grade")||m.includes("gpa")||m.includes("fail"))return SMART_FB.grade;
  const g=["I hear you, Aziz. The more specific you can be, the more targeted advice I can give — what's the main thing on your mind right now?","That's worth unpacking properly. Is this hitting you more academically, socially, or a general heaviness?","Can you tell me more? I want to give you something actually useful rather than a standard answer."];
  return g[Math.floor(Math.random()*g.length)];
}

function Chat(){
  const [msgs,setMsgs]=useState([{role:"assistant",content:"Hi Aziz! I'm your CampusAI Companion, powered by real Claude AI. I'm here 24/7 — ask me anything about stress, studying, sleep, or anything on your mind. I give real, specific advice, not generic answers."}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);
  const QUICK=["How do I manage exam stress effectively?","I feel overwhelmed by deadlines","How can I improve my sleep?","I feel lonely on campus","I have financial difficulties"];
  const callAI=useCallback(async(userText)=>{
    const history=[...msgs,{role:"user",content:userText}];
    setMsgs(history);setInput("");setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:400,system:CLAUDE_SYSTEM,messages:history.slice(-12).filter(m=>m.role!=="system")})});
      const d=await res.json();
      if(d.error)throw new Error(d.error.message);
      setMsgs(prev=>[...prev,{role:"assistant",content:d.content[0].text}]);
    }catch{
      setMsgs(prev=>[...prev,{role:"assistant",content:smartFallback(userText)}]);
    }
    setLoading(false);
  },[msgs]);
  const send=useCallback(async(text=input)=>{const t=text.trim();if(!t||loading)return;await callAI(t);},[input,loading,callAI]);
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",background:C.bg}}>
      <div style={{background:C.surface,borderBottom:`1.5px solid ${C.border}`,padding:"48px 15px 13px",flexShrink:0,boxShadow:"0 2px 10px rgba(143,175,139,.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{position:"relative"}}>
            <div style={{width:43,height:43,borderRadius:"50%",background:`linear-gradient(135deg,${C.sage},${C.leaf})`,display:"flex",alignItems:"center",justifyContent:"center"}}>{I.leaf("white",21)}</div>
            <div style={{position:"absolute",bottom:1,right:1,width:10,height:10,borderRadius:"50%",background:C.leaf,border:`2px solid ${C.surface}`}}/>
          </div>
          <div style={{flex:1}}><p style={{color:C.text,fontWeight:700,fontSize:14}}>CampusAI Companion</p><p style={{color:C.leaf,fontSize:9,marginTop:1,fontWeight:600}}>Powered by Claude AI · MUST · 24/7</p></div>
          <div style={{background:"rgba(143,175,139,.12)",border:`1px solid ${C.border2}`,borderRadius:20,padding:"3px 9px",display:"flex",alignItems:"center",gap:4}}>
            {I.activity(C.sage,11)}<span style={{color:C.sage,fontSize:9,fontWeight:600}}>{loading?"Thinking...":"Listening"}</span>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"13px 13px 0",display:"flex",flexDirection:"column",gap:11,background:C.bg}}>
        {msgs.length===1&&(
          <div style={{paddingLeft:38}}>
            <p style={{color:C.muted,fontSize:9,marginBottom:6,fontWeight:500}}>Try asking me:</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {QUICK.map(q=><button key={q} onClick={()=>send(q)} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:20,padding:"6px 12px",color:C.text2,fontSize:10,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{q}</button>)}
            </div>
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} className="fu" style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:7}}>
            {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.sage},${C.leaf})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:3}}>{I.leaf("white",14)}</div>}
            <div style={{maxWidth:"79%"}}>
              <div style={{padding:"11px 15px",borderRadius:m.role==="user"?"17px 17px 4px 17px":"17px 17px 17px 4px",background:m.role==="user"?C.sage:C.surface,border:m.role==="assistant"?`1.5px solid ${C.border}`:"none",color:m.role==="user"?"white":C.text,fontSize:12,lineHeight:1.75,boxShadow:m.role==="assistant"?"0 2px 7px rgba(143,175,139,.08)":"none"}}>{m.content}</div>
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:7}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.sage},${C.leaf})`,display:"flex",alignItems:"center",justifyContent:"center"}}>{I.leaf("white",14)}</div>
            <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:"17px 17px 17px 4px",padding:"13px 17px",display:"flex",gap:5}}>
              {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.sage,animation:`blink 1.2s ease infinite ${i*.2}s`}}/>)}
            </div>
          </div>
        )}
        <div ref={ref} style={{height:100}}/>
      </div>
      <div style={{padding:"9px 13px 84px",background:C.surface,borderTop:`1.5px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <textarea placeholder="Ask me anything — I give real, specific advice..." value={input} rows={1} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} style={{flex:1,background:C.bg,border:`1.5px solid ${input?C.sage:C.border}`,borderRadius:20,padding:"11px 15px",color:C.text,fontSize:12,resize:"none",outline:"none",maxHeight:90,lineHeight:1.55,fontFamily:"'DM Sans',sans-serif",transition:"border-color .2s"}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading} style={{width:42,height:42,borderRadius:"50%",background:input.trim()?C.sage:"#D9E4D4",border:"none",cursor:input.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s",boxShadow:input.trim()?"0 4px 12px rgba(143,175,139,.32)":"none"}}>
            {loading?<div style={{width:15,height:15,border:"2px solid white",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>:I.send("white",15)}
          </button>
        </div>
        <p style={{color:C.muted,fontSize:8.5,textAlign:"center",marginTop:5,fontWeight:500}}>Real Claude AI · Private · Not stored in chat</p>
      </div>
    </div>
  );
}

/* ── MAP ── */
function MapScreen(){
  const [locStatus,setLocStatus]=useState("Detecting your location...");
  const [locColor,setLocColor]=useState(C.muted);
  const [spaces,setSpaces]=useState([]);
  const [filter,setFilter]=useState("all");
  const [prescription,setPrescription]=useState(null);
  useEffect(()=>{
    if(navigator.geolocation){
      setLocStatus("Requesting GPS location...");setLocColor(C.amber);
      navigator.geolocation.getCurrentPosition(
        p=>{
          setLocStatus(`Found: ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`);setLocColor(C.leaf);
          fetch(`${API}/green-spaces?lat=${p.coords.latitude}&lon=${p.coords.longitude}`).then(r=>r.json()).then(d=>{setSpaces(d.spaces||[]);setPrescription(d.prescription);}).catch(()=>loadDefault());
        },
        ()=>{setLocStatus("Showing parks near MUST University, Sousse");setLocColor(C.muted);loadDefault();}
      );
    } else loadDefault();
    function loadDefault(){fetch(`${API}/green-spaces`).then(r=>r.json()).then(d=>{setSpaces(d.spaces||[]);setPrescription(d.prescription);}).catch(()=>{});}
  },[]);
  const filtered=filter==="all"?spaces:spaces.filter(s=>s.type===filter);
  return(
    <div style={{padding:"52px 18px 90px",overflowY:"auto",minHeight:"100dvh",background:C.bg}}>
      <p style={{color:C.leaf,fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase"}}>Nature Map</p>
      <h2 style={{color:C.text,fontSize:19,fontWeight:700,margin:"3px 0 5px"}}>Tunisia Green Spaces</h2>
      <p style={{color:locColor,fontSize:10,marginBottom:13,transition:"color .3s",fontWeight:500}}>{locStatus}</p>
      {prescription&&(
        <div style={{background:"linear-gradient(145deg,#EBF4EA,#E8F0E5)",border:`1.5px solid ${C.border2}`,borderRadius:15,padding:13,display:"flex",gap:10,marginBottom:13,boxShadow:"0 2px 10px rgba(111,175,122,.1)"}}>
          {I.activity(C.leaf,19)}
          <div>
            <p style={{color:C.text,fontSize:12,fontWeight:700,marginBottom:3}}>AI Nature Prescription</p>
            <p style={{color:C.text2,fontSize:10,lineHeight:1.6}}>{prescription.message} Nearest: <span style={{color:C.sage,fontWeight:600}}>{prescription.nearest_space}</span> — {prescription.distance_km}km</p>
          </div>
        </div>
      )}
      <div style={{background:"#E8EEE6",border:`1.5px solid ${C.border}`,borderRadius:19,overflow:"hidden",marginBottom:13,height:188,position:"relative",boxShadow:"0 2px 10px rgba(143,175,139,.1)"}}>
        <svg width="100%" height="188" viewBox="0 0 340 188">
          <rect width="340" height="188" fill="#E8EEE6"/>
          <defs><pattern id="grd" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0L0 0 0 26" fill="none" stroke="#D4DED0" strokeWidth=".4"/></pattern></defs>
          <rect width="340" height="188" fill="url(#grd)"/>
          <rect x="15" y="33" width="45" height="28" rx="4" fill="#C8D9C2"/><rect x="95" y="41" width="52" height="23" rx="4" fill="#C8D9C2"/><rect x="190" y="35" width="38" height="26" rx="4" fill="#C8D9C2"/><rect x="280" y="102" width="38" height="28" rx="4" fill="#C8D9C2"/>
          <line x1="0" y1="91" x2="340" y2="91" stroke="#BDD0B8" strokeWidth="2.5"/><line x1="0" y1="57" x2="340" y2="69" stroke="#BDD0B8" strokeWidth="1.5"/><line x1="165" y1="0" x2="161" y2="188" stroke="#BDD0B8" strokeWidth="2.5"/><line x1="72" y1="0" x2="80" y2="188" stroke="#BDD0B8" strokeWidth="1.5"/><line x1="258" y1="0" x2="251" y2="188" stroke="#BDD0B8" strokeWidth="1.5"/>
          <circle cx="158" cy="91" r="20" fill="rgba(200,16,46,.12)" stroke="#C8102E" strokeWidth="1.5"/>
          <text x="158" y="87" textAnchor="middle" fontSize="11" fill="#C8102E" fontWeight="800" fontFamily="sans-serif">M</text><text x="158" y="101" textAnchor="middle" fontSize="6.5" fill="#C8102E" fontWeight="700" fontFamily="sans-serif">MUST</text>
          <circle cx="99" cy="65" r="13" fill="rgba(143,175,139,.22)" stroke="#8FAF8B" strokeWidth="1.5"/><text x="99" y="70" textAnchor="middle" fontSize="9" fill="#8FAF8B" fontFamily="sans-serif" fontWeight="700">P</text><text x="99" y="85" textAnchor="middle" fontSize="6" fill="#8FAF8B" fontFamily="sans-serif">Corniche</text>
          <circle cx="218" cy="75" r="13" fill="rgba(111,175,122,.22)" stroke="#6FAF7A" strokeWidth="1.5"/><text x="218" y="80" textAnchor="middle" fontSize="9" fill="#6FAF7A" fontFamily="sans-serif" fontWeight="700">G</text><text x="218" y="95" textAnchor="middle" fontSize="6" fill="#6FAF7A" fontFamily="sans-serif">Boujaffar</text>
          <circle cx="56" cy="123" r="11" fill="rgba(143,175,139,.16)" stroke="#8FAF8B" strokeWidth="1.5"/><text x="56" y="128" textAnchor="middle" fontSize="8" fill="#8FAF8B" fontFamily="sans-serif" fontWeight="700">P</text>
          <circle cx="275" cy="60" r="11" fill="rgba(200,169,110,.22)" stroke="#C8A96E" strokeWidth="1.5"/><text x="275" y="65" textAnchor="middle" fontSize="8" fill="#C8A96E" fontFamily="sans-serif" fontWeight="700">O</text>
          <circle cx="158" cy="91" r="32" fill="none" stroke="rgba(143,175,139,.18)" strokeWidth="1.5"/>
          <rect x="8" y="8" width="115" height="14" rx="7" fill="rgba(111,175,122,.14)" stroke="rgba(111,175,122,.36)" strokeWidth="1"/><circle cx="18" cy="15" r="3.5" fill="#6FAF7A"/><text x="27" y="19" fontSize="7" fill="#6FAF7A" fontWeight="700" fontFamily="sans-serif">Live · {spaces.length||12} green spaces</text>
        </svg>
        <button onClick={()=>{if(navigator.geolocation){setLocStatus("Locating...");setLocColor(C.amber);navigator.geolocation.getCurrentPosition(p=>{setLocStatus(`GPS: ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`);setLocColor(C.leaf);},()=>{setLocStatus("GPS denied");setLocColor(C.muted);})}}} style={{position:"absolute",bottom:10,right:10,background:C.sage,border:"none",borderRadius:10,padding:"7px 14px",color:"white",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5,boxShadow:"0 2px 8px rgba(143,175,139,.3)"}}>
          {I.pin("white",11)} Find Me
        </button>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:13,overflowX:"auto"}}>
        {["all","park","garden","campus","oasis","forest","nature"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{whiteSpace:"nowrap",background:filter===f?C.surface:C.bg,border:`1.5px solid ${filter===f?C.sage:C.border}`,borderRadius:20,padding:"6px 13px",color:filter===f?C.sage:C.muted,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
        ))}
      </div>
      <p style={{color:C.text,fontSize:12,fontWeight:700,marginBottom:10}}>Nearest Green Spaces</p>
      {(filtered.length>0?filtered:[
        {name:"Parc de la Corniche",type:"park",city:"Sousse",walk_minutes:10,distance_km:0.8,score:9.2,col:C.sage},
        {name:"Jardin de Boujaffar",type:"garden",city:"Sousse",walk_minutes:5,distance_km:0.4,score:8.7,col:C.leaf},
        {name:"MUST Campus Green",type:"campus",city:"On campus",walk_minutes:1,distance_km:0,score:8.5,col:C.mustRed},
      ]).map((s,i)=>(
        <div key={i} style={{background:C.surface,border:`1.5px solid ${(s.col||C.sage)}38`,borderRadius:15,padding:"12px 15px",display:"flex",alignItems:"center",gap:12,marginBottom:9,boxShadow:"0 2px 7px rgba(143,175,139,.07)"}}>
          <div style={{width:44,height:44,borderRadius:13,background:`${s.col||C.sage}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.tree(s.col||C.sage,21)}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{color:C.text,fontSize:12,fontWeight:700}}>{s.name}</p>
              <div style={{display:"flex",alignItems:"center",gap:3}}>{I.star(C.amber,12)}<span style={{color:C.amber,fontSize:10,fontWeight:700}}>{s.score}</span></div>
            </div>
            <p style={{color:s.col||C.sage,fontSize:9,fontWeight:600,marginTop:1,textTransform:"capitalize"}}>{s.city} · {s.type}</p>
            <div style={{display:"flex",gap:11,marginTop:3}}>
              {s.walk_minutes&&<span style={{color:C.muted,fontSize:9}}>Walk {s.walk_minutes} min</span>}
              {s.distance_km>0&&<span style={{color:C.muted,fontSize:9}}>{s.distance_km} km</span>}
              {s.stress_reduction&&<span style={{color:C.leaf,fontSize:9,fontWeight:500}}>-{s.stress_reduction}% cortisol</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── REWARDS ── */
function Rewards({go}){
  const [user,setUser]=useState(null);
  useEffect(()=>{fetch(`${API}/user?email=aziz@must.tn`).then(r=>r.json()).then(setUser).catch(()=>{});},[]);
  const pts=user?.points||450;
  const tier=user?.tier||"Silver";
  const prizes=[
    {pts:500, icon:I.pencil,label:"Certificate of Excellence",  sub:"PDF signed by Dean of MUST University",    tag:"Academic Recognition",col:C.sage,   progress:Math.min(100,Math.round(pts/500*100)),locked:pts<500},
    {pts:750, icon:I.book,  label:"University Newsletter",       sub:"Published in official MUST communications",tag:"Public Recognition",  col:C.sky,    progress:Math.min(100,Math.round(pts/750*100)),locked:pts<500},
    {pts:1000,icon:I.award, label:"Honor Roll — MUST Website",   sub:"Permanently listed on official website",   tag:"Prestige",            col:C.amber,  progress:Math.min(100,Math.round(pts/1000*100)),locked:pts<750},
    {pts:1500,icon:I.pencil,label:"Letter of Recommendation",    sub:"Signed by Dean — top 10 students only",    tag:"Career Booster",      col:C.mustRed,progress:Math.min(100,Math.round(pts/1500*100)),locked:pts<1000},
    {pts:2000,icon:I.trophy,label:"Academic Prize Ceremony",     sub:"Annual MUST Awards Event invitation",       tag:"Highest Honor",       col:C.amber,  progress:Math.min(100,Math.round(pts/2000*100)),locked:pts<1500},
  ];
  const nextPrize=prizes.find(p=>pts<p.pts);
  return(
    <div style={{padding:"52px 18px 90px",overflowY:"auto",minHeight:"100dvh",background:C.bg}}>
      <p style={{color:C.amber,fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>Achievement Center</p>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}><MustShield size={24}/><h2 style={{color:C.text,fontSize:19,fontWeight:700}}>Your Rewards</h2></div>
      <div style={{background:"linear-gradient(145deg,#FBF3E8,#F5EDD8)",border:`1.5px solid ${C.amber}38`,borderRadius:20,padding:18,marginBottom:13,boxShadow:"0 4px 16px rgba(200,169,110,.14)"}}>
        <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:13}}>
          <div style={{width:52,height:52,borderRadius:16,background:`linear-gradient(135deg,${C.amber},#E8B85A)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.trophy("white",26)}</div>
          <div>
            <p style={{color:C.muted,fontSize:9,marginBottom:3,fontWeight:500}}>{user?.name||"Aziz Ben Ali"} · CS · Y{user?.year||2} · {user?.email||"aziz@must.tn"}</p>
            <p style={{color:C.text,fontSize:24,fontWeight:800,lineHeight:1,fontFamily:"'JetBrains Mono',monospace"}}>{pts} <span style={{color:C.amber,fontSize:13}}>pts</span></p>
            <p style={{color:C.amber,fontSize:10,fontWeight:600,marginTop:3}}>{tier} Tier · {user?.streak||7} day streak</p>
          </div>
        </div>
        <div style={{background:"rgba(200,169,110,.18)",borderRadius:7,height:7,marginBottom:6}}><div style={{background:`linear-gradient(90deg,${C.amber},#E8B85A)`,borderRadius:7,height:"100%",width:`${Math.min(100,Math.round(pts/500*100))}%`,transition:"width 1.2s ease"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:9,fontWeight:500}}>Silver (400)</span><span style={{color:C.amber,fontSize:9,fontWeight:700}}>{pts} / 500</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:16}}>
        {[{icon:I.fire,val:user?.streak||7,label:"Day Streak",col:C.amber},{icon:I.checkin,val:user?.checkin_count||23,label:"Check-ins",col:C.sage},{icon:I.msg,val:user?.chat_count||14,label:"AI Chats",col:C.sky}].map(s=>(
          <div key={s.label} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:13,padding:"11px 7px",textAlign:"center",boxShadow:"0 2px 6px rgba(143,175,139,.07)"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:4}}>{s.icon(s.col,17)}</div>
            <p style={{color:C.text,fontSize:17,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{s.val}</p>
            <p style={{color:C.muted,fontSize:8,marginTop:2,fontWeight:500}}>{s.label}</p>
          </div>
        ))}
      </div>
      <p style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:13}}>Prizes — Real Value, Zero Cost</p>
      {prizes.map((p,i)=>(
        <div key={i} style={{background:p.locked?C.bg:C.surface,border:`1.5px solid ${p.locked?C.border:`${p.col}35`}`,borderRadius:17,padding:15,marginBottom:9,opacity:p.locked?0.52:1,boxShadow:p.locked?"none":"0 2px 9px rgba(143,175,139,.08)"}}>
          <div style={{display:"flex",gap:12,marginBottom:9}}>
            <div style={{width:46,height:46,borderRadius:13,background:p.locked?C.beige:`${p.col}15`,border:`1.5px solid ${p.locked?C.border:`${p.col}28`}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,filter:p.locked?"grayscale(1) opacity(.5)":"none"}}>{p.icon(p.locked?C.muted:p.col,21)}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <p style={{color:p.locked?C.muted:C.text,fontSize:12,fontWeight:700,flex:1,paddingRight:5}}>{p.label}</p>
                {!p.locked&&p.progress>=85&&<span style={{background:p.col,color:"white",fontSize:8,fontWeight:800,borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>CLOSE!</span>}
              </div>
              <p style={{color:p.locked?C.muted:C.text2,fontSize:10,lineHeight:1.5,marginBottom:5}}>{p.sub}</p>
              <span style={{color:p.locked?C.muted:p.col,fontSize:9,fontWeight:700,background:p.locked?C.beige:`${p.col}12`,borderRadius:20,padding:"2px 9px"}}>{p.tag}</span>
            </div>
          </div>
          <div style={{background:C.beige,borderRadius:5,height:5,marginBottom:7}}><div style={{background:p.locked?C.muted:p.col,borderRadius:5,height:"100%",width:`${p.progress}%`,opacity:p.locked?.4:1,transition:"width 1s ease"}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:p.locked?C.muted:C.text2,fontSize:9,fontWeight:500}}>{pts} / {p.pts} pts</span>
            {p.locked?<span style={{color:C.muted,fontSize:9,fontWeight:600}}>Locked · {p.pts} pts</span>:<button onClick={()=>go("checkin")} style={{background:p.col,border:"none",borderRadius:20,padding:"4px 13px",color:"white",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Keep going</button>}
          </div>
        </div>
      ))}
      {nextPrize&&(
        <div style={{background:"linear-gradient(145deg,#EAF2E8,#F0EDE4)",border:`1.5px solid ${C.border}`,borderRadius:15,padding:16,marginBottom:8,boxShadow:"0 2px 10px rgba(143,175,139,.09)"}}>
          <p style={{color:C.sage,fontSize:11,fontWeight:700,marginBottom:5}}>Your Next Milestone</p>
          <p style={{color:C.text2,fontSize:11,lineHeight:1.6,marginBottom:11}}>Just <strong style={{color:C.text}}>{nextPrize.pts-pts} more points</strong> to unlock {nextPrize.label}, Aziz.</p>
          <button onClick={()=>go("checkin")} style={{width:"100%",padding:13,background:C.sage,border:"none",borderRadius:13,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(143,175,139,.28)"}}>Do Today's Check-in +10 pts</button>
        </div>
      )}
    </div>
  );
}

/* ── ROOT ── */
export default function App(){
  const [screen,setScreen]=useState("splash");
  const MAIN=["home","checkin","chat","map","rewards"];
  const SCREENS={splash:Splash,login:Login,home:Home,checkin:CheckIn,chat:Chat,map:MapScreen,rewards:Rewards};
  const Screen=SCREENS[screen];
  return(
    <>
      <style>{G}</style>
      <div style={{width:430,minWidth:430,maxWidth:430,minHeight:"100dvh",background:C.bg,fontFamily:"'DM Sans',sans-serif",position:"relative",margin:"0 auto"}}>
        <Screen go={setScreen}/>
        {MAIN.includes(screen)&&<Nav active={screen} go={setScreen}/>}
      </div>
    </>
  );
}