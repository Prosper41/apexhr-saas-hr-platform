// "use client";

// export function AuthOrgChart() {
//   return (
//     <div
//       className="relative mt-8 hidden w-full max-w-[320px] md:block"
//       aria-hidden="true"
//     >
//       <svg viewBox="0 0 320 190" className="h-auto w-full">
//         <g className="auth-org-lines">
//           <line
//             x1="160"
//             y1="26"
//             x2="80"
//             y2="80"
//             style={{ animationDelay: ".1s" }}
//           />
//           <line
//             x1="160"
//             y1="26"
//             x2="160"
//             y2="80"
//             style={{ animationDelay: ".2s" }}
//           />
//           <line
//             x1="160"
//             y1="26"
//             x2="240"
//             y2="80"
//             style={{ animationDelay: ".3s" }}
//           />
//           <line
//             x1="80"
//             y1="98"
//             x2="45"
//             y2="150"
//             style={{ animationDelay: ".5s" }}
//           />
//           <line
//             x1="80"
//             y1="98"
//             x2="110"
//             y2="150"
//             style={{ animationDelay: ".55s" }}
//           />
//           <line
//             x1="160"
//             y1="98"
//             x2="160"
//             y2="150"
//             style={{ animationDelay: ".6s" }}
//           />
//           <line
//             x1="240"
//             y1="98"
//             x2="210"
//             y2="150"
//             style={{ animationDelay: ".65s" }}
//           />
//           <line
//             x1="240"
//             y1="98"
//             x2="275"
//             y2="150"
//             style={{ animationDelay: ".7s" }}
//           />
//         </g>
//         <g className="auth-org-nodes">
//           <circle
//             className="node-root"
//             cx="160"
//             cy="20"
//             r="7"
//             style={{ animationDelay: "1.7s" }}
//           />
//           <circle cx="80" cy="88" r="6" style={{ animationDelay: "1.1s" }} />
//           <circle cx="160" cy="88" r="6" style={{ animationDelay: "1.2s" }} />
//           <circle cx="240" cy="88" r="6" style={{ animationDelay: "1.3s" }} />
//           <circle cx="45" cy="158" r="4.5" style={{ animationDelay: "1.5s" }} />
//           <circle
//             cx="110"
//             cy="158"
//             r="4.5"
//             style={{ animationDelay: "1.55s" }}
//           />
//           <circle
//             cx="160"
//             cy="158"
//             r="4.5"
//             style={{ animationDelay: "1.6s" }}
//           />
//           <circle
//             cx="210"
//             cy="158"
//             r="4.5"
//             style={{ animationDelay: "1.65s" }}
//           />
//           <circle
//             cx="275"
//             cy="158"
//             r="4.5"
//             style={{ animationDelay: "1.7s" }}
//           />
//         </g>
//       </svg>
//       <style>{`
//         .auth-org-lines line{stroke:#ab8853;stroke-width:1;fill:none;stroke-dasharray:200;stroke-dashoffset:200;animation:auth-draw 1.6s ease forwards;}
//         .auth-org-nodes circle{fill:#0b0b0a;stroke:#c7a878;stroke-width:1.2;opacity:0;animation:auth-pop .5s ease forwards;}
//         .auth-org-nodes .node-root{fill:#ab8853;}
//         @keyframes auth-draw{to{stroke-dashoffset:0;}}
//         @keyframes auth-pop{to{opacity:1;}}
//       `}</style>
//     </div>
//   );
// }

"use client";

const BRANCHES = [
  { id: "b1", x1: 160, y1: 26, x2: 80, y2: 80, delay: 0.1 },
  { id: "b2", x1: 160, y1: 26, x2: 160, y2: 80, delay: 0.2 },
  { id: "b3", x1: 160, y1: 26, x2: 240, y2: 80, delay: 0.3 },
  { id: "b4", x1: 80, y1: 98, x2: 45, y2: 150, delay: 0.5 },
  { id: "b5", x1: 80, y1: 98, x2: 110, y2: 150, delay: 0.55 },
  { id: "b6", x1: 160, y1: 98, x2: 160, y2: 150, delay: 0.6 },
  { id: "b7", x1: 240, y1: 98, x2: 210, y2: 150, delay: 0.65 },
  { id: "b8", x1: 240, y1: 98, x2: 275, y2: 150, delay: 0.7 },
];

export function AuthOrgChart() {
  return (
    <div
      className="relative mt-8 hidden w-full max-w-[320px] md:block"
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 190" className="h-auto w-full overflow-visible">
        <defs>
          <linearGradient id="auth-line-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e9d5ac" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ab8853" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="auth-node-grad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#3a2f22" />
            <stop offset="100%" stopColor="#0b0b0a" />
          </radialGradient>
          <filter id="auth-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="auth-org-lines">
          {BRANCHES.map((b) => (
            <line
              key={b.id}
              x1={b.x1}
              y1={b.y1}
              x2={b.x2}
              y2={b.y2}
              style={{ animationDelay: `${b.delay}s` }}
            />
          ))}
        </g>

        {/* breathing halo behind the root, loops forever once the tree has formed */}
        <circle
          className="auth-org-halo"
          cx="160"
          cy="20"
          r="6"
          style={{ animationDelay: "1.9s" }}
        />

        <g className="auth-org-nodes" filter="url(#auth-glow)">
          <circle
            className="node-root"
            cx="160"
            cy="20"
            r="6.5"
            style={{ animationDelay: "1.7s" }}
          />
          <circle cx="80" cy="88" r="5.5" style={{ animationDelay: "1.1s" }} />
          <circle cx="160" cy="88" r="5.5" style={{ animationDelay: "1.2s" }} />
          <circle cx="240" cy="88" r="5.5" style={{ animationDelay: "1.3s" }} />
          <circle cx="45" cy="158" r="4" style={{ animationDelay: "1.5s" }} />
          <circle cx="110" cy="158" r="4" style={{ animationDelay: "1.55s" }} />
          <circle cx="160" cy="158" r="4" style={{ animationDelay: "1.6s" }} />
          <circle cx="210" cy="158" r="4" style={{ animationDelay: "1.65s" }} />
          <circle cx="275" cy="158" r="4" style={{ animationDelay: "1.7s" }} />
        </g>

        {/* glints of light drifting outward along each branch, looping forever */}
        <g className="auth-org-glints">
          {BRANCHES.map((b, i) => (
            <circle key={b.id} r="1.8" className="glint">
              <animate
                attributeName="cx"
                values={`${b.x1};${b.x2}`}
                dur="2s"
                begin={`${2.3 + i * 0.24}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
                keyTimes="0;1"
              />
              <animate
                attributeName="cy"
                values={`${b.y1};${b.y2}`}
                dur="2s"
                begin={`${2.3 + i * 0.24}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
                keyTimes="0;1"
              />
              <animate
                attributeName="opacity"
                values="0;.9;.9;0"
                keyTimes="0;0.18;0.75;1"
                dur="2s"
                begin={`${2.3 + i * 0.24}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      </svg>

      <style>{`
        .auth-org-lines line{stroke:url(#auth-line-grad);stroke-width:.75;stroke-linecap:round;fill:none;stroke-dasharray:200;stroke-dashoffset:200;animation:auth-draw 1.6s cubic-bezier(.4,0,.2,1) forwards;}
        .auth-org-nodes circle{fill:url(#auth-node-grad);stroke:#c7a878;stroke-width:1;opacity:0;animation:auth-pop .55s cubic-bezier(.34,1.56,.64,1) forwards;}
        .auth-org-nodes .node-root{stroke:#e9d5ac;stroke-width:1.2;}
        .auth-org-halo{fill:none;stroke:#c7a878;stroke-width:.75;opacity:0;animation:auth-halo 2.8s cubic-bezier(.4,0,.2,1) infinite;}
        .auth-org-glints .glint{fill:#f3e2bb;opacity:0;filter:blur(.3px) drop-shadow(0 0 3px rgba(243,226,187,.85));}
        @keyframes auth-draw{to{stroke-dashoffset:0;}}
        @keyframes auth-pop{to{opacity:1;}}
        @keyframes auth-halo{
          0%{opacity:.4;transform:scale(1);}
          85%{opacity:0;transform:scale(2.8);}
          100%{opacity:0;transform:scale(2.8);}
        }
      `}</style>
    </div>
  );
}
