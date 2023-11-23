const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dsckn1jjj',
  api_key: '591561974842918',
  api_secret: 'ANFnW5o7KEt4YGbjiefwKKf-XK8'
});

async function uploadFileWithCloudinary(file: any) {
  try {
    const result = await cloudinary.uploader.upload(file.buffer, {
      folder: 'taskManager',
      public_id: file.filename.replace(/\.[^/.]+$/, ""),
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Failed to upload file to Cloudinary');
  }
}

export { uploadFileWithCloudinary };
