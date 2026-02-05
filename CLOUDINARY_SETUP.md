# Cloudinary Integration Setup Guide

## ✅ Integration Complete!

Cloudinary has been successfully integrated into your Amotify expense management system.

## 📁 Files Created/Modified

### Created:
1. `lib/cloudinary.ts` - Cloudinary configuration
2. `app/api/upload/route.ts` - Upload API endpoint
3. `components/expense/ReceiptUpload.tsx` - Receipt upload component
4. `.env.local.example` - Environment variables template

### Modified:
1. `app/(dashboard)/expense/manage/page.tsx` - Integrated ReceiptUpload component

## 🔑 Setup Steps

### 1. Get Cloudinary Credentials

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a **FREE account** (25GB storage, 25GB bandwidth/month - lifetime!)
3. Go to your Dashboard
4. Copy these credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configure Environment Variables

Create/update `.env.local` in your project root:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

⚠️ **Important**: Restart your dev server after adding environment variables!

```bash
# Stop the server (Ctrl+C) then restart
npm run dev
```

### 3. Test the Integration

1. Navigate to `/expense/manage`
2. Click "Upload Receipt"
3. Select an image (max 5MB)
4. Image will upload to Cloudinary
5. Preview will appear
6. Submit the form - receipt URL and publicId will be saved to MongoDB

## ✨ Features Included

✅ **Image Upload** - Direct upload to Cloudinary  
✅ **Image Preview** - See receipt before submitting  
✅ **Remove Image** - Clear uploaded receipt  
✅ **Validation** - File type (images only) and size (max 5MB)  
✅ **Loading States** - Upload progress indicator  
✅ **Error Handling** - Toast notifications for errors  
✅ **TypeScript** - Full type safety  
✅ **MongoDB Integration** - Saves `receiptUrl` and `receiptPublicId`  
✅ **GraphQL Ready** - Works with your existing CREATE_EXPENSE mutation  

## 📊 Cloudinary Free Tier

- **Storage**: 25GB (lifetime)
- **Bandwidth**: 25GB/month
- **Transformations**: 25 credits/month
- **No Credit Card Required**
- **No Time Limit**

For a receipt image averaging 500KB:
- You can store ~**50,000 receipt images**!

## 🔧 How It Works

1. User selects image from device
2. Frontend validates file type and size
3. Image is sent to `/api/upload` endpoint
4. Backend uploads to Cloudinary using their API
5. Cloudinary returns secure URL and public ID
6. Frontend displays preview and stores URL/ID in state
7. On form submit, URL and ID are saved to MongoDB via GraphQL

## 🗂️ File Structure

```
amotify/
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts          # Upload endpoint
│   └── (dashboard)/
│       └── expense/
│           └── manage/
│               └── page.tsx       # Expense form with receipt upload
├── components/
│   └── expense/
│       └── ReceiptUpload.tsx     # Upload component
└── lib/
    └── cloudinary.ts             # Cloudinary config
```

## 🎯 Next Steps

1. Add your Cloudinary credentials to `.env.local`
2. Restart your dev server
3. Test uploading a receipt image
4. (Optional) Customize image transformations in `app/api/upload/route.ts`
5. (Optional) Add image optimization/compression settings

## 🚀 Optional Enhancements

### Image Transformations
```typescript
const result = await cloudinary.uploader.upload(dataURI, {
  folder: 'amotify/receipts',
  resource_type: 'auto',
  transformation: [
    { width: 1200, crop: 'limit' },      // Max width
    { quality: 'auto:good' },            // Auto quality
    { fetch_format: 'auto' },            // Auto format (WebP)
  ],
});
```

### Delete on Remove
Add delete functionality when user removes receipt:
```typescript
await cloudinary.uploader.destroy(publicId);
```

## 📝 Notes

- Images are stored in the `amotify/receipts` folder in Cloudinary
- All uploads are validated for type and size
- Receipt URLs are CDN-optimized for fast loading
- Public IDs allow for future deletion/management

---

**Integration Status**: ✅ Ready to Use!
