import process from 'node:process';
import { remixFastify } from '@mcansh/remix-fastify';
import chalk from 'chalk';
import { fastify } from 'fastify';
import sourceMapSupport from 'source-map-support';
import getPort, { portNumbers } from 'get-port';

sourceMapSupport.install();

const app = fastify();

await app.register(remixFastify);

const host = process.env.HOST || '127.0.0.1';
const desiredPort = Number(process.env.PORT) || 5173;
const portToUse = await getPort({
  port: portNumbers(desiredPort, desiredPort + 100)
});

let address = await app.listen({ port: portToUse, host });
let { port: usedPort } = new URL(address);

if (usedPort !== String(desiredPort)) {
  console.warn(
    chalk.yellow(
      `⚠️ Port ${desiredPort} is not available, using ${usedPort} instead.`
    )
  );
}

console.log(chalk.green(`✅ app ready: ${address}`));
