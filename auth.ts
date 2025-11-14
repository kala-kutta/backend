import * as argon2d from "argon2";
import * as jwt from "jsonwebtoken";
import { createId } from "@paralleldrive/cuid2";
import prisma from "./prisma";
import secrets from "./secrets";
import { Prisma } from "./prisma/generated/client";

export interface JwtPayload {
    username: string,
    id: string
}

export async function create(username: string, password: string): Promise<[authToken: string | null, errorMessage: string | null, statusCode: number]> {
    try {
        const newUserId = createId();
        await prisma.user.create({
            data: {
                id: newUserId,
                username: username,
                password: await argon2d.hash(password)
            }
        });
        const payload = {
            username: username,
            id: newUserId
        };
        const token = jwt.sign(payload, secrets.jwtToken, { expiresIn: "1d" }) as string;
        return [token, null, 200];
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return [null, "Username already taken", 400];
            }
        } else {
            console.error(error);
        }

        return [null, "An unknown error occurred", 500];
    }
}

export async function authenticate(username: string, password: string) : Promise<[authToken: string | null, errorMessage: string | null, statusCode: number]> {
    const allMatchingUsername = await prisma.user.findMany({
        where: { username: username }
    });
    if (allMatchingUsername.length != 1) {
        return [null, "Invalid username", 401];
    }
    const matchingUser = allMatchingUsername[0]!;
    if (!(await argon2d.verify(matchingUser.password, password))) {
        return [null, "Incorrect password", 401];
    }
    const payload: JwtPayload = {
        username: username,
        id: matchingUser.id
    };
    const token = jwt.sign(payload, secrets.jwtToken, { expiresIn: "1d" });
    return [token, null, 200];
}