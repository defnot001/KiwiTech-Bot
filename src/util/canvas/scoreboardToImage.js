import { registerFont, createCanvas } from 'canvas';
import path from 'path';
import sourcesPath from '../node/sourcesPath.js';

registerFont(path.join(sourcesPath, 'assets/minecraft.ttf'), {
  family: 'minecraft',
});

// Returns a buffer
export default function scoreboardToImage(scoreboardName, data) {
  const grey = '#BFBFBF';
  const red = '#FF5555';
  const white = '#FFFFFF';
  const spacing = 20;

  const canvas = createCanvas(1, 1);
  const ctx = canvas.getContext('2d');

  ctx.font = '20px minecraft';

  // Get texts sizes
  const titleSize = ctx.measureText(scoreboardName);
  let playersSize = 0;
  let scoresSize = 0;

  data.forEach((d) => {
    playersSize =
      playersSize <= ctx.measureText(d[0]).width
        ? ctx.measureText(d[0]).width
        : playersSize;

    scoresSize =
      scoresSize <= ctx.measureText(d[1].toString()).width
        ? ctx.measureText(d[1].toString()).width
        : scoresSize;
  });

  // Resive canvas to fit all the text
  const width = playersSize + scoresSize + 80;
  const height = data.length * spacing + 55;

  canvas.width = width;
  canvas.height = height;

  // Set font and color
  ctx.font = '20px minecraft'; // font has to be set a second time 'cause it is lost when resizing canvas
  ctx.fillStyle = '#2c2f33';
  ctx.fillRect(0, 0, width, height); // Set background to gray-ish

  // Find title position based on it's size
  const titlePos = [Math.floor((width - titleSize.width) / 2), 20];
  const playerAndScorePos = [2, 50];

  // Write title
  ctx.fillStyle = white;
  ctx.fillText(scoreboardName, titlePos[0], titlePos[1]);

  // Write players and score, the counter is used to put space between lines, total is the total of the scoreboard
  let counter = 0;
  let total = 0;
  data.forEach((i) => {
    // Write the player name
    ctx.fillStyle = grey;
    ctx.fillText(
      i[0],
      playerAndScorePos[0],
      playerAndScorePos[1] + counter * spacing
    );

    // Write the score
    ctx.fillStyle = red;
    ctx.fillText(
      i[1].toString(),
      width - ctx.measureText(i[1].toString()).width,
      playerAndScorePos[1] + counter * spacing
    );

    counter += 1;
    total += i[1];
  });

  // Write the total score (in red)
  ctx.fillText(
    total,
    width - ctx.measureText(total).width,
    playerAndScorePos[1] + counter * spacing
  );

  // Write 'Total' text
  ctx.fillStyle = white;
  ctx.fillText(
    'Total',
    playerAndScorePos[0],
    playerAndScorePos[1] + counter * spacing
  );

  // Return a buffer
  const buffer = canvas.toBuffer('image/png');
  return buffer;
}
