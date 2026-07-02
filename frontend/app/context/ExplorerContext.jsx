"use client";

import React, { createContext, useContext, useState } from "react";
import {Icon} from "@iconify/react"
const ExplorerContext = createContext();

const initialFiles = {
  "/README.md": {
    path: "/README.md",
    name: "README.md",
    content: `# Nexus Collaborative Code Editor

Welcome to **Nexus**, a high-performance real-time collaborative code editor designed to feel just like Visual Studio Code.

## 🚀 Features Built
- **Full File Tree Explorer**: Create, rename, and delete files or directories recursively.
- **Monaco Editor Integration**: Powerful syntax highlighting, auto-completions, and settings sync.
- **Collaboration Panel**: Seamless room creation/joining, interactive chat, and collaborator avatar tracking. Designed to easily fit \`socket.io\` in the future.
- **Resizable Layout**: Smooth adjustable panels built with \`react-resizable-panels\`.

## 🛠️ Getting Started
1. Click on any file in the **Explorer** to open it in a tab.
2. Head to the **Collaboration Panel** (users icon in the sidebar) to see or change your room settings.
3. Click the green **Run** button at the top right to simulate executing the current file!

Enjoy editing!`,
    language: "markdown",
    isFolder: false
  }
};

const getLanguageFromExtension = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();
  switch (ext) {
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";

    case "py":
      return "python";

    case "java":
      return "java";

    case "c":
      return "c";

    case "cpp":
    case "cc":
    case "cxx":
    case "hpp":
    case "h":
      return "cpp";

    case "cs":
      return "csharp";

    case "go":
      return "go";

    case "rs":
      return "rust";

    case "php":
      return "php";

    case "rb":
      return "ruby";

    case "md":
    case "markdown":
      return "markdown";

    case "json":
      return "json";

    case "html":
    case "htm":
      return "html";

    case "css":
      return "css";

    case "scss":
      return "scss";

    case "sass":
      return "sass";

    case "ts":
      return "typescript";

    case "tsx":
      return "typescriptreact";

    case "jsx":
      return "javascriptreact";

    case "xml":
      return "xml";

    case "yaml":
    case "yml":
      return "yaml";

    case "sql":
      return "sql";

    case "sh":
    case "bash":
      return "shell";

    case "txt":
      return "plaintext";

    default:
      return "plaintext";
  }
};

const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();

    switch (ext) {
      case "js":
      case "mjs":
      case "cjs":
        return <Icon icon="vscode-icons:file-type-js-official"width={20} />;

      case "ts":
        return <Icon icon="vscode-icons:file-type-typescript-official" width={20}/>;

      case "tsx":
        return <Icon icon="vscode-icons:file-type-reactts" width={20} />;

      case "jsx":
        return <Icon icon="vscode-icons:file-type-reactjs" width={20}/>;

      case "py":
        return <Icon icon="vscode-icons:file-type-python" width={20} />;

      case "java":
        return <Icon icon="vscode-icons:file-type-java" width={20}/>;

      case "c":
        return <Icon icon="vscode-icons:file-type-c3" width={20} />;

      case "cpp":
      case "cc":
      case "cxx":
      case "hpp":
      case "h":
        return <Icon icon="vscode-icons:file-type-cpp3" width={20} />;

      case "cs":
        return <Icon icon="vscode-icons:file-type-csharp" width={20}/>;

      case "go":
        return <Icon icon="vscode-icons:file-type-go" width={20}/>;

      case "rs":
        return <Icon icon="vscode-icons:file-type-rust" width={20}/>;

      case "php":
        return <Icon icon="vscode-icons:file-type-php" width={20} />;

      case "rb":
        return <Icon icon="vscode-icons:file-type-ruby" width={20}/>;

      case "md":
      case "markdown":
        return <Icon icon="vscode-icons:file-type-markdown" width={20} />;

      case "json":
        return <Icon icon="vscode-icons:file-type-json" width={20}/>;

      case "html":
      case "htm":
        return <Icon icon="vscode-icons:file-type-html" width={20}/>;

      case "css":
        return <Icon icon="vscode-icons:file-type-css" width={20}/>;

      case "scss":
        return <Icon icon="vscode-icons:file-type-scss2" width={20}/>;

      case "sass":
        return <Icon icon="vscode-icons:file-type-sass" width={20}/>;

      case "xml":
        return <Icon icon="vscode-icons:file-type-xml" width={20} />;

      case "yaml":
      case "yml":
        return <Icon icon="vscode-icons:file-type-yaml" width={20}/>;

      case "sql":
        return <Icon icon="vscode-icons:file-type-sql" width={20}/>;

      case "sh":
      case "bash":
        return <Icon icon="vscode-icons:file-type-shell" width={20}/>;

      case "txt":
        return <Icon icon="vscode-icons:file-type-text" width={20}/>;

      default:
        return <Icon icon="vscode-icons:default-file" width={20}/>;
    }
  };
export const ExplorerProvider = ({ children }) => {
  const [files, setFiles] = useState(initialFiles);

  const createFile = ({parentPath, name, isFolder = false }) => {
    if (!name || name.trim() === "") return;

    const cleanParent = parentPath === "/" ? "" : parentPath;
    const newPath = `${cleanParent}/${name.trim()}`;

    if (files[newPath]) {
      alert("A file or folder with this name already exists in this location.");
      return;
    }

    const newFileNode = {
      path: newPath,
      name: name.trim(),
      content: "",
      language: isFolder ? "" : getLanguageFromExtension(name),
      isFolder,
      ...(isFolder && { isOpen: true })
    };

    setFiles((prev) => ({ ...prev, [newPath]: newFileNode }));

    return newPath;
  };

  const deleteFile = ({ path }) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[path];
      Object.keys(next).forEach((key) => {
        if (key.startsWith(path + "/")) delete next[key];
      });
      return next;
    });

  };

  const renameFile = ({ oldPath, newName }) => {
    if (!newName || newName.trim() === "") return;
    const nameTrimmed = newName.trim();

    const parts = oldPath.split("/");
    parts.pop();
    const parentPath = parts.join("/");
    const cleanParent = parentPath === "" ? "" : parentPath;
    const newPath = `${cleanParent}/${nameTrimmed}`;

    if (files[newPath]) {
      alert("A file or folder with this name already exists.");
      return;
    }

    setFiles((prev) => {
      const next = { ...prev };
      const oldNode = next[oldPath];
      if (!oldNode) return prev;

      next[newPath] = {
        ...oldNode,
        path: newPath,
        name: nameTrimmed,
        ...(!oldNode.isFolder && { language: getLanguageFromExtension(nameTrimmed) })
      };
      delete next[oldPath];

      if (oldNode.isFolder) {
        Object.keys(next).forEach((key) => {
          if (key.startsWith(oldPath + "/")) {
            const childNode = next[key];
            const relativePart = key.substring(oldPath.length);
            const newChildPath = newPath + relativePart;
            next[newChildPath] = { ...childNode, path: newChildPath };
            delete next[key];
          }
        });
      }

      return next;
    });

    return { oldPath, newPath };
  };

  const updateFileContent = ({ setFiles, path, content }) => {
    setFiles((prev) => {
      if (!prev[path]) return prev;
      return { ...prev, [path]: { ...prev[path], content } };
    });

    // SOCKET PLACEHOLDER: Broadcast code changes here
    // if (isJoined) { socket.emit("code-change", { path, content }); }
  };

  const toggleFolderOpen = ({ setFiles, path }) => {
    setFiles((prev) => {
      if (!prev[path]) return prev;
      return { ...prev, [path]: { ...prev[path], isOpen: !prev[path].isOpen } };
    });
  };

  return (
    <ExplorerContext.Provider
      value={{
        files,
        setFiles,
        initialFiles,
        getLanguageFromExtension,
        createFile,
        deleteFile,
        renameFile,
        updateFileContent,
        toggleFolderOpen,
        getFileIcon
      }}
    >
      {children}
    </ExplorerContext.Provider>
  );
};

export const useExplorer = () => {
  const context = useContext(ExplorerContext);
  if (!context) {
    throw new Error("useExplorer must be used within an ExplorerProvider");
  }
  return context;
};