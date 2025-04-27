const fs = require('fs');
const path = require('path');
// const AWS = require('aws-sdk');
// const s3 = new AWS.S3();

const deleteImageFromFileSystem = (imagePath) => {
  try {
    const filePath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); 
    }
  } catch (err) {
    console.error('Error deleting image from file system:', err);
  }
};

// const deleteImageFromCloudStorage = async (imageKey) => {
//   try {
//     const params = {
//       Bucket: 'your-bucket-name', 
//       Key: imageKey,              
//     };
//     await s3.deleteObject(params).promise();
//   } catch (err) {
//     console.error('Error deleting image from cloud storage:', err);
//   }
// };


const deleteImage = async (imageUrl, storageType = 'local') => {
  if (storageType === 'local') {
    deleteImageFromFileSystem(imageUrl);
  }
//    else if (storageType === 'cloud') {
//     deleteImageFromCloudStorage(imageUrl);
//   } 
  else {
    console.error('Unsupported storage type');
  }
};

module.exports = {
  deleteImage,
};
