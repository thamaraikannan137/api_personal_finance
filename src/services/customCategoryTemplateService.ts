import mongoose from "mongoose";
import CustomCategoryTemplate, {
  type ICustomCategoryTemplate,
  type CustomCategoryType,
  type ICustomCategoryField,
} from "../models/CustomCategoryTemplate.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

interface CreateTemplateData {
  name: string;
  categoryType: CustomCategoryType;
  description?: string;
  icon?: string;
  fields: ICustomCategoryField[];
}

interface UpdateTemplateData {
  name?: string;
  categoryType?: CustomCategoryType;
  description?: string;
  icon?: string;
  fields?: ICustomCategoryField[];
}

const sanitizeFields = (
  fields: ICustomCategoryField[] | undefined
): ICustomCategoryField[] | undefined => {
  if (!fields) {
    return undefined;
  }

  return fields.map((field) => ({
    id: field.id || `field-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: field.name,
    type: field.type,
    required: field.required ?? false,
    placeholder: field.placeholder,
  }));
};

class CustomCategoryTemplateService {
  async getTemplates(
    userId: string,
    categoryType?: CustomCategoryType
  ): Promise<ICustomCategoryTemplate[]> {
    const query: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (categoryType) {
      query.categoryType = categoryType;
    }

    return CustomCategoryTemplate.find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTemplateById(
    id: string,
    userId: string
  ): Promise<ICustomCategoryTemplate> {
    const template = await CustomCategoryTemplate.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();

    if (!template) {
      throw new NotFoundError("Custom category not found");
    }

    return template;
  }

  async createTemplate(
    userId: string,
    data: CreateTemplateData
  ): Promise<ICustomCategoryTemplate> {
    const normalizedName = data.name.trim();
    const normalizedType = data.categoryType;

    const existing = await CustomCategoryTemplate.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      categoryType: normalizedType,
      name: {
        $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i"),
      },
    }).exec();

    if (existing) {
      throw new ConflictError(
        `A custom ${normalizedType} category named "${normalizedName}" already exists`
      );
    }

    const template = await CustomCategoryTemplate.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: normalizedName,
      categoryType: normalizedType,
      description: data.description,
      icon: data.icon,
      fields: sanitizeFields(data.fields),
    });

    return template;
  }

  async updateTemplate(
    id: string,
    userId: string,
    data: UpdateTemplateData
  ): Promise<ICustomCategoryTemplate> {
    const template = await this.getTemplateById(id, userId);

    if (data.name && data.name.trim() !== template.name) {
      const existing = await CustomCategoryTemplate.findOne({
        userId: template.userId,
        categoryType: data.categoryType ?? template.categoryType,
        name: {
          $regex: new RegExp(`^${escapeRegex(data.name.trim())}$`, "i"),
        },
        _id: { $ne: template._id },
      }).exec();

      if (existing) {
        throw new ConflictError(
          `A custom ${existing.categoryType} category named "${data.name}" already exists`
        );
      }
    }

    if (data.name) {
      template.name = data.name.trim();
    }
    if (data.categoryType) {
      template.categoryType = data.categoryType;
    }
    if (data.description !== undefined) {
      template.description = data.description;
    }
    if (data.icon !== undefined) {
      template.icon = data.icon;
    }
    if (data.fields) {
      const sanitized = sanitizeFields(data.fields);
      if (!sanitized || sanitized.length === 0) {
        throw new ConflictError("At least one custom field is required");
      }
      template.fields = sanitized;
    }

    await template.save();
    return template;
  }

  async deleteTemplate(id: string, userId: string): Promise<void> {
    const template = await this.getTemplateById(id, userId);
    await template.deleteOne();
  }
}

export default new CustomCategoryTemplateService();


