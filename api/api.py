from flask import Flask, request, jsonify
import mediapipe as mp
import numpy as np
import cv2

app = Flask(__name__)

import time
from flask import Flask, jsonify, request , redirect, url_for, request, session
import dbs_worker
import os
import json
import loguru
import gazeDetector
import mediapipe as mp
import numpy as np
import cv2
app = Flask(__name__, static_folder='../public', static_url_path='/')
SESSION_TYPE = 'filesystem'
app.config.from_object(__name__)

# loguru setup
loguru.logger.add("logs.log", rotation="1 MB")
# loguru warning only file
loguru.logger.add("warnings.log", level="WARNING")

# test db
conn = dbs_worker.set_up_connection()
# log the version
loguru.logger.info(f"Database version: {dbs_worker.get_db_version(conn)}")

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.get("user",None) is None:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@app.errorhandler(404)
def not_found(e):
    print(e)
    return app.send_static_file('index.html')


@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/about')
def about():
    print("about")
    return app.send_static_file('about.html')


@app.route('/api/getActiveGames', methods=['GET'])
def get_active_games():
    # get the active games
    games = dbs_worker.get_active_games(conn)
    return jsonify(games)



# @app.route('/api/uploadFrames', methods=['POST'])
# def upload_video():
#     images = []
#     # get the user id from the json
#     user_id = request.json['user_id']
#     for key in request.files:
#         video_chunk = request.files[key]
#         video_data = video_chunk.read()

# Initialize the MediaPipe Image object handler
mp_image = mp.Image
import base64
@app.route('/api/uploadFrames', methods=['POST'])
def upload_video():
    mp_images = []
    user_id = request.json['user_id']
    images = request.json['images']

    for val in images:
        base64_data = val.split(',')[1]  # Remove the data:image/jpeg;base64, part
        video_data = base64.b64decode(base64_data)

        # Convert video chunk to OpenCV image
        np_img = np.frombuffer(video_data, np.uint8)
        cv2_image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        # Convert OpenCV image to MediaPipe Image object
        mp_image_obj = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2_image)
        mp_images.append(mp_image_obj)
        # save the image
        cv2.imwrite(f"images/{user_id}_{time.time()}.jpg", cv2_image)
    
    
    val,reason = gazeDetector.getValueFromManyImages(mp_images)
    user = dbs_worker.get_user_by_id(dbs_worker.set_up_connection(), user_id)
    loguru.logger.info(f"User {user_id} has a score of {val}")
    if val == False:
        # reduce score by 3
        # set active to false
        # set reason
        dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, 1,reason)
    else:
        dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, -3,reason)
    # Now you have a list of MediaPipe Image objects
    # You can process these images using MediaPipe's tools

    return jsonify({'message': 'MediaPipe Images processed successfully'})




# @app.route('/api/getActiveGames', methods=['GET'])
# def get_active_games():
#     # get the active games
#     games = dbs_worker.get_active_games(conn)
#     return jsonify(games)


@app.route('/api/createGame')
def create_game():
    # get the user id
    # create the game
    game = dbs_worker.create_game(dbs_worker.set_up_connection())
    user = dbs_worker.create_user(dbs_worker.set_up_connection(), game[1])
    return jsonify({"game":game,"user":user}), 200



@app.route('/api/joinGame', methods=['POST'])
def join_game():
    # get the game id
    joinCode = request.json['joinCode']
    # get game
    game = dbs_worker.get_game_by_name(dbs_worker.set_up_connection(), joinCode)
    # add user
    user = dbs_worker.create_user(dbs_worker.set_up_connection(), game[1])
    # check if the game is active
    if game[3] == 0:
        return jsonify({'error': 'game is not active'}), 400
    
    return jsonify({"game":game,"user":user})


@app.route('/api/getGameData', methods=['POST'])    
def get_game_data():
    # get the game id
    game_id = request.json['gameId']
    userId = request.json['userId']
    # get the game data
    gameUsers = dbs_worker.get_game_users(dbs_worker.set_up_connection(), game_id)
    score = 0
    userData = {}
    for user in gameUsers:
        score += user[3]
        userData[user[0]] = user
    return jsonify({"gameUsers":gameUsers,"score":score})



# catch errors
@app.errorhandler(400)
def server_error(e):
    print(e)
    return jsonify({'error': 'bad request'}), 400
if __name__ == "__main__":
    app.run(port=5003, debug=True)