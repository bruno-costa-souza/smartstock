/*
 * Controle de estoque desativado por enquanto (2026-07-09).
 * Com `false`: a vitrine nunca mostra "Esgotado"/"Últimas unidades",
 * os campos de estoque ficam desabilitados no cadastro de produto,
 * e a página Estoque sai do menu/rotas do admin.
 * Para reativar tudo, basta mudar para `true`.
 */
export const ESTOQUE_ATIVO: boolean = false;
