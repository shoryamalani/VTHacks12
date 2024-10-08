
import os
# get all the sqlite
import sqlite3
from dotenv import load_dotenv
import loguru
load_dotenv()
import pypika
import random
import datetime
import json

def set_up_connection():
    # Path to .env file
    # Get the environment variables
    DB_PATH = os.getenv('DB_PATH')
    # check if the file exists
    if not os.path.exists(DB_PATH):
        print("Database file does not exist")
        # create the file
        create_db(DB_PATH)
    # open sqlite file
    conn = sqlite3.connect(DB_PATH)


    return conn


def create_db(DB_PATH):
    loguru.logger.info("Creating database")
    # create the file
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # create the system table
    cur.execute(
        """
        CREATE TABLE system (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version INTEGER
        )
        """
    )
    # create the games table
    cur.execute(
        """
        CREATE TABLE games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255),
            curScore INTEGER,
            created DATE,
            active BOOLEAN,
            lastUpdated DATE
        )
        """
    )

    cur.execute(
    """
    CREATE TABLE players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id VARCHAR(255),
        name VARCHAR(255),
        score INTEGER,
        liveFocused BOOLEAN,
        reason VARCHAR(255),
        lastUpdated DATE,
        active BOOLEAN,
        powerUp VARCHAR(255),
        isPowerUpActive BOOLEAN,
        powerUpExpiry DATE,
        nextPowerUpVal INTEGER,
        activeDebuff VARCHAR(255),
        previousFocusAmounts json
    )
    """
    )


    # create the version as 0
    cur.execute("INSERT INTO system (id, version) VALUES (1, 0)")
    # commit the changes
    conn.commit()
    # close the connection
    conn.close()
    # set the version to 1
    conn = set_up_connection()
    set_db_version(conn, 1)
    return conn


def get_game(conn, game_id):
    command = "SELECT * FROM games WHERE id = ?"
    cur = conn.cursor()
    cur.execute(command, (game_id,))
    game = cur.fetchone()
    return game

def get_game_by_name(conn, game_name):
    command = "SELECT * FROM games WHERE name = ?"
    cur = conn.cursor()
    cur.execute(command, (game_name,))
    game = cur.fetchone()
    return game



def get_db_version(conn):
    command = "SELECT version FROM system WHERE id = 1"
    cur = conn.cursor()
    cur.execute(command)
    version = cur.fetchone()

    return version[0]

def get_active_games(conn):
    command = "SELECT * FROM games WHERE active = 1"
    cur = conn.cursor()
    cur.execute(command)
    games = cur.fetchall()
    final_games = []
    for game in games:
        if len(get_live_game_users(conn, game[1])):
            final_games.append(game)
        else:
            command = "UPDATE games SET active = 0 WHERE id = ?"
            cur = conn.cursor()
            cur.execute(command, (game[0],))
            conn.commit()
    return final_games




def create_game(conn):
    cur = conn.cursor()
    #random 5 letter letters and numbers
    randomName = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=5)).upper()
    while get_active_game(conn, randomName):
        randomName = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=5)).upper()
    
    command = f"INSERT INTO games (name, curScore, created, active) VALUES ('{randomName}', 0, datetime('now'), 1)"
    print(randomName)
    cur.execute(command)
    conn.commit()
    print(get_game_by_name(conn, randomName))
    return get_game_by_name(conn, randomName)

def get_active_game(conn, game_id):
    command = "SELECT * FROM games WHERE id = ? AND active = 1"
    cur = conn.cursor()
    cur.execute(command, (game_id,))
    game = cur.fetchone()
    return game

def set_db_version(conn, version):

    command = "UPDATE system SET version = ? WHERE id = 1"
    cur = conn.cursor()
    cur.execute(command, (version,))
    conn.commit()
    return conn

def get_user_by_id(conn, user_id):
    command = "SELECT * FROM players WHERE id = ?"
    cur = conn.cursor()
    cur.execute(command, (user_id,))
    user = cur.fetchone()
    return user

def get_game_users(conn, game_id):
    command = "SELECT * FROM players WHERE game_id = ?"
    cur = conn.cursor()
    cur.execute(command, (game_id,))
    users = cur.fetchall()
    # loguru.logger.info(f"Game users: {users}")
    return users

def get_live_game_users(conn, game_id):
    command = "SELECT * FROM players WHERE game_id = ? AND active = 1"
    cur = conn.cursor()
    cur.execute(command, (game_id,))
    users = cur.fetchall()
    loguru.logger.info(f"Game users: {users}")
    # if user has not been updated in the last 30 seconds, set active to false
    for user in users:
        # user[6] is a date object convert it to seconds since last update
        seconds = abs((datetime.datetime.strptime(user[6], '%Y-%m-%d %H:%M:%S') - datetime.datetime.utcnow() ).total_seconds())
        loguru.logger.error(f"User {user[0]} last updated {user[6]}")
        loguru.logger.error(f"User {user[0]} last updated {seconds} seconds ago clocking in at {(datetime.datetime.strptime(user[6], '%Y-%m-%d %H:%M:%S') )}")
        if seconds > 30:
            command = "UPDATE players SET active = 0 WHERE id = ?"
            cur = conn.cursor()
            cur.execute(command, (user[0],))
            conn.commit()
    return users

def update_user_score(conn, user_id, score,reason,liveFocused,previousFocusAmounts=None):
    command = "UPDATE players SET score = score + ? WHERE id = ?"
    cur = conn.cursor()
    cur.execute(command, (score, user_id))
    command = "UPDATE players SET reason = ? WHERE id = ?"
    cur = conn.cursor()
    cur.execute(command, (reason, user_id))
    # set last updated
    command = "UPDATE players SET lastUpdated = datetime('now') WHERE id = ?"
    cur = conn.cursor()
    cur.execute(command, (user_id,))
    # set active
    command = "UPDATE players SET liveFocused = ? WHERE id = ?"
    cur = conn.cursor()
    cur.execute(command, (liveFocused, user_id))
    conn.commit()
    if previousFocusAmounts != None:
        command = "UPDATE players SET previousFocusAmounts = ? WHERE id = ?"
        cur = conn.cursor()
        cur.execute(command, (json.dumps(previousFocusAmounts), user_id))
        conn.commit()
    return conn

def create_user(conn, game_id):
    command = "INSERT INTO players (name, score, liveFocused, reason,lastUpdated,game_id,active,nextPowerUpVal,previousFocusAmounts ) VALUES (?, 0, 0, '', datetime('now'),?,1,1,?)"
    cur = conn.cursor()
    randomAdjective = ['Happy', 'Sad', 'Angry', 'Excited', 'Bored', 'Tired', 'Sleepy', 'Hungry', 'Thirsty']
    randomNoun = ['Dog', 'Cat', 'Bird', 'Fish', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Monkey', 'Giraffe']
    randomName = random.choice(randomAdjective) + ' ' + random.choice(randomNoun)
    cur.execute(command, (randomName,game_id,json.dumps({"missedTimes":[],"failRow":0})))
    loguru.logger.info(f"Created user {randomName}")
    conn.commit()
    cur.execute("SELECT last_insert_rowid()")
    user_id = cur.fetchone()[0]
    loguru.logger.warning(f"User { user_id} created")

    conn.close()
    # loguru.logger.info(f"User {get_user_by_id(set_up_connection(), cur.lastrowid +1)} created")
    return get_user_by_id(set_up_connection(), user_id)

def update_user_power_up(conn, user_id, powerUpAvailable, powerUpActive, powerUpExpiry, nextPowerUpVal):
    command = "UPDATE players SET powerUp = ?, isPowerUpActive = ?, nextPowerUpVal = ? WHERE id = ?"
    cur = conn.cursor()
    cur.execute(command, (powerUpAvailable, powerUpActive, nextPowerUpVal, user_id))
    if powerUpActive:
        command = "UPDATE players SET powerUpExpiry = ? WHERE id = ?"
        cur = conn.cursor()
        finalTime = datetime.datetime.now() + datetime.timedelta(seconds=powerUpExpiry) 
        cur.execute(command, (finalTime, user_id))
    conn.commit()
    return conn

def db_init():
    conn = set_up_connection()
    print(get_db_version(conn))