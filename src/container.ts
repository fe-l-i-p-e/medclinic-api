import { DataSource } from "typeorm";
import { UserRepository } from "./repositories/user.repository";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";

export interface Controllers {
  auth: AuthController;
  user: UserController;
}

// Composition root: único lugar onde as dependências são instanciadas.
export function buildContainer(dataSource: DataSource): Controllers {
  const userRepository = new UserRepository(dataSource);
  const authService = new AuthService(userRepository);
  const userService = new UserService(userRepository);

  return {
    auth: new AuthController(authService),
    user: new UserController(userService),
  };
}
