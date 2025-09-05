export async function callAgent(message: string, sessionId?: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API}/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });
    if (!res.ok) throw new Error(`Agent API error: ${res.status}`);
    return res.json() as Promise<{ sessionId: string; outputHtml: string; traceId?: string }>;
  }
  