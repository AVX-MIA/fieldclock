import { useState, useEffect, useCallback } from "react";
import {
  collection, addDoc, updateDoc, doc, onSnapshot,
  query, orderBy, setDoc, getDocs, deleteDoc
} from "firebase/firestore";
import { db } from "./firebase.js";

// ─── Helpers ────────────────────────────────────────────────
function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
function formatDuration(ms) {
  if (!ms || ms < 0) return "0m";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function mapsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// ─── Quick Entry Types ───────────────────────────────────────
const QUICK_TYPES = [
  { id: "work",   label: "Work",   icon: "🔧", color: "#22d3a0", border: "rgba(34,211,160,0.4)",  bg: "rgba(34,211,160,0.10)" },
  { id: "travel", label: "Travel", icon: "🚗", color: "#38bdf8", border: "rgba(56,189,248,0.4)",  bg: "rgba(56,189,248,0.10)" },
  { id: "lunch",  label: "Lunch",  icon: "🍽",  color: "#fb923c", border: "rgba(251,146,60,0.4)",  bg: "rgba(251,146,60,0.10)"  },
  { id: "break",  label: "Break",  icon: "☕",  color: "#a78bfa", border: "rgba(167,139,250,0.4)", bg: "rgba(167,139,250,0.10)" },
];
const S = {
  input: {
    width: "100%", background: "#0a0f1c", border: "1px solid #1e3a5f",
    borderRadius: 10, color: "#f1f5f9", padding: "13px 16px",
    fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  },
  label: { fontSize: 10, letterSpacing: "0.12em", color: "#64748b", display: "block", marginBottom: 8 },
  card: {
    background: "#0a0f1c", border: "1px solid #1e3a5f",
    borderRadius: 12, padding: "16px 20px",
  },
  btnGreen: {
    padding: "15px", borderRadius: 12, border: "1px solid rgba(34,211,160,0.4)",
    background: "rgba(34,211,160,0.12)", color: "#22d3a0", fontSize: 14,
    fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.08em",
    cursor: "pointer", width: "100%",
  },
  btnRed: {
    padding: "15px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.4)",
    background: "rgba(239,68,68,0.12)", color: "#f87171", fontSize: 14,
    fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.08em",
    cursor: "pointer", width: "100%",
  },
};

// ════════════════════════════════════════════════════════════
//  LOGIN SCREEN
// ════════════════════════════════════════════════════════════
function LoginScreen({ employees, onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleDigit(d) { if (pin.length < 4) setPin(p => p + d); }
  function handleDel() { setPin(p => p.slice(0, -1)); setError(""); }

  useEffect(() => {
    if (pin.length === 4) {
      setLoading(true);
      setTimeout(() => {
        const match = employees.find(e => e.pin === pin);
        if (match) { onLogin(match); }
        else { setError("Incorrect PIN"); setPin(""); }
        setLoading(false);
      }, 300);
    }
  }, [pin, employees, onLogin]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#22d3a0,#0ea5e9)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>⏱</div>
      <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "0.1em", color: "#f1f5f9", marginBottom: 4 }}>APS FIELDCLOCK</div>
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.14em", marginBottom: 40 }}>ENTER YOUR PIN</div>

      {/* PIN dots */}
      <div style={{ display: "flex", gap: 14, marginBottom: 32 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: "50%",
            border: "2px solid",
            borderColor: pin.length > i ? "#22d3a0" : "#1e3a5f",
            background: pin.length > i ? "#22d3a0" : "transparent",
            transition: "all 0.15s",
            boxShadow: pin.length > i ? "0 0 8px #22d3a0" : "none",
          }} />
        ))}
      </div>

      {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 20 }}>{error}</div>}

      {/* Numpad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 12 }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d, i) => (
          <button key={i} onClick={() => d === "⌫" ? handleDel() : d !== "" && handleDigit(String(d))}
            disabled={loading || d === ""}
            style={{
              height: 72, borderRadius: 14,
              border: "1px solid",
              borderColor: d === "" ? "transparent" : "#1e3a5f",
              background: d === "" ? "transparent" : "#0a0f1c",
              color: d === "⌫" ? "#64748b" : "#f1f5f9",
              fontSize: d === "⌫" ? 20 : 22,
              fontFamily: "inherit",
              fontWeight: 500,
              cursor: d === "" ? "default" : "pointer",
              transition: "all 0.1s",
            }}>{d}</button>
        ))}
      </div>

      <div style={{ marginTop: 40, fontSize: 11, color: "#334155", textAlign: "center" }}>
        Contact your admin if you forgot your PIN
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null); // logged-in employee obj
  const [view, setView] = useState("clock");
  const [ticket, setTicket] = useState("");
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [entryType, setEntryType] = useState("work"); // work | lunch | break | travel
  const [statusMsg, setStatusMsg] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date());
  const [loadingDb, setLoadingDb] = useState(true);
  // Admin
  const [adminPinInput, setAdminPinInput] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const ADMIN_PIN = "4376"; // Change this in code before deploying!
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpPin, setNewEmpPin] = useState("");
  const [filterEmp, setFilterEmp] = useState("all");

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Subscribe to Firestore employees
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "employees"), snap => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Subscribe to Firestore records
  useEffect(() => {
    const q = query(collection(db, "timeRecords"), orderBy("clockIn", "desc"));
    const unsub = onSnapshot(q, snap => {
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingDb(false);
    });
    return unsub;
  }, []);

  function flash(type, msg) {
    setStatusMsg({ type, msg });
    setTimeout(() => setStatusMsg(null), 4000);
  }

  const currentRecord = user ? records.find(r => r.employeeId === user.id && !r.clockOut) : null;

  async function handleClockIn() {
    if (!user) return;
    if (currentRecord) return flash("error", "You are already clocked in.");
    if (entryType === "work" && !address.trim()) return flash("error", "Please enter the job site address.");
    flash("loading", "Saving…");
    try {
      await addDoc(collection(db, "timeRecords"), {
        employeeId: user.id,
        employeeName: user.name,
        clockIn: Date(),
        entryType,
        clockInAddress: entryType === "work" ? address.trim() : null,
        customer: entryType === "work" ? customer.trim() : "",
        ticket: entryType === "work" ? ticket.trim() : "",
        note: note.trim(),
        clockOut: null,
        clockOutAddress: null,
      });
      setTicket(""); setCustomer(""); setAddress(""); setNote("");
      flash("success", `✓ Clocked IN — ${entryType.toUpperCase()} at ${formatTime(Date.now())}`);
    } catch (e) {
      flash("error", "Save failed: " + (e.message || "Check your connection."));
    }
  }

  async function handleClockOut() {
    if (!user || !currentRecord) return flash("error", "You are not clocked in.");
    // Clock out at same address as clock-in (they're leaving the same site)
    flash("loading", "Saving…");
    try {
      await updateDoc(doc(db, "timeRecords", currentRecord.id), {
        clockOut: Date(),
        clockOutAddress: currentRecord.clockInAddress || null,
      });
      flash("success", `✓ Clocked OUT — ${formatDuration(Date.now() - currentRecord.clockIn)} shift`);
    } catch (e) {
      flash("error", "Save failed: " + (e.message || "Check your connection."));
    }
  }

  async function addEmployee() {
    const name = newEmpName.trim();
    const pin = newEmpPin.trim();
    if (!name || pin.length !== 4 || !/^\d+$/.test(pin)) return flash("error", "Name required + 4-digit PIN.");
    if (employees.some(e => e.pin === pin)) return flash("error", "PIN already in use.");
    await addDoc(collection(db, "employees"), { name, pin });
    setNewEmpName(""); setNewEmpPin("");
  }

  async function removeEmployee(id) {
    if (!confirm("Remove this employee?")) return;
    await deleteDoc(doc(db, "employees", id));
  }

  const activeEmployees = employees.filter(e => records.some(r => r.employeeId === e.id && !r.clockOut));
  const filteredRecords = filterEmp === "all" ? records : records.filter(r => r.employeeId === filterEmp);

  // ── Not logged in ──────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ background: "#0a0f1c", minHeight: "100vh" }}>
        <LoginScreen employees={employees} onLogin={setUser} />
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────
  const isAdmin = user.name === "Admin" || adminAuthed;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1c", fontFamily: "'DM Mono', monospace", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        borderBottom: "1px solid #1e3a5f",
        padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60, position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#22d3a0,#0ea5e9)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⏱</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", color: "#f1f5f9" }}>APS FIELDCLOCK</div>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>{user.name.toUpperCase()}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#22d3a0", fontVariantNumeric: "tabular-nums" }}>
            {liveTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <button onClick={() => { setUser(null); setAdminAuthed(false); setView("clock"); }} style={{
            background: "transparent", border: "1px solid #1e3a5f", borderRadius: 7,
            color: "#64748b", fontSize: 11, fontFamily: "inherit", padding: "5px 10px", cursor: "pointer", letterSpacing: "0.08em",
          }}>LOG OUT</button>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 4, padding: "10px 20px 0", background: "#0a0f1c" }}>
        {[["clock", "⏱ Clock"], ["log", "📋 Log"], ["admin", "⚙ Admin"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} style={{
            padding: "7px 16px", borderRadius: "8px 8px 0 0",
            border: "1px solid", borderBottom: "none",
            borderColor: view === id ? "#1e3a5f" : "transparent",
            background: view === id ? "#0f172a" : "transparent",
            color: view === id ? "#22d3a0" : "#64748b",
            cursor: "pointer", fontSize: 12, fontFamily: "inherit",
            letterSpacing: "0.06em", fontWeight: view === id ? 600 : 400,
          }}>{label}</button>
        ))}
      </nav>

      <main style={{ flex: 1, padding: 20, background: "#0f172a", borderTop: "1px solid #1e3a5f" }}>

        {/* ── CLOCK ─────────────────────────────────────── */}
        {view === "clock" && (
          <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Active badge */}
            {currentRecord ? (
              (() => {
                const qt = QUICK_TYPES.find(q => q.id === (currentRecord.entryType || "work")) || QUICK_TYPES[0];
                return (
                  <div style={{ ...S.card, border: `1px solid ${qt.border}`, background: qt.bg.replace("0.10","0.05") }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: qt.color, display: "inline-block", boxShadow: `0 0 8px ${qt.color}`, animation: "pulse 2s infinite" }} />
                      <span style={{ color: qt.color, fontWeight: 700, fontSize: 13, letterSpacing: "0.08em" }}>{qt.icon} {qt.label.toUpperCase()} — CLOCKED IN</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", flexDirection: "column", gap: 4 }}>
                      <span>Since: <b style={{ color: "#e2e8f0" }}>{formatDate(currentRecord.clockIn)} {formatTime(currentRecord.clockIn)}</b></span>
                      {currentRecord.customer && <span>Customer: <b style={{ color: "#e2e8f0" }}>{currentRecord.customer}</b></span>}
                      {currentRecord.ticket && <span>Ticket: <b style={{ color: "#e2e8f0" }}>#{currentRecord.ticket}</b></span>}
                      {currentRecord.clockInAddress && (
                        <span>Address: <a href={mapsUrl(currentRecord.clockInAddress)} target="_blank" rel="noopener noreferrer"
                          style={{ color: "#0ea5e9" }}>{currentRecord.clockInAddress} →</a></span>
                      )}
                      {currentRecord.note && <span>Note: <b style={{ color: "#e2e8f0" }}>{currentRecord.note}</b></span>}
                      <span>Duration: <b style={{ color: qt.color }}>{formatDuration(liveTime - currentRecord.clockIn)}</b></span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div style={{ ...S.card, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#475569" }}>You are currently <b style={{ color: "#f87171" }}>clocked out</b></div>
              </div>
            )}

            {/* Quick type selector */}
            {!currentRecord && (
              <>
                <div>
                  <label style={S.label}>CLOCK IN TYPE</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    {QUICK_TYPES.map(qt => (
                      <button key={qt.id} onClick={() => setEntryType(qt.id)} style={{
                        padding: "12px 6px",
                        borderRadius: 10,
                        border: `1px solid ${entryType === qt.id ? qt.border : "#1e3a5f"}`,
                        background: entryType === qt.id ? qt.bg : "transparent",
                        color: entryType === qt.id ? qt.color : "#475569",
                        fontFamily: "inherit",
                        fontSize: 11,
                        fontWeight: entryType === qt.id ? 700 : 400,
                        letterSpacing: "0.06em",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s",
                      }}>
                        <span style={{ fontSize: 20 }}>{qt.icon}</span>
                        {qt.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Work-only fields */}
                {entryType === "work" && (
                  <>
                    <div>
                      <label style={S.label}>CUSTOMER NAME <span style={{ color: "#334155" }}>(optional)</span></label>
                      <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="e.g. Smith Residence" style={S.input} />
                    </div>
                    <div>
                      <label style={S.label}>SERVICE TICKET # <span style={{ color: "#334155" }}>(optional)</span></label>
                      <input value={ticket} onChange={e => setTicket(e.target.value)} placeholder="e.g. TK-1042" style={S.input} />
                    </div>
                    <div>
                      <label style={S.label}>JOB SITE ADDRESS <span style={{ color: "#f87171" }}>*</span></label>
                      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, City, State" style={S.input} />
                    </div>
                  </>
                )}

                {/* Travel-only fields */}
                {entryType === "travel" && (
                  <>
                    <div>
                      <label style={S.label}>DESTINATION <span style={{ color: "#334155" }}>(optional)</span></label>
                      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Main St or Customer Name" style={S.input} />
                    </div>
                  </>
                )}

                {/* Note — always visible */}
                <div>
                  <label style={S.label}>NOTE <span style={{ color: "#334155" }}>(optional)</span></label>
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder={
                    entryType === "lunch" ? "Where are you eating?" :
                    entryType === "break" ? "Any details..." :
                    entryType === "travel" ? "Vehicle, mileage start, etc." :
                    "Additional details…"
                  } style={S.input} />
                </div>
              </>
            )}

            {/* Status */}
            {statusMsg && (
              <div style={{
                padding: "12px 16px", borderRadius: 10, fontSize: 13, border: "1px solid",
                borderColor: statusMsg.type === "success" ? "rgba(34,211,160,0.4)" : statusMsg.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(14,165,233,0.4)",
                background: statusMsg.type === "success" ? "rgba(34,211,160,0.08)" : statusMsg.type === "error" ? "rgba(239,68,68,0.08)" : "rgba(14,165,233,0.08)",
                color: statusMsg.type === "success" ? "#22d3a0" : statusMsg.type === "error" ? "#f87171" : "#38bdf8",
              }}>{statusMsg.type === "loading" ? "⏳ " : ""}{statusMsg.msg}</div>
            )}

            {/* Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button onClick={handleClockIn} disabled={!!currentRecord || statusMsg?.type === "loading"} style={{ ...S.btnGreen, opacity: currentRecord ? 0.4 : 1 }}>▶ CLOCK IN</button>
              <button onClick={handleClockOut} disabled={!currentRecord || statusMsg?.type === "loading"} style={{ ...S.btnRed, opacity: !currentRecord ? 0.4 : 1 }}>■ CLOCK OUT</button>
            </div>

            {/* Other active employees */}
            {activeEmployees.filter(e => e.id !== user.id).length > 0 && (
              <div style={S.card}>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#64748b", marginBottom: 10 }}>OTHER ACTIVE EMPLOYEES</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {activeEmployees.filter(e => e.id !== user.id).map(e => (
                    <div key={e.id} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "rgba(34,211,160,0.08)", border: "1px solid rgba(34,211,160,0.25)",
                      borderRadius: 6, padding: "4px 10px", fontSize: 12,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3a0", display: "inline-block" }} />
                      <span style={{ color: "#22d3a0" }}>{e.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LOG ───────────────────────────────────────── */}
        {view === "log" && (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#64748b" }}>TIME RECORDS — {filteredRecords.length} ENTRIES</div>
              {adminAuthed && (
                <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} style={{
                  background: "#0a0f1c", border: "1px solid #1e3a5f", borderRadius: 8,
                  color: "#e2e8f0", padding: "7px 12px", fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer",
                }}>
                  <option value="all">All Employees</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              )}
            </div>

            {loadingDb ? (
              <div style={{ color: "#64748b", textAlign: "center", padding: 40 }}>Loading…</div>
            ) : filteredRecords.length === 0 ? (
              <div style={{ color: "#64748b", textAlign: "center", padding: 40 }}>No records yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(adminAuthed ? filteredRecords : filteredRecords.filter(r => r.employeeId === user.id)).map(r => {
                  const qt = QUICK_TYPES.find(q => q.id === (r.entryType || "work")) || QUICK_TYPES[0];
                  return (
                  <div key={r.id} style={{ ...S.card, display: "grid", gridTemplateColumns: "8px 1fr auto", gap: "0 16px", alignItems: "start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, background: r.clockOut ? "#334155" : qt.color, boxShadow: r.clockOut ? "none" : `0 0 6px ${qt.color}` }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        {adminAuthed && <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>{r.employeeName}</span>}
                        <span style={{ background: qt.bg, border: `1px solid ${qt.border}`, color: qt.color, borderRadius: 5, padding: "2px 8px", fontSize: 11 }}>{qt.icon} {qt.label}</span>
                        {r.ticket && (
                          <span style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)", color: "#38bdf8", borderRadius: 5, padding: "2px 8px", fontSize: 11 }}>#{r.ticket}</span>
                        )}
                        {!r.clockOut && <span style={{ background: "rgba(34,211,160,0.15)", border: "1px solid rgba(34,211,160,0.3)", color: "#22d3a0", borderRadius: 5, padding: "2px 7px", fontSize: 10 }}>● ACTIVE</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <span>📅 {formatDate(r.clockIn)}</span>
                        <span>▶ {formatTime(r.clockIn)}</span>
                        {r.clockOut && <span>■ {formatTime(r.clockOut)}</span>}
                        {r.clockOut
                          ? <span style={{ color: "#94a3b8" }}>⏱ {formatDuration(r.clockOut - r.clockIn)}</span>
                          : <span style={{ color: qt.color }}>⏱ {formatDuration(liveTime - r.clockIn)} live</span>}
                      </div>
                      {r.customer && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>👤 {r.customer}</div>}
                      {r.clockInAddress && (
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          <a href={mapsUrl(r.clockInAddress)} target="_blank" rel="noopener noreferrer"
                            style={{ color: "#0ea5e9", textDecoration: "none" }}>📍 {r.clockInAddress} →</a>
                        </div>
                      )}
                      {r.note && <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>📝 {r.note}</div>}
                    </div>
                    {r.clockOut && (
                      <div style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 8, padding: "6px 12px", textAlign: "center", minWidth: 60 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{formatDuration(r.clockOut - r.clockIn)}</div>
                        <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>TOTAL</div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN ─────────────────────────────────────── */}
        {view === "admin" && (
          <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {!adminAuthed ? (
              <div style={S.card}>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#64748b", marginBottom: 14 }}>ADMIN ACCESS</div>
                <input
                  type="password"
                  maxLength={4}
                  value={adminPinInput}
                  onChange={e => setAdminPinInput(e.target.value)}
                  placeholder="Enter admin PIN"
                  style={S.input}
                />
                <button onClick={() => {
                  if (adminPinInput === ADMIN_PIN) setAdminAuthed(true);
                  else { flash("error", "Wrong admin PIN."); setAdminPinInput(""); }
                }} style={{ ...S.btnGreen, marginTop: 12 }}>UNLOCK</button>
                {statusMsg && <div style={{ marginTop: 10, fontSize: 13, color: "#f87171" }}>{statusMsg.msg}</div>}
              </div>
            ) : (
              <>
                {/* Add employee */}
                <div style={S.card}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#64748b", marginBottom: 14 }}>ADD EMPLOYEE</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="Full name" style={S.input} />
                    <input value={newEmpPin} onChange={e => setNewEmpPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4-digit PIN" style={S.input} maxLength={4} />
                    <button onClick={addEmployee} style={S.btnGreen}>+ ADD EMPLOYEE</button>
                  </div>
                  {statusMsg && <div style={{ marginTop: 10, fontSize: 13, color: statusMsg.type === "error" ? "#f87171" : "#22d3a0" }}>{statusMsg.msg}</div>}
                </div>

                {/* Employee list */}
                <div style={S.card}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#64748b", marginBottom: 14 }}>EMPLOYEES ({employees.length})</div>
                  {employees.length === 0 ? (
                    <div style={{ color: "#334155", fontSize: 13, textAlign: "center", padding: "10px 0" }}>No employees yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {employees.map(e => {
                        const isActive = records.some(r => r.employeeId === e.id && !r.clockOut);
                        const empRecs = records.filter(r => r.employeeId === e.id && r.clockOut);
                        const totalMs = empRecs.reduce((s, r) => s + (r.clockOut - r.clockIn), 0);
                        return (
                          <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: isActive ? "#22d3a0" : "#334155", display: "inline-block", boxShadow: isActive ? "0 0 6px #22d3a0" : "none" }} />
                                <span style={{ color: "#f1f5f9", fontSize: 14 }}>{e.name}</span>
                                <span style={{ color: "#334155", fontSize: 11 }}>PIN: {e.pin}</span>
                              </div>
                              <div style={{ fontSize: 11, color: "#475569", marginTop: 3, paddingLeft: 15 }}>
                                {empRecs.length} shifts · {totalMs > 0 ? formatDuration(totalMs) : "0m"} logged
                              </div>
                            </div>
                            <button onClick={() => removeEmployee(e.id)} style={{
                              background: "transparent", border: "1px solid #2d3748", borderRadius: 6,
                              color: "#64748b", padding: "4px 10px", fontSize: 11, fontFamily: "inherit", cursor: "pointer",
                            }}>Remove</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div style={S.card}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#64748b", marginBottom: 14 }}>TODAY'S SUMMARY</div>
                  {(() => {
                    const today = new Date().toDateString();
                    const todayRecs = records.filter(r => new Date(r.clockIn).toDateString() === today);
                    const done = todayRecs.filter(r => r.clockOut);
                    const totalMs = done.reduce((s, r) => s + (r.clockOut - r.clockIn), 0);
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, textAlign: "center" }}>
                        {[["Active", activeEmployees.length, "#22d3a0"], ["Shifts", todayRecs.length, "#38bdf8"], ["Hours", done.length ? formatDuration(totalMs) : "0m", "#a78bfa"]].map(([l, v, c]) => (
                          <div key={l}><div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</div><div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>{l}</div></div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Export */}
                <div style={S.card}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#64748b", marginBottom: 12 }}>EXPORT</div>
                  <button onClick={() => {
                    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob); a.download = `fieldclock-${Date.now()}.json`; a.click();
                  }} style={{ background: "transparent", border: "1px solid #1e3a5f", borderRadius: 8, color: "#94a3b8", padding: "8px 16px", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
                    ⬇ Export All Records (JSON)
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        button:active { opacity: 0.7 !important; }
        select option { background: #0a0f1c; }
        input::placeholder { color: #334155; }
        a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
