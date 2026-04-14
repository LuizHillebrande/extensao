"""
Análise de transcrição de entrevista via Groq (LLM).
"""
from __future__ import annotations

import json
import re
from typing import Any

from django.conf import settings


RH_SYSTEM_PROMPT = """Aja como um profissional de RH altamente experiente, com atuação em múltiplos setores e sólida vivência na condução e avaliação de entrevistas. Sua função é analisar criticamente as respostas do candidato, considerando não apenas o conteúdo, mas também a forma como as ideias são estruturadas, comunicadas e sustentadas ao longo da entrevista.

Realize uma avaliação detalhada do desempenho do candidato, atribuindo notas (de 0 a 10) para os seguintes critérios:

Coerência das respostas

Domínio do assunto abordado

Clareza e objetividade na comunicação

Organização e estruturação das ideias

Sempre que possível, justifique brevemente as notas atribuídas com base em evidências observadas nas respostas.

Ao final, apresente sugestões práticas, específicas e construtivas, indicando pontos de melhoria e orientações claras para que o candidato possa evoluir e obter um melhor desempenho em futuras entrevistas."""

JSON_FORMAT_INSTRUCTION = """

Depois de concluir a análise, responda APENAS com um objeto JSON válido (sem texto antes ou depois, sem blocos markdown), exatamente neste formato:
{
  "coerencia": { "nota": <número de 0 a 10>, "justificativa": "<texto>" },
  "dominio_assunto": { "nota": <número de 0 a 10>, "justificativa": "<texto>" },
  "clareza_objetividade": { "nota": <número de 0 a 10>, "justificativa": "<texto>" },
  "organizacao_ideias": { "nota": <número de 0 a 10>, "justificativa": "<texto>" },
  "sugestoes": [ "<sugestão 1>", "<sugestão 2>" ]
}

Use notas com no máximo uma casa decimal quando necessário."""


def _strip_code_fence(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        lines = t.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        t = "\n".join(lines)
    return t.strip()


def _parse_llm_json(content: str) -> dict[str, Any]:
    raw = _strip_code_fence(content)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", raw)
        if m:
            return json.loads(m.group(0))
        raise


def _normalize_result(content: str, model: str) -> dict[str, Any]:
    parsed = _parse_llm_json(content)
    return {
        "coerencia": parsed.get("coerencia"),
        "dominio_assunto": parsed.get("dominio_assunto"),
        "clareza_objetividade": parsed.get("clareza_objetividade"),
        "organizacao_ideias": parsed.get("organizacao_ideias"),
        "sugestoes": parsed.get("sugestoes") or [],
        "provider": "groq",
        "model": model,
        "raw_text": content,
    }


def analyze_transcript_with_llm(transcript: str) -> dict[str, Any]:
    raw_key = getattr(settings, "GROQ_API_KEY", "") or ""
    api_key = raw_key.strip().strip('"').strip("'")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY não configurada. Defina no .env (pasta iterrogatio)."
        )
    if not api_key.startswith("gsk_"):
        raise RuntimeError(
            "GROQ_API_KEY inválida: a chave da Groq deve começar com gsk_. "
            "Gere uma API Key em https://console.groq.com/ e cole o valor completo, sem aspas."
        )

    from groq import Groq

    client = Groq(api_key=api_key)
    model = (getattr(settings, "GROQ_MODEL", "llama-3.1-8b-instant") or "").strip()
    system = RH_SYSTEM_PROMPT + JSON_FORMAT_INSTRUCTION

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": transcript},
        ],
        temperature=0.35,
    )
    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("Resposta vazia do modelo.")
    return _normalize_result(content, model=model)
