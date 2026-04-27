from flask import Flask, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "service": "Orvion AI Studio",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

@app.route("/ping")
def ping():
    return jsonify({"pong": True, "timestamp": datetime.utcnow().isoformat() + "Z"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
