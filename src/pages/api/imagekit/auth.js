import { supabaseServer } from "@/lib/supabase";
import { createHmac } from "crypto";
import { v4 as uuidv4 } from "uuid";

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

    // ImageKit authentication
    const token = uuidv4();
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes
    
    const privateAPIKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateAPIKey) {
      return res.status(500).json({ error: "ImageKit configuration missing" });
    }

    const signature = createHmac("sha1", privateAPIKey)
      .update(token + expire)
      .digest("hex");

    res.status(200).json({
      token,
      expire,
      signature,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}