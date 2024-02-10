import { once } from "events";
import http from "http";
import { END_POINTS } from "./constants/constants.ts";
import { usersController } from "./controllers/usersController.ts";

export async function setupHttpServer() {
  const server = http.createServer(async (req, res) => {
    console.log("req", req.url, req.method);
    if (!req.url?.startsWith(END_POINTS.users)) {
      res.writeHead(404);
      res.end("Endpoint not found");
      return;
    }

    try {
      return await usersController(req, res);
    } catch (error) {
      res.writeHead(500);
      res.end("Server encountered an unexpected error");
    }
  });

  return server;
}

export async function launchServer(port: number = 4000) {
  const server = await setupHttpServer();
  server.listen(port);
  await once(server, "listening");
}
