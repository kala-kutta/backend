import { type Request, type Response, Router } from "express";
import { createServer } from "./socketman";

const restRouter = Router();
restRouter.post("/connect", (req: Request, res: Response) => {
    const username = req.headers["x-user-name"];
    const targetUsername = req.query["targetusername"] as string;

    if (!username) {
        return res.status(403).send("No username provided");
    }

    if (!targetUsername){
        return res.status(400).send("No target user name provided");
    }

    const newPath = createServer(username.toString(), targetUsername);
    res.status(200).json({path: newPath}).send();
});

export default restRouter;