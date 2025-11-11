import mongoose from "mongoose";
import Liability, { type ILiability } from "../models/Liability.js";
import { NotFoundError } from "../utils/errors.js";

export interface CreateLiabilityData {
  userId: string;
  name: string;
  category: string;
  balance: number;
  interestRate?: number;
  dueDate?: string;
  institution?: string;
  owner: string;
  notes?: string;
  customFields?: any[];
  customCategoryName?: string;
}

export interface UpdateLiabilityData {
  name?: string;
  category?: string;
  balance?: number;
  interestRate?: number;
  dueDate?: string;
  institution?: string;
  owner?: string;
  notes?: string;
  customFields?: any[];
  customCategoryName?: string;
}

class LiabilityService {
  async createLiability(data: CreateLiabilityData): Promise<ILiability> {
    // Convert userId string to ObjectId
    const liabilityData = {
      ...data,
      userId: new mongoose.Types.ObjectId(data.userId),
    };
    const liability = await Liability.create(liabilityData);
    return liability;
  }

  async getLiabilityById(id: string, userId: string): Promise<ILiability> {
    const liability = await Liability.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId)
    });
    if (!liability) {
      throw new NotFoundError("Liability not found");
    }
    return liability;
  }

  async getUserLiabilities(
    userId: string,
    page: number = 1,
    limit: number = 50,
    category?: string
  ): Promise<{ liabilities: ILiability[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (category) {
      query.category = category;
    }

    const [liabilities, total] = await Promise.all([
      Liability.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Liability.countDocuments(query)
    ]);

    return {
      liabilities,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async updateLiability(id: string, userId: string, data: UpdateLiabilityData): Promise<ILiability> {
    const liability = await this.getLiabilityById(id, userId);
    
    Object.assign(liability, data);
    await liability.save();
    
    return liability;
  }

  async deleteLiability(id: string, userId: string): Promise<void> {
    const liability = await this.getLiabilityById(id, userId);
    await liability.deleteOne();
  }

  async getTotalBalance(userId: string): Promise<number> {
    const result = await Liability.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);
    
    return result[0]?.total || 0;
  }

  async getLiabilitiesByCategory(userId: string): Promise<{ category: string; total: number; count: number }[]> {
    const result = await Liability.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$balance" },
          count: { $count: {} }
        }
      },
      {
        $project: {
          category: "$_id",
          total: 1,
          count: 1,
          _id: 0
        }
      }
    ]);
    
    return result;
  }
}

export default new LiabilityService();

