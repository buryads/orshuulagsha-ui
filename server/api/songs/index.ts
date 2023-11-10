import fs from 'fs';

let songs = [];

export default defineEventHandler((event) => {
  if (event.req.method === 'GET') {
    fs.promises
      .readdir('public/songs')
      .then((folders) => {
        songs = folders.map((folder) => {
          return {
            slug: folder,
          };
        });
      })
      .catch((e) => console.error(e));

    return songs;
  }
});
