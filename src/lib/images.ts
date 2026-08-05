const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export function cloudinaryUrl(url: string, width?: number): string {
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto`;
  const w = width ? `,w_${width}` : "";
  return `${base}${w}/${encodeURIComponent(url)}`;
}

export async function uploadImageToCloudinary(file: File, folder = "misk-lume/products"): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary upload is not configured");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  if (!data.secure_url) throw new Error("Image upload failed");
  return data.secure_url;
}
