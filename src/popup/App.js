import React, { useEffect, useState } from 'react';
import { extractDomain } from '../background';

function App() {
  const [containers, setContainers] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Solicitar dados ao background script
    const getContainers = async () => {
      try {
        setLoading(true);
        // Obter a aba ativa
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        setActiveTab(tab);

        // Enviar mensagem para o background script
        const response = await chrome.runtime.sendMessage({ 
          action: 'getContainers',
          tabId: tab.id 
        });

        if (response && response.containers) {
          setContainers(response.containers);
        }
      } catch (err) {
        console.error('Error getting containers:', err);
        setError('Failed to load GTM container data');
      } finally {
        setLoading(false);
      }
    };

    getContainers();

    // Configurar listener para atualizações
    const messageListener = (message, sender, sendResponse) => {
      if (message.type === 'CONTAINER_UPDATED' && message.tabId === activeTab?.id) {
        setContainers(prev => ({
          ...prev,
          [message.containerId]: message.containerData
        }));
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [activeTab?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  const containerList = Object.values(containers);

  if (containerList.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        <p>No GTM containers found on this page</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">GTM Containers</h1>
      <div className="space-y-4">
        {containerList.map((container, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold">{container.id || 'Unknown Container'}</h2>
                {container.isProxy && (
                  <div className="text-sm text-gray-600">
                    Source: {extractDomain(container.url)}
                  </div>
                )}
                <div className="mt-2">
                  <span className="font-medium">Size: {container.sizeInKb}KB</span>
                  {container.sizeEstimate && (
                    <span className="ml-1 text-gray-500 text-xs" title="Estimated size - server did not provide Content-Length header">
                      (est.)
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  container.percent < 50 ? 'bg-green-100 text-green-800' :
                  container.percent < 80 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {container.percent}% of limit
                </span>
              </div>
            </div>
            
            {container.analyse && (
              <div className="mt-3 pt-3 border-t">
                <h3 className="text-sm font-medium mb-2">Container Analysis:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Tags: {container.analyse.tags?.total || 0}</div>
                  <div>Triggers: {container.analyse.triggers?.total || 0}</div>
                  <div>Variables: {container.analyse.variables?.total || 0}</div>
                  <div>Version: {container.analyse.version || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
