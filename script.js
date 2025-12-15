# main_server.py 파일 내용 (Flask 최종 완성본 V10 - 경로/DB/렌더링 오류 통합 해결)

#----------------------------------------------------
# 1. 필수 라이브러리 임포트 및 경로 설정
#----------------------------------------------------
import sys
import sqlite3
import threading 
import time
import os
from datetime import datetime
from flask import Flask, jsonify, send_file # send_file 사용
from flask_cors import CORS 

# 현재 실행 파일의 디렉토리를 BASE_DIR로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 

# 🚨 작업 디렉토리를 BASE_DIR (kiwoom 폴더)로 강제 이동 (경로 오류 방지)
os.chdir(BASE_DIR)

# 파일 절대 경로 정의
DB_PATH = os.path.join(BASE_DIR, 'kiwoom_db.db') 
INDEX_HTML_PATH = os.path.join(BASE_DIR, 'templates', 'index.html') 
SCRIPT_JS_PATH = os.path.join(BASE_DIR, 'static', 'script.js') 

# ----------------------------------------------------
# 2. Flask 앱 초기화 및 API 정의 
# ----------------------------------------------------
app = Flask(__name__) 
CORS(app) 

# 루트 경로 ("/") 접근 시 index.html 파일을 강제로 전송합니다.
@app.route('/') 
def index():
    try:
        # Jinja2 렌더링 오류를 우회하기 위해 send_file 사용
        return send_file(INDEX_HTML_PATH) 
    except FileNotFoundError:
        return "CRITICAL ERROR: index.html 파일을 찾을 수 없습니다. 파일 경로 최종 확인 필요.", 500

# script.js 파일을 직접 전송하는 경로
@app.route('/static/script.js')
def serve_script():
    try:
        return send_file(SCRIPT_JS_PATH, mimetype='text/javascript')
    except FileNotFoundError:
        return "CRITICAL ERROR: script.js 파일을 찾을 수 없습니다.", 500

def get_stock_data_from_db():
    # DB에서 데이터를 읽어오는 함수 (DB_PATH 절대 경로 사용)
    conn = sqlite3.connect(DB_PATH) 
    cursor = conn.cursor()
    cursor.execute("SELECT stock_code, current_price, purchase_price, stop_loss_price, update_time FROM web_data")
    columns = [col[0] for col in cursor.description]
    data = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return data

@app.route('/api/data', methods=['GET'])
def api_data():
    # 주식 데이터를 JSON 형태로 제공하는 API 엔드포인트
    try:
        stock_data = get_stock_data_from_db()
        return jsonify({
            "status": "success",
            "timestamp": time.time(),
            "data": stock_data
        })
    except Exception as e:
        print(f"DB 데이터 로드 오류: {e}")
        return jsonify({"status": "error", "message": f"DB 데이터 로드 오류: {e}"}), 500

def run_flask():
    print("🌐 Flask 서버 시작 중... (http://127.0.0.1:5000)")
    app.run(host='0.0.0.0', port=5000, debug=False)

# ----------------------------------------------------
# 3. 서버 통합 실행 구문
# ----------------------------------------------------
if __name__ == "__main__":
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n서버가 종료됩니다.")
        sys.exit(0)
