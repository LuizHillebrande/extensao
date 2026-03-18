from __future__ import annotations

import cv2
import mediapipe as mp
import numpy as np


def _euclidean(p1: np.ndarray, p2: np.ndarray) -> float:
    return float(np.linalg.norm(p1 - p2))


def _eye_aspect_ratio(points_2d: dict[int, np.ndarray], eye_idx: list[int]) -> float:
    """
    EAR = (||p2-p6|| + ||p3-p5||) / (2*||p1-p4||)
    eye_idx must be [p1, p2, p3, p4, p5, p6] in that order.
    """
    p1, p2, p3, p4, p5, p6 = [points_2d[i] for i in eye_idx]
    vertical_1 = _euclidean(p2, p6)
    vertical_2 = _euclidean(p3, p5)
    horizontal = _euclidean(p1, p4)
    if horizontal == 0:
        return 0.0
    return (vertical_1 + vertical_2) / (2.0 * horizontal)


class FaceAnalyzer:
    """
    Analyzer em tempo real:
    - Detecta rosto via FaceMesh
    - Bounding box (min/max dos landmarks)
    - Olhos abertos/fechados via EAR
    - Postura simples via centro do rosto vs centro da imagem
    """

    # Índices clássicos do FaceMesh para EAR (funciona bem como heurística simples)
    LEFT_EYE = [33, 160, 158, 133, 153, 144]
    RIGHT_EYE = [362, 385, 387, 263, 373, 380]

    def __init__(
        self,
        ear_threshold: float = 0.21,
        center_tolerance_ratio: float = 0.18,
    ) -> None:
        self.ear_threshold = ear_threshold
        self.center_tolerance_ratio = center_tolerance_ratio
        # Cria FaceMesh somente quando o módulo for realmente usado.
        # Em algumas versões do `mediapipe`, `mp.solutions` pode não existir.
        if not hasattr(mp, "solutions") or not hasattr(mp.solutions, "face_mesh"):
            raise RuntimeError(
                "O pacote `mediapipe` instalado não expõe `mp.solutions.face_mesh`. "
                "Tente reinstalar uma versão com FaceMesh (ex: `mediapipe==0.10.14`)."
            )

        self._mesh = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def analyze_bgr(self, image_bgr: np.ndarray) -> dict:
        """
        Retorna um dict pronto para o frontend desenhar:
        {
          rosto_detectado: bool,
          bbox: {x,y,w,h} | None,
          olhos: "abertos"|"fechados"|None,
          postura: "boa"|"fora"|None,
          ear: float|None
        }
        """
        if image_bgr is None or image_bgr.size == 0:
            return {
                "rosto_detectado": False,
                "bbox": None,
                "olhos": None,
                "postura": None,
                "ear": None,
            }

        h, w = image_bgr.shape[:2]
        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        result = self._mesh.process(rgb)

        if not result.multi_face_landmarks:
            return {
                "rosto_detectado": False,
                "bbox": None,
                "olhos": None,
                "postura": None,
                "ear": None,
            }

        face = result.multi_face_landmarks[0]
        xs = np.array([lm.x for lm in face.landmark], dtype=np.float32)
        ys = np.array([lm.y for lm in face.landmark], dtype=np.float32)

        x_min = int(np.clip(xs.min() * w, 0, w - 1))
        x_max = int(np.clip(xs.max() * w, 0, w - 1))
        y_min = int(np.clip(ys.min() * h, 0, h - 1))
        y_max = int(np.clip(ys.max() * h, 0, h - 1))

        bbox = {
            "x": x_min,
            "y": y_min,
            "w": max(0, x_max - x_min),
            "h": max(0, y_max - y_min),
        }

        # Pontos 2D em pixels (só os necessários)
        needed = set(self.LEFT_EYE + self.RIGHT_EYE)
        points_2d: dict[int, np.ndarray] = {}
        for idx in needed:
            lm = face.landmark[idx]
            points_2d[idx] = np.array([lm.x * w, lm.y * h], dtype=np.float32)

        left_ear = _eye_aspect_ratio(points_2d, self.LEFT_EYE)
        right_ear = _eye_aspect_ratio(points_2d, self.RIGHT_EYE)
        ear = float((left_ear + right_ear) / 2.0)
        olhos = "fechados" if ear < self.ear_threshold else "abertos"

        # Postura simples: centro do bbox perto do centro da imagem
        face_cx = x_min + bbox["w"] / 2.0
        face_cy = y_min + bbox["h"] / 2.0
        img_cx = w / 2.0
        img_cy = h / 2.0
        tol_x = w * self.center_tolerance_ratio
        tol_y = h * self.center_tolerance_ratio
        centralizado = (abs(face_cx - img_cx) <= tol_x) and (abs(face_cy - img_cy) <= tol_y)
        postura = "boa" if centralizado else "fora"

        return {
            "rosto_detectado": True,
            "bbox": bbox,
            "olhos": olhos,
            "postura": postura,
            "ear": ear,
        }


def analisar_rosto(image_bgr: np.ndarray) -> dict:
    """Compatível com um import simples na view."""
    global _ANALYZER
    if _ANALYZER is None:
        _ANALYZER = FaceAnalyzer()
    return _ANALYZER.analyze_bgr(image_bgr)


_ANALYZER: FaceAnalyzer | None = None