# Extensão Real — Análise Facial em Tempo Real (Webcam)

## Objetivo
Esse projeto abre a webcam no **React** e faz uma **análise facial em tempo real** no **Django**, sem tirar “prints” por botão e sem salvar imagens.

## O que foi implementado
- **Stream contínuo**: o frontend captura frames do vídeo a cada ~100ms e envia para o backend.
- **Detecção de rosto**: usando **MediaPipe FaceMesh**.
- **Bounding box**: desenha uma caixa em volta do rosto no `canvas` sobre o vídeo.
- **Olhos abertos/fechados**: cálculo simples de **EAR (Eye Aspect Ratio)**.
- **Postura simples**: se o rosto está centralizado → **Boa postura**, senão → **Fora de posição**.

## Tecnologias usadas
- **Frontend**: React (Create React App)
- **Backend**: Django
- **Visão computacional**: OpenCV + MediaPipe

## Como rodar

### 1) Backend (Django)
No terminal:

```bash
cd iterrogatio
python -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
python manage.py runserver
```

O backend vai subir em `http://localhost:8000`.

### 2) Frontend (React)
Em outro terminal:

```bash
cd iterrogatio/frontend
npm install
npm start
```

O frontend vai abrir em `http://localhost:3000`.

## Observações
- O endpoint usado é `POST /api/face/analyze/` (recebe `multipart/form-data` com o campo `frame`).
- Toda a lógica de visão computacional fica em `iterrogatio/core/services/face_analysis.py` (não fica na view).

