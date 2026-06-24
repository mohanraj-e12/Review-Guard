import { useMemo } from "react";

interface Particle {
  id: number;
  left: string;
  top: string;
  size: string;
  duration: string;
  delay: string;
  opacity: string;
  tx1: string;
  ty1: string;
  tx2: string;
  ty2: string;
  tx3: string;
  ty3: string;
  color: string;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function ParticlesBackground({ count = 28 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const r = (offset: number) => seededRandom(i * 13 + offset);
      const colors = [
        "hsl(160 84% 39%)",
        "hsl(185 80% 50%)",
        "hsl(160 84% 55%)",
        "hsl(185 80% 65%)",
        "hsl(200 80% 60%)",
      ];
      return {
        id: i,
        left: `${r(0) * 100}%`,
        top: `${r(1) * 100}%`,
        size: `${2 + r(2) * 3}px`,
        duration: `${6 + r(3) * 10}s`,
        delay: `${r(4) * 6}s`,
        opacity: `${0.15 + r(5) * 0.35}`,
        tx1: `${(r(6) - 0.5) * 40}px`,
        ty1: `${(r(7) - 0.8) * 30}px`,
        tx2: `${(r(8) - 0.5) * 35}px`,
        ty2: `${(r(9) - 0.8) * 40}px`,
        tx3: `${(r(10) - 0.5) * 25}px`,
        ty3: `${(r(11) - 0.8) * 20}px`,
        color: colors[Math.floor(r(12) * colors.length)],
      };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            "--duration": p.duration,
            "--delay": p.delay,
            "--opacity-base": p.opacity,
            "--tx1": p.tx1,
            "--ty1": p.ty1,
            "--tx2": p.tx2,
            "--ty2": p.ty2,
            "--tx3": p.tx3,
            "--ty3": p.ty3,
            opacity: p.opacity,
            animationDelay: p.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* Large blurred orbs */}
      <div className="absolute top-[15%] left-[5%] w-64 h-64 rounded-full opacity-[0.04] blur-[80px]"
        style={{ background: "hsl(160 84% 39%)" }} />
      <div className="absolute top-[60%] right-[8%] w-48 h-48 rounded-full opacity-[0.04] blur-[70px]"
        style={{ background: "hsl(185 80% 50%)" }} />
      <div className="absolute bottom-[10%] left-[35%] w-56 h-56 rounded-full opacity-[0.03] blur-[90px]"
        style={{ background: "hsl(160 84% 50%)" }} />
    </div>
  );
}
