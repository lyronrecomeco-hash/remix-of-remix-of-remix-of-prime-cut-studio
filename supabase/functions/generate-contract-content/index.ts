import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractData {
  contract_number: string;
  contractor_name: string;
  contractor_document: string;
  contractor_document_type: string;
  contractor_address: string;
  contractor_email: string | null;
  contractor_phone: string | null;
  contracted_name: string;
  contracted_document: string;
  contracted_document_type: string;
  contracted_address: string;
  contracted_email: string | null;
  contracted_phone: string | null;
  service_type: string;
  service_description: string;
  service_modality: string;
  delivery_type: string;
  start_date: string;
  end_date: string | null;
  delivery_in_stages: boolean;
  allows_extension: boolean;
  total_value: number;
  payment_method: string;
  installments: number;
  late_fee_percentage: number | null;
  has_warranty: boolean;
  warranty_period: string | null;
  liability_limit: string | null;
  not_included: string | null;
  allows_early_termination: boolean;
  termination_penalty_percentage: number | null;
  notice_period_days: number;
  jurisdiction_city: string;
  jurisdiction_state: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contract: ContractData = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    const systemPrompt = `Você é um advogado sênior brasileiro especializado em Direito Contratual, com foco em contratos de prestação de serviços.

Sua tarefa é gerar um CONTRATO JURÍDICO COMPLETO, PROFISSIONAL E VÁLIDO NO BRASIL.

🧾 FORMATO OBRIGATÓRIO DO CONTRATO

O contrato DEVE COMEÇAR com um PREÂMBULO JURÍDICO FORMAL, seguindo este modelo:

"De um lado, **[NOME COMPLETO]**, [nacionalidade brasileira], [profissão conforme serviço], inscrito(a) no **[CPF/CNPJ]** sob o nº **[documento]**, residente e domiciliado(a) à **[endereço completo]**, doravante denominado(a) **CONTRATANTE**; e, de outro lado, **[NOME COMPLETO]**, [nacionalidade brasileira], [profissão conforme serviço], inscrito(a) no **[CPF/CNPJ]** sob o nº **[documento]**, com endereço profissional à **[endereço completo]**, doravante denominado(a) **CONTRATADO(a)**; têm entre si, justo e acordado, o presente CONTRATO DE PRESTAÇÃO DE SERVIÇOS, que se regerá pelas cláusulas e condições a seguir."

⚠️ REGRA DE FORMATAÇÃO CRÍTICA:
- Todos os NOMES de pessoas/empresas devem estar em **negrito**
- Todos os DOCUMENTOS (CPF, CNPJ) devem estar em **negrito**
- Todos os VALORES MONETÁRIOS devem estar em **negrito**
- Todas as DATAS importantes devem estar em **negrito**
- Os ENDEREÇOS completos devem estar em **negrito**
- Use ** para envolver o texto que deve ficar em negrito

📑 ESTRUTURA OBRIGATÓRIA - TODAS AS CLÁUSULAS DEVEM ESTAR PRESENTES:

CLÁUSULA PRIMEIRA – DO OBJETO
- Descrição detalhada do serviço
- Escopo incluso
- Escopo não incluso (se informado)
- Forma de execução (pontual/recorrente/por demanda)

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO CONTRATADO
- Execução técnica com qualidade
- Cumprimento de prazos
- Comunicação sobre andamento
- Correções necessárias

CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES DO CONTRATANTE
- Pagamentos nos prazos
- Fornecimento de informações necessárias
- Aprovações tempestivas
- Responsabilidades de suporte

CLÁUSULA QUARTA – DO PRAZO E CRONOGRAMA
- Data de início
- Data de término (se aplicável)
- Possibilidade de prorrogação
- Entregas parciais (se houver)

CLÁUSULA QUINTA – DO VALOR E DA FORMA DE PAGAMENTO
- Valor total em **negrito**
- Forma de pagamento
- Parcelamento (se aplicável) com valores em **negrito**
- Multa por atraso (se aplicável)
- Juros e correção monetária

CLÁUSULA SEXTA – DA GARANTIA
- Prazo de garantia (se aplicável)
- Limitações da garantia
- O que não é coberto

CLÁUSULA SÉTIMA – DA PROPRIEDADE INTELECTUAL
- Direitos autorais sobre o trabalho
- Cessão ou licença de uso
- Uso de materiais de terceiros

CLÁUSULA OITAVA – DA CONFIDENCIALIDADE
- Sigilo de informações
- Prazo de confidencialidade (2 anos)
- Penalidades por violação

CLÁUSULA NONA – DA PROTEÇÃO DE DADOS (LGPD)
- Tratamento de dados pessoais
- Finalidade do tratamento
- Responsabilidades das partes
- Conformidade com a Lei nº 13.709/2018

CLÁUSULA DÉCIMA – DA RESCISÃO
- Rescisão por qualquer das partes
- Aviso prévio necessário
- Multas aplicáveis
- Rescisão por descumprimento

CLÁUSULA DÉCIMA PRIMEIRA – DAS PENALIDADES
- Multas contratuais
- Indenizações
- Limites de responsabilidade

CLÁUSULA DÉCIMA SEGUNDA – DA INEXISTÊNCIA DE VÍNCULO
- Ausência de vínculo empregatício
- Autonomia das partes
- Responsabilidades trabalhistas

CLÁUSULA DÉCIMA TERCEIRA – DO CASO FORTUITO E FORÇA MAIOR
- Definição de eventos
- Suspensão de obrigações
- Comunicação entre partes

CLÁUSULA DÉCIMA QUARTA – DO FORO
- Foro eleito para dirimir questões

CLÁUSULA DÉCIMA QUINTA – DAS DISPOSIÇÕES FINAIS
- Prevalência do contrato sobre acordos verbais
- Alterações somente por aditivo escrito
- Nulidade parcial não afeta demais cláusulas

✍️ ENCERRAMENTO

Finalizar com:
- Local e data em **negrito**
- Campos de assinatura (**CONTRATANTE** e **CONTRATADO**)
- Campos para 2 testemunhas
- Observação sobre assinatura eletrônica válida nos termos da MP 2.200-2/2001

IMPORTANTE:
- Linguagem jurídica formal e precisa
- Texto claro, sem ambiguidades
- Todas as cláusulas numeradas corretamente
- Use **negrito** (com **) para destacar nomes, valores, datas e documentos
- NÃO incluir explicações, apenas o contrato`;

    const modalidadeMap: Record<string, string> = {
      'pontual': 'pontual (projeto único)',
      'recorrente': 'recorrente (mensal/periódico)',
      'demanda': 'por demanda (conforme necessidade)'
    };

    const entregaMap: Record<string, string> = {
      'digital': 'digital',
      'fisico': 'física',
      'misto': 'mista (digital e física)'
    };

    const userPrompt = `Gere o contrato completo com os seguintes dados:

CONTRATO Nº: ${contract.contract_number}

=== CONTRATANTE ===
Nome: ${contract.contractor_name}
Documento (${contract.contractor_document_type.toUpperCase()}): ${contract.contractor_document}
Endereço: ${contract.contractor_address}
${contract.contractor_email ? `E-mail: ${contract.contractor_email}` : ''}
${contract.contractor_phone ? `Telefone: ${contract.contractor_phone}` : ''}

=== CONTRATADO ===
Nome: ${contract.contracted_name}
Documento (${contract.contracted_document_type.toUpperCase()}): ${contract.contracted_document}
Endereço: ${contract.contracted_address}
${contract.contracted_email ? `E-mail: ${contract.contracted_email}` : ''}
${contract.contracted_phone ? `Telefone: ${contract.contracted_phone}` : ''}

=== OBJETO DO CONTRATO ===
Tipo de serviço: ${contract.service_type}
Descrição detalhada: ${contract.service_description}
Modalidade: ${modalidadeMap[contract.service_modality] || contract.service_modality}
Tipo de entrega: ${entregaMap[contract.delivery_type] || contract.delivery_type}
${contract.not_included ? `O que NÃO está incluso: ${contract.not_included}` : ''}

=== PRAZO ===
Data de início: ${formatDate(contract.start_date)}
${contract.end_date ? `Data de término: ${formatDate(contract.end_date)}` : 'Prazo: Indeterminado'}
Entrega em etapas: ${contract.delivery_in_stages ? 'Sim' : 'Não'}
Permite prorrogação: ${contract.allows_extension ? 'Sim' : 'Não'}

=== VALOR E PAGAMENTO ===
Valor total: ${formatCurrency(contract.total_value)}
Forma de pagamento: ${contract.payment_method}
${contract.installments > 1 ? `Parcelamento: ${contract.installments}x de ${formatCurrency(contract.total_value / contract.installments)}` : 'Pagamento: À vista'}
${contract.late_fee_percentage ? `Multa por atraso: ${contract.late_fee_percentage}% + juros de 1% ao mês` : ''}

=== GARANTIA ===
${contract.has_warranty ? `Possui garantia: Sim - ${contract.warranty_period}` : 'Possui garantia: Não aplicável a este tipo de serviço'}
${contract.liability_limit ? `Limite de responsabilidade: ${contract.liability_limit}` : ''}

=== RESCISÃO ===
Permite rescisão antecipada: ${contract.allows_early_termination ? 'Sim' : 'Não'}
${contract.termination_penalty_percentage ? `Multa por quebra contratual: ${contract.termination_penalty_percentage}% do valor restante` : ''}
Aviso prévio: ${contract.notice_period_days} dias

=== FORO ===
Cidade: ${contract.jurisdiction_city}
Estado: ${contract.jurisdiction_state}

LEMBRE-SE: Use **negrito** para destacar nomes, valores monetários, datas e documentos importantes.

Gere o contrato completo agora, sem explicações, apenas o texto do contrato.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating contract:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao gerar contrato' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
