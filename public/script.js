var canvas, context;
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function addClick(x, y, dragging) {
  console.log('click', x, y, dragging)
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  
  context.strokeStyle = "#000";
  context.lineJoin = "round";
  context.lineWidth = 10;
			
  for(var i=0; i < clickX.length; i++) {		
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
    }else{
      context.moveTo(clickX[i]-1, clickY[i]);
    }
    context.lineTo(clickX[i], clickY[i]);
    context.closePath();
    context.stroke();
  }

  showInputImage(drawSmallImage());
}

function drawSmallImage() {

  // Resize image first
  const resizeCanvas = document.createElement('canvas');
  resizeCanvas.width = 28;
  resizeCanvas.height = 28;

  const resizeCtx = resizeCanvas.getContext('2d');

  resizeCtx.clearRect(0, 0, context.canvas.width, context.canvas.height);

  resizeCtx.fillStyle = "#000";
  resizeCtx.fillRect(0, 0, canvas.width, canvas.height);

  resizeCtx.strokeStyle = "#fff";
  resizeCtx.lineJoin = "round";
  resizeCtx.lineWidth = 1;
			
  for(var i=0; i < clickX.length; i++) {		
    resizeCtx.beginPath();
    if(clickDrag[i] && i){
      resizeCtx.moveTo(clickX[i-1]/10, clickY[i-1]/10);
    }else{
      resizeCtx.moveTo((clickX[i]-1)/10, clickY[i]/10);
    }
    resizeCtx.lineTo(clickX[i]/10, clickY[i]/10);
    resizeCtx.closePath();
    resizeCtx.stroke();
  }

  let imageDataURL = resizeCtx.canvas.toDataURL();

  return imageDataURL;
}

function showInputImage(dataURL) {
  let inputImg = document.getElementById('display-img');
  inputImg.src = dataURL;

  document.getElementById('prediction-text').hidden = true;
}

function showPrediction(conf, cls) {
  document.getElementById('prediction-text').hidden = false;
  let predictionText = document.getElementById('prediction-text');
  predictionText.innerHTML = `I'm ${conf}% sure it's an <b>${cls}</b>.`;
}

window.onload = () => {
  context = document.getElementById('draw-space').getContext("2d");

  canvas = document.getElementById('draw-space');
  canvas.addEventListener('mousedown', (e) => {
    paint = true;
    addClick(e.offsetX, e.offsetY);
    redraw();
  });

  canvas.addEventListener('mousemove', (e) => {
    if(paint){
      addClick(e.offsetX, e.offsetY, true);
      redraw();
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    paint = false;
  });

  canvas.addEventListener('mouseleave', (e) => {
    paint = false;
  });

  let clearButton = document.getElementById('clear-button');
  clearButton.addEventListener('click', () => {
    clickX = [];
    clickY = [];
    clickDrag = [];
    redraw();
  });

  let submitButton = document.getElementById('submit-button');
  submitButton.addEventListener('click', async (e) => {
    submitButton.setAttribute('disabled', true);

    let imageDataURL = drawSmallImage();

    let pred = await fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"image": imageDataURL})
    });
    pred = await pred.json();

    showInputImage(imageDataURL);

    showPrediction(pred.conf, pred.class);

    setTimeout(() => {
      submitButton.removeAttribute('disabled');
    }, 1000)
  });

  showInputImage(drawSmallImage());
}