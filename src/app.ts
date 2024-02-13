import { launchServer } from "./server.ts";
import "dotenv/config";

const port = Number(process.env.PORT);

await launchServer(port);
console.log(`Server started: http://localhost:${port}`);
