import React, { useRef, useEffect } from "react";

export function Globe({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      canvas.width = bounds.width;
      canvas.height = bounds.height;
    }

    resize();
    window.addEventListener("resize", resize);

    let angle = 0;

    function draw() {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) / 2.3;

      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;

      // Outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Latitudes
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        const y = cy + i * (radius / 6);
        ctx.ellipse(cx, y, radius, radius / 2.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Meridians animated
      angle += 0.01;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        const a = angle + (i / 12) * Math.PI * 2;
        const x = cx + Math.cos(a) * radius;
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, cy);
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    }

    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute h-[300px] w-[300px] ${className}`}
    />
  );
}
