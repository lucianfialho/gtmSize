// Content script para comunicação entre a página e o background
console.log('Content script carregado');

// Enviar mensagem para o background quando o script for carregado
chrome.runtime.sendMessage({ type: 'contentScriptLoaded' });

// Ouvir mensagens do background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Mensagem recebida no content script:', request);
  
  // Responder a mensagens específicas
  if (request.type === 'ping') {
    sendResponse({ status: 'pong' });
  }
  
  return true; // Maném a porta de comunicação aberta para respostas assíncronas
});
