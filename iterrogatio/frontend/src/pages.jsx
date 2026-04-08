import { useState } from "react";
import { SideNav } from "./components/SideNav";

export function LandingPage({ goToAuth }) {
  return (
    <div className="landing-view">
      <div className="landing-content">
        <h1 className="landing-title">Interrogatio</h1>
        <p className="landing-subtitle">Análise Profissional de Entrevistas com IA.</p>
        <p className="landing-description">
          Transforme suas intrevistas em insights claros e objetivos com feedback automático e inteligente
        </p>
        <button className="btn btn-primary" onClick={goToAuth}>
          Logar
        </button>
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
      </div>

      <div className="status recordingBox">
        <div className="recordingButtons">
          <button className="btn" onClick={startRecording} disabled={recordingState.isRecording}>
            Iniciar
          </button>
          <button className="btn danger" onClick={stopRecording} disabled={!recordingState.isRecording}>
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
    </div>
  );
}
