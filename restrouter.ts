import { type Request, type Response, Router } from "express";
import prisma from "./prisma";
import { createId } from "@paralleldrive/cuid2";

const restRouter = Router();
restRouter.post("/connect", async (req: Request, res: Response) => {
    const username = req.headers["x-user-name"];
    const targetUsername = req.body["targets"] as string[];

    if (!username) {
        return res.status(400).send("No username provided");
    }

    if (!targetUsername) {
        return res.status(400).send("No target user name provided");
    }

    const newConnectionId = createId();

    await prisma.connections.create({ data: {
        id: newConnectionId
    }});

    const updateableUsernames = targetUsername;
    updateableUsernames.push(username.toString());

    await prisma.user.updateMany({ where: {
        username: {
            in: updateableUsernames
        }
    }, data: {
        connections: {
            push: newConnectionId
        }
    }});

    return res.status(200).send({ conId: newConnectionId });

});

export default restRouter;