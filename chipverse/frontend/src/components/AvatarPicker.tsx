import { useState, useEffect, useRef, useCallback } from "react";
import api, { getAccessToken } from "@/lib/api";

const CHARS = [
  {
    id: 'eren', name: 'Eren Yeager', series: 'Attack on Titan', cat: 'anime',
    title: 'Founding Titan', img: '/avatars/eren.png',
    accent: '#4a7c59', glow: '#90EE90', auraColor: '#4a7c5988',
    particles: ['#90EE90','#4a7c59','#c8f5c8'],
    animSpeed: 3.2, floatDist: 12,
    shadow: '0 0 40px #90EE9066, 0 0 80px #4a7c5933',
  },
  {
    id: 'levi', name: 'Levi Ackerman', series: 'Attack on Titan', cat: 'anime',
    title: "Humanity's Strongest", img: '/avatars/levi.png',
    accent: '#4a7c8e', glow: '#7ec8d4', auraColor: '#4a7c8e88',
    particles: ['#7ec8d4','#4a7c8e','#c8eef5','#ff8c00'],
    animSpeed: 2.8, floatDist: 10,
    shadow: '0 0 40px #7ec8d466, 0 0 80px #4a7c8e33',
  },
  {
    id: 'mikasa', name: 'Mikasa Ackerman', series: 'Attack on Titan', cat: 'anime',
    title: 'Survey Corps', img: '/avatars/mikasa.png',
    accent: '#c0392b', glow: '#ff6b6b', auraColor: '#c0392b88',
    particles: ['#ff6b6b','#c0392b','#ff9999','#ffd700'],
    animSpeed: 3.5, floatDist: 14,
    shadow: '0 0 40px #ff6b6b66, 0 0 80px #c0392b33',
  },
  {
    id: 'naruto', name: 'Naruto Uzumaki', series: 'Naruto', cat: 'anime',
    title: '7th Hokage', img: '/avatars/naruto.png',
    accent: '#e67e22', glow: '#ffaa00', auraColor: '#e67e2288',
    particles: ['#ffaa00','#e67e22','#ffe066','#ff6600'],
    animSpeed: 2.5, floatDist: 16,
    shadow: '0 0 40px #ffaa0066, 0 0 80px #e67e2233',
  },
  {
    id: 'thor', name: 'Thor', series: 'Marvel', cat: 'marvel',
    title: 'God of Thunder', img: '/avatars/thor.png',
    accent: '#1a6bb5', glow: '#00bfff', auraColor: '#1a6bb588',
    particles: ['#00bfff','#ffd700','#1a6bb5','#ffffff'],
    animSpeed: 3.0, floatDist: 11,
    shadow: '0 0 40px #00bfff66, 0 0 80px #1a6bb533',
  },
];

// ── Particle System ────────────────────────────────────────────────────────────
const ParticleField = ({ char, active }) => {
  const count = 8;
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
      {[...Array(count)].map((_,i) => (
        <div key={i} style={{
          position:'absolute',
          width: 3 + (i%3)*2,
          height: 3 + (i%3)*2,
          borderRadius:'50%',
          background: char.particles[i % char.particles.length],
          left: `${10 + (i*13)%80}%`,
          bottom: `${5 + (i*7)%30}%`,
          opacity: active ? 0.9 : 0,
          animation: active
            ? `particle${i%3} ${1.2 + (i%4)*0.4}s ${(i*0.15)}s ease-out infinite`
            : 'none',
          filter: `blur(${i%2 === 0 ? 0 : 0.5}px)`,
          boxShadow: `0 0 6px ${char.particles[i % char.particles.length]}`,
          transition:'opacity 0.3s',
        }}/>
      ))}
    </div>
  );
};

// ── Character Card ─────────────────────────────────────────────────────────────
const CharCard = ({ char, selected, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({x:0,y:0,mx:0,my:0});
  const cardRef = useRef();
  const rafRef = useRef();
  const targetTilt = useRef({x:0,y:0});

  // Smooth mouse parallax
  const onMouseMove = useCallback(e => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    targetTilt.current = {
      x: (nx - 0.5) * 24,
      y: (ny - 0.5) * -24,
      mx: (nx - 0.5) * 8,
      my: (ny - 0.5) * -8,
    };
  }, []);

  useEffect(() => {
    let cur = {x:0,y:0,mx:0,my:0};
    const animate = () => {
      if (hovered) {
        const lerp = (a,b,t) => a + (b-a)*t;
        cur = {
          x: lerp(cur.x, targetTilt.current.x, 0.1),
          y: lerp(cur.y, targetTilt.current.y, 0.1),
          mx: lerp(cur.mx, targetTilt.current.mx, 0.08),
          my: lerp(cur.my, targetTilt.current.my, 0.08),
        };
      } else {
        cur = {
          x: cur.x * 0.85,
          y: cur.y * 0.85,
          mx: cur.mx * 0.85,
          my: cur.my * 0.85,
        };
      }
      setTilt({...cur});
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hovered]);

  const isActive = selected || hovered;

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(char.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); targetTilt.current = {x:0,y:0,mx:0,my:0}; }}
      onMouseMove={onMouseMove}
      style={{
        width: 170,
        cursor: 'pointer',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        background: `radial-gradient(ellipse at 50% 80%, ${char.accent}33 0%, #0d0d14 60%)`,
        border: `1.5px solid ${selected ? char.glow : hovered ? char.accent+'99' : '#ffffff12'}`,
        boxShadow: isActive
          ? char.shadow + ', 0 20px 60px #00000088'
          : '0 4px 20px #00000066',
        transform: `perspective(700px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${isActive?1.06:1})`,
        transition: 'border 0.3s, box-shadow 0.4s',
        userSelect: 'none',
      }}>

      {/* Animated border glow on select */}
      {selected && (
        <div style={{
          position:'absolute', inset:-1, borderRadius:20,
          background: `linear-gradient(${Date.now()/20}deg, ${char.glow}, transparent, ${char.accent})`,
          animation: 'borderSpin 3s linear infinite',
          zIndex:0, padding:1,
        }}/>
      )}

      {/* Aura ring behind character */}
      <div style={{
        position:'absolute',
        width: isActive ? 160 : 120,
        height: isActive ? 160 : 120,
        borderRadius:'50%',
        background: `radial-gradient(circle, ${char.auraColor}, transparent 70%)`,
        top:'50%', left:'50%',
        transform:'translate(-50%, -60%)',
        transition:'all 0.4s ease',
        filter:`blur(${isActive?8:4}px)`,
      }}/>

      {/* Character image */}
      <div style={{
        height: 220,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img
          src={char.img}
          alt={char.name}
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            objectPosition: 'center bottom',
            // KEY: removes black background
            mixBlendMode: 'screen',
            animation: `floatChar${char.id} ${char.animSpeed}s ease-in-out infinite`,
            transform: `translateX(${tilt.mx}px) translateY(${tilt.my}px)`,
            filter: isActive
              ? `drop-shadow(0 0 16px ${char.glow}) drop-shadow(0 0 32px ${char.accent}) brightness(1.1)`
              : `drop-shadow(0 4px 8px #00000099) brightness(0.95)`,
            transition: 'filter 0.4s',
          }}
        />

        {/* Bottom ground shadow */}
        <div style={{
          position:'absolute', bottom:0, left:'50%',
          transform:'translateX(-50%)',
          width: isActive ? 100 : 80,
          height: 16,
          background: `radial-gradient(ellipse, ${char.auraColor}, transparent)`,
          filter:'blur(6px)',
          transition:'width 0.3s',
        }}/>

        {/* Bottom gradient */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:60,
          background:'linear-gradient(transparent, #0d0d14)',
          pointerEvents:'none',
        }}/>

        {/* Category badge */}
        <div style={{
          position:'absolute', top:10, left:10, zIndex:2,
          padding:'2px 9px', borderRadius:20,
          background:`${char.accent}22`,
          border:`1px solid ${char.accent}66`,
          color:char.glow, fontSize:9, fontWeight:700,
          letterSpacing:'0.7px', textTransform:'uppercase',
        }}>{char.cat}</div>

        {/* Selected checkmark */}
        {selected && (
          <div style={{
            position:'absolute', top:10, right:10, zIndex:2,
            width:24, height:24, borderRadius:'50%',
            background:char.glow,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:700, color:'#000',
            animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow:`0 0 12px ${char.glow}`,
          }}>✓</div>
        )}
      </div>

      {/* Info section */}
      <div style={{padding:'10px 12px 13px', textAlign:'center', position:'relative', zIndex:1}}>
        <div style={{
          color:'#fff', fontWeight:700, fontSize:13,
          letterSpacing:'0.2px', lineHeight:1.3,
          textShadow: isActive ? `0 0 20px ${char.glow}88` : 'none',
          transition:'text-shadow 0.3s',
        }}>{char.name}</div>
        <div style={{color:char.glow, fontSize:10, marginTop:3, fontWeight:500}}>{char.title}</div>
        <div style={{color:'#ffffff33', fontSize:9, marginTop:2}}>{char.series}</div>
      </div>

      {/* Power bar */}
      <div style={{
        height:2,
        background:`linear-gradient(90deg, transparent, ${char.glow}, transparent)`,
        opacity: isActive ? 1 : 0,
        transition:'opacity 0.3s',
      }}/>

      {/* Particles */}
      <ParticleField char={char} active={isActive}/>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AvatarPicker() {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''), 3000); };

  const saveAvatar = async () => {
    if (!selected) return showToast('Pick an avatar first!');
    const token = getAccessToken();
    if (!token) return showToast('Session expired — please refresh the page and try again.');
    setSaving(true);
    try {
      await api.user.savePresetAvatar(selected);
      showToast('✓ Avatar saved!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save avatar');
    } finally {
      setSaving(false);
    }
  };

  const sel = CHARS.find(c => c.id === selected);

  return (
    <div style={{
      minHeight:'100vh',
      background:'radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #0a0a0f 60%)',
      padding:'32px 20px', fontFamily:'system-ui,sans-serif',
    }}>
      <style>{`
        ${CHARS.map(c => `
          @keyframes floatChar${c.id} {
            0%,100% { transform: translateY(0px) rotate(0deg); }
            25%      { transform: translateY(-${c.floatDist*0.6}px) rotate(${c.id==='mikasa'?'-0.8':c.id==='levi'?'0.5':'0.3'}deg); }
            50%      { transform: translateY(-${c.floatDist}px) rotate(0deg); }
            75%      { transform: translateY(-${c.floatDist*0.4}px) rotate(${c.id==='mikasa'?'0.5':'-0.3'}deg); }
          }
        `).join('')}
        @keyframes popIn      { 0%{transform:scale(0) rotate(-180deg)} 100%{transform:scale(1) rotate(0)} }
        @keyframes borderSpin { from{filter:hue-rotate(0deg)} to{filter:hue-rotate(360deg)} }
        @keyframes slideUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes particle0  { 0%{transform:translateY(0) translateX(0) scale(1);opacity:1} 100%{transform:translateY(-70px) translateX(-15px) scale(0);opacity:0} }
        @keyframes particle1  { 0%{transform:translateY(0) translateX(0) scale(1);opacity:1} 100%{transform:translateY(-55px) translateX(20px) scale(0);opacity:0} }
        @keyframes particle2  { 0%{transform:translateY(0) translateX(0) scale(1);opacity:1} 100%{transform:translateY(-80px) translateX(5px) scale(0);opacity:0} }
        @keyframes titlePulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
      `}</style>

      {/* Header */}
      <div style={{textAlign:'center', marginBottom:36, animation:'slideUp 0.6s ease'}}>
        <h1 style={{
          color:'#fff', fontSize:32, fontWeight:800,
          margin:'0 0 6px', letterSpacing:'-0.5px',
          background:'linear-gradient(135deg, #fff 40%, #888)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>
          Choose Your Avatar
        </h1>
        <p style={{color:'#ffffff44', fontSize:13, margin:0}}>
          Hover to see them come alive
        </p>
      </div>

      {/* Character grid */}
      <div style={{
        display:'flex', flexWrap:'wrap', gap:20,
        justifyContent:'center', marginBottom:36,
        animation:'slideUp 0.5s 0.1s ease both',
      }}>
        {CHARS.map(c => (
          <CharCard key={c.id} char={c} selected={selected===c.id} onSelect={setSelected}/>
        ))}
      </div>

      {/* Save button */}
      <div style={{display:'flex', justifyContent:'center', animation:'slideUp 0.5s 0.2s ease both'}}>
        <button
          onClick={saveAvatar}
          disabled={saving || !selected}
          style={{
            padding:'14px 48px', borderRadius:16, border:'none',
            background: selected
              ? `linear-gradient(135deg, ${sel?.accent}, ${sel?.glow})`
              : '#ffffff15',
            color: selected ? '#fff' : '#ffffff33',
            cursor: selected ? 'pointer' : 'not-allowed',
            fontSize:15, fontWeight:700,
            boxShadow: selected ? `0 8px 30px ${sel?.glow}55` : 'none',
            transform: selected && !saving ? 'translateY(-2px)' : 'none',
            transition:'all 0.3s',
            letterSpacing:'0.3px',
          }}>
          {saving ? 'Saving…' : selected ? `Play as ${sel?.name}` : 'Select a Character'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)',
          background:'#1a1a2e', color:'#fff', padding:'13px 28px',
          borderRadius:14, border:'1px solid #ffffff22',
          fontSize:13, fontWeight:500, animation:'slideUp 0.3s ease',
          boxShadow:'0 8px 32px #00000099', zIndex:9999,
        }}>{toast}</div>
      )}
    </div>
  );
}