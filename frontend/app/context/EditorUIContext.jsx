"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import { useExplorer } from "./ExplorerContext";
import { useCollaborative } from "./CollaboratorContext";
const EditorUIContext = createContext();

export const EditorUIProvider = ({ children }) => {
    const { files, getLanguageFromExtension } = useExplorer();
    const { collaboratedFiles } = useCollaborative();
    const [activeWorkSpace, setActiveWorkSpace] = useState("explorer")
    // Tabs & Navigation
    const [openTabs, setOpenTabs] = useState(["/README.md"]);
    const [openCollaboratedTabs, setOpenCollaboratedTabs] = useState(["/README.md"]);
    
    const [activeFile, setActiveFile] = useState("/README.md");
    const [activeCollaboratedFile, setActiveCollaboratedFile] = useState("/README.md");

    // Sidebar
    const [activeSidebarTab, setActiveSidebarTab] = useState("explorer"); // 'explorer' | 'collaboration'
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Editor settings
    const [editorSettings, setEditorSettings] = useState({
        theme: "vs-dark",
        fontSize: 14,
        minimap: true,
        wordWrap: "on"
    });

    // Output panel
    const [isOutputVisible, setIsOutputVisible] = useState(false);
    const [output, setOutput] = useState(null);
    const [executionTime, setExecutionTime] = useState(null);

    // Monaco editor ref
    const editorRef = useRef();

    // Derived: Monaco language for the active file



    const activeNode = activeWorkSpace === "explorer"
    ? (activeFile ? files[activeFile] : null)
    : (activeCollaboratedFile ? collaboratedFiles[activeCollaboratedFile] : null);
    
    const language = activeNode ? getLanguageFromExtension(activeNode.name) : "plaintext";

    // --- Tab operations ---

    const openFileInTab = (path) => {
        if (files[path] && !files[path].isFolder) {
            if (!openTabs.includes(path)) {
                setOpenTabs((prev) => [...prev, path]);
            }
            setActiveFile(path);
        }
    };
    const openCollaboratedFileInTab = (path) => {
        if (collaboratedFiles[path] && !collaboratedFiles[path].isFolder) {
            if (!openCollaboratedTabs.includes(path)) {
                setOpenCollaboratedTabs((prev) => [...prev, path]);
            }
            setActiveCollaboratedFile(path);
        }
    };

    const closeTab = (path) => {
        if(activeWorkSpace==="explorer"){
            setOpenTabs((prev) => {
            const updated = prev.filter((tab) => tab !== path);
            if (activeFile === path) {
                setActiveFile(updated.length > 0 ? updated[updated.length - 1] : null);
            }
            return updated;
        });
    }
        else{
            setOpenCollaboratedTabs((prev) => {
            const updated = prev.filter((tab) => tab !== path);
            if (activeCollaboratedFile === path) {
                setActiveCollaboratedFile(updated.length > 0 ? updated[updated.length - 1] : null);
            }
            return updated;
        });
        }
    };

    /**
     * Call this after a file/folder rename so open tabs and the active file
     * stay in sync with the new paths produced by ExplorerContext.renameFile.
     */
    const tabSetter = activeWorkSpace ==="explorer" ? setOpenTabs : setOpenCollaboratedTabs 
    const activeSetter = activeWorkSpace ==="explorer" ? setActiveFile : 
    setActiveCollaboratedFile
    const active = activeWorkSpace ==="explorer" ? activeFile : activeCollaboratedFile
    const tabs  = activeWorkSpace ==="explorer" ? openTabs : openCollaboratedTabs

    const syncTabsAfterRename = (oldPath, newPath) => {
        
        tabSetter((prev) =>
            prev.map((tab) => {
                if (tab === oldPath) return newPath;
                if (tab.startsWith(oldPath + "/"))
                    return newPath + tab.substring(oldPath.length);
                return tab;
            })
        );
        
        activeSetter((current) => {
            if (current === oldPath) return newPath;
            if (current && current.startsWith(oldPath + "/"))
                return newPath + current.substring(oldPath.length);
            return current;
        });
    };

    const syncTabsAfterCreating = ({ newPath, isFolder }) => {

        if (!isFolder) {
            // Open in tab
            if (!tabs.includes(newPath)) {
                tabSetter((prev) => [...prev, newPath]);
            }
            activeSetter(newPath);
        }
    }

    /**
     * Call this after a file/folder deletion so closed tabs are removed and
     * the active file falls back to the last remaining tab.
     */
    const syncTabsAfterDelete = (deletedPath) => {
        tabSetter((prev) => {
            const updated = prev.filter(
                (tab) => tab !== deletedPath && !tab.startsWith(deletedPath + "/")
            );

            if (
                active === deletedPath ||
                (active && active.startsWith(deletedPath + "/"))
            ) {
                activeSetter(updated.length > 0 ? updated[updated.length - 1] : null);
            }

            return updated;
        });
    };

    // --- Sidebar ---

    const selectSidebarTab = (tab) => {
        if (activeSidebarTab === tab) {
            setSidebarOpen((prev) => !prev);
        } else {
            setSidebarOpen(true);
            setActiveSidebarTab(tab);
        }
    };

    return (
        <EditorUIContext.Provider
            value={{
                // Tabs
                openTabs,
                activeFile,
                setActiveFile,
                openFileInTab,
                closeTab,
                syncTabsAfterRename,
                syncTabsAfterDelete,
                // Sidebar
                activeSidebarTab,
                sidebarOpen,
                setSidebarOpen,
                selectSidebarTab,
                // Editor
                editorSettings,
                setEditorSettings,
                editorRef,
                language,
                // Output panel
                isOutputVisible,
                setIsOutputVisible,
                output,
                setOutput,
                executionTime,
                setExecutionTime,
                activeWorkSpace,
                setActiveWorkSpace,
                syncTabsAfterCreating,
                activeCollaboratedFile,
                openCollaboratedFileInTab,
                openCollaboratedTabs,
                setOpenCollaboratedTabs,
                setActiveCollaboratedFile
            }}
        >
            {children}
        </EditorUIContext.Provider>
    );
};

export const useEditorUI = () => {
    const context = useContext(EditorUIContext);
    if (!context) {
        throw new Error("useEditorUI must be used within an EditorUIProvider");
    }
    return context;
};