from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.views.decorators.http import require_POST

def home(request):
    return HttpResponse("Funcionando 🔥")


@csrf_exempt
def analyze_face(request):
    """
    Recebe frames continuamente via multipart/form-data (campo 'frame'),
    roda análise facial e devolve JSON pro frontend desenhar.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Use POST"}, status=405)

    frame_file = request.FILES.get("frame")
    if frame_file is None:
        return JsonResponse({"detail": "Arquivo 'frame' é obrigatório"}, status=400)

    # Imports pesados ficam dentro da view para não quebrar outras rotinas
    # (ex: migrations) sem dependências instaladas.
    import cv2
    import numpy as np

    from .services.face_analysis import analisar_rosto

    data = frame_file.read()
    npbuf = np.frombuffer(data, dtype=np.uint8)
    img = cv2.imdecode(npbuf, cv2.IMREAD_COLOR)
    if img is None:
        return JsonResponse({"detail": "Não foi possível decodificar a imagem"}, status=400)

    try:
        result = analisar_rosto(img)
    except Exception as e:
        # Evita 500 em loop quando MediaPipe não está funcionando (ex: versão incompatível).
        return JsonResponse(
            {
                "rosto_detectado": False,
                "bbox": None,
                "olhos": None,
                "postura": None,
                "ear": None,
                "gaze": None,
                "atencao": None,
                "emocao": None,
                "scores": None,
                "detail": str(e),
            },
            status=200,
        )

    return JsonResponse(result)


@csrf_exempt
@require_POST
def save_recording(request):
    """
    Recebe, em JSON, os totais acumulados no frontend e persiste no SQLite.
    Payload:
    {
      seconds_eyes_open: number,
      seconds_eyes_closed: number,
      seconds_posture_good: number,
      seconds_posture_bad: number
    }
    """
    try:
        body = request.body.decode("utf-8") if request.body else "{}"
        payload = json.loads(body or "{}")
    except Exception:
        return JsonResponse({"detail": "JSON inválido"}, status=400)

    from .models import FaceRecording

    rec = FaceRecording.objects.create(
        seconds_eyes_open=float(payload.get("seconds_eyes_open", 0) or 0),
        seconds_eyes_closed=float(payload.get("seconds_eyes_closed", 0) or 0),
        seconds_posture_good=float(payload.get("seconds_posture_good", 0) or 0),
        seconds_posture_bad=float(payload.get("seconds_posture_bad", 0) or 0),
    )

    return JsonResponse({"id": rec.id})