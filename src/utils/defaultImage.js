/**
 * Utility functions for handling default blog images
 */

// Default blog image path
export const DEFAULT_BLOG_IMAGE = '/assets/images/default-blog-image.jpg';

/**
 * Get the featured image URL, falling back to default if none provided
 * @param {string} imageUrl - The provided image URL
 * @returns {string} - The image URL to use (provided or default)
 */
export function getFeaturedImageUrl(imageUrl) {
  // Check if we have a valid image URL
  if (imageUrl && imageUrl.trim() && imageUrl !== '') {
    return imageUrl.trim();
  }
  
  // Return default image if no image provided
  return DEFAULT_BLOG_IMAGE;
}

/**
 * Check if an image URL is the default image
 * @param {string} imageUrl - The image URL to check
 * @returns {boolean} - True if it's the default image
 */
export function isDefaultImage(imageUrl) {
  return imageUrl === DEFAULT_BLOG_IMAGE;
}

/**
 * Get absolute URL for default image (useful for API responses)
 * @param {string} baseUrl - The base URL of the site (optional)
 * @returns {string} - Absolute URL to default image
 */
export function getDefaultImageAbsoluteUrl(baseUrl = '') {
  if (baseUrl && !baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  return `${baseUrl}${DEFAULT_BLOG_IMAGE.startsWith('/') ? DEFAULT_BLOG_IMAGE.slice(1) : DEFAULT_BLOG_IMAGE}`;
}