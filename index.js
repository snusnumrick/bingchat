"use strict";

import { BingChat } from "bing-chat";
import ora from "ora";
import readline from "readline";
import clc from "cli-color";
import dotenv from "dotenv-safe";

dotenv.config();

function customSplit(str, maxLength) {
  // Split a string into multiple lines, but don't split words
  return str.replace(
    new RegExp(`(?![^\\n]{1,${maxLength}}$)([^\\n]{1,${maxLength}})\\s`, "g"),
    "$1\n"
  );
}

async function main() {
  const api = new BingChat({ cookie: process.env.BING_COOKIE });
  let conversation = {};

  const readLineAsync = () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
      terminal: false,
    });

    return new Promise((resolve) => {
      rl.prompt();
      rl.on("line", (line) => {
        rl.close();
        resolve(line);
      });
    });
  };

  while (true) {
    const prompt = await readLineAsync();
    const spinner = ora().start();
    conversation = await api.sendMessage(prompt, conversation).then();
    let response = conversation.text;
    // Remove the ^[number]^ from the response
    response = response.replace(/\s*\[\^\d+\^\]/g, "");
    // response = customSplit(response, 100);
    // replace **..** with bold
    response = response.replace(/(\*\*)(.*?)\1/g, clc.bold("$2"));
    response = clc.greenBright(response);

    spinner.succeed(response);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
