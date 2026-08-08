import React, { useState } from "react";

export function BodyDiagram({ condition = "" }: { condition?: string }) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  
  const c = condition.toLowerCase();
  const isHead = c.includes("migraine") || c.includes("head");
  const isLeftArm = c.includes("left radius") || c.includes("left arm");
  const isRightArm = c.includes("right arm");
  const isLeftLeg = c.includes("left leg");
  const isRightLeg = c.includes("right leg");
  const isTorso = c.includes("sepsis") || c.includes("asthma") || c.includes("mi") || c.includes("prostate") || c.includes("eclampsia") || c.includes("cardiac") || (!isHead && !isLeftArm && !isRightArm && !isLeftLeg && !isRightLeg && c !== "");

  const parts = [
    { id: "head", path: "M45 10 Q50 0 55 10 L60 25 Q50 35 40 25 Z", label: "Head", status: isHead ? "critical" : "normal" },
    { id: "torso", path: "M35 30 L65 30 L60 80 L40 80 Z", label: "Chest / Torso", status: isTorso ? "critical" : "normal" },
    { id: "left-arm", path: "M30 35 L15 70 L25 75 L38 45 Z", label: "Left Arm", status: isLeftArm ? "critical" : "normal" },
    { id: "right-arm", path: "M70 35 L85 70 L75 75 L62 45 Z", label: "Right Arm", status: isRightArm ? "critical" : "normal" },
    { id: "left-leg", path: "M40 85 L30 140 L45 140 L50 90 Z", label: "Left Leg", status: isLeftLeg ? "critical" : "normal" },
    { id: "right-leg", path: "M60 85 L70 140 L55 140 L50 90 Z", label: "Right Leg", status: isRightLeg ? "critical" : "normal" },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-64 border rounded-xl bg-muted/20 flex items-center justify-center shadow-inner">
        <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-md">
          {parts.map((part) => (
            <path
              key={part.id}
              d={part.path}
              className={`transition-all duration-300 cursor-pointer ${
                hoveredPart === part.id
                  ? "fill-primary/80 stroke-primary"
                  : part.status === "critical"
                    ? "fill-destructive/60 stroke-destructive animate-pulse"
                    : "fill-muted-foreground/30 stroke-border"
              }`}
              strokeWidth="2"
              onMouseEnter={() => setHoveredPart(part.id)}
              onMouseLeave={() => setHoveredPart(null)}
            />
          ))}
        </svg>
        
        {hoveredPart && (
          <div className="absolute top-2 right-2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow border animate-in fade-in zoom-in duration-200">
            {parts.find(p => p.id === hoveredPart)?.label}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground text-center">
        Interactive 3D-mapped body model. <br/> Highlighted areas indicate active conditions.
      </p>
    </div>
  );
}
