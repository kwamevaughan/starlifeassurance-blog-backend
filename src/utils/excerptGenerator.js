/**
 * Utility functions for generating blog post excerpts
 */

/**
 * Generate an excerpt from HTML content
 * @param {string} htmlContent - The HTML content to extract excerpt from
 * @param {number} maxLength - Maximum length of excerpt (default: 200)
 * @returns {string} - Clean text excerpt
 */
export function generateExcerpt(htmlContent, maxLength = 200) {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  // Remove HTML tags
  const textContent = htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // If content is shorter than max length, return as is
  if (textContent.length <= maxLength) {
    return textContent;
  }

  // Find the last complete sentence within the limit
  const truncated = textContent.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );

  // If we found a sentence ending, use that
  if (lastSentenceEnd > maxLength * 0.6) { // At least 60% of desired length
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }

  // Otherwise, find the last complete word
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex).trim() + '...';
  }

  // Fallback: hard truncate with ellipsis
  return truncated.trim() + '...';
}

/**
 * Generate excerpt with smart content detection
 * Prioritizes first paragraph, then falls back to beginning of content
 * @param {string} htmlContent - The HTML content
 * @param {number} maxLength - Maximum length of excerpt
 * @returns {string} - Generated excerpt
 */
export function generateSmartExcerpt(htmlContent, maxLength = 200) {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  // Try to extract first paragraph
  const firstParagraphMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/i);
  if (firstParagraphMatch && firstParagraphMatch[1]) {
    const firstParagraph = firstParagraphMatch[1];
    const excerpt = generateExcerpt(firstParagraph, maxLength);
    if (excerpt.length > 50) { // If first paragraph gives us a decent excerpt
      return excerpt;
    }
  }

  // Fallback to regular excerpt generation
  return generateExcerpt(htmlContent, maxLength);
}

/**
 * Validate and clean excerpt
 * @param {string} excerpt - The excerpt to validate
 * @returns {string} - Cleaned excerpt
 */
export function validateExcerpt(excerpt) {
  if (!excerpt || typeof excerpt !== 'string') {
    return '';
  }

  return excerpt
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 500); // Hard limit to prevent database issues
}