import React from 'react';
import { createRoot } from 'react-dom/client';
import SidepanelApp from './sidepanel/App';

// Importar o CSS diretamente no JavaScript
import './sidepanel.css';

// Função para inicializar o aplicativo
function initApp() {
  // Verifica se o elemento raiz existe
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Elemento raiz não encontrado');
    return;
  }

  // Cria a raiz do React e renderiza o aplicativo
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <SidepanelApp />
    </React.StrictMode>
  );
}

// Inicializa o aplicativo quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Configura o listener para mensagens do background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Mensagem recebida no painel lateral:', request);
  
  // Adicione aqui a lógica para lidar com mensagens específicas
  // Por exemplo, atualizar o estado do componente com novos dados
  
  return true; // Mantém o canal de mensagem aberto para resposta assíncrona
});
