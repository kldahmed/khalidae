"use client";

import React, { useState, useRef } from "react";

// TODO: Move credentials to env or real auth
const USERNAME = "ik";
const PASSWORD = "88777";

const styles = {
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
  card: {
    background: "rgba(22, 28, 40, 0.85)",
    borderRadius: 24,
    boxShadow: "0 8px 40px 0 rgba(0,0,0,0.45), 0 1.5px 0 0 #2e3a4d inset",
    border: "1.5px solid rgba(80,180,255,0.18)",
    maxWidth: 760,
    width: "100%",
    padding: "48px 36px 40px 36px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 28,
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
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#eaf6ff",
    letterSpacing: -1.2,
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "inherit",
  },
  subtitle: {
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
  inputError: {
    border: "1.5px solid #ff4d6d",
  },
  button: {
    width: "100%",
    padding: "14px 0",
    fontSize: 18,
    fontWeight: 700,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg, #1e7fff 0%, #00e0ff 100%)",
    color: "#fff",
    boxShadow: "0 2px 16px 0 #00e0ff22",
    cursor: "pointer",
    marginTop: 6,
    marginBottom: 2,
    transition: "opacity 0.18s",
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  error: {
    color: "#ff4d6d",
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: 500,
  },
  consoleTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: "#eaf6ff",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.8,
  },
  consoleDesc: {
    fontSize: 16,
    color: "#b2c7e6",
    marginBottom: 18,
    textAlign: "center",
    fontWeight: 400,
  },
  textarea: {
    width: "100%",
    minHeight: 90,
    maxHeight: 220,
    padding: "15px 16px",
    fontSize: 17,
    borderRadius: 10,
    border: "1.5px solid #2e3a4d",
    background: "rgba(18, 24, 36, 0.92)",
    color: "#eaf6ff",
    fontWeight: 500,
    marginBottom: 18,
    outline: "none",
    resize: "vertical",
    boxShadow: "0 1.5px 0 0 #2e3a4d inset",
    transition: "border 0.2s",
  },
  responsePanel: {
    width: "100%",
    minHeight: 80,
    background: "rgba(18, 24, 36, 0.98)",
    borderRadius: 10,
    border: "1.5px solid #2e3a4d",
    color: "#aef7ff",
    fontFamily: "Menlo, Monaco, 'Fira Mono', 'Consolas', monospace",
    fontSize: 16,
    padding: "18px 16px 16px 16px",
    marginTop: 10,
    marginBottom: 0,
    whiteSpace: "pre-wrap",
    overflowX: "auto",
    boxShadow: "0 1.5px 0 0 #2e3a4d inset",
    letterSpacing: 0.1,
  },
  actionsRow: {
    display: "flex",
    width: "100%",
    gap: 14,
    marginTop: 2,
    marginBottom: 0,
    flexWrap: "wrap",
  },
  secondaryButton: {
    flex: 1,
    padding: "14px 0",
    fontSize: 17,
    fontWeight: 600,
    borderRadius: 10,
    border: "1.5px solid #2e3a4d",
    background: "rgba(22, 28, 40, 0.7)",
    color: "#7fd7ff",
    cursor: "pointer",
    marginTop: 6,
    marginBottom: 2,
    transition: "opacity 0.18s",
    letterSpacing: 0.1,
  },
  '@media (max-width: 900px)': {
    card: {
      padding: "32px 10vw 32px 10vw",
      maxWidth: "98vw",
    },
  },
  '@media (max-width: 600px)': {
    card: {
      padding: "18vw 2vw 18vw 2vw",
      maxWidth: "99vw",
    },
  },
};

function mergeStyles(...objs) {
  return Object.assign({}, ...objs);
}

export default function ManagerPage() {
  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const passwordRef = useRef(null);

  // Console state
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [consoleError, setConsoleError] = useState("");

  // Responsive style helpers
  const getCardStyle = () => {
    if (typeof window === "undefined") return styles.card;
    if (window.innerWidth <= 600) return { ...styles.card, ...styles['@media (max-width: 600px)'].card };
    if (window.innerWidth <= 900) return { ...styles.card, ...styles['@media (max-width: 900px)'].card };
    return styles.card;
  };

  // Login logic
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    if (username.trim() === USERNAME && password === PASSWORD) {
      setLoggedIn(true);
      setUsername("");
      setPassword("");
    } else {
      setLoginError("Invalid credentials. Please try again.");
    }
  };

  // Command logic
  const handleRunCommand = async () => {
    setConsoleError("");
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("/api/site-manager/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      if (!res.ok) {
        throw new Error("Server error");
      }
      const data = await res.json();
      setResponse(typeof data === "string" ? data : JSON.stringify(data, null, 2));
    } catch (err) {
      setConsoleError("Failed to run command. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCommand("");
    setResponse("");
    setConsoleError("");
  };

  // Enter in password triggers login
  const handlePasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  // Render helpers
  const renderLogin = () => (
    <form style={getCardStyle()} onSubmit={handleLogin}>
      <div style={styles.badge}>Executive Access</div>
      <div style={styles.title}>AI Site Manager</div>
      <div style={styles.subtitle}>Secure command interface for Khalidae</div>
      {loginError && <div style={styles.error}>{loginError}</div>}
      <input
        style={mergeStyles(styles.input, loginError && styles.inputError)}
        type="text"
        placeholder="Username"
        autoComplete="username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        spellCheck={false}
        autoFocus
      />
      <input
        style={mergeStyles(styles.input, loginError && styles.inputError)}
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={handlePasswordKeyDown}
        ref={passwordRef}
      />
      <button
        type="submit"
        style={styles.button}
        disabled={username.length === 0 || password.length === 0}
      >
        Login
      </button>
    </form>
  );

  const renderConsole = () => (
    <div style={getCardStyle()}>
      <div style={styles.badge}>Manager Console</div>
      <div style={styles.consoleTitle}>Command Center</div>
      <div style={styles.consoleDesc}>AI manager is online and ready for your instructions.</div>
      {consoleError && <div style={styles.error}>{consoleError}</div>}
      <textarea
        style={styles.textarea}
        placeholder="Type your command here..."
        value={command}
        onChange={e => setCommand(e.target.value)}
        rows={4}
        spellCheck={false}
        disabled={loading}
      />
      <div style={styles.actionsRow}>
        <button
          style={mergeStyles(styles.button, { flex: 2 }, (loading || !command.trim()) && styles.buttonDisabled)}
          onClick={handleRunCommand}
          disabled={loading || !command.trim()}
        >
          {loading ? "Running..." : "Run Command"}
        </button>
        <button
          style={styles.secondaryButton}
          onClick={handleClear}
          type="button"
          disabled={loading && !response}
        >
          Clear
        </button>
      </div>
      <div style={styles.responsePanel}>
        {loading && !response ? <span style={{ color: "#7fd7ff" }}>Awaiting response...</span> : response}
      </div>
    </div>
  );

  return (
    <div style={styles.bg}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {/* Subtle background glow */}
        <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <radialGradient id="glow" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#1e7fff44" />
              <stop offset="100%" stopColor="#10131a00" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#glow)" />
        </svg>
      </div>
      {loggedIn ? renderConsole() : renderLogin()}
    </div>
  );
}

  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("");

  function login() {
    if (user === USER && pass === PASS) {
      setLogged(true);
    } else {
      alert("Access denied");
    }
  }

  async function sendCommand() {
    setResponse("Running...");

    const res = await fetch("/api/site-manager/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: command }),
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  }

  if (!logged) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Manager Login</h2>

        <input
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <br />
        <br />

        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Site Manager</h1>

      <textarea
        style={{ width: "100%", height: 120 }}
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />

      <br />
      <br />

      <button onClick={sendCommand}>Run Command</button>

      <pre
        style={{
          marginTop: 20,
          background: "#111",
          color: "#0f0",
          padding: 20,
        }}
      >
        {response}
      </pre>
    </div>
  );
}