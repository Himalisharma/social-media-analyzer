import { useCallback, useRef, useState } from "react";
import { ClipboardList } from "lucide-react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PostIdeas from "./components/PostIdeas";
import AboutSection from "./components/AboutSection";
import UploadZone from "./components/UploadZone";
import FileTabs from "./components/FileTabs";
import LoadingState from "./components/LoadingState";
import ErrorBanner from "./components/ErrorBanner";
import ScoreDial from "./components/ScoreDial";
import EditableText from "./components/EditableText";
import ChecklistPanel from "./components/ChecklistPanel";
import StatsStrip from "./components/StatsStrip";
import PlatformSelector from "./components/PlatformSelector";

import { validateFiles } from "./utils/fileValidators";
import { processFile, reanalyze } from "./services/pipeline";

let idCounter = 0;
const nextId = () => `f${++idCounter}-${Date.now()}`;

export default function App() {
  const [files, setFiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  // keep raw File objects out of React state (they're not serializable-friendly
  // and don't need to trigger renders) — map id -> { file, type }
  const rawFilesRef = useRef(new Map());

  const patchFile = useCallback((id, patch) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...(typeof patch === "function" ? patch(f) : patch) } : f))
    );
  }, []);

  const runPipeline = useCallback(
    async (id, file, type, platformId) => {
      await processFile(file, type, platformId, (patch) => patchFile(id, patch));
    },
    [patchFile]
  );

  const handleFiles = useCallback(
    (fileList) => {
      const validated = validateFiles(fileList);
      const newEntries = [];

      validated.forEach(({ file, result }) => {
        const id = nextId();
        if (!result.ok) {
          newEntries.push({
            id,
            name: file.name,
            size: file.size,
            status: "error",
            error: result.reason,
            platform: "general",
          });
          return;
        }

        rawFilesRef.current.set(id, { file, type: result.type });
        newEntries.push({
          id,
          name: file.name,
          size: file.size,
          type: result.type,
          status: "processing",
          stage: "reading",
          progress: null,
          pageProgress: null,
          platform: "general",
          text: "",
          analysis: null,
        });
      });

      setFiles((prev) => [...prev, ...newEntries]);
      if (!activeId && newEntries.length) setActiveId(newEntries[0].id);

      newEntries.forEach((entry) => {
        if (entry.status !== "processing") return;
        const { file, type } = rawFilesRef.current.get(entry.id);
        runPipeline(entry.id, file, type, entry.platform);
      });
    },
    [activeId, runPipeline]
  );

  const handleRetry = useCallback(
    (id) => {
      const raw = rawFilesRef.current.get(id);
      if (!raw) return;
      const f = files.find((x) => x.id === id);
      patchFile(id, { status: "processing", stage: "reading", error: null });
      runPipeline(id, raw.file, raw.type, f?.platform || "general");
    },
    [files, patchFile, runPipeline]
  );

  const handleRemove = useCallback(
    (id) => {
      rawFilesRef.current.delete(id);
      setFiles((prev) => {
        const next = prev.filter((f) => f.id !== id);
        if (activeId === id) {
          setActiveId(next.length ? next[0].id : null);
        }
        return next;
      });
    },
    [activeId]
  );

  const handleDismissError = useCallback(
    (id) => {
      handleRemove(id);
    },
    [handleRemove]
  );

  const handlePlatformChange = useCallback(
    (id, platformId) => {
      patchFile(id, (f) => ({
        platform: platformId,
        analysis: f.text ? reanalyze(f.text, platformId) : f.analysis,
      }));
    },
    [patchFile]
  );

  const handleSaveText = useCallback(
    (id, newText) => {
      patchFile(id, (f) => ({
        text: newText,
        analysis: reanalyze(newText, f.platform),
      }));
    },
    [patchFile]
  );

  const isAnyProcessing = files.some((f) => f.status === "processing");
  const active = files.find((f) => f.id === activeId) || null;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <Hero
        onFiles={handleFiles}
        disabled={isAnyProcessing}
        uploadSlot={<UploadZone onFiles={handleFiles} disabled={isAnyProcessing} />}
      />

      <main
        id="workspace"
        className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16 sm:pb-20 scroll-mt-16"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-8 h-8 rounded-md bg-accent-soft border border-line flex items-center justify-center text-accent shrink-0">
            <ClipboardList size={16} strokeWidth={2} />
          </span>
          <div>
            <h2 className="font-display text-2xl text-ink leading-none">Your analysis</h2>
            <p className="font-sans text-xs text-muted mt-1">
              Upload above, or pick a file below to see its notes.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <FileTabs files={files} activeId={activeId} onSelect={setActiveId} onRemove={handleRemove} />

          {active && active.status === "error" && (
            <ErrorBanner
              message={active.error}
              onRetry={() => handleRetry(active.id)}
              onDismiss={() => handleDismissError(active.id)}
            />
          )}

          {active && active.status === "processing" && (
            <LoadingState
              stage={active.stage}
              progress={active.progress}
              pageProgress={active.pageProgress}
              isImage={active.type !== "application/pdf"}
            />
          )}

          {active && active.status === "ready" && active.analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
              <div className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <PlatformSelector
                    value={active.platform}
                    onChange={(p) => handlePlatformChange(active.id, p)}
                  />
                </div>

                {active.ocrMeta && (
                  <p className="font-mono text-xs text-muted">
                    OCR confidence {active.ocrMeta.confidence}%
                    {active.ocrMeta.uncertainWords > 0
                      ? ` — ${active.ocrMeta.uncertainWords} word${
                          active.ocrMeta.uncertainWords === 1 ? "" : "s"
                        } uncertain, worth a check`
                      : " — looks clean"}
                  </p>
                )}

                <EditableText
                  key={active.id}
                  text={active.text}
                  highlights={active.analysis.highlights}
                  onSave={(newText) => handleSaveText(active.id, newText)}
                />

                <StatsStrip stats={active.analysis.stats} />
              </div>

              <div className="space-y-4">
                <div className="bg-card border border-line rounded-lg p-5 flex justify-center shadow-sm">
                  <ScoreDial score={active.analysis.score} label={active.analysis.label} />
                </div>
                <ChecklistPanel checks={active.analysis.checks} />
              </div>
            </div>
          )}

          {!active && files.length === 0 && (
            <div className="rounded-lg border border-dashed border-sage-dim/40 bg-card text-center py-14 px-6">
              <p className="font-display text-lg text-ink">Nothing to analyze yet</p>
              <p className="font-sans text-sm text-muted mt-1.5 max-w-sm mx-auto">
                Upload a post above, or try one of the sample files to see how Margin marks it up.
              </p>
            </div>
          )}
        </div>
      </main>

      <PostIdeas />
      <AboutSection />

      <footer className="border-t border-line bg-paper">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="font-mono text-[11px] text-muted">
            Everything runs in your browser — nothing you upload leaves this tab.
          </p>
        </div>
      </footer>
    </div>
  );
}
