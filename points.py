from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
from flask_cors import CORS
import time
from joblib import Parallel, delayed
import csv
import os
import math
app = Flask(__name__)
CORS(app)

def create_ball_position_points(initialVelocity, initialPositionX, initialPositionY, i, interval, angle, gravity):
    alpha = angle * (math.pi / 180)  # Converting degrees to radians
    Vy0 = initialVelocity * math.sin(alpha)

    t = i*interval
    y = initialPositionY + Vy0 * t - 0.5 * gravity * t**2
    if y < 0.032:
        y = 0.032
    point = {"x": (initialVelocity*t)+initialPositionX, "y": y, "time": t}
    
    return point
    
@app.route("/")
def home():
    return "hi"
@app.route("/index")

@app.route('/points', methods=['GET', 'POST'])
def point():
   message = None
   if request.method == 'POST':    
        data = request.json
        print(data)
        alpha = data["angle"] * (math.pi / 180) # Converting degrees to radians
        flightTime = (data["initialVelocity"] * math.sin(alpha) + math.sqrt((data["initialVelocity"] * math.sin(alpha))**2 + 2 * data["gravity"] * data["initialPositionY"])) / data["gravity"]
        intervalLength = flightTime/(60*40);
        
        points=[]
        t = time.time()
        for i in range(60*40):
            points.append(create_ball_position_points(data["initialVelocity"], data["initialPositionX"], data["initialPositionY"], i,intervalLength, data["angle"], data["gravity"]))
            if points[i]["y"] == 0.032:
                break
        print("sequential time: " + str(time.time() - t))  
        
        # t = time.time()
        # points = Parallel(n_jobs=-1, backend='loky')(
                        # delayed(create_ball_position_points)(data["initialVelocity"], data["initialPositionX"], data["initialPositionY"], i,intervalLength, data["angle"])
                        # for i in range(60**4))
        # #print(points)
        # print("parallel time: " + str(time.time() - t))
        # print(flightTime)
        # print(intervalLength)
         
        filename = "points.csv"
        keys = points[0].keys()

        with open(filename, 'w', newline='') as output_file:
            dict_writer = csv.DictWriter(output_file, keys)
            dict_writer.writerows(points)
        return points

if __name__ == "__main__":
    app.run(debug = True)
