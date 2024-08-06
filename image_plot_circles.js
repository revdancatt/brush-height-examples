import fetch from 'node-fetch'
import { createCanvas, loadImage } from '@napi-rs/canvas'

// A4 size in mm
const pageSize = {
  w: 297,
  h: 210
}
// Brush height values
const lowBrush = 50
const highBrush = 83
// Brush server
const brushServer = 'http://127.0.0.1:4777'
// Border size
const border = 15
// The step size for the radius in mm
const rStep = 4.5

const main = async () => {
  const canvas = createCanvas(pageSize.w, pageSize.h)
  const ctx = canvas.getContext('2d')
  // Load in image.png
  // NOTE: We are assuming the image is the same size as the page size!!!!
  // Normally we'd do this in a more sane way, but this is just a quick and dirty example
  const image = await loadImage('image.png')
  ctx.drawImage(image, 0, 0, pageSize.w, pageSize.h)
  // grab all the data from the image
  const imageData = ctx.getImageData(0, 0, pageSize.w, pageSize.h)
  const data = imageData.data

  // Create an array of radius values (for reasons)
  const rValues = []
  for (let r = rStep; r < pageSize.w; r += rStep) rValues.push(r)

  // Randomly pick a centre point, away from the edges
  const x = Math.random() * (pageSize.w - border * 4) + border * 2
  const y = Math.random() * (pageSize.h - border * 4) + border * 2

  for (const r of rValues) {
    // Work out the circumfrence of the circle
    const circumfrence = 2 * Math.PI * r
    // Work out the number of steps to take
    const steps = Math.floor(circumfrence / 1)
    const angleStep = 360 / steps
    // Grab a random start angle from 0 to 360, so we don't always start at the same point
    const startAngle = Math.random() * 360

    // Start us as out of bounds
    // Out of bounds means we're not on the page, so we need to move the brush up. We keep track
    // of this so we can just skip the move to the new position if we're still out of bounds, and
    // only start again when we move back in bounds.
    let outOfBounds = true

    // Create an array of angles to move to
    const angleValues = []
    for (let angle = startAngle; angle < startAngle + 360; angle += angleStep) angleValues.push(angle)

    // Loop through each angle
    for (const angle of angleValues) {
      // Grab the new X,Y position
      const newX = x + r * Math.cos(angle * (Math.PI / 180))
      const newY = y + r * Math.sin(angle * (Math.PI / 180))

      // If the new X,Y position is within the bounds of the page area we want to plot
      if (newX >= border && newX <= pageSize.w - border && newY >= border && newY <= pageSize.h - border) {
        // set the pen up
        let z = 100
        // If we weren't out of bounds last time grab the z value from the image
        if (outOfBounds === false) {
          const index = (Math.floor(newY) * pageSize.w + Math.floor(newX)) * 4
          const r = data[index]
          const g = data[index + 1]
          const b = data[index + 2]
          const avg = (r + g + b) / 3
          z = lowBrush + (highBrush - lowBrush) * (avg / 255)
        }
        // "move" to the new position. If we were out of bounds last time this'll move there
        // with the brush up. Otherwise it'll move there at the new z height from the image
        const fullUrl = `${brushServer}/move?x=${newX}&y=${newY}&z=${z}`
        console.log(fullUrl)
        await fetch(fullUrl)
        // Say that we aren't out of bounds.
        outOfBounds = false
      } else {
      // If last time we weren't out of bounds then move the brush up and move to the new x,y position
        if (outOfBounds === false) {
          const fullUrl = `${brushServer}/move?x=${newX}&y=${newY}&z=100`
          console.log(fullUrl)
          await fetch(fullUrl)
        }
        outOfBounds = true
      }
    }
  }
  await fetch(`${brushServer}/move?x=0&y=0&z=100`)
}

main()
