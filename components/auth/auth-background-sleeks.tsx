"use client";

const PARTICLES = [
  { left: "12%", size: 3, delay: 0, duration: 9 },
  { left: "28%", size: 2, delay: 2.2, duration: 11 },
  { left: "48%", size: 2.5, delay: 4.5, duration: 10 },
  { left: "67%", size: 2, delay: 1.2, duration: 12 },
  { left: "81%", size: 3, delay: 6, duration: 9.5 },
  { left: "92%", size: 2, delay: 3.4, duration: 10.5 },
];

export function AuthBackgroundSleeks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* slow diagonal light sweep */}
      <div className="auth-sweep absolute inset-0" />

      {/* soft corner glow */}
      <div className="auth-corner-glow absolute -top-24 -right-24 h-72 w-72 rounded-full" />

      {/* drifting particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="auth-particle absolute bottom-0 rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <style>{`
        .auth-sweep{
          background:linear-gradient(115deg, transparent 40%, rgba(199,168,120,.06) 50%, transparent 60%);
          background-size:300% 300%;
          animation:auth-sweep-move 12s ease-in-out infinite;
        }
        .auth-corner-glow{
          background:radial-gradient(circle, rgba(199,168,120,.18), transparent 70%);
          filter:blur(20px);
          animation:auth-corner-pulse 6s ease-in-out infinite;
        }
        .auth-particle{
          background:#c7a878;
          opacity:0;
          box-shadow:0 0 6px rgba(199,168,120,.8);
          animation-name:auth-float;
          animation-timing-function:ease-in-out;
          animation-iteration-count:infinite;
        }
        @keyframes auth-sweep-move{
          0%{background-position:0% 0%;}
          50%{background-position:100% 100%;}
          100%{background-position:0% 0%;}
        }
        @keyframes auth-corner-pulse{
          0%,100%{opacity:.5;transform:scale(1);}
          50%{opacity:.9;transform:scale(1.15);}
        }
        @keyframes auth-float{
          0%{transform:translateY(0);opacity:0;}
          10%{opacity:.7;}
          90%{opacity:.4;}
          100%{transform:translateY(-420px);opacity:0;}
        }
      `}</style>
    </div>
  );
}
