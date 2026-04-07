// @/lib/stringUtils.ts

/**
 * Fixes common encoding issues (e.g., "Ã±" becoming "ñ").
 * This forces the browser to re-interpret scrambled characters back into a proper UTF-8 string.
 */
export const fixEncoding = (str: string): string => {
    if (!str) return ""; // Guard clause for empty strings
    
    try {
        return decodeURIComponent(escape(str));
    } catch (e) {
        // If it's already correct or fails to escape, return the original string
        return str;
    }
};