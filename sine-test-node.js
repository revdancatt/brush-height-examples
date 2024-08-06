// You'll need node installed to run this, install with `npm install node-fetch`
import fetch from 'node-fetch'

const lowBrush = 20
const highBrush = 50
const brushServer = 'http://127.0.0.1:4777'

// We are working in millimeters
// A4 is 297mm x 210mm
const border = 15

const main = async () => {
  const y = 105
  const startX = border
  const endX = 297 - border

  // Move to the start position with the pen up
  await fetch(`${brushServer}/move?x=${startX}&y=${y}&z=100`)
  // Move from the start to end position with x being a function of the sine wave
  for (let x = startX; x <= endX; x++) {
    const z = lowBrush + (highBrush - lowBrush) * ((Math.sin(x / 10) + 1) / 2)
    await fetch(`${brushServer}/move?x=${x}&y=${y}&z=${z}`)
  }
  // Move back home with the pen up
  await fetch(`${brushServer}/move?x=0&y=0&z=100`)
}

main()
