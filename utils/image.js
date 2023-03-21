const fs = require('fs');
const path = require('path');
const ResizeImg = require('resize-img');

/**
 * It takes an image path, width, height, and destination path, and then resizes the image to the given
 * width and height and saves it to the destination path
 * @returns A boolean value
 */
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await ResizeImg(fs.readFileSync(imgPath), {
      width: Number(width),
      height: Number(height),
    });

    const fileName = path.basename(imgPath);

    // Create the dest folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // write file to the destination
    fs.writeFileSync(path.join(dest, fileName), newPath);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = resizeImage;
