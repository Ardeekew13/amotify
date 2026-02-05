/**
 * Receipt Utilities
 * Helper functions for managing receipt arrays with validation
 */

// Supported image formats
const SUPPORTED_IMAGE_FORMATS = [
	"jpg",
	"jpeg",
	"png",
	"gif",
	"webp",
	"bmp",
	"svg",
];

/**
 * Validates if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
	if (!url || typeof url !== "string") return false;

	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname.toLowerCase();
		const extension = pathname.split(".").pop();

		return extension
			? SUPPORTED_IMAGE_FORMATS.includes(extension)
			: false;
	} catch {
		return false;
	}
}

/**
 * Validates an array of receipt URLs
 */
export function validateReceiptUrls(urls: string[]): {
	valid: boolean;
	invalidUrls: string[];
	message?: string;
} {
	if (!Array.isArray(urls)) {
		return {
			valid: false,
			invalidUrls: [],
			message: "Receipt URLs must be an array",
		};
	}

	const invalidUrls = urls.filter((url) => !isValidImageUrl(url));

	if (invalidUrls.length > 0) {
		return {
			valid: false,
			invalidUrls,
			message: `Invalid image URLs: ${invalidUrls.join(", ")}`,
		};
	}

	return { valid: true, invalidUrls: [] };
}

/**
 * Normalizes receipt input to array format
 * Handles backward compatibility with single string values
 */
export function normalizeReceiptUrls(
	input: string | string[] | null | undefined,
): string[] {
	if (!input) return [];
	if (typeof input === "string") return [input]; // Legacy single string
	if (Array.isArray(input)) return input.filter((url) => url && url.trim());
	return [];
}

/**
 * Removes duplicate receipts from URL and public ID arrays
 */
export function removeDuplicateReceipts(
	urls: string[],
	publicIds: string[],
): { uniqueUrls: string[]; uniquePublicIds: string[] } {
	const seen = new Set<string>();
	const uniqueUrls: string[] = [];
	const uniquePublicIds: string[] = [];

	urls.forEach((url, index) => {
		if (!seen.has(url)) {
			seen.add(url);
			uniqueUrls.push(url);
			uniquePublicIds.push(publicIds[index]);
		}
	});

	return { uniqueUrls, uniquePublicIds };
}

/**
 * Appends a new receipt URL to the array
 */
export function appendReceipt(
	existingUrls: string[],
	newUrl: string,
	maxReceipts: number = 5,
): {
	urls: string[];
	success: boolean;
	message?: string;
} {
	if (!isValidImageUrl(newUrl)) {
		return {
			urls: existingUrls,
			success: false,
			message: "Invalid image URL",
		};
	}

	if (existingUrls.includes(newUrl)) {
		return {
			urls: existingUrls,
			success: false,
			message: "Receipt already exists",
		};
	}

	if (existingUrls.length >= maxReceipts) {
		return {
			urls: existingUrls,
			success: false,
			message: `Maximum ${maxReceipts} receipts allowed`,
		};
	}

	return {
		urls: [...existingUrls, newUrl],
		success: true,
	};
}

/**
 * Removes a receipt URL by index
 */
export function removeReceiptByIndex(
	urls: string[],
	index: number,
): {
	urls: string[];
	success: boolean;
	message?: string;
} {
	if (index < 0 || index >= urls.length) {
		return {
			urls,
			success: false,
			message: "Invalid index",
		};
	}

	const newUrls = [...urls];
	newUrls.splice(index, 1);

	return {
		urls: newUrls,
		success: true,
	};
}

/**
 * Replaces a receipt URL at a specific index
 */
export function replaceReceiptAtIndex(
	urls: string[],
	index: number,
	newUrl: string,
): {
	urls: string[];
	success: boolean;
	message?: string;
} {
	if (index < 0 || index >= urls.length) {
		return {
			urls,
			success: false,
			message: "Invalid index",
		};
	}

	if (!isValidImageUrl(newUrl)) {
		return {
			urls,
			success: false,
			message: "Invalid image URL",
		};
	}

	const newUrls = [...urls];
	newUrls[index] = newUrl;

	return {
		urls: newUrls,
		success: true,
	};
}

/**
 * Checks for duplicate receipts in an array
 */
export function hasDuplicateReceipts(urls: string[]): boolean {
	return new Set(urls).size !== urls.length;
}

/**
 * Validates and normalizes receipt array for database storage
 */
export function prepareReceiptsForStorage(
	input: string | string[] | null | undefined,
	maxReceipts: number = 5,
): {
	urls: string[];
	publicIds: string[];
	success: boolean;
	message?: string;
} {
	const normalized = normalizeReceiptUrls(input);

	if (normalized.length > maxReceipts) {
		return {
			urls: [],
			publicIds: [],
			success: false,
			message: `Maximum ${maxReceipts} receipts allowed`,
		};
	}

	const validation = validateReceiptUrls(normalized);
	if (!validation.valid) {
		return {
			urls: [],
			publicIds: [],
			success: false,
			message: validation.message,
		};
	}

	// Extract Cloudinary public IDs from URLs
	const publicIds = normalized.map((url) => {
		try {
			// Cloudinary URL format: .../upload/v{version}/{publicId}.{extension}
			const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
			return matches ? matches[1] : "";
		} catch {
			return "";
		}
	});

	const { uniqueUrls, uniquePublicIds } = removeDuplicateReceipts(
		normalized,
		publicIds,
	);

	return {
		urls: uniqueUrls,
		publicIds: uniquePublicIds,
		success: true,
	};
}
