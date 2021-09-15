'use strict';

const ora = require('ora');
const chalk = require('chalk');

const s = message => {
    return ora({
        text: message,
        color: 'yellow',
        prefixText: `${chalk.bgHex('#EE6B2C')(' PENDING ')} `,
    }).start();
};

const spinner = s('Updating');

setTimeout(() => {
    spinner.succeed(`${chalk.green('Update Finish!')}`);
}, 3000);
