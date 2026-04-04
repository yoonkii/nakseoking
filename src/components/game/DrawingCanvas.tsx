"use client";

import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { useCallback, useRef, useImperativeHandle, forwardRef } from "react";

interface DrawingCanvasProps {
  locked?: boolean;
  onStroke?: () => void;
}

export interface DrawingCanvasHandle {
  exportImage: () => Promise<string | null>;
  clear: () => void;
}

/**
 * tldraw canvas in hideUi mode with notebook styling.
 * Exposes exportImage() and clear() via ref.
 */
const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas({ locked = false, onStroke }, ref) {
    const editorRef = useRef<Editor | null>(null);

    useImperativeHandle(ref, () => ({
      async exportImage(): Promise<string | null> {
        const editor = editorRef.current;
        if (!editor) return null;

        const shapes = editor.getCurrentPageShapes();
        if (shapes.length === 0) return null;

        try {
          // Export all shapes as SVG, then convert to canvas for JPEG
          const svgResult = await editor.getSvgString(
            shapes.map((s) => s.id),
            { background: true, padding: 10 }
          );
          if (!svgResult) return null;

          // Convert SVG to base64 JPEG via offscreen canvas
          return new Promise<string | null>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const maxWidth = 400;
              const scale = Math.min(1, maxWidth / img.width);
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              const ctx = canvas.getContext("2d");
              if (!ctx) { resolve(null); return; }
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
            img.onerror = () => resolve(null);
            img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgResult.svg)))}`;
          });
        } catch {
          return null;
        }
      },
      clear() {
        const editor = editorRef.current;
        if (!editor) return;
        const shapes = editor.getCurrentPageShapes();
        if (shapes.length > 0) {
          editor.deleteShapes(shapes.map((s) => s.id));
        }
      },
    }));

    const handleMount = useCallback(
      (editor: Editor) => {
        editorRef.current = editor;
        editor.setCurrentTool("draw");

        // Detect drawing activity
        if (onStroke) {
          editor.on("event", (event) => {
            if (event.type === "pointer" && event.name === "pointer_down") {
              onStroke();
            }
          });
        }
      },
      [onStroke]
    );

    return (
      <div
        className="relative border-[3px] border-[var(--text)] rounded-[4px] bg-white overflow-hidden"
        style={{
          height: "200px",
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 27px, var(--line) 27px, var(--line) 28px)",
          backgroundPosition: "0 0",
        }}
      >
        {/* Red margin line */}
        <div
          className="absolute left-[40px] top-0 bottom-0 z-10 pointer-events-none"
          style={{ borderLeft: "2px solid var(--margin-red)" }}
        />

        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center"
               style={{ background: "rgba(192, 57, 43, 0.15)" }}>
            <span className="font-jua text-2xl" style={{ color: "var(--danger)" }}>🛑 멈춰!</span>
          </div>
        )}

        {/* tldraw canvas */}
        <div className={`absolute inset-0 ${locked ? "pointer-events-none" : ""}`}>
          <Tldraw
            hideUi
            onMount={handleMount}
            inferDarkMode={false}
          />
        </div>
      </div>
    );
  }
);

export default DrawingCanvas;
