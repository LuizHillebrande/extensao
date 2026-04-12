import { useEffect, useRef, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import {
  LandingPage,
  AuthPage,
  MenuPage,
  InterviewsPage,
  DashboardPage,
  UserPage,
  ReportsPage,
  AnalysisPage,
} from "./pages";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const timerRef = useRef(null);
  const inFlightRef = useRef(false);

  const recordingActiveRef = useRef(false);
  const facePresentRef = useRef(false);
  const lastTickAtRef = useRef(null);
  const uiLastUpdateAtRef = useRef(0);
  const accumRef = useRef({
    seconds_eyes_open: 0,
    seconds_eyes_closed: 0,
    seconds_posture_good: 0,
    seconds_posture_bad: 0,
  });

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);

  const [status, setStatus] = useState({
    rosto_detectado: false,
    olhos: null,
    postura: null,
    ear: null,
    gaze: null,
    atencao: null,
    emocao: null,
    scores: null,
  });

  const [recordingState, setRecordingState] = useState({
    isRecording: false,
    seconds_eyes_open: 0,
    seconds_eyes_closed: 0,
    seconds_posture_good: 0,
    seconds_posture_bad: 0,
  });

  const [interviews] = useState([
    { id: 1, title: "Entrevista 01", date: "12/10/2025", status: "Concluída" },
    { id: 2, title: "Entrevista 02", date: "15/10/2025", status: "Concluída" },
    { id: 3, title: "Entrevista 03", date: "20/10/2025", status: "Em Análise" },
  ]);

  async function saveRecording() {
    const payload = { ...accumRef.current };
    try {
      const res = await fetch("/api/face/save/", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;
      await res.json();
    } catch (e) {
      // evita spam em caso de backend off
    }
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  async function ensureAuthState() {
    try {
      await fetch('/api/auth/csrf/', {
        credentials: 'include',
      });
      const response = await fetch('/api/auth/user/', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin(payload) {
    setAuthError(null);
    setAuthMessage(null);
    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.detail || 'Falha ao autenticar.');
        return false;
      }

      setUser(data.user);
      setAuthMessage('Login efetuado com sucesso.');
      navigate('/menu');
      return true;
    } catch (error) {
      setAuthError('Não foi possível conectar ao servidor.');
      return false;
    }
  }

  async function handleRegister(payload) {
    setAuthError(null);
    setAuthMessage(null);
    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.detail || 'Falha ao registrar.');
        return false;
      }

      setUser(data.user);
      setAuthMessage('Registrado com sucesso.');
      navigate('/menu');
      return true;
    } catch (error) {
      setAuthError('Não foi possível conectar ao servidor.');
      return false;
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
      });
    } catch (error) {
      // ignore failure, clear local session state anyway
    }
    setUser(null);
    navigate('/auth');
  }

  function startRecording() {
    if (recordingActiveRef.current) return;
    recordingActiveRef.current = true;
    facePresentRef.current = false;
    lastTickAtRef.current = performance.now();
    uiLastUpdateAtRef.current = 0;

    accumRef.current = {
      seconds_eyes_open: 0,
      seconds_eyes_closed: 0,
      seconds_posture_good: 0,
      seconds_posture_bad: 0,
    };

    setRecordingState({
      isRecording: true,
      seconds_eyes_open: 0,
      seconds_eyes_closed: 0,
      seconds_posture_good: 0,
      seconds_posture_bad: 0,
    });
  }

  function stopRecording() {
    if (!recordingActiveRef.current) return;
    recordingActiveRef.current = false;
    facePresentRef.current = false;
    lastTickAtRef.current = null;
    setRecordingState((prev) => ({ ...prev, isRecording: false }));
    saveRecording();
  }

  function goToAnalysis() {
    navigate("/analise");
  }

  function goToMenu() {
    navigate("/menu");
  }

  function goToInterviews() {
    navigate("/entrevistas");
  }

  function goToDashboards() {
    navigate("/dashboards");
  }

  function goToManageUser() {
    navigate("/usuario");
  }

  function goToCompareReports() {
    navigate('/comparar-relatorios');
  }

  function goToAuth() {
    navigate('/auth');
  }

  // ÚNICO useEffect que gerencia câmera e análise
  useEffect(() => {
    if (location.pathname !== "/analise") {
      // Limpar quando sair da página de análise
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      recordingActiveRef.current = false;
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      return;
    }

    let localStream = null;
    let videoElementForCleanup = null;
    let isMounted = true;

    async function initializeAnalysis() {
      console.log("Inicializando análise facial...");
      try {
        // 1. Obter stream de câmera
        localStream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (!isMounted) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
          videoElementForCleanup = videoRef.current;
          console.log("Stream atribuído ao videoRef");
        }

        // 2. Esperar o vídeo estar pronto
        const video = videoRef.current;
        if (!video) return;

        await new Promise((resolve) => {
          const handleMetadata = () => {
            resolve();
            video.removeEventListener("loadedmetadata", handleMetadata);
          };
          if (video.readyState >= 2) {
            resolve();
          } else {
            video.addEventListener("loadedmetadata", handleMetadata);
          }
        });

        if (!isMounted) return;

        // 3. Setup de funções de análise
        function ensureCanvasesSized() {
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (!w || !h) return false;

          const overlay = overlayCanvasRef.current;
          const capture = captureCanvasRef.current;
          if (!overlay || !capture) return false;

          if (overlay.width !== w) overlay.width = w;
          if (overlay.height !== h) overlay.height = h;
          if (capture.width !== w) capture.width = w;
          if (capture.height !== h) capture.height = h;
          return true;
        }

        function drawOverlay(result) {
          const canvas = overlayCanvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!ctx || !canvas) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (result?.rosto_detectado && result?.bbox) {
            const { x, y, w, h } = result.bbox;
            ctx.strokeStyle = "#00ff88";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);
          }

          const olhosText = result?.olhos
            ? `Olhos: ${result.olhos === "abertos" ? "abertos" : "fechados"}`
            : "Olhos: -";
          const posturaText = result?.postura
            ? `Postura: ${result.postura === "boa" ? "Boa postura" : "Fora de posição"}`
            : "Postura: -";

          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.fillRect(10, 10, 260, 62);
          ctx.fillStyle = "#ffffff";
          ctx.font = "16px Arial";
          ctx.fillText(olhosText, 20, 34);
          ctx.fillText(posturaText, 20, 58);
        }

        async function sendFrameOnce() {
          if (inFlightRef.current) return;
          if (!ensureCanvasesSized()) return;

          const capture = captureCanvasRef.current;
          const ctx = capture.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(video, 0, 0, capture.width, capture.height);

          inFlightRef.current = true;
          try {
            const blob = await new Promise((resolve) =>
              capture.toBlob(resolve, "image/jpeg", 0.7)
            );
            if (!blob) {
              console.log("Blob criação falhou");
              return;
            }

            const form = new FormData();
            form.append("frame", blob, "frame.jpg");

            console.log("Enviando frame para API...");
            const res = await fetch("/api/face/analyze/", {
              method: "POST",
              credentials: 'include',
              body: form,
            });
            
            if (!res.ok) {
              console.error("API Error:", res.status, res.statusText);
              return;
            }

            const json = await res.json();
            console.log("API Response:", json);
            
            if (isMounted) {
              console.log("Atualizando status:", json);
              setStatus({
                rosto_detectado: !!json.rosto_detectado,
                olhos: json.olhos ?? null,
                postura: json.postura ?? null,
                ear: json.ear ?? null,
                gaze: json.gaze ?? null,
                atencao: json.atencao ?? null,
                emocao: json.emocao ?? null,
                scores: json.scores ?? null,
              });
              drawOverlay(json);
            }

            // Modo gravação: acumula tempo por categoria enquanto o rosto está detectado.
            if (recordingActiveRef.current) {
              const now = performance.now();
              const prevAt = lastTickAtRef.current ?? now;
              const dtSeconds = Math.max(0, (now - prevAt) / 1000);
              lastTickAtRef.current = now;

              if (json.rosto_detectado) {
                // Só conta o tempo depois que o rosto foi detectado pela primeira vez.
                if (!facePresentRef.current) {
                  facePresentRef.current = true;
                  lastTickAtRef.current = now;
                } else {
                  if (json.olhos === "abertos") {
                    accumRef.current.seconds_eyes_open += dtSeconds;
                  } else if (json.olhos === "fechados") {
                    accumRef.current.seconds_eyes_closed += dtSeconds;
                  }

                  if (json.postura === "boa") {
                    accumRef.current.seconds_posture_good += dtSeconds;
                  } else if (json.postura === "fora") {
                    accumRef.current.seconds_posture_bad += dtSeconds;
                  }
                }
              } else {
                // Quando perde o rosto, não acumula tempo (e reseta a condição de "começar a contar").
                facePresentRef.current = false;
              }

              // Throttle pra não dar re-render a cada frame.
              if (now - uiLastUpdateAtRef.current > 250) {
                uiLastUpdateAtRef.current = now;
                if (isMounted) {
                  setRecordingState((prev) => ({
                    ...prev,
                    seconds_eyes_open: accumRef.current.seconds_eyes_open,
                    seconds_eyes_closed: accumRef.current.seconds_eyes_closed,
                    seconds_posture_good: accumRef.current.seconds_posture_good,
                    seconds_posture_bad: accumRef.current.seconds_posture_bad,
                  }));
                }
              }
            }
          } catch (e) {
            // evita spam no console em caso de backend off
          } finally {
            inFlightRef.current = false;
          }
        }

        function startLoop() {
          if (timerRef.current) return;
          timerRef.current = setInterval(sendFrameOnce, 100);
        }

        // 4. Iniciar loop de análise
        startLoop();
        console.log("Loop de análise iniciado a cada 100ms");
      } catch (err) {
        console.error("Erro ao inicializar câmera:", err);
      }
    }

    initializeAnalysis();

    // Cleanup function
    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (videoElementForCleanup) {
        videoElementForCleanup.srcObject = null;
      }
      recordingActiveRef.current = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!authLoading && !user && !['/', '/auth'].includes(location.pathname)) {
      navigate('/auth');
    }
  }, [authLoading, user, location.pathname, navigate]);

  useEffect(() => {
    ensureAuthState();
  }, []);

  return (
    <div className="page">
      <Routes>
        <Route path="/" element={<LandingPage goToAuth={goToAuth} />} />
        <Route
          path="/auth"
          element={
            <AuthPage
              handleLogin={handleLogin}
              handleRegister={handleRegister}
              authError={authError}
              authMessage={authMessage}
            />
          }
        />
        <Route
          path="/menu"
          element={
            <MenuPage
              goToInterviews={goToInterviews}
              goToManageUser={goToManageUser}
              goToAnalysis={goToAnalysis}
              goToDashboards={goToDashboards}
              goToCompareReports={goToCompareReports}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/entrevistas"
          element={<InterviewsPage interviews={interviews} onLogout={handleLogout} />}
        />
        <Route path="/dashboards" element={<DashboardPage onLogout={handleLogout} />} />
        <Route path="/usuario" element={<UserPage onLogout={handleLogout} />} />
        <Route path="/comparar-relatorios" element={<ReportsPage onLogout={handleLogout} />} />
        <Route
          path="/analise"
          element={
            <AnalysisPage
              videoRef={videoRef}
              overlayCanvasRef={overlayCanvasRef}
              captureCanvasRef={captureCanvasRef}
              status={status}
              recordingState={recordingState}
              startRecording={startRecording}
              stopRecording={stopRecording}
              goToMenu={goToMenu}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
