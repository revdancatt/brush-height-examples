# Brush Height Files

These are the files I used to test the brush height settings on the AxiDraw/NextDraw drawing machine. They are pretty rough and have NO error checking in, they're basically minimum viable versions.

These file accompany the YouTube video that explains all this which you can find over here: https://youtu.be/M0IY-hGBXUo - you should watch that for all of this to make any sense.

This is what we have.

## sine-test-python.py

This is a a bare bones file that draws a sine wave along the length of a landscape A4 sheet of paper, by setting both the pen up and pen down position to the same value and toggling between pen up and pen down state.

## brush-server.py

This is roughly the same code but turned into a little web server using Flask. Flask needs Python 3.8 and newer to run, install with `pip install Flask`. See: https://flask.palletsprojects.com/en/3.0.x/installation/ for details.

When this brush server is up and running call it with the url `/move?x=0&y=0&z=100` where x,y are the position in mm, and z is value between 0 and 100, 0 is all the way down, 100 is all the way up. Generally you only need values around 50-80, with 100 being "pen up" for moving around.

## sine-test-node.js

This is our node implementation of the sine wave, but it calls the brush server instead of talking to the plotter directly

## image_plot_lines.js

This reads in the `image.png` file, and draws straight lines pulling the height date from the brightness of the image.

**NOTE**, an A4 page is 297 x 210 mm, the image is 297 x 210 pixels. This is so we can do direct mapping between the x,y location in mm of the plot and the pixel values we are pulling. In a perfect world we'd handle any size of image and map between x,y and pixels based on percent. But for this test this made things easier.

## image_plot_circles.js

The same as above, but we randomly pick a centre point of a circle.

## spiral.js

A quick spiral plot that isn't in the video but I did as a test shortly afterwards, people seemed to like it do it's here.