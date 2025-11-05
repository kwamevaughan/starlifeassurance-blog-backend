import { supabaseServer } from "@/lib/supabase";
import ImageKit from "imagekit";
import formidable from "formidable";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication
    const supabase = supabaseServer(req, res);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Read file
    const fileBuffer = await fs.readFile(file.filepath);
    
    // Upload to ImageKit
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: file.originalFilename || `blog-image-${Date.now()}`,
      folder: "/blog-images/",
    });

    res.status(200).json({
      success: true,
      data: {
        fileId: result.fileId,
        name: result.name,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Upload failed",
      details: error.message 
    });
  }
}