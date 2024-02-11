import cluster from "cluster";
import { cpus } from "os";
import { pid } from "process";

import { launchServer } from "./server.ts";
import { setDatabase } from "./services/userService.ts";

import "dotenv/config";
const port = Number(process.env.PORT);

if (cluster.isPrimary) {
  console.log(`Primary ${pid} is running`);

  for (let i = 0; i < cpus().length; i++) {
    const worker = cluster.fork();
    worker.on("message", syncData);
    worker.on("error", (err) => console.log("Worker error", err));
  }
} else {
  process.on("message", async function (msg: any) {
    try {
      if (msg.task && msg.task === "sync") {
        setDatabase(msg.data);
      }
    } catch (error) {
      console.log("Cluster error", error);
    }
  });

  const id = cluster.worker?.id;
  const port = Number(process.env.PORT) + cluster.worker.id - 1;

  await launchServer(port);
  console.log(
    `Worker: ${id}, pid: ${pid}, Server started: http://localhost:${port}`
  );
}

function syncData(msg: any) {
  if (msg.task === "sync") {
    const data = msg.data;

    for (const worker of Object.values(cluster.workers || {})) {
      worker?.send({
        task: "sync",
        data,
      });
    }
  }
}
