from flask import Flask, request, jsonify
import mediapipe as mp
import numpy as np
import cv2
import random
app = Flask(__name__)
import datetime

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

powerUpLine = [10,250,400,575,800,1000]
powerUps = ["Devious Meddling","Perfectionist","Gotta PEE!", "Attention Grabbing"]
powerUpTiming = [300,180,300,180]
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
    games = dbs_worker.get_active_games(dbs_worker.set_up_connection())
    return jsonify(games)



@app.route('/api/activatePowerup', methods=['POST'])
def activate_powerup():
    userId = request.json['userId']
    userData = dbs_worker.get_user_by_id(dbs_worker.set_up_connection(),userId)
    nextPowerUp = 0
    if userData[11] in powerUpLine:
        nextPowerUp = powerUpLine[powerUpLine.index(userData[11])+1]
    else:
        nextPowerUp = userData[11] + 300


    dbs_worker.update_user_power_up(dbs_worker.set_up_connection(),userId,userData[8],True,powerUpTiming[powerUps.index(userData[8])],nextPowerUp)
    return jsonify({'message': 'Powerup activated'}), 200
    

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
        if user[9] == True:
            # check if the power up has expired

            if datetime.datetime.strptime(user[10], '%Y-%m-%d %H:%M:%S.%f') < datetime.datetime.now():
                nextPowerUp = 0
                if user[11] in powerUpLine:
                    nextPowerUp = powerUpLine[powerUpLine.index(user[11])+1]
                else:
                    nextPowerUp = user[11] + 300
                dbs_worker.update_user_power_up(dbs_worker.set_up_connection(),user_id,"",False,0,nextPowerUp)
            if user[8] == "Attention Grabbing":
                # get all the other users
                gameUsers = dbs_worker.get_live_game_users(dbs_worker.set_up_connection(), user[2])
                # for each user that is not focused add one point
                bonus = 0
                for gameUser in gameUsers:
                    if gameUser[0] != user_id:
                        if gameUser[4] == False:
                            bonus += 1
            elif user[8] == "Perfectionist":
                #check the last 5 minutes
                finalJson = json.loads(user[13])
                missedTimes = finalJson['missedTimes']
                missedTimes = [datetime.datetime.strptime(x, '%Y-%m-%d %H:%M:%S.%f') for x in missedTimes]
                missedTimes = [x for x in missedTimes if x > datetime.datetime.now() - datetime.timedelta(minutes=5)]
                update = 1
                if len(missedTimes) < 16:
                    update = 3

                dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, update,reason,True)
                
            elif user[8] == "Devious Meddling":
                # get all the other users


                gameUsers = dbs_worker.get_live_game_users(dbs_worker.set_up_connection(), user[2])
                # get highest user score
                highestScore = 0
                user = None
                for gameUser in gameUsers:
                    if gameUser[0] != user_id:
                        if gameUser[3] > highestScore:
                            highestScore = gameUser[3]
                            user = gameUser
                if user != None:
                    dbs_worker.update_user_score(dbs_worker.set_up_connection(), user[0], random.choice([0,0,0,0,-1]),reason,True)
                    dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, random.choice([1,1,1,1,2]),reason,True) 
                else:
                    dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, 1,reason,True)


                
        else:
            
            dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, 1,reason,True)
    else:
        
        if user[9] == True and datetime.datetime.strptime(user[10], '%Y-%m-%d %H:%M:%S.%f') > datetime.datetime.now():
                if user[8] == "Gotta PEE!":
                    print(" GOTTA PEE IS ACTIVE")
                    finalJson = json.loads(user[13])
                    finalJson['missedTimes'].append(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))
                    dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, random.randint(0,1),reason,False,finalJson)
        else:
            finalJson = json.loads(user[13])
            finalJson['missedTimes'].append(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))
            dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, -1,reason,False,finalJson)

    # get game users
    gameUsers = dbs_worker.get_live_game_users(dbs_worker.set_up_connection(), user[2])
    # check if you are the only one unfocused
    unfocused = 0
    for gameUser in gameUsers:
        if gameUser[4] == False:
            unfocused += 1
    if unfocused == 1:
        if user[4] == False:
            dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, -1,reason,True)

    # check if disctracted more than 150 times in the last 3 minutes
    finalJson = json.loads(user[13])
    missedTimes = finalJson['missedTimes']
    missedTimes = [datetime.datetime.strptime(x, '%Y-%m-%d %H:%M:%S.%f') for x in missedTimes]
    missedTimes = [x for x in missedTimes if x > datetime.datetime.now() - datetime.timedelta(minutes=9)]
    if len(missedTimes) > 55*9:
        dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, 1,reason,True)
    finalJson = json.loads(user[13])
    missedTimes = finalJson['missedTimes']
    missedTimes = [datetime.datetime.strptime(x, '%Y-%m-%d %H:%M:%S.%f') for x in missedTimes]
    missedTimes = [x for x in missedTimes if x > datetime.datetime.now() - datetime.timedelta(minutes=3)]
    if len(missedTimes) > 55*3:
        dbs_worker.update_user_score(dbs_worker.set_up_connection(), user_id, -1,reason,True)
    # Now you have a list of MediaPipe Image objects
    # You can process these images using MediaPipe's tools

    return jsonify({'message': 'MediaPipe Images processed successfully'})




# @app.route('/api/getActiveGames', methods=['GET'])
# def get_active_games():
#     # get the active games
#     games = dbs_worker.get_active_games(conn)
#     return jsonify(games)


@app.route('/api/createGame', methods=['POST'])
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
    
    userData = dbs_worker.get_user_by_id(dbs_worker.set_up_connection(),userId)
    if userData[3] >= userData[11]:
        powerUpAvailable = random.choice(powerUps)
        powerUpTime = powerUpTiming[powerUps.index(powerUpAvailable)]
        if userData[11] in powerUpLine:
            nextPowerUp = powerUpLine[powerUpLine.index(userData[11])+1]
        else:
            nextPowerUp = userData[11] + 300
        dbs_worker.update_user_power_up(dbs_worker.set_up_connection(),userId,powerUpAvailable,False,powerUpTime,nextPowerUp)
    return jsonify({"gameUsers":gameUsers,"score":score,"userData":userData})



# catch errors
@app.errorhandler(400)
def server_error(e):
    print(e)
    return jsonify({'error': 'bad request'}), 400


if __name__ == "__main__":
    app.run(port=5003, debug=True)