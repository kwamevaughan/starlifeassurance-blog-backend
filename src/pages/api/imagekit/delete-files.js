import { supabaseServer } from "@/lib/supabase";
import ImageKit from "imagekit";

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

    const { fileIds } = req.body;

    if (!fileIds || !Array.isArray(fileIds)) {
      return res.status(400).json({ error: "Invalid fileIds provided" });
    }

    // Delete files from ImageKit
    const deletePromises = fileIds.map(fileId => 
      imagekit.deleteFile(fileId)
    );

    await Promise.all(deletePromises);

    res.status(200).json({
      success: true,
      message: `${fileIds.length} file(s) deleted successfully`,
    });
  } catch (error) {
    console.error("ImageKit delete error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Delete failed",
      details: error.message 
    });
  }
}