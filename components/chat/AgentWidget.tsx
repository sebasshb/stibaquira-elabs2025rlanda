import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DOMPurify from "dompurify";
import { marked } from 'marked';

const LS_KEY = "elabs_agent_open";

type AgentWidgetProps = {
  // La URL del endpoint de la API del agente (será diferente para estudiante y RRHH)
  apiEndpoint: string;
  // Una función que devuelve el valor para la cabecera de autorización.
  // Para RRHH será un token JWT, para Estudiante será el sessionId.
  getAuthHeaderValue: () => Promise<string | null>;
  // Un booleano para decidir si el sessionId debe enviarse en el cuerpo de la petición.
  // Será 'true' para Estudiante y 'false' para RRHH.
  sendSessionIdInBody: boolean;
  onLauncherMount?: (element: HTMLButtonElement | null) => void;
};

export default function AgentWidget({
  apiEndpoint,
  getAuthHeaderValue,
  sendSessionIdInBody,
  onLauncherMount,
}: AgentWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [msgs, setMsgs] = useState<{ role: "user" | "agent"; html: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false); // --> NUEVO: Estado para feedback de carga.
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (logRef.current) {
      // Usamos .scrollTo con 'smooth' para un efecto más agradable
      logRef.current.scrollTo({
        top: logRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [msgs]); // Este efecto se ejecuta cada vez que el array 'msgs' cambia

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try { localStorage.setItem(LS_KEY, next ? "1" : "0"); } catch {}
  };

  const send = async () => {
    const text = (inputRef.current?.value || "").trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setMsgs(m => [...m, { role: "user", html: DOMPurify.sanitize(text) }]);
    if (inputRef.current) inputRef.current.value = "";

    try {
      // 1. Obtiene el valor de autenticación (token JWT o sessionId)
      const authValue = await getAuthHeaderValue();
      if (!authValue) {
        throw new Error("No se pudo obtener la credencial de autenticación.");
      }

      // 2. Construye el cuerpo de la petición
      const body: { message: string; sessionId?: string } = { message: text };
      if (sendSessionIdInBody && sessionId) {
        body.sessionId = sessionId;
      }

      console.log("Intentando llamar a la API en esta URL:", apiEndpoint);

      // 3. Realiza la llamada fetch con las props configurables
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authValue}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error en la llamada al agente.");
      }

      // 4. Actualiza el estado con la respuesta
      setSessionId(data.sessionId);

      // 1. Convierte la respuesta Markdown a HTML usando la nueva librería
      const unsafeHtml = await marked(data.outputHtml || '');

      // 2. Sanea el HTML resultante por seguridad (como ya hacías)
      const safeHtml = DOMPurify.sanitize(unsafeHtml, { USE_PROFILES: { html: true } });

      // 3. Actualiza el estado con el HTML seguro y ya formateado
      setMsgs(m => [
        ...m,
        { role: "agent", html: safeHtml }
      ]);

    } catch (error) {
      console.error("Error al contactar al agente:", error);
      const errorMessage = "Lo siento, ocurrió un error. Por favor, intenta de nuevo más tarde.";
      setMsgs(m => [
        ...m,
        { role: "agent", html: errorMessage }
      ]);
    } finally {
      setIsLoading(false);
    }
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

          <div ref={logRef} className="agent-log">
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