"use client";

import React, { useState } from "react";
import { useMemo } from "react";
import { useExplorer } from "../context/ExplorerContext";
import { useEditorUI } from "../context/EditorUIContext";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  FolderPlus,
  Trash2,
  Edit2
} from "lucide-react";

export default function FileTree() {
  const {
    files,
    createFile,
    deleteFile,
    renameFile,
    toggleFolderOpen,
    setFiles,
    getFileIcon
  } = useExplorer();

  const { activeFile, openFileInTab, syncTabsAfterRename, syncTabsAfterDelete, syncTabsAfterCreating } = useEditorUI();

  const [renamingPath, setRenamingPath] = useState(null);
  const [renamingValue, setRenamingValue] = useState("");

  // Convert flat files object to structured hierarchy
  const buildTree = () => {
    const root = { name: "root", path: "/", isFolder: true, children: [] };

    // Sort paths alphabetically to keep folders/files structured
    const sortedPaths = Object.keys(files).sort((a, b) => {
      // Sort folder before file
      const aNode = files[a];
      const bNode = files[b];
      if (aNode.isFolder && !bNode.isFolder) return -1;
      if (!aNode.isFolder && bNode.isFolder) return 1;
      return a.localeCompare(b);
    });

    sortedPaths.forEach((path) => {
      const parts = path.split("/").filter(Boolean);
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const partPath = "/" + parts.slice(0, i + 1).join("/");

        let child = current.children.find((c) => c.name === part);
        if (!child) {
          const fileMeta = files[partPath];
          child = {
            name: part,
            path: partPath,
            isFolder: fileMeta ? fileMeta.isFolder : true,
            isOpen: fileMeta ? fileMeta.isOpen : false,
            children: []
          };
          current.children.push(child);
        }
        current = child;
      }
    });

    return root.children;
  };

  const startRename = (e, path, name) => {
    e.stopPropagation();
    setRenamingPath(path);
    setRenamingValue(name);
  };

  const handleRenameSubmit = (path) => {
    if (renamingValue.trim() && renamingValue.trim() !== files[path].name) {
      const newName = renamingValue.trim();
      const result = renameFile({
        oldPath: path,
        newName,
      });
      if (result) { syncTabsAfterRename(path, result.newPath); }

    }
    setRenamingPath(null);
  };

  

  const handleAddFile = (e, path) => {
    e.stopPropagation();
    const name = prompt("Enter file name (e.g., config.json, utils.js):");
    if (name) {
      const newPath = createFile({
        parentPath: path,
        name,
        isFolder: false,
      });
      syncTabsAfterCreating({ newPath, isFolder: false })
    }
  };

  const handleAddFolder = (e, path) => {
    e.stopPropagation();
    const name = prompt("Enter folder name:");
    if (name) {
      const newPath = createFile({
        parentPath: path,
        name,
        isFolder: true,
      });
      syncTabsAfterCreating({ newPath, isFolder: true })
    }
  };

  const handleDelete = (e, path, name) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteFile({ path });
      syncTabsAfterDelete(path);
    }
  };

  const renderNode = (node, depth = 0) => {
    const isSelected = activeFile === node.path;
    const isFolder = node.isFolder;

    return (
      <div key={node.path} className="flex flex-col">
        {/* Node Item */}
        <div
          onClick={() => {
            if (isFolder) {
              toggleFolderOpen({ setFiles, path: node.path });
            } else {
              openFileInTab(node.path);
            }
          }}
          className={`group flex items-center h-7 px-2 mx-1 rounded cursor-pointer select-none text-slate-300 hover:bg-[#2b2b3c] hover:text-white transition-all text-xs ${isSelected && !isFolder ? "bg-[#252538] text-sky-400 font-semibold border-l-2 border-sky-400" : ""
            }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {/* Chevron for folder */}
          <span className="w-4 flex items-center justify-center mr-0.5">
            {isFolder ? (
              node.isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />
            ) : null}
          </span>

          {/* Icon */}
          <span className="mr-2 flex items-center justify-center">
            {isFolder ? (
              node.isOpen ? (
                <FolderOpen size={15} className="text-sky-400" />
              ) : (
                <Folder size={15} className="text-sky-400" />
              )
            ) : (
              getFileIcon(node.name)

            )}
          </span>

          {/* Label or Rename Input */}
          <div className="flex-1 truncate">
            {renamingPath === node.path ? (
              <input
                type="text"
                value={renamingValue}
                onChange={(e) => setRenamingValue(e.target.value)}
                onBlur={() => handleRenameSubmit(node.path)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(node.path);
                  if (e.key === "Escape") setRenamingPath(null);
                }}
                className="w-full bg-[#181824] border border-sky-500 text-white rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-sky-400 font-medium"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>

          {/* Quick Actions (only show on hover if not renaming) */}
          {renamingPath !== node.path && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 pl-2">
              {isFolder && (
                <>
                  <button
                    onClick={(e) => handleAddFile(e, node.path)}
                    className="p-0.5 hover:bg-[#181824] rounded text-slate-400 hover:text-sky-400 transition-colors"
                    title="New File"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    onClick={(e) => handleAddFolder(e, node.path)}
                    className="p-0.5 hover:bg-[#181824] rounded text-slate-400 hover:text-sky-400 transition-colors"
                    title="New Folder"
                  >
                    <FolderPlus size={13} />
                  </button>
                </>
              )}
              <button
                onClick={(e) => startRename(e, node.path, node.name)}
                className="p-0.5 hover:bg-[#181824] rounded text-slate-400 hover:text-sky-400 transition-colors"
                title="Rename"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={(e) => handleDelete(e, node.path, node.name)}
                className="p-0.5 hover:bg-rose-950/50 rounded text-slate-400 hover:text-rose-400 transition-colors"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Recursive Children */}
        {isFolder && node.isOpen && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  const tree = useMemo(buildTree, [files])

  return (
    <div className="flex flex-col gap-0.5 overflow-x-hidden">
      {tree.length === 0 ? (
        <div className="px-4 py-3 text-slate-500 text-xs italic">Empty directory</div>
      ) : (
        tree.map((node) => renderNode(node, 0))
      )}
    </div>
  );
}
