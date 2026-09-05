const CLOUD_NAME = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim();
const UPLOAD_PRESET = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "").trim();

export function cloudinaryUrl(url: string, width?: number): string {
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto`;
  const w = width ? `,w_${width}` : "";
  return `${base}${w}/${encodeURIComponent(url)}`;
}

export async function uploadImageToCloudinary(file: File, folder = "misk-lume/products"): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary upload is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and " +
        "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your hosting environment, then rebuild and redeploy."
    );
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  let data: { secure_url?: string; error?: { message?: string } } = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — fall through to the generic error below
  }

  if (!res.ok) {
    const detail = data.error?.message ? `: ${data.error.message}` : ` (HTTP ${res.status})`;
    throw new Error(`Image upload failed${detail}`);
  }
  if (!data.secure_url) {
    throw new Error("Image upload failed: Cloudinary did not return a secure URL");
  }
  return data.secure_url;
}
