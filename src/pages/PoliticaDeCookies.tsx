import LegalPageLayout from '@/components/legal/LegalPageLayout';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function PoliticaDeCookies() {
  return (
    <LegalPageLayout title="Política de Cookies" lastUpdated="7 de abril de 2026">
      <p>
        Esta Política de Cookies explica como o <strong>Genesis Hub</strong> utiliza cookies
        e tecnologias semelhantes quando você acessa nossa plataforma. Ao continuar navegando,
        você concorda com o uso de cookies conforme descrito neste documento.
      </p>

      <Section title="1. O Que São Cookies">
        <p>
          Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador,
          tablet ou smartphone) quando você visita um site. Eles permitem que o site reconheça
          seu dispositivo e armazene informações sobre suas preferências e interações anteriores.
        </p>
        <p>
          Além de cookies, podemos utilizar tecnologias semelhantes como <em>local storage</em>,
          <em>session storage</em> e identificadores de sessão.
        </p>
      </Section>

      <Section title="2. Categorias de Cookies Utilizados">
        <div className="space-y-4 mt-3">
          <div className="rounded-lg border border-border/30 p-4">
            <h3 className="text-base font-medium text-foreground mb-2">🔒 Cookies Estritamente Necessários</h3>
            <p>
              Essenciais para o funcionamento da plataforma. Incluem cookies de autenticação
              de sessão, preferências de segurança e tokens de acesso. Sem esses cookies,
              a plataforma não pode funcionar corretamente.
            </p>
            <p className="text-xs text-muted-foreground/50 mt-2">Base legal: legítimo interesse / execução de contrato</p>
          </div>

          <div className="rounded-lg border border-border/30 p-4">
            <h3 className="text-base font-medium text-foreground mb-2">📊 Cookies de Análise e Desempenho</h3>
            <p>
              Utilizados para coletar informações sobre como os usuários interagem com a plataforma,
              incluindo páginas visitadas, tempo de permanência e eventuais erros encontrados.
              Essas informações são utilizadas de forma agregada para melhorar a experiência do usuário.
            </p>
            <p className="text-xs text-muted-foreground/50 mt-2">Exemplos: dados de navegação, métricas de uso interno</p>
          </div>

          <div className="rounded-lg border border-border/30 p-4">
            <h3 className="text-base font-medium text-foreground mb-2">⚙️ Cookies de Funcionalidade</h3>
            <p>
              Permitem que a plataforma lembre suas preferências (como idioma, tema ou configurações
              de exibição) para oferecer uma experiência personalizada e mais eficiente.
            </p>
          </div>

          <div className="rounded-lg border border-border/30 p-4">
            <h3 className="text-base font-medium text-foreground mb-2">📣 Cookies de Marketing e Publicidade</h3>
            <p>
              Quando utilizados, servem para exibir conteúdo e anúncios relevantes com base em
              seu perfil de navegação. Podem ser definidos por parceiros de publicidade e
              plataformas de anúncios.
            </p>
            <p className="text-xs text-muted-foreground/50 mt-2">
              Base legal: consentimento do usuário
            </p>
          </div>
        </div>
      </Section>

      <Section title="3. Cookies de Terceiros">
        <p>
          A plataforma pode utilizar serviços de terceiros que definem seus próprios cookies,
          incluindo:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Serviços de autenticação:</strong> para login e gerenciamento de sessão</li>
          <li><strong>Serviços de análise:</strong> para compreensão do comportamento dos usuários</li>
          <li><strong>Gateways de pagamento:</strong> para processamento seguro de transações</li>
          <li><strong>Provedores de IA:</strong> para funcionalidades de inteligência artificial</li>
        </ul>
        <p className="mt-3">
          Cada serviço de terceiro possui sua própria política de cookies e privacidade.
          Recomendamos a leitura dessas políticas para entender como seus dados são tratados
          por esses provedores.
        </p>
      </Section>

      <Section title="4. Prazo de Retenção">
        <p>Os cookies podem ter diferentes prazos de validade:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Cookies de sessão:</strong> expiram ao fechar o navegador</li>
          <li><strong>Cookies persistentes:</strong> permanecem no dispositivo por um período definido (geralmente de 30 dias a 1 ano)</li>
          <li><strong>Local storage:</strong> permanece até ser manualmente removido ou limpo pelo navegador</li>
        </ul>
      </Section>

      <Section title="5. Como Gerenciar Cookies">
        <p>
          Você pode gerenciar ou desativar cookies a qualquer momento por meio das configurações
          do seu navegador. Os procedimentos variam conforme o navegador utilizado:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong>Google Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
          <li><strong>Firefox:</strong> Opções → Privacidade e Segurança → Cookies</li>
          <li><strong>Safari:</strong> Preferências → Privacidade → Cookies</li>
          <li><strong>Edge:</strong> Configurações → Cookies e permissões do site</li>
        </ul>
        <p className="mt-3">
          Também é possível limpar cookies já armazenados no dispositivo a qualquer momento
          pelas configurações do navegador.
        </p>
      </Section>

      <Section title="6. Impacto na Navegação">
        <p>
          A desativação de cookies pode impactar a experiência de uso da plataforma. Alguns
          recursos podem não funcionar corretamente sem cookies estritamente necessários,
          incluindo:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Manutenção da sessão de login</li>
          <li>Preferências de tema e configurações do usuário</li>
          <li>Funcionamento de funcionalidades interativas</li>
        </ul>
      </Section>

      <Section title="7. Consentimento e Revogação">
        <p>
          Ao acessar a plataforma pela primeira vez, você será informado sobre o uso de cookies.
          O consentimento para cookies não estritamente necessários pode ser revogado a qualquer
          momento por meio das configurações do navegador ou, quando disponível, pelo gerenciador
          de preferências de cookies da plataforma.
        </p>
        {/* [EDITAR: Se implementar banner de cookies, adicionar referência aqui] */}
      </Section>

      <Section title="8. Alterações desta Política">
        <p>
          Esta Política de Cookies pode ser atualizada periodicamente. A versão mais recente
          estará sempre disponível nesta página, com a data de última atualização indicada no
          topo do documento.
        </p>
      </Section>

      <Section title="9. Contato">
        <p>
          Para dúvidas ou solicitações relacionadas ao uso de cookies, entre em contato:
        </p>
        <ul className="list-none space-y-1 mt-2">
          <li><strong>WhatsApp:</strong> (27) 92000-5215</li>
          <li><strong>E-mail:</strong> [EMAIL DE CONTATO] {/* [EDITAR] */}</li>
        </ul>
      </Section>
    </LegalPageLayout>
  );
}
