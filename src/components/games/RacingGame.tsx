import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import type { GameOutcome, PlayerProfile } from "../../types/mifa";
import { sfx } from "../../utils/sound";

interface RacingGameProps {
  profile: PlayerProfile;
  onFinish: (outcome: GameOutcome) => void;
}

interface Obstacle {
  lane: 0 | 1 | 2;
  y: number;
  kind: "taxi" | "bus" | "coin";
  color: string;
}

export function RacingGame({ profile, onFinish }: RacingGameProps) {
  const [phase, setPhase] = useState<"TITLE" | "PLAYING">("TITLE");
  const [hud, setHud] = useState({ distance: 0, coins: 0, shieldActive: false });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    lane: 1 as 0 | 1 | 2,
    carX: 0.5,
    speed: 4.5,
    distance: 0,
    coins: 0,
    obstacles: [] as Obstacle[],
    spawnTick: 0,
    shield: profile.boosters.racingShield > 0,
    usedShield: false,
    invulnFrames: 0,
    finished: false,
  });

  const carColor =
    profile.equippedItems.racingSkin === "skin_race_night"
      ? "#1E293B"
      : profile.equippedItems.racingSkin === "skin_race_vip"
        ? "#B45309"
        : "#F59E0B";

  const moveLane = (dir: -1 | 1) => {
    const st = stateRef.current;
    if (st.finished) return;
    const next = Math.max(0, Math.min(2, st.lane + dir)) as 0 | 1 | 2;
    if (next !== st.lane) {
      st.lane = next;
      sfx.tap();
    }
  };

  useEffect(() => {
    if (phase !== "PLAYING") return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLane(-1);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveLane(1);
    };
    window.addEventListener("keydown", handleKey);

    const canvas = canvasRef.current;
    if (!canvas) return () => window.removeEventListener("keydown", handleKey);
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => window.removeEventListener("keydown", handleKey);

    let rafId = 0;
    let dashOffset = 0;
    let frameCount = 0;

    const laneCenters = [0.25, 0.5, 0.75];

    const loop = () => {
      const st = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      if (!st.finished) {
        frameCount += 1;
        st.speed = Math.min(9.5, 4.6 + st.distance / 320);
        st.distance += st.speed * 0.35;
        dashOffset = (dashOffset + st.speed * 1.4) % 44;
        if (st.invulnFrames > 0) st.invulnFrames -= 1;

        const targetX = laneCenters[st.lane];
        st.carX += (targetX - st.carX) * 0.24;

        st.spawnTick += 1;
        const spawnInterval = Math.max(24, Math.round(48 - st.speed * 2));
        if (st.spawnTick >= spawnInterval) {
          st.spawnTick = 0;
          const lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
          const isCoin = Math.random() < 0.34;
          st.obstacles.push({
            lane,
            y: -50,
            kind: isCoin ? "coin" : Math.random() < 0.45 ? "bus" : "taxi",
            color: isCoin ? "#F59E0B" : Math.random() < 0.5 ? "#0D5C3E" : "#334155",
          });
        }

        const carY = h - 78;
        const carPxX = st.carX * w;

        for (let i = st.obstacles.length - 1; i >= 0; i--) {
          const ob = st.obstacles[i];
          ob.y += ob.kind === "coin" ? st.speed : st.speed * 0.85;
          const obX = laneCenters[ob.lane] * w;

          const hitX = Math.abs(obX - carPxX) < 30;
          const hitY = Math.abs(ob.y - carY) < (ob.kind === "coin" ? 28 : 42);

          if (hitX && hitY) {
            if (ob.kind === "coin") {
              st.coins += 1;
              sfx.success();
              st.obstacles.splice(i, 1);
              continue;
            } else if (st.invulnFrames === 0) {
              if (st.shield) {
                st.shield = false;
                st.usedShield = true;
                st.invulnFrames = 55;
                sfx.tap();
                st.obstacles.splice(i, 1);
                continue;
              } else {
                st.finished = true;
                sfx.error();
                const distRounded = Math.round(st.distance);
                const finalScore = distRounded + st.coins * 35;
                window.setTimeout(() => {
                  onFinish({
                    gameId: "racing",
                    score: finalScore,
                    won: distRounded >= 450,
                    summary: `${distRounded} m parcourus · ${st.coins} jetons bonus`,
                    meta: {
                      distanceMeters: distRounded,
                      usedRacingShield: st.usedShield,
                    },
                  });
                }, 450);
              }
            }
          }

          if (ob.y > h + 70) {
            st.obstacles.splice(i, 1);
          }
        }

        if (frameCount % 6 === 0 || st.finished) {
          setHud({
            distance: Math.round(st.distance),
            coins: st.coins,
            shieldActive: st.shield,
          });
        }
      }

      // Draw Kinshasa dusk boulevard
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, 0, w, h);

      // Sidewalks & palm strips
      ctx.fillStyle = "#0D5C3E";
      ctx.fillRect(0, 0, w * 0.12, h);
      ctx.fillRect(w * 0.88, 0, w * 0.12, h);

      // Curbs
      ctx.fillStyle = "#D97706";
      ctx.fillRect(w * 0.12 - 4, 0, 4, h);
      ctx.fillRect(w * 0.88, 0, 4, h);

      // Lane dashed dividers
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 3;
      ctx.setLineDash([22, 22]);
      ctx.lineDashOffset = -dashOffset;
      [0.375, 0.625].forEach((xPct) => {
        ctx.beginPath();
        ctx.moveTo(w * xPct, 0);
        ctx.lineTo(w * xPct, h);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Obstacles & coins
      st.obstacles.forEach((ob) => {
        const ox = laneCenters[ob.lane] * w;
        if (ob.kind === "coin") {
          ctx.fillStyle = "#FBBF24";
          ctx.beginPath();
          ctx.arc(ox, ob.y, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#B45309";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else {
          const bw = ob.kind === "bus" ? 42 : 36;
          const bh = ob.kind === "bus" ? 68 : 54;
          ctx.fillStyle = ob.color;
          ctx.beginPath();
          ctx.roundRect(ox - bw / 2, ob.y - bh / 2, bw, bh, 8);
          ctx.fill();
          // Windshield
          ctx.fillStyle = "#94A3B8";
          ctx.fillRect(ox - bw / 2 + 5, ob.y + bh / 2 - 18, bw - 10, 10);
          // Tail lights
          ctx.fillStyle = "#EF4444";
          ctx.fillRect(ox - bw / 2 + 4, ob.y + bh / 2 - 4, 8, 3);
          ctx.fillRect(ox + bw / 2 - 12, ob.y + bh / 2 - 4, 8, 3);
        }
      });

      // Player car
      const cx = st.carX * w;
      const cy = h - 78;
      if (st.invulnFrames % 6 < 4) {
        // Headlight glow
        ctx.fillStyle = "rgba(253, 224, 71, 0.16)";
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 26);
        ctx.lineTo(cx - 32, cy - 110);
        ctx.lineTo(cx + 32, cy - 110);
        ctx.lineTo(cx + 14, cy - 26);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = carColor;
        ctx.beginPath();
        ctx.roundRect(cx - 19, cy - 28, 38, 56, 9);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Roof & windshield
        ctx.fillStyle = "#0F172A";
        ctx.beginPath();
        ctx.roundRect(cx - 13, cy - 14, 26, 20, 4);
        ctx.fill();

        if (st.shield) {
          ctx.strokeStyle = "#38BDF8";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 34, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleKey);
    };
  }, [phase, carColor, onFinish]);

  const startRace = () => {
    sfx.tap();
    stateRef.current = {
      lane: 1,
      carX: 0.5,
      speed: 4.6,
      distance: 0,
      coins: 0,
      obstacles: [],
      spawnTick: 0,
      shield: profile.boosters.racingShield > 0,
      usedShield: false,
      invulnFrames: 0,
      finished: false,
    };
    setHud({ distance: 0, coins: 0, shieldActive: profile.boosters.racingShield > 0 });
    setPhase("PLAYING");
  };

  if (phase === "TITLE") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-6 px-4 max-w-lg mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5C3E] mb-2">
          Course Arcade · Boulevard du 30 Juin
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#14171A] mb-3">
          Kin Boulevard Drift
        </h3>
        <p className="text-sm sm:text-base text-[#525860] leading-relaxed mb-6">
          Changez de voie rapidement pour éviter les bus et taxis du boulevard tout en ramassant
          des pièces MIFA. Touchez gauche/droite ou utilisez les flèches du clavier.
        </p>

        <div className="grid grid-cols-3 gap-3 w-full mb-7 text-left">
          <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
            <div className="text-xs text-[#525860]">Voies</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#14171A]">3</div>
          </div>
          <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
            <div className="text-xs text-[#525860]">Pièce MIFA</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#D97706]">+35</div>
          </div>
          <div className="bg-[#F6F7F4] border border-black/8 rounded-xl p-3">
            <div className="text-xs text-[#525860]">Boucliers</div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#2563EB]">
              {profile.boosters.racingShield}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={startRace}
          className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl bg-[#14171A] hover:bg-black text-white font-semibold text-base transition-colors cursor-pointer"
        >
          Démarrer la course
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm border-b border-black/8 pb-2">
        <div className="font-mono tabular-nums font-bold text-[#14171A]">
          {hud.distance} m · {hud.coins} pièces
        </div>
        {hud.shieldActive && (
          <div className="flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
            <Shield className="w-4 h-4" />
            <span>Bouclier actif</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden border border-black/10 bg-[#1E293B]">
        <canvas
          ref={canvasRef}
          width={380}
          height={420}
          className="w-full h-auto block"
          onClick={(e) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            moveLane(relX < 0.5 ? -1 : 1);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => moveLane(-1)}
          className="min-h-[54px] rounded-xl bg-[#14171A] active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Gauche</span>
        </button>
        <button
          type="button"
          onClick={() => moveLane(1)}
          className="min-h-[54px] rounded-xl bg-[#14171A] active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Droite</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
