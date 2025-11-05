import { supabaseServer } from "@/lib/supabase";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication
    const supabase = supabaseServer(req, res);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { limit = 20, skip = 0 } = req.query;

    // List files from ImageKit
    const result = await imagekit.listFiles({
      limit: parseInt(limit),
      skip: parseInt(skip),
      path: "/blog-images/",
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("ImageKit list error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to list files",
      details: error.message 
    });
  }
}