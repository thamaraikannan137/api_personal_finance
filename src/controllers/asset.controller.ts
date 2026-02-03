import type { Response, NextFunction } from "express";
import assetService from "../services/assetService.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { uploadFileToS3, deleteFilesFromS3ByUrls } from "../services/s3Service.js";

class AssetController {
  async createAsset(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      // Handle file uploads if present
      let documentUrls: string[] = [];
      if (req.files && typeof req.files === "object" && "files" in req.files) {
        const files = req.files.files as Express.Multer.File[];
        if (Array.isArray(files) && files.length > 0) {
          console.log(`Uploading ${files.length} file(s) to S3`);
          try {
            const category = req.body.category || 'other';
            const assetName = req.body.name || 'asset';
            
            const uploadPromises = files.map((file, index) => {
              console.log(`File ${index + 1}: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);
              return uploadFileToS3(file, {
                type: 'assets',
                category,
                name: assetName,
                fileIndex: index,
              });
            });
            const results = await Promise.all(uploadPromises);
            documentUrls = results.map((result) => result.url);
            console.log(`Successfully uploaded ${documentUrls.length} file(s) to S3`);
          } catch (uploadError) {
            console.error("Error uploading files to S3:", uploadError);
            throw uploadError;
          }
        }
      }

      const assetData = {
        ...req.body,
        userId: req.user.userId,
        documents: documentUrls.length > 0 ? documentUrls : req.body.documents,
      };

      const asset = await assetService.createAsset(assetData);
      sendSuccess(res, "Asset created successfully", { asset }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAssets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string | undefined;

      const result = await assetService.getUserAssets(req.user.userId, page, limit, category);
      sendSuccess(res, "Assets retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async getAssetById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      const asset = await assetService.getAssetById(id, req.user.userId);
      sendSuccess(res, "Asset retrieved successfully", { asset });
    } catch (error) {
      next(error);
    }
  }

  async updateAsset(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;

      // Get current asset to compare documents
      const currentAsset = await assetService.getAssetById(id, req.user.userId);
      const currentDocuments = (currentAsset?.documents || []) as string[];
      
      // Use updated name/category if provided, otherwise use current values
      const category = req.body.category || currentAsset?.category || 'other';
      const assetName = req.body.name || currentAsset?.name || 'asset';

      // Handle file uploads if present
      let documentUrls: string[] = [];
      if (req.files && typeof req.files === "object" && "files" in req.files) {
        const files = req.files.files as Express.Multer.File[];
        if (Array.isArray(files) && files.length > 0) {
          console.log(`Uploading ${files.length} file(s) to S3`);
          try {
            const existingDocCount = currentDocuments.length;
            
            const uploadPromises = files.map((file, index) => {
              console.log(`File ${index + 1}: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);
              return uploadFileToS3(file, {
                type: 'assets',
                category,
                name: assetName,
                fileIndex: existingDocCount + index,
              });
            });
            const results = await Promise.all(uploadPromises);
            documentUrls = results.map((result) => result.url);
            console.log(`Successfully uploaded ${documentUrls.length} file(s) to S3`);
          } catch (uploadError) {
            console.error("Error uploading files to S3:", uploadError);
            throw uploadError;
          }
        }
      }

      // Determine which documents to keep (from req.body.documents)
      // Handle both string[] and object[] formats from frontend
      const documentsToKeepRaw = req.body.documents || [];
      const documentsToKeep = Array.isArray(documentsToKeepRaw)
        ? documentsToKeepRaw.map((doc: string | { url?: string }) => 
            typeof doc === 'string' ? doc : (doc.url || '')
          ).filter((url: string) => url)
        : [];
      
      // Find documents that were deleted (in current but not in documentsToKeep)
      const deletedDocuments = currentDocuments.filter(
        (doc) => !documentsToKeep.includes(doc)
      );

      // Delete removed documents from S3
      if (deletedDocuments.length > 0) {
        console.log(`Deleting ${deletedDocuments.length} document(s) from S3`);
        try {
          await deleteFilesFromS3ByUrls(deletedDocuments);
          console.log(`Successfully deleted ${deletedDocuments.length} document(s) from S3`);
        } catch (deleteError) {
          console.error("Error deleting files from S3:", deleteError);
          // Don't throw - continue with update even if delete fails
        }
      }

      // Merge new document URLs with existing ones
      const allDocuments = Array.isArray(documentsToKeep) 
        ? [...documentsToKeep, ...documentUrls]
        : documentUrls;

      const assetData = {
        ...req.body,
        documents: allDocuments.length > 0 ? allDocuments : undefined,
      };

      const asset = await assetService.updateAsset(id, req.user.userId, assetData);
      sendSuccess(res, "Asset updated successfully", { asset });
    } catch (error) {
      next(error);
    }
  }

  async deleteAsset(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      
      // Get asset to delete its documents from S3
      const asset = await assetService.getAssetById(id, req.user.userId);
      if (asset && asset.documents && Array.isArray(asset.documents)) {
        const documents = asset.documents as string[];
        if (documents.length > 0) {
          console.log(`Deleting ${documents.length} document(s) from S3 for asset ${id}`);
          try {
            await deleteFilesFromS3ByUrls(documents);
            console.log(`Successfully deleted ${documents.length} document(s) from S3`);
          } catch (deleteError) {
            console.error("Error deleting files from S3:", deleteError);
            // Continue with asset deletion even if document deletion fails
          }
        }
      }
      
      await assetService.deleteAsset(id, req.user.userId);
      sendSuccess(res, "Asset deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const { assetId, documentUrl } = req.body;
      
      if (!assetId || !documentUrl) {
        throw new Error("Asset ID and document URL are required");
      }

      // Verify asset belongs to user
      const asset = await assetService.getAssetById(assetId, req.user.userId);
      if (!asset) {
        throw new Error("Asset not found");
      }

      // Delete from S3
      await deleteFilesFromS3ByUrls([documentUrl]);

      // Remove from asset documents
      const updatedDocuments = ((asset.documents || []) as string[]).filter(
        (doc) => doc !== documentUrl
      );

      await assetService.updateAsset(assetId, req.user.userId, {
        documents: updatedDocuments,
      });

      sendSuccess(res, "Document deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAssetSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const [totalValue, byCategory] = await Promise.all([
        assetService.getTotalValue(req.user.userId),
        assetService.getAssetsByCategory(req.user.userId),
      ]);

      sendSuccess(res, "Asset summary retrieved successfully", {
        totalValue,
        byCategory,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AssetController();

