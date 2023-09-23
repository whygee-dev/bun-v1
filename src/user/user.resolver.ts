import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { User } from "./user.model";
import { UserService } from "./user.service";
import Container from "typedi";

@Resolver(User)
export class UserResolver {
  private readonly userService: UserService = Container.get(UserService);

  @Query(() => User, { nullable: true })
  async userByEmail(
    @Arg("email", () => String)
    email: string
  ): Promise<User | null> {
    return this.userService.findOneByEmail(email);
  }

  @Query(() => User, { nullable: true })
  async userById(
    @Arg("id", () => Int)
    id: number
  ): Promise<User | null> {
    return this.userService.findOneById(id);
  }

  @Mutation(() => User)
  async createUser(
    @Arg("email", () => String)
    email: string,
    @Arg("fullName", () => String)
    fullName: string,
    @Arg("password", () => String)
    password: string
  ): Promise<User> {
    return this.userService.create({
      email,
      fullName,
      password,
    });
  }

  @Mutation(() => User)
  async updateUser(
    @Arg("id", () => Int)
    id: number,
    @Arg("fullName", () => String, { nullable: true })
    fullName?: string,
    @Arg("password", () => String, { nullable: true })
    password?: string
  ): Promise<User> {
    return this.userService.update({
      id,
      fullName,
      password,
    });
  }
}
