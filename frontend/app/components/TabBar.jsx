"use client";

import React, { useRef, useEffect } from "react";
import { useExplorer } from "../context/ExplorerContext";
import { useEditorUI } from "../context/EditorUIContext";
import { useCollaborative } from "../context/CollaboratorContext";
import { X } from "lucide-react";

export default function TabBar() {
  const { openTabs, activeFile, setActiveFile, closeTab, activeWorkSpace,openCollaboratedTabs,activeCollaboratedFile,setActiveCollaboratedFile} = useEditorUI();
  const { files,getFileIcon } = useExplorer();
  const { collaboratedFiles,isJoined , } = useCollaborative();
  const tabContainerRef = useRef(null);

  const currentTabs = activeWorkSpace === "explorer" ? openTabs : openCollaboratedTabs;
  const currentActiveFile = activeWorkSpace === "explorer" ? activeFile : activeCollaboratedFile;
  const currentSetter = activeWorkSpace === "explorer" ? setActiveFile : setActiveCollaboratedFile;
  
  // Auto-scroll active tab into view
  useEffect(() => {
    if (tabContainerRef.current && currentActiveFile) {
      const activeElement = tabContainerRef.current.querySelector(`[data-path="${currentActiveFile}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [currentActiveFile]);




  return (
    <div
      ref={tabContainerRef}
      className="h-9 bg-[#14141f] border-b border-[#2b2b3c] flex items-center overflow-x-auto overflow-y-hidden select-none scrollbar-none relative"
      style={{ scrollbarWidth: "none" }}
    >
      {/* List of tabs */}
      <div className="flex items-center h-full">
        {currentTabs.map((path) => {
          const file = activeWorkSpace === "explorer" ? files[path] : collaboratedFiles[path];

          if (!isJoined && activeWorkSpace==="collaboration") { return null }
          if (!file) return null;
          const isActive = currentActiveFile === path;

          return (
            <div
              key={path}
              data-path={path}
              onClick={() => currentSetter(path)}
              className={`group flex items-center gap-2 px-3 h-full border-r border-[#2b2b3c] text-xs cursor-pointer transition-all duration-150 relative ${isActive
                  ? "bg-[#1e1e2e] text-white font-medium border-t-2 border-t-sky-400"
                  : "bg-[#14141f] text-slate-400 hover:bg-[#181827] hover:text-slate-200"
                }`}
            >
              {/* File Extension Icon */}
              <span className="flex items-center justify-center">{getFileIcon(file.name)}</span>

              {/* File Name */}
              <span className="truncate max-w-[100px]">{file.name}</span>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(path);
                }}
                className="p-0.5 rounded text-slate-500 hover:bg-[#2b2b3c] hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="Close Tab (Ctrl+W)"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
