import { createId } from "@paralleldrive/cuid2";
import secrets from "./secrets";
import { type ServerWebSocket } from "bun";


type ConnectionMap = Record<string, [endpoint: string, target: string]>;
type WebSocketData = {
    username: string;
};

const connections: ConnectionMap = {};
const clients: ServerWebSocket<WebSocketData>[] = [];

export function createServer(username: string, targetUsername: string) {
    if (connections[targetUsername]) {
        connections[username] = connections[targetUsername];
        return connections[targetUsername][0];
    }

    const newPath = createId();
    connections[targetUsername] = [newPath, username];
    connections[username] = [newPath, targetUsername];
    return newPath;
}

export function runWebsocketServer() {
    console.log("Running websocket server on port ", secrets.websocketPortNumber);
    const server = Bun.serve({
        port: secrets.websocketPortNumber,
        fetch(req, server) {
            const url = req.url;
            const username = req.headers.get("x-username");

            if (!username) {
                return new Response("Upgrade failed, request header did not contain x-username", {
                    status: 401
                });
            }

            const serverEndpoint = connections[username]?.[0];
            if (!serverEndpoint) {
                return new Response("Upgrade failed, you need to connect via the RestAPI first", {
                    status: 400
                });
            }

            if (url.endsWith(serverEndpoint)) {
                server.upgrade(req, {
                    data: {
                        username: username
                    }
                });
                return undefined;
            }

            return new Response("Upgrade failed, you need to connect via the RestAPI first", {
                status: 400
            });
        },
        websocket: {
            data: {} as WebSocketData,
            async open(ws) {
                clients.push(ws);
            },
            async message(ws, message) {
                clients.forEach((eachClient) => {
                    if (eachClient !== ws)
                    {eachClient.send(message);}
                });
            },
            async close(ws) {
                delete connections[ws.data.username];

            },
        },
    });
    return server;
}