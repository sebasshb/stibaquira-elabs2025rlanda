export async function callAgent(message: string, sessionId?: string) {
  // 1. Leer la sesión del estudiante desde localStorage.
  const sessionRaw = typeof window !== "undefined" ? localStorage.getItem("studentSession") : null;
  const sessionData = sessionRaw ? JSON.parse(sessionRaw) : null;

  // 2. Extraer el token de sesión.
  //    Basado en el nuevo código de WorkshopLogin.py, el token está en session.sessionId
  const token = sessionData?.session?.sessionId;

  if (!token) {
    // Si no hay token, no podemos continuar.
    throw new Error("No se encontró un token de sesión. Por favor, inicie sesión de nuevo.");
  }

  // 3. Crear las cabeceras y añadir el token de autorización.
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API}/agent`, {
    method: "POST",
    headers: headers, // Usamos las nuevas cabeceras
    body: JSON.stringify({ message, sessionId: token }), // Aseguramos que el sessionId sea el token
  });

  if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
          throw new Error("No autorizado. Tu sesión puede haber expirado.");
      }
      throw new Error(`Error en la API del agente: ${res.status}`);
  }

  return res.json() as Promise<{ sessionId: string; outputHtml: string; traceId?: string }>;
}