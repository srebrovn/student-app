import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt

class Detector:

    def __init__(self):
        pass

    def readClasses(self, classesPathFile):
        with open(classesPathFile, 'r') as f:
            self.classesList = f.read().splitlines()

        self.colorList = np.random.uniform(low=0, high=255, size=(len(self.classesList), 3))

    def loadModel(self):
        tf.keras.backend.clear_session()
        self.model = tf.saved_model.load("ssd_mobilenet_v2_320x320_coco17_tpu-8/saved_model")
        print("Model loaded successfully...")

    def createBoundingBox(self, image):
        img = np.array(image)
        inputTensor = np.array(image)
        plt.imshow(inputTensor)
        plt.show()
        inputTensor = tf.convert_to_tensor(inputTensor, dtype=tf.uint8)
        inputTensor = inputTensor[tf.newaxis,...]

        detections = self.model(inputTensor)

        bboxs = detections['detection_boxes'][0].numpy()
        classIndexes = detections['detection_classes'][0].numpy().astype(np.int32)
        classScores = detections['detection_scores'][0].numpy()

        imH, imW, imX = img.shape

        bboxIdx = tf.image.non_max_suppression(bboxs, classScores, max_output_size=50, iou_threshold=0.6, score_threshold=0.5)
        person_count = 0
        if len(bboxIdx) != 0:
            for i in bboxIdx:
                bbox = tuple(bboxs[i].tolist())
                classIndex = classIndexes[i]

                classLabelText = self.classesList[classIndex]
                classColor = self.colorList[classIndex]

                ymin, xmin, ymax, xmax = bbox

                ymin, xmin, ymax, xmax = (ymin * imH, ymax * imH, xmin * imW, xmax * imW)
                ymin, xmin, ymax, xmax = int(ymin), int(xmin), int(ymax), int(xmax)

                # cv2.rectangle(img, (xmin, ymin), (xmax, ymax), color = classColor, thickness=1)
                if classLabelText == "person":
                    person_count += 1
        return img, person_count
    def predictImage(self, image):
        bboxImage, count = self.createBoundingBox(image)
        plt.title("Number of people:" + str(count))
        plt.axis('off')
        plt.imshow(bboxImage)
        plt.show()
        print("Num of ppl: " + str(count))
        return count
