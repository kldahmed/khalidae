
"use client";
import React, { useState, useRef, useEffect } from "react";

// TODO: Move credentials to secure server-side auth

const USERNAME = "ik";
const PASSWORD = "88777";

// يمكن تغيير هذا لاحقًا أو جعله حقل إدخال مخفي
const DEFAULT_SECRET = "dev";


const AGENTS = [
  { name: "dev_agent", label: "وكيل التطوير", color: "#38bdf8" },
  { name: "seo_agent", label: "وكيل السيو", color: "#a3e635" },
  { name: "content_agent", label: "وكيل المحتوى", color: "#fbbf24" },
  { name: "monitor_agent", label: "وكيل المراقبة", color: "#f472b6" },
];

const SUGGESTED_ANALYSIS = "حلل صحة وأداء الموقع بشكل شامل.";

const SUGGESTED_COMMANDS = [
  "فحص شامل",
  "فحص السيو",
  "فحص الأداء",
  "فحص صحة النظام",
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
  const [secret, setSecret] = useState<string>("");
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

  // استرجاع الجلسة من localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = window.localStorage.getItem("manager_session");
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.logged && parsed.secret) {
            setLogged(true);
            setSecret(parsed.secret);
            setTimeout(() => loadHealth(parsed.secret), 100);
          }
        } catch {}
      }
    }
  }, []);

  // حفظ الجلسة
  function saveSession(secret: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("manager_session", JSON.stringify({ logged: true, secret }));
    }
  }

  // تسجيل الدخول
  function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAuthError("");
    // يمكن جعل secret حقل إدخال مخفي أو ثابت حسب الحاجة
    const usedSecret = DEFAULT_SECRET;
    if (user === USERNAME && pass === PASSWORD) {
      setLogged(true);
      setUser("");
      setPass("");
      setSecret(usedSecret);
      saveSession(usedSecret);
      setTimeout(() => loadHealth(usedSecret), 100);
    } else {
      setAuthError("بيانات الدخول غير صحيحة");
    }
  }

  // تحميل الصحة
  async function loadHealth(secretParam?: string) {
    setHealthLoading(true);
    setHealthError("");
    setHealthData(null);
    try {
      const res = await fetch("/api/site-manager/health", {
        method: "GET",
        headers: { "x-site-manager-secret": secretParam || secret || DEFAULT_SECRET },
      });
      const data = await res.json();
      if (typeof data.ok === "boolean" && data.timestamp && data.message) {
        setHealthData(data);
      } else if (data.error === "Unauthorized") {
        setHealthError("غير مصرح");
      } else {
        setHealthError("تعذر قراءة بيانات صحة النظام");
      }
    } catch (e) {
      setHealthError("تعذر تحميل بيانات الصحة");
    }
    setHealthLoading(false);
  }

  // تنفيذ أمر
  async function runCommand() {
    if (!command.trim()) return;
    setCommandLoading(true);
    setCommandResponse("");
    try {
      const res = await fetch("/api/site-manager/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-site-manager-secret": secret || DEFAULT_SECRET,
        },
        body: JSON.stringify({ task: command }),
      });
      const data = await res.json();
      if (data.result) {
        setCommandResponse(data.result);
      } else if (data.error === "Unauthorized") {
        setCommandResponse("غير مصرح");
      } else {
        setCommandResponse("تعذر تنفيذ الأمر");
      }
    } catch (e) {
      setCommandResponse("تعذر تنفيذ الأمر");
    }
    setCommandLoading(false);
  }

  function clearCommand() {
    setCommand("");
    setCommandResponse("");
  }

  // تنفيذ تحليل
  async function runAnalysis() {
    if (!analysisPrompt.trim()) return;
    setAnalysisLoading(true);
    setAnalysisResponse("");
    try {
      const res = await fetch("/api/site-manager/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-site-manager-secret": secret || DEFAULT_SECRET,
        },
        body: JSON.stringify({ prompt: analysisPrompt }),
      });
      const data = await res.json();
      if (data.result) {
        setAnalysisResponse(data.result);
      } else if (data.error === "Unauthorized") {
        setAnalysisResponse("غير مصرح");
      } else {
        setAnalysisResponse("تعذر تنفيذ التحليل");
      }
    } catch (e) {
      setAnalysisResponse("تعذر تنفيذ التحليل");
    }
    setAnalysisLoading(false);
  }

  function clearAnalysis() {
    setAnalysisPrompt("");
    setAnalysisResponse("");
  }

  // الضغط على Enter في كلمة المرور
  function handlePassKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleLogin();
  }

  // نسخ للنصوص
  function copyToClipboard(text: string) {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
  }

  // واجهة الدخول
  if (!logged) {
    return (
      <div style={{...styles.bg, direction: "rtl"}}>
        <form style={styles.loginCard} onSubmit={handleLogin} dir="rtl">
          <div style={styles.badge}>دخول تنفيذي</div>
          <div style={styles.loginTitle}>لوحة المدير التنفيذي الذكي</div>
          <div style={styles.loginSubtitle}>لوحة التحكم التنفيذية لخليدية</div>
          <input
            style={styles.input}
            placeholder="اسم المستخدم"
            value={user}
            onChange={e => setUser(e.target.value)}
            autoFocus
            autoComplete="username"
            dir="rtl"
          />
          <input
            style={styles.input}
            type="password"
            placeholder="كلمة المرور"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={handlePassKey}
            ref={passRef}
            autoComplete="current-password"
            dir="rtl"
          />
          {authError && <div style={styles.error}>{authError}</div>}
          <button
            type="submit"
            style={styles.button}
            disabled={!user || !pass}
          >
            دخول
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{...styles.bg, direction: "rtl"}}>
      <div style={{...styles.dashboardWrap, direction: "rtl"}}>
        {/* شريط الحالة العلوي */}
        <div style={styles.statusBar}>
          <span style={styles.statusBadge}>المدير التنفيذي الذكي</span>
          <span style={styles.statusPill}>متصل</span>
          <span style={styles.statusText}>لوحة التحكم التنفيذية لخليدية</span>
          <span style={styles.statusTime}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* بطاقات النظرة العامة */}
        <div style={styles.overviewRow}>
          <div style={styles.overviewCard}>
            <div style={styles.overviewTitle}>صحة النظام</div>
            {healthLoading ? (
              <div style={styles.overviewValue}>جاري التحميل...</div>
            ) : healthError ? (
              <div style={styles.overviewValue}>{healthError}</div>
            ) : healthData ? (
              <>
                <div style={styles.overviewValue}>{healthData.ok ? "سليم" : "يوجد مشاكل"}</div>
                <div style={styles.overviewSub}>{healthData.message}</div>
                <div style={styles.overviewSub}>{healthData.timestamp && new Date(healthData.timestamp).toLocaleString("ar-EG")}</div>
              </>
            ) : (
              <div style={styles.overviewValue}>لا توجد بيانات</div>
            )}
            <button style={styles.overviewButton} onClick={() => loadHealth()} disabled={healthLoading}>إعادة تحميل</button>
          </div>
          <div style={styles.overviewCard}>
            <div style={styles.overviewTitle}>حالة المدير</div>
            <div style={styles.overviewValue}>نشط</div>
            <div style={styles.overviewSub}>جاهز لاستقبال الأوامر التنفيذية</div>
          </div>
          <div style={styles.overviewCard}>
            <div style={styles.overviewTitle}>حالة الوكلاء</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {AGENTS.map(agent => (
                <span key={agent.name} style={{ ...styles.agentChip, background: agent.color }}>{agent.label}</span>
              ))}
            </div>
            <div style={styles.overviewSub}>جميع الوكلاء متاحون</div>
          </div>
        </div>

        {/* لوحات الأوامر والتحليل */}
        <div style={styles.actionPanels}>
          {/* لوحة الأوامر */}
          <div style={styles.actionCard}>
            <div style={styles.actionTitle}>لوحة الأوامر</div>
            <textarea
              style={styles.textarea}
              value={command}
              onChange={e => setCommand(e.target.value)}
              placeholder="اكتب الأمر التنفيذي هنا..."
              disabled={commandLoading}
              rows={4}
              dir="rtl"
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
                {commandLoading ? "جارٍ التنفيذ..." : "تنفيذ الأمر"}
              </button>
              <button
                style={styles.secondary}
                onClick={clearCommand}
                disabled={commandLoading}
              >
                مسح
              </button>
              {commandResponse && (
                <button
                  style={styles.copyBtn}
                  onClick={() => copyToClipboard(commandResponse)}
                  type="button"
                >نسخ</button>
              )}
            </div>
            <div style={styles.responsePanel}>
              {commandLoading && !commandResponse ? (
                <span style={{ color: "#7fd7ff" }}>بانتظار الاستجابة...</span>
              ) : (
                <pre style={styles.console}>{commandResponse}</pre>
              )}
            </div>
          </div>

          {/* لوحة التحليل */}
          <div style={styles.actionCard}>
            <div style={styles.actionTitle}>لوحة التحليل</div>
            <textarea
              style={styles.textarea}
              value={analysisPrompt}
              onChange={e => setAnalysisPrompt(e.target.value)}
              placeholder="اكتب طلب التحليل هنا..."
              disabled={analysisLoading}
              rows={4}
              dir="rtl"
            />
            <div style={styles.actionButtonsRow}>
              <button
                style={styles.suggestedBtn}
                type="button"
                onClick={() => setAnalysisPrompt(SUGGESTED_ANALYSIS)}
                disabled={analysisLoading}
              >
                استخدام أمر مقترح
              </button>
            </div>
            <div style={styles.actionButtonsRow}>
              <button
                style={styles.button}
                onClick={runAnalysis}
                disabled={analysisLoading || !analysisPrompt.trim()}
              >
                {analysisLoading ? "جارٍ التنفيذ..." : "تنفيذ التحليل"}
              </button>
              <button
                style={styles.secondary}
                onClick={clearAnalysis}
                disabled={analysisLoading}
              >
                مسح
              </button>
              {analysisResponse && (
                <button
                  style={styles.copyBtn}
                  onClick={() => copyToClipboard(analysisResponse)}
                  type="button"
                >نسخ</button>
              )}
            </div>
            <div style={styles.responsePanel}>
              {analysisLoading && !analysisResponse ? (
                <span style={{ color: "#7fd7ff" }}>بانتظار الاستجابة...</span>
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