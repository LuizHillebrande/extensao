import { useState } from "react";
import { SideNav } from "./components/SideNav";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";

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

export function AuthPage({ handleLogin, handleRegister }) {
  const [authMode, setAuthMode] = useState("login");

  return (
    <div className="auth-view">
      <div className="auth-card">
        <h1 className="auth-logo">Interrogatio</h1>
        <p className="auth-mode-label">
          {authMode === "login" ? "LOGIN" : "CADASTRO"}
        </p>
        
        <form className="auth-form">
          <input
            type="email"
            placeholder="E-MAIL"
            className="auth-input"
          />
          <input
            type="password"
            placeholder="SENHA"
            className="auth-input"
          />
          {authMode === "register" && (
            <input
              type="password"
              placeholder="CONFIRMAR SENHA"
              className="auth-input"
            />
          )}
          <button
            type="button"
            className="btn btn-auth"
            onClick={authMode === "login" ? handleLogin : handleRegister}
          >
            {authMode === "login" ? "LOGIN" : "CRIAR CONTA"}
          </button>
        </form>

        <div className="auth-toggle">
          {authMode === "login" ? (
            <p>
              Não tem conta?{" "}
              <a href="#register" onClick={(e) => { e.preventDefault(); setAuthMode("register"); }}>
                REGISTRE-SE
              </a>
            </p>
          ) : (
            <p>
              Já tem conta?{" "}
              <a href="#login" onClick={(e) => { e.preventDefault(); setAuthMode("login"); }}>
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
}) {
  return (
    <div className="menu-view">
      <SideNav />
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

export function InterviewsPage({ interviews }) {
  return (
    <div className="interviews-view">
      <SideNav />
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

export function DashboardPage() {
  return (
    <div className="dashboard-view">
      <SideNav />
      <div className="dashboard-content">
        <h1>Dashboards</h1>
        <p>Seus dashboards e gráficos de desempenho aparecerão aqui.</p>
      </div>
    </div>
  );
}

export function UserPage() {
  return (
    <div className="user-view">
      <SideNav />
      <div className="user-content">
        <h1>Gerenciar Usuário</h1>
        <p>Suas configurações de perfil aparecerão aqui.</p>
      </div>
    </div>
  );
}

export function ReportsPage() {
  return (
    <div className="reports-view">
      <SideNav />
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
  goToMenu,
}) {
  const em = status.emocao;
  const sc = status.scores;
  const gz = status.gaze;

  const {
    transcript,
    interimTranscript,
    isListening,
    error,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();

  const handleStartRecording = () => {
    startRecording();
    startListening();
    clearTranscript();
  };

  const handleStopRecording = () => {
    stopRecording();
    stopListening();
  };

  return (
    <div className="analysis-view">
      <div className="analysis-header">
        <button
          className="btn btn-back"
          onClick={goToMenu}
        >
          ← Voltar ao menu
        </button>
        <h1 className="title">Análise Facial em Tempo Real</h1>
      </div>

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

      <div className="status">
        <div><strong>Rosto:</strong> {status.rosto_detectado ? "Detectado" : "Não detectado"}</div>
        <div><strong>Olhos:</strong> {status.olhos ? (status.olhos === "abertos" ? "Abertos" : "Fechados") : "-"}</div>
        <div><strong>Postura:</strong> {status.postura ? (status.postura === "boa" ? "Boa postura" : "Fora de posição") : "-"}</div>
        {status.ear != null && (
          <div><strong>EAR:</strong> {Number(status.ear).toFixed(3)}</div>
        )}
      </div>

      <div className="status analysis-insights">
        <div className="analysis-insights-title">Atenção e olhar</div>
        <div><strong>Olhar:</strong> {gz ? formatOlhar(gz.olhar) : "-"}</div>
        {gz && (
          <div className="analysis-muted">
            H {gz.horizontal} · V {gz.vertical}
          </div>
        )}
        <div><strong>Atenção (0–10):</strong> {status.atencao != null ? status.atencao : "-"}</div>
      </div>

      <div className="status analysis-insights">
        <div className="analysis-insights-title">Emoção (estimativa geométrica)</div>
        {em ? (
          <>
            <div className="analysis-score-row"><span>Felicidade</span><span>{em.felicidade}</span></div>
            <div className="analysis-score-row"><span>Confiança</span><span>{em.confianca}</span></div>
            <div className="analysis-score-row"><span>Nervosismo</span><span>{em.nervosismo}</span></div>
            <div className="analysis-score-row"><span>Tensão</span><span>{em.tensao}</span></div>
          </>
        ) : (
          <div className="analysis-muted">—</div>
        )}
      </div>

      <div className="status analysis-insights">
        <div className="analysis-insights-title">Scores</div>
        {sc ? (
          <>
            <div className="analysis-score-row"><span>Atenção</span><span>{sc.atencao}</span></div>
            <div className="analysis-score-row"><span>Postura</span><span>{sc.postura}</span></div>
            <div className="analysis-score-row"><span>Engajamento</span><span>{sc.engajamento}</span></div>
          </>
        ) : (
          <div className="analysis-muted">—</div>
        )}
      </div>

      <div className="status recordingBox">
        <div className="recordingButtons">
          <button className="btn" onClick={handleStartRecording} disabled={recordingState.isRecording}>
            Iniciar
          </button>
          <button className="btn danger" onClick={handleStopRecording} disabled={!recordingState.isRecording}>
            Parar
          </button>
        </div>

        <div className="recordingMeta">
          <div><strong>Contador (somente quando rosto detectado):</strong> {recordingState.isRecording ? "Ativo" : "Inativo"}</div>
          <div>Olho aberto: {recordingState.seconds_eyes_open.toFixed(1)}s</div>
          <div>Olho fechado: {recordingState.seconds_eyes_closed.toFixed(1)}s</div>
          <div>Postura boa: {recordingState.seconds_posture_good.toFixed(1)}s</div>
          <div>Postura ruim: {recordingState.seconds_posture_bad.toFixed(1)}s</div>
        </div>
      </div>

      {error && (
        <div className="status analysis-warning">
          <div className="analysis-insights-title">⚠️ Erro de Microfone</div>
          <div>{error}</div>
        </div>
      )}

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
              : "Clique em 'Iniciar' para começar a transcrição"}
          </div>
        )}
      </div>
    </div>
  );
}
