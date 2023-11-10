import fs from 'fs';
import path from 'path';
import { parseSync } from 'subtitle';

export default defineEventHandler(async (event) => {
  if (event.req.method === 'GET') {
    const folder = event.context.params?.slug;
    const folders = await fs.promises.readdir('public/songs');

    if (!folders.includes(folder)) {
      return sendError(
        event,
        createError({ statusCode: 404, statusMessage: 'Not Found' }),
      );
    }

    let files = await fs.promises.readdir(`public/songs/${folder}`);
    const srt = files.find((file) => file.includes('.srt'));
    let parsedSrt = null;

    if (srt) {
      const srtFileData = fs.readFileSync(
        path.join('public/songs', folder, srt),
        'utf8',
      );
      parsedSrt = parseSync(srtFileData);
    }

    return {
      srt,
      parsedSrt,
      webm: files.find((file) => file.includes('.webm')),
      mp3: files.find((file) => file.includes('.mp3')),
    };
  }
});
