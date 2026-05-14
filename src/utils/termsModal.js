/**
 * EnergyFlow — Modal de Termos de Uso (US01-F3).
 *
 * Decisão de entrega do conteúdo: **inline em JS**.
 * Alternativas consideradas:
 *   - public/terms/terms_v1.md + fetch: adiciona request de rede e parsing
 *     de Markdown sem ganho real — o conteúdo é estático.
 *   - Endpoint do backend: desnecessário para conteúdo estático versionado
 *     junto ao código; o backend já registra qual versão o usuário aceitou
 *     (US01-B5) — o frontend só precisa exibir.
 *   - Inline em JS: zero request, sem parser de Markdown, versionado no
 *     mesmo commit que o docs/terms/terms_v1.md. Quando os termos mudarem,
 *     a versão JS é atualizada junto.
 *
 * Uso:
 *   import { openTermsModal } from '../utils/termsModal.js';
 *   openTermsModal({ onAccept: () => termsCheck.setChecked(true) });
 */
import { createModal }  from '../components/Modal.js';
import { createButton } from '../components/Button.js';

/** Versão atual dos termos (deve coincidir com US01-B5). */
export const TERMS_VERSION = 'v1';

/**
 * Conteúdo dos termos renderizado como HTML.
 * Gerado a partir de docs/terms/terms_v1.md — atualizar em conjunto.
 */
const TERMS_HTML = `
<div class="terms-content">
  <p class="terms-version">Versão: ${TERMS_VERSION} &nbsp;·&nbsp; Vigência: 07/05/2026</p>

  <h3>1. Aceitação dos Termos</h3>
  <p>Ao criar uma conta no EnergyFlow, o representante legal da empresa declara ter lido,
  compreendido e concordado integralmente com estes Termos de Uso.</p>

  <h3>2. Descrição do Serviço</h3>
  <p>O EnergyFlow é uma plataforma de gestão de energia elétrica para empresas do setor
  atacadista. O serviço permite monitorar o consumo de energia em tempo real por meio de
  sensores IoT, gerar relatórios e receber alertas de consumo.</p>

  <h3>3. Cadastro e Responsabilidades</h3>
  <ul>
    <li>O usuário responsável pelo cadastro deve ser o representante legal da empresa ou
    possuir poderes para tanto.</li>
    <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
    <li>O CNPJ informado deve ser válido e corresponder à empresa cadastrada.</li>
    <li>O usuário é responsável pela confidencialidade de suas credenciais de acesso.</li>
  </ul>

  <h3>4. Uso dos Dados</h3>
  <ul>
    <li>Os dados de consumo energético coletados pelos sensores são de propriedade da
    empresa cadastrada.</li>
    <li>O EnergyFlow utiliza os dados exclusivamente para prestação do serviço contratado.</li>
    <li>Dados são armazenados de forma segura e isolados por empresa (multi-tenancy).</li>
    <li>Consulte nossa Política de Privacidade para detalhes sobre tratamento de dados
    pessoais.</li>
  </ul>

  <h3>5. Limitações de Responsabilidade</h3>
  <p>O EnergyFlow não se responsabiliza por decisões operacionais tomadas com base nas
  informações exibidas na plataforma. Os dados são fornecidos como suporte à tomada de
  decisão, não como substituto de análise técnica especializada.</p>

  <h3>6. Vigência e Cancelamento</h3>
  <p>O serviço é prestado por prazo indeterminado, podendo ser cancelado a qualquer momento
  por qualquer das partes, mediante aviso prévio.</p>

  <h3>7. Alterações nos Termos</h3>
  <p>O EnergyFlow pode atualizar estes Termos periodicamente. Usuários serão notificados
  sobre alterações relevantes e, quando exigido por lei, será solicitado novo aceite.</p>
</div>
`;

/**
 * Abre o modal de termos de uso.
 *
 * @param {Object}   [opts]
 * @param {Function} [opts.onAccept]   - Callback chamado quando o usuário clica "Aceitar"
 * @param {Function} [opts.onClose]    - Callback chamado ao fechar sem aceitar
 */
export function openTermsModal({ onAccept, onClose } = {}) {
  // ── Conteúdo ──────────────────────────────────────────────────
  const contentEl = document.createElement('div');
  contentEl.innerHTML = TERMS_HTML;

  // ── Botões do footer ──────────────────────────────────────────
  const closeBtn = createButton({
    label: 'Fechar',
    variant: 'ghost',
    size: 'md',
  });

  const acceptBtn = createButton({
    label: 'Li e aceito os termos',
    variant: 'primary',
    size: 'md',
  });

  // ── Modal ─────────────────────────────────────────────────────
  const modal = createModal({
    title: 'Termos de Uso — EnergyFlow',
    content: contentEl,
    footer: [closeBtn, acceptBtn],
    size: 'lg',
    closeOnBackdrop: true,
    closeOnEsc: true,
    onClose: () => { if (onClose) onClose(); },
  });

  // Anexa ao body (removido ao fechar)
  document.body.appendChild(modal.el);

  // ── Eventos ───────────────────────────────────────────────────
  closeBtn.addEventListener('click', () => {
    modal.close();
    document.body.removeChild(modal.el);
  });

  acceptBtn.addEventListener('click', () => {
    modal.close();
    document.body.removeChild(modal.el);
    if (onAccept) onAccept();
  });

  modal.open();
}
