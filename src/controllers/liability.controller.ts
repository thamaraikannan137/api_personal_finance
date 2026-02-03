import type { Response, NextFunction } from "express";
import liabilityService from "../services/liabilityService.js";
import { sendSuccess } from "../utils/response.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { uploadFileToS3, deleteFilesFromS3ByUrls } from "../services/s3Service.js";

class LiabilityController {
  async createLiability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      // Handle file uploads if present
      let documentUrls: string[] = [];
      if (req.files && typeof req.files === "object" && "files" in req.files) {
        const files = req.files.files as Express.Multer.File[];
        if (Array.isArray(files) && files.length > 0) {
          console.log(`Uploading ${files.length} file(s) to S3 for liability`);
          try {
            const category = req.body.category || 'other';
            const liabilityName = req.body.name || 'liability';
            
            const uploadPromises = files.map((file, index) => {
              console.log(`File ${index + 1}: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);
              return uploadFileToS3(file, {
                type: 'liabilities',
                category,
                name: liabilityName,
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

      const liabilityData = {
        ...req.body,
        userId: req.user.userId,
        documents: documentUrls.length > 0 ? documentUrls : req.body.documents,
      };

      const liability = await liabilityService.createLiability(liabilityData);
      sendSuccess(res, "Liability created successfully", { liability }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getLiabilities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string | undefined;

      const result = await liabilityService.getUserLiabilities(req.user.userId, page, limit, category);
      sendSuccess(res, "Liabilities retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async getLiabilityById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      const liability = await liabilityService.getLiabilityById(id, req.user.userId);
      sendSuccess(res, "Liability retrieved successfully", { liability });
    } catch (error) {
      next(error);
    }
  }

  async updateLiability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;

      // Get current liability to compare documents
      const currentLiability = await liabilityService.getLiabilityById(id, req.user.userId);
      const currentDocuments = (currentLiability?.documents || []) as string[];
      
      // Use updated name/category if provided, otherwise use current values
      const category = req.body.category || currentLiability?.category || 'other';
      const liabilityName = req.body.name || currentLiability?.name || 'liability';

      // Handle file uploads if present
      let documentUrls: string[] = [];
      if (req.files && typeof req.files === "object" && "files" in req.files) {
        const files = req.files.files as Express.Multer.File[];
        if (Array.isArray(files) && files.length > 0) {
          console.log(`Uploading ${files.length} file(s) to S3 for liability`);
          try {
            const existingDocCount = currentDocuments.length;
            
            const uploadPromises = files.map((file, index) => {
              console.log(`File ${index + 1}: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);
              return uploadFileToS3(file, {
                type: 'liabilities',
                category,
                name: liabilityName,
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

      const liabilityData = {
        ...req.body,
        documents: allDocuments.length > 0 ? allDocuments : undefined,
      };

      const liability = await liabilityService.updateLiability(id, req.user.userId, liabilityData);
      sendSuccess(res, "Liability updated successfully", { liability });
    } catch (error) {
      next(error);
    }
  }

  async deleteLiability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const id = req.params.id as string;
      
      // Get liability to delete its documents from S3
      const liability = await liabilityService.getLiabilityById(id, req.user.userId);
      if (liability && liability.documents && Array.isArray(liability.documents)) {
        const documents = liability.documents as string[];
        if (documents.length > 0) {
          console.log(`Deleting ${documents.length} document(s) from S3 for liability ${id}`);
          try {
            await deleteFilesFromS3ByUrls(documents);
            console.log(`Successfully deleted ${documents.length} document(s) from S3`);
          } catch (deleteError) {
            console.error("Error deleting files from S3:", deleteError);
            // Continue with liability deletion even if document deletion fails
          }
        }
      }
      
      await liabilityService.deleteLiability(id, req.user.userId);
      sendSuccess(res, "Liability deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const { liabilityId, documentUrl } = req.body;
      
      if (!liabilityId || !documentUrl) {
        throw new Error("Liability ID and document URL are required");
      }

      // Verify liability belongs to user
      const liability = await liabilityService.getLiabilityById(liabilityId, req.user.userId);
      if (!liability) {
        throw new Error("Liability not found");
      }

      // Delete from S3
      await deleteFilesFromS3ByUrls([documentUrl]);

      // Remove from liability documents
      const updatedDocuments = ((liability.documents || []) as string[]).filter(
        (doc) => doc !== documentUrl
      );

      await liabilityService.updateLiability(liabilityId, req.user.userId, {
        documents: updatedDocuments,
      });

      sendSuccess(res, "Document deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getLiabilitySummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const [totalBalance, byCategory] = await Promise.all([
        liabilityService.getTotalBalance(req.user.userId),
        liabilityService.getLiabilitiesByCategory(req.user.userId),
      ]);

      sendSuccess(res, "Liability summary retrieved successfully", {
        totalBalance,
        byCategory,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LiabilityController();

