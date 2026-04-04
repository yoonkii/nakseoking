"use client";

import { Tldraw, Editor, createTLStore, defaultShapeUtils } from "tldraw";
import "tldraw/tldraw.css";
import { useCallback, useRef, useMemo } from "react";

interface DrawingCanvasProps {
  locked?: boolean;
  onEditorReady?: (editor: Editor) => void;
}

export default function DrawingCanvas({ locked = false, onEditorReady }: DrawingCanvasProps) {
  const editorRef = useRef<Editor | null>(null);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Set draw tool as default
      editor.setCurrentTool("draw");

      onEditorReady?.(editor);
    },
    [onEditorReady]
  );

  return (
    <div
      className="relative border-[3px] border-[var(--text)] rounded-[4px] bg-white overflow-hidden"
      style={{
        height: "200px",
        // Notebook line pattern
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
        <div className="absolute inset-0 z-20 bg-[var(--danger)] bg-opacity-20 flex items-center justify-center">
          <span className="font-jua text-2xl text-[var(--danger)]">🛑 멈춰!</span>
        </div>
      )}

      {/* tldraw canvas */}
      <div className={`absolute inset-0 ${locked ? "pointer-events-none" : ""}`}>
        <Tldraw
          hideUi
          onMount={handleMount}
          persistenceKey={undefined}
          inferDarkMode={false}
        />
      </div>
    </div>
  );
}
