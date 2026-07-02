"use client";

import React from "react";
import { useEditorUI } from "../context/EditorUIContext";
import { useCollaborative } from "../context/CollaboratorContext";
import { Files, Users, Terminal } from "lucide-react";

export default function Activitybar() {
  const { activeSidebarTab, sidebarOpen, selectSidebarTab,setActiveWorkSpace} = useEditorUI();
  const {isJoined} = useCollaborative();

  const handleExplorerClick = ()=>{
    setActiveWorkSpace("explorer");
    selectSidebarTab("explorer")
  }
  const handleCollaboratorClick = ()=>{
    setActiveWorkSpace("collaboration");
    selectSidebarTab("collaboration")
  }
  return (
    <div className="w-12 h-full bg-[#1e1e2f] border-r border-[#2b2b3c] flex flex-col justify-between items-center py-2.5 select-none relative z-20">
      {/* Top Icons */}
      <div className="flex flex-col gap-2.5 w-full">
        {/* Explorer Icon */}
        <div className="relative group w-full flex justify-center">
          <button
            onClick={() =>handleExplorerClick()}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
              activeSidebarTab === "explorer" && sidebarOpen
                ? "text-sky-400 bg-[#2b2b3c]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#252538]"
            }`}
            title="Explorer"
          >
            <Files size={20} />
            {/* Active left indicator */}
            {activeSidebarTab === "explorer" && sidebarOpen && (
              <div className="absolute left-0 w-[3px] h-6 bg-sky-400 rounded-r"></div>
            )}
          </button>
          {/* Tooltip */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-150 origin-left bg-[#111] text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg pointer-events-none z-50">
            Explorer (Ctrl+Shift+E)
          </div>
        </div>

        {/* Collaboration Icon */}
        <div className="relative group w-full flex justify-center">
          <button
            onClick={() => handleCollaboratorClick()}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
              activeSidebarTab === "collaboration" && sidebarOpen
                ? "text-sky-400 bg-[#2b2b3c]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#252538]"
            }`}
            title="Collaboration"
          >
            <Users size={20} />
            {/* Notification dot if joined */}
            {isJoined && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-sky-500 rounded-full border border-[#1e1e2f] animate-pulse"></div>
            )}
            {/* Active left indicator */}
            {activeSidebarTab === "collaboration" && sidebarOpen && (
              <div className="absolute left-0 w-[3px] h-6 bg-sky-400 rounded-r"></div>
            )}
          </button>
          {/* Tooltip */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-150 origin-left bg-[#111] text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg pointer-events-none z-50">
            Collaboration
          </div>
        </div>
      </div>

      {/* Bottom Icons (Visual decorations matching VS Code) */}
      <div className="flex flex-col gap-3 w-full items-center">
        <div className="w-8 h-[1px] bg-[#2b2b3c]"></div>
        <div className="w-8 h-8 rounded-full bg-[#252538] border border-[#2b2b3c] flex items-center justify-center text-[10px] font-bold text-sky-400 cursor-default" title="Nexus Workspace">
          Nexus 
        </div>
      </div>
    </div>
  );
}
