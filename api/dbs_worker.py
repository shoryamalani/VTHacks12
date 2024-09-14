
import os
# get all the sqlite
import sqlite3
from dotenv import load_dotenv
import loguru
load_dotenv()
import pypika

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
            released DATE
            active DATE
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


def get_db_version(conn):
    command = "SELECT version FROM system WHERE id = 1"
    cur = conn.cursor()
    cur.execute(command)
    version = cur.fetchone()

    return version[0]

def set_db_version(conn, version):

    command = "UPDATE system SET version = ? WHERE id = 1"
    cur = conn.cursor()
    cur.execute(command, (version,))
    conn.commit()
    return conn





def db_init():
    conn = set_up_connection()
    print(get_db_version(conn))