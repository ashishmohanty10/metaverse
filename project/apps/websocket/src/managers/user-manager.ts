import { WebSocket } from "ws";
import { RoomManager } from "./room-manager";
import { OutgoingMessage } from "../types/types";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { prisma } from "@repo/db/client";
function getRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export class User {
  public id: string;
  public userId?: string;
  private spaceId?: string;
  private x: number;
  private y: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.id = getRandomString(10);
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.initHandlers();
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      console.log(data);
      const parsedData = JSON.parse(data.toString());
      console.log(parsedData);
      console.log("parsedData");
      switch (parsedData.type) {
        case "join":
          const spaceId = parsedData.payload.spaceId;
          const token = parsedData.payload.token;
          const userId = (jwt.verify(token, config.jwtPassword!) as JwtPayload)
            .userId;
          if (!userId) {
            this.ws.close();
            return;
          }

          this.userId = userId;
          const space = await prisma.space.findFirst({
            where: {
              id: spaceId,
            },
          });

          if (!space) {
            this.ws.close();
            return;
          }

          this.spaceId = spaceId;
          RoomManager.getInstance().addUser(spaceId, this);
          this.x = Math.floor(Math.random() * space?.width);
          this.y = Math.floor(Math.random() * space?.height);
          this.send({
            type: "space-joined",
            payload: {
              spawn: {
                x: this.x,
                y: this.y,
              },
              users:
                RoomManager.getInstance()
                  .rooms.get(spaceId)
                  ?.filter((x) => x.id !== this.id)
                  ?.map((u) => ({ id: u.id })) ?? [],
            },
          });
          console.log("jouin receiverdf5");
          RoomManager.getInstance().broadcast(
            {
              type: "user-joined",
              payload: {
                userId: this.userId,
                x: this.x,
                y: this.y,
              },
            },
            this,
            this.spaceId!
          );
          break;
        case "move":
          const moveX = parsedData.payload.x;
          const moveY = parsedData.payload.y;
          const xDisplacement = Math.abs(this.x - moveX);
          const yDisplacement = Math.abs(this.y - moveY);
          if (
            (xDisplacement == 1 && yDisplacement == 0) ||
            (xDisplacement == 0 && yDisplacement == 1)
          ) {
            this.x = moveX;
            this.y = moveY;
            RoomManager.getInstance().broadcast(
              {
                type: "movement",
                payload: {
                  x: this.x,
                  y: this.y,
                },
              },
              this,
              this.spaceId!
            );
            return;
          }

          this.send({
            type: "movement-rejected",
            payload: {
              x: this.x,
              y: this.y,
            },
          });
      }
    });
  }

  destroy() {
    RoomManager.getInstance().broadcast(
      {
        type: "user-left",
        payload: {
          userId: this.userId,
        },
      },
      this,
      this.spaceId!
    );
    RoomManager.getInstance().removeUser(this, this.spaceId!);
  }

  send(payload: OutgoingMessage) {
    this.ws.send(JSON.stringify(payload));
  }
}
