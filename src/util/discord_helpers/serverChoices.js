import mcconfig from '../../config/mcConfig.js';

export default function generateServerChoices() {
  const choices = [];

  for (const s of Object.getOwnPropertyNames(mcconfig)) {
    choices.push({ name: s, value: s });
  }
  return choices;
}
