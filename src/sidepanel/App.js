import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Mapeamento de tags conhecidas (mesmo do background.js)
const KNOWN_TAGS = {
  'ga': { name: 'Google Analytics (Legacy)', category: 'google' },
  'ua': { name: 'Universal Analytics', category: 'google' },
  'gaawe': { name: 'Google Analytics 4', category: 'google' },
  'awct': { name: 'Google Ads Conversion', category: 'google' },
  'sp': { name: 'Google Ads Remarketing', category: 'google' },
  'flc': { name: 'Floodlight Counter', category: 'google' },
  'fls': { name: 'Floodlight Sales', category: 'google' },
  'ts': { name: 'Google Trusted Stores', category: 'google' },
  'gcs': { name: 'Google Consumer Surveys', category: 'google' },
  'gclidw': { name: 'Google Ads Conversion Linker', category: 'google' },
  'gaawc': { name: 'Google Tag (GA4)', category: 'google' },
  'html': { name: 'Custom HTML', category: 'custom' },
  'img': { name: 'Custom Image', category: 'custom' },
  'cegg': { name: 'Crazy Egg', category: 'analytics' },
  'mf': { name: 'Mouseflow', category: 'analytics' },
  'pntr': { name: 'Pinterest', category: 'social' },
  'twitter_website_tag': { name: 'Twitter Website Tag', category: 'social' },
  'bzi': { name: 'LinkedIn Insight', category: 'social' },
  'fbq': { name: 'Facebook Pixel', category: 'advertising' },
  'crto': { name: 'Criteo', category: 'advertising' },
  'pa': { name: 'Perfect Audience', category: 'advertising' },
  'qcm': { name: 'Quantcast', category: 'advertising' },
  'qpx': { name: 'Quora Pixel', category: 'advertising' },
  'scjs': { name: 'SaleCycle JS', category: 'marketing' },
  'scp': { name: 'SaleCycle Pixel', category: 'marketing' },
  'okt': { name: 'Oktopost', category: 'social' },
  'zone': { name: 'Zonas', category: 'other' },
  'yieldify': { name: 'Yieldify', category: 'marketing' },
  'xpsh': { name: 'Xtremepush', category: 'marketing' },
  'vei': { name: 'Ve Interactive', category: 'marketing' },
  'veip': { name: 'Ve Pixel', category: 'marketing' },
  'vdc': { name: 'VisualDNA', category: 'analytics' },
  'uslt': { name: 'Upsellit Footer', category: 'marketing' },
  'uspt': { name: 'Upsellit Confirmation', category: 'marketing' },
  'tdc': { name: 'Turn Data Collection', category: 'analytics' },
  'tc': { name: 'Turn Conversion', category: 'analytics' },
  'tdsc': { name: 'Tradedoubler Sale', category: 'affiliate' },
  'tdlc': { name: 'Tradedoubler Lead', category: 'affiliate' },
  'svw': { name: 'Survicate', category: 'feedback' },
  'shareaholic': { name: 'Shareaholic', category: 'social' },
  'sfr': { name: 'SearchForce Redirect', category: 'advertising' },
  'sfl': { name: 'SearchForce Landing', category: 'advertising' },
  'sfc': { name: 'SearchForce Conversion', category: 'advertising' },
  'sca': { name: 'Intent Media', category: 'advertising' },
  'placedPixel': { name: 'Placed', category: 'analytics' },
  'pc': { name: 'Personali Canvas', category: 'personalization' },
  'nudge': { name: 'Nudge', category: 'feedback' },
  'ndcr': { name: 'Nielsen DCR', category: 'analytics' },
  'messagemate': { name: 'Message Mate', category: 'chat' },
  'mpr': { name: 'Mediaplex ROI', category: 'advertising' },
  'mpm': { name: 'Mediaplex MCT', category: 'advertising' },
  'ms': { name: 'Marin Software', category: 'advertising' },
  'ljs': { name: 'Lytics JS', category: 'analytics' },
  'll': { name: 'LeadLab', category: 'marketing' },
  'k50Init': { name: 'K50', category: 'analytics' },
  'infinity': { name: 'Infinity Call', category: 'analytics' },
  'hjtc': { name: 'Hotjar', category: 'analytics' },
  'fxm': { name: 'FoxMetrics', category: 'analytics' },
  'dstag': { name: 'DistroScale', category: 'content' },
  'cts': { name: 'ClickTale', category: 'analytics' },
  'csm': { name: 'comScore', category: 'analytics' },
  'bb': { name: 'Bizrate Buyer', category: 'feedback' },
  'bsa': { name: 'Bizrate Survey', category: 'feedback' },
  'baut': { name: 'Bing Universal', category: 'advertising' },
  'awj': { name: 'Affiliate Window', category: 'affiliate' },
  'awc': { name: 'Affiliate Window Conv', category: 'affiliate' },
  'asp': { name: 'AdRoll Smart Pixel', category: 'advertising' },
  'adm': { name: 'Adometry', category: 'analytics' },
  'ta': { name: 'AdAdvisor/Neustar', category: 'advertising' },
  'abtGeneric': { name: 'AB Tasty', category: 'testing' }
};

// Categorias amigáveis
const CATEGORY_NAMES = {
  'google': 'Google',
  'custom': 'Custom',
  'analytics': 'Analytics',
  'advertising': 'Advertising',
  'marketing': 'Marketing',
  'social': 'Social Media',
  'affiliate': 'Affiliate',
  'feedback': 'Feedback',
  'testing': 'A/B Testing',
  'chat': 'Chat',
  'content': 'Content',
  'personalization': 'Personalization',
  'other': 'Other'
};

function SidepanelApp() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containers, setContainers] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [pageLoadTime, setPageLoadTime] = useState(null);
  const [imageExists, setImageExists] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // Controla se já está buscando
  const [lastFetchTime, setLastFetchTime] = useState(0); // Rastreia quando foi a última busca


  // Efeito para verificar se a imagem do banner existe
  useEffect(() => {
    const img = new Image();
    img.src = "https://s3.sa-east-1.amazonaws.com/download.metricasboss.com.br/banner_extension.png";
    img.onload = () => setImageExists(true);
    img.onerror = () => setImageExists(false);
    
    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  // Função para carregar containers do cache local
  const loadFromCache = useCallback(async (tabId) => {
    try {
      // Verifica se o chrome.storage está disponível
      if (!chrome.storage || !chrome.storage.local) {
        console.log('chrome.storage.local não está disponível');
        return null;
      }
      
      const result = await chrome.storage.local.get(`containers_${tabId}`);
      const cachedData = result[`containers_${tabId}`];
      
      if (cachedData && (Date.now() - cachedData.timestamp < 5 * 60 * 1000)) {
        console.log('Containers carregados do cache:', cachedData.containers);
        return cachedData.containers;
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar do cache:', error);
      return null;
    }
  }, []);
  
  // Função para salvar containers no cache local
  const saveToCache = useCallback(async (tabId, containers) => {
    try {
      // Verifica se o chrome.storage está disponível
      if (!chrome.storage || !chrome.storage.local) {
        console.log('chrome.storage.local não está disponível para salvar');
        return false;
      }
      
      if (!tabId || !containers) {
        console.error('Dados inválidos para salvar no cache');
        return false;
      }
      
      const cacheKey = `containers_${tabId}`;
      const cacheData = {
        containers,
        timestamp: Date.now(),
        url: window.location.href
      };
      
      await chrome.storage.local.set({ [cacheKey]: cacheData });
      console.log('Dados salvos no cache com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
      return false;
    }
  }, []);

  // Função para buscar os containers do background
  const getContainers = useCallback(async (tabId, forceUpdate = false) => {
    // Se já estiver buscando e não for uma atualização forçada, ignora
    if (isFetching && !forceUpdate) {
      console.log('[getContainers] Busca já em andamento, ignorando...');
      return;
    }

    // Se não for uma atualização forçada e já tivermos dados, não faz nada
    if (!forceUpdate && Object.keys(containers).length > 0) {
      console.log('[getContainers] Já temos dados, ignorando busca...');
      return;
    }

    console.log(`[getContainers] Iniciando busca por containers (forçado: ${forceUpdate})...`);
    
    try {
      setIsFetching(true);
      setLoading(true);
      setError(null);
      
      const tab = tabId ? { id: tabId } : await chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0]);
      
      if (!tab) {
        console.error('Nenhuma aba ativa encontrada');
        setError('Nenhuma aba ativa encontrada');
        return;
      }
      
      // Atualiza a aba ativa apenas se for diferente
      setActiveTab(prevTab => prevTab?.id === tab.id ? prevTab : tab);
      
      // Tenta carregar do cache primeiro (apenas se não for uma atualização forçada)
      if (!forceUpdate) {
        const cachedContainers = await loadFromCache(tab.id);
        if (cachedContainers && Object.keys(cachedContainers).length > 0) {
          console.log('[getContainers] Usando containers do cache');
          setContainers(cachedContainers);
          setLoading(false);
          
          // Se já temos dados do cache, não precisamos buscar do background
          // a menos que seja uma atualização forçada
          if (!forceUpdate) {
            return;
          }
        }
      }
      
      // Busca do background (atualização em tempo real)
      console.log('[getContainers] Buscando dados do background...');
      const response = await Promise.race([
        chrome.runtime.sendMessage({ 
          action: 'getContainers',
          tabId: tab.id 
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao buscar containers')), 2000)
        )
      ]);

      console.log('[getContainers] Resposta do background recebida');
      
      if (response?.containers) {
        console.log('[getContainers] Atualizando containers com dados do background');
        
        // Atualiza o estado apenas se os dados forem diferentes
        setContainers(prevContainers => {
          const hasChanges = JSON.stringify(prevContainers) !== JSON.stringify(response.containers);
          if (hasChanges) {
            return response.containers;
          }
          return prevContainers;
        });
        
        if (response.pageLoadTiming) {
          setPageLoadTime(prev => prev === response.pageLoadTiming ? prev : response.pageLoadTiming);
        }
        
        // Atualiza o cache
        await saveToCache(tab.id, response.containers);
      }
    } catch (err) {
      console.error('[getContainers] Erro ao buscar containers:', err);
      if (Object.keys(containers).length === 0) {
        setError('Não foi possível carregar os dados. Tente recarregar a página.');
      }
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, [isFetching, loadFromCache, saveToCache, containers]);

  // Efeito para configurar listeners e buscar containers iniciais
  useEffect(() => {
    console.log('[useEffect] Configurando listeners...');
    let isMounted = true;
    
    // Função para processar mensagens recebidas
    const messageListener = (message, sender, sendResponse) => {
      if (!isMounted || message.target !== 'sidepanel') {
        return;
      }
      
      console.log('[messageListener] Mensagem recebida:', message.action);
      
      if (message.action === 'updateContainers' && message.containers) {
        console.log('[messageListener] Atualizando containers');
        
        // Atualiza o estado apenas se os dados forem diferentes
        setContainers(prevContainers => {
          const hasChanges = JSON.stringify(prevContainers) !== JSON.stringify(message.containers);
          if (hasChanges) {
            return message.containers;
          }
          return prevContainers;
        });
        
        if (message.pageLoadTiming) {
          setPageLoadTime(prev => prev === message.pageLoadTiming ? prev : message.pageLoadTiming);
        }
        
        // Atualiza o cache
        if (activeTab?.id) {
          saveToCache(activeTab.id, message.containers).catch(console.error);
        }
      }
      
      if (sendResponse) {
        sendResponse({ success: true });
      }
      
      return true;
    };

    // Configura o listener de mensagens
    chrome.runtime.onMessage.addListener(messageListener);
    
    // Busca inicial após um pequeno atraso
    const timer = setTimeout(() => {
      if (isMounted) {
        console.log('[useEffect] Iniciando busca inicial...');
        getContainers().catch(console.error);
      }
    }, 100);
    
    // Função para lidar com mudanças de visibilidade
    const handleVisibilityChange = () => {
      if (isMounted && document.visibilityState === 'visible' && activeTab?.id && !isFetching) {
        console.log('[handleVisibilityChange] Painel visível, verificando atualizações...');
        getContainers(activeTab.id, true).catch(console.error);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Limpa os listeners quando o componente for desmontado
    return () => {
      isMounted = false;
      clearTimeout(timer);
      chrome.runtime.onMessage.removeListener(messageListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, isFetching, getContainers, saveToCache]);

  // Função auxiliar para obter informações da tag
  const getTagInfo = (tagId) => {
    // Verifica se é um template customizado
    if (tagId.startsWith('cvt_')) {
      return {
        name: 'Custom Template',
        category: 'custom'
      };
    }

    // Remove o prefixo '__' se existir
    const cleanTagId = tagId.startsWith('__') ? tagId.substring(2) : tagId;
    
    // Verifica se a tag é conhecida
    const knownTag = KNOWN_TAGS[cleanTagId];
    if (knownTag) {
      return {
        name: knownTag.name,
        category: CATEGORY_NAMES[knownTag.category] || 'Other'
      };
    }

    // Para tags desconhecidas, retorna o ID original
    return {
      name: cleanTagId,
      category: 'Other'
    };
  };

  // Função para renderizar as tags agrupadas por categoria
  const renderTagsByCategory = (tags) => {
    if (!tags || !tags.byCategory) return null;
    
    // Primeiro, processamos todas as tags para ter uma estrutura organizada
    const processedTags = [];
    
    // Itera sobre as categorias
    Object.entries(tags.byCategory || {}).forEach(([category, count]) => {
      if (count > 0) {
        const categoryTags = [];
        
        // Encontra todas as tags desta categoria
        Object.entries(tags.byType || {}).forEach(([tagName, tagCount]) => {
          if (tagCount > 0) {
            const tagInfo = getTagInfo(tagName);
            if (tagInfo.category === category) {
              categoryTags.push({
                name: tagInfo.name,
                count: tagCount
              });
            }
          }
        });
        
        if (categoryTags.length > 0) {
          processedTags.push({
            category,
            count,
            tags: categoryTags
          });
        }
      }
    });
    
    // Ordena as categorias alfabeticamente
    processedTags.sort((a, b) => a.category.localeCompare(b.category));
    
    // Renderiza as categorias e suas tags
    return processedTags.map(({ category, count, tags: categoryTags }) => (
      <div key={category} className="mb-4">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
          {category} <span className="text-gray-500 text-xs">({count} {count === 1 ? 'tag' : 'tags'})</span>
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-sm">
          {categoryTags.sort((a, b) => a.name.localeCompare(b.name)).map(tag => (
            <div key={`${tag.name}-${category}`} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-gray-800 dark:text-gray-200">{tag.name}</span>
              <span className="text-gray-500">{tag.count}</span>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const containerList = Object.entries(containers).map(([containerId, container]) => ({
    ...container,
    url: container.url || '',
    id: containerId
  }));

  // Se estiver carregando, mostra apenas o loading
  if (loading) {
    return (
      <div className="min-h-full" style={{ maxWidth: '400px', width: '360px' }}>
        <header className="bg-card border-b" style={{ maxWidth: '400px', width: '360px', minHeight: '200px' }}>
          <div className="p-6 flex flex-col items-center justify-center h-full space-y-8">
            <h1 className="text-2xl font-light text-center leading-tight">
              Welcome to Get<br />Google Tag Manager Size
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </header>
      </div>
    );
  }

  // Se houver erro, mostra o header e a mensagem de erro
  if (error) {
    return (
      <div className="min-h-full" style={{ maxWidth: '400px', width: '360px' }}>
        <header className="bg-card border-b" style={{ maxWidth: '400px', width: '360px', minHeight: '200px' }}>
          <div className="p-6 flex flex-col items-center justify-center h-full space-y-8">
            <h1 className="text-2xl font-light text-center leading-tight">
              Welcome to Get<br />Google Tag Manager Size
            </h1>
            <div className="text-red-500 text-center">
              <p>Error: {error}</p>
            </div>
          </div>
        </header>
      </div>
    );
  }

  // Se não houver containers, mostra o header e a mensagem
  if (containerList.length === 0) {
    return (
      <div className="min-h-full" style={{ maxWidth: '400px', width: '360px' }}>
        <header className="bg-card border-b" style={{ maxWidth: '400px', width: '360px', minHeight: '200px' }}>
          <div className="p-6 flex flex-col items-center justify-center h-full space-y-8">
            <h1 className="text-2xl font-light text-center leading-tight">
              Welcome to Get<br />Google Tag Manager Size
            </h1>
            <div className="text-center">
              <p className="text-gray-600">No GTM containers found on this page</p>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ maxWidth: '400px', width: '360px' }}>
      {/* Header */}
      <header className="bg-card border-b" style={{ maxWidth: '400px', width: '360px', minHeight: '200px' }}>
        <div className="p-6 flex flex-col items-center justify-center h-full space-y-8">
          <h1 className="text-2xl font-light text-center leading-tight">
            Welcome to Get<br />Google Tag Manager Size
          </h1>
          <div className="text-center">
            <span className="block text-sm text-gray-500 mb-1">Powered by</span>
            <a href="https://metricasboss.com.br" target="_blank" rel="noopener noreferrer" className="inline-block">
              <img 
                src="assets/logo-metricasboss-b.png" 
                alt="Métricas Boss Logo" 
                className="h-8 mx-auto transition-opacity hover:opacity-90" 
              />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="space-y-4">
          <div className="space-y-4">
            {containerList.map((container, index) => (
              <div className="bg-card border rounded-lg p-4" key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-sm flex flex-col">
                      {container.id}
                    </h2>
                    {container.isProxy && container.url && (
                      <div className="flex flex-col gap-2 mt-1">
                        <span className="text-xs text-gray-600 break-all">
                          {(() => {
                            try {
                              return new URL(container.url).hostname;
                            } catch (e) {
                              return 'Invalid URL';
                            }
                          })()}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 inline-block w-max">
                          PROXY
                        </span>
                      </div>
                    )}
                    <div className="mt-2 space-y-3">
                      <div>
                        <span className="font-medium">Size: {container.sizeInKb}KB</span>
                        {container.sizeEstimate && (
                          <div className="group relative inline-block">
                            <span className="ml-1 text-gray-500 text-xs cursor-help border-b border-dotted border-gray-400">
                              (est.)
                            </span>
                            <div className="absolute z-10 hidden group-hover:block w-52 p-2 mt-1 text-xs text-gray-600 bg-white border border-gray-200 rounded shadow-lg">
                              Estimated size - the server did not provide a Content-Length header
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-sm">
                        <div>Load Time: {container.timing?.loadTime || 'N/A'}s</div>
                        <div>Page Load Time: {pageLoadTime || 'N/A'}s</div>
                      </div>
                      
                      {/* Seção de Tags por Categoria */}
                      {container.tags?.byCategory && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <h3 className="font-medium text-sm mb-2">Tags by Category</h3>
                          {renderTagsByCategory(container.tags)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                  {container.percent > 100 ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      {container.percent}% - Exceeds Limit
                    </span>
                  ) : (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      container.percent < 50 ? 'bg-green-100 text-green-800' :
                      container.percent < 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {container.percent}% of limit
                    </span>
                  )}
                </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <h3 className="text-sm font-medium mb-2">Container Analysis:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Tags: <strong>{container.analyse?.tags?.total || 0}</strong></div>
                    <div>Triggers: <strong>{container.analyse?.triggers?.total || 0}</strong></div>
                    <div>Variables: <strong>{container.analyse?.macros?.total || 0}</strong></div>
                    <div>Version: <strong>{container.analyse?.version || 'N/A'}</strong></div>
                  </div>
                  {container.analyse?.tags?.byName && Object.keys(container.analyse.tags.byName).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h3 className="text-sm font-medium mb-2">
                        Tags ({container.analyse.tags.total}):
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 text-sm">
                        <ul className="space-y-1">
                          {Object.entries(container.analyse.tags.byName).map(([tagName, count]) => (
                            <li key={tagName} className="flex justify-between items-center">
                              <span className="font-medium">{tagName}</span>
                              <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">
                                {count}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {console.log('Triggers data in sidepanel:', container.analyse?.triggers)}
                  {container.analyse?.triggers?.byName && Object.keys(container.analyse.triggers.byName).length > 0 ? (
                    <div className="mt-3 pt-3 border-t">
                      <h3 className="text-sm font-medium mb-2">
                        Triggers ({container.analyse.triggers.total}):
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 text-sm">
                        <ul className="space-y-1">
                          {Object.entries(container.analyse.triggers.byName).map(([triggerName, count]) => {
                            console.log(`Rendering trigger: ${triggerName} (${count})`);
                            return (
                              <li key={triggerName} className="flex justify-between items-center">
                                <span>{triggerName}</span>
                                <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">
                                  {count}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t">
                      <h3 className="text-sm font-medium mb-2">No triggers found</h3>
                    </div>
                  )}
                  {container.analyse?.macros?.byName && Object.keys(container.analyse.macros.byName).length > 0 ? (
                    <div className="mt-3 pt-3 border-t">
                      <h3 className="text-sm font-medium mb-2">
                        Variables ({container.analyse.macros.total}):
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 text-sm">
                        <ul className="space-y-1">
                          {Object.entries(container.analyse.macros.byName).map(([macroName, count]) => (
                            <li key={macroName} className="flex justify-between items-center">
                              <span>{macroName}</span>
                              <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">
                                {count}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t">
                      <h3 className="text-sm font-medium mb-2">No variables found</h3>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Banner */}
      {imageExists && (
        <div className="p-4 border-t border-gray-200">
          <a
            href="https://metricasboss.com.br/api/extension/link"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src="https://s3.sa-east-1.amazonaws.com/download.metricasboss.com.br/banner_extension.png"
              alt="Banner da extensão"
              className="w-full h-auto rounded"
            />
          </a>
        </div>
      )}
    </div>
  );
}

export default SidepanelApp;
