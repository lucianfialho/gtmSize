import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "../assets/tailwind.css";
import Accordion from "../components/accordion";

function App() {
  const [containers, setContainers] = useState({});
  const [error, setError] = useState(false);
  const [message, setMessage] = useState(false);
  const [pageLoading, setPageLoading] = useState(0);

  useEffect(() => {
    const sendMessageToBackground = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.runtime.sendMessage({ tabId: tabs[0].id }, function (response) {
          if (chrome.runtime.lastError) {
            console.error("Erro ao enviar mensagem:", chrome.runtime.lastError);
          } else {
            setContainers(response.containers);
            setPageLoading(parseFloat(response.pageLoadTiming));

            if (Object.keys(response.containers).length > 1) {
              setError(true);
              setMessage(
                "More than one GTM container detected on the page. This can cause conflicts and unexpected errors."
              );
            }

            if (Object.keys(response.containers).length < 1) {
              setError(true);
              setMessage(
                "There is no container installed or container not detected please refresh the page."
              );
            }
          }
        });
      });
    };

    if (chrome.runtime && chrome.runtime.id) {
      sendMessageToBackground();
    } else {
      setTimeout(sendMessageToBackground, 1000);
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
              <div className="font-medium">Container ID: {containerId}</div>
              <div className="mt-1 text-slate-500">
                <div className="flex">
                  Size:&nbsp;
                  <span className="font-medium flex items-center">
                    {data.sizeInKb}KB&nbsp;
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
                    {data.timing.loadTime} seconds
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
                  {data.analyse.macros}
                </p>
                <p>
                  <span className="font-medium mt-2">Triggers:</span>{" "}
                  {data.analyse.rules}
                </p>
                <p>
                  <span className="font-medium mt-2">Tags:</span>{" "}
                  {data.analyse.tags._html +
                    data.analyse.tags.__gaawe +
                    data.analyse.tags.__googtag}
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
                </p>
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById("root");
createRoot(root).render(<App />);
