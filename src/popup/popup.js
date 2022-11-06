import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "../assets/tailwind.css";

function App () {
    const [containerSize, setContainerSize] = useState({ result: null, percent: null});
    useEffect(() => {
        
        chrome.runtime.sendMessage("teste", function(response) {
                
            setContainerSize(
                { 
                    result: response.result, 
                    percent: response.percent || null
                })
        });
    }, [])
    
    return (
        <div className="w-[19.875rem] rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            <div className="flex flex-col p-4 pb-0">
                <div className="ml-4 flex-auto">
                    <div className="font-medium">Google Tag Manager Size</div>
                    {containerSize.result ? (
                        <div className="mt-1 text-slate-500">Your container has: <span className="font-medium">{containerSize.result}</span></div>
                    ) : (
                        <div className="mt-1 text-slate-500 pb-5">There is no container in this page {`:/`}</div>
                    )}
                </div>

                {containerSize.result && (
                    <>
                        <div className="ml-4 flex-auto py-5">
                            <h2 className="font-medium">What does that mean?</h2>
                            <p className="mt-1 text-slate-500">The Google Tag Manager container limit is 200kb that means you are so much {`${containerSize.percent}%`} from exceeding the limit</p>
                        </div>

                        <div className="ml-4 flex-auto py-5">
                            <h2 className="font-medium">Tips by Métricas Boss: </h2>
                            <ul className="space-y-1 max-w-md list-inside text-gray-500 dark:text-gray-400">
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                    Delete all paused tags you have inside your container
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                    Delete all triggerless tags you have inside your container
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                    Delete all untagged triggers you have inside your container
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                    Delete all unused or duplicated variables within your container
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                    {`Follow me on instagram `} &nbsp; <a className="font-medium" href="https://instagram.com.br/lucianfialho">@lucianfialho</a>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

const root = document.getElementById("root");


createRoot(root).render(<App />);
