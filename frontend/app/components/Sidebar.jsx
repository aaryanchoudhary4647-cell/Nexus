"use client";

import React, { useState, useRef, useEffect } from "react";
import { useExplorer } from "../context/ExplorerContext";
import { useCollaborative } from "../context/CollaboratorContext";
import { useEditorUI } from "../context/EditorUIContext";
import FileTree from "./FileTree";
import CollaboratorFileTree from "./CollaboratorFileTree";
import {
  Plus, FolderPlus, HelpCircle, SendHorizonal, Users, LogOut, Copy, Check, MessageSquare, ShieldAlert, ChevronDown,
  ChevronRight,
  Files
} from "lucide-react";

export default function Sidebar() {
  const {
    createFile,
    files,
    setFiles,
  } = useExplorer();

  const {
    roomID,
    username,
    isJoined,
    collaborators,
    chatMessages,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    collaboratedFiles,
    setCollaboratedFiles,
    createCollaboratedFile,
    serverCreateFile } = useCollaborative();
  const {
    activeSidebarTab,
    sidebarOpen,
    syncTabsAfterCreating
  } = useEditorUI();

  // Local state for join room form
  const [inputRoomID, setInputRoomID] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCollaborator, setIsCollaborator] = useState(false)
  const [isChat, setIsChat] = useState(false)

  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  if (!sidebarOpen) return null;

  const handleGenerateRoom = () => {
    const rand = "NEXUS-" + Math.floor(1000 + Math.random() * 9000);
    setInputRoomID(rand);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!inputRoomID.trim() || !inputUsername.trim()) {
      alert("Please enter both a Room ID and Username.");
      return;
    }
    joinRoom(inputRoomID.trim().toUpperCase(), inputUsername.trim());
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput("");
  };

  const handleCopyLink = () => {
    if (!roomID) return;
    const url = `${window.location.origin}?room=${roomID}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCollaborators = () => {
    setIsCollaborator(!isCollaborator)
  }

  const handleChat = () => {
    setIsChat(!isChat)
  }

  const triggerNewFile = () => {
    const name = prompt("Enter file name (e.g. app.js, index.html):");
    if (name) {
      const newPath = createFile({
        parentPath: "/",
        name,
        isFolder: false,
      });
      syncTabsAfterCreating({ newPath, isFolder: false })
    }
  };
  const triggerNewCollaboratedFile = () => {
    const name = prompt("Enter file name (e.g. app.js, index.html):");
    if (name) {
      const newPath = createCollaboratedFile({
        parentPath: "/",
        name,
        isFolder: false,
      });
      const fileData = {
        path: newPath,
        parentPath: "/",
        name,
        isFolder: false,
        content: "",
      };
      syncTabsAfterCreating({ newPath, isFolder: false })
      serverCreateFile(fileData);
    }
  };

  const triggerNewFolder = () => {
    const name = prompt("Enter folder name:");
    if (name) {
      createFile({
        files,
        setFiles,
        parentPath: "/",
        name,
        isFolder: true,
      });
    }
  };

  const triggerNewCollaboratedFolder = () => {
    const name = prompt("Enter folder name:");
    if (name){
      const newPath = createCollaboratedFile({
      parentPath: "/",
      name,
      isFolder: true,
    });
    const fileData = {
        path: newPath,
        parentPath: "/",
        name,
        isFolder: true,
        content: "",
      };
      serverCreateFile(fileData);
  } 
  }

  return (
    <div className="w-64 h-full bg-[#1e1e2e] border-r border-[#2b2b3c] flex flex-col select-none relative z-10">
      {/* Tab: Explorer */}
      {activeSidebarTab === "explorer" && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-10 border-b border-[#2b2b3c] flex items-center justify-between px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Explorer</span>
            <div className="flex items-center gap-2">
              <button
                onClick={triggerNewFile}
                className="hover:text-white hover:bg-[#2b2b3c] p-1 rounded transition-colors cursor-pointer"
                title="New File"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={triggerNewFolder}
                className="hover:text-white hover:bg-[#2b2b3c] p-1 rounded transition-colors cursor-pointer"
                title="New Folder"
              >
                <FolderPlus size={14} />
              </button>
            </div>
          </div>

          {/* File Tree Panel */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
              <span>Nexus-Workspace</span>
            </div>
            <FileTree />
          </div>
        </div>
      )}

      {/* Tab: Collaboration */}
      {activeSidebarTab === "collaboration" && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-10 border-b border-[#2b2b3c] flex items-center px-4 text-xs font-bold uppercase tracking-wider text-slate-400 gap-1.5">
            <Users size={14} className="text-sky-400" />
            <span>Collaboration</span>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!isJoined ? (
              /* Connect Room Form */
              <div className="p-4 overflow-y-auto flex flex-col gap-4 flex-1">
                <div className="bg-[#242434] p-3 rounded-lg border border-[#2b2b3c] text-xs text-slate-400 leading-relaxed text-center">
                  Join a session to coordinate
                </div>

                <form onSubmit={handleJoin} className="flex flex-col gap-3.5 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">Username</label>
                    <input
                      type="text"
                      placeholder="John Dason"
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      className="w-full bg-[#181824] border border-[#2b2b3c] focus:border-sky-500 rounded px-3 py-2 text-sm text-white focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Room ID</label>
                      <button
                        type="button"
                        onClick={handleGenerateRoom}
                        className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                      >
                        Generate Random
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="id..."
                      value={inputRoomID}
                      onChange={(e) => setInputRoomID(e.target.value)}
                      className="w-full bg-[#181824] border border-[#2b2b3c] focus:border-sky-500 rounded px-3 py-2 text-sm text-white focus:outline-none transition-all font-mono uppercase"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm py-2 rounded shadow transition-all cursor-pointer mt-2 active:scale-98"
                  >
                    Connect Workspace
                  </button>
                </form>
              </div>
            ) : (
              /* Active Room State */
              <div className="flex flex-col h-full overflow-hidden">
                {/* Room Info */}
                <div className="p-3 bg-[#181824] border-b border-[#2b2b3c] flex flex-col gap-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Connected Session</div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400 font-mono text-sm">{roomID}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleCopyLink}
                        className="p-1.5 hover:bg-[#2b2b3c] rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Room Link"
                      >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={leaveRoom}
                        className="p-1.5 hover:bg-rose-900/40 rounded text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Leave Room"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Header */}
                  <div className="h-10 border-b border-[#2b2b3c] flex items-center justify-between px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Explorer</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={triggerNewCollaboratedFile}
                        className="hover:text-white hover:bg-[#2b2b3c] p-1 rounded transition-colors cursor-pointer"
                        title="New File"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={triggerNewCollaboratedFolder}
                        className="hover:text-white hover:bg-[#2b2b3c] p-1 rounded transition-colors cursor-pointer"
                        title="New Folder"
                      >
                        <FolderPlus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* File Tree Panel */}
                  <div className="flex-1 overflow-y-auto py-2">
                    <div className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                      <span>Nexus-Workspace</span>
                    </div>
                    <CollaboratorFileTree />
                  </div>
                </div>


                <div className="collaborators">
                  {/* Section: Users */}
                  <div onClick={handleCollaborators} className="bg-[#181824] hover:bg-[#252538]">
                    {isCollaborator ? <div className="flex items-center"><ChevronDown size={14} className="text-slate-500" /><div className="px-1 py-1 text-slate-500 uppercase text-[11px] font-semibold">Collaborators</div></div> : <div className="flex items-center"><ChevronRight size={14} className="text-slate-500" /><div className="px-1 py-1 text-slate-500 uppercase text-[11px] font-semibold">Collaborators</div></div>}
                  </div>
                  {isCollaborator &&
                    <div className="p-3 border-b border-[#2b2b3c] flex flex-col max-h-[140px] overflow-y-auto">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Collaborators ({collaborators.length})</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {collaborators.map((user) => (
                          <div key={user.id} className="flex items-center gap-2.5">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: user.color }}
                            >
                              {user.avatar}
                            </div>
                            <span className="text-xs text-slate-300 truncate flex-1">{user.username}</span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${user.status === "online" ? "bg-green-500" : "bg-amber-500 animate-pulse"
                                }`}
                            ></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  }</div>
                <div className="chat overflow-auto">{/* Section: Live Chat */}
                  <div onClick={handleChat} className="bg-[#181824] hover:bg-[#252538]">
                    {isChat ? <div className="flex items-center"><ChevronDown size={14} className="text-slate-500" /><div className="px-1 py-1 text-slate-500 uppercase text-[11px] font-semibold">Chat</div></div> : <div className="flex items-center"><ChevronRight size={14} className="text-slate-500" /><div className="px-1 py-1 text-slate-500 uppercase text-[11px] font-semibold">Chat</div></div>}
                  </div>
                  {isChat && <div className="flex-1 flex flex-col overflow-hidden min-h-[200px]">
                    <div className="p-3 bg-[#1e1e2e] text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-[#2b2b3c] flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>Session Chat</span>
                    </div>

                    {/* Messages list */}
                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-thin">
                      {chatMessages.map((msg) =>
                        msg.isSystem ? (
                          <div key={msg.id} className="text-center text-[10px] text-slate-500 bg-[#181824] py-1 px-2.5 rounded border border-[#2b2b3c]">
                            {msg.text}
                          </div>
                        ) : (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${msg.user === username
                              ? "self-end bg-sky-600 text-white rounded-tr-none"
                              : "self-start bg-[#242434] text-slate-200 border border-[#2b2b3c] rounded-tl-none"
                              }`}
                          >
                            <div className="flex justify-between items-baseline gap-2 mb-0.5">
                              <span className={`font-bold text-[10px] ${msg.user === username ? "text-sky-100" : "text-sky-400"}`}>
                                {msg.user === username ? "You" : msg.user}
                              </span>
                              <span className="text-[9px] opacity-60 font-mono">{msg.timestamp}</span>
                            </div>
                            <p className="leading-relaxed break-words">{msg.text}</p>
                          </div>
                        )
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Message input */}
                    <form onSubmit={handleSendChat} className="p-2 bg-[#181824] border-t border-[#2b2b3c] flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Type message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-[#1e1e2e] border border-[#2b2b3c] focus:border-sky-500 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-500 p-1.5 rounded text-white transition-colors cursor-pointer"
                      >
                        <SendHorizonal size={14} />
                      </button>
                    </form>
                  </div>}</div>
              </div>

            )}
          </div>
        </div>
      )}
    </div>
  );
}
