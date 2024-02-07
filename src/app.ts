import http from "http";
import { END_POINTS, DEFAULT_PORT } from "./constants/constants.ts";
import { User } from "./types/types.ts";

const users: User[] = [];

const usersController = (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      data: "Hello World!",
    })
  );
};
const server = http.createServer((req, res) => {
  if (req.url?.startsWith(END_POINTS.users)) {
    return usersController(req, res);
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(DEFAULT_PORT, () => console.log("start"));
