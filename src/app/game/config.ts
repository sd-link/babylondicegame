export const enum BasicParam {
  offsetY = -250,
  grids = 14,
  diceSize = 18,
  diceMass = 1500,
  diceRestitution = .6,
  diceFriction = 1,
  dicesPerScreen = 21,
  gridWidth = 42,
  barWidth = 6,
  backWidth = 1500,
  backHeight = 1000,
  delayPeriod = 2000,
  mainRestitution = 5,
  mainFriction = 1,
  eventDelay = 2000,
  plinkoDepth = 500,


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