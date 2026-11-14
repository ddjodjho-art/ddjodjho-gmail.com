import { useEffect, useRef, useState } from "react";
import type { GameOutcome, PlayerProfile } from "../../types/mifa";
import { sfx } from "../../utils/sound";

interface FootballGameProps {
  profile: PlayerProfile;
  onFinish: (outcome: GameOutcome) => void;
}

type ShotZone = {
  id: number;
  label: string;
  xNorm: number; // 0..1 inside goal width
  yNorm: number; // 0..1 inside goal height
  points: number;
};

const SHOT_ZONES: ShotZone[] = [
  { id: 0, label: "Lucarne Gauche", xNorm: 0.16, yNorm: 0.22, points: 180 },
  { id: 1, label: "Lucarne Droite", xNorm: 0.84, yNorm: 0.22, points: 180 },
  { id: 2, label: "Centre Haut", xNorm: 0.5, yNorm: 0.35, points: 120 },
  { id: 3, label: "Bas Gauche", xNorm: 0.18, yNorm: 0.78, points: 140 },
  { id: 4, label: "Bas Droite", xNorm: 0.82, yNorm: 0.78, points: 140 },
];

const TOTAL_SHOTS = 5;

export function FootballGame({ profile, onFinish }: FootballGameProps) {
  const [phase, setPhase] = useState<"TITLE" | "PLAYING">("TITLE");
  const [shotIndex, setShotIndex] = useState(0);
  const [goals, setGoals] = useState(0);
  const [score, setScore] = useState(0);
  const [statusText, setStatusText] = useState("Choisissez où frapper !");
  const [isAnimating, setIsAnimating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animStateRef = useRef<{
    ballX: number;
    ballY: number;
    ballScale: number;
    targetX: number;
    targetY: number;
    keeperX: number;
    keeperY: number;
    keeperTargetX: number;
    keeperTargetY: number;
    progress: number;
    active: boolean;
    result: "GOAL" | "SAVED" | null;
  }>({
    ballX: 0.5,
    ballY: 0.87,
    ballScale: 1,
    targetX: 0.5,
    targetY: 0.87,
    keeperX: 0.5,
    keeperY: 0.44,
    keeperTargetX: 0.5,
    keeperTargetY: 0.44,
    progress: 0,
    active: false,
    result: null,
  });

  const hasGoldJersey = profile.equippedItems.footballSkin === "skin_foot_leopard";
  const hasEmeraldBall = profile.equippedItems.footballSkin === "skin_foot_emerald";

  useEffect(() => {
    if (phase !== "PLAYING") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const st = animStateRef.current;

      if (st.active) {
        st.progress = Math.min(1, st.progress + 0.045);
        const ease = 1 - Math.pow(1 - st.progress, 3);
        st.ballX = 0.5 + (st.targetX - 0.5) * ease;
        st.ballY = 0.87 + (st.targetY - 0.87) * ease - Math.sin(st.progress * Math.PI) * 0.12;
        st.ballScale = 1 - 0.48 * ease;
        st.keeperX = 0.5 + (st.keeperTargetX - 0.5) * ease;
        st.keeperY = 0.44 + (st.keeperTargetY - 0.44) * ease;
        if (st.progress >= 1) {
          st.active = false;
        }
      }

      // Sunset sky
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      sky.addColorStop(0, "#1E293B");
      sky.addColorStop(1, "#D97706");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Sun
      ctx.fillStyle = "#FDE68A";
      ctx.beginPath();
      ctx.arc(w * 0.82, h * 0.18, 22, 0, Math.PI * 2);
      ctx.fill();

      // Concrete neighborhood street pitch
      const pitch = ctx.createLinearGradient(0, h * 0.45, 0, h);
      pitch.addColorStop(0, "#374151");
      pitch.addColorStop(1, "#1F2937");
      ctx.fillStyle = pitch;
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // Painted pitch lines
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.14, h * 0.48, w * 0.72, h * 0.36);

      // Penalty spot
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.87, 4, 0, Math.PI * 2);
      ctx.fill();

      // Goal frame
      const gx = w * 0.2;
      const gy = h * 0.21;
      const gw = w * 0.6;
      const gh = h * 0.28;

      // Net mesh
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      for (let x = gx + 16; x < gx + gw; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x, gy + gh);
        ctx.stroke();
      }
      for (let y = gy + 14; y < gy + gh; y += 14) {
        ctx.beginPath();
        ctx.moveTo(gx, y);
        ctx.lineTo(gx + gw, y);
        ctx.stroke();
      }

      // Goal posts
      ctx.strokeStyle = "#F8FAFC";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(gx, gy + gh);
      ctx.lineTo(gx, gy);
      ctx.lineTo(gx + gw, gy);
      ctx.lineTo(gx + gw, gy + gh);
      ctx.stroke();

      // Target zone markers when ready to shoot
      if (!st.active && !st.result) {
        SHOT_ZONES.forEach((z) => {
          const zx = gx + z.xNorm * gw;
          const zy = gy + z.yNorm * gh;
          ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(zx, zy, 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "rgba(245, 158, 11, 0.28)";
          ctx.fill();
        });
      }

      // Goalkeeper
      const kx = st.keeperX * w;
      const ky = st.keeperY * h;
      ctx.fillStyle = hasGoldJersey ? "#F59E0B" : "#0D5C3E";
      ctx.beginPath();
      ctx.roundRect(kx - 14, ky - 22, 28, 34, 7);
      ctx.fill();
      // Keeper head
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.arc(kx, ky - 30, 9, 0, Math.PI * 2);
      ctx.fill();
      // Keeper gloves
      ctx.fillStyle = "#FACC15";
      ctx.beginPath();
      ctx.arc(kx - 20, ky - 8, 6, 0, Math.PI * 2);
      ctx.arc(kx + 20, ky - 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Ball
      const bx = st.ballX * w;
      const by = st.ballY * h;
      const br = 14 * st.ballScale;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(bx, by + br * 0.9, br * 0.9, br * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = hasEmeraldBall ? "#10B981" : "#FFFFFF";
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#14171A";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#14171A";
      ctx.beginPath();
      ctx.arc(bx, by, br * 0.36, 0, Math.PI * 2);
      ctx.fill();

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(rafId);
  }, [phase, hasGoldJersey, hasEmeraldBall]);

  const takeShot = (zone: ShotZone) => {
    if (isAnimating) return;
    setIsAnimating(true);
    sfx.tap();

    const gx = 0.2;
    const gy = 0.21;
    const gw = 0.6;
    const gh = 0.28;

    const targetX = gx + zone.xNorm * gw;
    const targetY = gy + zone.yNorm * gh;

    // Keeper guesses one of the 5 zones (weighted slightly so player has ~70% chance on corners)
    const keeperZone = SHOT_ZONES[Math.floor(Math.random() * SHOT_ZONES.length)];
    const saved = keeperZone.id === zone.id;

    animStateRef.current = {
      ballX: 0.5,
      ballY: 0.87,
      ballScale: 1,
      targetX,
      targetY,
      keeperX: 0.5,
      keeperY: 0.44,
      keeperTargetX: gx + keeperZone.xNorm * gw,
      keeperTargetY: gy + keeperZone.yNorm * gh + 0.04,
      progress: 0,
      active: true,
      result: saved ? "SAVED" : "GOAL",
    };

    window.setTimeout(() => {
      const nextGoals = saved ? goals : goals + 1;
      const nextScore = saved ? score : score + zone.points;

      if (saved) {
        sfx.error();
        setStatusText("Arrêt du gardien ! Concentrez le prochain tir.");
      } else {
        sfx.goal();
        setGoals(nextGoals);
        setScore(nextScore);
        setStatusText(`BUT ! +${zone.points} pts (${zone.label})`);
      }

      window.setTimeout(() => {
        const nextShot = shotIndex + 1;
        if (nextShot >= TOTAL_SHOTS) {
          onFinish({
            gameId: "football",
            score: nextScore,
            won: nextGoals >= 3,
            summary: `${nextGoals} buts marqués sur ${TOTAL_SHOTS} tirs`,
            meta: { goals: nextGoals },
          });
          return;
        }
        setShotIndex(nextShot);
        setStatusText("Choisissez où frapper !");
        animStateRef.current = {
          ballX: 0.5,
          ballY: 0.87,
          ballScale: 1,
          targetX: 0.5,
          targetY: 0.87,
          keeperX: 0.5,
          keeperY: 0.44,
          keeperTargetX: 0.5,
          keeperTargetY: 0.44,
          progress: 0,
          active: false,
          result: null,
        };
        setIsAnimating(false);
      }, 850);
    }, 520);
  };

  if (phase === "TITLE") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-6 px-4 max-w-lg mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2">
          Terrain de Quartier · Kinshasa
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#14171A] mb-3">
          Street Foot Kinshasa
        </h3>
        <p className="text-sm sm:text-base text-[#525860] leading-relaxed mb-6">
          5 tirs au but face au gardien du quartier. Visez les lucarnes pour marquer plus de
          points et remporter le défi de Matonge.
        </p>

        <div className="grid grid-cols-3 gap-3 w-full mb-7 text-left">
          <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
            <div className="text-xs text-[#525860]">Série</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#14171A]">5 tirs</div>
          </div>
          <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
            <div className="text-xs text-[#525860]">Lucarne</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#D97706]">+180</div>
          </div>
          <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
            <div className="text-xs text-[#525860]">Victoire</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#0D5C3E]">3+ buts</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sfx.tap();
            setPhase("PLAYING");
          }}
          className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-base transition-colors cursor-pointer"
        >
          Entrer sur le terrain
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm border-b border-black/8 pb-2.5">
        <div className="font-mono tabular-nums font-semibold text-[#14171A]">
          Tir {shotIndex + 1}/{TOTAL_SHOTS} · Buts : {goals}
        </div>
        <div className="font-mono tabular-nums font-bold text-[#0D5C3E]">{score} pts</div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-[#1E293B]">
        <canvas
          ref={canvasRef}
          width={520}
          height={310}
          className="w-full h-auto block"
          onClick={(e) => {
            if (isAnimating || !canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const relY = (e.clientY - rect.top) / rect.height;
            // Find closest shot zone
            let best = SHOT_ZONES[2];
            let bestDist = 999;
            SHOT_ZONES.forEach((z) => {
              const zx = 0.2 + z.xNorm * 0.6;
              const zy = 0.21 + z.yNorm * 0.28;
              const d = Math.hypot(relX - zx, relY - zy);
              if (d < bestDist) {
                bestDist = d;
                best = z;
              }
            });
            takeShot(best);
          }}
        />
      </div>

      <div className="text-center text-sm font-semibold text-[#14171A] py-0.5">{statusText}</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SHOT_ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            disabled={isAnimating}
            onClick={() => takeShot(z)}
            className="min-h-[46px] px-3 py-2 rounded-xl border border-black/12 bg-white hover:border-[#D97706] hover:bg-[#D97706]/8 text-xs sm:text-sm font-semibold text-[#14171A] flex items-center justify-between gap-2 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <span className="truncate">{z.label}</span>
            <span className="font-mono tabular-nums text-xs text-[#D97706]">+{z.points}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
