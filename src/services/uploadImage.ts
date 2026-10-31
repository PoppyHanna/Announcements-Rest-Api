import { unlink } from "node:fs/promises";
import cloudinary from "../cloudinary.ts";
import logger from "../logger.ts";

export const uploadImage = async (
  filePath: string,
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "announcements",
      resource_type: "image",
    });

    logger.info(
      { publicId: result.public_id },
      "Photo uploaded successfully",
    );

    return result.secure_url;
  } finally {
    try {
      await unlink(filePath);
    } catch (error) {
      logger.error(
        { err: error, filePath },
        "Failed to delete temporary image",
      );
    }
  }
};
