from flask import Flask, request, jsonify
from pyaxidraw import axidraw

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False
ad = axidraw.AxiDraw()          # Initialize class
ad.interactive()                # Enter interactive context
ad.options.units = 2            # work in millimeters
# ad.options.penlift = 3          # Uncomment if we are using the brushless servo

ad.options.speed_pendown = 20
ad.options.speed_penup = 20
ad.options.pen_rate_lower = 100
ad.options.pen_rate_upper = 100
currentPosition = 'up'          # start in the up position

if not ad.connect():            # Open serial port to AxiDraw;
    quit()                      #   Exit, if no connection.

def move(x, y, z):
    global currentPosition
    ad.options.pen_pos_down = z
    ad.options.pen_pos_up = z
    ad.update()
    if currentPosition == 'down':
        ad.penup()
        currentPosition = 'up'
    else:
        ad.pendown()
        currentPosition = 'down'
    ad.goto(x, y)

@app.route('/move', methods=['GET'])
def move_endpoint():
    try:
        x = float(request.args.get('x'))
        y = float(request.args.get('y'))
        z = float(request.args.get('z'))
        move(x, y, z)
        return jsonify({"status": "success", "x": x, "y": y, "z": z})
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "Invalid parameters"}), 400

@app.route('/disconnect', methods=['GET'])
def disconnect():
    ad.disconnect()
    return jsonify({"status": "disconnected"})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=4777)