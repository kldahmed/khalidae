
"use client";
import React, { useState, useRef, useEffect } from "react";

// TODO: Move credentials to secure server-side auth
const USERNAME = "ik";
const PASSWORD = "88777";

const AGENTS = [
  { name: "dev_agent", label: "Dev Agent", color: "#38bdf8" },
  { name: "seo_agent", label: "SEO Agent", color: "#a3e635" },
  { name: "content_agent", label: "Content Agent", color: "#fbbf24" },
  { name: "monitor_agent", label: "Monitor Agent", color: "#f472b6" },
];

const SUGGESTED_ANALYSIS = "Analyze the overall health and performance of the site.";

const SUGGESTED_COMMANDS = [
  "Full Audit",
  "SEO Audit",
  "Performance Audit",
  "System Health Check",
];

type HealthData = {
  ok: boolean;
  timestamp: string;
  message: string;
};

export default function ManagerPage() {
  // Auth state
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [authError, setAuthError] = useState("");
  const passRef = useRef<HTMLInputElement>(null);

  // Health state
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState("");

  // Command console
  const [command, setCommand] = useState("");
  const [commandResponse, setCommandResponse] = useState("");
  const [commandLoading, setCommandLoading] = useState(false);

  // Analysis console
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [analysisResponse, setAnalysisResponse] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Login handler
  function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAuthError("");
    if (user === USERNAME && pass === PASSWORD) {
      setLogged(true);
      setUser("");
      setPass("");
      setTimeout(() => loadHealth(), 100); // load health after login
    } else {
      setAuthError("Invalid credentials");
    }
  }

  // Health loader
  async function loadHealth() {
    setHealthLoading(true);
    setHealthError("");
    setHealthData(null);
    try {
      const res = await fetch("/api/site-manager/health?secret=dev", { method: "GET" });
      const data = await res.json();
      if (data.ok !== undefined) {
        setHealthData(data);
      } else {
        setHealthError("Malformed health data");
      }
    } catch (e) {
      setHealthError("Failed to load health status");
    }
    setHealthLoading(false);
  }

  // Command runner
  async function runCommand() {
    if (!command.trim()) return;
    setCommandLoading(true);
    setCommandResponse("");
    try {
      const res = await fetch("/api/site-manager/tasks?secret=dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: command }),
      });
      const data = await res.json();
      setCommandResponse(data.result || JSON.stringify(data, null, 2));
    } catch (e) {
      setCommandResponse("Error running command");
    }
    setCommandLoading(false);
  }

  function clearCommand() {
    setCommand("");
    setCommandResponse("");
  }

  // Analysis runner
  async function runAnalysis() {
    if (!analysisPrompt.trim()) return;
    setAnalysisLoading(true);
    setAnalysisResponse("");
    try {
      const res = await fetch("/api/site-manager/analyze?secret=dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: analysisPrompt }),
      });
      const data = await res.json();
      setAnalysisResponse(data.result || JSON.stringify(data, null, 2));
    } catch (e) {
      setAnalysisResponse("Error running analysis");
    }
    setAnalysisLoading(false);
  }

  function clearAnalysis() {
    setAnalysisPrompt("");
    setAnalysisResponse("");
  }

  // Keyboard: Enter in password triggers login
  function handlePassKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleLogin();
  }

  // Copy response helpers
  function copyToClipboard(text: string) {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
  }

  // Dashboard UI
  if (!logged) {
    return (
      <div style={styles.bg}>
        <form style={styles.loginCard} onSubmit={handleLogin}>
          <div style={styles.badge}>Executive Access</div>
          <div style={styles.loginTitle}>AI CTO Dashboard</div>
          <div style={styles.loginSubtitle}>Premium executive control for Khalidae</div>
          <input
            style={styles.input}
            placeholder="Username"
            value={user}
            onChange={e => setUser(e.target.value)}
            autoFocus
            autoComplete="username"
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={handlePassKey}
            ref={passRef}
            autoComplete="current-password"
          />
          {authError && <div style={styles.error}>{authError}</div>}
          <button
            type="submit"
            style={styles.button}
            disabled={!user || !pass}
          >
            Login
          </button>
          {/* TODO: Move to secure server-side auth */}
        </form>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.dashboardWrap}>
        {/* Top status bar */}
        <div style={styles.statusBar}>
          <span style={styles.statusBadge}>AI CTO</span>
          <span style={styles.statusPill}>ONLINE</span>
          <span style={styles.statusText}>Executive control for Khalidae</span>
          <span style={styles.statusTime}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Overview cards */}
        <div style={styles.overviewRow}>
          <div style={styles.overviewCard}>
            <div style={styles.overviewTitle}>System Health</div>
            {healthLoading ? (
              <div style={styles.overviewValue}>Loading...</div>
            ) : healthError ? (
              <div style={styles.overviewValue}>{healthError}</div>
            ) : healthData ? (
              <>
                <div style={styles.overviewValue}>{healthData.ok ? "Healthy" : "Issues"}</div>
                <div style={styles.overviewSub}>{healthData.message}</div>
                <div style={styles.overviewSub}>{healthData.timestamp && new Date(healthData.timestamp).toLocaleString()}</div>
              </>
            ) : (
              <div style={styles.overviewValue}>No data</div>
            )}
            <button style={styles.overviewButton} onClick={loadHealth} disabled={healthLoading}>Reload</button>
          </div>
          <div style={styles.overviewCard}>
            <div style={styles.overviewTitle}>Site Manager Status</div>
            <div style={styles.overviewValue}>Active</div>
            <div style={styles.overviewSub}>Ready for executive commands</div>
          </div>
          <div style={styles.overviewCard}>
            <div style={styles.overviewTitle}>Agents Status</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {AGENTS.map(agent => (
                <span key={agent.name} style={{ ...styles.agentChip, background: agent.color }}>{agent.label}</span>
              ))}
            </div>
            <div style={styles.overviewSub}>All agents available</div>
          </div>
        </div>

        {/* Action panels */}
        <div style={styles.actionPanels}>
          {/* Command Console */}
          <div style={styles.actionCard}>
            <div style={styles.actionTitle}>Command Console</div>
            <textarea
              style={styles.textarea}
              value={command}
              onChange={e => setCommand(e.target.value)}
              placeholder="Enter executive command..."
              disabled={commandLoading}
              rows={4}
            />
            <div style={styles.actionButtonsRow}>
              {SUGGESTED_COMMANDS.map(cmd => (
                <button
                  key={cmd}
                  style={styles.suggestedBtn}
                  type="button"
                  onClick={() => setCommand(cmd)}
                  disabled={commandLoading}
                >
                  {cmd}
                </button>
              ))}
            </div>
            <div style={styles.actionButtonsRow}>
              <button
                style={styles.button}
                onClick={runCommand}
                disabled={commandLoading || !command.trim()}
              >
                {commandLoading ? "Running..." : "Run Command"}
              </button>
              <button
                style={styles.secondary}
                onClick={clearCommand}
                disabled={commandLoading}
              >
                Clear
              </button>
              {commandResponse && (
                <button
                  style={styles.copyBtn}
                  onClick={() => copyToClipboard(commandResponse)}
                  type="button"
                >Copy</button>
              )}
            </div>
            <div style={styles.responsePanel}>
              {commandLoading && !commandResponse ? (
                <span style={{ color: "#7fd7ff" }}>Awaiting response...</span>
              ) : (
                <pre style={styles.console}>{commandResponse}</pre>
              )}
            </div>
          </div>

          {/* Analysis Console */}
          <div style={styles.actionCard}>
            <div style={styles.actionTitle}>Analysis Console</div>
            <textarea
              style={styles.textarea}
              value={analysisPrompt}
              onChange={e => setAnalysisPrompt(e.target.value)}
              placeholder="Enter analysis prompt..."
              disabled={analysisLoading}
              rows={4}
            />
            <div style={styles.actionButtonsRow}>
              <button
                style={styles.suggestedBtn}
                type="button"
                onClick={() => setAnalysisPrompt(SUGGESTED_ANALYSIS)}
                disabled={analysisLoading}
              >
                Use Suggested Prompt
              </button>
            </div>
            <div style={styles.actionButtonsRow}>
              <button
                style={styles.button}
                onClick={runAnalysis}
                disabled={analysisLoading || !analysisPrompt.trim()}
              >
                {analysisLoading ? "Running..." : "Run Analysis"}
              </button>
              <button
                style={styles.secondary}
                onClick={clearAnalysis}
                disabled={analysisLoading}
              >
                Clear
              </button>
              {analysisResponse && (
                <button
                  style={styles.copyBtn}
                  onClick={() => copyToClipboard(analysisResponse)}
                  type="button"
                >Copy</button>
              )}
            </div>
            <div style={styles.responsePanel}>
              {analysisLoading && !analysisResponse ? (
                <span style={{ color: "#7fd7ff" }}>Awaiting response...</span>
              ) : (
                <pre style={styles.console}>{analysisResponse}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  bg: {
    minHeight: "100vh",
    minWidth: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(ellipse at 60% 40%, #1a2636 60%, #10131a 100%)",
    boxSizing: "border-box",
    padding: 0,
  },
  dashboardWrap: {
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    background: "rgba(22, 28, 40, 0.92)",
    borderRadius: 28,
    boxShadow: "0 8px 40px 0 rgba(0,0,0,0.45), 0 1.5px 0 0 #2e3a4d inset",
    border: "1.5px solid rgba(80,180,255,0.18)",
    padding: "38px 32px 38px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 36,
    position: "relative",
    backdropFilter: "blur(8px)",
    zIndex: 2,
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  statusBadge: {
    fontSize: 15,
    fontWeight: 700,
    color: "#7fd7ff",
    background: "rgba(36, 60, 80, 0.32)",
    borderRadius: 8,
    padding: "4px 16px",
    letterSpacing: 1.2,
    border: "1px solid #2e5a7a",
    boxShadow: "0 0 8px 0 #1a6b9a33",
    textTransform: "uppercase",
  },
  statusPill: {
    fontSize: 13,
    fontWeight: 700,
    color: "#22d3ee",
    background: "#0e172a",
    borderRadius: 8,
    padding: "3px 14px",
    border: "1px solid #164e63",
    boxShadow: "0 0 8px 0 #1a6b9a33",
    textTransform: "uppercase",
  },
  statusText: {
    fontSize: 15,
    color: "#b2c7e6",
    fontWeight: 400,
    letterSpacing: 0.1,
  },
  statusTime: {
    fontSize: 15,
    color: "#b2c7e6",
    fontWeight: 400,
    marginLeft: "auto",
  },
  overviewRow: {
    display: "flex",
    gap: 24,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  overviewCard: {
    flex: 1,
    minWidth: 220,
    background: "rgba(18, 24, 36, 0.98)",
    borderRadius: 16,
    border: "1.5px solid #2e3a4d",
    boxShadow: "0 2px 12px 0 #1a6b9a22",
    padding: "22px 18px 18px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
    minHeight: 120,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#eaf6ff",
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 600,
    color: "#7fd7ff",
    marginBottom: 2,
  },
  overviewSub: {
    fontSize: 13,
    color: "#b2c7e6",
    fontWeight: 400,
    marginBottom: 0,
  },
  overviewButton: {
    marginTop: 8,
    fontSize: 14,
    padding: "6px 16px",
    borderRadius: 8,
    border: "1px solid #2e3a4d",
    background: "#10131a",
    color: "#7fd7ff",
    cursor: "pointer",
    fontWeight: 600,
  },
  agentChip: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    color: "#10131a",
    background: "#7fd7ff",
    borderRadius: 8,
    padding: "3px 10px",
    marginRight: 0,
    marginBottom: 2,
    letterSpacing: 0.5,
    boxShadow: "0 0 6px 0 #1a6b9a33",
    border: "1px solid #2e3a4d",
  },
  actionPanels: {
    display: "flex",
    gap: 24,
    marginTop: 18,
    flexWrap: "wrap",
  },
  actionCard: {
    flex: 1,
    minWidth: 340,
    background: "rgba(18, 24, 36, 0.98)",
    borderRadius: 16,
    border: "1.5px solid #2e3a4d",
    boxShadow: "0 2px 12px 0 #1a6b9a22",
    padding: "22px 18px 18px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
    minHeight: 220,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#eaf6ff",
    marginBottom: 2,
  },
  textarea: {
    width: "100%",
    minHeight: 80,
    maxHeight: 180,
    padding: "13px 16px",
    fontSize: 16,
    borderRadius: 10,
    border: "1.5px solid #2e3a4d",
    background: "rgba(18, 24, 36, 0.92)",
    color: "#eaf6ff",
    fontWeight: 500,
    marginBottom: 8,
    outline: "none",
    resize: "vertical",
    boxShadow: "0 1.5px 0 0 #2e3a4d inset",
    transition: "border 0.2s",
  },
  actionButtonsRow: {
    display: "flex",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  button: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: "#38bdf8",
    color: "#000",
    fontWeight: 600,
    cursor: "pointer",
    minWidth: 120,
  },
  secondary: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    minWidth: 90,
  },
  suggestedBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#10131a",
    color: "#7fd7ff",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    marginBottom: 2,
  },
  copyBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#10131a",
    color: "#7fd7ff",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    marginBottom: 2,
  },
  responsePanel: {
    width: "100%",
    minHeight: 80,
    background: "rgba(18, 24, 36, 0.98)",
    borderRadius: 10,
    border: "1.5px solid #2e3a4d",
    color: "#aef7ff",
    fontFamily: "Menlo, Monaco, 'Fira Mono', 'Consolas', monospace",
    fontSize: 15,
    padding: "14px 12px 12px 12px",
    marginTop: 6,
    marginBottom: 0,
    whiteSpace: "pre-wrap",
    overflowX: "auto",
    boxShadow: "0 1.5px 0 0 #2e3a4d inset",
    letterSpacing: 0.1,
  },
  console: {
    background: "transparent",
    padding: 0,
    borderRadius: 0,
    border: "none",
    color: "#aef7ff",
    whiteSpace: "pre-wrap",
    minHeight: 80,
    fontFamily: "Menlo, Monaco, 'Fira Mono', 'Consolas', monospace",
    fontSize: 15,
    margin: 0,
  },
  loginCard: {
    background: "rgba(22, 28, 40, 0.92)",
    borderRadius: 24,
    boxShadow: "0 8px 40px 0 rgba(0,0,0,0.45), 0 1.5px 0 0 #2e3a4d inset",
    border: "1.5px solid rgba(80,180,255,0.18)",
    maxWidth: 420,
    width: "100%",
    padding: "48px 36px 40px 36px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
    position: "relative",
    backdropFilter: "blur(8px)",
    zIndex: 2,
  },
  badge: {
    fontSize: 13,
    fontWeight: 600,
    color: "#7fd7ff",
    background: "rgba(36, 60, 80, 0.32)",
    borderRadius: 8,
    padding: "3px 14px",
    letterSpacing: 1.2,
    marginBottom: 10,
    border: "1px solid #2e5a7a",
    boxShadow: "0 0 8px 0 #1a6b9a33",
    textTransform: "uppercase",
    alignSelf: "center",
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: "#eaf6ff",
    letterSpacing: -1.2,
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "inherit",
  },
  loginSubtitle: {
    fontSize: 16,
    color: "#b2c7e6",
    marginBottom: 24,
    textAlign: "center",
    fontWeight: 400,
    letterSpacing: 0.1,
  },
  input: {
    width: "100%",
    padding: "13px 16px",
    fontSize: 17,
    borderRadius: 10,
    border: "1.5px solid #2e3a4d",
    background: "rgba(18, 24, 36, 0.92)",
    color: "#eaf6ff",
    marginBottom: 18,
    outline: "none",
    fontWeight: 500,
    boxShadow: "0 1.5px 0 0 #2e3a4d inset",
    transition: "border 0.2s",
  },
  error: {
    color: "#ff4d6d",
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: 500,
  },
};