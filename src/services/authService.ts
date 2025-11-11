import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import userService from "./userService.js";

class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const user = await userService.createUser(data);

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userData = user.toObject();
    const { password, ...userWithoutPassword } = userData;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await userService.verifyPassword(email, password);

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userData = user.toObject();
    const { password: _, ...userWithoutPassword } = userData;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const { verifyRefreshToken } = await import("../utils/jwt.js");
    const decoded = verifyRefreshToken(refreshToken);

    const user = await userService.getUserById(decoded.userId);

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: newAccessToken,
    };
  }
}

export default new AuthService();
