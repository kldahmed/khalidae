"use client";

import { useState } from "react";

const USER = "ik";
const PASS = "88777";

export default function ManagerPage() {
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  function login() {
    if (user === USER && pass === PASS) {
      setLogged(true);
      setError("");
    } else {
      setError("Invalid credentials");
    }
  }

  async function runCommand() {
    if (!command.trim()) return;

    setLoading(true);
    setResponse("Running...");

    try {
      const res = await fetch("/api/site-manager/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: command }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (e) {
      setResponse("Error running command");
    }

    setLoading(false);
  }

  if (!logged) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.badge}>Executive Access</div>

          <h1 style={styles.title}>AI Site Manager</h1>

          <p style={styles.subtitle}>
            Secure command interface for Khalidae
          </p>

          <input
            style={styles.input}
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") login();
            }}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button style={styles.button} onClick={login}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.badge}>Manager Console</div>

        <h1 style={styles.title}>AI Command Center</h1>

        <p style={styles.subtitle}>
          The Khalidae manager is online and waiting for instructions.
        </p>

        <textarea
          style={styles.textarea}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command for the manager..."
        />

        <div style={styles.buttonRow}>
          <button
            style={styles.button}
            disabled={loading}
            onClick={runCommand}
          >
            Run Command
          </button>

          <button
            style={styles.secondary}
            onClick={() => {
              setCommand("");
              setResponse("");
            }}
          >
            Clear
          </button>
        </div>

        <pre style={styles.console}>{response}</pre>
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at center, #0f172a 0%, #020617 80%)",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 720,
    padding: 40,
    borderRadius: 16,
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(148,163,184,0.2)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
  },

  badge: {
    fontSize: 12,
    color: "#38bdf8",
    marginBottom: 10,
    letterSpacing: 1,
  },

  title: {
    fontSize: 32,
    marginBottom: 10,
  },

  subtitle: {
    opacity: 0.7,
    marginBottom: 30,
  },

  input: {
    width: "100%",
    padding: 14,
    marginBottom: 14,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#020617",
    color: "#fff",
  },

  textarea: {
    width: "100%",
    height: 120,
    padding: 14,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#020617",
    color: "#fff",
    marginBottom: 20,
  },

  buttonRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },

  button: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: "#38bdf8",
    color: "#000",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondary: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },

  console: {
    background: "#020617",
    padding: 20,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#22c55e",
    whiteSpace: "pre-wrap",
    minHeight: 120,
  },

  error: {
    color: "#f87171",
    marginBottom: 10,
  },
};