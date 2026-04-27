import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;500;600&family=Lato:wght@300;400;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:'Lato',sans-serif;background:#faf6ef;color:#3a2e1a;overflow-x:hidden}
    :root{
      --gold:#c9a84c;--gold-l:#e8d5a3;--gold-d:#8a6a1f;
      --cream:#faf6ef;--dark:#1a1208;--text:#3a2e1a;--muted:#7a6a50;
      --white:#ffffff;
    }
    button{cursor:pointer;font-family:inherit}
    input,textarea,select{font-family:inherit}
    a{text-decoration:none;color:inherit}
    .cinzel{font-family:'Cinzel',serif}
    .cormorant{font-family:'Cormorant Garamond',serif}

    /* Scrollbar */
    ::-webkit-scrollbar{width:6px}
    ::-webkit-scrollbar-track{background:#f5efe0}
    ::-webkit-scrollbar-thumb{background:var(--gold-l);border-radius:3px}

    /* Animations */
    @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes doorOpenLeft{0%{transform:perspective(1200px) rotateY(0deg)}100%{transform:perspective(1200px) rotateY(-110deg)}}
    @keyframes doorOpenRight{0%{transform:perspective(1200px) rotateY(0deg)}100%{transform:perspective(1200px) rotateY(110deg)}}
    @keyframes sparkle{0%,100%{opacity:0;transform:scale(0) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(180deg)}}
    @keyframes countDown{from{transform:scaleY(1)}to{transform:scaleY(0)}}
    @keyframes fall{0%{transform:translateY(-20px) rotate(0deg);opacity:0}10%{opacity:.8}90%{opacity:.4}100%{transform:translateY(105vh) rotate(540deg);opacity:0}}
    @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(-100%);opacity:0}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

    .fade-up{animation:fadeUp .7s ease both}
    .fade-in{animation:fadeIn .5s ease both}

    /* Door animation */
    .door-scene{perspective:1200px;width:100%;height:100%;position:relative}
    .door-left,.door-right{
      position:absolute;top:0;width:50%;height:100%;
      display:flex;align-items:center;justify-content:center;
      transform-origin:left center;
      transition:none;
    }
    .door-right{right:0;transform-origin:right center}
    .door-left.open{animation:doorOpenLeft 1.4s cubic-bezier(.4,0,.2,1) forwards}
    .door-right.open{animation:doorOpenRight 1.4s cubic-bezier(.4,0,.2,1) forwards}

    /* Scratch card canvas */
    .scratch-wrapper{position:relative;display:inline-block;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.2)}
    .scratch-wrapper canvas{position:absolute;top:0;left:0;cursor:crosshair;border-radius:12px}
    .scratch-reveal{padding:2rem 3rem;text-align:center;background:linear-gradient(135deg,#fff8e7,#fff3d0)}

    /* Toast */
    .toast{
      position:fixed;bottom:2rem;right:2rem;z-index:9999;
      background:var(--dark);color:#fff;
      padding:.85rem 1.5rem;
      font-family:'Cinzel',serif;font-size:.8rem;letter-spacing:.08em;
      box-shadow:0 8px 30px rgba(0,0,0,.3);
      animation:slideIn .4s ease;
      border-left:3px solid var(--gold);
    }

    /* Modal overlay */
    .modal-overlay{
      position:fixed;inset:0;z-index:1000;
      background:rgba(26,18,8,.85);backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;
      padding:1rem;
      animation:fadeIn .3s ease;
    }
    .modal-box{
      background:var(--cream);max-width:520px;width:100%;
      padding:2.5rem;position:relative;
      animation:fadeUp .4s ease;
      border:1px solid rgba(201,168,76,.25);
      max-height:90vh;overflow-y:auto;
    }

    /* Invitation page */
    .inv-page{min-height:100vh;position:relative;overflow:hidden}
    .sparkle-star{
      position:absolute;pointer-events:none;
      animation:sparkle 2s ease-in-out infinite;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════
   HELPERS & DATA
═══════════════════════════════════════════════════════════ */
const TEMPLATES = [
  { id:"royal",    name:"Royal Elegance",  desc:"Classic gold & cream with regal accents",   bg:"linear-gradient(160deg,#1a1200,#3d2a00,#1a0800)", textColor:"#e8d5a3", accent:"#c9a84c", dark:true  },
  { id:"garden",   name:"Garden Romance",  desc:"Soft florals for outdoor celebrations",      bg:"linear-gradient(160deg,#e8f0e0,#c8ddb5,#8aac6a)", textColor:"#1a3010", accent:"#5a8a30", dark:false },
  { id:"modern",   name:"Modern Minimal",  desc:"Clean lines & contemporary sophistication", bg:"linear-gradient(160deg,#f5f5f3,#e8e8e4,#ccccc4)", textColor:"#1a1a18", accent:"#555550", dark:false },
  { id:"mughal",   name:"Mughal Emerald",  desc:"Rich emerald inspired by Mughal art",       bg:"linear-gradient(160deg,#0d2a1a,#1a4f2e,#0a1f12)", textColor:"#c8e8d0", accent:"#4caf70", dark:true  },
  { id:"rosegold", name:"Rose Gold Blush", desc:"Warm rose gold with delicate blush accents",bg:"linear-gradient(160deg,#fce4ec,#f8bbd0,#e8a0b8)", textColor:"#5a1a30", accent:"#c06080", dark:false },
  { id:"midnight", name:"Midnight Royal",  desc:"Deep navy & gold for evening celebrations", bg:"linear-gradient(160deg,#0a0e1f,#1a2040,#0d1530)", textColor:"#d0d8f8", accent:"#6070d0", dark:true  },
];

const FEATURES = [
  { icon:"🎴", title:"Scratch to Reveal Date",      desc:"Interactive scratch card reveals the wedding date with a surprise animation" },
  { icon:"⏳", title:"Live Countdown Timer",          desc:"Animated countdown to your special day that builds excitement" },
  { icon:"💌", title:"Guest Messaging & Inbox",       desc:"Receive messages, attendance confirmations and guest counts" },
  { icon:"🎵", title:"Background Music",              desc:"Romantic instrumental tracks with an elegant mute toggle" },
  { icon:"📍", title:"Venue with Google Maps",        desc:"Embedded Google Maps for seamless directions to your venue" },
  { icon:"🚪", title:"Premium 3D Door Animations",   desc:"Stunning 3D door reveal effects, curtain animations and sparkles" },
  { icon:"📸", title:"Custom Image Upload",           desc:"Upload your own slideshow photos and hero background images" },
  { icon:"🌐", title:"Multi-Language Translation",   desc:"Offer your invitation in multiple languages for diverse guests" },
  { icon:"🎨", title:"Full Customization",            desc:"Toggle sections, add dress codes, pre-wedding events and more" },
  { icon:"🖼️", title:"Photo Slideshow",              desc:"Showcase your love story with a beautiful animated photo gallery" },
];

const FAQS = [
  { q:"How does the digital invitation work?", a:"After purchase you fill in your wedding details through a simple form. We generate a unique link for your personalized invitation webpage that you can share with guests via WhatsApp, email, or any messaging platform." },
  { q:"Can I edit my invitation after creating it?", a:"Yes! You can edit your invitation details anytime from your dashboard. Changes are reflected instantly on the live invitation page — no need to resend the link." },
  { q:"How many invitations can I create?", a:"Each plan allows you to create up to 2 invitation webpages. Each invitation gets its own unique shareable link." },
  { q:"Is there a limit on how many guests can view it?", a:"No! Your invitation link can be viewed by unlimited guests with no additional charges. Share it as widely as you like." },
  { q:"What payment methods are accepted?", a:"We accept UPI, credit cards, debit cards, net banking and wallets through our secure payment gateway." },
  { q:"Is it eco-friendly?", a:"Absolutely. No paper waste, no printing chemicals, no transportation emissions. Digital invitations are the sustainable choice for your special day." },
];

const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold:0.1, rootMargin:"0px 0px -40px 0px" });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const RevealDiv = ({ children, delay=0, style={}, className="" }) => {
  const [ref, vis] = useReveal();
  return <div ref={ref} className={className} style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(28px)", transition:`opacity .7s ease ${delay}s, transform .7s ease ${delay}s`, ...style }}>{children}</div>;
};

/* ═══════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
═══════════════════════════════════════════════════════════ */
const Btn = ({ children, onClick, outline=false, style={}, small=false }) => (
  <button onClick={onClick} style={{
    fontFamily:"'Cinzel',serif", letterSpacing:".1em",
    padding: small ? ".5rem 1.2rem" : ".85rem 2.2rem",
    fontSize: small ? ".75rem" : ".85rem",
    background: outline ? "transparent" : "var(--gold)",
    color: outline ? "var(--gold-d)" : "#fff",
    border: outline ? "1.5px solid var(--gold)" : "none",
    transition:"all .2s", cursor:"pointer",
    boxShadow: outline ? "none" : "0 4px 20px rgba(201,168,76,.35)",
    ...style
  }}
  onMouseEnter={e => { e.currentTarget.style.background = outline ? "var(--gold)" : "var(--gold-d)"; e.currentTarget.style.color="#fff"; e.currentTarget.style.transform="translateY(-2px)"; }}
  onMouseLeave={e => { e.currentTarget.style.background = outline ? "transparent" : "var(--gold)"; e.currentTarget.style.color = outline ? "var(--gold-d)" : "#fff"; e.currentTarget.style.transform="translateY(0)"; }}
  >{children}</button>
);

const Input = ({ label, value, onChange, placeholder, type="text", required=false }) => (
  <div style={{ marginBottom:"1.2rem" }}>
    <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:".78rem", letterSpacing:".1em", color:"var(--dark)", marginBottom:".4rem" }}>{label}{required&&<span style={{color:"var(--gold)"}}> *</span>}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
      width:"100%", padding:".75rem 1rem", border:"1px solid rgba(201,168,76,.35)",
      background:"#fff", color:"var(--text)", fontSize:".9rem", outline:"none",
      transition:"border-color .2s"
    }}
    onFocus={e=>e.target.style.borderColor="var(--gold)"}
    onBlur={e=>e.target.style.borderColor="rgba(201,168,76,.35)"}
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows=4 }) => (
  <div style={{ marginBottom:"1.2rem" }}>
    <label style={{ display:"block", fontFamily:"'Cinzel',serif", fontSize:".78rem", letterSpacing:".1em", color:"var(--dark)", marginBottom:".4rem" }}>{label}</label>
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{
      width:"100%", padding:".75rem 1rem", border:"1px solid rgba(201,168,76,.35)",
      background:"#fff", color:"var(--text)", fontSize:".9rem", outline:"none",
      resize:"vertical", transition:"border-color .2s"
    }}
    onFocus={e=>e.target.style.borderColor="var(--gold)"}
    onBlur={e=>e.target.style.borderColor="rgba(201,168,76,.35)"}
    />
  </div>
);

const Toast = ({ msg, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast">{msg}</div>;
};

/* ═══════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════ */
const Nav = ({ page, setPage, user, setUser }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"1.1rem 4vw",
      background: scrolled ? "rgba(250,246,239,.96)" : "rgba(250,246,239,.8)",
      backdropFilter:"blur(10px)",
      borderBottom: scrolled ? "1px solid rgba(201,168,76,.2)" : "1px solid transparent",
      transition:"all .3s"
    }}>
      <button onClick={()=>setPage("home")} style={{ fontFamily:"'Cinzel',serif", fontSize:"1.45rem", color:"var(--gold-d)", background:"none", border:"none", letterSpacing:".1em" }}>
        Invitation <span style={{color:"var(--gold)"}}>Wala</span>
      </button>
      <div style={{ display:"flex", gap:"2rem", alignItems:"center" }}>
        {["Templates","Features","How It Works","FAQ"].map(l => (
          <button key={l} onClick={()=>setPage(l==="Templates"?"templates":l==="Features"?"features":l==="How It Works"?"howitworks":"faq")}
            style={{ background:"none", border:"none", fontFamily:"'Lato',sans-serif", fontSize:".8rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--muted)", cursor:"pointer", transition:"color .2s" }}
            onMouseEnter={e=>e.target.style.color="var(--gold-d)"} onMouseLeave={e=>e.target.style.color="var(--muted)"}
          >{l}</button>
        ))}
        {user ? (
          <div style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
            <button onClick={()=>setPage("dashboard")} style={{background:"none",border:"none",fontFamily:"'Cinzel',serif",fontSize:".78rem",color:"var(--gold-d)",cursor:"pointer",letterSpacing:".08em"}}>Dashboard</button>
            <Btn small onClick={()=>{ setUser(null); setPage("home"); }}>Logout</Btn>
          </div>
        ) : (
          <div style={{ display:"flex", gap:".7rem" }}>
            <Btn small outline onClick={()=>setPage("login")}>Login</Btn>
            <Btn small onClick={()=>setPage("signup")}>Sign Up</Btn>
          </div>
        )}
      </div>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
const HomePage = ({ setPage }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const petals = useRef([...Array(20)].map((_,i) => ({
    left: Math.random()*100, delay: Math.random()*12, dur: 6+Math.random()*8,
    size: 6+Math.random()*6, color: ["#e8c9a0","#f5d5a8","#dbc090","#c9a84c","#f0e0c0"][i%5]
  }))).current;

  return (
    <div style={{ paddingTop:"72px" }}>
      {/* Petals */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden" }}>
        {petals.map((p,i) => (
          <div key={i} style={{
            position:"absolute", left:`${p.left}%`, top:0,
            width:`${p.size}px`, height:`${p.size*1.5}px`,
            borderRadius:"50% 50% 50% 10% / 60% 60% 40% 40%",
            background:p.color, opacity:0,
            animation:`fall ${p.dur}s linear ${p.delay}s infinite`,
            transform:`rotate(${Math.random()*360}deg)`
          }}/>
        ))}
      </div>

      {/* HERO */}
      <section style={{
        minHeight:"calc(100vh - 72px)", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", textAlign:"center",
        padding:"4rem 5vw", position:"relative", overflow:"hidden",
        background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,.13) 0%, transparent 70%), var(--cream)",
        zIndex:2
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(201,168,76,.05) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(201,168,76,.05) 60px)", pointerEvents:"none" }}/>
        <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1.1rem", color:"var(--gold)", letterSpacing:".2em", marginBottom:"1.2rem", animation:"fadeUp .8s ease .2s both" }}>✦ Digital Wedding Invitations ✦</p>
        <h1 className="cinzel" style={{ fontSize:"clamp(2.2rem,5.5vw,4.8rem)", fontWeight:400, color:"var(--dark)", lineHeight:1.15, maxWidth:"820px", marginBottom:"1.5rem", animation:"fadeUp .8s ease .4s both" }}>
          Your Love Story Deserves a{" "}
          <span className="cormorant" style={{ fontStyle:"italic", color:"var(--gold-d)", fontWeight:300 }}>Beautiful</span>{" "}Beginning
        </h1>
        <p style={{ fontSize:"1.05rem", color:"var(--muted)", maxWidth:"560px", lineHeight:1.8, marginBottom:"2.5rem", animation:"fadeUp .8s ease .6s both" }}>
          Create a stunning animated wedding invitation webpage in minutes. Share your unique link with guests via WhatsApp, email, or any platform.
        </p>
        <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", justifyContent:"center", animation:"fadeUp .8s ease .8s both" }}>
          <Btn onClick={()=>setPage("templates")}>Browse Templates</Btn>
          <Btn outline onClick={()=>setPage("howitworks")}>See How It Works</Btn>
        </div>
        <div style={{ marginTop:"5rem", display:"flex", alignItems:"center", gap:"1.5rem", width:"100%", maxWidth:"500px", animation:"fadeUp .8s ease 1s both" }}>
          <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,transparent,var(--gold-l))" }}/>
          <span className="cormorant" style={{ fontSize:"1.5rem", color:"var(--gold)" }}>✦</span>
          <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,var(--gold-l),transparent)" }}/>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background:"var(--dark)", padding:"3rem 5vw" }}>
        <div style={{ display:"flex", justifyContent:"center", gap:"4rem", flexWrap:"wrap" }}>
          {[["5000+","Happy Couples"],["6","Premium Templates"],["10+","Unique Features"],["∞","Guest Views"]].map(([n,l]) => (
            <RevealDiv key={l} style={{ textAlign:"center" }}>
              <div className="cinzel" style={{ fontSize:"2.2rem", color:"var(--gold)", marginBottom:".4rem" }}>{n}</div>
              <div style={{ fontSize:".8rem", color:"rgba(255,255,255,.5)", letterSpacing:".12em", textTransform:"uppercase" }}>{l}</div>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding:"6rem 5vw", background:"#fff8f0" }}>
        <RevealDiv style={{ textAlign:"center", marginBottom:".6rem" }}><p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold)", letterSpacing:".2em" }}>Premium Features</p></RevealDiv>
        <RevealDiv delay={.1} style={{ textAlign:"center", marginBottom:"1rem" }}><h2 className="cinzel" style={{ fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:400, color:"var(--dark)" }}>Everything You Need</h2></RevealDiv>
        <RevealDiv delay={.2} style={{ textAlign:"center", marginBottom:"3.5rem" }}><p style={{ fontSize:"1rem", color:"var(--muted)", maxWidth:"560px", margin:"0 auto", lineHeight:1.8 }}>Paper cannot compete. Our digital invitations come packed with interactive features your guests will remember.</p></RevealDiv>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:"1.8rem", maxWidth:"1100px", margin:"0 auto" }}>
          {FEATURES.map((f,i) => (
            <RevealDiv key={f.title} delay={i*.06}>
              <div style={{
                background:"#fff", border:"1px solid rgba(201,168,76,.2)", padding:"2rem 1.8rem",
                transition:"transform .25s,box-shadow .25s,border-color .25s", cursor:"default"
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(201,168,76,.15)"; e.currentTarget.style.borderColor="rgba(201,168,76,.5)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; e.currentTarget.style.borderColor="rgba(201,168,76,.2)"; }}
              >
                <div style={{ fontSize:"2rem", marginBottom:"1rem" }}>{f.icon}</div>
                <h3 className="cinzel" style={{ fontSize:".9rem", fontWeight:600, color:"var(--dark)", marginBottom:".6rem", letterSpacing:".04em" }}>{f.title}</h3>
                <p style={{ fontSize:".87rem", color:"var(--muted)", lineHeight:1.7 }}>{f.desc}</p>
              </div>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* TEMPLATES PREVIEW */}
      <section style={{ padding:"6rem 5vw" }}>
        <RevealDiv style={{ textAlign:"center", marginBottom:".6rem" }}><p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold)", letterSpacing:".2em" }}>Choose Your Style</p></RevealDiv>
        <RevealDiv delay={.1} style={{ textAlign:"center", marginBottom:"1rem" }}><h2 className="cinzel" style={{ fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:400, color:"var(--dark)" }}>6 Premium Templates</h2></RevealDiv>
        <RevealDiv delay={.2} style={{ textAlign:"center", marginBottom:"3.5rem" }}><p style={{ fontSize:"1rem", color:"var(--muted)", maxWidth:"560px", margin:"0 auto", lineHeight:1.8 }}>Each template features stunning animations, elegant typography, and a cohesive palette.</p></RevealDiv>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"1.8rem", maxWidth:"1100px", margin:"0 auto" }}>
          {TEMPLATES.map((t,i) => (
            <RevealDiv key={t.id} delay={i*.07}>
              <div style={{ position:"relative", overflow:"hidden", aspectRatio:"3/4", cursor:"pointer", border:"1px solid rgba(201,168,76,.2)" }}
                onClick={()=>setPage("templates")}
                onMouseEnter={e=>e.currentTarget.querySelector(".tcard-bg").style.transform="scale(1.06)"}
                onMouseLeave={e=>e.currentTarget.querySelector(".tcard-bg").style.transform="scale(1)"}
              >
                <div className="tcard-bg" style={{ position:"absolute", inset:0, background:t.bg, transition:"transform .5s ease" }}/>
                {/* Decorative pattern */}
                <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 1px,transparent 8px)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", top:"1rem", right:"1rem", background:"var(--gold)", color:"#fff", fontFamily:"'Cinzel',serif", fontSize:".6rem", letterSpacing:".1em", padding:".28rem .65rem" }}>PREMIUM</div>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(26,18,8,.85) 0%,rgba(26,18,8,.1) 55%,transparent 100%)", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"1.8rem 1.5rem" }}>
                  <div className="cinzel" style={{ fontSize:"1rem", color:"#fff", marginBottom:".4rem" }}>{t.name}</div>
                  <div className="cormorant" style={{ fontStyle:"italic", fontSize:".9rem", color:"var(--gold-l)" }}>{t.desc}</div>
                  <button style={{ marginTop:".9rem", fontFamily:"'Cinzel',serif", fontSize:".7rem", letterSpacing:".12em", padding:".45rem 1.1rem", border:"1px solid var(--gold)", color:"var(--gold)", background:"transparent", cursor:"pointer", width:"fit-content", transition:"all .2s" }}
                    onMouseEnter={e=>{ e.target.style.background="var(--gold)"; e.target.style.color="#fff"; }}
                    onMouseLeave={e=>{ e.target.style.background="transparent"; e.target.style.color="var(--gold)"; }}
                  >Preview →</button>
                </div>
              </div>
            </RevealDiv>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"3rem" }}>
          <Btn onClick={()=>setPage("templates")}>View All Templates</Btn>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:"6rem 5vw", background:"#fff8f0" }}>
        <RevealDiv style={{ textAlign:"center", marginBottom:".6rem" }}><p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold)", letterSpacing:".2em" }}>Simple Process</p></RevealDiv>
        <RevealDiv delay={.1} style={{ textAlign:"center", marginBottom:"3.5rem" }}><h2 className="cinzel" style={{ fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:400, color:"var(--dark)" }}>Create Your Invitation in 4 Steps</h2></RevealDiv>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1rem", maxWidth:"960px", margin:"0 auto" }}>
          {[["1","Choose Template","Browse 6 premium designs"],["2","Make Payment","Secure one-time, no subscriptions"],["3","Fill the Form","Enter your wedding details easily"],["4","Share Your Link","Via WhatsApp, email or social media"]].map(([n,t,d],i) => (
            <RevealDiv key={n} delay={i*.1} style={{ textAlign:"center", padding:"2rem 1.5rem" }}>
              <div style={{ position:"relative", margin:"0 auto 1.4rem" }}>
                <div className="cinzel" style={{ width:"56px", height:"56px", background:"var(--gold)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", margin:"0 auto", position:"relative", zIndex:1 }}>{n}</div>
                <div style={{ position:"absolute", inset:"-4px", border:"1px solid rgba(201,168,76,.4)" }}/>
              </div>
              <h3 className="cinzel" style={{ fontSize:".9rem", color:"var(--dark)", marginBottom:".6rem" }}>{t}</h3>
              <p style={{ fontSize:".86rem", color:"var(--muted)", lineHeight:1.7 }}>{d}</p>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ padding:"6rem 5vw", background:"linear-gradient(135deg,#1a1208,#2d1f0a)" }}>
        <RevealDiv style={{ textAlign:"center", marginBottom:".6rem" }}><p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold-l)", letterSpacing:".2em" }}>The Better Choice</p></RevealDiv>
        <RevealDiv delay={.1} style={{ textAlign:"center", marginBottom:"3.5rem" }}><h2 className="cinzel" style={{ fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:400, color:"#fff" }}>Digital vs Paper</h2></RevealDiv>
        <RevealDiv delay={.2} style={{ maxWidth:"760px", margin:"0 auto", border:"1px solid rgba(201,168,76,.3)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:"rgba(201,168,76,.15)", borderBottom:"1px solid rgba(201,168,76,.3)" }}>
            {["Feature","Invitation Wala Digital","Paper"].map(h => <div key={h} className="cinzel" style={{ padding:"1rem 1.5rem", fontSize:".78rem", letterSpacing:".1em", color:"var(--gold-l)", textAlign:h==="Feature"?"left":"center" }}>{h}</div>)}
          </div>
          {[["Cost","Fraction of the cost","Thousands ₹",false],["Delivery","Instant","2-4 weeks",true],["Interactive Features","✓","✗",false],["Background Music","✓","✗",true],["Guest Messaging","✓","✗",false],["Google Maps","✓","✗",true],["Eco-Friendly","✓","✗",false],["Unlimited Views","✓","✗",true],["Edit After Sending","✓","✗",false]].map(([feat,dig,pap,alt]) => (
            <div key={feat} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom:"1px solid rgba(201,168,76,.1)", background:alt?"rgba(201,168,76,.04)":"transparent" }}>
              <div style={{ padding:".9rem 1.5rem", fontSize:".87rem", color:"rgba(255,255,255,.8)" }}>{feat}</div>
              <div style={{ padding:".9rem", fontSize:".87rem", color:dig==="✓"?"#7ecb8a":"#9cf", textAlign:"center" }}>{dig}</div>
              <div style={{ padding:".9rem", fontSize:".87rem", color:pap==="✗"?"#e07070":"rgba(255,255,255,.5)", textAlign:"center" }}>{pap}</div>
            </div>
          ))}
        </RevealDiv>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:"6rem 5vw", background:"var(--cream)" }}>
        <RevealDiv style={{ textAlign:"center", marginBottom:".6rem" }}><p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold)", letterSpacing:".2em" }}>Couples Love Us</p></RevealDiv>
        <RevealDiv delay={.1} style={{ textAlign:"center", marginBottom:"3.5rem" }}><h2 className="cinzel" style={{ fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:400, color:"var(--dark)" }}>What Our Couples Say</h2></RevealDiv>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:"1.8rem", maxWidth:"1000px", margin:"0 auto" }}>
          {[["Priya & Arjun","Absolutely stunning! Our guests loved the digital invitation. The door reveal animation was truly magical — everyone kept sharing it."],["Sarah & Michael","So easy to set up and the design quality is simply unmatched. We had the whole thing live in under 30 minutes. Worth every penny!"],["Ananya & Vikram","The scratch card feature was a total hit. Everyone loved the surprise element. Such a beautiful and unique experience for guests."]].map(([name,txt],i) => (
            <RevealDiv key={name} delay={i*.1}>
              <div style={{ background:"#fff", border:"1px solid rgba(201,168,76,.18)", padding:"2rem", position:"relative" }}>
                <div className="cormorant" style={{ position:"absolute", top:"-.2rem", left:"1.2rem", fontSize:"5rem", lineHeight:1, color:"var(--gold-l)", pointerEvents:"none" }}>"</div>
                <div style={{ color:"var(--gold)", marginBottom:".6rem", fontSize:".9rem" }}>★★★★★</div>
                <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1.05rem", lineHeight:1.75, color:"var(--text)", paddingTop:"1.5rem", marginBottom:"1.4rem" }}>{txt}</p>
                <div className="cinzel" style={{ fontSize:".76rem", letterSpacing:".12em", color:"var(--gold-d)" }}>{name}</div>
              </div>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:"6rem 5vw", background:"#fff8f0" }}>
        <RevealDiv style={{ textAlign:"center", marginBottom:".6rem" }}><p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold)", letterSpacing:".2em" }}>Got Questions?</p></RevealDiv>
        <RevealDiv delay={.1} style={{ textAlign:"center", marginBottom:"3.5rem" }}><h2 className="cinzel" style={{ fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:400, color:"var(--dark)" }}>Frequently Asked Questions</h2></RevealDiv>
        <div style={{ maxWidth:"720px", margin:"0 auto" }}>
          {FAQS.map((f,i) => (
            <RevealDiv key={i} delay={i*.07} style={{ borderBottom:"1px solid rgba(201,168,76,.2)" }}>
              <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{
                width:"100%", textAlign:"left", background:"none", border:"none",
                padding:"1.4rem 0", display:"flex", justifyContent:"space-between", alignItems:"center",
                fontFamily:"'Cinzel',serif", fontSize:".9rem", color:"var(--dark)", letterSpacing:".04em", gap:"1rem",
                cursor:"pointer", transition:"color .2s"
              }}>
                {f.q}
                <span style={{ fontSize:"1.3rem", color:"var(--gold)", flexShrink:0, transition:"transform .3s", transform:openFaq===i?"rotate(45deg)":"rotate(0deg)" }}>+</span>
              </button>
              <div style={{ maxHeight:openFaq===i?"200px":"0", overflow:"hidden", transition:"max-height .4s ease, padding .3s", paddingBottom:openFaq===i?"1.4rem":"0", fontSize:".9rem", color:"var(--muted)", lineHeight:1.8 }}>{f.a}</div>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:"linear-gradient(135deg,#1a1208,#2d1f0a,#1a0e00)", textAlign:"center", padding:"7rem 5vw", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 80% at 50% 50%,rgba(201,168,76,.12) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <RevealDiv><p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold)", letterSpacing:".2em", marginBottom:".6rem" }}>Begin Your Journey</p></RevealDiv>
        <RevealDiv delay={.1}><h2 className="cinzel" style={{ fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:400, color:"#fff", marginBottom:"1.2rem" }}>Ready to Create Your Dream Invitation?</h2></RevealDiv>
        <RevealDiv delay={.2}><p style={{ color:"rgba(255,255,255,.6)", maxWidth:"480px", margin:"0 auto 2.5rem", lineHeight:1.8 }}>Join thousands of couples who chose Invitation Wala. Beautiful, instant, and unforgettable.</p></RevealDiv>
        <RevealDiv delay={.3}><Btn onClick={()=>setPage("signup")} style={{ boxShadow:"0 6px 30px rgba(201,168,76,.5)" }}>Get Started Today</Btn></RevealDiv>
      </section>

      {/* FOOTER */}
      <Footer setPage={setPage}/>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
const Footer = ({ setPage }) => (
  <footer style={{ background:"var(--dark)", padding:"3rem 5vw 2rem", textAlign:"center" }}>
    <div className="cinzel" style={{ fontSize:"1.6rem", color:"var(--gold)", letterSpacing:".1em", marginBottom:"1.5rem" }}>Invitation Wala</div>
    <div style={{ display:"flex", flexWrap:"wrap", gap:"1.5rem", justifyContent:"center", marginBottom:"2rem" }}>
      {[["Templates","templates"],["Create Invitation","signup"],["About Us","about"],["Contact","contact"],["Terms","terms"],["Privacy Policy","privacy"],["Refund Policy","refund"]].map(([l,p]) => (
        <button key={l} onClick={()=>setPage(p)} style={{ background:"none", border:"none", fontSize:".78rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.38)", cursor:"pointer", transition:"color .2s" }}
          onMouseEnter={e=>e.target.style.color="var(--gold-l)"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.38)"}
        >{l}</button>
      ))}
    </div>
    <p style={{ fontSize:".78rem", color:"rgba(255,255,255,.22)" }}>© 2026 Invitation Wala. All rights reserved.</p>
  </footer>
);

/* ═══════════════════════════════════════════════════════════
   TEMPLATES PAGE
═══════════════════════════════════════════════════════════ */
const TemplatesPage = ({ setPage, setSelectedTemplate }) => {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ paddingTop:"72px", minHeight:"100vh" }}>
      <div style={{ padding:"5rem 5vw 3rem", textAlign:"center", background:"radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,.1) 0%,transparent 70%),var(--cream)" }}>
        <RevealDiv><p className="cormorant" style={{ fontStyle:"italic", fontSize:"1.1rem", color:"var(--gold)", letterSpacing:".2em", marginBottom:".8rem" }}>Choose Your Style</p></RevealDiv>
        <RevealDiv delay={.1}><h1 className="cinzel" style={{ fontSize:"clamp(2rem,4vw,3.5rem)", fontWeight:400, color:"var(--dark)", marginBottom:"1.2rem" }}>Premium Wedding Templates</h1></RevealDiv>
        <RevealDiv delay={.2}><p style={{ fontSize:"1rem", color:"var(--muted)", maxWidth:"580px", margin:"0 auto", lineHeight:1.8 }}>Each template is professionally crafted with stunning animations, unique typography, and a distinct aesthetic to match your vision.</p></RevealDiv>
      </div>
      <div style={{ padding:"3rem 5vw 6rem", maxWidth:"1200px", margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"2.5rem" }}>
          {TEMPLATES.map((t,i) => (
            <RevealDiv key={t.id} delay={i*.08}>
              <div style={{ border:"1px solid rgba(201,168,76,.2)", overflow:"hidden", boxShadow:hover===t.id?"0 20px 60px rgba(201,168,76,.2)":"0 4px 20px rgba(0,0,0,.08)", transition:"all .3s" }}
                onMouseEnter={()=>setHover(t.id)} onMouseLeave={()=>setHover(null)}
              >
                {/* Template visual */}
                <div style={{ aspectRatio:"16/10", background:t.bg, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,.03) 0,rgba(255,255,255,.03) 1px,transparent 1px,transparent 10px)" }}/>
                  {/* Mock invitation preview */}
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:".5rem" }}>
                    <div className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:t.textColor, opacity:.7, letterSpacing:".15em" }}>Together We</div>
                    <div className="cinzel" style={{ fontSize:"1.4rem", color:t.accent, letterSpacing:".1em" }}>Celebrate</div>
                    <div style={{ width:"40px", height:"1px", background:t.accent, margin:".3rem 0" }}/>
                    <div className="cormorant" style={{ fontSize:".85rem", color:t.textColor, opacity:.6 }}>Bride & Groom</div>
                    <div style={{ marginTop:".5rem", padding:".3rem .8rem", border:`1px solid ${t.accent}`, color:t.accent, fontFamily:"'Cinzel',serif", fontSize:".6rem", letterSpacing:".1em" }}>VIEW INVITATION</div>
                  </div>
                  {/* Hover overlay */}
                  <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.4)", opacity:hover===t.id?1:0, transition:"opacity .3s", display:"flex", alignItems:"center", justifyContent:"center", gap:"1rem" }}>
                    <button onClick={()=>{ setSelectedTemplate(t); setPage("preview"); }} style={{ fontFamily:"'Cinzel',serif", fontSize:".72rem", letterSpacing:".12em", padding:".55rem 1.2rem", background:"transparent", border:"1px solid #fff", color:"#fff", cursor:"pointer", transition:"all .2s" }}
                      onMouseEnter={e=>{ e.target.style.background="#fff"; e.target.style.color="var(--dark)"; }}
                      onMouseLeave={e=>{ e.target.style.background="transparent"; e.target.style.color="#fff"; }}
                    >Preview</button>
                    <button onClick={()=>{ setSelectedTemplate(t); setPage("builder"); }} style={{ fontFamily:"'Cinzel',serif", fontSize:".72rem", letterSpacing:".12em", padding:".55rem 1.2rem", background:"var(--gold)", border:"1px solid var(--gold)", color:"#fff", cursor:"pointer" }}>Use This</button>
                  </div>
                </div>
                {/* Card info */}
                <div style={{ padding:"1.5rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:".5rem" }}>
                    <h3 className="cinzel" style={{ fontSize:"1rem", color:"var(--dark)" }}>{t.name}</h3>
                    <span style={{ background:"var(--gold)", color:"#fff", fontFamily:"'Cinzel',serif", fontSize:".58rem", letterSpacing:".1em", padding:".22rem .55rem" }}>PREMIUM</span>
                  </div>
                  <p style={{ fontSize:".86rem", color:"var(--muted)", marginBottom:"1.2rem" }}>{t.desc}</p>
                  <div style={{ display:"flex", gap:".6rem", flexWrap:"wrap", marginBottom:"1.3rem" }}>
                    {["Door Animation","Countdown","Scratch Card","Music"].map(tag => (
                      <span key={tag} style={{ fontSize:".68rem", padding:".2rem .6rem", border:"1px solid rgba(201,168,76,.3)", color:"var(--muted)", letterSpacing:".06em" }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:".8rem" }}>
                    <Btn small outline onClick={()=>{ setSelectedTemplate(t); setPage("preview"); }}>Preview</Btn>
                    <Btn small onClick={()=>{ setSelectedTemplate(t); setPage("builder"); }}>Use Template</Btn>
                  </div>
                </div>
              </div>
            </RevealDiv>
          ))}
        </div>
      </div>
      <Footer setPage={setPage}/>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   AUTH PAGES (SIGNUP / LOGIN)
═══════════════════════════════════════════════════════════ */
const AuthPage = ({ mode, setPage, setUser }) => {
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill all required fields."); return; }
    if (mode==="signup" && !form.name) { setError("Name is required."); return; }
    if (mode==="signup" && form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setTimeout(() => {
      setUser({ name: form.name || form.email.split("@")[0], email:form.email, invitations:[] });
      setPage("dashboard");
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"5rem 1rem", background:"radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,.1) 0%,transparent 70%),var(--cream)" }}>
      <div style={{ width:"100%", maxWidth:"440px", background:"#fff", border:"1px solid rgba(201,168,76,.25)", padding:"3rem" }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <button onClick={()=>setPage("home")} className="cinzel" style={{ fontSize:"1.4rem", color:"var(--gold-d)", background:"none", border:"none", marginBottom:"1.5rem", letterSpacing:".1em" }}>Invitation <span style={{color:"var(--gold)"}}>Wala</span></button>
          <h2 className="cinzel" style={{ fontSize:"1.4rem", fontWeight:400, color:"var(--dark)", marginBottom:".5rem" }}>{mode==="signup"?"Create Your Account":"Welcome Back"}</h2>
          <p style={{ fontSize:".87rem", color:"var(--muted)" }}>{mode==="signup"?"Start creating beautiful invitations":"Sign in to your account"}</p>
        </div>
        {mode==="signup" && <Input label="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" required/>}
        <Input label="Email Address" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="your@email.com" required/>
        <Input label="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" required/>
        {mode==="signup" && <Input label="Confirm Password" type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="••••••••" required/>}
        {error && <p style={{ fontSize:".84rem", color:"#c0392b", marginBottom:"1rem", padding:".6rem 1rem", background:"#fdf0ef", border:"1px solid #f5c6c6" }}>{error}</p>}
        <Btn onClick={handle} style={{ width:"100%", justifyContent:"center", display:"flex", alignItems:"center", gap:".6rem" }}>
          {loading ? <span style={{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin .6s linear infinite", display:"inline-block" }}/> : null}
          {loading ? "Please wait..." : mode==="signup" ? "Create Account" : "Sign In"}
        </Btn>
        <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:".86rem", color:"var(--muted)" }}>
          {mode==="signup" ? "Already have an account? " : "Don't have an account? "}
          <button onClick={()=>setPage(mode==="signup"?"login":"signup")} style={{ background:"none", border:"none", color:"var(--gold-d)", cursor:"pointer", fontWeight:700, fontSize:".86rem" }}>
            {mode==="signup"?"Sign In":"Create Account"}
          </button>
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   INVITATION BUILDER
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   MEDIA UPLOAD ZONE
═══════════════════════════════════════════════════════════ */
const MediaUploadZone = ({ accept, label, hint, preview, previewType, previewName, onFile, onRemove, accent, multi }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ b64: e.target.result, name: file.name });
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files) => {
    for (const file of Array.from(files)) {
      const { b64, name } = await readFile(file);
      onFile(b64, name);
      if (!multi) break;
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const hasContent = preview || (previewType === "none" && false);

  return (
    <div>
      {/* Drop zone (hidden when non-multi and already has content) */}
      {!(preview && !multi) && (
        <div
          onDragOver={e=>{e.preventDefault();setDragging(true);}}
          onDragLeave={()=>setDragging(false)}
          onDrop={onDrop}
          onClick={()=>inputRef.current?.click()}
          style={{
            border:`2px dashed ${dragging?"var(--gold)":"rgba(201,168,76,.35)"}`,
            borderRadius:"4px", padding:"2rem 1.5rem", textAlign:"center",
            cursor:"pointer", transition:"all .2s",
            background: dragging ? "rgba(201,168,76,.06)" : "transparent",
          }}
        >
          <div style={{ fontSize:"2rem", marginBottom:".6rem" }}>
            {previewType==="audio" ? "🎵" : previewType==="image" ? "🖼️" : "📸"}
          </div>
          <p style={{ fontSize:".85rem", color:"var(--dark)", marginBottom:".3rem" }}>{label}</p>
          <p style={{ fontSize:".75rem", color:"var(--muted)" }}>{hint}</p>
          <input
            ref={inputRef} type="file" accept={accept}
            multiple={!!multi} style={{ display:"none" }}
            onChange={e=>handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Preview for single image */}
      {previewType==="image" && preview && (
        <div style={{ position:"relative", marginTop:".8rem", border:"1px solid rgba(201,168,76,.3)", overflow:"hidden" }}>
          <img src={preview} alt="hero" style={{ width:"100%", maxHeight:"240px", objectFit:"cover", display:"block" }}/>
          <button onClick={onRemove} style={{
            position:"absolute", top:"8px", right:"8px",
            background:"rgba(0,0,0,.65)", border:"none", color:"#fff",
            width:"28px", height:"28px", borderRadius:"50%", cursor:"pointer",
            fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center"
          }}>×</button>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,.5)", padding:"6px 12px" }}>
            <p style={{ fontSize:".72rem", color:"rgba(255,255,255,.85)", fontFamily:"Cinzel,serif", letterSpacing:".08em" }}>✓ Hero image uploaded</p>
          </div>
          {/* Allow replacing */}
          <div onClick={()=>inputRef.current?.click()} style={{ position:"absolute", top:"8px", left:"8px", background:"rgba(0,0,0,.6)", border:"none", color:"#fff", padding:"4px 10px", cursor:"pointer", fontSize:".65rem", fontFamily:"Cinzel,serif", letterSpacing:".08em" }}>Replace</div>
          <input ref={inputRef} type="file" accept={accept} style={{ display:"none" }} onChange={e=>handleFiles(e.target.files)}/>
        </div>
      )}

      {/* Preview for audio */}
      {previewType==="audio" && preview && (
        <div style={{ marginTop:".8rem", border:"1px solid rgba(201,168,76,.3)", padding:"1.2rem 1.5rem", background:"rgba(201,168,76,.04)", display:"flex", alignItems:"center", gap:"1rem" }}>
          <span style={{ fontSize:"1.8rem" }}>🎵</span>
          <div style={{ flex:1, minWidth:0 }}>
            <p className="cinzel" style={{ fontSize:".78rem", color:"var(--dark)", marginBottom:".3rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{previewName || "Music file"}</p>
            <audio controls src={preview} style={{ width:"100%", height:"32px" }}/>
          </div>
          <button onClick={onRemove} style={{ background:"none", border:"1px solid rgba(201,168,76,.4)", color:"var(--muted)", padding:".3rem .7rem", fontSize:".72rem", cursor:"pointer", flexShrink:0 }}>Remove</button>
        </div>
      )}
    </div>
  );
};

const BuilderPage = ({ template, setPage, setInvitations, invitations, user, setToast }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    bride:"", groom:"", weddingDate:"", weddingTime:"12:00",
    venue:"", venueAddress:"", venueMapLink:"",
    receptionDate:"", receptionTime:"", receptionVenue:"",
    story:"", dressCode:"", note:"",
    enableScratch:true, enableCountdown:true, enableMusic:true,
    enableMap:true, enableMessaging:true, enableSlideshow:true,
    enableDoor:true, enableTranslation:false,
    language:"en",
    contactEmail:"", contactPhone:"",
    heroImage:null,
    slideshowImages:[],
    musicFile:null, musicFileName:"",
  });
  const [saving, setSaving] = useState(false);

  if (!template) { setPage("templates"); return null; }
  if (!user) { setPage("login"); return null; }

  const f = (k,v) => setForm(prev=>({...prev,[k]:v}));

  const save = () => {
    if (!form.bride || !form.groom || !form.weddingDate || !form.venue) {
      setToast("Please fill Bride, Groom, Date and Venue fields."); return;
    }
    setSaving(true);
    setTimeout(() => {
      const id = "inv_" + Date.now();
      const inv = { id, template, form, createdAt: new Date().toISOString(), messages:[], views:0 };
      setInvitations(prev=>[...prev, inv]);
      setSaving(false);
      setToast("✓ Invitation created successfully!");
      setPage("dashboard");
    }, 1400);
  };

  const steps = ["Details","Venue","Media","Options","Review"];

  return (
    <div style={{ paddingTop:"72px", minHeight:"100vh", background:"var(--cream)" }}>
      <div style={{ maxWidth:"860px", margin:"0 auto", padding:"3rem 2rem 6rem" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold)", letterSpacing:".2em", marginBottom:".5rem" }}>Create Your Invitation</p>
          <h1 className="cinzel" style={{ fontSize:"2rem", fontWeight:400, color:"var(--dark)" }}>
            {template.name}
          </h1>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:"3rem", gap:0 }}>
          {steps.map((s,i) => (
            <div key={s} style={{ display:"flex", alignItems:"center" }}>
              <div onClick={()=>setStep(i+1)} style={{
                width:"36px", height:"36px", borderRadius:"50%",
                background: step>i+1 ? "var(--gold)" : step===i+1 ? "var(--gold-d)" : "transparent",
                border: `2px solid ${step>=i+1?"var(--gold-d)":"rgba(201,168,76,.3)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Cinzel',serif", fontSize:".78rem", color: step>=i+1?"#fff":"var(--muted)",
                cursor:"pointer", transition:"all .2s"
              }}>{step>i+1?"✓":i+1}</div>
              <div className="cinzel" style={{ fontSize:".72rem", color:step===i+1?"var(--gold-d)":"var(--muted)", marginLeft:".4rem", marginRight:".4rem", letterSpacing:".06em", display:i===steps.length-1?"none":"block", whiteSpace:"nowrap" }}>{s}</div>
              {i<steps.length-1 && <div style={{ width:"2rem", height:"1px", background:step>i+1?"var(--gold)":"rgba(201,168,76,.3)", margin:"0 .5rem" }}/>}
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", border:"1px solid rgba(201,168,76,.2)", padding:"2.5rem" }}>
          {step===1 && (
            <div>
              <h3 className="cinzel" style={{ fontSize:"1rem", color:"var(--dark)", marginBottom:"1.8rem", letterSpacing:".06em" }}>Couple Details</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <Input label="Bride's Name" value={form.bride} onChange={e=>f("bride",e.target.value)} placeholder="e.g. Priya" required/>
                <Input label="Groom's Name" value={form.groom} onChange={e=>f("groom",e.target.value)} placeholder="e.g. Arjun" required/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <Input label="Wedding Date" type="date" value={form.weddingDate} onChange={e=>f("weddingDate",e.target.value)} required/>
                <Input label="Wedding Time" type="time" value={form.weddingTime} onChange={e=>f("weddingTime",e.target.value)}/>
              </div>
              <TextArea label="Your Love Story (optional)" value={form.story} onChange={e=>f("story",e.target.value)} placeholder="Share a little about your journey together..." rows={3}/>
              <Input label="Dress Code (optional)" value={form.dressCode} onChange={e=>f("dressCode",e.target.value)} placeholder="e.g. Formal, Indian Traditional, Smart Casual"/>
              <TextArea label="Personal Note to Guests (optional)" value={form.note} onChange={e=>f("note",e.target.value)} placeholder="e.g. Your presence is our gift..." rows={2}/>
            </div>
          )}
          {step===2 && (
            <div>
              <h3 className="cinzel" style={{ fontSize:"1rem", color:"var(--dark)", marginBottom:"1.8rem", letterSpacing:".06em" }}>Venue Details</h3>
              <Input label="Ceremony Venue Name" value={form.venue} onChange={e=>f("venue",e.target.value)} placeholder="e.g. The Grand Ballroom" required/>
              <TextArea label="Venue Address" value={form.venueAddress} onChange={e=>f("venueAddress",e.target.value)} placeholder="Full address including city and state" rows={2}/>
              <Input label="Google Maps Link (optional)" value={form.venueMapLink} onChange={e=>f("venueMapLink",e.target.value)} placeholder="https://maps.google.com/..."/>
              <div style={{ borderTop:"1px solid rgba(201,168,76,.15)", paddingTop:"1.5rem", marginTop:"1rem" }}>
                <h4 className="cinzel" style={{ fontSize:".85rem", color:"var(--muted)", marginBottom:"1.2rem", letterSpacing:".06em" }}>Reception (if different)</h4>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                  <Input label="Reception Date" type="date" value={form.receptionDate} onChange={e=>f("receptionDate",e.target.value)}/>
                  <Input label="Reception Time" type="time" value={form.receptionTime} onChange={e=>f("receptionTime",e.target.value)}/>
                </div>
                <Input label="Reception Venue" value={form.receptionVenue} onChange={e=>f("receptionVenue",e.target.value)} placeholder="Reception venue name"/>
              </div>
              <Input label="Contact Email (for RSVPs)" type="email" value={form.contactEmail} onChange={e=>f("contactEmail",e.target.value)} placeholder="your@email.com"/>
              <Input label="Contact Phone" value={form.contactPhone} onChange={e=>f("contactPhone",e.target.value)} placeholder="+91 99999 99999"/>
            </div>
          )}
          {step===3 && (
            <div>
              <h3 className="cinzel" style={{ fontSize:"1rem", color:"var(--dark)", marginBottom:".5rem", letterSpacing:".06em" }}>Media Upload</h3>
              <p style={{ fontSize:".84rem", color:"var(--muted)", marginBottom:"2rem", lineHeight:1.7 }}>Upload your hero photo, slideshow images (up to 10), and background music. All files are stored securely with your invitation.</p>

              {/* Hero Image */}
              <div style={{ marginBottom:"2rem" }}>
                <label className="cinzel" style={{ display:"block", fontSize:".78rem", letterSpacing:".1em", color:"var(--dark)", marginBottom:".8rem" }}>HERO BACKGROUND IMAGE <span style={{color:"var(--muted)",fontFamily:"Lato",fontWeight:400,letterSpacing:0}}>(optional)</span></label>
                <MediaUploadZone
                  accept="image/*"
                  label="Drop your hero photo here or click to browse"
                  hint="JPG, PNG, WebP — recommended 1920×1080px"
                  preview={form.heroImage}
                  previewType="image"
                  onFile={(b64,name)=>f("heroImage",b64)}
                  onRemove={()=>f("heroImage",null)}
                  accent="var(--gold)"
                />
              </div>

              {/* Slideshow Images */}
              <div style={{ marginBottom:"2rem" }}>
                <label className="cinzel" style={{ display:"block", fontSize:".78rem", letterSpacing:".1em", color:"var(--dark)", marginBottom:".8rem" }}>SLIDESHOW PHOTOS <span style={{color:"var(--muted)",fontFamily:"Lato",fontWeight:400,letterSpacing:0}}>({form.slideshowImages.length}/10 uploaded)</span></label>
                {form.slideshowImages.length < 10 && (
                  <MediaUploadZone
                    accept="image/*"
                    label="Add photos to your slideshow"
                    hint="Add up to 10 photos — JPG, PNG, WebP"
                    preview={null}
                    previewType="none"
                    onFile={(b64,name)=>{
                      if(form.slideshowImages.length>=10) return;
                      f("slideshowImages",[...form.slideshowImages,{b64,name}]);
                    }}
                    onRemove={null}
                    accent="var(--gold)"
                    multi={true}
                  />
                )}
                {form.slideshowImages.length > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:".6rem", marginTop:"1rem" }}>
                    {form.slideshowImages.map((img,i) => (
                      <div key={i} style={{ position:"relative", aspectRatio:"1", border:"1px solid rgba(201,168,76,.3)", overflow:"hidden" }}>
                        <img src={img.b64} alt={img.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        <button onClick={()=>f("slideshowImages",form.slideshowImages.filter((_,j)=>j!==i))} style={{
                          position:"absolute", top:"4px", right:"4px", width:"22px", height:"22px", borderRadius:"50%",
                          background:"rgba(0,0,0,.65)", border:"none", color:"#fff", fontSize:".8rem", cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1
                        }}>×</button>
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,.5)", padding:"2px 4px", fontSize:".6rem", color:"rgba(255,255,255,.8)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{img.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Background Music */}
              <div>
                <label className="cinzel" style={{ display:"block", fontSize:".78rem", letterSpacing:".1em", color:"var(--dark)", marginBottom:".8rem" }}>BACKGROUND MUSIC <span style={{color:"var(--muted)",fontFamily:"Lato",fontWeight:400,letterSpacing:0}}>(optional — MP3, WAV, OGG)</span></label>
                <MediaUploadZone
                  accept="audio/*"
                  label="Upload your background music"
                  hint="MP3, WAV, OGG — max 20MB recommended"
                  preview={form.musicFile}
                  previewType="audio"
                  previewName={form.musicFileName}
                  onFile={(b64,name)=>{ f("musicFile",b64); f("musicFileName",name); }}
                  onRemove={()=>{ f("musicFile",null); f("musicFileName",""); }}
                  accent="var(--gold)"
                />
              </div>
            </div>
          )}
          {step===4 && (
            <div>
              <h3 className="cinzel" style={{ fontSize:"1rem", color:"var(--dark)", marginBottom:"1.8rem", letterSpacing:".06em" }}>Invitation Features</h3>
              <p style={{ fontSize:".87rem", color:"var(--muted)", marginBottom:"2rem", lineHeight:1.7 }}>Toggle the features you want included in your invitation:</p>
              {[
                ["enableDoor","🚪","3D Door Opening Animation","Stunning reveal when guests open your invitation"],
                ["enableScratch","🎴","Scratch to Reveal Date","Interactive scratch card to unveil your wedding date"],
                ["enableCountdown","⏳","Live Countdown Timer","Real-time countdown to your wedding day"],
                ["enableMusic","🎵","Background Music","Romantic instrumental music while guests view the invitation"],
                ["enableMap","📍","Google Maps Venue","Embedded map for easy navigation to your venue"],
                ["enableMessaging","💌","Guest Messaging Inbox","Let guests send wishes and confirm attendance"],
                ["enableSlideshow","🖼️","Photo Slideshow","Showcase your couple photos in a gallery"],
                ["enableTranslation","🌐","Multi-Language Support","Offer invitation in multiple languages"],
              ].map(([key,icon,title,desc]) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1rem 0", borderBottom:"1px solid rgba(201,168,76,.12)" }}>
                  <div style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
                    <span style={{ fontSize:"1.4rem" }}>{icon}</span>
                    <div>
                      <div className="cinzel" style={{ fontSize:".85rem", color:"var(--dark)", marginBottom:".2rem" }}>{title}</div>
                      <div style={{ fontSize:".8rem", color:"var(--muted)" }}>{desc}</div>
                    </div>
                  </div>
                  <div onClick={()=>f(key,!form[key])} style={{
                    width:"44px", height:"24px", borderRadius:"12px",
                    background:form[key]?"var(--gold)":"rgba(201,168,76,.2)",
                    position:"relative", cursor:"pointer", transition:"background .25s", flexShrink:0
                  }}>
                    <div style={{ position:"absolute", top:"2px", left:form[key]?"22px":"2px", width:"20px", height:"20px", borderRadius:"50%", background:"#fff", transition:"left .25s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
          {step===5 && (
            <div>
              <h3 className="cinzel" style={{ fontSize:"1rem", color:"var(--dark)", marginBottom:"1.8rem", letterSpacing:".06em" }}>Review Your Invitation</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"2rem" }}>
                {[["Template",template.name],["Bride",form.bride||"—"],["Groom",form.groom||"—"],["Date",form.weddingDate||"—"],["Time",form.weddingTime||"—"],["Venue",form.venue||"—"]].map(([l,v]) => (
                  <div key={l}>
                    <div className="cinzel" style={{ fontSize:".72rem", color:"var(--muted)", letterSpacing:".1em", marginBottom:".3rem" }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize:".95rem", color:"var(--dark)", fontWeight:400 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:"1px solid rgba(201,168,76,.2)", paddingTop:"1.5rem", marginBottom:"2rem" }}>
                <div className="cinzel" style={{ fontSize:".8rem", color:"var(--muted)", letterSpacing:".1em", marginBottom:"1rem" }}>ENABLED FEATURES</div>
                <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
                  {[["enableDoor","🚪 Door Anim"],["enableScratch","🎴 Scratch Card"],["enableCountdown","⏳ Countdown"],["enableMusic","🎵 Music"],["enableMap","📍 Map"],["enableMessaging","💌 Messaging"],["enableSlideshow","🖼️ Slideshow"],["enableTranslation","🌐 Translation"]].map(([k,l]) => form[k] && (
                    <span key={k} style={{ fontSize:".75rem", padding:".3rem .7rem", background:"rgba(201,168,76,.12)", border:"1px solid rgba(201,168,76,.3)", color:"var(--gold-d)", letterSpacing:".05em" }}>{l}</span>
                  ))}
                </div>
              </div>
              <div style={{ background:"rgba(201,168,76,.06)", border:"1px solid rgba(201,168,76,.2)", padding:"1.2rem 1.5rem", marginBottom:"1.5rem" }}>
                <p style={{ fontSize:".86rem", color:"var(--muted)", lineHeight:1.7 }}>✓ After saving, your invitation will be live instantly. You can edit anytime from your dashboard. Unlimited guest views included.</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:"2rem", alignItems:"center" }}>
          <Btn outline onClick={()=>step===1?setPage("templates"):setStep(s=>s-1)}>
            {step===1?"← Back to Templates":"← Previous"}
          </Btn>
          {step<5 ? (
            <Btn onClick={()=>setStep(s=>s+1)}>Next Step →</Btn>
          ) : (
            <Btn onClick={save} style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
              {saving && <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin .6s linear infinite", display:"inline-block" }}/>}
              {saving?"Creating...":"Create Invitation ✦"}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
const Dashboard = ({ user, invitations, setInvitations, setPage, setSelectedTemplate, setCurrentInvitation }) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("invitations");

  if (!user) { setPage("login"); return null; }

  const totalViews = invitations.reduce((a,i)=>a+i.views,0);
  const totalMessages = invitations.reduce((a,i)=>a+(i.messages?.length||0),0);

  const copyLink = (id) => {
    navigator.clipboard?.writeText(`${window.location.origin}#/invitation/${id}`);
  };

  return (
    <div style={{ paddingTop:"72px", minHeight:"100vh", background:"var(--cream)" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"3rem 2rem 6rem" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"3rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold)", letterSpacing:".2em", marginBottom:".4rem" }}>Welcome back</p>
            <h1 className="cinzel" style={{ fontSize:"1.8rem", fontWeight:400, color:"var(--dark)" }}>{user.name}</h1>
          </div>
          <Btn onClick={()=>{ if(invitations.length>=2){ alert("Maximum 2 invitations per account. Upgrade for more."); return; } setPage("templates"); }}>
            + Create New Invitation
          </Btn>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1.2rem", marginBottom:"3rem" }}>
          {[["📋","Invitations",invitations.length+"/2"],["👁️","Total Views",totalViews],["💌","Messages",totalMessages],["✉️","Account",user.email.split("@")[0]]].map(([icon,label,val]) => (
            <div key={label} style={{ background:"#fff", border:"1px solid rgba(201,168,76,.2)", padding:"1.5rem", textAlign:"center" }}>
              <div style={{ fontSize:"1.8rem", marginBottom:".5rem" }}>{icon}</div>
              <div className="cinzel" style={{ fontSize:"1.4rem", color:"var(--gold-d)", marginBottom:".3rem" }}>{val}</div>
              <div style={{ fontSize:".78rem", color:"var(--muted)", letterSpacing:".1em", textTransform:"uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(201,168,76,.2)", marginBottom:"2rem", gap:0 }}>
          {["invitations","messages","settings"].map(tab => (
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{
              background:"none", border:"none", padding:".9rem 1.5rem",
              fontFamily:"'Cinzel',serif", fontSize:".8rem", letterSpacing:".1em",
              color: activeTab===tab ? "var(--gold-d)" : "var(--muted)",
              borderBottom: activeTab===tab ? "2px solid var(--gold)" : "2px solid transparent",
              cursor:"pointer", textTransform:"capitalize", transition:"color .2s", marginBottom:"-1px"
            }}>{tab}</button>
          ))}
        </div>

        {/* Invitations tab */}
        {activeTab==="invitations" && (
          <>
            {invitations.length === 0 ? (
              <div style={{ textAlign:"center", padding:"5rem 2rem", background:"#fff", border:"1px dashed rgba(201,168,76,.3)" }}>
                <div style={{ fontSize:"3rem", marginBottom:"1.5rem" }}>💌</div>
                <h3 className="cinzel" style={{ fontSize:"1.1rem", color:"var(--dark)", marginBottom:".8rem" }}>No Invitations Yet</h3>
                <p style={{ fontSize:".9rem", color:"var(--muted)", marginBottom:"2rem" }}>Create your first beautiful digital wedding invitation</p>
                <Btn onClick={()=>setPage("templates")}>Choose a Template</Btn>
              </div>
            ) : (
              <div style={{ display:"grid", gap:"1.5rem" }}>
                {invitations.map(inv => (
                  <div key={inv.id} style={{ background:"#fff", border:"1px solid rgba(201,168,76,.2)", overflow:"hidden" }}>
                    <div style={{ display:"flex", gap:0, flexWrap:"wrap" }}>
                      {/* Template preview */}
                      <div style={{ width:"140px", minHeight:"120px", background:inv.template.bg, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                        <div className="cinzel" style={{ color:"rgba(255,255,255,.6)", fontSize:".65rem", letterSpacing:".1em", textAlign:"center", padding:"1rem" }}>{inv.template.name}</div>
                      </div>
                      <div style={{ flex:1, padding:"1.5rem", minWidth:"240px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"1rem", marginBottom:"1rem" }}>
                          <div>
                            <h3 className="cinzel" style={{ fontSize:"1.05rem", color:"var(--dark)", marginBottom:".4rem" }}>{inv.form.bride} & {inv.form.groom}</h3>
                            <p style={{ fontSize:".84rem", color:"var(--muted)" }}>📅 {inv.form.weddingDate || "Date not set"} · 📍 {inv.form.venue || "Venue not set"}</p>
                          </div>
                          <span style={{ background:"rgba(201,168,76,.12)", color:"var(--gold-d)", fontFamily:"'Cinzel',serif", fontSize:".65rem", letterSpacing:".08em", padding:".2rem .6rem", border:"1px solid rgba(201,168,76,.25)" }}>LIVE</span>
                        </div>
                        <div style={{ display:"flex", gap:".8rem", flexWrap:"wrap" }}>
                          <button onClick={()=>{ setCurrentInvitation(inv); setPage("invitation"); }} style={{ fontFamily:"'Cinzel',serif", fontSize:".72rem", letterSpacing:".1em", padding:".45rem 1rem", background:"var(--gold)", color:"#fff", border:"none", cursor:"pointer" }}>View</button>
                          <button onClick={()=>{ setCurrentInvitation(inv); setPage("editinvitation"); }} style={{ fontFamily:"'Cinzel',serif", fontSize:".72rem", letterSpacing:".1em", padding:".45rem 1rem", background:"transparent", color:"var(--gold-d)", border:"1px solid var(--gold)", cursor:"pointer" }}>Edit</button>
                          <button onClick={()=>copyLink(inv.id)} style={{ fontFamily:"'Cinzel',serif", fontSize:".72rem", letterSpacing:".1em", padding:".45rem 1rem", background:"transparent", color:"var(--muted)", border:"1px solid rgba(201,168,76,.3)", cursor:"pointer" }}>Copy Link</button>
                          <button onClick={()=>setDeleteTarget(inv.id)} style={{ fontFamily:"'Cinzel',serif", fontSize:".72rem", letterSpacing:".1em", padding:".45rem 1rem", background:"transparent", color:"#c0392b", border:"1px solid #f5c6c6", cursor:"pointer" }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Messages tab */}
        {activeTab==="messages" && (
          <div>
            {invitations.flatMap(inv => (inv.messages||[]).map(m=>({...m,invId:inv.id,couple:`${inv.form.bride} & ${inv.form.groom}`}))).length===0 ? (
              <div style={{ textAlign:"center", padding:"5rem 2rem", background:"#fff", border:"1px dashed rgba(201,168,76,.3)" }}>
                <div style={{ fontSize:"3rem", marginBottom:"1.5rem" }}>💌</div>
                <p style={{ color:"var(--muted)" }}>No messages yet. Share your invitation to start receiving wishes!</p>
              </div>
            ) : (
              <div style={{ display:"grid", gap:"1rem" }}>
                {invitations.flatMap(inv => (inv.messages||[]).map((m,i) => (
                  <div key={i} style={{ background:"#fff", border:"1px solid rgba(201,168,76,.2)", padding:"1.5rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".5rem" }}>
                      <span className="cinzel" style={{ fontSize:".82rem", color:"var(--dark)" }}>{m.name}</span>
                      <span style={{ fontSize:".78rem", color:"var(--muted)" }}>{m.date}</span>
                    </div>
                    <p style={{ fontSize:".9rem", color:"var(--text)", marginBottom:".5rem" }}>{m.message}</p>
                    <span style={{ fontSize:".75rem", color:"var(--muted)", letterSpacing:".06em" }}>Re: {inv.form.bride} & {inv.form.groom}'s Invitation · {m.attending==="yes"?"✓ Attending":"✗ Not Attending"}</span>
                  </div>
                )))}
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {activeTab==="settings" && (
          <div style={{ background:"#fff", border:"1px solid rgba(201,168,76,.2)", padding:"2rem" }}>
            <h3 className="cinzel" style={{ fontSize:"1rem", color:"var(--dark)", marginBottom:"1.8rem" }}>Account Settings</h3>
            <Input label="Display Name" value={user.name} onChange={()=>{}} placeholder="Your name"/>
            <Input label="Email Address" type="email" value={user.email} onChange={()=>{}} placeholder="email"/>
            <div style={{ borderTop:"1px solid rgba(201,168,76,.2)", paddingTop:"1.5rem", marginTop:".5rem" }}>
              <p style={{ fontSize:".86rem", color:"var(--muted)", marginBottom:"1rem" }}>Current Plan: <strong style={{color:"var(--gold-d)"}}>Basic (2 invitations)</strong></p>
              <Btn small>Upgrade Plan</Btn>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={()=>setDeleteTarget(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h3 className="cinzel" style={{ fontSize:"1.1rem", color:"var(--dark)", marginBottom:"1rem" }}>Delete Invitation?</h3>
            <p style={{ fontSize:".9rem", color:"var(--muted)", marginBottom:"2rem", lineHeight:1.7 }}>This action cannot be undone. The invitation link will stop working immediately.</p>
            <div style={{ display:"flex", gap:"1rem", justifyContent:"flex-end" }}>
              <Btn outline small onClick={()=>setDeleteTarget(null)}>Cancel</Btn>
              <Btn small onClick={()=>{ setInvitations(prev=>prev.filter(i=>i.id!==deleteTarget)); setDeleteTarget(null); }} style={{ background:"#c0392b", boxShadow:"none" }}>Delete</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SCRATCH CARD COMPONENT
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   DOOR SEAL BUTTON (fullscreen door center button)
═══════════════════════════════════════════════════════════ */
const DoorSeal = ({ accent, textColor, isDark, onOpen }) => {
  const [sparksActive, setSparksActive] = useState(false);
  const [sparks, setSparks] = useState([]);
  const sealRef = useRef(null);

  const handleClick = () => {
    if (sparksActive) return;
    setSparksActive(true);

    // Generate sparks
    const newSparks = [];
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const dist  = 70 + Math.random() * 130;
      newSparks.push({
        id: i,
        type: "dot",
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: 2 + Math.random() * 5,
        dur: 0.45 + Math.random() * 0.5,
        delay: Math.random() * 0.1,
        color: `hsl(${38 + Math.random()*22},90%,${55+Math.random()*20}%)`,
      });
    }
    const symbols = ["✦","✧","★","◆","·"];
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 55 + Math.random() * 150;
      newSparks.push({
        id: 100+i,
        type: "star",
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        sym: symbols[Math.floor(Math.random()*symbols.length)],
        dur: 0.6 + Math.random() * 0.55,
        delay: Math.random() * 0.12,
        sz: 11 + Math.random() * 14,
        rot: 160 + Math.random() * 200,
      });
    }
    setSparks(newSparks);

    // Open doors after sparks peak
    setTimeout(() => { onOpen(); }, 380);
    setTimeout(() => { setSparksActive(false); setSparks([]); }, 1200);
  };

  return (
    <div ref={sealRef} style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:50 }}>
      {/* Spark particles */}
      {sparks.map(s => s.type==="dot" ? (
        <div key={s.id} style={{
          position:"absolute", left:0, top:0,
          width:`${s.size}px`, height:`${s.size}px`,
          borderRadius:"50%",
          background:s.color,
          boxShadow:`0 0 ${s.size*2}px ${s.color}`,
          pointerEvents:"none",
          animation:`doorSparkFly ${s.dur}s ease-out ${s.delay}s both`,
          "--tx":`${s.tx}px`, "--ty":`${s.ty}px`,
          margin:`-${s.size/2}px`,
        }}/>
      ) : (
        <div key={s.id} style={{
          position:"absolute", left:0, top:0,
          fontSize:`${s.sz}px`, color:accent,
          textShadow:`0 0 8px ${accent}`,
          pointerEvents:"none",
          animation:`doorStarFly ${s.dur}s ease-out ${s.delay}s both`,
          "--tx":`${s.tx}px`, "--ty":`${s.ty}px`,
          "--rot":`${s.rot}deg`,
          transformOrigin:"center",
        }}>{s.sym}</div>
      ))}
      {/* Ring bursts */}
      {sparksActive && [0,120].map(delay => (
        <div key={delay} style={{
          position:"absolute", left:"50%", top:"50%",
          transform:"translate(-50%,-50%)",
          border:`1.5px solid ${accent}`,
          borderRadius:"50%",
          pointerEvents:"none",
          animation:`doorRingBurst 0.7s ease-out ${delay}ms both`,
        }}/>
      ))}

      {/* The Seal */}
      <button onClick={handleClick} style={{
        background:"none", border:"none", cursor:"pointer", outline:"none",
        position:"relative", display:"block",
      }}>
        {/* outer hover ring 1 */}
        <div className="seal-ring-1" style={{
          position:"absolute", inset:"-10px", borderRadius:"50%",
          border:`1px solid ${accent}40`, transition:"inset 0.35s ease, border-color 0.35s ease",
          pointerEvents:"none",
        }}/>
        {/* outer hover ring 2 */}
        <div className="seal-ring-2" style={{
          position:"absolute", inset:"-20px", borderRadius:"50%",
          border:`1px solid ${accent}18`, transition:"inset 0.45s ease 0.05s, border-color 0.45s ease 0.05s",
          pointerEvents:"none",
        }}/>
        {/* main circle */}
        <div style={{
          width:"128px", height:"128px", borderRadius:"50%",
          background: isDark
            ? `radial-gradient(circle at 38% 35%, rgba(60,100,70,0.9), rgba(10,30,15,0.95))`
            : `radial-gradient(circle at 38% 35%, rgba(240,230,210,0.95), rgba(210,195,165,0.9))`,
          border:`1px solid ${accent}50`,
          display:"flex", alignItems:"center", justifyContent:"center",
          position:"relative", overflow:"hidden",
          boxShadow:`0 0 0 1px ${accent}15, 0 8px 40px rgba(0,0,0,0.45), 0 0 28px ${accent}18`,
          transition:"transform 0.3s ease, box-shadow 0.3s ease",
        }}>
          {/* circular arc text */}
          <svg style={{ position:"absolute", inset:0, opacity:0.38 }} viewBox="0 0 128 128">
            <defs>
              <path id="seal-arc-top" d="M 18,64 A 46,46 0 1,1 110,64"/>
              <path id="seal-arc-bot" d="M 18,64 A 46,46 0 0,0 110,64"/>
            </defs>
            <text fontFamily="Cinzel,serif" fontSize="8" fill={accent} letterSpacing="2.5">
              <textPath href="#seal-arc-top" startOffset="12%">INVITATION WALA</textPath>
            </text>
            <text fontFamily="Cinzel,serif" fontSize="7.5" fill={accent} letterSpacing="2" opacity="0.65">
              <textPath href="#seal-arc-bot" startOffset="18%">✦  OPEN  ✦  REVEAL  ✦</textPath>
            </text>
          </svg>
          {/* monogram + label */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px", position:"relative", zIndex:1 }}>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"1.9rem", fontWeight:500, color:accent, lineHeight:1, textShadow:`0 0 18px ${accent}80` }}>IW</span>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.4rem", letterSpacing:"0.22em", color:`${accent}b0`, textTransform:"uppercase" }}>Tap to Open</span>
          </div>
        </div>
      </button>

      <style>{`
        .seal-ring-1, .seal-ring-2 { pointer-events:none; }
        button:hover .seal-ring-1 { inset:-14px !important; border-color:${accent}55 !important; }
        button:hover .seal-ring-2 { inset:-26px !important; border-color:${accent}22 !important; }
        button:hover > div { transform:scale(1.06); box-shadow:0 0 0 1px ${accent}30, 0 12px 50px rgba(0,0,0,0.55), 0 0 50px ${accent}30 !important; }
        @keyframes doorSparkFly {
          0%   { transform:translate(0,0) scale(1); opacity:1; }
          100% { transform:translate(var(--tx),var(--ty)) scale(0); opacity:0; }
        }
        @keyframes doorStarFly {
          0%   { transform:translate(0,0) scale(0) rotate(0deg); opacity:1; }
          40%  { opacity:1; }
          100% { transform:translate(var(--tx),var(--ty)) scale(1) rotate(var(--rot)); opacity:0; }
        }
        @keyframes doorRingBurst {
          0%   { width:0; height:0; margin-left:0; margin-top:0; opacity:0.85; }
          100% { width:220px; height:220px; margin-left:-110px; margin-top:-110px; opacity:0; }
        }
      `}</style>
    </div>
  );
};

const ScratchCard = ({ date, onRevealed }) => {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [scratching, setScratching] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    grad.addColorStop(0,"#c9a84c"); grad.addColorStop(.5,"#e8d5a3"); grad.addColorStop(1,"#8a6a1f");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font = "bold 14px 'Cinzel', serif";
    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.textAlign = "center";
    ctx.fillText("✦ SCRATCH HERE ✦", canvas.width/2, canvas.height/2);
  }, []);

  const scratch = useCallback((e) => {
    if (!scratching) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches?e.touches[0].clientX:e.clientX)-rect.left;
    const y = (e.touches?e.touches[0].clientY:e.clientY)-rect.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI*2);
    ctx.fill();
    // Check coverage
    const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let transparent = 0;
    for (let i=3; i<data.length; i+=4) { if (data[i]<128) transparent++; }
    if (transparent/((data.length/4)) > 0.5 && !revealed) { setRevealed(true); onRevealed?.(); }
  }, [scratching, revealed, onRevealed]);

  return (
    <div className="scratch-wrapper" style={{ width:"280px", height:"130px" }}>
      <div className="scratch-reveal" style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:".4rem" }}>
        <p style={{ fontSize:".75rem", color:"var(--muted)", letterSpacing:".15em", fontFamily:"'Cinzel',serif" }}>WEDDING DATE</p>
        <p className="cinzel" style={{ fontSize:"1.2rem", color:"var(--gold-d)" }}>{date || "To Be Revealed"}</p>
        {revealed && <p style={{ fontSize:".7rem", color:"var(--gold)", fontStyle:"italic" }}>✦ Save the Date ✦</p>}
      </div>
      {!revealed && (
        <canvas ref={canvasRef} style={{ width:"100%", height:"100%" }}
          onMouseDown={()=>setScratching(true)}
          onMouseMove={scratch}
          onMouseUp={()=>setScratching(false)}
          onMouseLeave={()=>setScratching(false)}
          onTouchStart={e=>{e.preventDefault();setScratching(true);}}
          onTouchMove={e=>{e.preventDefault();scratch(e);}}
          onTouchEnd={()=>setScratching(false)}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN COMPONENT
═══════════════════════════════════════════════════════════ */
const Countdown = ({ targetDate, accent="#c9a84c", textColor="#3a2e1a" }) => {
  const [time, setTime] = useState({ d:0, h:0, m:0, s:0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTime({d:0,h:0,m:0,s:0}); return; }
      setTime({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) });
    };
    tick(); const t = setInterval(tick,1000); return ()=>clearInterval(t);
  }, [targetDate]);
  return (
    <div style={{ display:"flex", gap:"1.5rem", justifyContent:"center", flexWrap:"wrap" }}>
      {[["Days",time.d],["Hours",time.h],["Mins",time.m],["Secs",time.s]].map(([l,v]) => (
        <div key={l} style={{ textAlign:"center", minWidth:"60px" }}>
          <div className="cinzel" style={{ fontSize:"2.4rem", color:accent, lineHeight:1, fontWeight:400 }}>{String(v).padStart(2,"0")}</div>
          <div style={{ fontSize:".68rem", color:textColor, letterSpacing:".15em", marginTop:".3rem", opacity:.7 }}>{l}</div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   INVITATION PAGE (The actual invitation guests see)
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   REAL PHOTO SLIDESHOW COMPONENT
═══════════════════════════════════════════════════════════ */
const RealSlideshow = ({ images, accent, isDark, textColor }) => {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const total = images.length;

  // Auto-advance
  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => goTo((prev) => (prev + 1) % total), 4000);
    return () => clearInterval(t);
  }, [total]);

  const goTo = (idxOrFn) => {
    if (transitioning) return;
    setTransitioning(true);
    const next = typeof idxOrFn === "function" ? idxOrFn(current) : idxOrFn;
    setTimeout(() => { setCurrent(next); setTransitioning(false); }, 350);
  };

  const prev = () => goTo((current - 1 + total) % total);
  const next = () => goTo((current + 1) % total);

  if (!images || images.length === 0) return null;

  return (
    <div style={{ position:"relative", maxWidth:"900px", margin:"0 auto", padding:"0 2rem" }}>
      {/* Main image */}
      <div style={{ position:"relative", overflow:"hidden", border:`1px solid ${accent}30`, background:isDark?"rgba(0,0,0,.3)":"rgba(255,255,255,.3)" }}>
        <div style={{ opacity: transitioning ? 0 : 1, transition:"opacity 0.35s ease", width:"100%" }}>
          <img
            src={images[current].b64}
            alt={images[current].name || `Photo ${current + 1}`}
            style={{ width:"100%", maxHeight:"520px", objectFit:"cover", display:"block" }}
          />
        </div>
        {/* Gradient overlays */}
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(to top, ${isDark?"rgba(0,0,0,0.55)":"rgba(0,0,0,0.2)"} 0%, transparent 40%)`, pointerEvents:"none" }}/>

        {/* Counter */}
        <div className="cinzel" style={{ position:"absolute", bottom:"1rem", left:"50%", transform:"translateX(-50%)", fontSize:".68rem", color:"rgba(255,255,255,.7)", letterSpacing:".15em", background:"rgba(0,0,0,.4)", padding:".3rem .8rem", borderRadius:"20px" }}>
          {current + 1} / {total}
        </div>

        {/* Arrows */}
        {total > 1 && (<>
          <button onClick={prev} style={{
            position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)",
            width:"38px", height:"38px", borderRadius:"50%", background:"rgba(0,0,0,.5)",
            border:`1px solid ${accent}50`, color:"#fff", fontSize:"1rem", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s"
          }}>‹</button>
          <button onClick={next} style={{
            position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)",
            width:"38px", height:"38px", borderRadius:"50%", background:"rgba(0,0,0,.5)",
            border:`1px solid ${accent}50`, color:"#fff", fontSize:"1rem", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s"
          }}>›</button>
        </>)}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div style={{ display:"flex", gap:".5rem", marginTop:".8rem", overflowX:"auto", paddingBottom:".4rem", scrollbarWidth:"thin", scrollbarColor:`${accent}50 transparent` }}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => goTo(i)}
              style={{
                flexShrink:0, width:"64px", height:"64px", overflow:"hidden", cursor:"pointer",
                border:`2px solid ${i === current ? accent : "transparent"}`,
                opacity: i === current ? 1 : 0.55, transition:"all .2s",
              }}
            >
              <img src={img.b64} alt={img.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
            </div>
          ))}
        </div>
      )}

      {/* Dot nav */}
      {total > 1 && (
        <div style={{ display:"flex", justifyContent:"center", gap:".4rem", marginTop:"1rem" }}>
          {images.map((_,i) => (
            <div key={i} onClick={()=>goTo(i)} style={{
              width: i === current ? "20px" : "7px", height:"7px", borderRadius:"4px",
              background: i === current ? accent : `${accent}40`,
              cursor:"pointer", transition:"all .3s ease",
            }}/>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   INVITATION MUSIC PLAYER (real audio)
═══════════════════════════════════════════════════════════ */
const InvitationMusic = ({ src, accent, isDark, textColor }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  // Try autoplay on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 0.4;
    const tryPlay = async () => {
      try {
        await audio.play();
        setPlaying(true); setStarted(true);
      } catch {
        // Autoplay blocked — user must click
      }
    };
    const t = setTimeout(tryPlay, 800);
    return () => { clearTimeout(t); audio.pause(); };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(()=>{ setPlaying(true); setStarted(true); }); }
  };

  return (
    <div style={{ position:"fixed", top:"5rem", right:"1.5rem", zIndex:100 }}>
      <audio ref={audioRef} src={src} loop preload="auto"/>
      <button
        onClick={toggle}
        title={playing ? "Mute music" : "Play music"}
        style={{
          width:"42px", height:"42px", borderRadius:"50%",
          background: isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.12)",
          border:`1px solid ${accent}60`, color:textColor,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"1.1rem", cursor:"pointer", backdropFilter:"blur(8px)",
          boxShadow: playing ? `0 0 14px ${accent}50` : "none",
          transition:"all .25s",
        }}
      >
        {playing ? "🎵" : "🔇"}
      </button>
      {!started && (
        <div style={{ position:"absolute", right:"48px", top:"50%", transform:"translateY(-50%)", whiteSpace:"nowrap", background:"rgba(0,0,0,.7)", color:"#fff", fontSize:".65rem", padding:".3rem .65rem", borderRadius:"4px", fontFamily:"Cinzel,serif", letterSpacing:".08em", pointerEvents:"none" }}>
          Tap to play music
        </div>
      )}
    </div>
  );
};

const InvitationPage = ({ invitation, setInvitations, isPreview=false }) => {
  const { template, form } = invitation;
  const [doorOpen, setDoorOpen] = useState(false);
  const [doorDone, setDoorDone] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [lang, setLang] = useState("en");
  const [msgForm, setMsgForm] = useState({ name:"", message:"", attending:"yes", guests:1 });
  const [msgSent, setMsgSent] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [scratchDone, setScratchDone] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  const t = template;
  const bg = t.bg;
  const accent = t.accent;
  const textColor = t.textColor;
  const isDark = t.dark;

  // Sparkle positions
  const sparkles = useRef([...Array(12)].map(() => ({ top: Math.random()*100, left: Math.random()*100, delay: Math.random()*3, size: 8+Math.random()*12 }))).current;

  const openDoor = () => { setDoorOpen(true); setTimeout(()=>setDoorDone(true), 2100); };

  const sendMessage = () => {
    if (!msgForm.name || !msgForm.message) return;
    const msg = { ...msgForm, date: new Date().toLocaleDateString() };
    setInvitations(prev => prev.map(inv => inv.id===invitation.id ? { ...inv, messages:[...(inv.messages||[]),msg], views:inv.views+1 } : inv));
    setMsgSent(true);
  };

  const translations = {
    en: { title:"Together We Celebrate", join:"You are cordially invited to celebrate the wedding of", ceremony:"Ceremony", venue:"Venue", rsvp:"RSVP", countdown:"Counting Down to Our Special Day", wish:"Send Your Wishes", attending:"Will you be attending?", yes:"Yes, attending", no:"Unable to attend", submit:"Send Message", thanks:"Thank you for your wishes!" },
    hi: { title:"साथ मनाएं", join:"आपको हमारी शादी में आमंत्रित किया जाता है", ceremony:"विवाह समारोह", venue:"स्थान", rsvp:"आरएसवीपी", countdown:"हमारे खास दिन की उलटी गिनती", wish:"अपनी शुभकामनाएं भेजें", attending:"क्या आप आएंगे?", yes:"हाँ, आऊंगा", no:"नहीं आ पाऊंगा", submit:"संदेश भेजें", thanks:"आपकी शुभकामनाओं के लिए धन्यवाद!" },
    ar: { title:"نحتفل معاً", join:"نتشرف بدعوتكم لحضور حفل زفافنا", ceremony:"حفل الزفاف", venue:"المكان", rsvp:"تأكيد الحضور", countdown:"العد التنازلي ليومنا المميز", wish:"أرسل أمنياتك", attending:"هل ستحضر؟", yes:"نعم، سأحضر", no:"لن أستطيع الحضور", submit:"إرسال الرسالة", thanks:"شكراً على أمنياتك!" },
  };
  const tr = translations[lang] || translations.en;

  // Door scene — FULLSCREEN (only if feature enabled)
  if (form.enableDoor && !doorDone) {
    const doorBaseL = isDark
      ? "linear-gradient(100deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.2) 100%)"
      : "linear-gradient(100deg,rgba(255,255,255,0.5) 0%,rgba(255,255,255,0.2) 100%)";
    const doorBaseR = isDark
      ? "linear-gradient(80deg,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.5) 100%)"
      : "linear-gradient(80deg,rgba(255,255,255,0.2) 0%,rgba(255,255,255,0.5) 100%)";
    const panelBg = isDark ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.14)";
    const corners = ["2px 0 0 2px","2px 2px 0 0","0 0 2px 2px","0 2px 2px 0"];
    const cPos = [{top:"20px",left:"20px"},{top:"20px",right:"20px"},{bottom:"20px",left:"20px"},{bottom:"20px",right:"20px"}];

    return (
      <div style={{ position:"fixed", inset:0, background:bg, overflow:"hidden" }}>
        {/* ambient sparkle stars */}
        {sparkles.map((s,i) => (
          <div key={i} className="sparkle-star" style={{ top:`${s.top}%`, left:`${s.left}%`, fontSize:`${s.size}px`, color:accent, animationDelay:`${s.delay}s`, opacity:0.35, zIndex:2 }}>✦</div>
        ))}

        {/* ── LEFT DOOR ── */}
        <div onClick={!doorOpen?openDoor:undefined} style={{
          position:"absolute", top:0, left:0, width:"50%", height:"100%",
          transformOrigin:"left center",
          transform: doorOpen ? "perspective(2000px) rotateY(-118deg)" : "perspective(2000px) rotateY(0deg)",
          transition:"transform 1.5s cubic-bezier(0.4,0,0.15,1)",
          zIndex:10, cursor: doorOpen ? "default" : "pointer",
          background:bg,
        }}>
          <div style={{ position:"absolute", inset:0, background:doorBaseL }}/>
          {/* seam */}
          <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"1px", background:`linear-gradient(to bottom,transparent,${accent}90 12%,${accent}90 88%,transparent)` }}/>
          {/* border frames */}
          <div style={{ position:"absolute", inset:"20px", border:`1px solid ${accent}28`, pointerEvents:"none" }}/>
          <div style={{ position:"absolute", inset:"34px", border:`1px solid ${accent}12`, pointerEvents:"none" }}/>
          {/* corners */}
          {corners.map((bw,i) => (
            <div key={i} style={{ position:"absolute", width:"22px", height:"22px", borderStyle:"solid", borderColor:`${accent}55`, borderWidth:bw, pointerEvents:"none", ...cPos[i] }}/>
          ))}
          {/* arch */}
          <svg style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"90px", opacity:0.3, pointerEvents:"none" }} viewBox="0 0 100 55" fill="none">
            <path d="M5 55 Q5 8 50 8 Q95 8 95 55" stroke={accent} strokeWidth="1" fill="none"/>
            <path d="M15 55 Q15 18 50 18 Q85 18 85 55" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.5"/>
            <circle cx="50" cy="8" r="3" fill={accent} opacity="0.7"/>
          </svg>
          {/* panels */}
          <div style={{ position:"absolute", top:"72px", left:"52px", right:"24px", height:"25%", border:`1px solid ${accent}18`, background:panelBg, pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:"72px", left:"52px", right:"24px", height:"25%", border:`1px solid ${accent}18`, background:panelBg, pointerEvents:"none" }}/>
          {/* side floral */}
          <svg style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", opacity:0.22, pointerEvents:"none" }} width="14" height="72" viewBox="0 0 14 72" fill="none">
            <line x1="7" y1="0" x2="7" y2="72" stroke={accent} strokeWidth="0.8"/>
            <circle cx="7" cy="18" r="2.5" fill={accent}/><circle cx="7" cy="36" r="4" fill="none" stroke={accent} strokeWidth="0.7"/><circle cx="7" cy="54" r="2.5" fill={accent}/>
          </svg>
        </div>

        {/* ── RIGHT DOOR ── */}
        <div onClick={!doorOpen?openDoor:undefined} style={{
          position:"absolute", top:0, right:0, width:"50%", height:"100%",
          transformOrigin:"right center",
          transform: doorOpen ? "perspective(2000px) rotateY(118deg)" : "perspective(2000px) rotateY(0deg)",
          transition:"transform 1.5s cubic-bezier(0.4,0,0.15,1)",
          zIndex:10, cursor: doorOpen ? "default" : "pointer",
          background:bg,
        }}>
          <div style={{ position:"absolute", inset:0, background:doorBaseR }}/>
          <div style={{ position:"absolute", top:0, left:0, bottom:0, width:"1px", background:`linear-gradient(to bottom,transparent,${accent}90 12%,${accent}90 88%,transparent)` }}/>
          <div style={{ position:"absolute", inset:"20px", border:`1px solid ${accent}28`, pointerEvents:"none" }}/>
          <div style={{ position:"absolute", inset:"34px", border:`1px solid ${accent}12`, pointerEvents:"none" }}/>
          {corners.map((bw,i) => (
            <div key={i} style={{ position:"absolute", width:"22px", height:"22px", borderStyle:"solid", borderColor:`${accent}55`, borderWidth:bw, pointerEvents:"none", ...cPos[i] }}/>
          ))}
          <svg style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"90px", opacity:0.3, pointerEvents:"none" }} viewBox="0 0 100 55" fill="none">
            <path d="M5 55 Q5 8 50 8 Q95 8 95 55" stroke={accent} strokeWidth="1" fill="none"/>
            <path d="M15 55 Q15 18 50 18 Q85 18 85 55" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.5"/>
            <circle cx="50" cy="8" r="3" fill={accent} opacity="0.7"/>
          </svg>
          <div style={{ position:"absolute", top:"72px", left:"24px", right:"52px", height:"25%", border:`1px solid ${accent}18`, background:panelBg, pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:"72px", left:"24px", right:"52px", height:"25%", border:`1px solid ${accent}18`, background:panelBg, pointerEvents:"none" }}/>
          <svg style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", opacity:0.22, pointerEvents:"none" }} width="14" height="72" viewBox="0 0 14 72" fill="none">
            <line x1="7" y1="0" x2="7" y2="72" stroke={accent} strokeWidth="0.8"/>
            <circle cx="7" cy="18" r="2.5" fill={accent}/><circle cx="7" cy="36" r="4" fill="none" stroke={accent} strokeWidth="0.7"/><circle cx="7" cy="54" r="2.5" fill={accent}/>
          </svg>
        </div>

        {/* center filament */}
        <div style={{ position:"absolute", top:0, bottom:0, left:"calc(50% - 0.5px)", width:"1px", background:`linear-gradient(to bottom,transparent,${accent}80 12%,${accent}80 88%,transparent)`, opacity: doorOpen?0:0.65, transition:"opacity 0.4s", zIndex:11, pointerEvents:"none" }}/>
        {/* filament arches */}
        <svg style={{ position:"absolute", top:"7%", left:"50%", transform:"translateX(-50%)", width:"66px", opacity:doorOpen?0:0.3, transition:"opacity 0.4s", zIndex:11, pointerEvents:"none" }} viewBox="0 0 66 38" fill="none">
          <path d="M4 38 Q4 4 33 4 Q62 4 62 38" stroke={accent} strokeWidth="1" fill="none"/>
        </svg>
        <svg style={{ position:"absolute", bottom:"7%", left:"50%", transform:"translateX(-50%) rotate(180deg)", width:"66px", opacity:doorOpen?0:0.3, transition:"opacity 0.4s", zIndex:11, pointerEvents:"none" }} viewBox="0 0 66 38" fill="none">
          <path d="M4 38 Q4 4 33 4 Q62 4 62 38" stroke={accent} strokeWidth="1" fill="none"/>
        </svg>

        {/* SEAL */}
        {!doorOpen && <DoorSeal accent={accent} textColor={textColor} isDark={isDark} onOpen={openDoor}/>}

        {/* warm glow behind doors */}
        <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 60% 80% at 50% 50%,${accent}20,transparent 70%)`, opacity:doorOpen?1:0, transition:"opacity 1s ease 0.5s", zIndex:1, pointerEvents:"none" }}/>
      </div>
    );
  }

  // Main invitation content
  return (
    <div className="inv-page" style={{ background:bg }}>
      {/* Sparkles */}
      {sparkles.map((s,i) => (
        <div key={i} className="sparkle-star" style={{ top:`${s.top}%`, left:`${s.left}%`, fontSize:`${s.size}px`, color:accent, animationDelay:`${s.delay}s`, opacity:.4 }}>✦</div>
      ))}

      {/* Music player (real audio) + Language */}
      {form.enableMusic && form.musicFile && <InvitationMusic src={form.musicFile} accent={accent} isDark={isDark} textColor={textColor}/>}
      <div style={{ position:"fixed", top:"5rem", right:"1.5rem", zIndex:100, display:"flex", gap:".7rem", flexDirection:"column", alignItems:"flex-end" }}>
        {form.enableMusic && !form.musicFile && (
          <button onClick={()=>setMusicOn(!musicOn)} style={{ background:isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.1)", border:`1px solid ${accent}50`, color:textColor, padding:".5rem .8rem", fontSize:".8rem", cursor:"pointer", borderRadius:"4px", backdropFilter:"blur(6px)" }}>
            {musicOn?"🎵":"🔇"}
          </button>
        )}
        {form.enableTranslation && (
          <select value={lang} onChange={e=>setLang(e.target.value)} style={{ background:isDark?"rgba(255,255,255,.1)":"rgba(255,255,255,.9)", border:`1px solid ${accent}50`, color:isDark?"#fff":textColor, padding:".4rem .6rem", fontSize:".75rem", cursor:"pointer", borderRadius:"4px" }}>
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="ar">AR</option>
          </select>
        )}
      </div>

      {/* Hero section */}
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"6rem 2rem 4rem", position:"relative", zIndex:2 }}>
        {/* Real hero background image */}
        {form.heroImage && (
          <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none" }}>
            <img src={form.heroImage} alt="hero" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.28, display:"block" }}/>
            <div style={{ position:"absolute", inset:0, background:`linear-gradient(to bottom, ${bg.includes("rgba")?bg:"transparent"} 0%, transparent 40%, transparent 60%, ${bg.includes("rgba")?bg:"transparent"} 100%)` }}/>
          </div>
        )}
        <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:textColor, opacity:.6, letterSpacing:".2em", marginBottom:"1.5rem", animation:"fadeUp .8s ease .3s both" }}>{tr.join}</p>
        <div style={{ animation:"fadeUp .8s ease .5s both" }}>
          <h1 className="cinzel" style={{ fontSize:"clamp(2.5rem,8vw,6rem)", fontWeight:400, color:textColor, lineHeight:1.1, marginBottom:".5rem" }}>{form.bride || "Bride"}</h1>
          <div className="cormorant" style={{ fontStyle:"italic", fontSize:"clamp(1.5rem,4vw,2.5rem)", color:accent, margin:".5rem 0" }}>&amp;</div>
          <h1 className="cinzel" style={{ fontSize:"clamp(2.5rem,8vw,6rem)", fontWeight:400, color:textColor, lineHeight:1.1 }}>{form.groom || "Groom"}</h1>
        </div>
        <div style={{ width:"80px", height:"1px", background:accent, margin:"2rem auto", animation:"fadeUp .8s ease .7s both" }}/>
        <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1.3rem", color:textColor, opacity:.8, marginBottom:"2rem", animation:"fadeUp .8s ease .9s both" }}>
          {form.weddingDate ? new Date(form.weddingDate).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}) : "Date to be announced"}
        </p>
        {form.weddingTime && <p style={{ fontSize:"1rem", color:accent, letterSpacing:".15em", fontFamily:"'Cinzel',serif", animation:"fadeUp .8s ease 1.1s both" }}>{form.weddingTime}</p>}

        {/* Scroll hint */}
        <div style={{ position:"absolute", bottom:"2rem", left:"50%", transform:"translateX(-50%)", animation:"bounce 1.5s ease infinite", color:accent, fontSize:"1.2rem", opacity:.6 }}>↓</div>
      </div>

      {/* Scratch card section */}
      {form.enableScratch && (
        <div style={{ padding:"5rem 2rem", textAlign:"center", position:"relative", zIndex:2 }}>
          <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:accent, letterSpacing:".2em", marginBottom:"1rem" }}>✦ Save the Date ✦</p>
          <p style={{ color:textColor, opacity:.7, marginBottom:"2rem", fontSize:".9rem", letterSpacing:".08em" }}>Scratch below to reveal the date</p>
          <div style={{ display:"flex", justifyContent:"center" }}>
            <ScratchCard date={form.weddingDate ? new Date(form.weddingDate).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : ""} onRevealed={()=>setScratchDone(true)}/>
          </div>
          {scratchDone && <p className="cormorant" style={{ fontStyle:"italic", color:accent, marginTop:"1.5rem", fontSize:"1.1rem" }}>✦ We can't wait to celebrate with you ✦</p>}
        </div>
      )}

      {/* Countdown */}
      {form.enableCountdown && form.weddingDate && (
        <div style={{ padding:"5rem 2rem", textAlign:"center", background:isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)", position:"relative", zIndex:2 }}>
          <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:accent, letterSpacing:".2em", marginBottom:".8rem" }}>✦</p>
          <h2 className="cinzel" style={{ fontSize:"1.3rem", fontWeight:400, color:textColor, marginBottom:"2.5rem", letterSpacing:".05em" }}>{tr.countdown}</h2>
          <Countdown targetDate={form.weddingDate} accent={accent} textColor={textColor}/>
        </div>
      )}

      {/* Love story */}
      {form.story && (
        <div style={{ padding:"5rem 2rem", textAlign:"center", maxWidth:"600px", margin:"0 auto", position:"relative", zIndex:2 }}>
          <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:accent, letterSpacing:".2em", marginBottom:"1rem" }}>Our Story</p>
          <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1.15rem", color:textColor, lineHeight:1.9, opacity:.85 }}>{form.story}</p>
        </div>
      )}

      {/* Photo Slideshow — real images */}
      {form.enableSlideshow && (
        <div style={{ padding:"4rem 0", position:"relative", zIndex:2 }}>
          <div style={{ textAlign:"center", marginBottom:"2rem", padding:"0 2rem" }}>
            <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:accent, letterSpacing:".2em" }}>Our Moments</p>
          </div>
          {form.slideshowImages && form.slideshowImages.length > 0 ? (
            <RealSlideshow images={form.slideshowImages} accent={accent} isDark={isDark} textColor={textColor}/>
          ) : (
            <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap", padding:"0 2rem" }}>
              {["💐","💍","🌹","💑","🥂"].map((em,i) => (
                <div key={i} style={{ width:"100px", height:"100px", background:isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem", border:`1px solid ${accent}30` }}>{em}</div>
              ))}
              <p style={{ width:"100%", fontSize:".78rem", color:textColor, opacity:.4, marginTop:".5rem", letterSpacing:".1em", textAlign:"center" }}>Upload photos in the builder to show your gallery here</p>
            </div>
          )}
        </div>
      )}

      {/* Venue */}
      {form.venue && (
        <div style={{ padding:"5rem 2rem", textAlign:"center", position:"relative", zIndex:2 }}>
          <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:accent, letterSpacing:".2em", marginBottom:".8rem" }}>✦</p>
          <h2 className="cinzel" style={{ fontSize:"1.3rem", fontWeight:400, color:textColor, marginBottom:"1.5rem" }}>{tr.ceremony}</h2>
          <div style={{ maxWidth:"480px", margin:"0 auto", padding:"2rem", border:`1px solid ${accent}30`, background:isDark?"rgba(255,255,255,.05)":"rgba(255,255,255,.5)" }}>
            <h3 className="cinzel" style={{ fontSize:"1.1rem", color:accent, marginBottom:".8rem" }}>{form.venue}</h3>
            {form.venueAddress && <p style={{ fontSize:".9rem", color:textColor, opacity:.75, lineHeight:1.7, marginBottom:"1rem" }}>{form.venueAddress}</p>}
            <p className="cinzel" style={{ fontSize:".82rem", color:textColor, opacity:.6, marginBottom:form.venueMapLink?"1rem":0 }}>
              {form.weddingDate && new Date(form.weddingDate).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
              {form.weddingTime && ` · ${form.weddingTime}`}
            </p>
            {form.venueMapLink && form.enableMap && (
              <a href={form.venueMapLink} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", marginTop:".8rem", fontFamily:"'Cinzel',serif", fontSize:".72rem", letterSpacing:".1em", padding:".45rem 1rem", border:`1px solid ${accent}`, color:accent, transition:"all .2s" }}>📍 Open in Maps</a>
            )}
          </div>
        </div>
      )}

      {/* Dress code */}
      {form.dressCode && (
        <div style={{ padding:"2rem", textAlign:"center", position:"relative", zIndex:2 }}>
          <p className="cinzel" style={{ fontSize:".78rem", letterSpacing:".15em", color:textColor, opacity:.6 }}>DRESS CODE: <span style={{color:accent}}>{form.dressCode.toUpperCase()}</span></p>
        </div>
      )}

      {/* Note */}
      {form.note && (
        <div style={{ padding:"2rem 4rem", textAlign:"center", position:"relative", zIndex:2 }}>
          <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1.1rem", color:textColor, opacity:.8, lineHeight:1.8 }}>{form.note}</p>
        </div>
      )}

      {/* Guest messaging */}
      {form.enableMessaging && !isPreview && (
        <div style={{ padding:"5rem 2rem", textAlign:"center", position:"relative", zIndex:2 }}>
          <p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:accent, letterSpacing:".2em", marginBottom:".8rem" }}>✦</p>
          <h2 className="cinzel" style={{ fontSize:"1.3rem", fontWeight:400, color:textColor, marginBottom:"1.5rem" }}>{tr.wish}</h2>
          {msgSent ? (
            <div style={{ padding:"2rem", border:`1px solid ${accent}50`, background:isDark?"rgba(255,255,255,.05)":"rgba(255,255,255,.7)", maxWidth:"480px", margin:"0 auto" }}>
              <div style={{ fontSize:"2rem", marginBottom:"1rem" }}>💌</div>
              <p className="cinzel" style={{ fontSize:".9rem", color:accent }}>{tr.thanks}</p>
            </div>
          ) : (
            <div style={{ maxWidth:"480px", margin:"0 auto", padding:"2rem", border:`1px solid ${accent}30`, background:isDark?"rgba(255,255,255,.05)":"rgba(255,255,255,.7)", backdropFilter:"blur(4px)" }}>
              <div style={{ marginBottom:"1rem" }}>
                <input value={msgForm.name} onChange={e=>setMsgForm(p=>({...p,name:e.target.value}))} placeholder="Your Name" style={{ width:"100%", padding:".7rem 1rem", background:"transparent", border:`1px solid ${accent}40`, color:textColor, fontFamily:"'Lato',sans-serif", fontSize:".9rem", marginBottom:".8rem", outline:"none" }}/>
                <textarea value={msgForm.message} onChange={e=>setMsgForm(p=>({...p,message:e.target.value}))} placeholder="Your wishes..." rows={3} style={{ width:"100%", padding:".7rem 1rem", background:"transparent", border:`1px solid ${accent}40`, color:textColor, fontFamily:"'Lato',sans-serif", fontSize:".9rem", resize:"vertical", outline:"none", marginBottom:".8rem" }}/>
                <div style={{ display:"flex", gap:"1rem", marginBottom:".8rem", justifyContent:"center" }}>
                  {["yes","no"].map(v => (
                    <label key={v} style={{ display:"flex", alignItems:"center", gap:".4rem", cursor:"pointer", fontSize:".85rem", color:textColor, opacity:.8 }}>
                      <input type="radio" value={v} checked={msgForm.attending===v} onChange={()=>setMsgForm(p=>({...p,attending:v}))} style={{ accentColor:accent }}/>
                      {v==="yes"?tr.yes:tr.no}
                    </label>
                  ))}
                </div>
                {msgForm.attending==="yes" && (
                  <div style={{ marginBottom:".8rem", display:"flex", alignItems:"center", gap:".8rem" }}>
                    <label style={{ fontSize:".82rem", color:textColor, opacity:.7 }}>Number of guests:</label>
                    <input type="number" min="1" max="20" value={msgForm.guests} onChange={e=>setMsgForm(p=>({...p,guests:e.target.value}))} style={{ width:"60px", padding:".4rem .6rem", background:"transparent", border:`1px solid ${accent}40`, color:textColor, fontSize:".9rem", outline:"none" }}/>
                  </div>
                )}
                <button onClick={sendMessage} style={{ width:"100%", padding:".75rem", background:accent, color:"#fff", border:"none", fontFamily:"'Cinzel',serif", fontSize:".8rem", letterSpacing:".1em", cursor:"pointer" }}>{tr.submit}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding:"3rem 2rem", textAlign:"center", borderTop:`1px solid ${accent}25`, position:"relative", zIndex:2 }}>
        <div className="cinzel" style={{ fontSize:"1.2rem", color:accent, letterSpacing:".1em", marginBottom:".5rem" }}>Invitation Wala</div>
        <p style={{ fontSize:".72rem", color:textColor, opacity:.35, letterSpacing:".12em" }}>DIGITAL WEDDING INVITATIONS</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PREVIEW PAGE
═══════════════════════════════════════════════════════════ */
const PreviewPage = ({ template, setPage }) => {
  if (!template) { setPage("templates"); return null; }
  const demoInv = {
    id:"preview",
    template,
    form: {
      bride:"Priya", groom:"Arjun",
      weddingDate:"2026-12-18", weddingTime:"18:00",
      venue:"The Grand Palace Ballroom", venueAddress:"123 Palace Road, Mumbai 400001",
      story:"We met at a coffee shop in 2022 and knew instantly that something special had begun.",
      dressCode:"Formal Indian Attire",
      note:"Your presence is the greatest gift we could ask for.",
      enableScratch:true, enableCountdown:true, enableMusic:true, enableMap:true,
      enableMessaging:false, enableSlideshow:true, enableDoor:true, enableTranslation:true,
    },
    messages:[], views:0
  };
  return (
    <div style={{ paddingTop:"72px", minHeight:"100vh" }}>
      <div style={{ background:"var(--dark)", padding:"1rem 2rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div className="cinzel" style={{ color:"rgba(255,255,255,.7)", fontSize:".8rem", letterSpacing:".12em" }}>PREVIEW — {template.name}</div>
        <div style={{ display:"flex", gap:"1rem" }}>
          <Btn small outline onClick={()=>setPage("templates")} style={{ borderColor:"rgba(255,255,255,.3)", color:"rgba(255,255,255,.7)" }}>Back</Btn>
          <Btn small onClick={()=>setPage("builder")}>Use This Template</Btn>
        </div>
      </div>
      <InvitationPage invitation={demoInv} setInvitations={()=>{}} isPreview={true}/>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   STATIC PAGES (About, Contact, Terms, Privacy, Refund)
═══════════════════════════════════════════════════════════ */
const StaticPage = ({ page, setPage }) => {
  const content = {
    about: {
      title:"About Invitation Wala", sub:"Our Mission",
      body:`Invitation Wala was founded with a simple belief: that every couple deserves a beautiful, memorable way to invite the people they love to celebrate their special day.\n\nWe saw couples spending thousands on paper invitations that would end up in a drawer — or worse, the trash — and thought there had to be a better way. So we built Invitation Wala: a platform that lets you create stunning, interactive digital wedding invitations in minutes.\n\nOur team of designers and developers obsess over every detail — from the smoothness of the 3D door animation to the elegance of the countdown typography — so that your invitation feels truly special.\n\nToday, thousands of couples across India and around the world use Invitation Wala to share their love story beautifully and sustainably.`
    },
    contact: {
      title:"Contact Us", sub:"We'd love to hear from you",
      body:`Have questions, feedback, or need support? We're here to help.\n\n📧 Email: support@invitationwala.com\n💬 WhatsApp: +91 98765 43210\n\nOur support team responds within 24 hours, Monday to Saturday.\n\nFor urgent issues regarding live invitations, please WhatsApp us directly for the fastest response.`
    },
    terms: {
      title:"Terms of Service", sub:"Last updated: January 2026",
      body:`By using Invitation Wala, you agree to these terms.\n\nAccount & Access\nYou must provide accurate information when creating your account. You are responsible for maintaining the security of your account credentials.\n\nInvitations\nEach paid plan allows creation of up to 2 invitation webpages. Invitations remain live for 12 months from the date of creation. You retain ownership of all content you upload.\n\nPayments\nAll payments are processed securely. One-time payments grant access for the duration specified in your plan. We do not offer refunds except as described in our Refund Policy.\n\nProhibited Use\nYou may not use Invitation Wala for any unlawful purpose, to transmit spam or harmful content, or to infringe on others' intellectual property rights.\n\nModifications\nWe reserve the right to modify these terms with reasonable notice to users.`
    },
    privacy: {
      title:"Privacy Policy", sub:"Your privacy matters to us",
      body:`We collect only what we need to provide our services.\n\nWhat We Collect\n— Your name and email address for account creation\n— Wedding details you enter when building your invitation\n— Guest messages submitted through your invitation\n— Basic usage analytics to improve our platform\n\nWhat We Don't Do\n— We never sell your personal data to third parties\n— We don't display advertisements in your invitations\n— We don't share your guest data with marketers\n\nData Storage\nYour data is stored securely. Invitation data is retained for 12 months after creation. You may request deletion of your data at any time.\n\nCookies\nWe use minimal cookies for session management and basic analytics only.`
    },
    refund: {
      title:"Refund Policy", sub:"Fair and transparent",
      body:`We want you to be completely satisfied with Invitation Wala.\n\nEligibility for Refunds\nYou may request a full refund within 7 days of purchase if:\n— Your invitation was not created due to a technical error on our part\n— The invitation features do not work as described\n\nNon-Refundable Situations\n— Change of mind after creating and sharing your invitation\n— Requests made more than 7 days after purchase\n— Issues caused by incorrect information entered by the user\n\nHow to Request\nContact us at support@invitationwala.com with your order ID and reason. We process all refund requests within 5 business days.\n\nRefunds are issued to the original payment method.`
    }
  };
  const c = content[page];
  if (!c) return null;
  return (
    <div style={{ paddingTop:"72px", minHeight:"100vh", background:"var(--cream)" }}>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"5rem 2rem 8rem" }}>
        <RevealDiv><p className="cormorant" style={{ fontStyle:"italic", fontSize:"1rem", color:"var(--gold)", letterSpacing:".2em", marginBottom:".6rem", textAlign:"center" }}>{c.sub}</p></RevealDiv>
        <RevealDiv delay={.1}><h1 className="cinzel" style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:400, color:"var(--dark)", textAlign:"center", marginBottom:"3rem" }}>{c.title}</h1></RevealDiv>
        <div style={{ borderTop:"1px solid rgba(201,168,76,.2)", paddingTop:"3rem" }}>
          {c.body.split("\n\n").map((para,i) => (
            <p key={i} style={{ fontSize:"1rem", color:para[0]===para[0].toUpperCase()&&para.length<40 ? "var(--dark)" : "var(--muted)", lineHeight:1.85, marginBottom:"1.5rem", fontWeight: para[0]===para[0].toUpperCase()&&para.length<40 ? 700 : 400, fontFamily: para[0]===para[0].toUpperCase()&&para.length<40 ? "'Cinzel',serif" : "'Lato',sans-serif", fontSize: para[0]===para[0].toUpperCase()&&para.length<40 ? ".9rem" : "1rem", letterSpacing: para[0]===para[0].toUpperCase()&&para.length<40 ? ".06em" : "normal" }}>{para}</p>
          ))}
        </div>
      </div>
      <Footer setPage={setPage}/>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentInvitation, setCurrentInvitation] = useState(null);
  const [toast, setToastMsg] = useState(null);

  const setToast = (msg) => { setToastMsg(msg); };

  // Scroll to top on page change
  useEffect(() => { window.scrollTo(0,0); }, [page]);

  const navPages = ["home","templates","features","howitworks","faq","about","contact","terms","privacy","refund","login","signup","dashboard","builder","preview","invitation","editinvitation"];

  const renderPage = () => {
    switch(page) {
      case "home":           return <HomePage setPage={setPage}/>;
      case "templates":      return <TemplatesPage setPage={setPage} setSelectedTemplate={setSelectedTemplate}/>;
      case "login":          return <AuthPage mode="login" setPage={setPage} setUser={setUser}/>;
      case "signup":         return <AuthPage mode="signup" setPage={setPage} setUser={setUser}/>;
      case "dashboard":      return <Dashboard user={user} invitations={invitations} setInvitations={setInvitations} setPage={setPage} setSelectedTemplate={setSelectedTemplate} setCurrentInvitation={setCurrentInvitation}/>;
      case "builder":        return <BuilderPage template={selectedTemplate} setPage={setPage} setInvitations={setInvitations} invitations={invitations} user={user} setToast={setToast}/>;
      case "preview":        return <PreviewPage template={selectedTemplate} setPage={setPage}/>;
      case "invitation":     return currentInvitation ? <div style={{paddingTop:"72px"}}><InvitationPage invitation={currentInvitation} setInvitations={setInvitations}/></div> : (setPage("dashboard"),null);
      case "about":          return <StaticPage page="about" setPage={setPage}/>;
      case "contact":        return <StaticPage page="contact" setPage={setPage}/>;
      case "terms":          return <StaticPage page="terms" setPage={setPage}/>;
      case "privacy":        return <StaticPage page="privacy" setPage={setPage}/>;
      case "refund":         return <StaticPage page="refund" setPage={setPage}/>;
      case "features":       return <HomePage setPage={setPage}/>;
      case "howitworks":     return <HomePage setPage={setPage}/>;
      case "faq":            return <HomePage setPage={setPage}/>;
      default:               return <HomePage setPage={setPage}/>;
    }
  };

  return (
    <>
      <GlobalStyles/>
      <Nav page={page} setPage={setPage} user={user} setUser={setUser}/>
      {renderPage()}
      {toast && <Toast msg={toast} onClose={()=>setToastMsg(null)}/>}
    </>
  );
}
