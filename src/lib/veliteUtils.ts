import fs from "fs/promises";
import path from "node:path";
import sharp from "sharp";
import ExifReader from "exifreader";
import { staticBasePath } from "@/base-path";

export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((file) => file.isFile())
      .map((file) => path.join(dirPath, file.name));
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
}

type _Post = { tags: string[]; [key: string]: any };

type _Tag = { slug: string; name: string };

export function mergePostsTags(objects: _Post[]): string[] {
  const tagsArrays = objects.map((obj) => obj.tags);
  return mergeTags(...tagsArrays);
}

// 定义一个泛型函数，可以处理 string[][] 和 Tag[][]
export function mergeTags<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];

  const firstElement = arrays[0][0];

  // 检查是否为 Tag 类型
  if (
    !!firstElement &&
    typeof firstElement === "object" &&
    "slug" in firstElement
  ) {
    const tagMap = new Map<string, T>();
    arrays.forEach((tags) => {
      tags.forEach((tag) => {
        const tagObj = tag as unknown as _Tag;
        if (!tagMap.has(tagObj.slug)) {
          tagMap.set(tagObj.slug, tag);
        }
      });
    });
    return Array.from(tagMap.values());
  } else {
    // 处理 string 类型
    const tagSet = new Set<string>();
    arrays.forEach((tags) => {
      tags.forEach((tag) => {
        tagSet.add(tag as unknown as string);
      });
    });
    return Array.from(tagSet) as T[];
  }
}

// Supported image formats
const supportedFormats = ["jpg", "jpeg", "png", "avif", "webp", "heif"];

// Function to get all image files in the directory
const getImageFiles = async (dir: string): Promise<string[]> => {
  const files = await fs.readdir(dir);
  return files.filter((file) =>
    supportedFormats.includes(path.extname(file).toLowerCase().slice(1))
  );
};

// Function to check if a file exists
const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
const blurWidth = 20;

// Function to generate blurDataUrl
const generateBlurDataUrl = async (
  sharpedImage: sharp.Sharp
): Promise<string> => {
  const buffer = await sharpedImage
    .clone()
    .resize(blurWidth) // Resize to a small size
    .blur() // Apply blur
    .toBuffer();

  return `data:image/webp;base64,${buffer.toString("base64")}`;
};

export type RdPhoto = {
  filename: string;
  src: string;
  slug: string; // this is required
  featured: boolean;
  width: number;
  height: number;
  blurDataURL: string;
  blurWidth: number;
  blurHeight: number;
  exif: ExifReader.ExpandedTags;
};

// Function to rotate the image based on EXIF orientation
async function rotateImageBasedOnExif(
  image: sharp.Sharp,
  exifData: ExifReader.ExpandedTags,
  metadata: sharp.Metadata
): Promise<sharp.Sharp> {
  if (exifData && exifData.exif && exifData.exif.Orientation) {
    let width = metadata.width;
    let height = metadata.height;

    switch (exifData.exif.Orientation.value) {
      case 1: // No rotation needed
        return image;
      case 2: // Horizontal flip
        return image.flip();
      case 3: // 180 degree rotation
        return image.rotate(180);
      case 5: // Horizontal flip and 270 degree rotation
        metadata.width = height;
        metadata.height = width;
        return image.flip().rotate(270);
      case 6: // 90 degree rotation
        metadata.width = height;
        metadata.height = width;
        return image.rotate(90);
      case 7: // Horizontal flip and 90 degree rotation
        metadata.width = height;
        metadata.height = width;
        return image.flip().rotate(90);
      case 8: // 270 degree rotation
        metadata.width = height;
        metadata.height = width;
        return image.rotate(270);
      default:
        return image;
    }
  }
  return image;
}

export const convertToWebP = async (
  inputPath: string,
  outputPath: string,
  file: string
) => {
  const filePath = path.join(inputPath, file);

  const outputFilePath = path.join(
    outputPath,
    `${path.basename(file, path.extname(file))}.webp`
  );

  let fileBuffer: Buffer;
  try {
    // Read EXIF data
    fileBuffer = await fs.readFile(filePath);
  } catch (e) {
    console.log(`Error reading file ${filePath}:`, e);
    // get the extension of the file
    const ext = path.extname(file);
    // change ext to uppercase
    const newExt = ext.toUpperCase();
    // get the new file name
    const newFileName = path.basename(file, ext) + newExt;
    // get the new file path
    const newFilePath = path.join(inputPath, newFileName);
    // read the new file
    fileBuffer = await fs.readFile(newFilePath);
  }
  let sharpedImage = sharp(fileBuffer);
  let exifData: ExifReader.ExpandedTags = {};
  const metadata = await sharpedImage.metadata();
  // check file extension, if it is svg, skip; if it is not svg, read EXIF
  if (path.extname(file) !== ".svg") {
    try {
      exifData = await ExifReader.load(fileBuffer, {
        async: true,
        expanded: true,
      });
      // Rotate image based on EXIF orientation
      sharpedImage = await rotateImageBasedOnExif(
        sharpedImage,
        exifData,
        metadata
      );
    } catch (e) {
      console.log(`Error reading EXIF data for ${filePath}:`, e);
    }
  }

  const src = `/${path.posix.format(path.parse(path.relative(staticBasePath, outputFilePath)))}`;

  // Check if the output file already exists
  if (!(await fileExists(outputFilePath))) {
    // Convert image to WebP
    const { width, height } = metadata;
    let resizeOptions = {};
    // Maximum edge size
    const maxEdge = 3840;
    if (width! > height!) {
      resizeOptions = { width: maxEdge };
    } else {
      resizeOptions = { height: maxEdge };
    }
    await sharpedImage
      .resize(resizeOptions)
      .webp({ quality: 80 })
      .toFile(outputFilePath);
    console.log(`Converted and saved: ${file} -> ${outputFilePath}`);
  }
  // console.log(`Processed image: ${filePath}`);
  const blurDataURL = await generateBlurDataUrl(sharpedImage);

  return {
    filename: file,
    src: src,
    slug: src,
    featured: false,
    width: metadata.width!,
    height: metadata.height!,
    blurWidth: blurWidth,
    blurHeight: Math.round((blurWidth / metadata.width!) * metadata.height!),
    exif: exifData,
    blurDataURL,
  };
};

// Function to convert images to WebP and read EXIF data
export const convertImagesToWebP = async (
  inputPath: string,
  outputPath: string
) => {
  console.log("inputPath", inputPath);
  console.log("outputPath", outputPath);
  const imageFiles = await getImageFiles(inputPath);
  const images: RdPhoto[] = [];

  // Ensure the output directory exists
  await fs.mkdir(outputPath, { recursive: true });

  for (const file of imageFiles) {
    try {
      const image = await convertToWebP(inputPath, outputPath, file);
      images.push(image);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  return images;
};

export const setFeaturedImages = (
  featuredSlugs: string[],
  images: RdPhoto[]
): RdPhoto[] => {
  return images.map((image) => ({
    ...image,
    featured: featuredSlugs.includes(image.filename.split(".")[0]),
  }));
};
