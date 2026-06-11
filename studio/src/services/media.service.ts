import { storage } from "@/lib/firebase/firebase";
import {
  ref, listAll, getDownloadURL, deleteObject, uploadBytes,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export interface MediaItem {
  name: string;
  fullPath: string;
  url: string;
  contentType: string;
  size: number;
  createdAt?: Date;
}

async function getMetadata(path: string): Promise<{ contentType: string; size: number; createdAt?: Date }> {
  try {
    const { getMetadata } = await import("firebase/storage");
    const meta = await getMetadata(ref(storage, path));
    return {
      contentType: meta.contentType || "application/octet-stream",
      size: meta.size || 0,
      createdAt: meta.timeCreated ? new Date(meta.timeCreated) : undefined,
    };
  } catch {
    return { contentType: "application/octet-stream", size: 0 };
  }
}

export async function listMedia(prefix = "media/"): Promise<MediaItem[]> {
  const storageRef = ref(storage, prefix);
  const result = await listAll(storageRef);

  const items = await Promise.all(
    result.items.map(async (item) => {
      const meta = await getMetadata(item.fullPath);
      const url = await getDownloadURL(item);
      return {
        name: item.name,
        fullPath: item.fullPath,
        url,
        contentType: meta.contentType,
        size: meta.size,
        createdAt: meta.createdAt,
      };
    }),
  );

  items.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  return items;
}

export async function deleteMedia(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}

export async function uploadMedia(file: File): Promise<MediaItem> {
  const ext = file.name.split(".").pop() || "bin";
  const filename = `media/${uuidv4()}.${ext}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: { originalName: file.name },
  });
  const url = await getDownloadURL(storageRef);
  return {
    name: file.name,
    fullPath: filename,
    url,
    contentType: file.type,
    size: file.size,
    createdAt: new Date(),
  };
}
