const CENTER = 50
const ANGLES = [
  -Math.PI / 2, // Top – Soft
  Math.PI / 6, // Bottom right – Hard
  (5 * Math.PI) / 6 // Bottom left – Engagement
] as const

type RadarValues = [number, number, number]

const polarToCartesian = (angle: number, radius: number): { x: number; y: number } => ({
  x: CENTER + radius * Math.cos(angle),
  y: CENTER + radius * Math.sin(angle)
})

const getRadarTrianglePoints = (
  soft: number,
  hard: number,
  engagement: number,
  size: number
): string => {
  const values: RadarValues = [soft, hard, engagement]

  return values
    .map((value, i) => {
      const radius = (value / 100) * size
      const { x, y } = polarToCartesian(ANGLES[i], radius)
      return `${x},${y}`
    })
    .join(' ')
}

const getOuterTriangle = (size: number): string => getRadarTrianglePoints(100, 100, 100, size)

const getVertexPosition = (
  index: number,
  size: number,
  labelOffset: number
): {
  x: number
  y: number
} => {
  const radius = size + labelOffset
  return polarToCartesian(ANGLES[index], radius)
}

export { getOuterTriangle, getRadarTrianglePoints, getVertexPosition }
