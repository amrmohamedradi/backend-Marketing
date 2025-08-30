import { nanoid } from 'nanoid';
import slugify from 'slugify';

/**
 * Generates a unique slug for a spec
 * @param title Optional title to include in the slug
 * @returns A unique slug string
 */
export const generateSlug = (title?: string): string => {
  const uniqueId = nanoid(7); // Generate a 7-character unique ID
  
  if (!title) {
    return uniqueId;
  }
  
  // Create a slug from the title and append the unique ID
  const titleSlug = slugify(title, {
    lower: true,      // Convert to lowercase
    strict: true,     // Strip special characters
    trim: true        // Trim leading/trailing spaces
  });
  
  // Combine the title slug with the unique ID
  return `${titleSlug}-${uniqueId}`;
};