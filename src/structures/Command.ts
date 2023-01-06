import type { TCommand } from '../typings/types/Command';

export class Command {
  constructor(commandOptions: TCommand) {
    Object.assign(this, commandOptions);
  }
}
