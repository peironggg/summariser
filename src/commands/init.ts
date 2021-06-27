import ora from 'ora';
import fs from 'fs';
import { writeLocalConfig } from '../utils/helper';
import { LOCAL_CONFIG_PATH, DEFAULT_CONFIG } from '../utils/constants';

export const init = (): void => {
  const spinner = ora({ spinner: 'circle' });
  spinner.start('Initializing');
  // Setup .summariser.js if does not exist
  !fs.existsSync(LOCAL_CONFIG_PATH) && writeLocalConfig(DEFAULT_CONFIG);
  spinner.succeed('Done');
};
