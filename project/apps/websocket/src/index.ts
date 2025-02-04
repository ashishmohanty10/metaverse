import { WebSocketServer } from "ws";
import { User } from "./managers/user-manager";
import { config } from "./config/config";

const wss = new WebSocketServer({ port: Number(config.port) });

wss.on("connection", function connection(ws) {
  console.log("User connected");
  let user = new User(ws);
  ws.on("error", console.error);

  ws.on("close", () => {
    user?.destroy();
  });
});
