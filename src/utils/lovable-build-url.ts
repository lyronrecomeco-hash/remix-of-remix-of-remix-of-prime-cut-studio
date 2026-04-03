/**
 * Generates a Lovable "Build with URL" link that auto-submits the prompt.
 * @see https://docs.lovable.dev/integrations/build-with-url
 */
export function buildLovableUrl(prompt: string): string {
  const encodedPrompt = encodeURIComponent(prompt.trim());
  return `https://lovable.dev/?autosubmit=true#prompt=${encodedPrompt}`;
}

/**
 * Generates a Lovable "Build with URL" link with optional image references.
 * Images are passed as comma-separated URLs.
 */
export function buildLovableUrlWithImages(prompt: string, imageUrls: string[]): string {
  const encodedPrompt = encodeURIComponent(prompt.trim());
  const base = `https://lovable.dev/?autosubmit=true`;
  const imagesParam = imageUrls.length > 0 
    ? `&images=${encodeURIComponent(imageUrls.join(','))}` 
    : '';
  return `${base}${imagesParam}#prompt=${encodedPrompt}`;
}
