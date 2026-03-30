"use client";

import { useState } from "react";

const USER = "ik";
const PASS = "88777";

export default function ManagerPage() {
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

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