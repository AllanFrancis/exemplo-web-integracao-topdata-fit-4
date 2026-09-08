//#region node_modules/.nitro/vite/services/ssr/assets/protocolo-0mx9tKXd.js
var TIPOS_DE_EVENTO = [
  "HEARTBEAT",
  "ACCESS_OUTCOME",
  "DEVICE_STATUS_CHANGED",
  "PASSAGE_CONFIRMED",
  "PASSAGE_EXPIRED",
  "COMMAND_RESULT",
];
var ACENTOS = /[\u0300-\u036f]/g;
/**
 * Prepara texto para o display da catraca: 16 colunas, ASCII, sem acento.
 *
 * O Gateway ja trunca e remove acentos por conta propria — fazemos o mesmo aqui para
 * que a mensagem exibida na tela do sistema web seja exatamente a que a pessoa le na
 * catraca, sem surpresa entre o que foi escrito e o que apareceu.
 */
function paraDisplay(texto, colunas = 16) {
  return texto
    .normalize("NFD")
    .replace(ACENTOS, "")
    .replace(/[^\x20-\x7E]/g, "")
    .toUpperCase()
    .trim()
    .slice(0, colunas);
}
/** Mascara usada em log: o PIN completo so existe no corpo da requisicao. */
function mascararCredencial(credencial) {
  return credencial.length <= 3 ? "***" : `***${credencial.slice(-3)}`;
}
//#endregion
export { mascararCredencial as n, paraDisplay as r, TIPOS_DE_EVENTO as t };
