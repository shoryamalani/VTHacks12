import time
from flask import Flask, jsonify, request , redirect, url_for, request, session
import dbs_worker
import os
import json
import loguru
app = Flask(__name__, static_folder='../build', static_url_path='/')
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


# catch errors
@app.errorhandler(400)
def server_error(e):
    print(e)
    return jsonify({'error': 'bad request'}), 400
if __name__ == "__main__":
    app.run(port=5003, debug=True)