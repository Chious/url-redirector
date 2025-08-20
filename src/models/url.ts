import { Url as PrismaUrl } from "../../generated/prisma_client";
import prisma from "../utils/prisma";

export interface CreateUrlData {
  originalUrl: string;
  shortCode: string;
}

export interface UrlWithId extends PrismaUrl {
  id: string;
}

export class UrlModel {
  /**
   * Create a new URL mapping
   */
  static async create(data: CreateUrlData): Promise<UrlWithId> {
    const url = await prisma.url.create({
      data: {
        originalUrl: data.originalUrl,
        shortCode: data.shortCode,
      },
    });
    return url;
  }

  /**
   * Find a URL by original URL
   */
  static async findByOriginalUrl(
    originalUrl: string
  ): Promise<UrlWithId | null> {
    const url = await prisma.url.findUnique({
      where: {
        originalUrl,
      },
    });
    return url;
  }

  /**
   * Find a URL by short code
   */
  static async findByShortCode(shortCode: string): Promise<UrlWithId | null> {
    const url = await prisma.url.findUnique({
      where: {
        shortCode,
      },
    });
    return url;
  }

  /**
   * Check if a short code exists
   */
  static async existsByShortCode(shortCode: string): Promise<boolean> {
    const count = await prisma.url.count({
      where: {
        shortCode,
      },
    });
    return count > 0;
  }

  /**
   * Get all URLs (for admin purposes)
   */
  static async findAll(): Promise<UrlWithId[]> {
    const urls = await prisma.url.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return urls;
  }

  /**
   * Get URL count
   */
  static async count(): Promise<number> {
    return await prisma.url.count();
  }

  /**
   * Update a URL's updatedAt field
   */
  static async touch(id: string): Promise<UrlWithId> {
    const url = await prisma.url.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    });
    return url;
  }

  /**
   * Delete a URL by ID
   */
  static async deleteById(id: string): Promise<void> {
    await prisma.url.delete({
      where: { id },
    });
  }

  /**
   * Delete a URL by short code
   */
  static async deleteByShortCode(shortCode: string): Promise<void> {
    await prisma.url.delete({
      where: { shortCode },
    });
  }
}

export default UrlModel;
