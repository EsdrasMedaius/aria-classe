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

DÉMARRAGE : Présente-toi comme ARIA avec une accroche percutante, présente les 12 cours, puis pose ces questions une à une en attendant chaque réponse : prénom, année du secondaire, ce qu'il connaît déjà de l'IA, ce qui l'attire dans la formation, ce qu'il veut savoir créer à la fin. Puis personnalise le cours 1 selon les réponses.`;

const COURSES = [
  { id: 1, title: "C'est quoi l'IA vraiment ?", module: 1, color: "#E6F1FB", border: "#85B7EB", text: "#0C447C" },
  { id: 2, title: "L'art du prompt", module: 1, color: "#E6F1FB", border: "#85B7EB", text: "#0C447C" },
  { id: 3, title: "Prompt avancé + IA texte", module: 1, color: "#E6F1FB", border: "#85B7EB", text: "#0C447C" },
  { id: 4, title: "IA d'image", module: 2, color: "#EEEDFE", border: "#AFA9EC", text: "#3C3489" },
  { id: 5, title: "IA musique & voix", module: 2, color: "#EEEDFE", border: "#AFA9EC", text: "#3C3489" },
  { id: 6, title: "IA vidéo", module: 3, color: "#FAEEDA", border: "#EF9F27", text: "#633806" },
  { id: 7, title: "Coder sans coder", module: 3, color: "#FAEEDA", border: "#EF9F27", text: "#633806" },
  { id: 8, title: "Assistant personnel", module: 3, color: "#FAEEDA", border: "#EF9F27", text: "#633806" },
  { id: 9, title: "IA multimodale", module: 4, color: "#E1F5EE", border: "#5DCAA5", text: "#085041" },
  { id: 10, title: "IA & métiers du futur", module: 4, color: "#E1F5EE", border: "#5DCAA5", text: "#085041" },
  { id: 11, title: "IA & éthique", module: 4, color: "#E1F5EE", border: "#5DCAA5", text: "#085041" },
  { id: 12, title: "Projet final", module: 5, color: "#FAECE7", border: "#F0997B", text: "#712B13" },
];

const MODULE_LABELS = {
  1: "Fondations",
  2: "Création visuelle",
  3: "Vidéo & Code",
  4: "Avancé & Éthique",
  5: "Projet final",
};

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "12px 16px", alignItems: "center" }}>
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

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startSession = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: ARIA_SYSTEM_PROMPT,
          messages: [{ role: "user", content: "Démarre la session et présente-toi." }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "Bonjour ! Je suis ARIA.";
      setMessages([{ role: "assistant", content: text }]);
    } catch {
      setMessages([{ role: "assistant", content: "Erreur de connexion. Vérifie ta connexion Internet et réessaie." }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    if (!studentName) {
      const nameMatch = userMsg.match(/(?:je m'appelle|mon nom est|c'est|moi c'est|appelle-moi)\s+([A-ZÀ-Ÿa-zà-ÿ]+)/i);
      if (nameMatch) setStudentName(nameMatch[1]);
      else if (newMessages.length <= 3 && userMsg.split(" ").length === 1) setStudentName(userMsg);
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: ARIA_SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Je n'ai pas pu répondre.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion. Réessaie dans un instant." }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const jumpToCourse = (course) => {
    setSidebarOpen(false);
    sendMessage(`Démarre le cours ${course.id} : "${course.title}". Fournis le matériel didactique complet : fiche de cours, lexique, contenu théorique, fiche mémo, et les tutoriels step-by-step pour tous les TPs.`);
  };

  const formatMessage = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h2 key={i} style={{ fontSize: 17, fontWeight: 500, margin: "12px 0 4px" }}>{line.slice(2)}</h2>;
      if (line.startsWith("## ")) return <h3 key={i} style={{ fontSize: 15, fontWeight: 500, margin: "10px 0 4px" }}>{line.slice(3)}</h3>;
      if (line.startsWith("→ ") || line.startsWith("• ")) return <div key={i} style={{ paddingLeft: 16, margin: "2px 0", display: "flex", gap: 6 }}><span style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}>→</span><span>{line.slice(2)}</span></div>;
      if (line.match(/^[✅⚠️💡📌🎯🛠️]/)) return <div key={i} style={{ margin: "3px 0" }}>{line}</div>;
      if (line.startsWith("╔") || line.startsWith("║") || line.startsWith("╚") || line.startsWith("┌") || line.startsWith("│") || line.startsWith("└")) {
        return <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-secondary)", margin: "1px 0" }}>{line}</div>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ margin: "2px 0", lineHeight: 1.6 }}>{line}</div>;
    });
  };

  if (!started) {
    return (
      <div style={{ minHeight: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", gap: 24 }}>
        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EEEDFE", border: "2px solid #AFA9EC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>
            🤖
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 8px" }}>Bienvenue dans la formation IA</h1>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 8px", lineHeight: 1.6 }}>
            ARIA est ton formateur IA personnel. Il va t'apprendre à maîtriser l'intelligence artificielle — de zéro à utilisateur avancé — en 12 cours pratiques.
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", margin: "0 0 24px" }}>Aucun compte requis · 100 % gratuit · Secondaire</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24, textAlign: "left" }}>
            {["12 cours complets", "Tutoriels step-by-step", "7 mini-projets", "Outils 100 % gratuits"].map(f => (
              <div key={f} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                ✓ {f}
              </div>
            ))}
          </div>
          <button onClick={startSession} style={{ width: "100%", padding: "12px 24px", background: "#7F77DD", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
            Démarrer avec ARIA →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: 560, fontFamily: "var(--font-sans)", overflow: "hidden", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14 }}>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        .msg-user { background: #7F77DD; color: #fff; border-radius: 14px 14px 4px 14px; align-self: flex-end; max-width: 80%; padding: 10px 14px; font-size: 14px; line-height: 1.5; }
        .msg-aria { background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); border-radius: 14px 14px 14px 4px; align-self: flex-start; max-width: 90%; padding: 12px 16px; font-size: 13.5px; color: var(--color-text-primary); }
        .course-btn { background: none; border: 0.5px solid var(--color-border-tertiary); border-radius: 8px; padding: 8px 10px; text-align: left; cursor: pointer; transition: background .15s; width: 100%; margin-bottom: 4px; }
        .course-btn:hover { background: var(--color-background-secondary); }
        .send-btn { background: #7F77DD; color: #fff; border: none; border-radius: 8px; padding: 0 16px; cursor: pointer; font-size: 14px; flex-shrink: 0; }
        .send-btn:disabled { opacity: .4; cursor: not-allowed; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: var(--color-border-secondary); border-radius: 4px; }
        textarea { resize: none; outline: none; border: 0.5px solid var(--color-border-secondary); border-radius: 8px; padding: 10px 12px; font-size: 14px; font-family: var(--font-sans); background: var(--color-background-primary); color: var(--color-text-primary); width: 100%; line-height: 1.5; }
        textarea:focus { border-color: #7F77DD; }
      `}</style>

      {sidebarOpen && (
        <div style={{ width: 220, borderRight: "0.5px solid var(--color-border-tertiary)", overflowY: "auto", padding: "12px 10px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)" }}>COURS</span>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", fontSize: 16 }}>×</button>
          </div>
          {[1, 2, 3, 4, 5].map(mod => (
            <div key={mod} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-tertiary)", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 4 }}>Module {mod} — {MODULE_LABELS[mod]}</div>
              {COURSES.filter(c => c.module === mod).map(c => (
                <button key={c.id} className="course-btn" onClick={() => jumpToCourse(c)}>
                  <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 2 }}>Cours {c.id}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-primary)", fontWeight: 500 }}>{c.title}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "10px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 13 }}>
            ☰ Cours
          </button>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>ARIA{studentName ? ` — Formateur de ${studentName}` : " — Formateur IA"}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Formation IA · Secondaire · 12 cours</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "msg-user" : "msg-aria"}>
              {m.role === "assistant" && (
                <div style={{ fontSize: 10, fontWeight: 500, color: "#7F77DD", marginBottom: 6, letterSpacing: ".04em" }}>ARIA</div>
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

        <div style={{ padding: "10px 14px", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Écris ta réponse ou pose une question…"
          />
          <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ height: 46 }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
