import { type JwtPayload, authenticate, create } from "./auth";
import express, { type NextFunction, type Request, type Response } from "express";
import restRouter from "./restrouter";
import secrets from "./secrets";
import { verify } from "jsonwebtoken";
import prisma from "./prisma";

const app = express();
const port = secrets.restPortNumber;

app.use(express.json());

// Purge all connections on server restart
await prisma.user.updateMany({
    data: {
        connections: []
    }
});

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Anonymous Discord" });
});

app.post("/create", async (req: Request, res: Response) => {
    if (!req.body) {
        return res.status(400).send("Need to JSON body");
    }
    const username = req.body["username"];
    const password = req.body["password"];

    if (!username || !password) {
        return res.status(400).send("Need to pass username and password");
    }

    if (!validateUsername(username)) {
        return res.status(400).send("Illegal characters, cannot have space or special characters in username");
    }

    const [authToken, errorMessage, statusCode] = await create(username, password);
    if (!errorMessage) {
        return res.status(200).send({ token: authToken });
    } else {
        return res.status(statusCode).send(errorMessage);
    }
});


app.post("/auth", async (req: Request, res: Response) => {
    if (!req.body) {
        return res.status(400).send("Need to JSON body");
    }
    const username = req.body["username"];
    const password = req.body["password"];

    if (!username || !password) {
        return res.status(400).send("Need to pass username and password");
    }
    const [authToken, errorMessage, statusCode] = await authenticate(username, password);

    if (authToken) {
        res.setHeader("Authorization", `Bearer ${authToken}`);
        res.status(200).json({token: authToken}).send();
    } else {
        res.status(statusCode).send(errorMessage);
    }
});

app.use("/rest", (req: Request, res: Response, next: NextFunction) => {
    const jwtToken = req.headers["authorization"];
    if (!jwtToken) {
        return res.status(401).send("No authorization provided");
    }

    try {
        const jwtDecrypted = verify(jwtToken.replace("Bearer ", ""), secrets.jwtToken) as JwtPayload;
        req.headers["x-user-name"] = jwtDecrypted.username;
        next();
    } catch {
        return res.status(401).send("Could not verify authorization");
    }
}, restRouter);

app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}`);
});


function validateUsername(username: string) {
    if (username.length < 6 || username.length > 30) {
        return false;
    }

    if (!/^[a-zA-Z0-9]/.test(username)) {
        return false;
    }

    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return false;
    }

    if (username.includes("..")) {
        return false;
    }

    return true;
}