from django.db import models

class FaceRecording(models.Model):
    # Armazena o resultado agregando segundos em vez de salvar frame/imagem
    created_at = models.DateTimeField(auto_now_add=True)

    seconds_eyes_open = models.FloatField(default=0)
    seconds_eyes_closed = models.FloatField(default=0)

    seconds_posture_good = models.FloatField(default=0)
    seconds_posture_bad = models.FloatField(default=0)

    def __str__(self) -> str:
        return f"FaceRecording(id={self.id}, eyes_open={self.seconds_eyes_open:.2f}s, posture_good={self.seconds_posture_good:.2f}s)"
