import "reflect-metadata";
import { createYoga } from "graphql-yoga";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./src/user/user.resolver";

const yoga = createYoga({
  schema: await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: true,
  }),
});

const server = Bun.serve({
  fetch: yoga.fetch.bind(yoga),
  port: Bun.env.PORT,
});

console.info(`Server is running on ${new URL(yoga.graphqlEndpoint, `http://${server.hostname}:${server.port}`)}`);
