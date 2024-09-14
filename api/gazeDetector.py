import time
# %% [markdown]
# ##### Copyright 2023 The MediaPipe Authors. All Rights Reserved.
import loguru
from scipy.spatial.transform import Rotation   
# %%
#@title Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# %% [markdown]
# # Face Landmarks Detection with MediaPipe Tasks
# 
# This notebook shows you how to use MediaPipe Tasks Python API to detect face landmarks from images.

# %% [markdown]
# ## Preparation
# 
# Let's start with installing MediaPipe.

# %%
# !pip install -q mediapipe

# %% [markdown]
# Then download the off-the-shelf model bundle(s). Check out the [MediaPipe documentation](https://developers.google.com/mediapipe/solutions/vision/face_landmarker#models) for more information about these model bundles.

# %%
# !wget -O face_landmarker_v2_with_blendshapes.task -q https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task

# %% [markdown]
# ## Visualization utilities

# %%
#@markdown We implemented some functions to visualize the face landmark detection results. <br/> Run the following cell to activate the functions.

from mediapipe import solutions
from mediapipe.framework.formats import landmark_pb2
import numpy as np
import matplotlib.pyplot as plt


def draw_landmarks_on_image(rgb_image, detection_result):
  face_landmarks_list = detection_result.face_landmarks
  annotated_image = np.copy(rgb_image)

  # Loop through the detected faces to visualize.
  for idx in range(len(face_landmarks_list)):
    face_landmarks = face_landmarks_list[idx]

    # Draw the face landmarks.
    face_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
    face_landmarks_proto.landmark.extend([
      landmark_pb2.NormalizedLandmark(x=landmark.x, y=landmark.y, z=landmark.z) for landmark in face_landmarks
    ])

    solutions.drawing_utils.draw_landmarks(
        image=annotated_image,
        landmark_list=face_landmarks_proto,
        connections=mp.solutions.face_mesh.FACEMESH_TESSELATION,
        landmark_drawing_spec=None,
        connection_drawing_spec=mp.solutions.drawing_styles
        .get_default_face_mesh_tesselation_style())
    solutions.drawing_utils.draw_landmarks(
        image=annotated_image,
        landmark_list=face_landmarks_proto,
        connections=mp.solutions.face_mesh.FACEMESH_CONTOURS,
        landmark_drawing_spec=None,
        connection_drawing_spec=mp.solutions.drawing_styles
        .get_default_face_mesh_contours_style())
    solutions.drawing_utils.draw_landmarks(
        image=annotated_image,
        landmark_list=face_landmarks_proto,
        connections=mp.solutions.face_mesh.FACEMESH_IRISES,
          landmark_drawing_spec=None,
          connection_drawing_spec=mp.solutions.drawing_styles
          .get_default_face_mesh_iris_connections_style())

  return annotated_image

def plot_face_blendshapes_bar_graph(face_blendshapes):
  # Extract the face blendshapes category names and scores.
  face_blendshapes_names = [face_blendshapes_category.category_name for face_blendshapes_category in face_blendshapes]
  face_blendshapes_scores = [face_blendshapes_category.score for face_blendshapes_category in face_blendshapes]
  # The blendshapes are ordered in decreasing score value.
  face_blendshapes_ranks = range(len(face_blendshapes_names))

  fig, ax = plt.subplots(figsize=(12, 12))
  bar = ax.barh(face_blendshapes_ranks, face_blendshapes_scores, label=[str(x) for x in face_blendshapes_ranks])
  ax.set_yticks(face_blendshapes_ranks, face_blendshapes_names)
  ax.invert_yaxis()

  # Label each bar with values
  for score, patch in zip(face_blendshapes_scores, bar.patches):
    plt.text(patch.get_x() + patch.get_width(), patch.get_y(), f"{score:.4f}", va="top")

  ax.set_xlabel('Score')
  ax.set_title("Face Blendshapes")
  plt.tight_layout()
  plt.show()

# %% [markdown]
# ## Download test image
# 
# Let's grab a test image that we'll use later. The image is from [Unsplash](https://unsplash.com/photos/mt2fyrdXxzk).

# %%
# !wget -q -O image.png https://storage.googleapis.com/mediapipe-assets/business-person.png

import cv2
# from google.colab.patches import cv2_imshow

img = cv2.imread("3.jpg")

# %%
# %pip install loguru

# %%
# Import the necessary modules.
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from loguru import logger
# loguru save only warnings to a file
logger.add("warnings.log", level="WARNING", rotation="1 MB")
logger.add("all.log", rotation="1 MB")
logger.info("Imported necessary modules.")


# Create an FaceLandmarker object.
base_options = python.BaseOptions(model_asset_path='face_landmarker_v2_with_blendshapes.task')
options = vision.FaceLandmarkerOptions(base_options=base_options,
                                       output_face_blendshapes=True,
                                       output_facial_transformation_matrixes=True,
                                       num_faces=1)
detector = vision.FaceLandmarker.create_from_options(options)

logger.info("Created FaceLandmarker object.")


name = "5.jpg"
# Load the input image.
image = mp.Image.create_from_file(name)

logger.info("Loaded input image.")

# Load the image with OpenCV
img = cv2.imread(name)

logger.info("Loaded image with OpenCV.")

def gaze(image):
    # The eye landmarks correspond to the following points:

    # Detect face landmarks from the input image.
    detection_result = detector.detect(image)
    if len(detection_result.face_landmarks) == 0:
        loguru.logger.warning("No face landmarks were detected.")
        return None

    
    eyeCategories = [
        "eyeBlinkLeft",
        "eyeBlinkRight",
        "eyeLookDownLeft",
        "eyeLookDownRight",
        "eyeLookInLeft",
        "eyeLookInRight",
        "eyeLookOutLeft",
        "eyeLookOutRight",
        "eyeLookUpLeft",
        "eyeLookUpRight",
        "eyeSquintLeft",
        "eyeSquintRight",
        "eyeWideLeft",
        "eyeWideRight"
    ]
    final_dict = {}
    for a in detection_result.face_blendshapes[0]:
        if(a.category_name in eyeCategories):
            final_dict[a.category_name] = a.score

        

    transformation_matrix = detection_result.facial_transformation_matrixes[0]
    rotation_matrix = transformation_matrix[:3, :3]
    r =  Rotation.from_matrix(rotation_matrix)
    angles = r.as_euler("zyx",degrees=True)
    # print(angles)
    translation_vector = transformation_matrix[:3, 3]
    # Construct a 3x4 projection matrix
    projection_matrix = np.hstack((rotation_matrix, translation_vector.reshape(-1, 1)))

    # Calculate Euler angles from the projection matrix
    euler_angles = cv2.decomposeProjectionMatrix(projection_matrix)[6]

    # Convert to degrees
    euler_angles = euler_angles.flatten()
    euler_angles = np.degrees(euler_angles)
    # print(euler_angles)

    # Determine the direction based on Euler angles
    pitch ,yaw, roll = euler_angles
    final_dict["yaw"] = yaw
    final_dict["pitch"] = pitch
    final_dict["roll"] = roll
    # print(euler_angles)
    
    return final_dict

# gaze(image)
# create video
cap = cv2.VideoCapture(0)
rolling_average = []

def calculate_meaning_from_average(rolling_average):
    # first calculate where the head is facing
    pitch = rolling_average["pitch"]
    yaw = rolling_average["yaw"]
    fLeft = False
    fRight = False
    fUp = False
    fDown = False
    reason = ""
    print(yaw)
    if pitch > 1000:
        fDown = True
        reason = "Looking Down"
        logger.info("Looking Down")
    elif pitch < -800:
        fUp = True
        reason = "Looking Up"
        logger.info("Looking Up")
    elif yaw > 800:
        fLeft = True
        reason = "Looking Left"
        logger.info("Looking Left")
    elif yaw < -800:
        fRight = True
        reason = "Looking Right"
        logger.info("Looking Right")
    
    eyeLookDownLeft = rolling_average["eyeLookDownLeft"]
    eyeLookDownRight = rolling_average["eyeLookDownRight"]
    
    eDown = False
    eUp = False
    eLeft = False
    eRight = False
    eBlinking = False
    
    if eyeLookDownLeft + eyeLookDownRight > 1.0:
        eDown = True
        reason = "Eye Looking Down"
        logger.info("Eye Looking Down")
        
    
    eyeLookUpLeft = rolling_average["eyeLookUpLeft"]
    eyeLookUpRight = rolling_average["eyeLookUpRight"]
    
    if eyeLookUpLeft + eyeLookUpRight > 1.:
        eUp = True
        reason = "Eye Looking Up"
        logger.info("Eye Looking Up")
    
    eyeLookInLeft = rolling_average["eyeLookInLeft"]
    eyeLookOutRight = rolling_average["eyeLookInRight"]
    if eyeLookInLeft + eyeLookOutRight > 1.0:
        eRight = True
        reason = "Eye Looking Right"
        logger.info("Eye Looking Right")
    
    eyeLookOutLeft = rolling_average["eyeLookOutLeft"]
    eyeLookInRight = rolling_average["eyeLookOutRight"]
    
    if eyeLookOutLeft + eyeLookInRight > 1.0:
        eLeft = True
        reason = "Eye Looking Left"
        logger.info("Eye Looking Left")
    
    eyeBlinkLeft = rolling_average["eyeBlinkLeft"]
    eyeBlinkRight = rolling_average["eyeBlinkRight"]
    
    if eyeBlinkLeft + eyeBlinkRight > 0.8:
        eBlinking = True
        reason = "Blinking"
        logger.info("Blinking")
    distracted = False
    if fUp or fDown or fLeft or fRight or eDown or eUp or eLeft or eRight or eBlinking:
        distracted = True
        logger.info("Distracted based on individual")
    elif fUp and eDown:
        distracted = False
        logger.info("not distracted based on combined")
    elif fDown and eUp:
        distracted = False
        logger.info("not distracted based on combined")
    elif fLeft and eRight:
        distracted = False
        logger.info("not distracted based on combined")
    elif fRight and eLeft:
        distracted = False
        logger.info("not distracted based on combined")
    
    if distracted:
        logger.info("Distracted")
        return True, reason
    else:
        logger.info("Not Distracted")
        return False, reason
        
        
# while True:
#     ret, frame = cap.read()
#     # if not ret:
#     #     break
#     # Detect face landmarks from the input image.
#     if ret:
#         # resize the image
        
#         frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         frame_rgb = cv2.resize(frame_rgb, (640, 480))
#         mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
#         # resize image to 640x480
#         # mp_image = mp_image.resize(width=640, height=480)
#         time.sleep(0.05)
#         val = gaze(mp_image)
#         if val:
#             rolling_average.append(val)
        
#         if len(rolling_average) > 5:
#             # average the values
#             final_dict = {}
#             for key in rolling_average[0].keys():
#                 final_dict[key] = sum([x[key] for x in rolling_average]) / len(rolling_average)
#             print(final_dict)
#             rolling_average = []
#             calculate_meaning_from_average(final_dict)

def getValueFromManyImages(images):
    rolling_average = []
    noneCounter = 0
    for image in images:
        val = gaze(image)
        if val:
            rolling_average.append(val)
        else:
            noneCounter += 1
    if noneCounter > 3:
        return False, "No Face Detected"
    else:
    
        # average the values
        final_dict = {}
        for key in rolling_average[0].keys():
            final_dict[key] = sum([x[key] for x in rolling_average]) / len(rolling_average)
        print(final_dict)
        rolling_average = []
        val, reason = calculate_meaning_from_average(final_dict)
        return val, reason


        



        # cv2.imshow('frame', frame)

# Export the image
# cv2.imwrite('output.png', img)
