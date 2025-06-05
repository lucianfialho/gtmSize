import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "../assets/tailwind.css";
import Accordion from "../components/accordion";

const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

function App() {
  const [containers, setContainers] = useState({});
  const [error, setError] = useState(false);
  const [message, setMessage] = useState(false);
  const [pageLoading, setPageLoading] = useState(0);
  const [imageExists, setImageExists] = useState(false);

  useEffect(() => {
    const sendMessageToBackground = async () => {
      console.log('Querying active tab...');
      
      try {
        // Verificar se a API de extensão está disponível
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.tabs) {
          console.error('Chrome extension API not available');
          setError(true);
          setMessage('Extensão não está disponível neste contexto');
          return;
        }

        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tabs || tabs.length === 0) {
          console.error('No active tab found');
          setError(true);
          setMessage('Nenhuma aba ativa encontrada');
          return;
        }
        
        console.log('Active tab found:', tabs[0]);
        console.log('Sending message to background script...');
        
        try {
          const response = await chrome.runtime.sendMessage({ 
            action: 'getContainers',
            tabId: tabs[0].id 
          });
          
          console.log('Response from background:', response);
          
          if (!response) {
            console.error('No response received from background script');
            setError(true);
            setMessage('Nenhum dado recebido');
            return;
          }
          
          console.log('Containers data received:', response.containers);
          
          setContainers(response.containers || {});
          setPageLoading(parseFloat(response.pageLoadTiming) || 0);

          const containerCount = Object.keys(response.containers || {}).length;
          console.log('Number of containers found:', containerCount);

          if (containerCount > 1) {
            setError(true);
            setMessage(
              `Encontrados ${containerCount} containers GTM. Múltiplos containers podem causar conflitos.`
            );
          } else if (containerCount === 0) {
            setError(true);
            setMessage('Nenhum container GTM encontrado. Atualize a página e tente novamente.');
          } else {
            setError(false);
            setMessage('');
          }
          
        } catch (error) {
          console.error('Error sending message to background:', error);
          setError(true);
          setMessage('Erro ao buscar dados do GTM');
        }
      } catch (error) {
        console.error('Error querying tabs:', error);
        setError(true);
        setMessage('Erro ao acessar as abas');
      }
    };

    // Verificar se a imagem existe
    const img = new Image();
    img.src = "https://s3.sa-east-1.amazonaws.com/download.metricasboss.com.br/banner_extension.png";
    img.onload = () => setImageExists(true);
    img.onerror = () => setImageExists(false);

    // Executar a busca pelos containers
    if (chrome.runtime?.id) {
      sendMessageToBackground();
    } else {
      // Se a API ainda não estiver pronta, tenta novamente em 1 segundo
      const timer = setTimeout(() => {
        sendMessageToBackground();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="w-[22.875rem] rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
      <div className="flex flex-col p-4">
        <div className="flex-auto">
          <header className="flex items-center gap-2">
            <img className="w-8 h-8" src="/icon-38x38.png" />
            <div className="flex flex-col">
              <h1 className="font-medium text-base">Google Tag Manager Size</h1>
              <a
                className=" underline text-blue-500"
                target="_blank"
                href="https://metricasboss.com.br/artigos/google-tag-manager-vai-deixar-o-meu-site-lento"
              >
                Learn more
              </a>
            </div>
          </header>
          {error && (
            <div
              className="flex p-4 my-4 text-sm text-red-800 border-t-4 rounded-t-none border-red-800 rounded-lg bg-red-100 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              <span className="sr-only">Error:</span>
              <div className="ml-2">{message}</div>
            </div>
          )}

          {Object.entries(containers).map(([containerId, data], index) => (
            <div
              key={index}
              className="flex-auto my-4 border solid rounded-md p-4"
            >
              <div className="font-medium flex items-center gap-2">
                Container ID: {containerId}
                {data.isProxy && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                    Server-side GTM
                  </span>
                )}
              </div>
              {data.isProxy && (
                <div className="mt-1 text-xs text-slate-600">
                  <span className="font-medium">Source:</span> {extractDomain(data.url)}
                </div>
              )}
              <div className="mt-1 text-slate-500">
                <div className="flex items-center">
                  Size:&nbsp;
                  <span className="font-medium flex items-center">
                    {data.sizeInKb}KB
                    {data.sizeEstimate && (
                      <span className="group relative ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066a1.75 1.75 0 001.271 1.34 1.75 1.75 0 10.257-3.478.25.25 0 01.24-.304h.5a.75.75 0 000-1.5h-.5a.25.25 0 01-.24-.304l.459-2.066a1.75 1.75 0 10-3.478-.257.25.25 0 01-.304.244H9z" clipRule="evenodd" />
                        </svg>
                        <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-64">
                          Tamanho estimado - o servidor não forneceu o cabeçalho Content-Length. Este valor é uma aproximação baseada no tamanho do arquivo baixado.
                        </span>
                      </span>
                    )}&nbsp;
                    {data.percent <= 49 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 fill-green-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : data.percent >= 50 && data.percent <= 69 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 fill-orange-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 fill-red-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                </div>
                <div className="flex">
                  Loading Time:&nbsp;
                  <span className="font-medium flex items-center">
                    {data.timing?.loadTime || "N/A"} seconds
                  </span>
                </div>
                <div className="flex">
                  Page Loading Time:&nbsp;
                  <span className="font-medium flex items-center">
                    {pageLoading} seconds
                  </span>
                </div>
              </div>
              <Accordion title={`Detail View`}>
                <p>
                  <span className="font-medium">Variables:</span>{" "}
                  {data.analyse?.macros || "N/A"}
                </p>
                <p>
                  <span className="font-medium mt-2">Triggers:</span>{" "}
                  {data.analyse?.rules || "N/A"}
                </p>
                <p>
                  <span className="font-medium mt-2">Tags:</span>{" "}
                  {data.analyse?.tags ? 
                    (data.analyse.tags._html +
                    data.analyse.tags.__gaawe +
                    data.analyse.tags.__googtag) : "N/A"
                  }
                  {data.analyse?.tags && (
                    <ul className="list-disc list-inside font-normal ml-2">
                      <li>
                        <span className="font-normal">Custom HTML:</span>{" "}
                        {data.analyse.tags._html}
                      </li>
                      <li>
                        <span className="font-normal">GA4 Event:</span>{" "}
                        {data.analyse.tags.__gaawe}
                      </li>
                      <li>
                        <span className="font-normal">GTAG:</span>{" "}
                        {data.analyse.tags.__googtag}
                      </li>
                    </ul>
                  )}
                </p>
                {data.analyse?.version && (
                  <p>
                    <span className="font-medium mt-2">GTM Version:</span>{" "}
                    {data.analyse.version}
                  </p>
                )}
                {data.url && (
                  <p className="mt-2">
                    <span className="font-medium">Source URL:</span>{" "}
                    <span className="text-xs text-slate-600 break-all">
                      {data.url}
                    </span>
                  </p>
                )}
              </Accordion>
            </div>
          ))}
          {imageExists && (
            <div className="flex justify-center mt-4">
              <a
                href="https://metricasboss.com.br/api/extension/link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://s3.sa-east-1.amazonaws.com/download.metricasboss.com.br/banner_extension.png"
                  alt="Banner da extensão"
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById("root");
createRoot(root).render(<App />);
