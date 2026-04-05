"use client";

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef, useState } from "react";
import { getStroke } from "perfect-freehand";

interface DrawingCanvasProps {
  dangerOverlay?: boolean;
  onStroke?: () => void;
}

export interface DrawingCanvasHandle {
  exportImage: () => Promise<string | null>;
  clear: () => void;
}

interface Point {
  x: number;
  y: number;
  pressure: number;
}

/**
 * Custom canvas drawing component using perfect-freehand.
 * No tldraw dependency = no license needed, much smaller bundle.
 */
const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas({ dangerOverlay = false, onStroke }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pointsRef = useRef<Point[]>([]);
    const allStrokesRef = useRef<Point[][]>([]);
    const isDrawingRef = useRef(false);
    const [canvasSize, setCanvasSize] = useState({ w: 300, h: 200 });

    // Resize canvas to fit container
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setCanvasSize({ w: Math.floor(width), h: Math.floor(height) });
      });

      observer.observe(container);
      setCanvasSize({ w: container.clientWidth, h: container.clientHeight });

      return () => observer.disconnect();
    }, []);

    // Redraw all strokes when canvas size changes
    useEffect(() => {
      redrawAll();
    }, [canvasSize]);

    const getSvgPathFromStroke = (stroke: number[][]) => {
      if (!stroke.length) return "";
      const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
          const [x1, y1] = arr[(i + 1) % arr.length];
          acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
          return acc;
        },
        ["M", ...stroke[0], "Q"]
      );
      d.push("Z");
      return d.join(" ");
    };

    const drawStroke = useCallback((ctx: CanvasRenderingContext2D, points: Point[]) => {
      if (points.length < 2) return;

      const stroke = getStroke(points, {
        size: 4,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      });

      const path = new Path2D(getSvgPathFromStroke(stroke));
      ctx.fillStyle = "#333";
      ctx.fill(path);
    }, []);

    const redrawAll = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw notebook lines
      ctx.strokeStyle = "var(--line, #e0e0e0)";
      ctx.lineWidth = 1;
      for (let y = 28; y < canvas.height; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw margin line
      ctx.strokeStyle = "var(--margin-red, #ffb3b3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.lineTo(40, canvas.height);
      ctx.stroke();

      // Draw all saved strokes
      for (const stroke of allStrokesRef.current) {
        drawStroke(ctx, stroke);
      }

      // Draw current stroke
      if (pointsRef.current.length > 0) {
        drawStroke(ctx, pointsRef.current);
      }
    }, [drawStroke]);

    const getPointerPos = (e: React.PointerEvent): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
        pressure: e.pressure || 0.5,
      };
    };

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      pointsRef.current = [getPointerPos(e)];
      onStroke?.();

      const canvas = canvasRef.current;
      if (canvas) canvas.setPointerCapture(e.pointerId);
    }, [onStroke]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      pointsRef.current.push(getPointerPos(e));
      redrawAll();
    }, [redrawAll]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (pointsRef.current.length > 1) {
        allStrokesRef.current.push([...pointsRef.current]);
      }
      pointsRef.current = [];
      redrawAll();
    }, [redrawAll]);

    useImperativeHandle(ref, () => ({
      async exportImage(): Promise<string | null> {
        const canvas = canvasRef.current;
        if (!canvas || allStrokesRef.current.length === 0) return null;

        // Create export canvas (white bg, strokes only, no lines)
        const exportCanvas = document.createElement("canvas");
        const maxWidth = 400;
        const scale = Math.min(1, maxWidth / canvas.width);
        exportCanvas.width = canvas.width * scale;
        exportCanvas.height = canvas.height * scale;
        const ctx = exportCanvas.getContext("2d");
        if (!ctx) return null;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        ctx.scale(scale, scale);

        for (const stroke of allStrokesRef.current) {
          drawStroke(ctx, stroke);
        }

        return exportCanvas.toDataURL("image/jpeg", 0.7);
      },
      clear() {
        allStrokesRef.current = [];
        pointsRef.current = [];
        redrawAll();
      },
    }));

    return (
      <div
        ref={containerRef}
        className="relative border-[3px] border-[var(--text)] rounded-[4px] bg-white overflow-hidden touch-none"
        style={{ height: "200px" }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          className="absolute inset-0 w-full h-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: "none" }}
        />

        {/* Danger warning overlay */}
        {dangerOverlay && (
          <div
            className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
            style={{ background: "rgba(192, 57, 43, 0.08)" }}
          >
            <span className="font-jua text-lg opacity-60 animate-pulse" style={{ color: "var(--danger)" }}>
              🛑 선생님이 보고 있다!
            </span>
          </div>
        )}
      </div>
    );
  }
);

export default DrawingCanvas;
