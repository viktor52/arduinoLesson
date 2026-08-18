import { Editor } from '@monaco-editor/react';
import { useRef } from 'react';
import {
  RotateCcw, Copy, Download, Maximize2, Minimize2,
  CheckCircle, Eye, Undo, Redo,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onCheck?: () => void;
  onReset?: () => void;
  onReveal?: () => void;
  isChecking?: boolean;
  gradingDisabled?: boolean;
  readOnly?: boolean;
}

export function CodeEditor({
  code,
  onChange,
  onCheck,
  onReset,
  onReveal,
  isChecking,
  gradingDisabled,
  readOnly,
}: CodeEditorProps) {
  const editorRef = useRef<{ getAction: (id: string) => { run: () => void } | null } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFullscreen = useRef(false);

  const handleEditorDidMount = (editor: { getAction: (id: string) => { run: () => void } | null }) => {
    editorRef.current = editor;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const downloadSketch = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sketch.ino';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sketch downloaded');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen.current) {
      containerRef.current.requestFullscreen?.();
      isFullscreen.current = true;
    } else {
      document.exitFullscreen?.();
      isFullscreen.current = false;
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
        <span className="text-sm text-gray-400 font-mono">sketch.ino</span>
        <div className="flex items-center gap-1">
          <ToolbarButton icon={Undo} onClick={() => editorRef.current?.getAction('undo')?.run()} title="Undo" />
          <ToolbarButton icon={Redo} onClick={() => editorRef.current?.getAction('redo')?.run()} title="Redo" />
          <ToolbarButton icon={Copy} onClick={copyCode} title="Copy" />
          <ToolbarButton icon={Download} onClick={downloadSketch} title="Download" />
          <ToolbarButton icon={RotateCcw} onClick={onReset} title="Reset" />
          <ToolbarButton icon={isFullscreen.current ? Minimize2 : Maximize2} onClick={toggleFullscreen} title="Fullscreen" />
        </div>
      </div>

      <div className="flex-1 min-h-[400px]">
        <Editor
          height="100%"
          defaultLanguage="cpp"
          theme="vs-dark"
          value={code}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            folding: true,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>

      <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-t border-white/10">
        {!gradingDisabled && onCheck && (
          <button onClick={onCheck} disabled={isChecking} className="btn-primary flex-1 sm:flex-none">
            <CheckCircle className="w-4 h-4" />
            {isChecking ? 'Checking...' : 'Check Code'}
          </button>
        )}
        {onReveal && !gradingDisabled && (
          <button onClick={onReveal} className="btn-secondary">
            <Eye className="w-4 h-4" />
            Reveal Solution
          </button>
        )}
        {gradingDisabled && (
          <span className="text-sm text-yellow-400">Grading disabled — solution revealed</span>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ icon: Icon, onClick, title }: { icon: React.ComponentType<{ className?: string }>; onClick?: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
