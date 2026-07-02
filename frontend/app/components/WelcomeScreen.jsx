"use client"
import React from 'react'
import { Plus, Users, BookOpen, Code, Layers, Sparkles } from "lucide-react";
import { useEditorUI } from '../context/EditorUIContext';
const WelcomeScreen = ({triggerNewFile,openReadme}) => {
    const {selectSidebarTab} = useEditorUI();

  return (
    <div className="w-full h-full bg-[#1e1e2e] flex flex-col justify-center items-center px-8 text-center select-none overflow-y-auto relative">
      {/* Decorative background grid/gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(#2b2b3c_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-xl w-full z-10 flex flex-col items-center">
        {/* Animated logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-purple-600 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative w-16 h-16 rounded-full bg-[#14141f] border border-[#2b2b3c] flex items-center justify-center text-sky-400">
            <Code size={34} className="animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          NEXUS <span className="text-sky-400">EDITOR</span>
        </h1>
        <p className="text-slate-400 text-sm mb-10 max-w-sm font-medium leading-relaxed">
          A high-performance real-time collaborative workspace designed to streamline pair programming.
        </p>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
          {/* Column 1: Quick Actions */}
          <div className="bg-[#181824]/80 backdrop-blur-sm p-4 rounded-xl border border-[#2b2b3c] flex flex-col gap-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles size={14} className="text-sky-400" />
              Start Editing
            </h2>

            <button
              onClick={()=>triggerNewFile()}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-[#2b2b3c] hover:text-white transition-all text-left cursor-pointer font-medium"
            >
              <Plus size={15} className="text-sky-400" />
              <span>Create New File</span>
            </button>

            <button
              onClick={() => selectSidebarTab("collaboration")}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-[#2b2b3c] hover:text-white transition-all text-left cursor-pointer font-medium"
            >
              <Users size={15} className="text-sky-400" />
              <span>Join Collaboration Session</span>
            </button>

            <button
              onClick={()=>openReadme()}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-[#2b2b3c] hover:text-white transition-all text-left cursor-pointer font-medium"
            >
              <BookOpen size={15} className="text-sky-400" />
              <span>Open README Guide</span>
            </button>
          </div>

          {/* Column 2: Shortcuts */}
          <div className="bg-[#181824]/80 backdrop-blur-sm p-4 rounded-xl border border-[#2b2b3c] flex flex-col gap-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Layers size={14} className="text-sky-400" />
              Shortcuts & Controls
            </h2>

            <div className="flex justify-between items-center px-3 py-1.5 text-xs text-slate-300">
              <span className="text-slate-400">Open File</span>
              <kbd className="px-2 py-0.5 bg-[#2b2b3c] rounded text-[10px] font-mono text-white">Db-Click File</kbd>
            </div>

            <div className="flex justify-between items-center px-3 py-1.5 text-xs text-slate-300">
              <span className="text-slate-400">Quick New File</span>
              <kbd className="px-2 py-0.5 bg-[#2b2b3c] rounded text-[10px] font-mono text-white">Db-Click Tabs</kbd>
            </div>

            <div className="flex justify-between items-center px-3 py-1.5 text-xs text-slate-300">
              <span className="text-slate-400">Toggle Sidebar</span>
              <kbd className="px-2 py-0.5 bg-[#2b2b3c] rounded text-[10px] font-mono text-white">Ctrl + B</kbd>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-[10px] text-slate-500 font-mono">
          • Built for Collaborative Co-coding
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen
