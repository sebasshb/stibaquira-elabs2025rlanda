import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DOMPurify from "dompurify";
import { callAgent } from "@/lib/agentApi";

const LS_KEY = "elabs_agent_open";

type AgentWidgetProps = {
  onLauncherMount?: (element: HTMLButtonElement | null) => void;
};

export default function AgentWidget({ onLauncherMount }: AgentWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>();
  const [msgs, setMsgs] = useState<{ role: "user" | "agent"; html: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === "1") setOpen(true);
    } catch {}
  }, []);

  useEffect(() => {
    // Cuando el componente se monta, si existe la prop, la llamamos con la ref del botón
    if (onLauncherMount) {
      onLauncherMount(launcherRef.current);
    }
  }, [onLauncherMount]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try { localStorage.setItem(LS_KEY, next ? "1" : "0"); } catch {}
  };

  const send = async () => {
    const text = (inputRef.current?.value || "").trim();
    if (!text) return;
    setMsgs(m => [...m, { role: "user", html: DOMPurify.sanitize(text) }]);
    inputRef.current!.value = "";
    const data = await callAgent(text, sessionId);
    setSessionId(data.sessionId);
    setMsgs(m => [
      ...m,
      { role: "agent", html: DOMPurify.sanitize(data.outputHtml, { USE_PROFILES: { html: true } }) }
    ]);
  };

  const panel = (
    <>
      {/* Botón flotante (launcher) */}
      <button
        ref={launcherRef}
        className="agent-launcher"
        aria-label={open ? "Cerrar chat de soporte" : "Abrir chat de soporte"}
        onClick={toggle}
      >
        {open ? "×" : "💬"}
      </button>

      {/* Panel del chat */}
      {open && (
        <div className="agent-panel" role="dialog" aria-modal="true" aria-label="Chat de soporte eLabs">
          <div className="agent-header">
            <div className="agent-title">Craft - Asistente eLabs</div>
            <button className="agent-close" onClick={toggle} aria-label="Cerrar">×</button>
          </div>

          <div className="agent-log">
            {msgs.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                <div dangerouslySetInnerHTML={{ __html: m.html }} />
              </div>
            ))}
          </div>

          <div className="agent-input">
            <input
              ref={inputRef}
              placeholder="Escribe tus dudas o reporta un problema..."
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button onClick={send}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );

  // 👉 Portal al body: sale del container y queda siempre visible
  if (!mounted) return null;
  return createPortal(panel, document.body);
}