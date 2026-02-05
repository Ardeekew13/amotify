# Multi-Receipt System Documentation

## Overview
The Amotify expense system now supports multiple receipt uploads (up to 5 receipts per expense) with full backward compatibility for legacy single-receipt data.

## Features
✅ **Multiple Receipt Upload** - Upload up to 5 receipt images per expense
✅ **Backward Compatibility** - Handles legacy single string receipts
✅ **Validation** - Only accepts valid image URLs
✅ **Deduplication** - Prevents duplicate receipt uploads
✅ **Array Utilities** - Helper functions for receipt management
✅ **Type Safety** - Full TypeScript support

## Architecture

### Database Schema
```typescript
// MongoDB Schema (Expense.ts)
receiptUrl: {
  type: [String],
  default: [],
  validate: {
    validator: (urls: string[]) => {
      if (!urls || urls.length === 0) return true;
      if (urls.length > 5) return false;
      return urls.every(url => isValidImageUrl(url));
    },
    message: "Invalid receipt URLs. Maximum 5 image URLs allowed."
  }
}

receiptPublicId: {
  type: [String],
  default: [],
  validate: {
    validator: (ids: string[]) => {
      return ids.length === this.receiptUrl?.length;
    },
    message: "Receipt public IDs must match receipt URLs."
  }
}
```

### GraphQL Schema
```graphql
type Expense {
  receiptUrl: [String]
  receiptPublicId: [String]
}

input CreateExpenseInput {
  receiptUrl: [String]
  receiptPublicId: [String]
}
```

### TypeScript Interfaces
```typescript
// ExpenseInterface.ts
export interface CreateExpenseInput {
  receiptUrl?: string[];
  receiptPublicId?: string[];
}

export interface IExpense {
  receiptUrl?: string[];
  receiptPublicId?: string[];
}
```

## Utility Functions

### Location: `lib/receiptUtils.ts`

#### 1. **normalizeReceiptUrls**
Converts single string or array to normalized array format (backward compatibility).

```typescript
normalizeReceiptUrls(input: string | string[] | null | undefined): string[]

// Examples:
normalizeReceiptUrls("https://example.com/image.jpg") 
// => ["https://example.com/image.jpg"]

normalizeReceiptUrls(["url1.jpg", "url2.jpg"]) 
// => ["url1.jpg", "url2.jpg"]

normalizeReceiptUrls(null) 
// => []
```

#### 2. **validateReceiptUrls**
Validates array of receipt URLs to ensure they are valid image URLs.

```typescript
validateReceiptUrls(urls: string[]): {
  valid: boolean;
  invalidUrls: string[];
  message?: string;
}

// Example:
validateReceiptUrls(["https://example.com/image.jpg", "invalid-url"])
// => { valid: false, invalidUrls: ["invalid-url"], message: "..." }
```

#### 3. **isValidImageUrl**
Checks if a URL is a valid image URL.

```typescript
isValidImageUrl(url: string): boolean

// Supported formats: jpg, jpeg, png, gif, webp, bmp, svg
```

#### 4. **appendReceipt**
Adds a new receipt to the array with validation.

```typescript
appendReceipt(
  existingUrls: string[], 
  newUrl: string, 
  maxReceipts: number = 5
): { urls: string[]; success: boolean; message?: string }
```

#### 5. **removeReceiptByIndex**
Removes a receipt at a specific index.

```typescript
removeReceiptByIndex(
  urls: string[], 
  index: number
): { urls: string[]; success: boolean; message?: string }
```

#### 6. **replaceReceiptAtIndex**
Replaces a receipt at a specific index with a new one.

```typescript
replaceReceiptAtIndex(
  urls: string[], 
  index: number, 
  newUrl: string
): { urls: string[]; success: boolean; message?: string }
```

#### 7. **removeDuplicateReceipts**
Removes duplicate URLs from the array.

```typescript
removeDuplicateReceipts(urls: string[]): string[]
```

#### 8. **prepareReceiptsForStorage**
Complete validation and preparation for database storage.

```typescript
prepareReceiptsForStorage(
  input: string | string[] | null | undefined,
  maxReceipts: number = 5
): {
  urls: string[];
  publicIds: string[];
  success: boolean;
  message?: string;
}
```

## GraphQL Resolver Implementation

### Location: `backend/graphql/resolvers/expense.ts`

```typescript
import {
  normalizeReceiptUrls,
  validateReceiptUrls,
  removeDuplicateReceipts,
} from "@/lib/receiptUtils";

const createExpense = async (_, { input }) => {
  // 1. Normalize input (handles both string and array)
  const normalizedUrls = normalizeReceiptUrls(input.receiptUrl);
  const normalizedPublicIds = normalizeReceiptUrls(input.receiptPublicId);

  // 2. Remove duplicates
  const deduplicatedUrls = removeDuplicateReceipts(normalizedUrls);
  const deduplicatedPublicIds = removeDuplicateReceipts(normalizedPublicIds);

  // 3. Validate URLs
  if (deduplicatedUrls.length > 0) {
    const validation = validateReceiptUrls(deduplicatedUrls);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
        expense: null,
      };
    }
  }

  // 4. Create/update expense
  const expense = await Expense.create({
    ...input,
    receiptUrl: deduplicatedUrls,
    receiptPublicId: deduplicatedPublicIds,
  });

  return { success: true, message: "Success", expense };
};
```

## Frontend Component Usage

### ExpenseForm Component

```typescript
import { removeDuplicateReceipts } from "@/lib/receiptUtils";

// State
const [existingReceiptUrl, setExistingReceiptUrl] = useState<string[] | null>(null);
const [receiptFile, setReceiptFile] = useState<File[]>([]);

// On form submit
const handleSubmit = async (e) => {
  // 1. Upload new receipts
  const uploadResults = await Promise.all(
    receiptFile.map(file => uploadReceipt(file))
  );
  
  const newReceiptUrls = uploadResults.map(r => r.url);
  const newReceiptPublicIds = uploadResults.map(r => r.publicId);

  // 2. Combine existing + new, remove duplicates
  const allReceiptUrls = removeDuplicateReceipts([
    ...(existingReceiptUrl || []),
    ...newReceiptUrls,
  ]);

  // 3. Validate max receipts
  if (allReceiptUrls.length > 5) {
    toast.error("Maximum 5 receipts allowed");
    return;
  }

  // 4. Submit to GraphQL
  await createExpense({
    variables: {
      input: {
        receiptUrl: allReceiptUrls,
        receiptPublicId: allReceiptPublicIds,
        // ... other fields
      }
    }
  });
};
```

### ReceiptUpload Component

```typescript
import { normalizeReceiptUrls } from "@/lib/receiptUtils";

interface ReceiptUploadProps {
  existingUrl?: string | string[] | null; // Backward compatible
  value: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

// Initialize with backward compatibility
const [existingReceipts, setExistingReceipts] = useState<string[]>(
  normalizeReceiptUrls(existingUrl)
);
```

## Migration Guide

### Migrating Legacy Data

Run the migration script to convert existing single-string receipts to arrays:

```bash
npx tsx scripts/migrate-receipts.ts
```

The script will:
1. Find all expenses with string `receiptUrl` or `receiptPublicId`
2. Convert them to single-item arrays
3. Update the database
4. Report migration status

### Manual Migration Example

```typescript
// Before (legacy)
{
  receiptUrl: "https://cloudinary.com/image.jpg",
  receiptPublicId: "public_id_123"
}

// After (migrated)
{
  receiptUrl: ["https://cloudinary.com/image.jpg"],
  receiptPublicId: ["public_id_123"]
}
```

## Validation Rules

### 1. **Maximum Receipts**
- Maximum 5 receipts per expense
- Enforced at: Model validation, resolver, frontend

### 2. **Image URL Validation**
- Must be valid URLs
- Must have image file extensions
- Supported: jpg, jpeg, png, gif, webp, bmp, svg

### 3. **Array Length Matching**
- `receiptUrl.length` must equal `receiptPublicId.length`
- Enforced at model validation level

### 4. **Deduplication**
- Duplicate URLs are automatically removed
- Uses `Set` for efficient deduplication

## Error Handling

### GraphQL Resolver Errors
```typescript
// Invalid URLs
{
  success: false,
  message: "Invalid image URLs: http://example.com/file.pdf",
  expense: null
}

// Too many receipts
{
  success: false,
  message: "Maximum 5 receipts allowed",
  expense: null
}
```

### Frontend Toast Notifications
```typescript
toast.error("Maximum 5 receipts allowed");
toast.error("Invalid image URL");
toast.error("Receipt already exists");
toast.success("3 receipt(s) uploaded successfully!");
```

## Best Practices

### 1. **Always Normalize Input**
```typescript
const normalized = normalizeReceiptUrls(input.receiptUrl);
```

### 2. **Validate Before Storage**
```typescript
const validation = validateReceiptUrls(urls);
if (!validation.valid) {
  return { success: false, message: validation.message };
}
```

### 3. **Remove Duplicates**
```typescript
const deduplicated = removeDuplicateReceipts(urls);
```

### 4. **Use Type-Safe Interfaces**
```typescript
// Always use the updated interfaces
import { CreateExpenseInput } from "@/backend/models/Expense/ExpenseInterface";
```

### 5. **Handle Loading States**
```typescript
toast.loading("Uploading 3 receipt(s)...", { id: "upload-progress" });
// ... upload logic
toast.dismiss("upload-progress");
toast.success("Receipts uploaded!");
```

## Testing Checklist

- [ ] Upload single receipt
- [ ] Upload multiple receipts (2-5)
- [ ] Try uploading more than 5 receipts
- [ ] Edit expense with existing receipts
- [ ] Add new receipts to existing expense
- [ ] Remove individual receipts
- [ ] Replace individual receipts
- [ ] Upload duplicate receipts (should deduplicate)
- [ ] Upload non-image files (should reject)
- [ ] Upload files > 5MB (should reject)
- [ ] Legacy data with single string receiptUrl (should work)
- [ ] Empty receiptUrl (should handle gracefully)

## Troubleshooting

### Issue: "Cast to Array failed"
**Solution:** Input is being sent as string instead of array
```typescript
// Fix: Normalize input
const normalized = normalizeReceiptUrls(input.receiptUrl);
```

### Issue: Receipts not showing after edit
**Solution:** Ensure proper array initialization
```typescript
const [existingReceipts, setExistingReceipts] = useState<string[]>(
  normalizeReceiptUrls(existingUrl)
);
```

### Issue: Duplicate receipts appearing
**Solution:** Use deduplication utility
```typescript
const deduplicated = removeDuplicateReceipts(allUrls);
```

### Issue: Validation errors on save
**Solution:** Check array lengths match
```typescript
// receiptUrl and receiptPublicId must have same length
if (urls.length !== publicIds.length) {
  // Handle error
}
```

## Performance Considerations

1. **Parallel Uploads**: All receipts are uploaded in parallel using `Promise.all()`
2. **Deduplication**: Uses `Set` for O(n) deduplication
3. **Validation**: Early validation prevents unnecessary database calls
4. **Preview URLs**: Properly cleaned up with `URL.revokeObjectURL()`

## Security

1. **File Type Validation**: Only image files accepted
2. **File Size Limit**: Maximum 5MB per file
3. **URL Validation**: Only valid image URLs stored
4. **Public ID Extraction**: Safely extracts Cloudinary public IDs

## Future Enhancements

- [ ] Receipt thumbnail generation
- [ ] OCR for receipt data extraction
- [ ] Receipt tagging/categorization
- [ ] Bulk receipt download
- [ ] Receipt sharing between users
- [ ] Image compression before upload
- [ ] Progress indicators for individual uploads

## Support

For issues or questions, refer to:
- Main documentation: `README.md`
- Authentication docs: `AUTHENTICATION.md`
- Cloudinary setup: `CLOUDINARY_SETUP.md`
- Development guide: `DEVELOPMENT.md`
