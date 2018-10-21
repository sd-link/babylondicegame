export const enum BasicParam {
  offsetY = -330,
  grids = 14,
  diceSize = 22,
  diceMass = 1000,
  diceRestitution = .6,
  diceFriction = 1,
  dicesPerScreen = 21,
  gridWidth = 48,
  barWidth = 6.7,
  backWidth = 1300,
  backHeight = 767,
  delayPeriod = 2000,
  mainRestitution = 5,
  mainFriction = 1,
  eventDelay = 2000,
  plinkoDepth = 700,
}
export const FacePostion = [
  [
    {x: 0, y: 0, z: -1, w: 1},
    {x: 0, y: 0, z: 0, w: 1},
    {x: 0, y: 0, z: 1, w: 0},
    {x: 0, y: 0, z: 1, w: 1},
  ],
  [
    {x: 1, y: 1, z: 0, w: 0},
    {x: 0, y: 1, z: 0, w: 0},
    {x: 1, y: 0, z: 0, w: 0},
    {x: -1, y: 1, z: 0, w: 0},
  ],
  [
    {x: 1, y: 0, z: 1, w: 0},
    {x: 0, y: -1, z: 0, w: 1},
    {x: 1, y: 1, z: 1, w: -1},
    {x: -1, y: 1, z: -1, w: -1},
  ],
  [
    {x: 0, y: 1, z: 0, w: 1},
    {x: -1, y: 1, z: 1, w: 1},
    {x: -1, y: 0, z: 1, w: 0},
    {x: -1, y: -1, z: 1, w: -1},
  ],
  [
    {x: 1, y: 0, z: 0, w: 1},
    {x: 1, y: 1, z: 1, w: 1},
    {x: 0, y: 1, z: 1, w: 0},
    {x: -1, y: 1, z: 1, w: -1},
  ],
  [
    {x: -1, y: 1, z: -1, w: 1},
    {x: -1, y: 0, z: 0, w: 1},
    {x: 0, y: 1, z: -1, w: 0},
    {x: 1, y: 0, z: 0, w: -1},
  ]
 
]