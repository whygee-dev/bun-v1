import "reflect-metadata";
import { Server } from "bun";
import { UserResolver } from "../user/user.resolver";
import { buildSchema } from "type-graphql";
import { createYoga } from "graphql-yoga";
import { PrismaClient } from "@prisma/client";

export class TestManager {
  #server: Server;
  #prisma: PrismaClient = new PrismaClient();

  async server(): Promise<Server> {
    this.#server ??= Bun.serve({
      fetch: createYoga({
        schema: await buildSchema({
          resolvers: [UserResolver],
        }),
      }).fetch,
    });

    return this.#server;
  }

  async url(): Promise<string> {
    const server = await this.server();

    return `
      http://${server.hostname}:${server.port}/graphql
    `;
  }

  get prisma() {
    return this.#prisma;
  }

  async send(query: string, variables: Record<string, unknown>) {
    return (
      await fetch(await this.url(), {
        method: "POST",
        body: JSON.stringify({ variables, query }),
        headers: { "Content-Type": "application/json" },
      })
    ).json();
  }
}
