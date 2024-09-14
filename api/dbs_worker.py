
import os
# get all the sqlite
import sqlite3
from dotenv import load_dotenv
import loguru
load_dotenv()
import pypika
import random

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
            id SERIAL PRIMARY KEY,
            version INTEGER
        )
        """
    )
    # create the games table
    cur.execute(
        """
        CREATE TABLE games (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            curScore INTEGER,
            created DATE
            active DATE
        )
        """
    )

    cur.create(
    """
    CREATE TABLE players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        score INTEGER
        liveFocused BOOLEAN
        reason VARCHAR(255)
    )
    """
    )

    cur.create(
    """
    CREATE TABLE rooms (
        id SERIAL PRIMARY KEY,
        joinCode VARCHAR(255),
        name VARCHAR(255),
        active BOOLEAN
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

def get_game_by_join_code(conn, join_code):
    command = "SELECT * FROM games WHERE joinCode = ?"
    cur = conn.cursor()
    cur.execute(command, (join_code,))
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
    return games


def create_game(conn, user_id):
    command = "INSERT INTO games (name, curScore, created, active) VALUES (?, 0, ?, 1)"
    cur = conn.cursor()
    curGameId = random.randint(1000, 9999)
    while get_active_game(conn, curGameId):
        curGameId = random.randint(1000, 9999)
    
    cur.execute(command, (curGameId, ))
    conn.commit()
    return get_game(conn, cur.lastrowid)

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
    return users

def update_user_score(conn, user_id, score,reason):
    command = "UPDATE players SET score = score + ? WHERE id = ?"
    cur = conn.cursor()
    cur.execute(command, (score, user_id))
    command = "UPDATE players SET reason = ? WHERE id = ?"
    cur = conn.cursor()
    cur.execute(command, (reason, user_id))
    conn.commit()
    return conn

def create_user(conn, game_id):
    command = "INSERT INTO players (name, score, liveFocused, reason) VALUES (?, 0, 0, '')"
    cur = conn.cursor()
    cur.execute(command, (game_id,))
    conn.commit()
    return get_user_by_id(conn, cur.lastrowid)

def db_init():
    conn = set_up_connection()
    print(get_db_version(conn))