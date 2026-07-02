"use client"
import React from 'react'
import { useEditorUI } from '../context/EditorUIContext';



const Output = ({ onClose }) => {
  const {
    output,
    setOutput,
    executionTime,
    setExecutionTime,
  } = useEditorUI();


  const clearOutput = () => {
    setOutput(null);
    setExecutionTime(null);
  };

  return (
    <div
      className="relative flex flex-col h-full bg-[#0a0a0a]/95 backdrop-blur-md border-t border-zinc-800 text-zinc-300 font-sans shadow-2xl transition-all select-none"
    >

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#121212] select-none h-[57px]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
            Console Output
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {output && (
            <button
              onClick={clearOutput}
              title="Clear output"
              className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all duration-150 flex items-center justify-center cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              title="Close Panel"
              className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all duration-150 flex items-center justify-center cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-[13px] leading-relaxed bg-[#050505] selection:bg-zinc-800 select-text">
        {output ? (
          <div className="space-y-1">
            <div className="whitespace-pre-wrap">{output}</div>
            {executionTime && (
              <div className="pt-3 mt-3 border-t border-zinc-900 text-zinc-500 text-xs select-none">
                Finished in {executionTime}s
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center select-none">
            <svg className="w-12 h-12 mb-3 text-zinc-700 opacity-60 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold text-sm mb-1 text-zinc-400">No output yet</p>
            <p className="text-xs max-w-[200px]">
              Write some code in the editor and click "Run Code" to view the execution output here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Output
