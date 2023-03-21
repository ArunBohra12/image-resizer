const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImg(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError('Please select an image');
    return;
  }

  // Get original dimentions of an image file
  const image = new Image();
  image.src = URL.createObjectURL(file);

  image.addEventListener('load', function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  });

  form.style.display = 'block';
  filename.textContent = file.name;
  outputPath.textContent = path.join(os.homedir(), 'image-resizer');
}

// Make sure file is an image
function isFileImage(file) {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];

  return file && acceptedImageTypes.includes(file.type);
}

// Send image data to main process
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    alertError('Please upload an image');
    return;
  }

  if (width === '' || height === '') {
    alertError('Please fill in a height and width');
  }

  // Send to main using IPC renderer
  ipcRenderer.send('image:resize', { imgPath, width, height });
}

// Show error alert
function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },
  });
}

// Show success alert
function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center',
    },
  });
}

// Catch the image-resize event
ipcRenderer.on('image-resize:success', function () {
  alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value}`);
});

ipcRenderer.on('image-resize:failed', function () {
  alertError('Failed to resize the image. Please try again.');
});

// All eventlisteners here
img.addEventListener('change', loadImg);
form.addEventListener('submit', sendImage);
