const constants = require('./constants.js')

function BlockStatus() {
  const milestones = [
    350000000,
    300000000,
    200000000,
    100000000,
    50000000,
  ];

  const distance = 3000000 // Distance between each milestone
  let rewardOffset = 1 // Start rewards at block (n)

  if (global.Config.netVersion === 'mainnet') {
    rewardOffset = 464500;
  }

  function parseHeight(height) {
    const h = Number.parseInt(height, 10)

    if (Number.isNaN(h)) {
      throw new Error('Invalid block height')
    } else {
      return Math.abs(h)
    }
  }

  this.calcMilestone = (height) => {
    const location = Math.floor(parseHeight(height - rewardOffset) / distance)
    const lastMile = milestones[milestones.length - 1]

    if (location > (milestones.length - 1)) {
      return milestones.lastIndexOf(lastMile)
    }
    return location
  }

  this.calcReward = (height) => {
    const h = parseHeight(height)

    if (h < rewardOffset || h <= 0) {
      return 0
    }
    return milestones[this.calcMilestone(height)]
  }

  this.calcSupply = (h) => {
    let height = parseHeight(h)
    height -= height % 101
    const milestone = this.calcMilestone(height)
    let supply = constants.totalAmount
    const rewards = []

    if (height <= 0) {
      return supply
    }
    let amount = 0
    let multiplier = 0
    height = (height - rewardOffset) + 1
    for (let i = 0; i < milestones.length; i++) {
      if (milestone >= i) {
        multiplier = milestones[i];

        if (height <= 0) {
          break // Rewards not started yet
        } else if (height < distance) {
          amount = height % distance; // Measure distance thus far
        } else {
          amount = distance; // Assign completed milestone
        }
        rewards.push([amount, multiplier])
        height -= distance // Deduct from total height
      } else {
        break // Milestone out of bounds
      }
    }
    if (height > 0) {
      rewards.push([height, milestones[milestones.length - 1]])
    }

    for (i = 0; i < rewards.length; i++) {
      const reward = rewards[i];
      supply += reward[0] * reward[1]
    }

    if (rewardOffset <= 1) {
      supply -= milestones[0]
    }
    return supply
  }
}

module.exports = BlockStatus
