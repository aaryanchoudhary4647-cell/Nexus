import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import http from "http"

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://nexus-frontend-smoky.vercel.app",
        methods: ["GET", "POST"],
    }
})
const rooms = {};
const randomColor = () => {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
}

io.on("connection", (socket) => {
    socket.on("join", (data) => {
        const { roomId, username } = data;
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.username = username;
        if (!rooms[roomId]) rooms[roomId] = [];

        const newUser = {
            id: socket.id,
            username,
            avatar: username.slice(0, 2).toUpperCase(),
            color: randomColor(),
            status: "online",
        }
        rooms[roomId].push(newUser);
        socket.data.color = newUser.color

        // Notify everyone else
        io.to(roomId).emit("user-joined", rooms[roomId]);
    })

    socket.on("send-message", (data) => {
        const { roomId } = socket.data
        io.to(roomId).emit("receive-message", data)
    })

    socket.on("send-code", (data) => {
        const { roomId } = socket.data
        socket.to(roomId).emit("code-update", data);
    })

    socket.on("create-file", (fileData) => {
        const { roomId } = socket.data

        socket.to(roomId).emit("get-create-file", fileData)
    })

    socket.on("delete-file", (path) => {
        const { roomId } = socket.data
        socket.to(roomId).emit("get-delete-file", path);
    })

    socket.on("rename-file", (data) => {
        const { roomId } = socket.data
        socket.to(roomId).emit("get-rename-file", data)
    })

    socket.on("cursor-move", ({ path, position }) => {
        const { roomId,color,username } = socket.data
        socket.to(roomId).emit("cursor-position", {
            userId: socket.id,
            path,
            position,
            color,
            username
        })
    })

    socket.on("leave-room", () => {
        const { roomId } = socket.data;

        if (!roomId || !rooms[roomId]) return;

        rooms[roomId] = rooms[roomId].filter(
            (users) => users.id !== socket.id
        )

        socket.leave(roomId);

        if (rooms[roomId].length === 0) {
            delete rooms[roomId];
        } else {
            io.to(roomId).emit("room-users", rooms[roomId]);
        }
        socket.data.roomId = null;
        socket.data.username = null;

    })
    // HERE DISCONNECT IS AN IN-BUILT SOCKET EVENT WHICH TRIGGERS WHEN THE USER COLSES TAB OR REFRESHES THE PAGE OR LOSES INTERNET CONNECTIVITY
    socket.on("disconnect", () => {
        const { roomId } = socket.data;

        if (!roomId || !rooms[roomId]) return;

        rooms[roomId] = rooms[roomId].filter(
            (user) => user.id !== socket.id
        );
        if (rooms[roomId].length === 0) {
            delete rooms[roomId]
        }
        else {
            io.to(roomId).emit("room-users", rooms[roomId]);
        }


    });
})

const PORT = "https://nexus-backend-u07m.onrender.com" || 3000

server.listen(PORT, () => {
    console.log("Server started on port 3000")
})