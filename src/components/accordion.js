import React, { useState } from "react";

export default function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center w-full font-medium rtl:text-right text-gray-500 gap-3 mt-2"
      >
        <span>
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 stroke-2"
            >
              <path
                fillRule="evenodd"
                d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 stroke-2"
            >
              <path
                fillRule="evenodd"
                d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
        <div className="flex justify-between text-left">{title}</div>
      </button>
      {isOpen && <div className="px-6 py-4 bg-gray-50">{children}</div>}
    </div>
  );
}
