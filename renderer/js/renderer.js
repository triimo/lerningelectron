// Some JavaScript to load the image and show the form. There is no actual backend functionality. This is just the UI
const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');
const outputPath = document.querySelector('#output-path');


function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError('Please select an image file');
        return;
  }

  //get original dimension
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function() {
    widthInput.value = this.width;
    heightInput.value = this.height;

  }

  form.style.display = 'block';
  document.querySelector(
    '#filename'
  ).innerHTML = file.name;
  outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

//send image data to main image.
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if(!img.files[0]) {
    alertError('Please Upload an Image');
    return;
  }

  if (width === '' || height === '') {
    alertError('Please Fill Height And  Width');
    return;
  }

  //send to main using ipc reander.
  ipcRender.send('image:resize', {
    imgPath,
    width,
    height,
  });
}

//Catch the image:done event
ipcRender.on('image:done', () => {
  alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value}`)
})

function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    return file && acceptedImageTypes.includes(file['type'])
}

function alertError(message) {
  Toastify.toast({
    text : message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    }
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text : message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center',
    }
  });
}

document.querySelector('#img').addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);
