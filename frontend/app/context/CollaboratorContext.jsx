"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { useExplorer } from "./ExplorerContext";
import { io } from "socket.io-client"

const CollaborativeContext = createContext();

export const CollaborativeProvider = ({ children }) => {
    const { initialFiles, createFile, getLanguageFromExtension } = useExplorer()
    const [collaboratedFiles, setCollaboratedFiles] = useState(initialFiles)
    const [remoteCursors, setRemoteCursors] = useState({});
    const [roomID, setRoomID] = useState("");
    const [username, setUsername] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);

    const randomColor = () => {
        return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    }

    const createCollaboratedFile = ({ parentPath, name, isFolder = false }) => {
        if (!name || name.trim() === "") return;

        const cleanParent = parentPath === "/" ? "" : parentPath;
        const newPath = `${cleanParent}/${name.trim()}`;

        if (collaboratedFiles[newPath]) {
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

        setCollaboratedFiles((prev) => ({ ...prev, [newPath]: newFileNode }));

        return newPath;
    };

    const deleteCollaboratedFile = (path) => {
        setCollaboratedFiles((prev) => {
            const next = { ...prev };
            delete next[path];
            Object.keys(next).forEach((key) => {
                if (key.startsWith(path + "/")) delete next[key];
            });
            return next;
        });

    };

    const renameCollaboratedFile = ({ oldPath, newName }) => {
        if (!newName || newName.trim() === "") return;
        const nameTrimmed = newName.trim();

        const parts = oldPath.split("/");
        parts.pop();
        const parentPath = parts.join("/");
        const cleanParent = parentPath === "" ? "" : parentPath;
        const newPath = `${cleanParent}/${nameTrimmed}`;

        if (collaboratedFiles[newPath]) {
            alert("A file or folder with this name already exists.");
            return;
        }

        setCollaboratedFiles((prev) => {
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

    const socketRef = useRef(null);
    // due to stale closure problem we have to create a useref for the collaborated file function
    const createCollaboratedFileRef = useRef(createCollaboratedFile);
    useEffect(() => {
        createCollaboratedFileRef.current = createCollaboratedFile;
    });
    const deleteCollaboratedFileRef = useRef(deleteCollaboratedFile);
    useEffect(() => {
        deleteCollaboratedFileRef.current = deleteCollaboratedFile;
    });

    const renameCollaboratedFileRef = useRef(renameCollaboratedFile);
    useEffect(() => {
        renameCollaboratedFileRef.current = renameCollaboratedFile;
    });


    useEffect(() => {
        socketRef.current = io("https://nexus-backend-u07m.onrender.com", {
            transports: ["websocket", "polling"],
        });;

        socketRef.current.on("room-users", (users) => {
            setCollaborators(users);
        });

        socketRef.current.on("user-joined", (users) => {
            setCollaborators(users);
        });

        socketRef.current.on("receive-message", (message) => {
            setChatMessages((prev) => [...prev, message]);
        });

        socketRef.current.on("code-update", ({ path, content }) => {
            setCollaboratedFiles((prev) => {
                if (!prev[path]) return prev;
                return {
                    ...prev,
                    [path]: {
                        ...prev[path],
                        content,
                    },
                };
            });
        });

        socketRef.current.on("get-create-file", (fileData) => {
            createCollaboratedFileRef.current({
                parentPath: fileData.parentPath,
                name: fileData.name,
                isFolder: fileData.isFolder,
            });
        });

        socketRef.current.on("get-delete-file", (path) => {
            deleteCollaboratedFileRef.current(path);
        })

        socketRef.current.on("get-rename-file", (data) => {
            renameCollaboratedFileRef.current({ newName: data.newName, oldPath: data.oldPath })
        })

        socketRef.current.on("cursor-position", ({ userId, path, position, color, username }) => {
            setRemoteCursors(prev => ({
                ...prev,
                [userId]: {
                    path,
                    position,
                    color,
                    username
                }
            }));
        })

        return () => {
            socketRef.current.disconnect();
        };
    }, []);



    const joinRoom = (roomId, user) => {
        if (!roomId || !user) return;
        setRoomID(roomId);
        setUsername(user);
        setIsJoined(true);

        setChatMessages([
            {
                id: "system-1",
                user: "System",
                text: `Connected to room ${roomId}. Welcome to the workspace!`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                isSystem: true
            }
        ]);

        socketRef.current.emit("join", {
            roomId,
            username: user,
        });

    };

    const leaveRoom = () => {
        socketRef.current.emit("leave-room");
        setRoomID("");
        setUsername("");
        setIsJoined(false);
        setCollaborators([]);
        setChatMessages([]);
    };

    const sendContent = ({ path, content }) => {
        socketRef.current.emit("send-code", { path, content });
    }
    const serverCreateFile = (file) => {
        socketRef.current.emit("create-file", file)
    }

    const serverDeleteFile = (path) => {
        socketRef.current.emit("delete-file", path);

    }

    const serverRenameFile = ({ oldPath, newName }) => {
        socketRef.current.emit("rename-file", { oldPath, newName })
    }

    const serverSendCursorPosition = ({ path, position }) => {
        socketRef.current.emit("cursor-move", { path, position })

    }
    const sendChatMessage = (text) => {
        if (!text.trim()) return;

        const newMessage = {
            id: `msg-${Date.now()}`,
            user: username || "Guest",
            text: text.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isSystem: false
        };

        // setChatMessages((prev) => [...prev, newMessage]);

        socketRef.current.emit("send-message", newMessage);

        // Simulate collaborator reply in mock environment
        // if (chatMessages.length === 1) {
        //     setTimeout(() => {
        //         const reply = {
        //             id: `msg-${Date.now() + 1}`,
        //             user: "Alex (Backend)",
        //             text: "Hey there! Ready to write some awesome code in real-time.",
        //             timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        //             isSystem: false
        //         };
        //         setChatMessages((prev) => [...prev, reply]);
        //     }, 1500);
        // }
    };

    return (
        <CollaborativeContext.Provider
            value={{
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
                sendContent,
                serverCreateFile,
                createCollaboratedFile,
                deleteCollaboratedFile,
                serverDeleteFile,
                renameCollaboratedFile,
                serverRenameFile,
                serverSendCursorPosition,
                remoteCursors,
                setRemoteCursors
            }}
        >
            {children}
        </CollaborativeContext.Provider>
    );
};

export const useCollaborative = () => {
    const context = useContext(CollaborativeContext);
    if (!context) {
        throw new Error("useCollaborative must be used within a CollaborativeProvider");
    }
    return context;
}; 