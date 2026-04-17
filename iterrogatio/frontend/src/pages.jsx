import { useState } from "react";
import { SideNav } from "./components/SideNav";
export function LandingPage({ goToAuth }) {
  return (
    <div className="landing-view">
      <div className="landing-header">
        <h1 className="landing-logo">Interrogatio</h1>
        <button className="landing-login" onClick={goToAuth}>
          Logar
        </button>
      </div>
      <div className="landing-main">
        <div className="landing-content">
          <h1 className="landing-headline">Análise profissional de entrevistas com IA.</h1>
          <p className="landing-subtitle">
            Transforme suas entrevistas em insights claros e objetivos com feedback automático e inteligente
          </p>
        </div>
        <div className="landing-hero">
          <img 
            src="/logoMenuHomem.png" 
            alt="Illustration" 
            className="landing-hero-image" 
          />
        </div>
      </div>
    </div>
  );
}

export function AuthPage({ handleLogin, handleRegister, authError, authMessage }) {
  const [authMode, setAuthMode] = useState("login");
  const [fields, setFields] = useState({
    username: "",
    email: "",
    login: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });
  const [localError, setLocalError] = useState(null);

  const onChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setLocalError(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    if (authMode === "login") {
      if (!fields.login || !fields.password) {
        setLocalError("Preencha usuário/e-mail e senha.");
        return;
      }
      await handleLogin({
        login: fields.login,
        password: fields.password,
        remember_me: fields.rememberMe,
      });
      return;
    }

    if (!fields.username || !fields.email || !fields.password || !fields.confirmPassword) {
      setLocalError("Preencha todos os campos.");
      return;
    }
    if (fields.password !== fields.confirmPassword) {
      setLocalError("As senhas não coincidem.");
      return;
    }

    await handleRegister({
      username: fields.username,
      email: fields.email,
      password1: fields.password,
      password2: fields.confirmPassword,
    });
  };

  return (
    <div className="auth-view">
      <div className="auth-card">
        <h1 className="auth-logo">Interrogatio</h1>
        <p className="auth-mode-label">{authMode === "login" ? "LOGIN" : "CADASTRO"}</p>

        <form className="auth-form" onSubmit={submit}>
          {authMode === "register" && (
            <input
              type="text"
              placeholder="USUÁRIO"
              className="auth-input"
              value={fields.username}
              onChange={(e) => onChange('username', e.target.value)}
            />
          )}
          <input
            type="text"
            placeholder={authMode === "login" ? "USUÁRIO OU E-MAIL" : "E-MAIL"}
            className="auth-input"
            value={authMode === "login" ? fields.login : fields.email}
            onChange={(e) => onChange(authMode === "login" ? 'login' : 'email', e.target.value)}
          />
          <input
            type="password"
            placeholder="SENHA"
            className="auth-input"
            value={fields.password}
            onChange={(e) => onChange('password', e.target.value)}
          />
          {authMode === "register" && (
            <input
              type="password"
              placeholder="CONFIRMAR SENHA"
              className="auth-input"
              value={fields.confirmPassword}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
            />
          )}
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={fields.rememberMe}
              onChange={(e) => onChange('rememberMe', e.target.checked)}
            />
            Lembrar sessão
          </label>
          <button type="submit" className="btn btn-auth">
            {authMode === "login" ? "LOGIN" : "CRIAR CONTA"}
          </button>
        </form>

        {(localError || authError || authMessage) && (
          <div
            className={`message ${authMessage ? "success" : "error"}`}
            style={
              !authMessage && (localError || authError)
                ? { whiteSpace: "pre-line", textAlign: "left" }
                : undefined
            }
          >
            {localError || authError || authMessage}
          </div>
        )}

        <div className="auth-toggle">
          {authMode === "login" ? (
            <p>
              Não tem conta?{' '}
              <a
                href="#register"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthMode('register');
                }}
              >
                REGISTRE-SE
              </a>
            </p>
          ) : (
            <p>
              Já tem conta?{' '}
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthMode('login');
                }}
              >
                FAÇA LOGIN
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MenuPage({
  goToInterviews,
  goToManageUser,
  goToAnalysis,
  goToDashboards,
  goToCompareReports,
  onLogout,
}) {
  return (
    <div className="menu-view">
      <SideNav onLogout={onLogout} />
      <div className="menu-content">
        <h1 className="menu-title">Menu Principal</h1>
        <div className="menu-grid">
          <button
            className="menu-card"
            onClick={goToAnalysis}
          >
            <span className="menu-icon">🎥</span>
            <span className="menu-label">Fazer nova Entrevista</span>
          </button>
          <button
            className="menu-card"
            onClick={goToDashboards}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-label">Dashboards</span>
          </button>
          <button
            className="menu-card"
            onClick={goToInterviews}
          >
            <span className="menu-icon">📋</span>
            <span className="menu-label">Minhas Entrevistas</span>
          </button>
          <button
            className="menu-card"
            onClick={goToManageUser}
          >
            <span className="menu-icon">👤</span>
            <span className="menu-label">Gerenciar Usuário</span>
          </button>
          <button
            className="menu-card"
            onClick={goToCompareReports}
          >
            <span className="menu-icon">📈</span>
            <span className="menu-label">Comparar Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function InterviewsPage({ interviews, onLogout }) {
  return (
    <div className="interviews-view">
      <SideNav onLogout={onLogout} />
      <div className="interviews-content">
        <h1 className="interviews-title">MINHAS ENTREVISTAS</h1>
        <div className="interviews-list">
          {interviews.map((interview) => (
            <div key={interview.id} className="interview-card">
              <div className="interview-header">
                <h3 className="interview-name">{interview.title}</h3>
                <span className="interview-date">{interview.date}</span>
              </div>
              <div className="interview-footer">
                <span
                  className={`interview-status ${
                    interview.status === "Concluída" ? "completed" : "analyzing"
                  }`}
                >
                  {interview.status === "Concluída" ? "✓" : "⏳"} {interview.status}
                </span>
                <button className="btn btn-small">Ver Relatório &gt;</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage({ onLogout }) {
  return (
    <div className="dashboard-view">
      <SideNav onLogout={onLogout} />
      <div className="dashboard-content">
        <h1>Dashboards</h1>
        <p>Seus dashboards e gráficos de desempenho aparecerão aqui.</p>
      </div>
    </div>
  );
}

export function UserPage({ onLogout }) {
  return (
    <div className="user-view">
      <SideNav onLogout={onLogout} />
      <div className="user-content">
        <h1>Gerenciar Usuário</h1>
        <p>Suas configurações de perfil aparecerão aqui.</p>
      </div>
    </div>
  );
}

export function ReportsPage({ onLogout }) {
  return (
    <div className="reports-view">
      <SideNav onLogout={onLogout} />
      <div className="reports-content">
        <h1>Comparar Relatórios</h1>
        <p>Comparação de entrevistas aparecerá aqui.</p>
      </div>
    </div>
  );
}

const OLHAR_LABELS = {
  camera: "Na câmera (atento)",
  baixo: "Para baixo",
  cima: "Para cima",
  lateral_esquerda: "Lateral esquerda",
  lateral_direita: "Lateral direita",
};

function formatOlhar(key) {
  if (!key) return "-";
  return OLHAR_LABELS[key] ?? key;
}

export function AnalysisPage({
  videoRef,
  overlayCanvasRef,
  captureCanvasRef,
  status,
  recordingState,
  startRecording,
  stopRecording,
  transcript,
  interimTranscript,
  isListening,
  speechError,
  llmAnalysis,
  llmLoading,
  llmError,
  goToMenu,
  onLogout,
}) {
  const em = status.emocao;
  const sc = status.scores;
  const gz = status.gaze;

  return (
    <div className="analysis-view">
      <div className="analysis-header">
        <button
          className="btn btn-back"
          onClick={goToMenu}
        >
          ← Menu
        </button>
        <h1 className="title">Análise Facial em Tempo Real</h1>
      </div>

      <div className="analysis-content-wrapper">
        <div className="cameraWrap">
          <video
            ref={videoRef}
            className="video"
            autoPlay
            playsInline
            muted
          />
          <canvas ref={overlayCanvasRef} className="overlay" />
          <canvas ref={captureCanvasRef} className="capture" />
        </div>

        <div className="status recordingBox">
          <div className="recordingButtons">
            <button className="btn" onClick={startRecording} disabled={recordingState.isRecording}>
              ▶ Iniciar Entrevista
            </button>
            <button className="btn danger" onClick={stopRecording} disabled={!recordingState.isRecording}>
              ⏹ Encerrar
            </button>
          </div>
        </div>

        <div className="status analysis-transcript">
          <div className="analysis-insights-title">
            🎤 Transcrição em Tempo Real {isListening && <span className="recording-indicator">● ao vivo</span>}
          </div>
          {transcript || interimTranscript ? (
            <div className="transcript-text">
              <span className="transcript-final">{transcript}</span>
              <span className="transcript-interim">{interimTranscript}</span>
            </div>
          ) : (
            <div className="analysis-muted">
              {recordingState.isRecording
                ? "Falando... o texto aparecerá aqui"
                : "Clique em 'Iniciar Entrevista' para começar"}
            </div>
          )}
        </div>

        {speechError && (
          <div className="status analysis-warning">
            <div className="analysis-insights-title">⚠️ Erro de Microfone</div>
            <div>{speechError}</div>
          </div>
        )}

        {(llmLoading || llmError || llmAnalysis) && (
          <div className="status analysis-llm">
            <div className="analysis-insights-title">📊 Análise da Entrevista</div>
            {llmLoading && <div className="analysis-muted">Analisando resposta...</div>}
            {llmError && !llmLoading && (
              <div className="analysis-warning" role="alert">
                {llmError}
              </div>
            )}
            {llmAnalysis && !llmLoading && (
              <div className="llm-result">
                {["coerencia", "dominio_assunto", "clareza_objetividade", "organizacao_ideias"].map((key) => {
                  const block = llmAnalysis[key];
                  if (!block || typeof block !== "object") return null;
                  const labels = {
                    coerencia: "Coerência",
                    dominio_assunto: "Domínio",
                    clareza_objetividade: "Clareza",
                    organizacao_ideias: "Organização",
                  };
                  return (
                    <div key={key} className="llm-criterion">
                      <div className="llm-criterion-head">
                        <strong>{labels[key]}</strong>
                        <span className="llm-nota">{block.nota != null ? Number(block.nota).toFixed(1) : "—"}/10</span>
                      </div>
                      {block.justificativa && (
                        <p className="llm-justificativa">{block.justificativa}</p>
                      )}
                    </div>
                  );
                })}
                {Array.isArray(llmAnalysis.sugestoes) && llmAnalysis.sugestoes.length > 0 && (
                  <div className="llm-sugestoes">
                    <strong>Sugestões</strong>
                    <ul>
                      {llmAnalysis.sugestoes.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
