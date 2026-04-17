from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('api/face/analyze/', views.analyze_face),
    path('api/face/save/', views.save_recording),
    path('api/interview/analyze-transcript/', views.analyze_interview_transcript),
    path('api/interview/generate-report/', views.generate_interview_report),
]