from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Dữ liệu thuốc lưu tạm thời
medications = [
    {
        "id": 1,
        "name": "Paracetamol",
        "dose": "1 viên",
        "time": "08:00",
        "note": "Uống sau ăn"
    },
    {
        "id": 2,
        "name": "Vitamin C",
        "dose": "1 viên",
        "time": "12:00",
        "note": "Sáng uống"
    }
]

# API: Lấy danh sách thuốc
@app.route('/api/medications', methods=['GET'])
def get_medications():
    return jsonify(medications)

# API: Thêm thuốc mới
@app.route('/api/medications', methods=['POST'])
def add_medication():
    data = request.json
    new_med = {
        "id": len(medications) + 1,
        "name": data.get("name", ""),
        "dose": data.get("dose", ""),
        "time": data.get("time", ""),
        "note": data.get("note", "")
    }
    medications.append(new_med)
    return jsonify(new_med), 201

# API: Cập nhật thuốc
@app.route('/api/medications/<int:med_id>', methods=['PUT'])
def update_medication(med_id):
    data = request.json
    for med in medications:
        if med['id'] == med_id:
            med.update({
                "name": data.get("name", med["name"]),
                "dose": data.get("dose", med["dose"]),
                "time": data.get("time", med["time"]),
                "note": data.get("note", med["note"]),
            })
            return jsonify(med)
    return jsonify({"error": "Không tìm thấy thuốc"}), 404

# API: Xoá thuốc
@app.route('/api/medications/<int:med_id>', methods=['DELETE'])
def delete_medication(med_id):
    global medications
    medications = [med for med in medications if med['id'] != med_id]
    return jsonify({"message": "Đã xoá"}), 200

if __name__ == '__main__':
    app.run(debug=True)
