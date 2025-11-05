import formidable from 'formidable';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create server-side Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Parse the uploaded file
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.document) ? files.document[0] : files.document;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file extension
    const fileExtension = path.extname(uploadedFile.originalFilename).toLowerCase();
    if (!['.doc', '.docx'].includes(fileExtension)) {
      return res.status(400).json({ error: 'Only .doc and .docx files are supported' });
    }

    // Extract filename without extension for title
    const filenameTitle = path.basename(uploadedFile.originalFilename, fileExtension);

    let extractedContent = '';
    let extractedTitle = filenameTitle;

    try {
      // Read and convert document to HTML
      const buffer = fs.readFileSync(uploadedFile.filepath);
      const result = await mammoth.convertToHtml({ buffer });
      extractedContent = result.value;

      // Try to extract title from content (first heading or first line)
      const titleMatch = extractedContent.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
      if (titleMatch) {
        // Use heading as title if found
        extractedTitle = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        
        // Remove the heading from content since we're using it as title
        extractedContent = extractedContent.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/i, '').trim();
      } else {
        // Try to get first paragraph as title if no heading found
        const paragraphMatch = extractedContent.match(/<p[^>]*>(.*?)<\/p>/i);
        if (paragraphMatch) {
          const firstParagraph = paragraphMatch[1].replace(/<[^>]*>/g, '').trim();
          if (firstParagraph.length > 0 && firstParagraph.length <= 100) {
            extractedTitle = firstParagraph;
            
            // Remove the first paragraph from content since we're using it as title
            extractedContent = extractedContent.replace(/<p[^>]*>.*?<\/p>/i, '').trim();
          }
        }
      }

      // Clean up title
      extractedTitle = extractedTitle || filenameTitle;
      
      // Additional cleanup: Remove duplicate title from beginning of content
      // This handles cases where the title appears as plain text at the start
      if (extractedTitle && extractedContent) {
        // Create a regex to match the title at the beginning of content (case insensitive)
        const titleRegex = new RegExp(`^\\s*(<p[^>]*>)?\\s*${extractedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(<\/p>)?\\s*`, 'i');
        extractedContent = extractedContent.replace(titleRegex, '').trim();
        
        // Also check for title in the first paragraph specifically
        const firstParagraphMatch = extractedContent.match(/^<p[^>]*>(.*?)<\/p>/i);
        if (firstParagraphMatch) {
          const firstParagraphText = firstParagraphMatch[1].replace(/<[^>]*>/g, '').trim();
          // If first paragraph is exactly the title or very similar, remove it
          if (firstParagraphText.toLowerCase() === extractedTitle.toLowerCase() || 
              firstParagraphText.toLowerCase().includes(extractedTitle.toLowerCase()) ||
              extractedTitle.toLowerCase().includes(firstParagraphText.toLowerCase())) {
            extractedContent = extractedContent.replace(/^<p[^>]*>.*?<\/p>/i, '').trim();
          }
        }
      }
      
    } catch (conversionError) {
      console.error('Error converting document:', conversionError);
      return res.status(500).json({ error: 'Failed to process document content' });
    }

    // Find a user with 'editor' role for default author
    let defaultAuthor = null;
    try {
      const { data: editors, error: editorError } = await supabase
        .from('hr_users')
        .select('id, name, username')
        .eq('role', 'editor')
        .limit(1);

      if (!editorError && editors && editors.length > 0) {
        defaultAuthor = editors[0];
      }
    } catch (authorError) {
      console.log('Could not fetch editor user:', authorError);
    }

    // Clean up temporary file
    try {
      fs.unlinkSync(uploadedFile.filepath);
    } catch (cleanupError) {
      console.log('Could not clean up temp file:', cleanupError);
    }

    // Generate slug from title
    const slug = extractedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Return extracted data
    res.status(200).json({
      success: true,
      data: {
        title: extractedTitle,
        content: extractedContent,
        filename: uploadedFile.originalFilename,
        slug: slug,
        defaultAuthor: defaultAuthor ? {
          id: defaultAuthor.id,
          name: defaultAuthor.name || defaultAuthor.username
        } : null
      }
    });

  } catch (error) {
    console.error('Error processing document upload:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process document upload' 
    });
  }
}