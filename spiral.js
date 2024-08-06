import fetch from 'node-fetch'
import fs from 'fs'

const lowBrush = 20
const highBrush = 50
const brushServer = 'http://127.0.0.1:4777'
const saveSvg = false

const paperSize = {
  width: 210,
  height: 297
}
const border = 15

const main = async () => {
  // The middle is the middle of the page (of course)
  // Add offsets here if you want to move the spiral up and down :)
  const middleX = paperSize.width / 2
  const middleY = paperSize.height / 2
  // Each time we loop around the spiral, we increase the radius by this amount (roughly)
  let radiusIncrease = 6
  // We don't want the innerRadius to start in the middle as that's a bit weird for the brush
  const innerRadius = 6
  // The outerRadius is the distance from the middle to the edge of the paper
  const outerRadius = paperSize.width / 2 - border
  // The number of times we loop around the spiral
  const timesRound = Math.floor(outerRadius / radiusIncrease)
  // The actual radiusIncrease is the outerRadius divided by the number of times we loop around the spiral
  radiusIncrease = outerRadius / timesRound

  // We are going to work with degree angles, and there's 360 in a full rotation, so the total
  // number of angles we are going to have to rotate around to complete the timesAround is...
  const totalAngles = timesRound * 360
  // A running total of how far we've rotated around the spiral so far
  let angleCount = 0
  // When we go around a spiral we want to move more degrees on the inner circles and less on the outer,
  // this is because we don't need so many lines on the inner circle to make it look like a circle, and
  // having the same number of points around the circle when it's that small is weird so
  const innerDegrees = 3
  const outerDegrees = 0.5

  // Change this to change the wavelength of the sine wave
  const sinWaveMod = 10

  // This is going to keep hold of all of our points so we can turn it into an SVG if needed
  const line = []

  // Now we are going to have a while loop that handles making the spiral until we've gone around the spiral
  // the number of times we want to
  while (angleCount < totalAngles) {
    // Work out the percent way we are through the whole thing
    const percent = angleCount / totalAngles
    // Work out the radius of the current circle
    const radius = innerRadius + (outerRadius - innerRadius) * percent
    // Work out the x and y of the current circle
    const angleInRadians = angleCount * (Math.PI / 180)
    const x = middleX + radius * Math.cos(angleInRadians)
    const y = middleY + radius * Math.sin(angleInRadians)
    const z = lowBrush + (highBrush - lowBrush) * ((Math.sin(angleCount / sinWaveMod) + 1) / 2)

    // Add the point to the line
    line.push({ x, y, z })
    // Work out the amount we should increase the angle by
    const angleIncrease = innerDegrees + (outerDegrees - innerDegrees) * percent
    // Add the angleIncrease to the angleCount
    angleCount += angleIncrease
  }

  // Grab the first point
  const p0 = line[0]

  // Now we are goingt to create the SVG
  // (quick and dirty way to create an SVG, we won't see the pen height change, but we can see the path)
  if (saveSvg) {
    let output = `<?xml version="1.0" standalone="no" ?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" 
    "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="lines" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0" y="0"
    viewBox="0 0 ${paperSize.width} ${paperSize.height}"
    width="${paperSize.width}mm"
    height="${paperSize.height}mm" 
    xml:space="preserve">
    <g>
    `
    // Loop through the line array and add the points to the SVG
    output += '<path d="'
    output += `M${p0.x.toFixed(3)},${p0.y.toFixed(3)} `
    for (let i = 1; i < line.length; i++) {
      const p = line[i]
      output += `${p.x.toFixed(3)},${p.y.toFixed(3)} `
    }
    output += '" stroke="black" stroke-width="0.1" fill="none" />'
    output += '</g></svg>'
    fs.writeFileSync('spiral.svg', output, 'utf8')
  }

  // NOTE: In the following code we're flipping the x and y position because we've been working in
  // portrait mode, but the plotter is landscape, so we need to flip them around. Sorry for
  // any confusion.

  // Now we're going to draw the actual thing, move to the first point
  await fetch(`${brushServer}/move?x=${p0.y.toFixed(3)}&y=${p0.x.toFixed(3)}&z=100`)

  // Now draw the rest of the points
  for (let i = 1; i < line.length; i++) {
    const p = line[i]
    await fetch(`${brushServer}/move?x=${p.y.toFixed(3)}&y=${p.x.toFixed(3)}&z=${p.z}`)
  }

  // Move back to the home corner
  await fetch(`${brushServer}/move?x=0&y=0&z=100`)
}

main()
