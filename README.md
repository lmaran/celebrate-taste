[ ![Codeship Status for lmaran/celebrate-taste](https://codeship.com/projects/81058240-1769-0133-c3e2-06c83ac03245/status?branch=master)](https://codeship.com/projects/93583)

# A canteen application for Celebrate Taste

## Development

```bash
# start server:
cd server && npm start

# start client:
# there is no local server to start
# when a new js/css file is added, update the index.html manually or
cd client && npm build # or 'npx gulp'

# start browser:
http://localhost:1410
```

## Production (from local)

```bash
# build server:
cd server && npm run build-prod

# build client:
cd client && npm run build-prod # or 'npx gulp prod'

# start server:
cd server && NODE_ENV=production MONGO_URI=mongodb://localhost/celebrate-taste-dev PORT=1411 node dist/server.js

# start browser:
http://localhost:1410
```

## Live

```bash
https://celebrate-taste.ro
```
