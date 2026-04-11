import { useState, useRef, useEffect } from "react";

const ARIA_SYSTEM_PROMPT = `Tu es ARIA (Assistant Responsable d'Initiation à l'IA), un formateur expert passionné, spécialiste de la vulgarisation technologique pour les jeunes du secondaire (12–17 ans). Tu combines la rigueur d'un enseignant, l'énergie d'un mentor et la clarté d'un youtubeur tech.

TU N'ASSUMES JAMAIS que l'élève sait quoi que ce soit sur la technologie ou le code. Tout s'explique à partir de zéro, avec des analogies simples tirées de la vie quotidienne.

COMMENT TU PARLES :
→ Comme un grand frère ou grande sœur passionné(e) de tech, jamais comme un manuel
→ Tu utilises des références que les jeunes connaissent : TikTok, YouTube, Instagram, jeux vidéo, Netflix, Spotify, Discord
→ Tu célèbres chaque petite victoire avec enthousiasme sincère
→ Tu transformes CHAQUE erreur en moment d'apprentissage
→ Tu poses des questions de vérification toutes les 5-10 minutes
→ Si quelqu'un ne comprend pas, tu reformules avec UNE ANALOGIE COMPLÈTEMENT DIFFÉRENTE
→ Tu n'utilises jamais de jargon sans l'expliquer IMMÉDIATEMENT

FORMATION — 12 COURS :
MODULE 1 — FONDATIONS
Cours 1 : C'est quoi l'IA vraiment ? (comptes gratuits, comparatif des 3 IA)
Cours 2 : L'art du prompt niveau 1 (structure RCTFC, templates)
Cours 3 : Prompt niveau 2 + IA de texte (Perplexity, tuteur personnalisé)

MODULE 2 — CRÉATION VISUELLE
Cours 4 : IA d'image (Adobe Firefly, Canva IA, Ideogram)
Cours 5 : IA musique & voix (Suno, ElevenLabs)

MODULE 3 — VIDÉO & CODE SANS CODER
Cours 6 : IA vidéo (Kling, Pika, CapCut)
Cours 7 : Coder sans coder — vibe coding (Bolt.new)
Cours 8 : IA assistant personnel (NotebookLM, system prompt)

MODULE 4 — AVANCÉ & ÉTHIQUE
Cours 9 : IA multimodale — combiner tous les outils
Cours 10 : IA & métiers du futur
Cours 11 : IA & éthique — regard critique

MODULE 5 — PROJET FINAL
Cours 12 : Mon chef-d'œuvre IA (5 options de projets)

STRUCTURE OBLIGATOIRE DE CHAQUE COURS (fournie automatiquement) :
1. FICHE DE COURS : objectifs en langage élève, lexique avec analogies, contenu théorique, fiche mémo
2. TUTORIELS STEP-BY-STEP : pour chaque TP, instructions ultra-détaillées avec description de l'interface, boutons exacts, solutions aux erreurs, prompts prêts à copier, version facile + version défi
3. MINI-PROJET : mission engageante, étapes guidées, prompts de départ, critères de réussite
4. CHECKPOINT : quiz de 5 questions, réflexion personnelle, teaser du prochain cours

RÈGLES ABSOLUES :
→ JAMAIS de jargon sans explication immédiate avec analogie
→ JAMAIS d'assumption sur les connaissances de l'élève
→ TOUJOURS commencer par "pourquoi c'est utile pour toi ?"
→ TOUJOURS terminer avec quelque chose que l'élève a créé
→ Si bloqué : méthode des 3 reformulations avec analogies différentes

QUAND UN ÉLÈVE REVIENT (contexte de reprise fourni) :
→ Accueille-le chaleureusement par son prénom
→ Fais un bref résumé positif de ce qu'il a déjà accompli
→ Propose de continuer là où il s'est arrêté OU de revoir un cours précédent
→ Ne recommence jamais depuis le début sans que l'élève le demande

DÉMARRAGE PREMIÈRE FOIS : Présente-toi comme ARIA avec une accroche percutante, présente les 12 cours, puis pose ces questions une à une en attendant chaque réponse : prénom, année du secondaire, ce qu'il connaît déjà de l'IA, ce qui l'attire dans la formation, ce qu'il veut savoir créer à la fin. Puis personnalise le cours 1 selon les réponses.`;

const COURSES = [
  { id: 1, title: "C'est quoi l'IA vraiment ?", module: 1 },
  { id: 2, title: "L'art du prompt", module: 1 },
  { id: 3, title: "Prompt avancé + IA texte", module: 1 },
  { id: 4, title: "IA d'image", module: 2 },
  { id: 5, title: "IA musique & voix", module: 2 },
  { id: 6, title: "IA vidéo", module: 3 },
  { id: 7, title: "Coder sans coder", module: 3 },
  { id: 8, title: "Assistant personnel", module: 3 },
  { id: 9, title: "IA multimodale", module: 4 },
  { id: 10, title: "IA & métiers du futur", module: 4 },
  { id: 11, title: "IA & éthique", module: 4 },
  { id: 12, title: "Projet final", module: 5 },
];

const MODULE_LABELS = {
  1: "Fondations", 2: "Création visuelle",
  3: "Vidéo & Code", 4: "Avancé & Éthique", 5: "Projet final",
};

const MODULE_COLORS = {
  1: { bg: "#E6F1FB", border: "#85B7EB", text: "#0C447C" },
  2: { bg: "#EEEDFE", border: "#AFA9EC", text: "#3C3489" },
  3: { bg: "#FAEEDA", border: "#EF9F27", text: "#633806" },
  4: { bg: "#E1F5EE", border: "#5DCAA5", text: "#085041" },
  5: { bg: "#FAECE7", border: "#F0997B", text: "#712B13" },
};

function getStorageKey(studentId) {
  return `aria_student_${studentId.toLowerCase().replace(/\s+/g, "_")}`;
}

function loadStudentData(studentId) {
  try {
    const raw = localStorage.getItem(getStorageKey(studentId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveStudentData(studentId, data) {
  try {
    localStorage.setItem(getStorageKey(studentId), JSON.stringify(data));
  } catch {}
}

function getAllStudents() {
  try {
    const students = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("aria_student_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          students.push(data);
        }
      }
    }
    return students.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  } catch { return []; }
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "10px 14px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "var(--color-text-tertiary)",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function ProgressBadge({ completed }) {
  const pct = Math.round((completed / 12) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "var(--color-border-tertiary)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#7F77DD", borderRadius: 4, transition: "width .3s" }} />
      </div>
      <span style={{ fontSize: 11, color: "var(--color-text-secondary)", minWidth: 36 }}>{completed}/12</span>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("identity");
  const [studentId, setStudentId] = useState("");
  const [inputId, setInputId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [knownStudents, setKnownStudents] = useState([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setKnownStudents(getAllStudents());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const persistData = (id, msgs, completedCourses, name) => {
    const data = {
      id,
      name: name || id,
      messages: msgs.slice(-60),
      completedCourses: completedCourses || [],
      lastSeen: Date.now(),
    };
    saveStudentData(id, data);
    setStudentData(data);
  };

  const startSession = async (id, isReturning, existingData) => {
    setStudentId(id);
    setScreen("chat");

    if (isReturning && existingData && existingData.messages.length > 0) {
      setMessages(existingData.messages);
      setStudentData(existingData);
      setLoading(true);
      const resumeMsg = `L'élève ${existingData.name} revient sur ARIA. Voici un résumé de sa progression : il/elle a eu ${existingData.messages.length} échanges avec toi et a complété ${(existingData.completedCourses || []).length} cours. Accueille-le/la chaleureusement par son prénom, fais un bref récap positif de ce qu'il/elle a accompli, et propose de continuer là où il/elle s'était arrêté(e).`;
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: ARIA_SYSTEM_PROMPT,
            messages: [...existingData.messages, { role: "user", content: resumeMsg }],
          }),
        });
        const data = await res.json();
        const reply = data.content?.map(b => b.text || "").join("") || "";
        const newMsgs = [...existingData.messages, { role: "assistant", content: reply }];
        setMessages(newMsgs);
        persistData(id, newMsgs, existingData.completedCourses, existingData.name);
      } catch {
        setMessages(prev => [...prev, { role: "assistant", content: "Bon retour ! Prêt(e) à continuer ?" }]);
      }
      setLoading(false);
    } else {
      setLoading(true);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: ARIA_SYSTEM_PROMPT,
            messages: [{ role: "user", content: "Démarre la session et présente-toi." }],
          }),
        });
        const data = await res.json();
        const reply = data.content?.map(b => b.text || "").join("") || "Salut ! Je suis ARIA.";
        const initMsgs = [{ role: "assistant", content: reply }];
        setMessages(initMsgs);
        persistData(id, initMsgs, [], id);
      } catch {
        setMessages([{ role: "assistant", content: "Erreur de connexion. Vérifie ta connexion Internet." }]);
      }
      setLoading(false);
    }
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    const completedCourses = studentData?.completedCourses || [];
    const courseMatch = userMsg.match(/cours\s+(\d+)/i);
    if (courseMatch) {
      const num = parseInt(courseMatch[1]);
      if (num >= 1 && num <= 12 && !completedCourses.includes(num - 1) && num > 1) {
        completedCourses.push(num - 1);
      }
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: ARIA_SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Je n'ai pas pu répondre.";
      const finalMsgs = [...newMessages, { role: "assistant", content: reply }];
      setMessages(finalMsgs);

      const nameMatch = userMsg.match(/(?:je m'appelle|mon nom est|c'est|moi c'est|appelle-moi)\s+([A-ZÀ-Ÿa-zà-ÿ]+)/i)
        || (newMessages.length <= 4 && userMsg.split(" ").length === 1 ? [null, userMsg] : null);
      const detectedName = nameMatch ? nameMatch[1] : (studentData?.name || studentId);

      persistData(studentId, finalMsgs, completedCourses, detectedName);
    } catch {
      const errMsgs = [...newMessages, { role: "assistant", content: "Erreur de connexion. Réessaie dans un instant." }];
      setMessages(errMsgs);
      persistData(studentId, errMsgs, studentData?.completedCourses || [], studentData?.name || studentId);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const jumpToCourse = (course) => {
    setSidebarOpen(false);
    const completedCourses = studentData?.completedCourses || [];
    if (!completedCourses.includes(course.id)) {
      completedCourses.push(course.id);
      persistData(studentId, messages, completedCourses, studentData?.name);
    }
    sendMessage(`Démarre le cours ${course.id} : "${course.title}". Fournis le matériel didactique complet : fiche de cours, lexique, contenu théorique, fiche mémo, et les tutoriels step-by-step pour tous les TPs avec le mini-projet.`);
  };

  const resetStudent = () => {
    if (confirm("Effacer toute la progression ? Cette action est irréversible.")) {
      try { localStorage.removeItem(getStorageKey(studentId)); } catch {}
      setMessages([]);
      setStudentData(null);
      setScreen("identity");
      setInputId("");
    }
  };

  const formatMessage = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h2 key={i} style={{ fontSize: 16, fontWeight: 500, margin: "10px 0 4px", color: "var(--color-text-primary)" }}>{line.slice(2)}</h2>;
      if (line.startsWith("## ")) return <h3 key={i} style={{ fontSize: 14, fontWeight: 500, margin: "8px 0 3px", color: "var(--color-text-primary)" }}>{line.slice(3)}</h3>;
      if (line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{ fontWeight: 500, margin: "4px 0", color: "var(--color-text-primary)" }}>{line.slice(2, -2)}</div>;
      if (line.startsWith("→ ") || line.startsWith("• ")) return <div key={i} style={{ paddingLeft: 14, margin: "2px 0", display: "flex", gap: 6, color: "var(--color-text-primary)" }}><span style={{ color: "#7F77DD", flexShrink: 0 }}>→</span><span>{line.slice(2)}</span></div>;
      if (line.startsWith("╔") || line.startsWith("║") || line.startsWith("╚") || line.startsWith("┌") || line.startsWith("│") || line.startsWith("└")) {
        return <div key={i} style={{ fontFamily: "monospace", fontSize: 12, color: "var(--color-text-secondary)", margin: "1px 0", whiteSpace: "pre" }}>{line}</div>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 5 }} />;
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <div key={i} style={{ margin: "2px 0", lineHeight: 1.65, color: "var(--color-text-primary)" }} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  // ── ÉCRAN D'IDENTIFICATION ──
  if (screen === "identity") {
    return (
      <div style={{ minHeight: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", gap: 20 }}>
        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>

        <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#EEEDFE", border: "2px solid #AFA9EC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 26 }}>🤖</div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 6px" }}>ARIA — Formateur IA</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 20px" }}>Entre ton prénom pour retrouver ta progression ou commencer</p>

          {knownStudents.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Profils enregistrés sur cet appareil</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {knownStudents.slice(0, 4).map(s => (
                  <button key={s.id} onClick={() => startSession(s.id, true, s)}
                    style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, fontWeight: 500, color: "#3C3489" }}>
                      {(s.name || s.id).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.name || s.id}</div>
                      <ProgressBadge completed={(s.completedCourses || []).length} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", flexShrink: 0 }}>
                      {s.lastSeen ? new Date(s.lastSeen).toLocaleDateString("fr-CA", { month: "short", day: "numeric" }) : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={inputId}
              onChange={e => setInputId(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && inputId.trim()) { const existing = loadStudentData(inputId.trim()); startSession(inputId.trim(), !!existing, existing); } }}
              placeholder="Ton prénom (ex: Sofia, Marcus...)"
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, outline: "none" }}
              autoFocus
            />
            <button
              onClick={() => { if (inputId.trim()) { const existing = loadStudentData(inputId.trim()); startSession(inputId.trim(), !!existing, existing); } }}
              disabled={!inputId.trim()}
              style={{ padding: "10px 16px", background: "#7F77DD", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", opacity: inputId.trim() ? 1 : .4 }}>
              →
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "10px 0 0" }}>
            Ta progression est sauvegardée automatiquement sur cet appareil
          </p>
        </div>
      </div>
    );
  }

  // ── ÉCRAN DE CHAT ──
  return (
    <div style={{ display: "flex", height: 580, fontFamily: "var(--font-sans)", overflow: "hidden", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14 }}>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        .msg-user { background: #7F77DD; color: #fff; border-radius: 14px 14px 4px 14px; align-self: flex-end; max-width: 82%; padding: 10px 14px; font-size: 13.5px; line-height: 1.55; }
        .msg-aria { background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); border-radius: 14px 14px 14px 4px; align-self: flex-start; max-width: 92%; padding: 12px 15px; font-size: 13px; }
        .course-btn { background: none; border: 0.5px solid var(--color-border-tertiary); border-radius: 8px; padding: 7px 10px; text-align: left; cursor: pointer; transition: background .15s; width: 100%; margin-bottom: 3px; }
        .course-btn:hover { background: var(--color-background-secondary); }
        .course-btn.done { border-left: 3px solid #7F77DD; }
        textarea { resize: none; outline: none; border: 0.5px solid var(--color-border-secondary); border-radius: 8px; padding: 9px 12px; font-size: 14px; font-family: var(--font-sans); background: var(--color-background-primary); color: var(--color-text-primary); width: 100%; line-height: 1.5; }
        textarea:focus { border-color: #7F77DD; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: var(--color-border-secondary); border-radius: 4px; }
      `}</style>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={{ width: 210, borderRight: "0.5px solid var(--color-border-tertiary)", overflowY: "auto", padding: "10px 8px", flexShrink: 0, background: "var(--color-background-primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>PROGRESSION</span>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", fontSize: 16, lineHeight: 1 }}>×</button>
          </div>

          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>
              {studentData?.name || studentId}
            </div>
            <ProgressBadge completed={(studentData?.completedCourses || []).length} />
          </div>

          {[1, 2, 3, 4, 5].map(mod => (
            <div key={mod} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-tertiary)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 4 }}>
                {MODULE_LABELS[mod]}
              </div>
              {COURSES.filter(c => c.module === mod).map(c => {
                const done = (studentData?.completedCourses || []).includes(c.id);
                const col = MODULE_COLORS[mod];
                return (
                  <button key={c.id} className={`course-btn${done ? " done" : ""}`} onClick={() => jumpToCourse(c)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: done ? "#7F77DD" : col.bg, border: `1px solid ${done ? "#7F77DD" : col.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 9, color: done ? "#fff" : col.text, fontWeight: 500 }}>
                        {done ? "✓" : c.id}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--color-text-primary)", fontWeight: done ? 500 : 400 }}>{c.title}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          <button onClick={resetStudent} style={{ width: "100%", marginTop: 8, padding: "7px", background: "none", border: "0.5px solid var(--color-border-danger)", borderRadius: 8, color: "var(--color-text-danger)", fontSize: 11, cursor: "pointer" }}>
            Effacer ma progression
          </button>
        </div>
      )}

      {/* CHAT PRINCIPAL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* HEADER */}
        <div style={{ padding: "9px 12px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 12, flexShrink: 0 }}>
            ☰ Cours
          </button>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              ARIA — {studentData?.name || studentId}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
              {(studentData?.completedCourses || []).length}/12 cours · {messages.length} échanges
            </div>
          </div>
          <button onClick={() => { setScreen("identity"); setMessages([]); setStudentData(null); setStudentId(""); setInputId(""); setKnownStudents(getAllStudents()); }}
            style={{ background: "none", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 11, flexShrink: 0 }}>
            Changer
          </button>
        </div>

        {/* MESSAGES */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "msg-user" : "msg-aria"}>
              {m.role === "assistant" && (
                <div style={{ fontSize: 10, fontWeight: 500, color: "#7F77DD", marginBottom: 5, letterSpacing: ".04em" }}>ARIA</div>
              )}
              {formatMessage(m.content)}
            </div>
          ))}
          {loading && (
            <div className="msg-aria">
              <div style={{ fontSize: 10, fontWeight: 500, color: "#7F77DD", marginBottom: 2 }}>ARIA</div>
              <TypingIndicator />
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* INPUT */}
        <div style={{ padding: "9px 12px", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", gap: 7, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Écris ta réponse ou pose une question… (Entrée pour envoyer)"
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            style={{ height: 44, width: 40, background: input.trim() && !loading ? "#7F77DD" : "var(--color-border-tertiary)", color: "#fff", border: "none", borderRadius: 8, cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 16, flexShrink: 0, transition: "background .2s" }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
