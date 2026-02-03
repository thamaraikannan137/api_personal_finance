import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import env from "../config/env.js";
import { BadRequestError } from "../utils/errors.js";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Sanitize filename for S3 (remove special characters, spaces, etc.)
 */
const sanitizeFileName = (name: string): string => {
  return name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase()
    .substring(0, 100); // Limit length
};

/**
 * Upload a file to S3 with structured naming: type/category/filename-XX.ext
 */
export const uploadFileToS3 = async (
  file: Express.Multer.File,
  options: {
    type: 'assets' | 'liabilities';
    category: string;
    name: string;
    fileIndex: number; // 0-based index for multiple files
  }
): Promise<UploadResult> => {
  try {
    // Validate file buffer exists
    if (!file.buffer) {
      throw new Error("File buffer is missing");
    }

    // Sanitize category and name
    const sanitizedCategory = sanitizeFileName(options.category || 'other');
    const sanitizedName = sanitizeFileName(options.name || 'file');
    
    // Get file extension
    const fileExtension = file.originalname.split(".").pop() || "bin";
    
    // Build filename: name.ext for first file, name-01.ext, name-02.ext, etc. for multiple files
    const fileNumber = options.fileIndex > 0 ? `-${String(options.fileIndex + 1).padStart(2, '0')}` : '';
    const fileName = `${options.type}/${sanitizedCategory}/${sanitizedName}${fileNumber}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype || "application/octet-stream",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate public URL
    const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;

    return {
      url,
      key: fileName,
    };
  } catch (error) {
    console.error("S3 upload error details:", error);
    
    // Provide more detailed error message
    let errorMessage = "Failed to upload file to S3";
    if (error instanceof Error) {
      errorMessage = `S3 upload failed: ${error.message}`;
    } else if (typeof error === "object" && error !== null) {
      const awsError = error as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
      if (awsError.name) {
        errorMessage = `S3 upload failed: ${awsError.name} - ${awsError.message || "Unknown error"}`;
      }
      if (awsError.$metadata?.httpStatusCode) {
        errorMessage += ` (HTTP ${awsError.$metadata.httpStatusCode})`;
      }
    }
    
    throw new BadRequestError(errorMessage);
  }
};

/**
 * Extract S3 key from a public S3 URL
 */
export const extractS3KeyFromUrl = (url: string): string | null => {
  try {
    // Format: https://bucket-name.s3.region.amazonaws.com/key/path
    const urlPattern = new RegExp(
      `https://${env.AWS_S3_BUCKET}\\.s3\\.${env.AWS_REGION}\\.amazonaws\\.com/(.+)`
    );
    const match = url.match(urlPattern);
    return match && match[1] ? match[1] : null;
  } catch (error) {
    console.error("Error extracting S3 key from URL:", error);
    return null;
  }
};

/**
 * Delete a file from S3
 */
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  try {
    const deleteParams = {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error("S3 delete error:", error);
    
    // Provide more detailed error message
    let errorMessage = "Failed to delete file from S3";
    if (error instanceof Error) {
      errorMessage = `S3 delete failed: ${error.message}`;
    } else if (typeof error === "object" && error !== null) {
      const awsError = error as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
      if (awsError.name) {
        errorMessage = `S3 delete failed: ${awsError.name} - ${awsError.message || "Unknown error"}`;
      }
      if (awsError.$metadata?.httpStatusCode) {
        errorMessage += ` (HTTP ${awsError.$metadata.httpStatusCode})`;
      }
    }
    
    throw new BadRequestError(errorMessage);
  }
};

/**
 * Delete multiple files from S3 by their URLs
 */
export const deleteFilesFromS3ByUrls = async (urls: string[]): Promise<void> => {
  try {
    const deletePromises = urls.map(async (url) => {
      const key = extractS3KeyFromUrl(url);
      if (key) {
        return deleteFileFromS3(key);
      } else {
        console.warn(`Could not extract S3 key from URL: ${url}`);
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting files from S3:", error);
    throw error;
  }
};
