from flask import Flask, request,render_template,redirect
import pymongo
from flask import jsonify
from bson import ObjectId
import os
from dotenv import load_dotenv

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # For session management

# Load variables from .env file
load_dotenv()

# Get the URI from environment
mongodb_uri = os.getenv("MONGODB_URL")

# Connect
db = pymongo.MongoClient(mongodb_uri)

my_db = db["my_task"]
create_task = my_db["create_task"]


@app.route('/')
def home():
    return render_template("index.html")


@app.route('/create-task', methods=['POST'])
def add_task():
    try:
        if request.method == 'POST':
            task_name = request.form["task"]   
            task_desc = request.form["task_desc"]
            task_priority = request.form["task_priority"].upper()  
            task_status = request.form["task_status"].upper()

            data = {
                "task_name": task_name,
                "task_desc": task_desc,
                "task_priority": task_priority,
                "task_status": task_status
            }

            create_task.insert_one(data)
            return jsonify({"status": "success", "message": "Task created successfully!!!"})
    except Exception as e:
        return jsonify({"error": "failed", "message": str(e)})


@app.route('/show-task', methods=["GET"])
def show_task():
    try:
        tasks = list(create_task.find({}))
        formatted_tasks = []
        
        for idx, task in enumerate(tasks, start=1):
            formatted_tasks.append({
                "sr_no": idx,                               
                "task_name": task.get("task_name", ""),   
                "task_desc": task.get("task_desc", ""),
                "task_priority": task.get("task_priority", ""),
                "task_status": task.get("task_status", ""),
                "_id": str(task["_id"])               
            })
        
        return jsonify({"status": "success", "data": formatted_tasks})
    except Exception as e:
        return jsonify({"error": "failed", "message": str(e)})




@app.route('/edit-task/<task_id>', methods=['GET', 'POST'])
def update_task(task_id):
    try:
        task_name = request.form.get("task_name")
        task_desc = request.form.get("task_desc")
        task_priority = request.form.get("task_priority")
        task_status = request.form.get("task_status")
        
        update_data = {}
        if task_name:
            update_data["task_name"] = task_name
        if task_desc:
            update_data["task_desc"] = task_desc
        if task_priority:
            update_data["task_priority"] = task_priority
        if task_status:
            update_data["task_status"] = task_status
        
        if not update_data:
            return jsonify({"error":"failed","message":"No field updated"}), 400
        
        # Convert task_id to ObjectId
        try:
            task_obj_id = ObjectId(task_id)
        except Exception:
            return jsonify({"error":"failed","message":"Invalid task ID"}), 400

        result = create_task.update_one(
            {"_id": task_obj_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error":"failed", "message":"Task not found"}), 404
        
        return jsonify({"status":"success","message":"Task updated Successfully!!!"})
    
    except Exception as e:
        return jsonify({"error":"failed","message":str(e)})
    

@app.route('/delete-task/<task_id>', methods=['DELETE'])
def task_delete(task_id):
    try:
        # Convert task_id to ObjectId
        try:
            task_obj_id = ObjectId(task_id)
        except Exception:
            return jsonify({"error": "failed", "message": "Invalid task ID"}), 400

        result = create_task.delete_one({"_id": task_obj_id})

        if result.deleted_count == 0:
            return jsonify({"error": "failed", "message": "Task not found"}), 404

        return jsonify({"status": "success", "message": "Task deleted successfully!"})

    except Exception as e:
        return jsonify({"error": "failed", "message": str(e)})


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5002)