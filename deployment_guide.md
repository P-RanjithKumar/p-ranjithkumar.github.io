# Deploying to GitHub Pages

To ensure your cinematic experience works perfectly for anyone visiting your `xxxxx.github.io` link, follow these steps.

## 1. Why we made changes
I've updated your `vite.config.js` and code paths to use **relative paths**. 
*   **Before:** `/models/model.glb` would look at the root of the website (`xxxxx.github.io/models/...`).
*   **After:** `models/model.glb` looks inside your project folder (`xxxxx.github.io/AARAV/models/...`), which is exactly where it needs to be.

## 2. Setting up Deployment
The easiest way to keep your site updated on GitHub Pages is using the `gh-pages` package.

### Step A: Install the deployer
Run this in your terminal:
```bash
npm install gh-pages --save-dev
```

### Step B: Add scripts to `package.json`
Add these two lines to your `"scripts"` section in `package.json`:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

## 3. How to Push
Once you've done the above, simply run:
```bash
npm run deploy
```

This will:
1.  **Build** your project into the `dist` folder.
2.  **Push** only that folder to a special branch called `gh-pages`.
3.  GitHub will automatically see that branch and host your site!

## 4. Final GitHub Setting
1.  Go to your repository on GitHub.com.
2.  Go to **Settings** > **Pages**.
3.  Under **Build and deployment**, ensure the **Branch** is set to `gh-pages` (root folder).

### "Will it work?"
**Yes!** With these relative path fixes, anyone who opens your link will see the 3D model, hear the audio, and see the photos exactly as you do locally.

> [!TIP]
> If you see a white screen at first, wait about 60 seconds after running `npm run deploy` for GitHub's servers to refresh!
