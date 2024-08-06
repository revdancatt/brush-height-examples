// https://www.amazon.co.uk/Pentel-Colour-Brush-Black-Blister/dp/B00FXQNVT8
import fetch from 'node-fetch'
import { createCanvas, loadImage } from '@napi-rs/canvas'
const pageSize = {
  w: 297,
  h: 210
}
const lowBrush = 40
const highBrush = 80
const brushServer = 'http://127.0.0.1:4777'
const border = 15
const xStep = 1
const yStep = 6

const main = async () => {
  const canvas = createCanvas(pageSize.w, pageSize.h)
  const ctx = canvas.getContext('2d')
  // Load in image.png
  const image = await loadImage('image.png')
  ctx.drawImage(image, 0, 0, pageSize.w, pageSize.h)
  // grab all the data from the image
  const imageData = ctx.getImageData(0, 0, pageSize.w, pageSize.h)
  const data = imageData.data

  const xValues = []
  const yValues = []
  for (let x = border; x < pageSize.w - border; x += xStep) xValues.push(x)
  for (let y = border + yStep; y < pageSize.h - border; y += yStep) yValues.push(y)

  for (const y of yValues) {
    // We are going to call the brushServer with an await to move it into that postion using axios
    const currentZ = 100
    const fullUrl = `${brushServer}/move?x=${border}&y=${y}&z=${currentZ}`
    await fetch(fullUrl)
    for (const x of xValues) {
      const index = (y * pageSize.w + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const avg = (r + g + b) / 3
      const zValue = lowBrush + (highBrush - lowBrush) * (avg / 255)
      const fullUrl = `${brushServer}/move?x=${x}&y=${y}&z=${zValue}`
      console.log(fullUrl)
      await fetch(fullUrl)
    }
  }
  await fetch(`${brushServer}/move?x=0&y=0&z=100`)
}

main()
