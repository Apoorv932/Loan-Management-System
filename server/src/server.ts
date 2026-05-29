import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

async function bootstrap() {
  await connectDb();

  app.listen(env.port, () => {
    console.log(`API server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
