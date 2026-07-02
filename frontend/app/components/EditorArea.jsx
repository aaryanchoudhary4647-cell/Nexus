"use client";

import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useExplorer } from "../context/ExplorerContext";
import { useCollaborative } from "../context/CollaboratorContext";
import { useEditorUI } from "../context/EditorUIContext";
import WelcomeScreen from "./WelcomeScreen";
import { createRemoteCursorWidget } from "../utils/createRemoteCursorWidget";
import { Plus, Users, BookOpen, Code, Layers, Sparkles } from "lucide-react";
import "../cursors.css"

export default function EditorArea() {
  const {
    files,
    setFiles,
    updateFileContent,
    createFile,
  } = useExplorer();

  const { collaboratedFiles, setCollaboratedFiles, isJoined, sendContent, serverSendCursorPosition, remoteCursors } = useCollaborative();
  const { activeFile, editorRef, openFileInTab, selectSidebarTab, editorSettings, syncTabsAfterCreating, activeWorkSpace, activeCollaboratedFile, openCollaboratedFileInTab } = useEditorUI();

  const activeFileRef = useRef(activeFile);
  const monacoRef = useRef(null);
  const widgetsRef = useRef({});
  const sendCursorPositionRef = useRef(serverSendCursorPosition);
  useEffect(() => {
    sendCursorPositionRef.current = serverSendCursorPosition;
  }, [serverSendCursorPosition])

  useEffect(() => {
    activeFileRef.current = activeCollaboratedFile;
  }, [activeCollaboratedFile])

  const cursorDisposableRef = useRef(null);


  const currentFiles =
    activeWorkSpace === "explorer"
      ? files
      : collaboratedFiles;
  const setCurrentFiles = activeWorkSpace === "explorer" ? setFiles : setCollaboratedFiles
  const activated = activeWorkSpace === "explorer" ? activeFile : activeCollaboratedFile

  const activeNode = currentFiles[activated];

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const cursors = Object.entries(remoteCursors).filter(
      ([_, cursor]) => cursor.path === activeCollaboratedFile
    );
    cursors.forEach(([socketId, cursor]) => {
      // Always remove old widget if it exists
      if (widgetsRef.current[socketId]) {
        editorRef.current.removeContentWidget(widgetsRef.current[socketId]);
      }

      // Create a fresh widget with the new position and add it
      const widget = createRemoteCursorWidget(
        monacoRef.current,
        socketId,
        cursor.username || "User",
        cursor.color || "#ff0000",
        cursor.position
      );

      widgetsRef.current[socketId] = widget;
      editorRef.current.addContentWidget(widget);


    });

    const activeIds = new Set(
      cursors.map(([socketId]) => socketId)
    );

    // if a user changes file or disconnects , the below code removes its widget
    Object.keys(widgetsRef.current).forEach((socketId) => {
      if (!activeIds.has(socketId)) {
        editorRef.current.removeContentWidget(
          widgetsRef.current[socketId]
        );

        delete widgetsRef.current[socketId];
      }

    });


  }, [remoteCursors, activeCollaboratedFile]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Attach cursor-move listener here so the editor is guaranteed to exist
    if (cursorDisposableRef.current) {
      cursorDisposableRef.current.dispose();
    }
    cursorDisposableRef.current = editor.onDidChangeCursorPosition((e) => {
      sendCursorPositionRef.current({
        path: activeFileRef.current,
        position: e.position,
      });
    });
  }

  const handleEditorChange = (value) => {
    if (activated) {
      const targetSetter = activeWorkSpace === "collaboration" ? setCollaboratedFiles : setFiles
      updateFileContent({
        setFiles: targetSetter,
        path: activated,
        content: value || ""
      })
      if (activeWorkSpace === "collaboration") {
        sendContent({
          path: activated,
          content: value || "",
        });
      }
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

  const openReadme = () => {
    if (currentFiles["/README.md"]) {
      activeWorkSpace === "explorer" ?
        openFileInTab("/README.md") : openCollaboratedFileInTab("/README.md")
    } else {
      const newPath = createFile({
        files: currentFiles,
        setFiles: setCurrentFiles,
        parentPath: "/",
        name: "README.md",
        isFolder: false,
      });
      syncTabsAfterCreating({ newPath, isFolder: false })
    }
  };




  // Render Monaco Editor
  if (activeNode) {
    if (!isJoined && activeWorkSpace === "collaboration") { return (<WelcomeScreen triggerNewFile={triggerNewFile} openReadme={openReadme} />) }
    return (
      <div className="w-full h-full bg-[#1e1e2e] flex flex-col overflow-hidden relative">
        {/* Top Breadcrumb path bar */}
        <div className="h-7 bg-[#1e1e2e] border-b border-[#3c2b2b] flex items-center px-4 text-[11px] text-slate-400 select-none">
          <span className="text-slate-500">{activeWorkSpace}</span>
          <span className="mx-1.5">/</span>
          {activeNode.path.split("/").filter(Boolean).map((part, index, arr) => (
            <React.Fragment key={part}>
              <span className={index === arr.length - 1 ? "text-sky-400 font-medium" : ""}>
                {part}
              </span>
              {index < arr.length - 1 && <span className="mx-1.5">/</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Monaco Instance */}
        <div className="flex-1 w-full relative">
          <Editor
            height="100%"
            language={activeNode.language}
            value={activeNode.content}
            theme="vs-dark"
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={{
              fontSize: editorSettings.fontSize,
              minimap: { enabled: editorSettings.minimap },
              wordWrap: editorSettings.wordWrap,
              automaticLayout: true,
              fontFamily: "var(--font-geist-mono), Consolas, monospace",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              padding: { top: 10, bottom: 10 },
              lineNumbersMinChars: 3,
              smoothScrolling: true,
              tabSize: 2
            }}
            loading={
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e2e] text-sky-400">
                <Code className="animate-spin mb-2" size={32} />
                <span className="text-sm font-medium animate-pulse">Loading Editor...</span>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  // Render Welcome Screen when no tabs are open
  return (<WelcomeScreen triggerNewFile={triggerNewFile} openReadme={openReadme} />);

}