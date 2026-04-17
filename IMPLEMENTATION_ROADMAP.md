# Esboço: Sistema de Geração de Relatório por Área Profissional

## Visão Geral
Após a conclusão da análise da entrevista, o usuário será apresentado com um modal que permite seleção de uma área profissional. Ao confirmar, um relatório personalizado será gerado pela LLM considerando o contexto da profissão.

---

## Fluxo de Funcionamento

### 1. **Frontend**

#### `ProfessionalAreaModal.jsx`
- **Componente Modal** que aparece após análise concluída
- **Dropdown Menu** com áreas profissionais predefinidas
- **Dois Botões**: "Gerar Relatório" e "Cancelar"
- Estados:
  - `isOpen`: controla visibilidade do modal
  - `selectedArea`: armazena escolha do usuário
  - `isLoading`: mostra estado "Gerando..."

#### Integração em `App.js`
- Estado `showProfessionalModal`: controla exibição do modal
- Estado `report`: armazena relatório gerado
- Estado `reportLoading`: indica processamento
- Estado `reportError`: gerencia erros

**Função `handleGenerateReport(professionalArea)`**:
```javascript
- Valida se llmAnalysis existe
- Faz POST para /api/interview/generate-report/
- Passa: interview_analysis + professional_area
- Exibe relatório em overlay quando sucesso
```

**Função `handleCancelReport()`**:
- Fecha o modal sem gerar relatório

### 2. **Backend**

#### `core/urls.py`
- Nova rota: `POST /api/interview/generate-report/`

#### `core/views.py`
- **Nova view: `generate_interview_report(request)`**
  - Autentica usuário
  - Recebe: `interview_analysis` (dict) + `professional_area` (str)
  - Valida entrada
  - Chama `generate_interview_report()` do LLM service
  - Retorna resultado em JSON

#### `core/services/interview_llm.py`
- **Sistema Prompt**: `REPORT_SYSTEM_PROMPT`
  - Define LLM como especialista em seleção de talentos
  - Instruções para estrutura do relatório:
    1. Resumo da Avaliação
    2. Pontos Fortes (contextualizados à profissão)
    3. Áreas de Melhoria (específicas da profissão)
    4. Alinhamento com a Profissão
    5. Recomendações Finais
    6. Parecer Final (Recomendado / Ressalvas / Não Recomendado)

- **Função: `generate_interview_report(interview_analysis, professional_area)`**
  - Monta prompt combinando análise anterior + profissão
  - Envia para Groq/LLM
  - Retorna JSON com:
    - `report`: texto do relatório
    - `professional_area`: profissão selecionada
    - `provider`: "groq"
    - `model`: modelo utilizado
    - `generated_at`: timestamp

---

## Áreas Profissionais (Draft)

Lista atual no modal:
- Tecnologia
- Vendas
- Recursos Humanos
- Financeiro
- Marketing
- Operações
- Suporte ao Customer
- Gestão de Projetos
- Engenharia
- Outro

*Pode ser expandida ou personalizada conforme necessário.*

---

## Customização do Prompt

### Próximos Passos Recomendados

Você pode customizar o **`REPORT_SYSTEM_PROMPT`** em `interview_llm.py` para:

1. **Adicionar critérios específicos** por profissão
2. **Definir pesos** para cada área de avaliação
3. **Incluir competências técnicas** esperadas
4. **Adicionar exemplos** de candidatos ideais para cada profissão

**Exemplo de expansão futura**:
```python
PROFESSION_SPECIFIC_PROMPTS = {
    "Tecnologia": "Priorize avaliação de problem-solving, ...",
    "Vendas": "Foque em comunicação, persuasão, ...",
    # etc
}
```

---

## UI/UX

### Modal
- Estilo limpo e intuitivo
- Overlay semi-transparente
- Opções claramente diferenciadas
- Desabilita botões durante processamento

### Relatório
- Exibição em overlay full-screen
- Scroll caso conteúdo seja longo
- Botão "Fechar" para retornar
- Timestamp de geração

### Gerenciamento de Erros
- Banner de erro no topo da tela
- Mensagens amigáveis para usuários

---

## Próximas Fases (Sugestões Futuras)

1. **Persistência**: Salvar relatórios no banco de dados
2. **Histórico**: Visualizar relatórios anteriores
3. **Exportação**: Gerar PDF ou Word
4. **Comparação**: Comparar múltiplos candidatos
5. **Templates**: Criar templates de relatório personalizados por empresa

