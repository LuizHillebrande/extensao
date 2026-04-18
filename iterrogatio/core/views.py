from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

import json

@login_required
def home(request):
    return render(request, 'home.html', {'user': request.user})


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


def _save_transcript_and_posture_file(
    transcript: str,
    behavioral_data: dict[str, float],
    recording_id: int | None = None,
) -> str:
    output_dir = Path(settings.BASE_DIR) / "transcript_records"
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"transcript_{recording_id or 'unknown'}_{timestamp}.json"
    payload = {
        "recording_id": recording_id,
        "transcript": transcript,
        "behavioral_data": {
            "seconds_eyes_open": behavioral_data.get("seconds_eyes_open", 0),
            "seconds_eyes_closed": behavioral_data.get("seconds_eyes_closed", 0),
            "seconds_posture_good": behavioral_data.get("seconds_posture_good", 0),
            "seconds_posture_bad": behavioral_data.get("seconds_posture_bad", 0),
        },
        "saved_at": datetime.now().isoformat(),
    }
    path = output_dir / filename
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return str(path)


@csrf_exempt
@require_POST
def analyze_interview_transcript(request):
    """
    Envia a transcrição ao LLM com o prompt fixo de RH (ver interview_llm.py).
    """
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Autenticação necessária."}, status=401)

    try:
        payload = json.loads(request.body.decode("utf-8") if request.body else "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "JSON inválido."}, status=400)

    transcript = (payload.get("transcript") or "").strip()
    recording_id = payload.get("recording_id")
    if not transcript:
        return JsonResponse({"detail": "Transcrição vazia."}, status=400)
    if not recording_id:
        return JsonResponse({"detail": "ID da gravação é obrigatório."}, status=400)

    from .models import FaceRecording
    try:
        recording = FaceRecording.objects.get(id=recording_id)
    except FaceRecording.DoesNotExist:
        return JsonResponse({"detail": "Gravação não encontrada."}, status=404)

    behavioral_data = {
        "seconds_eyes_open": recording.seconds_eyes_open,
        "seconds_eyes_closed": recording.seconds_eyes_closed,
        "seconds_posture_good": recording.seconds_posture_good,
        "seconds_posture_bad": recording.seconds_posture_bad,
    }

    _save_transcript_and_posture_file(transcript, behavioral_data, recording.id)

    from .services.interview_llm import analyze_transcript_with_llm

    try:
        result = analyze_transcript_with_llm(transcript, behavioral_data)
    except RuntimeError as e:
        return JsonResponse({"detail": str(e)}, status=503)
    except Exception as e:
        return JsonResponse({"detail": f"Falha na análise: {e}"}, status=502)

    return JsonResponse(result)


@csrf_exempt
@require_POST
def generate_interview_report(request):
    """
    Recebe a análise da entrevista e a área profissional selecionada,
    gerando um relatório personalizado via LLM.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Autenticação necessária."}, status=401)

    try:
        payload = json.loads(request.body.decode("utf-8") if request.body else "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "JSON inválido."}, status=400)

    interview_analysis = payload.get("interview_analysis")
    professional_area = (payload.get("professional_area") or "").strip()
    transcript = (payload.get("transcript") or "").strip()
    recording_id = payload.get("recording_id")

    if not interview_analysis or not isinstance(interview_analysis, dict):
        return JsonResponse({"detail": "Análise da entrevista inválida."}, status=400)

    if not professional_area:
        return JsonResponse({"detail": "Área profissional é obrigatória."}, status=400)

    from .services.interview_llm import generate_interview_report as generate_report_llm
    from .models import Interview, FaceRecording

    try:
        result = generate_report_llm(interview_analysis, professional_area)
    except RuntimeError as e:
        return JsonResponse({"detail": str(e)}, status=503)
    except Exception as e:
        return JsonResponse({"detail": f"Falha ao gerar relatório: {e}"}, status=502)

    # Salvar entrevista no banco de dados
    try:
        recording = None
        behavioral_data = {}
        
        if recording_id:
            try:
                recording = FaceRecording.objects.get(id=recording_id)
                behavioral_data = {
                    "seconds_eyes_open": recording.seconds_eyes_open,
                    "seconds_eyes_closed": recording.seconds_eyes_closed,
                    "seconds_posture_good": recording.seconds_posture_good,
                    "seconds_posture_bad": recording.seconds_posture_bad,
                }
            except FaceRecording.DoesNotExist:
                pass

        interview = Interview.objects.create(
            user=request.user,
            professional_area=professional_area,
            transcript=transcript,
            analysis=interview_analysis,
            report=result.get("report", ""),
            behavioral_data=behavioral_data,
            recording=recording
        )
        
        # Adicionar ID da entrevista ao resultado
        result['interview_id'] = interview.id
    except Exception as e:
        # Log do erro mas não rejeita a resposta
        print(f"Erro ao salvar entrevista: {e}")

    return JsonResponse(result)


@login_required
def list_interviews(request):
    """
    Lista todas as entrevistas do usuário autenticado.
    Retorna: [{ id, professional_area, created_at, average_score }]
    """
    from .models import Interview

    interviews = Interview.objects.filter(user=request.user).all()
    
    interviews_list = []
    for interview in interviews:
        # Calcular nota média
        average_score = 0
        analysis = interview.analysis
        
        if analysis and isinstance(analysis, dict):
            scores = []
            for key in ['coerencia', 'dominio_assunto', 'clareza_objetividade', 'organizacao_ideias']:
                item = analysis.get(key)
                if item and isinstance(item, dict) and 'nota' in item:
                    try:
                        nota = float(item['nota'])
                        scores.append(nota)
                    except (ValueError, TypeError):
                        pass
            
            if scores:
                average_score = sum(scores) / len(scores)
        
        interviews_list.append({
            'id': interview.id,
            'professional_area': interview.professional_area,
            'created_at': interview.created_at.isoformat(),
            'date_formatted': interview.created_at.strftime('%d/%m/%Y'),
            'time_formatted': interview.created_at.strftime('%H:%M:%S'),
            'average_score': round(average_score, 1),
        })

    return JsonResponse({'interviews': interviews_list})


@login_required
def get_interview_detail(request, interview_id):
    """
    Retorna os detalhes de uma entrevista específica.
    """
    from .models import Interview

    try:
        interview = Interview.objects.get(id=interview_id, user=request.user)
    except Interview.DoesNotExist:
        return JsonResponse({"detail": "Entrevista não encontrada."}, status=404)

    return JsonResponse({
        'id': interview.id,
        'professional_area': interview.professional_area,
        'transcript': interview.transcript,
        'analysis': interview.analysis,
        'report': interview.report,
        'behavioral_data': interview.behavioral_data,
        'created_at': interview.created_at.isoformat(),
        'date_formatted': interview.created_at.strftime('%d/%m/%Y'),
        'time_formatted': interview.created_at.strftime('%H:%M:%S'),
    })



