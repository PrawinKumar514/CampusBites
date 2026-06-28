"use client";

import React, { useState, useRef, MouseEvent } from "react";
import { CheckCircle, UtensilsCrossed } from "lucide-react";

export default function BuildWithGemini() {
  const features = [
    { name: "Real-Time Menu Updates", description: "See what's being served at campus dining halls right now." },
    { name: "Seamless Ordering", description: "Order ahead for pickup to skip the lines." },
  ];

  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    const yRotate = xPct * 5; 
    const xRotate = -yPct * 5;

    setRotate({ x: xRotate, y: yRotate });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      className="relative p-12 pb-20 rounded-2xl border border-accent/20 bg-card/50 overflow-hidden animated-glowing-border icon-glow-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
        transition: "transform 0.6s ease-out",
      }}
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">
            About <span className="text-primary">Campus Bites</span>
          </h2>
          <p className="text-muted-foreground">
            Campus Bites is the ultimate food companion for students. We connect you with the best dining options on and around campus, from dining hall menus and hours to local restaurant deals and student meal plans. Find, order, and enjoy your next meal in minutes.
          </p>
          <p className="text-lg font-semibold">
            Hungry? Get started and find your next bite today.
          </p>
        </div>

        {/* Right Column: Key Features */}
        <div className="space-y-4">
            <h3 className="text-2xl font-bold">Key Features</h3>
            <ul className="space-y-3">
                {features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <p className="font-semibold">{feature.name}</p>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <UtensilsCrossed className="h-8 w-8 text-accent/30 icon-glow-target" />
      </div>
    </div>
  );
}
