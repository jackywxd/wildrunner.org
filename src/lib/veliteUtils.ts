import fs from "fs/promises";
import path from "node:path";
import sharp from "sharp";
import ExifReader from "exifreader";
import heicConvert from "heic-convert";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  NotFound,
  HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";

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

// 添加 R2 客户端配置
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

async function getExistingImageMetadata(key: string): Promise<RdPhoto | null> {
  try {
    const headResult = (await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      })
    )) as HeadObjectCommandOutput;

    // 使用 metadata（小写）
    const metadata = headResult.Metadata;
    if (metadata) {
      return {
        filename: path.basename(key),
        src: `${process.env.R2_PUBLIC_URL}/${key}`,
        slug: `${process.env.R2_PUBLIC_URL}/${key}`,
        featured: metadata.featured === "true",
        width: parseInt(metadata.width || "0"),
        height: parseInt(metadata.height || "0"),
        blurWidth: parseInt(metadata.blurwidth || "0"),
        blurHeight: parseInt(metadata.blurheight || "0"),
        exif: JSON.parse(metadata.exif || "{}"),
        blurDataURL: metadata.blurdataurl || "",
      };
    }
    return null;
  } catch (error) {
    if (error instanceof NotFound) {
      return null;
    }
    throw error;
  }
}

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
const supportedFormats = ["jpg", "jpeg", "png", "avif", "webp", "heic"];

// Function to get all image files in the directory
const getImageFiles = async (dir: string): Promise<string[]> => {
  const files = await fs.readdir(dir);
  return files.filter((file) =>
    supportedFormats.includes(path.extname(file).toLowerCase().slice(1))
  );
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
    .webp({ quality: 50 })
    .toBuffer();

  return `data:image/webp;base64,${buffer.toString("base64")}`;
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
  slug: string,
  file: string
) => {
  const filePath = path.join(inputPath, file);

  const outputFileName = `${path.basename(file, path.extname(file))}.webp`;
  const key = `${slug}/${outputFileName}`;

  // 检查文件是否存在并获取元数据
  const existingMetadata = await getExistingImageMetadata(key);
  if (existingMetadata) {
    console.log(`File ${outputFileName} already exists in R2, skipping...`);
    return existingMetadata;
  }
  let fileBuffer: Buffer;
  try {
    // 读取文件
    fileBuffer = await fs.readFile(filePath);

    // 如果是HEIC格式，先转换为JPEG
    if (path.extname(file).toLowerCase() === ".heic") {
      fileBuffer = await convertHeicToJpeg(fileBuffer);
    }
  } catch (e) {
    console.log(`读取文件 ${filePath} 时出错:`, e);
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
  const metadata = await sharpedImage.metadata();
  let exifData = {};
  // check file extension, if it is svg, skip; if it is not svg, read EXIF
  if (path.extname(file) !== ".svg") {
    try {
      const exif = await ExifReader.load(fileBuffer, {
        async: true,
        expanded: true,
      });
      // 先进行图片旋转
      sharpedImage = await rotateImageBasedOnExif(sharpedImage, exif, metadata);

      // 添加宽度和高度到 exifData
      exifData = {
        exif: exif?.exif
          ? {
              Make: { description: exif.exif.Make?.description },
              Model: { description: exif.exif.Model?.description },
              DateTimeOriginal: {
                description: exif.exif.DateTimeOriginal?.description,
              },
              ExposureTime: {
                description: exif.exif.ExposureTime?.description,
              },
              FNumber: { description: exif.exif.FNumber?.description },
              ISOSpeedRatings: {
                description: exif.exif.ISOSpeedRatings?.description,
              },
              FocalLength: { description: exif.exif.FocalLength?.description },
            }
          : {},
      };
    } catch (e) {
      console.log(`Error reading EXIF data for ${filePath}:`, e);
    }
  }

  // Check if the output file already exists
  // Convert image to WebP
  const { width, height } = metadata;
  let resizeOptions = {};
  // Maximum edge size
  const maxEdge = 3840;
  if (width && height && width > height) {
    resizeOptions = { width: maxEdge };
  } else {
    resizeOptions = { height: maxEdge };
  }
  // 转换为 WebP 并获取 buffer
  const webpBuffer = await sharpedImage
    .resize(resizeOptions)
    .webp({ quality: 80 })
    .toBuffer();
  // 上传到 R2 时包含元数据
  // console.log(`Processed image: ${filePath}`);
  const blurDataURL = await generateBlurDataUrl(sharpedImage);
  const src = `${process.env.R2_PUBLIC_URL}/${key}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: webpBuffer,
      ContentType: "image/webp",
      Metadata: {
        width: metadata.width!.toString(),
        height: metadata.height!.toString(),
        blurWidth: blurWidth.toString(),
        blurHeight: Math.round(
          (blurWidth / metadata.width!) * metadata.height!
        ).toString(),
        exif: JSON.stringify(exifData),
        blurDataURL: blurDataURL,
      },
    })
  );
  console.log(`Uploaded to R2: ${file} -> ${src}`);

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
  // await fs.mkdir(outputPath, { recursive: true });

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

export async function convertHeicToJpeg(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const jpegBuffer = await heicConvert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 90,
    });
    return Buffer.from(jpegBuffer);
  } catch (error) {
    console.error("转换HEIC到JPEG时出错:", error);
    throw error;
  }
}
