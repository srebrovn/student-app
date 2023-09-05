from flask import Flask, jsonify, request
import base64
from io import BytesIO
from PIL import Image
from detector import *
import requests

app = Flask(__name__)
detector = Detector()
url = "http://192.168.0.35:8080/images/"
@app.route('/')
def home():
    return 'Welcome to the API'

@app.errorhandler(400)
def bad_request(error):
    print(error)
    return jsonify({'error': 'Bad Request'}), 400

@app.route('/', methods=['POST'])
def homePOST():
    data = request.get_json()
    imageBase64 = data["picture"]
    decodedImage = base64.b64decode(imageBase64)
    image_buf = BytesIO(decodedImage)
    image = Image.open(image_buf)
    rgb_image = image.convert("RGB")
    id = data["id"]
    count = detector.predictImage(rgb_image)
    if count != 0:
        data = {
            "people" : str(count)
        }
        response = requests.put(url + id, json = data)
        print(response)
        return jsonify({'update': 'true'}), 201
    return jsonify({'update': 'false'}), 204

if __name__ == '__main__':
    classFile = "coco.names"

    detector.readClasses(classFile)
    detector.loadModel()
    app.run(host="164.8.162.244", port=8000,debug=True)
