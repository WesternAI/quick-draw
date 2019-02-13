import re
import base64
from PIL import Image
import io
import numpy as np
import os

from flask import Flask, request, send_from_directory, send_file, json
app = Flask(__name__)

from tensorflow import keras
keras.backend.clear_session()

model = None
@app.before_first_request
def load_model():
    # load the pre-trained Keras model (here we are using a model
    # pre-trained on ImageNet and provided by Keras, but you can
    # substitute in your own networks just as easily)
    global model
    model = keras.models.load_model(os.path.join(app.root_path, 'net4.h5'))
    model._make_predict_function()

# Serve static files
@app.route("/public/<path:path>")
def public_files(path):
    return send_from_directory('public', path)

# Main page
@app.route("/")
def index():
    return send_file('public/index.html')

# Prediction endpoint
@app.route("/predict", methods=['POST'])
def predict():
    classes = [
        'flamingo',
        'cake',
        'campfire',
        'angel',
        'palm tree',
        'remote control',
        'rhinoceros',
        'The Eiffel Tower',
        'The Mona Lisa',
        'wine bottle',
        'hot air balloon',
        'skateboard',
        'map',
        'underwear',
        'roller coaster'
    ]

    image_data_url = request.json['image']
    image_string = re.search(r'base64,(.*)', image_data_url).group(1)
    image_bytes = io.BytesIO(base64.b64decode(image_string))
    PIL_image = Image.open(image_bytes)
    image_arr = np.array(PIL_image)[:, :, 0] / 255.0
    image_arr = image_arr.flatten()
    image_input = np.expand_dims(image_arr, axis=0)

    predictions = model.predict(image_input)

    ret = json.dumps({'conf': str(predictions.max() * 100)[:4], 'class': classes[np.argmax(predictions)]})
    return ret