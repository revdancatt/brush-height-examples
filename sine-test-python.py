from pyaxidraw import axidraw
import time
import math
ad = axidraw.AxiDraw()          # Initialize class

ad.interactive()                # Enter interactive context
ad.options.units = 2            # work in millimeters
# ad.options.penlift = 3          # Uncomment if we are using the brushless servo

ad.options.speed_pendown = 20
ad.options.speed_penup = 20
ad.options.pen_rate_lower = 100
ad.options.pen_rate_upper = 100

if not ad.connect():            # Open serial port to AxiDraw;
    quit()                      #   Exit, if no connection.

currentPosition = 'up'          # start in the up position

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

# Designed for A4 paper size, we are working in millimeters
# A4 is 297mm x 210mm
y = 105
startX = 30
endX = 257

move(startX, y, 100)

for x in range(startX, endX + 1):
    z = 50 + 30 * math.sin(x / 5)
    move(x, y, z)

move (endX, y, 100)
time.sleep(.333)

move(0, 0, 100)
ad.disconnect()
