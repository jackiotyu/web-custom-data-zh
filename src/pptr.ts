import puppeteer, { PuppeteerLaunchOptions } from "puppeteer";
import { convert } from "html-to-text";
import os from 'os';
import path from 'path';

const CHAT_GPT_URL = "https://chat.openai.com";
const PREFIX = "ChatGPT\nChatGPT";

const HTML_TO_TEXT_OPTIONS = {
  wordwrap: 130,
};

const options: PuppeteerLaunchOptions = {
  headless: false,
  timeout: 6000,
  args: [
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    // '--no-startup-window', // 启动时不显示窗口
    '--disable-gpu', // 关闭GPU加速
    // '--start-minimized', // 启动时最小化窗口
  ],
  // userDataDir: path.join(os.tmpdir(), './chatgpt-pptr'),
};

enum Role {
  USER = "user",
  ASSISTANT = "assistant",
}

interface ChatHistory {
  role: Role;
  content: string;
}

const typeClick = async (page: any, text: string): Promise<void> => {
  await page.type("#prompt-textarea", text);
  await page.click("button[data-testid='send-button']");
};

const createChat = async (text: string): Promise<{
  response: string;
  history: ChatHistory[];
  send: (message: string) => Promise<string>;
  close: () => Promise<void>;
}> => {
  let responseMessageId = 3;
  const pptr = await puppeteer.launch(options);
  const history: ChatHistory[] = [];
  const page = await pptr.newPage();

  // 使用 DevTools 协议最小化窗口
  // const session = await page.createCDPSession();
  // await session.send('Browser.setWindowBounds', {
  //   windowId: (await session.send('Browser.getWindowForTarget')).windowId,
  //   bounds: { windowState: 'minimized' }
  // });

  page.goto(CHAT_GPT_URL);

  const send = async (message: string): Promise<string> => {
    await typeClick(page, message);
    history.push({
      role: Role.USER,
      content: message,
    });

    const response = await page.evaluate(
      async ({ responseMessageId }: { responseMessageId: number }) => {
        let prevText: string | null = null;
        let currentText: any = document.querySelector(
          `div[data-testid='conversation-turn-${responseMessageId}']`
        )?.innerHTML;

        const getHTML = async (): Promise<string> => {
          return new Promise((resolve) => {
            const interval = setInterval(() => {
              prevText = currentText;

              currentText = document.querySelector(
                `div[data-testid='conversation-turn-${responseMessageId}']`
              )?.innerHTML;

              if (currentText && prevText === currentText) {
                clearInterval(interval);

                resolve(currentText);
              }
            }, 3000);
          });
        };

        return getHTML();
      },
      {
        responseMessageId,
      }
    );

    responseMessageId += 2;

    const answer = convert(response, HTML_TO_TEXT_OPTIONS)
      .replace(PREFIX, "")
      .trim();

    history.push({
      role: Role.ASSISTANT,
      content: answer,
    });

    return answer;
  };

  const close = async (): Promise<void> => {
    await page.close();
    await pptr.close();
  };

  await page.waitForSelector("#prompt-textarea", {
    timeout: 60_000
  });
  const response = await send(text);

  return {
    response,
    history,
    send,
    close,
  };
};

const client = { createChat };

export default client;