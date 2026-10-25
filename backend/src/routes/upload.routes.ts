import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { ApiError } from "../middleware/errorHandler.js";

const router = Router();

/**
 * Cloudinary Upload Endpoint
 * --------------------------
 * Uploads user profile photo to Cloudinary CDN using unsigned upload preset or API keys.
 * If Cloudinary keys are omitted, returns image data safely without failing.
 */
router.post("/image", requireAuth, async (req, res) => {
  const { image } = req.body as { image?: string };
  if (!image) throw new ApiError(400, "Image payload is required.");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset && cloudName.trim() !== "your_cloud_name") {
    try {
      const formData = new URLSearchParams();
      formData.append("file", image);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = (await response.json()) as { secure_url?: string };
        if (data.secure_url) {
          console.log(`✅ Uploaded photo to Cloudinary CDN: ${data.secure_url}`);
          return res.json({ url: data.secure_url, provider: "cloudinary" });
        }
      } else {
        const errText = await response.text();
        console.warn("Cloudinary upload API returned error:", errText);
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back:", err);
    }
  }

  // Fallback: return image payload or data URL directly
  return res.json({ url: image, provider: "local_base64" });
});

export default router;
