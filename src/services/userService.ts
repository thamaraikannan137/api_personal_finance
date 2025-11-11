import User, { type IUser } from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { USER_ROLES } from "../config/constants.js";

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

class UserService {
  async createUser(data: CreateUserData): Promise<IUser> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: (data.role as typeof USER_ROLES[keyof typeof USER_ROLES]) || USER_ROLES.USER,
    });

    return user;
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async updateUser(id: string, data: UpdateUserData): Promise<IUser> {
    const user = await this.getUserById(id);

    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        throw new ConflictError("Email already exists");
      }
    }

    Object.assign(user, data);
    await user.save();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await user.deleteOne();
  }

  async verifyPassword(email: string, password: string): Promise<IUser> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    return user;
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: IUser[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}

export default new UserService();
