import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "../assets/tailwind.css";

function App () {
    const [containerSize, setContainerSize] = useState("Teste");
    useEffect(() => {
        chrome.runtime.sendMessage("teste", function(response) {
            setContainerSize(response.result)
        });

    }, [])
    
    return (
        <div className="w-[19.875rem] rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            <div className="flex flex-col p-4 pb-0">
                <div className="ml-4 flex-auto">
                    <div className="font-medium">Google Tag Manager Size</div>
                    <div className="mt-1 text-slate-500">Your container has: {containerSize}</div>
                </div>
                <div className="ml-4 flex-auto py-5">
                    <h2 className="font-medium">What does that mean?</h2>
                    <p className="mt-1 text-slate-500">The Google Tag Manager container limit is 200kb that means you are so much % from exceeding the limit</p>
                </div>
            </div>
        </div>
    )
}

const root = document.getElementById("root");


createRoot(root).render(<App />);
