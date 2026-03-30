"use client";

import { useState } from "react";

export default function ManagerPage() {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("");

  async function sendCommand() {
    try {
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
    } catch (err) {
      setResponse("Error executing command");
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Site Manager</h1>

      <textarea
        style={{ width: "100%", height: 120 }}
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Enter command for the manager..."
      />

      <br />
      <br />

      <button
        onClick={sendCommand}
        style={{
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Run Command
      </button>

      <pre
        style={{
          marginTop: 20,
          background: "#111",
          color: "#0f0",
          padding: 20,
          overflow: "auto",
        }}
      >
        {response}
      </pre>
    </div>
  );
}
