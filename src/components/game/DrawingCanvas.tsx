"use client";

import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { useCallback, useRef, useImperativeHandle, forwardRef } from "react";

interface DrawingCanvasProps {
  /** Visual warning overlay (doesn't block input) */
  dangerOverlay?: boolean;
  onStroke?: () => void;
}

export interface DrawingCanvasHandle {
  exportImage: () => Promise<string | null>;
  clear: () => void;
}

/**
 * tldraw canvas in hideUi mode with notebook styling.
 *
 * IMPORTANT: Never blocks pointer events. During DANGER state,
 * shows a visual warning but the player CAN still draw.
 * If they draw during DANGER, the game logic catches them.
 * That's the whole tension of the game.
 */
const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas({ dangerOverlay = false, onStroke }, ref) {
    const editorRef = useRef<Editor | null>(null);

    useImperativeHandle(ref, () => ({
      async exportImage(): Promise<string | null> {
        const editor = editorRef.current;
        if (!editor) return null;

        const shapes = editor.getCurrentPageShapes();
        if (shapes.length === 0) return null;

        try {
          const svgResult = await editor.getSvgString(
            shapes.map((s) => s.id),
            { background: true, padding: 10 }
          );
          if (!svgResult) return null;

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
        try {
          const shapes = editor.getCurrentPageShapes();
          if (shapes.length > 0) {
            editor.deleteShapes(shapes.map((s) => s.id));
          }
          // Re-set draw tool in case it got deselected
          editor.setCurrentTool("draw");
        } catch {
          // Ignore errors during clear
        }
      },
    }));

    const handleMount = useCallback(
      (editor: Editor) => {
        editorRef.current = editor;
        editor.setCurrentTool("draw");

        if (onStroke) {
          // Track pointer down AND pointer move (actual drawing strokes)
          editor.on("event", (event) => {
            if (
              event.type === "pointer" &&
              (event.name === "pointer_down" || event.name === "pointer_move") &&
              editor.getInstanceState().isPenMode === false
            ) {
              // Only fire on actual drawing (pointer is down)
              if (event.name === "pointer_down") {
                onStroke();
              }
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

        {/* Danger warning overlay - DOES NOT BLOCK INPUT */}
        {dangerOverlay && (
          <div
            className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
            style={{ background: "rgba(192, 57, 43, 0.08)" }}
          >
            <span
              className="font-jua text-lg opacity-60 animate-pulse"
              style={{ color: "var(--danger)" }}
            >
              🛑 선생님이 보고 있다!
            </span>
          </div>
        )}

        {/* tldraw canvas - ALWAYS receives input */}
        <div className="absolute inset-0">
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
