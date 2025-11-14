import dotenv from "dotenv";
dotenv.config();

const secrets = {
    jwtToken: process.env.JWT_SECRET_TOKEN!,
    dbConnectionUrl: process.env.DATABASE_URL,
    restPortNumber: Number(process.env.REST_PORT ?? 3000),
    websocketPortNumber: Number(process.env.WS_PORT ?? 4000)
};

export default secrets;