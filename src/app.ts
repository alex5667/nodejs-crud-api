import http from "http";
import { END_POINTS, DEFAULT_PORT } from "./constants/constants.ts";
import { usersController } from "./controllers/usersController.ts";

const server = http.createServer(async (req, res) => {
  console.log("req", req.url);

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
server.listen(DEFAULT_PORT, () => console.log("start"));
