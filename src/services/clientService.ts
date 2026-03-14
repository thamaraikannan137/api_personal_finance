import mongoose from "mongoose";
import { parse } from "csv-parse/sync";
import Client, { type IClient } from "../models/Client.js";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors.js";

export interface CreateClientData {
  auditorId: string;
  name: string;
  pan?: string;
  dateOfBirth?: string;
  permanentAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  officeAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  email?: string;
  phone?: string;
}

export type UpdateClientData = Partial<Omit<CreateClientData, "auditorId">>;

class ClientService {
  async createClient(data: CreateClientData): Promise<IClient> {
    if (data.pan) {
      const existing = await Client.findOne({
        auditorId: new mongoose.Types.ObjectId(data.auditorId),
        pan: data.pan.toUpperCase(),
      });
      if (existing) {
        throw new ConflictError("A client with this PAN already exists");
      }
    }

    const client = await Client.create({
      ...data,
      auditorId: new mongoose.Types.ObjectId(data.auditorId),
      pan: data.pan ? data.pan.toUpperCase() : undefined,
    });
    return client;
  }

  async getClients(
    auditorId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    isActive?: boolean
  ): Promise<{ clients: IClient[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {
      auditorId: new mongoose.Types.ObjectId(auditorId),
    };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { pan: { $regex: search, $options: "i" } },
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const [clients, total] = await Promise.all([
      Client.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Client.countDocuments(query),
    ]);

    return { clients, total, pages: Math.ceil(total / limit) };
  }

  async getClientById(id: string, auditorId: string): Promise<IClient> {
    const client = await Client.findOne({
      _id: new mongoose.Types.ObjectId(id),
      auditorId: new mongoose.Types.ObjectId(auditorId),
    });
    if (!client) throw new NotFoundError("Client not found");
    return client;
  }

  async updateClient(id: string, auditorId: string, data: UpdateClientData): Promise<IClient> {
    const client = await this.getClientById(id, auditorId);
    Object.assign(client, data);
    await client.save();
    return client;
  }

  async deleteClient(id: string, auditorId: string): Promise<void> {
    const client = await this.getClientById(id, auditorId);
    client.isActive = false;
    await client.save();
  }

  async importFromCSV(auditorId: string, fileBuffer: Buffer): Promise<{ imported: number; errors: string[] }> {
    let records: Record<string, string>[];
    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw new BadRequestError("Invalid CSV file format");
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i] as Record<string, string>;
      const rowNum = i + 2;
      if (!row["name"] || !row["pan"]) {
        errors.push(`Row ${rowNum}: name and pan are required`);
        continue;
      }
      try {
        await this.createClient({
          auditorId,
          name: row["name"],
          pan: row["pan"],
          dateOfBirth: row["dateOfBirth"] || undefined,
          email: row["email"] || undefined,
          phone: row["phone"] || undefined,
          permanentAddress: {
            line1: row["permanentAddress.line1"] || undefined,
            city: row["permanentAddress.city"] || undefined,
            state: row["permanentAddress.state"] || undefined,
            pincode: row["permanentAddress.pincode"] || undefined,
          },
        });
        imported++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Row ${rowNum} (${row["name"]}): ${msg}`);
      }
    }

    return { imported, errors };
  }
}

export default new ClientService();
