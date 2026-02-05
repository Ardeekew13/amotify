# Multi-Receipt System - Quick Reference

## 🚀 Quick Start

### Import Utilities
```typescript
import {
  normalizeReceiptUrls,
  validateReceiptUrls,
  removeDuplicateReceipts,
  isValidImageUrl,
  appendReceipt,
  removeReceiptByIndex,
  replaceReceiptAtIndex,
} from "@/lib/receiptUtils";
```

## 📌 Common Patterns

### 1. Handle Input (Backward Compatible)
```typescript
// Normalize single string or array to array
const receipts = normalizeReceiptUrls(input.receiptUrl);
// Returns: string[]
```

### 2. Validate Before Saving
```typescript
const validation = validateReceiptUrls(receipts);
if (!validation.valid) {
  return { success: false, message: validation.message };
}
```

### 3. Remove Duplicates
```typescript
const unique = removeDuplicateReceipts(receipts);
```

### 4. Combine Existing + New
```typescript
const combined = removeDuplicateReceipts([
  ...(existingReceipts || []),
  ...newReceipts,
]);
```

### 5. Check Max Limit
```typescript
if (receipts.length > 5) {
  throw new Error("Maximum 5 receipts allowed");
}
```

## 🔧 Component Integration

### ExpenseForm Pattern
```typescript
// State
const [existingReceiptUrl, setExistingReceiptUrl] = useState<string[] | null>(null);
const [receiptFile, setReceiptFile] = useState<File[]>([]);

// On Submit
const newUrls = await uploadReceipts(receiptFile);
const combined = removeDuplicateReceipts([
  ...(existingReceiptUrl || []),
  ...newUrls,
]);

// Validation
if (combined.length > 5) {
  toast.error("Maximum 5 receipts allowed");
  return;
}

// Submit
await createExpense({
  variables: {
    input: {
      receiptUrl: combined,
      receiptPublicId: combinedPublicIds,
      // ... other fields
    }
  }
});
```

### ReceiptUpload Pattern
```typescript
interface ReceiptUploadProps {
  existingUrl?: string | string[] | null; // Backward compatible!
  value: File[];
  onChange: (files: File[]) => void;
}

// Initialize
const [existingReceipts, setExistingReceipts] = useState<string[]>(
  normalizeReceiptUrls(existingUrl)
);
```

## 🎯 GraphQL Resolver Pattern

```typescript
import {
  normalizeReceiptUrls,
  validateReceiptUrls,
  removeDuplicateReceipts,
} from "@/lib/receiptUtils";

const createExpense = async (_, { input }) => {
  // 1. Normalize
  const urls = normalizeReceiptUrls(input.receiptUrl);
  const publicIds = normalizeReceiptUrls(input.receiptPublicId);

  // 2. Deduplicate
  const uniqueUrls = removeDuplicateReceipts(urls);
  const uniquePublicIds = removeDuplicateReceipts(publicIds);

  // 3. Validate
  if (uniqueUrls.length > 0) {
    const validation = validateReceiptUrls(uniqueUrls);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
  }

  // 4. Save
  const expense = await Expense.create({
    ...input,
    receiptUrl: uniqueUrls,
    receiptPublicId: uniquePublicIds,
  });

  return { success: true, expense };
};
```

## 🧪 Testing Snippets

### Test Valid Image URL
```typescript
console.log(isValidImageUrl("https://example.com/image.jpg")); // true
console.log(isValidImageUrl("https://example.com/file.pdf")); // false
```

### Test Normalization
```typescript
console.log(normalizeReceiptUrls("single.jpg")); 
// => ["single.jpg"]

console.log(normalizeReceiptUrls(["a.jpg", "b.jpg"])); 
// => ["a.jpg", "b.jpg"]

console.log(normalizeReceiptUrls(null)); 
// => []
```

### Test Deduplication
```typescript
const urls = ["a.jpg", "b.jpg", "a.jpg", "c.jpg"];
console.log(removeDuplicateReceipts(urls));
// => ["a.jpg", "b.jpg", "c.jpg"]
```

### Test Validation
```typescript
const validation = validateReceiptUrls([
  "https://example.com/valid.jpg",
  "invalid-url"
]);
console.log(validation);
// {
//   valid: false,
//   invalidUrls: ["invalid-url"],
//   message: "Invalid image URLs: invalid-url"
// }
```

## 📋 Cheat Sheet

| Function | Input | Output | Use Case |
|----------|-------|--------|----------|
| `normalizeReceiptUrls` | `string \| string[] \| null` | `string[]` | Handle backward compatibility |
| `validateReceiptUrls` | `string[]` | `{ valid, invalidUrls, message }` | Validate before save |
| `isValidImageUrl` | `string` | `boolean` | Single URL check |
| `removeDuplicateReceipts` | `string[]` | `string[]` | Remove duplicates |
| `appendReceipt` | `string[], string, number?` | `{ urls, success, message }` | Add receipt safely |
| `removeReceiptByIndex` | `string[], number` | `{ urls, success, message }` | Remove by index |
| `replaceReceiptAtIndex` | `string[], number, string` | `{ urls, success, message }` | Replace at index |

## 🔍 Common Issues & Solutions

### Issue: "Cast to Array failed"
```typescript
// ❌ Bad
input.receiptUrl = "string"; // Will cause cast error

// ✅ Good
input.receiptUrl = normalizeReceiptUrls(input.receiptUrl);
```

### Issue: Receipts not showing
```typescript
// ❌ Bad
const [receipts, setReceipts] = useState(existingUrl);

// ✅ Good
const [receipts, setReceipts] = useState(
  normalizeReceiptUrls(existingUrl)
);
```

### Issue: Duplicates appearing
```typescript
// ❌ Bad
const combined = [...existing, ...newUrls];

// ✅ Good
const combined = removeDuplicateReceipts([...existing, ...newUrls]);
```

## 💾 Database Schema

```typescript
// Mongoose Model
{
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
  },
  receiptPublicId: {
    type: [String],
    default: [],
    validate: {
      validator: (ids: string[]) => ids.length === this.receiptUrl?.length,
      message: "Receipt public IDs must match receipt URLs."
    }
  }
}
```

## 🎨 Frontend Toast Patterns

```typescript
// Upload progress
toast.loading("Uploading 3 receipt(s)...", { id: "upload" });

// Success
toast.dismiss("upload");
toast.success("3 receipt(s) uploaded successfully!");

// Error
toast.error("Maximum 5 receipts allowed");
toast.error("Invalid image URL");
toast.error(validation.message);
```

## 🔗 Related Files

- **Utilities**: `lib/receiptUtils.ts`
- **Model**: `backend/models/Expense/Expense.ts`
- **Resolver**: `backend/graphql/resolvers/expense.ts`
- **Form**: `components/expense/ExpenseForm.tsx`
- **Upload**: `components/expense/ReceiptUpload.tsx`
- **Migration**: `scripts/migrate-receipts.ts`
- **Docs**: `MULTI_RECEIPT.md`

## 📝 Environment Variables

None required! Uses existing Cloudinary and MongoDB configuration.

## 🚦 Validation Rules

- ✅ Max 5 receipts per expense
- ✅ Only image URLs (jpg, jpeg, png, gif, webp, bmp, svg)
- ✅ Max 5MB per file
- ✅ receiptUrl and receiptPublicId arrays must match length
- ✅ Automatic deduplication

---

**For detailed documentation, see:** `MULTI_RECEIPT.md`
