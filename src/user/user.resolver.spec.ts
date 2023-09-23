import { beforeAll, describe, expect, it } from "bun:test";
import { User } from "./user.model";
import { TestManager } from "../tests/TestManager";
import { faker } from "@faker-js/faker";
import { CryptoService } from "../crypto/crypto.service";

describe("UserResolver", async () => {
  const manager = new TestManager();

  beforeAll(async () => {
    await manager.prisma.user.deleteMany();
  });

  const createUserData = () => ({
    email: faker.internet.email(),
    fullName: faker.person.fullName(),
    password: "__test__",
  });

  const createUser = async () => {
    return manager.prisma.user.create({
      data: createUserData(),
    });
  };

  describe("userById", async () => {
    it("should return a user", async () => {
      // Arrange
      const query = `
        query userById($id: Int!) {
          userById(id: $id) {
            id
            email
            fullName
            createdAt
            updatedAt
          }
        }
      `;

      const user = await createUser();

      // Act
      const response: {
        data?: {
          userById: User;
        };
      } = await manager.send(query, { id: user.id });

      // Assert
      expect(response.data?.userById).toEqual({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    });
  });

  describe("userByEmail", async () => {
    it("should return a user", async () => {
      // Arrange
      const query = `
        query userByEmail($email: String!) {
            userByEmail(email: $email) {
                id
                email
                fullName
                createdAt
                updatedAt
            }
        }
      `;

      const user = await createUser();

      // Act
      const response: {
        data?: {
          userByEmail: User;
        };
      } = await manager.send(query, { email: user.email });

      // Assert
      expect(response.data?.userByEmail).toEqual({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    });
  });

  describe("createUser", async () => {
    it("should create a user", async () => {
      // Arrange
      const mutation = `
        mutation createUser($email: String!, $fullName: String!, $password: String!) {
            createUser(email: $email, fullName: $fullName, password: $password) {
                id
                email
                fullName
                createdAt
                updatedAt
            }
        }
      `;

      const data = createUserData();

      // Act
      const response: {
        data?: {
          createUser: User;
        };
      } = await manager.send(mutation, data);

      // Assert
      expect(response.data?.createUser).toEqual({
        id: expect.any(Number),
        email: data.email,
        fullName: data.fullName,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      const user = await manager.prisma.user.findUnique({
        where: {
          id: response.data?.createUser.id,
        },
      });

      expect(user).toEqual({
        id: response.data?.createUser.id,
        email: data.email,
        fullName: data.fullName,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        password: expect.any(String),
      });

      expect(await new CryptoService().verifyPassword(data.password, user?.password!)).toBe(true);
    });
  });

  describe("updateUser", async () => {
    it("should update a user", async () => {
      // Arrange
      const mutation = `
        mutation updateUser($id: Int!, $fullName: String!, $password: String!) {
            updateUser(id: $id, fullName: $fullName, password: $password) {
                id
                email
                fullName
                createdAt
                updatedAt
            }
        }
      `;

      const user = await createUser();

      const data = createUserData();

      // Act
      const response: {
        data?: {
          updateUser: User;
        };
      } = await manager.send(mutation, {
        id: user.id,
        fullName: data.fullName,
        password: data.password,
      });

      // Assert
      expect(response.data?.updateUser).toEqual({
        id: user.id,
        email: user.email,
        fullName: data.fullName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: expect.any(String),
      });

      const updatedUser = await manager.prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      expect(updatedUser).toEqual({
        id: user.id,
        email: user.email,
        fullName: data.fullName,
        createdAt: user.createdAt,
        updatedAt: expect.any(Date),
        password: expect.any(String),
      });

      expect(updatedUser?.password).not.toEqual(data.password);
    });
  });
});
