"use client";

import React, { useState, useRef, useEffect } from "react";
import { useExplorer } from "../context/ExplorerContext";
import { useCollaborative } from "../context/CollaboratorContext";
import { useEditorUI } from "../context/EditorUIContext";
import { Play, Copy, Check, Users, Code, Info, Sidebar as SidebarIcon, Menu } from "lucide-react";
import { executeCode } from "../API";

export default function Menubar() {
  const {
    createFile,
    files,
    getLanguageFromExtension,
    setFiles
  } = useExplorer();
  const {
    roomID,
    isJoined,
    collaborators,
    collaboratedFiles,
    setCollaboratedFiles,
    createCollaboratedFile,
    serverCreateFile
  } = useCollaborative();
  const {
    sidebarOpen,
    setSidebarOpen,
    selectSidebarTab,
    closeTab,
    activeFile,
    setIsOutputVisible,
    setOutput,
    setExecutionTime,
    editorRef,
    language,
    syncTabsAfterCreating,
    activeWorkSpace,
    setActiveWorkSpace,
    activeCollaboratedFile,
  } = useEditorUI();

  const [activeDropdown, setActiveDropdown] = useState(null); // 'file' | 'view' | `'help' | null
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const dropdownRef = useRef(null);
  const [isMd, setIsMd] = useState(true);

  const active = activeWorkSpace === "explorer" ? activeFile : activeCollaboratedFile
  const currentFiles = activeWorkSpace === "explorer" ? files : collaboratedFiles
  useEffect(() => {
    if (!active || !currentFiles[active]) {
      setIsMd(false);
      return;
    }

    setIsMd(
      getLanguageFromExtension(currentFiles[active].name) === "markdown"
    );
  }, [active, currentFiles]);


  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    if (!roomID) return;
    const url = `${window.location.origin}?room=${roomID}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRunCode = async () => {
    if (!active) {
      alert("Please open a file to run.");
      return;
    }

    const sourceCode = editorRef.current?.getValue() || "";

    if (!sourceCode) return;

    setIsRunning(true);
    setIsOutputVisible(true);

    try {
      const start = performance.now();

      const data = await executeCode(language, sourceCode);

      setOutput(
        data.stdout ||
        data.stderr ||
        data.compile_output ||
        "No output"
      );

      const end = performance.now();

      setExecutionTime(((end - start) / 1000).toFixed(2));

    } catch (err) {
      setOutput(
        "Error executing code:\n" +
        (err.response?.data?.message ||
          err.message ||
          "Unknown network error")
      );

      setExecutionTime(null);

    } finally {
      setIsRunning(false);
    }
  };

  const toggleDropdown = (menu) => {
    if (activeDropdown === menu) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menu);
    }
  };

  const triggerNewFile = () => {
    const name = prompt("Enter new file name (e.g. app.js, index.html):");
    if (name) {
      if (activeWorkSpace === "explorer") {
        const newPath = createFile({
          parentPath: "/",
          name,
          isFolder: false,
        });
        syncTabsAfterCreating({ newPath, isFolder: false })
      }
      else {
        const newPath = createCollaboratedFile({
          parentPath: "/",
          name,
          isFolder: false,
        });
        const fileData = {
          path: newPath,
          parentPath: path,
          name,
          isFolder: false,
          content: "",
        };
        syncTabsAfterCreating({ newPath, isFolder: false })
        serverCreateFile(fileData);
      }
      setActiveDropdown(null);
    }
  };

  const triggerNewFolder = () => {
    const name = prompt("Enter new folder name:");
    const currentFiles = activeWorkSpace === "explorer" ? files : collaboratedFiles
    const setter = activeWorkSpace === "explorer" ? setFiles : setCollaboratedFiles
    if (name) createFile({
      files: currentFiles,
      setFiles: setter,
      parentPath: "/",
      name,
      isFolder: true,
    });
    setActiveDropdown(null);
  };

  return (
    <div className="h-12 bg-[#181824] border-b border-[#2b2b3c] flex items-center justify-between px-3 text-slate-300 text-sm select-none relative z-50">
      {/* Left: Logo & Menu items */}
      <div className="flex items-center gap-4" ref={dropdownRef}>
        <div className="flex items-center gap-1.5 font-bold text-sky-400">
          <Code size={18} className="animate-pulse text-sky-400" />
          <span className="tracking-wider text-white">NEXUS</span>
        </div>

        {/* Menu Dropdowns */}
        <div className="flex items-center gap-1">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("file")}
              className={`px-3 py-1 rounded hover:bg-[#2b2b3c] hover:text-white transition-colors cursor-pointer ${activeDropdown === "file" ? "bg-[#2b2b3c] text-white" : ""
                }`}
            >
              File
            </button>
            {activeDropdown === "file" && (
              <div className="absolute left-0 mt-1 w-52 bg-[#1e1e2e] border border-[#2b2b3c] rounded-md shadow-2xl py-1 text-slate-300">
                <button
                  onClick={triggerNewFile}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white flex justify-between items-center cursor-pointer"
                >
                  <span>New File...</span>
                  <span className="text-xs text-slate-500">Ctrl+N</span>
                </button>
                <button
                  onClick={triggerNewFolder}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white flex justify-between items-center cursor-pointer"
                >
                  <span>New Folder...</span>
                  <span className="text-xs text-slate-500">Ctrl+Shift+N</span>
                </button>
                <div className="border-t border-[#2b2b3c] my-1"></div>
                <button
                  onClick={() => {
                    if (active) { closeTab(active) };
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white flex justify-between items-center cursor-pointer"
                >
                  <span>Close Editor</span>
                  <span className="text-xs text-slate-500">Ctrl+W</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("view")}
              className={`px-3 py-1 rounded hover:bg-[#2b2b3c] hover:text-white transition-colors cursor-pointer ${activeDropdown === "view" ? "bg-[#2b2b3c] text-white" : ""
                }`}
            >
              View
            </button>
            {activeDropdown === "view" && (
              <div className="absolute left-0 mt-1 w-52 bg-[#1e1e2e] border border-[#2b2b3c] rounded-md shadow-2xl py-1 text-slate-300">
                <button
                  onClick={() => {
                    setSidebarOpen(!sidebarOpen);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white flex justify-between items-center cursor-pointer"
                >
                  <span>Toggle Sidebar</span>
                  <span className="text-xs text-slate-500">Ctrl+B</span>
                </button>
                <div className="border-t border-[#2b2b3c] my-1"></div>
                <button
                  onClick={() => {
                    selectSidebarTab("explorer");
                    setActiveDropdown(null);
                    setActiveWorkSpace("explorer")
                  }}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white cursor-pointer"
                >
                  Explorer
                </button>
                <button
                  onClick={() => {
                    selectSidebarTab("collaboration");
                    setActiveDropdown(null);
                    setActiveWorkSpace("collaboration")
                  }}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white cursor-pointer"
                >
                  Collaboration
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("help")}
              className={`px-3 py-1 rounded hover:bg-[#2b2b3c] hover:text-white transition-colors cursor-pointer ${activeDropdown === "help" ? "bg-[#2b2b3c] text-white" : ""
                }`}
            >
              Help
            </button>
            {activeDropdown === "help" && (
              <div className="absolute left-0 mt-1 w-64 bg-[#1e1e2e] border border-[#2b2b3c] rounded-md shadow-2xl py-2 px-4 text-slate-300 text-xs leading-relaxed">
                <div className="font-semibold text-white mb-1 text-sm">Nexus Editor v1.0</div>
                <p className="text-slate-400 mb-2">
                  A high-fidelity real-time collaborative code editor modeled after VS Code.
                </p>
                <p className="text-slate-400">
                  Created for high-efficiency pair programming. Supports custom files, resizable sidebars, and chat.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Collaboration Status Bar */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        {isJoined &&
          <div className="bg-[#1e293b] border border-sky-500/30 rounded-full py-1 px-4 flex items-center gap-2.5 shadow-md">
            <span className="text-xs font-medium text-slate-200">
              Room: <span className="text-sky-400 font-bold font-mono">{roomID}</span>
            </span>
            <button
              onClick={handleCopyLink}
              className="hover:text-white text-slate-400 transition-colors p-0.5 rounded hover:bg-[#2b2b3c] cursor-pointer"
              title="Copy Room Link"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>}
      </div>

      {/* Right: Actions (Run & Avatars) */}
      <div className="flex items-center gap-4">
        {/* Collaborators */}
        {isJoined && collaborators.length > 0 && (
          <div className="flex items-center -space-x-2.5">
            {collaborators.map((user) => (
              <div
                key={user.id}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#181824] shadow-sm relative group cursor-default"
                style={{ backgroundColor: user.color }}
              >
                {user.avatar}
                {/* Tooltip */}
                <div className="absolute top-9 right-0 scale-0 group-hover:scale-100 transition-transform duration-200 origin-top bg-[#111] text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-lg pointer-events-none z-50">
                  {user.username} ({user.status})
                </div>
              </div>
            ))}
          </div>
        )}
        {!isMd && <div>{/* Run Button */}
          <button
            onClick={() => handleRunCode()}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium text-xs shadow-md cursor-pointer transition-all active:scale-95`}
          >
            <Play size={13} className={isRunning ? "animate-spin" : ""} />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button></div>}
      </div>
    </div>
  );
}
