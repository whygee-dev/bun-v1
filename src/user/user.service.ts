import Container, { Service } from "typedi";
import { PrismaService } from "../prisma/prisma.service";
import { CryptoService } from "../crypto/crypto.service";
import { Prisma } from "@prisma/client";

const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Service()
export class UserService {
  private readonly prisma: PrismaService = Container.get(PrismaService);
  private readonly crypto: CryptoService = Container.get(CryptoService);

  async findOneById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      select: USER_SELECT,
    });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: USER_SELECT,
    });
  }

  async create(data: { email: string; fullName: string; password: string }) {
    return this.prisma.user.create({
      data: {
        ...data,
        password: await this.crypto.hashPassword(data.password),
      },
      select: USER_SELECT,
    });
  }

  async update(data: { id: number; fullName?: string; password?: string }) {
    return this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        fullName: data.fullName ? data.fullName : undefined,
        password: data.password ? await this.crypto.hashPassword(data.password) : undefined,
      },
      select: USER_SELECT,
    });
  }
}
