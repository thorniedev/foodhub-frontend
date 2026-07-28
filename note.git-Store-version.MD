USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend (master)
$ git clone https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
Cloning into 'foodhub-frontend'...
remote: Enumerating objects: 135, done.
remote: Counting objects: 100% (135/135), done.
remote: Compressing objects: 100% (87/87), done.
remote: Total 135 (delta 38), reused 132 (delta 35), pack-reused 0 (from 0)
Receiving objects: 100% (135/135), 15.85 MiB | 2.15 MiB/s, done.
Resolving deltas: 100% (38/38), done.


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ npm install
npm warn cleanup Failed to remove some directories [
npm warn cleanup   [
npm warn cleanup     '\\\\?\\D:\\ISTAD\\ITE3rd\\ITE-FOODHUB-3rd-Frontend\\foodhub-frontend\\node_modules',
npm warn cleanup     [Error: EPERM: operation not permitted, rmdir 'D:\ISTAD\ITE3rd\ITE-FOODHUB-3rd-Frontend\foodhub-frontend\node_modules\zod\src\v3\tests'] {
npm warn cleanup       errno: -4048,
npm warn cleanup       code: 'EPERM',
npm warn cleanup       syscall: 'rmdir',
npm warn cleanup       path: 'D:\\ISTAD\\ITE3rd\\ITE-FOODHUB-3rd-Frontend\\foodhub-frontend\\node_modules\\zod\\src\\v3\\tests'
npm warn cleanup     }
npm warn cleanup   ]
npm warn cleanup ]
npm error code ECONNRESET
npm error network aborted
npm error network This is a problem related to network connectivity.
npm error network In most cases you are behind a proxy or have bad network settings.
npm error network
npm error network If you are behind a proxy, please make sure that the 'proxy' config is set properly.  See: 'npm help config'
npm error A complete log of this run can be found in: C:\Users\USER\AppData\Local\npm-cache\_logs\2026-07-22T01_29_14_571Z-debug-0.log


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ npm run dev

> foodhub@0.1.0 dev
> next dev

'next' is not recognized as an internal or external command,
operable program or batch file.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ ls
AGENTS.md  components/      eslint.config.mjs  node_modules/  package.json       postcss.config.mjs  README.md  tsconfig.json
CLAUDE.md  components.json  next.config.ts     note.git.MD    package-lock.json  public/             src/

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ npm ls
foodhub@0.1.0 D:\ISTAD\ITE3rd\ITE-FOODHUB-3rd-Frontend\foodhub-frontend
├── UNMET DEPENDENCY @base-ui/react@^1.6.0
├── UNMET DEPENDENCY @hookform/resolvers@^5.4.0
├── UNMET DEPENDENCY @tailwindcss/postcss@^4
├── UNMET DEPENDENCY @types/aos@^3.0.8
├── UNMET DEPENDENCY @types/node@^20
├── UNMET DEPENDENCY @types/react-dom@^19
├── UNMET DEPENDENCY @types/react@^19
├── UNMET DEPENDENCY aos@^2.3.4
├── UNMET DEPENDENCY class-variance-authority@^0.7.1
├── UNMET DEPENDENCY clsx@^2.1.1
├── UNMET DEPENDENCY eslint-config-next@16.2.10
├── UNMET DEPENDENCY eslint@^9
├── UNMET DEPENDENCY framer-motion@^12.42.2
├── UNMET DEPENDENCY gsap@^3.15.0
├── UNMET DEPENDENCY lenis@^1.3.25
├── UNMET DEPENDENCY lucide-react@^1.25.0
├── UNMET DEPENDENCY motion@^12.42.2
├── UNMET DEPENDENCY next@16.2.10
├── UNMET DEPENDENCY react-dom@19.2.4
├── UNMET DEPENDENCY react-hook-form@^7.82.0
├── UNMET DEPENDENCY react-icons@^5.7.0
├── UNMET DEPENDENCY react@19.2.4
├── UNMET DEPENDENCY shadcn@^4.13.1
├── UNMET DEPENDENCY tailwind-merge@^3.6.0
├── UNMET DEPENDENCY tailwindcss@^4
├── UNMET DEPENDENCY tw-animate-css@^1.4.0
├── UNMET DEPENDENCY typescript@^5
└── UNMET DEPENDENCY zod@^4.4.3

npm error code ELSPROBLEMS
npm error missing: @base-ui/react@^1.6.0, required by foodhub@0.1.0
npm error missing: @hookform/resolvers@^5.4.0, required by foodhub@0.1.0
npm error missing: @tailwindcss/postcss@^4, required by foodhub@0.1.0
npm error missing: @types/aos@^3.0.8, required by foodhub@0.1.0
npm error missing: @types/node@^20, required by foodhub@0.1.0
npm error missing: @types/react-dom@^19, required by foodhub@0.1.0
npm error missing: @types/react@^19, required by foodhub@0.1.0
npm error missing: aos@^2.3.4, required by foodhub@0.1.0
npm error missing: class-variance-authority@^0.7.1, required by foodhub@0.1.0
npm error missing: clsx@^2.1.1, required by foodhub@0.1.0
npm error missing: eslint-config-next@16.2.10, required by foodhub@0.1.0
npm error missing: eslint@^9, required by foodhub@0.1.0
npm error missing: framer-motion@^12.42.2, required by foodhub@0.1.0
npm error missing: gsap@^3.15.0, required by foodhub@0.1.0
npm error missing: lenis@^1.3.25, required by foodhub@0.1.0
npm error missing: lucide-react@^1.25.0, required by foodhub@0.1.0
npm error missing: motion@^12.42.2, required by foodhub@0.1.0
npm error missing: next@16.2.10, required by foodhub@0.1.0
npm error missing: react-dom@19.2.4, required by foodhub@0.1.0
npm error missing: react-hook-form@^7.82.0, required by foodhub@0.1.0
npm error missing: react-icons@^5.7.0, required by foodhub@0.1.0
npm error missing: react@19.2.4, required by foodhub@0.1.0
npm error missing: shadcn@^4.13.1, required by foodhub@0.1.0
npm error missing: tailwind-merge@^3.6.0, required by foodhub@0.1.0
npm error missing: tailwindcss@^4, required by foodhub@0.1.0
npm error missing: tw-animate-css@^1.4.0, required by foodhub@0.1.0
npm error missing: typescript@^5, required by foodhub@0.1.0
npm error missing: zod@^4.4.3, required by foodhub@0.1.0
npm error A complete log of this run can be found in: C:\Users\USER\AppData\Local\npm-cache\_logs\2026-07-22T01_41_45_247Z-debug-0.log



USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ rm -rf node_modules package-lock.json

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ npm install

added 606 packages, and audited 607 packages in 2m

234 packages are looking for funding
  run `npm fund` for details

6 vulnerabilities (4 moderate, 2 high)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ npm run dev

> foodhub@0.1.0 dev
> next dev

▲ Next.js 16.2.10 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://10.196.87.87:3000
✓ Ready in 10.6s

○ Compiling / ...
[Function: FluidTabsRoot] {
  List: [Function: FluidTabsList],
  Tab: [Function: FluidTabsTab],
  Icon: [Function: FluidTabsIcon],
  Label: [Function: FluidTabsLabel]
}
[Function: FluidTabsList]
[Function: FluidTabsTab]
[Function: FluidTabsIcon]
[Function: FluidTabsLabel]
 GET / 200 in 11.8s (next.js: 11.4s, application-code: 395ms)
[browser] Image with src "/Image/blur-green.png" was detected as the Largest Contentful Paint (LCP). Please add the `loading="eager"` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading
[browser] Image with src "/Image/foodhub-image (2).png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.
[browser] Image with src "/Image/foodhub-image (2).png" was detected as the Largest Contentful Paint (LCP). Please add the `loading="eager"` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading
 GET /about 200 in 549ms (next.js: 510ms, application-code: 39ms)
 GET / 200 in 25ms (next.js: 4ms, application-code: 21ms)


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ add .
bash: add: command not found

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ git commit -m "start project from landing page"
On branch souheng
Your branch is up to date with 'origin/souheng'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   .gitignore
        modified:   package-lock.json

no changes added to commit (use "git add" and/or "git commit -a")

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ git branch
* souheng

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ git fetch

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ git branch
* souheng

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git push origin longfou
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 16 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 3.00 KiB | 3.00 MiB/s, done.
Total 4 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
   31a1c35..2125c5e  longfou -> longfou

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git config --global user.name "Longfou1900"

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git config --global user.email "foufou9172@gmail.com"

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ rm -rf .git

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git init
Initialized empty Git repository in D:/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend/.git/

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git fetch origin
fatal: 'origin' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git checkout longfou
error: pathspec 'longfou' did not match any file(s) known to git

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git remote add origin https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git init
Reinitialized existing Git repository in D:/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend/.git/

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git fetch origin
remote: Enumerating objects: 139, done.
remote: Counting objects: 100% (139/139), done.
remote: Compressing objects: 100% (90/90), done.
remote: Total 139 (delta 39), reused 136 (delta 36), pack-reused 0 (from 0)
Receiving objects: 100% (139/139), 15.84 MiB | 1.24 MiB/s, done.
Resolving deltas: 100% (39/39), done.
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * [new branch]      dara       -> origin/dara
 * [new branch]      longfou    -> origin/longfou
 * [new branch]      lyta       -> origin/lyta
 * [new branch]      mingyeak   -> origin/mingyeak
 * [new branch]      souheng    -> origin/souheng

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git checkout longfou
error: The following untracked working tree files would be overwritten by checkout:
        .gitignore
        AGENTS.md
        CLAUDE.md
        README.md
        components.json
        eslint.config.mjs
        next.config.ts
        note.git.MD
        package-lock.json
        package.json
        postcss.config.mjs
        public/Image/arr.png
        public/Image/background.png
        public/Image/blur-green.png
        public/Image/blur-orange.png
        public/Image/card-Img.png
        public/Image/card2.png
        public/Image/decorate.png
        public/Image/foodhub-image (2).png
        public/Image/foodhub-image.png
        public/Image/left-vector.png
        public/Image/location-vector.png
        public/Image/logo.png
        public/Image/right-vector.png
        public/file.svg
        public/globe.svg
        public/next.svg
        public/vercel.svg
        public/window.svg
        run.git.NOTE.MD
        src/app/favicon.ico
        src/app/globals.css
        src/app/layout.tsx
        src/app/page.tsx
        src/app/pages/home/event.tsx
        src/app/pages/home/location.tsx
        src/app/pages/home/popular.tsx
        src/app/pages/home/recommand.tsx
        src/components/AOSInit.tsx
        src/components/CurvedLoop.tsx
        src/components/TextType.tsx
        src/components/ui/DrawCircleText.tsx
        src/components/ui/Hero.tsx
        src/components/ui/Hero1.tsx
        src/components/ui/button.tsx
        src/lib/utils.ts
        tsconfig.json
Please move or remove them before you switch branches.
Aborting

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git remote -v
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (fetch)
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (push)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git branch -a
  remotes/origin/HEAD -> origin/souheng
  remotes/origin/dara
  remotes/origin/longfou
  remotes/origin/lyta
  remotes/origin/mingyeak
  remotes/origin/souheng


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git switch -c longfou
Switched to a new branch 'longfou'

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git status
On branch longfou

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        AGENTS.md
        CLAUDE.md
        README.md
        components.json
        eslint.config.mjs
        next.config.ts
        note.git.MD
        package-lock.json
        package.json
        postcss.config.mjs
        public/
        run.git.NOTE.MD
        src/
        tsconfig.json

nothing added to commit but untracked files present (use "git add" to track)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git remote -v
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (fetch)
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (push)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git log --oneline
7e9374e (HEAD -> longfou) start landing page start-up
2fb1292 start landing page start up


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git remote -v
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (fetch)
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (push)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git log --oneline
7e9374e (HEAD -> longfou) start landing page start-up
2fb1292 start landing page start up

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git push --force origin longfou
Enumerating objects: 61, done.
Counting objects: 100% (61/61), done.
Delta compression using up to 16 threads
Compressing objects: 100% (54/54), done.
Writing objects: 100% (61/61), 12.04 MiB | 804.00 KiB/s, done.
Total 61 (delta 5), reused 53 (delta 3), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (5/5), done.
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
 + 2125c5e...7e9374e longfou -> longfou (forced update)


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git stash
Saved working directory and index state WIP on longfou: 7e9374e start landing page start-up

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git checkout souheng
branch 'souheng' set up to track 'origin/souheng'.
Switched to a new branch 'souheng'

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ git pull origin souheng
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            souheng    -> FETCH_HEAD
Already up to date.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ git stash pop
CONFLICT (modify/delete): note.git.MD deleted in Updated upstream and modified in Stashed changes.  Version Stashed changes of note.git.MD left in tree.
CONFLICT (modify/delete): run.git.NOTE.MD deleted in Updated upstream and modified in Stashed changes.  Version Stashed changes of run.git.NOTE.MD left in tree.
On branch souheng
Your branch is up to date with 'origin/souheng'.

Unmerged paths:
  (use "git restore --staged <file>..." to unstage)
  (use "git add/rm <file>..." as appropriate to mark resolution)
        deleted by us:   note.git.MD
        deleted by us:   run.git.NOTE.MD

no changes added to commit (use "git add" and/or "git commit -a")
The stash entry is kept in case you need it again.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (souheng)
$ git add note.git.MD run.git.NOTE.MD


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git stash
You do not have the initial commit yet

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git add .

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git commit -m "save updated"
[master (root-commit) 5f73974] save updated
 58 files changed, 14040 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 AGENTS.md
 create mode 100644 CLAUDE.md
 create mode 100644 README.md
 create mode 100644 components.json
 create mode 100644 components/animata/overlay/modal.tsx
 create mode 100644 components/animata/preloader/split-reveal.css
 create mode 100644 components/animata/preloader/split-reveal.tsx
 create mode 100644 components/animata/tabs/fluid-tabs.tsx
 create mode 100644 components/animata/tabs/shared.ts
 create mode 100644 eslint.config.mjs
 create mode 100644 next.config.ts
 create mode 100644 note.git.MD
 create mode 100644 package-lock.json
 create mode 100644 package.json
 create mode 100644 postcss.config.mjs
 create mode 100644 public/Image/arr.png
 create mode 100644 public/Image/background.png
 create mode 100644 public/Image/blur-green.png
 create mode 100644 public/Image/blur-orange.png
 create mode 100644 public/Image/card-Img.png
 create mode 100644 public/Image/card2.png
 create mode 100644 public/Image/decorate.png
 create mode 100644 public/Image/foodhub-image (2).png
 create mode 100644 public/Image/foodhub-image.png
 create mode 100644 public/Image/left-vector.png
 create mode 100644 public/Image/location-vector.png
 create mode 100644 public/Image/logo.png
 create mode 100644 public/Image/right-vector.png
 create mode 100644 public/file.svg
 create mode 100644 public/globe.svg
 create mode 100644 public/next.svg
 create mode 100644 public/vercel.svg
 create mode 100644 public/window.svg
 create mode 100644 run.git.NOTE.MD
 create mode 100644 src/app/about/page.tsx
 create mode 100644 src/app/favicon.ico
 create mode 100644 src/app/globals.css
 create mode 100644 src/app/layout.tsx
 create mode 100644 src/app/layout/Navbar.tsx
 create mode 100644 src/app/not-found.tsx
 create mode 100644 src/app/page.tsx
 create mode 100644 src/app/pages/home/event.tsx
 create mode 100644 src/app/pages/home/location.tsx
 create mode 100644 src/app/pages/home/popular.tsx
 create mode 100644 src/app/pages/home/recommand.tsx
 create mode 100644 src/components/AOSInit.tsx
 create mode 100644 src/components/CurvedLoop.tsx
 create mode 100644 src/components/TextType.tsx
 create mode 100644 src/components/ui/DrawCircleText.tsx
 create mode 100644 src/components/ui/Hero.tsx
 create mode 100644 src/components/ui/Hero1.tsx
 create mode 100644 src/components/ui/button.tsx
 create mode 100644 src/components/ui/firefly-button.tsx
 create mode 100644 src/components/ui/skiper-ui/skiper19.tsx
 create mode 100644 src/components/ui/skiper-ui/skiper30.tsx
 create mode 100644 src/lib/utils.ts
 create mode 100644 tsconfig.json

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git stash
No local changes to save

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git status
On branch master
nothing to commit, working tree clean

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git branch
* master

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git fetch --all


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git switch -c fou
Switched to a new branch 'fou'

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (fou)
$ git branch
* fou
  master

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (fou)
$ git remote -v

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (fou)
$ git remote add origin https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (fou)
$ git remote -v
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (fetch)
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (push)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (fou)
$ git push -u origin fou
Enumerating objects: 77, done.
Counting objects: 100% (77/77), done.
Delta compression using up to 16 threads
Compressing objects: 100% (69/69), done.
Writing objects: 100% (77/77), 10.27 MiB | 612.00 KiB/s, done.
Total 77 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (2/2), done.
remote: 
remote: Create a pull request for 'fou' on GitHub by visiting:
remote:      https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend/pull/new/fou
remote: 
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
 * [new branch]      fou -> fou
branch 'fou' set up to track 'origin/fou'.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (fou)
$ git log --format='%an <%ae>'
Longfou1900 <foufou9172@gmail.com>

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (fou)
$ git branch -a
* fou
  master
  remotes/origin/fou

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (fou)
$ git branch -m main

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git branch
* m
  master

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git push -u origin main
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
remote: 
remote: Create a pull request for 'main' on GitHub by visiting:
remote:      https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend/pull/new/main
remote: 
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git branch -a
* main
  master
  remotes/origin/fou
  remotes/origin/main

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git push origin --delete fou
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
 - [deleted]         fou

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git branch -a
* main
  master
  remotes/origin/main

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git config --global user.name "Longfou1900"

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git config --global user.email "foufou9172@gamil.com"

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git checkout main
git pull origin main
M       .gitignore
M       note.git.MD
M       run.git.NOTE.MD
Already on 'main'
Your branch is up to date with 'origin/main'.
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            main       -> FETCH_HEAD
Already up to date.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git add .
git commit -m "Add Longfou1900"
[main cfe0625] Add Longfou1900
 3 files changed, 154 insertions(+)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git merge longfou
merge: longfou - not something we can merge

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git config --global user.email "foufou9172@gmail.com"

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git commit --amend --reset-author --no-edit
[main 55af60e] Add Longfou1900
 3 files changed, 154 insertions(+)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git push origin main
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 16 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 2.21 KiB | 2.21 MiB/s, done.
Total 5 (delta 3), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (3/3), completed with 3 local objects.
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
   5f73974..55af60e  main -> main

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git config --global user.email "FouFou9172@gmail.com"

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git commit --amend --reset-author --no-edit
[main fd03ef7] Add Longfou1900
 3 files changed, 154 insertions(+)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git push --force origin main
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 16 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 2.21 KiB | 2.21 MiB/s, done.
Total 5 (delta 3), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (3/3), completed with 3 local objects.
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
 + 55af60e...fd03ef7 main -> main (forced update)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ npm run dev

> foodhub@0.1.0 dev
> next dev

▲ Next.js 16.2.10 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://10.196.87.87:3000
✓ Ready in 328ms

[Function: FluidTabsRoot] {
  List: [Function: FluidTabsList],
  Tab: [Function: FluidTabsTab],
  Icon: [Function: FluidTabsIcon],
  Label: [Function: FluidTabsLabel]
}
[Function: FluidTabsList]
[Function: FluidTabsTab]
[Function: FluidTabsIcon]
[Function: FluidTabsLabel]
 GET / 200 in 698ms (next.js: 224ms, application-code: 474ms)
[browser] Image with src "/Image/foodhub-image (2).png" was detected as the Largest Contentful Paint (LCP). Please add the `loading="eager"` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading
[browser] Image with src "/Image/foodhub-image (2).png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.

-------------------

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou|MERGING)
$ git add .

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou|MERGING)
$ git commit -m "save fix conflict"
[longfou cf7f63a] save fix conflict

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git stash
No local changes to save


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git reset HEAD~1
Unstaged changes after reset:
M       .gitignore
M       components/animata/tabs/fluid-tabs.tsx
M       package-lock.json
M       package.json
M       run.git.NOTE.MD
M       src/app/globals.css
M       src/app/layout.tsx
M       src/app/layout/Navbar.tsx
M       src/app/not-found.tsx
M       src/app/page.tsx
M       src/app/pages/home/popular.tsx
M       src/app/pages/home/recommand.tsx
M       src/components/TextType.tsx



USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git stash
Saved working directory and index state WIP on longfou: 2292115 save update change

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git branch
* longfou
  main
  master

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git stash pop
On branch longfou
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   .gitignore
        modified:   components/animata/tabs/fluid-tabs.tsx
        modified:   note.git.MD
        modified:   package-lock.json
        modified:   package.json
        modified:   run.git.NOTE.MD
        modified:   src/app/globals.css
        modified:   src/app/layout.tsx
        modified:   src/app/layout/Navbar.tsx
        modified:   src/app/not-found.tsx
        modified:   src/app/page.tsx
        modified:   src/app/pages/home/popular.tsx
        modified:   src/app/pages/home/recommand.tsx
        modified:   src/components/TextType.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        public/Image/benner.png
        public/Image/cbrd.png
        public/Image/food/
        public/Image/food01.png
        public/Image/istad.png
        public/Image/mptc.png
        src/app/CreatePost.tsx
        src/app/PostsList.tsx
        src/app/food/
        src/app/hooks/
        src/app/layout/Footer.tsx
        src/app/pages/home/FoodCard.tsx
        src/app/pages/home/FoodDiscoverySection.tsx
        src/app/pages/home/FoodSearchBar.tsx
        src/app/pages/home/RecommendationStack.tsx
        src/app/pages/home/SectionModal.tsx
        src/app/pages/home/Spinwheel .tsx
        src/app/pages/home/age.tsx
        src/app/pages/home/filterByCategory.tsx
        src/app/pages/home/fitfood.tsx
        src/app/pages/home/season.tsx
        src/app/providers.tsx
        src/app/types/
        src/components/ui/Carosel.tsx
        src/components/ui/TrueFocus.tsx
        src/components/ui/carousel.tsx
        src/components/ui/skiper-ui/skiper48.tsx
        src/components/ui/skiper-ui/skiper54.tsx
        src/lib/services/
        src/lib/store.ts
        src/test/

no changes added to commit (use "git add" and/or "git commit -a")
Dropped refs/stash@{0} (92a9e10ac6f893e335b0d92e1dc0e6bf601414f2)

PS D:\ISTAD\ITE3rd\ITE-FOODHUB-3rd-Frontend\foodhub-frontend> yarn install                               
yarn install v1.22.22
info No lockfile found.
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
success Saved lockfile.
Done in 599.01s.
---------------------------------------------------------------------------------------

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git branch -vv
* longfou 5e5e768 [origin/longfou] clear errors not found
  master  ac266fe save stash

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git remote -v
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (fetch)
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (push)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git log --format="%H %an <%ae>" -5
5e5e768b6eefeb4b572d14c081c43703d79ee4bb Longfou1900 <FouFou9172@gmail.com>
0e9b1884dda48eec54b8a6ad84b580e0ca0671cf Longfou1900 <FouFou9172@gmail.com>
034dd81317f4a3eea1072c4f6fa41219a83a9a08 Longfou1900 <FouFou9172@gmail.com>
77aef4b3bf8bd0fd23856dcd4eb5d90a36d86303 Longfou1900 <FouFou9172@gmail.com>
28e9dfa5afa347b99117c750bb9b20c3d2c033ec Longfou1900 <FouFou9172@gmail.com>

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git show -s --format=fuller HEAD
commit 5e5e768b6eefeb4b572d14c081c43703d79ee4bb (HEAD -> longfou, origin/longfou)
Author:     Longfou1900 <FouFou9172@gmail.com>
AuthorDate: Sat Jul 25 15:28:14 2026 +0700
Commit:     Longfou1900 <FouFou9172@gmail.com>
CommitDate: Sat Jul 25 15:28:14 2026 +0700

    clear errors not found

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git config --show-origin --get user.email
file:.git/config        FouFou9172@gmail.com

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git commit --allow-empty -m "Test project with yarn"
git push origin longfou
[longfou b4e5b95] Test project with yarn
Enumerating objects: 1, done.
Counting objects: 100% (1/1), done.
Writing objects: 100% (1/1), 198 bytes | 198.00 KiB/s, done.
Total 1 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
   5e5e768..b4e5b95  longfou -> longfou

git commit --allow-empty -m "Test contributor"
git push origin longfou



USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git fetch --all
remote: Enumerating objects: 47, done.
remote: Counting objects: 100% (47/47), done.
remote: Compressing objects: 100% (18/18), done.
remote: Total 47 (delta 23), reused 47 (delta 23), pack-reused 0 (from 0)
Unpacking objects: 100% (47/47), 9.91 KiB | 47.00 KiB/s, done.
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
   94e1112..7ba6350  main       -> origin/main
   0a0d14f..7ba6350  souheng    -> origin/souheng


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ 
 *  History restored 


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git remote -v
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (fetch)
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (push)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git log --format='%an <%ae>'
Longfou1900 <FouFou9172@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
ngovkimsouheng <kokocorona9@gmail.com>
:
 *  History restored 


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git fetch all
fatal: 'all' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git fetch origin
remote: Enumerating objects: 20, done.
remote: Counting objects: 100% (20/20), done.
remote: Compressing objects: 100% (5/5), done.
remote: Total 20 (delta 15), reused 20 (delta 15), pack-reused 0 (from 0)
Unpacking objects: 100% (20/20), 2.13 KiB | 9.00 KiB/s, done.
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
   31a1c35..d1cdd83  dara       -> origin/dara
   d1cdd83..6d76606  main       -> origin/main
   d1cdd83..6d76606  souheng    -> origin/souheng

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git pull souheng
fatal: 'souheng' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git pull origin souheng
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            souheng    -> FETCH_HEAD
Merge made by the 'ort' strategy.
 src/app/CreatePost.tsx                |  82 ---------
 src/app/PostsList.tsx                 | 116 -------------
 src/app/api/foods/route.ts            |   0
 src/app/food/page.tsx                 |  48 +++---
 src/app/home/FoodDiscoverySection.tsx |   4 +-
 src/app/home/FoodSearchBar.tsx        |  24 +--
 src/app/home/Recommand.tsx            |   2 +-
 src/app/home/event.tsx                |   2 +-
 src/app/home/location.tsx             |   2 +-
 src/app/not-found.tsx                 |  11 +-
 src/app/page.tsx                      | 302 +++++++++++++++++-----------------
 src/components/ui/Carosel.tsx         |   2 +-
 src/components/ui/TrueFocus.tsx       | 152 -----------------
 src/lib/services/api.ts               |  88 ----------
 src/test/ai.tsx                       |   3 +-
 15 files changed, 196 insertions(+), 642 deletions(-)
 delete mode 100644 src/app/CreatePost.tsx
 delete mode 100644 src/app/PostsList.tsx
 delete mode 100644 src/app/api/foods/route.ts
 delete mode 100644 src/components/ui/TrueFocus.tsx
 delete mode 100644 src/lib/services/api.ts



USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git add .

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git commmit -m "save latest commit 22"
git: 'commmit' is not a git command. See 'git --help'.

The most similar command is
        commit

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git pull origin dara
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            dara       -> FETCH_HEAD
Already up to date.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git branch 
  longfou
* longfu
  main
  master

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git checkout dara
error: Your local changes to the following files would be overwritten by checkout:
        run.git.NOTE.MD
Please commit your changes or stash them before you switch branches.
Aborting

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git fetch

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git fetch origin

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git branch
  longfou
* longfu
  main
  master

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git branch -a
  longfou
* longfu
  main
  master
  remotes/origin/HEAD -> origin/main
  remotes/origin/dara
  remotes/origin/longfou
  remotes/origin/longfu
  remotes/origin/lyta
  remotes/origin/main
  remotes/origin/mingyeak
  remotes/origin/souheng

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git fetch --all --prune

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git branch -a
  longfou
* longfu
  main
  master
  remotes/origin/HEAD -> origin/main
  remotes/origin/dara
  remotes/origin/longfou
  remotes/origin/longfu
  remotes/origin/lyta
  remotes/origin/main
  remotes/origin/mingyeak
  remotes/origin/souheng

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git switch dara
error: Your local changes to the following files would be overwritten by checkout:
        run.git.NOTE.MD
Please commit your changes or stash them before you switch branches.
Aborting

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git switch origin dara
fatal: only one reference expected

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git switch -c dara
Switched to a new branch 'dara'

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (dara)
$ git pull origin dara
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            dara       -> FETCH_HEAD
Already up to date.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (dara)
$ git pull origin longfu
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            longfu     -> FETCH_HEAD
Already up to date.


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (dara)
$ git pull origin longfu
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            longfu     -> FETCH_HEAD
Already up to date.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (dara)
$ git switch -c longfu
fatal: a branch named 'longfu' already exists

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (dara)
$ git switch longfu
M       run.git.NOTE.MD
Switched to branch 'longfu'
Your branch is ahead of 'origin/longfu' by 2 commits.
  (use "git push" to publish your local commits)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git add .

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git commit -m "save 22 commits lasted"
[longfu 83d7451] save 22 commits lasted
 1 file changed, 198 insertions(+)


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git checkout main
branch 'main' set up to track 'origin/main'.
Switched to a new branch 'main'

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (main)
$ git pull origin main
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            main       -> FETCH_HEAD
Already up to date.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git switch longfu
error: Your local changes to the following files would be overwritten by checkout:
        zNOte.version.MD
Please commit your changes or stash them before you switch branches.
Aborting

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git rm --cached zNOte.version.MD
rm 'zNOte.version.MD'

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git ls-files zNOte.version.MD

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git stash
Saved working directory and index state WIP on test/before-merge: 1e3a6b0 fixed errors in food page of applyFilters(recommendedFoods)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git switch longfu
Switched to branch 'longfu'
Your branch is ahead of 'origin/longfu' by 4 commits.
  (use "git push" to publish your local commits)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git branch
  dara
  longfu
  main
  master
* test/before-merge

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git switch longfu
error: Your local changes to the following files would be overwritten by checkout:
        zNOte.version.MD
Please commit your changes or stash them before you switch branches.
Aborting

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git rm --cached zNOte.version.MD
rm 'zNOte.version.MD'

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git ls-files zNOte.version.MD

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git stash
Saved working directory and index state WIP on test/before-merge: 1e3a6b0 fixed errors in food page of applyFilters(recommendedFoods)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (test/before-merge)
$ git switch longfu
Switched to branch 'longfu'
Your branch is ahead of 'origin/longfu' by 4 commits.
  (use "git push" to publish your local commits)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git rm --cached note.git.MD
rm 'note.git.MD'

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git rm --cached run.git.NOTE.MD
rm 'run.git.NOTE.MD'

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git commit -m "stop tracking note.MD that waste"
[longfu eb61aad] stop tracking note.MD that waste
 2 files changed, 1317 deletions(-)
 delete mode 100644 note.git.MD
 delete mode 100644 run.git.NOTE.MD

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfu)
$ git branch -m longfu longfou

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git push origin -u longfou
Enumerating objects: 16, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 16 threads
Compressing objects: 100% (11/11), done.
Writing objects: 100% (11/11), 4.08 KiB | 4.08 MiB/s, done.
Total 11 (delta 6), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (6/6), completed with 2 local objects.
remote: 
remote: Create a pull request for 'longfou' on GitHub by visiting:
remote:      https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend/pull/new/longfou
remote: 
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
 * [new branch]      longfou -> longfou
branch 'longfou' set up to track 'origin/longfou'.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git push origin --delete longfu
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
 - [deleted]         longfu


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git fetch --all 

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git pull origin souheng
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            souheng    -> FETCH_HEAD
Merge made by the 'ort' strategy.
 components.json                          |    3 +-
 package-lock.json                        |   11 +
 package.json                             |    1 +
 src/app/food/page.tsx                    |    2 +-
 src/app/globals.css                      |    9 +
 src/app/home/Recommand.tsx               |   12 +-
 src/app/page.tsx                         |    9 +-
 src/components/ui/skiper-ui/skiper26.tsx | 1217 ++++++++++++++++++++++++++++++
 src/components/ui/skiper-ui/skiper31.tsx |  275 +++++++
 src/components/ui/typing-animation.tsx   |  236 ++++++
 10 files changed, 1770 insertions(+), 5 deletions(-)
 create mode 100644 src/components/ui/skiper-ui/skiper26.tsx
 create mode 100644 src/components/ui/skiper-ui/skiper31.tsx
 create mode 100644 src/components/ui/typing-animation.tsx

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git commit -m "pulled lasted from souheng branch"
[longfou 3e48def] pulled lasted from souheng branch
 1 file changed, 1 insertion(+), 1 deletion(-)


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git reset --soft HEAD~1

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git commit-m  "pulled lasted code with skiper-ui"
git: 'commit-m' is not a git command. See 'git --help'.

The most similar command is
        commit-tree

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git commit -m "pulled lasted code with skiper-ui"
[longfou d0ee811] pulled lasted code with skiper-ui
 1 file changed, 1 insertion(+), 1 deletion(-)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git push origin longfou
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 16 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 687 bytes | 687.00 KiB/s, done.
Total 5 (delta 3), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (3/3), completed with 2 local objects.
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
   eb61aad..d0ee811  longfou -> longfou
   
USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git add .

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git commit -m "save yet update login"
[master 2342769] save yet update login
 9 files changed, 231 insertions(+), 25 deletions(-)
 create mode 100644 src/app/(auth)/layout.tsx
 create mode 100644 src/app/(auth)/login/page.tsx
 create mode 100644 src/app/api/auth/login/route.ts
 create mode 100644 src/app/api/foods/route.ts
 create mode 100644 src/components/auth/LoginForm.tsx
 create mode 100644 src/config/site.ts
 create mode 100644 src/lib/auth.ts

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (master)
$ git checkout longfou
Switched to branch 'longfou'
Your branch is up to date with 'origin/longfou'.

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git fetch
remote: Enumerating objects: 123, done.
remote: Counting objects: 100% (123/123), done.
remote: Compressing objects: 100% (103/103), done.
remote: Total 123 (delta 18), reused 122 (delta 18), pack-reused 0 (from 0)
Receiving objects: 100% (123/123), 12.70 MiB | 11.84 MiB/s, done.
Resolving deltas: 100% (18/18), completed with 10 local objects.
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
   d1cdd83..3ac91be  dara       -> origin/dara
   6d76606..3ac91be  main       -> origin/main
   a2d97d6..3ac91be  souheng    -> origin/souheng

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git pull origin souheng
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            souheng    -> FETCH_HEAD
Updating d0ee811..3ac91be
Fast-forward
 public/Image/food-picture/Old Woman icon.jpg       | Bin 0 -> 11056 bytes
 .../Old_Woman_icon-removebg-preview.png            | Bin 0 -> 35402 bytes
 public/Image/food-picture/card 1.jpg               | Bin 0 -> 136224 bytes
 public/Image/food-picture/card 10.jpg              | Bin 0 -> 65767 bytes
 public/Image/food-picture/card 2.jpg               | Bin 0 -> 87361 bytes
 public/Image/food-picture/card 3.jpg               | Bin 0 -> 141555 bytes
 public/Image/food-picture/card 4.jpg               | Bin 0 -> 82076 bytes
 public/Image/food-picture/card 5                   | Bin 0 -> 92565 bytes
 public/Image/food-picture/card 6.jpg               | Bin 0 -> 140449 bytes
 public/Image/food-picture/card 7.jpg               | Bin 0 -> 55989 bytes
 public/Image/food-picture/card 8.jpg               | Bin 0 -> 103663 bytes
 public/Image/food-picture/card 9.jpg               | Bin 0 -> 100793 bytes
 public/Image/food-picture/drink 1.jpg              | Bin 0 -> 108304 bytes
 public/Image/food-picture/drink 2.jpg              | Bin 0 -> 121628 bytes
 public/Image/food-picture/drink 3.jpg              | Bin 0 -> 75383 bytes
 public/Image/food-picture/food 1.jpg               | Bin 0 -> 37025 bytes
 public/Image/food-picture/food 10.jpg              | Bin 0 -> 98857 bytes
 public/Image/food-picture/food 11.jpg              | Bin 0 -> 87069 bytes
 public/Image/food-picture/food 12.jpg              | Bin 0 -> 91161 bytes
 public/Image/food-picture/food 13.jpg              | Bin 0 -> 122576 bytes
 public/Image/food-picture/food 14.jpg              | Bin 0 -> 102005 bytes
 public/Image/food-picture/food 15.jpg              | Bin 0 -> 632908 bytes
 public/Image/food-picture/food 16.jpg              | Bin 0 -> 141525 bytes
 public/Image/food-picture/food 17.jpg              | Bin 0 -> 120732 bytes
 public/Image/food-picture/food 18.jpg              | Bin 0 -> 47348 bytes
 public/Image/food-picture/food 19.jpg              | Bin 0 -> 41093 bytes
 public/Image/food-picture/food 2.jpg               | Bin 0 -> 64989 bytes
 public/Image/food-picture/food 20.jpg              | Bin 0 -> 73466 bytes
 public/Image/food-picture/food 21.webp             | Bin 0 -> 764556 bytes
 public/Image/food-picture/food 22.jpg              | Bin 0 -> 149662 bytes
 public/Image/food-picture/food 23.jpg              | Bin 0 -> 147605 bytes
 public/Image/food-picture/food 24.jpg              | Bin 0 -> 121198 bytes
 public/Image/food-picture/food 25.jpg              | Bin 0 -> 104402 bytes
 public/Image/food-picture/food 26.jpg              | Bin 0 -> 101223 bytes
 public/Image/food-picture/food 27.jpg              | Bin 0 -> 111275 bytes
 public/Image/food-picture/food 28.jpg              | Bin 0 -> 76003 bytes
 public/Image/food-picture/food 29.jpg              | Bin 0 -> 145347 bytes
 public/Image/food-picture/food 3.jpg               | Bin 0 -> 60359 bytes
 public/Image/food-picture/food 30.jpg              | Bin 0 -> 165686 bytes
 public/Image/food-picture/food 4.jpg               | Bin 0 -> 63169 bytes
 public/Image/food-picture/food 5.jpg               | Bin 0 -> 95819 bytes
 public/Image/food-picture/food 6.jpg               | Bin 0 -> 89164 bytes
 public/Image/food-picture/food 7.jpg               | Bin 0 -> 150458 bytes
 public/Image/food-picture/food 8.webp              | Bin 0 -> 48726 bytes
 public/Image/food-picture/food 9.jpg               | Bin 0 -> 130518 bytes
 .../Image/food-picture/food_1-removebg-preview.png | Bin 0 -> 285785 bytes
 .../Image/food-picture/food_2-removebg-preview.png | Bin 0 -> 521636 bytes
 .../Image/food-picture/food_3-removebg-preview.png | Bin 0 -> 371629 bytes
 .../Image/food-picture/food_4-removebg-preview.png | Bin 0 -> 234359 bytes
 .../Image/food-picture/food_5-removebg-preview.png | Bin 0 -> 456943 bytes
 .../Image/food-picture/food_6-removebg-preview.png | Bin 0 -> 442141 bytes
 public/Image/food-picture/kid food.jpg             | Bin 0 -> 108854 bytes
 public/Image/food-picture/kid icon.jpg             | Bin 0 -> 19643 bytes
 .../food-picture/kid_icon-removebg-preview.png     | Bin 0 -> 121439 bytes
 public/Image/food-picture/teenager icon.jpg        | Bin 0 -> 24360 bytes
 .../teenager_icon-removebg-preview.png             | Bin 0 -> 108338 bytes
 public/about/cher.jpg                              | Bin 0 -> 54282 bytes
 public/about/cher1.jpg                             | Bin 0 -> 59651 bytes
 public/about/food01.jpg                            | Bin 0 -> 179461 bytes
 public/about/food02.jpg                            | Bin 0 -> 68270 bytes
 public/about/food03.jpg                            | Bin 0 -> 104697 bytes
 public/about/food10.webp                           | Bin 0 -> 372034 bytes
 public/about/food100.jpg                           | Bin 0 -> 120772 bytes
 public/about/food4.jpg                             | Bin 0 -> 160996 bytes
 public/about/food5.jpg                             | Bin 0 -> 62515 bytes
 public/about/food9.webp                            | Bin 0 -> 108264 bytes
 public/about/fooooo.jpg                            | Bin 0 -> 189656 bytes
 public/about/frame.png                             | Bin 0 -> 226983 bytes
 public/about/how.png                               | Bin 0 -> 477768 bytes
 public/about/lokb.jpg                              | Bin 0 -> 43990 bytes
 public/about/mee.png                               | Bin 0 -> 617299 bytes
 public/about/su.jpeg                               | Bin 0 -> 122701 bytes
 public/about/su.png                                | Bin 0 -> 591875 bytes
 public/about/sweet.png                             | Bin 0 -> 1129119 bytes
 public/about/us.png                                | Bin 0 -> 438227 bytes
 src/app/(about)/about/page.tsx                     |  28 ++-
 src/app/food/page.tsx                              | 201 ++---------------
 src/app/home/SectionModal.tsx                      |   2 +-
 src/app/home/popular.tsx                           |  68 +++---
 src/app/layout.tsx                                 |   2 +-
 src/app/not-found.tsx                              |   6 +-
 src/app/page.tsx                                   |   6 +-
 src/components/Foodnavtabs.tsx                     | 105 +++++++++
 src/components/about/CommunitySection.tsx          | 224 +++++++++++++++++++
 src/components/about/ContactSection.tsx            | 240 +++++++++++++++++++++
 src/components/about/GoalsSection.tsx              | 146 +++++++++++++
 src/components/about/HeroSection.tsx               | 117 ++++++++++
 src/components/about/HowToUseSection.tsx           | 220 +++++++++++++++++++
 src/components/about/MarqueeSection.tsx            |  79 +++++++
 .../about/MarqueeSectionOrangeReverse.tsx          |  47 ++++
 src/components/about/MentorSection.tsx             | 128 +++++++++++
 src/components/about/StatsSection.tsx              | 113 ++++++++++
 src/components/about/WhyChooseUsSection.tsx        |  51 +++++
 src/lib/scv.ts                                     |  48 +++++
 94 files changed, 1608 insertions(+), 223 deletions(-)
 create mode 100644 public/Image/food-picture/Old Woman icon.jpg
 create mode 100644 public/Image/food-picture/Old_Woman_icon-removebg-preview.png
 create mode 100644 public/Image/food-picture/card 1.jpg
 create mode 100644 public/Image/food-picture/card 10.jpg
 create mode 100644 public/Image/food-picture/card 2.jpg
 create mode 100644 public/Image/food-picture/card 3.jpg
 create mode 100644 public/Image/food-picture/card 4.jpg
 create mode 100644 public/Image/food-picture/card 5
 create mode 100644 public/Image/food-picture/card 6.jpg
 create mode 100644 public/Image/food-picture/card 7.jpg
 create mode 100644 public/Image/food-picture/card 8.jpg
 create mode 100644 public/Image/food-picture/card 9.jpg
 create mode 100644 public/Image/food-picture/drink 1.jpg
 create mode 100644 public/Image/food-picture/drink 2.jpg
 create mode 100644 public/Image/food-picture/drink 3.jpg
 create mode 100644 public/Image/food-picture/food 1.jpg
 create mode 100644 public/Image/food-picture/food 10.jpg
 create mode 100644 public/Image/food-picture/food 11.jpg
 create mode 100644 public/Image/food-picture/food 12.jpg
 create mode 100644 public/Image/food-picture/food 13.jpg
 create mode 100644 public/Image/food-picture/food 14.jpg
 create mode 100644 public/Image/food-picture/food 15.jpg
 create mode 100644 public/Image/food-picture/food 16.jpg
 create mode 100644 public/Image/food-picture/food 17.jpg
 create mode 100644 public/Image/food-picture/food 18.jpg
 create mode 100644 public/Image/food-picture/food 19.jpg
 create mode 100644 public/Image/food-picture/food 2.jpg
 create mode 100644 public/Image/food-picture/food 20.jpg
 create mode 100644 public/Image/food-picture/food 21.webp
 create mode 100644 public/Image/food-picture/food 22.jpg
 create mode 100644 public/Image/food-picture/food 23.jpg
 create mode 100644 public/Image/food-picture/food 24.jpg
 create mode 100644 public/Image/food-picture/food 25.jpg
 create mode 100644 public/Image/food-picture/food 26.jpg
 create mode 100644 public/Image/food-picture/food 27.jpg
 create mode 100644 public/Image/food-picture/food 28.jpg
 create mode 100644 public/Image/food-picture/food 29.jpg
 create mode 100644 public/Image/food-picture/food 3.jpg
 create mode 100644 public/Image/food-picture/food 30.jpg
 create mode 100644 public/Image/food-picture/food 4.jpg
 create mode 100644 public/Image/food-picture/food 5.jpg
 create mode 100644 public/Image/food-picture/food 6.jpg
 create mode 100644 public/Image/food-picture/food 7.jpg
 create mode 100644 public/Image/food-picture/food 8.webp
 create mode 100644 public/Image/food-picture/food 9.jpg
 create mode 100644 public/Image/food-picture/food_1-removebg-preview.png
 create mode 100644 public/Image/food-picture/food_2-removebg-preview.png
 create mode 100644 public/Image/food-picture/food_3-removebg-preview.png
 create mode 100644 public/Image/food-picture/food_4-removebg-preview.png
 create mode 100644 public/Image/food-picture/food_5-removebg-preview.png
 create mode 100644 public/Image/food-picture/food_6-removebg-preview.png
 create mode 100644 public/Image/food-picture/kid food.jpg
 create mode 100644 public/Image/food-picture/kid icon.jpg
 create mode 100644 public/Image/food-picture/kid_icon-removebg-preview.png
 create mode 100644 public/Image/food-picture/teenager icon.jpg
 create mode 100644 public/Image/food-picture/teenager_icon-removebg-preview.png
 create mode 100644 public/about/cher.jpg
 create mode 100644 public/about/cher1.jpg
 create mode 100644 public/about/food01.jpg
 create mode 100644 public/about/food02.jpg
 create mode 100644 public/about/food03.jpg
 create mode 100644 public/about/food10.webp
 create mode 100644 public/about/food100.jpg
 create mode 100644 public/about/food4.jpg
 create mode 100644 public/about/food5.jpg
 create mode 100644 public/about/food9.webp
 create mode 100644 public/about/fooooo.jpg
 create mode 100644 public/about/frame.png
 create mode 100644 public/about/how.png
 create mode 100644 public/about/lokb.jpg
 create mode 100644 public/about/mee.png
 create mode 100644 public/about/su.jpeg
 create mode 100644 public/about/su.png
 create mode 100644 public/about/sweet.png
 create mode 100644 public/about/us.png
 create mode 100644 src/components/Foodnavtabs.tsx
 create mode 100644 src/components/about/CommunitySection.tsx
 create mode 100644 src/components/about/ContactSection.tsx
 create mode 100644 src/components/about/GoalsSection.tsx
 create mode 100644 src/components/about/HeroSection.tsx
 create mode 100644 src/components/about/HowToUseSection.tsx
 create mode 100644 src/components/about/MarqueeSection.tsx
 create mode 100644 src/components/about/MarqueeSectionOrangeReverse.tsx
 create mode 100644 src/components/about/MentorSection.tsx
 create mode 100644 src/components/about/StatsSection.tsx
 create mode 100644 src/components/about/WhyChooseUsSection.tsx
 create mode 100644 src/lib/scv.ts
 

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git fetch
remote: Enumerating objects: 211, done.
remote: Counting objects: 100% (211/211), done.
remote: Compressing objects: 100% (119/119), done.
remote: Total 211 (delta 104), reused 186 (delta 79), pack-reused 0 (from 0)
Receiving objects: 100% (211/211), 271.88 KiB | 352.00 KiB/s, done.
Resolving deltas: 100% (104/104), completed with 16 local objects.
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
   3ac91be..426e86d  main       -> origin/main
   0bd49ae..4818d93  mingyeak   -> origin/mingyeak
   3ac91be..837dc73  souheng    -> origin/souheng

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git pull origin souheng
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            souheng    -> FETCH_HEAD
Updating 3ac91be..837dc73
Fast-forward
 .../(dashboard)/dashboard/family-profile/page.tsx  | 172 +++++
 src/app/(dashboard)/dashboard/favorites/page.tsx   |  73 ++
 .../(dashboard)/dashboard/notifications/page.tsx   | 111 ++++
 src/app/(dashboard)/dashboard/page.tsx             |  14 +
 src/app/(dashboard)/dashboard/review/page.tsx      |  71 ++
 src/app/(dashboard)/layout.tsx                     |  46 ++
 src/app/{(about) => (site)}/about/page.tsx         |   0
 src/app/{ => (site)}/food/page.tsx                 |  41 +-
 src/app/(site)/layout.tsx                          |  24 +
 src/app/{ => (site)}/page.tsx                      |  31 +-
 src/app/home/Spinwheel .tsx                        | 315 ---------
 src/app/layout.tsx                                 |  50 +-
 src/app/providers.tsx                              |   9 -
 src/components/FoodCardComponent.tsx               |   2 +-
 src/components/dashboard/FoodChipInput.tsx         |  85 +++
 src/components/dashboard/TagToggle.tsx             |  40 ++
 src/components/dashboard/UserDashboard.tsx         | 407 ++++++++++++
 .../dashboard/family-profile/FamilyMemberList.tsx  |  51 ++
 .../family-profile/FoodRecommendationCard.tsx      |  91 +++
 .../dashboard/family-profile/MealTimeTabs.tsx      |  40 ++
 .../dashboard/favorites/FavoriteFoodRow.tsx        |  78 +++
 .../dashboard/notifications/NotificationCard.tsx   |  94 +++
 .../notifications/NotificationFilters.tsx          |  64 ++
 .../dashboard/notifications/NotificationGroup.tsx  |  32 +
 .../notifications/NotificationSummaryCards.tsx     |  61 ++
 .../notifications/NotificationsEmptyState.tsx      |  14 +
 .../notifications/NotificationsHeader.tsx          |  48 ++
 .../dashboard/review/ReviewFilterTabs.tsx          |  48 ++
 src/components/dashboard/review/ReviewTable.tsx    | 131 ++++
 src/{app => components}/home/FoodCard.tsx          |   4 +-
 .../home/FoodDiscoverySection.tsx                  |  16 +-
 src/{app => components}/home/FoodSearchBar.tsx     |   0
 .../home/RecommendationStack.tsx                   |  10 +-
 src/{app => components}/home/SectionModal.tsx      |  27 +-
 src/components/home/Spinwheel .tsx                 | 734 +++++++++++++++++++++
 src/{app => components}/home/age.tsx               |   0
 src/{app => components}/home/event.tsx             |   0
 .../home/filterByCategory.tsx}                     |   0
 src/{app => components}/home/fitfood.tsx           |   0
 src/{app => components}/home/location.tsx          |   0
 src/{app => components}/home/popular.tsx           |   0
 .../home/recommand.tsx}                            |   2 +-
 src/{app => components}/home/season.tsx            |   0
 src/components/layout/Aside.tsx                    | 216 ++++++
 src/{app => components}/layout/Footer.tsx          |   0
 src/{app => components}/layout/Navbar.tsx          |   0
 src/config/dashboardNav.ts                         |  41 ++
 src/{app => }/hooks/useAppDispatch.ts              |   0
 src/lib/notifications/category-styles.ts           |  70 ++
 src/lib/notifications/mock-data.ts                 | 330 +++++++++
 src/test/ai.tsx                                    |   6 +-
 src/test/spinv1.tsx                                |   2 +-
 src/types/dashboard.ts                             |  31 +
 src/types/family-profile.ts                        |  23 +
 src/types/favorite.ts                              |  10 +
 src/{app => }/types/food-v1.ts                     |   0
 src/{app => }/types/food.ts                        |   0
 src/types/notifications.ts                         |  62 ++
 src/types/review.ts                                |  12 +
 59 files changed, 3427 insertions(+), 412 deletions(-)
 create mode 100644 src/app/(dashboard)/dashboard/family-profile/page.tsx
 create mode 100644 src/app/(dashboard)/dashboard/favorites/page.tsx
 create mode 100644 src/app/(dashboard)/dashboard/notifications/page.tsx
 create mode 100644 src/app/(dashboard)/dashboard/page.tsx
 create mode 100644 src/app/(dashboard)/dashboard/review/page.tsx
 create mode 100644 src/app/(dashboard)/layout.tsx
 rename src/app/{(about) => (site)}/about/page.tsx (100%)
 rename src/app/{ => (site)}/food/page.tsx (95%)
 create mode 100644 src/app/(site)/layout.tsx
 rename src/app/{ => (site)}/page.tsx (96%)
 delete mode 100644 src/app/home/Spinwheel .tsx
 delete mode 100644 src/app/providers.tsx
 create mode 100644 src/components/dashboard/FoodChipInput.tsx
 create mode 100644 src/components/dashboard/TagToggle.tsx
 create mode 100644 src/components/dashboard/UserDashboard.tsx
 create mode 100644 src/components/dashboard/family-profile/FamilyMemberList.tsx
 create mode 100644 src/components/dashboard/family-profile/FoodRecommendationCard.tsx
 create mode 100644 src/components/dashboard/family-profile/MealTimeTabs.tsx
 create mode 100644 src/components/dashboard/favorites/FavoriteFoodRow.tsx
 create mode 100644 src/components/dashboard/notifications/NotificationCard.tsx
 create mode 100644 src/components/dashboard/notifications/NotificationFilters.tsx
 create mode 100644 src/components/dashboard/notifications/NotificationGroup.tsx
 create mode 100644 src/components/dashboard/notifications/NotificationSummaryCards.tsx
 create mode 100644 src/components/dashboard/notifications/NotificationsEmptyState.tsx
 create mode 100644 src/components/dashboard/notifications/NotificationsHeader.tsx
 create mode 100644 src/components/dashboard/review/ReviewFilterTabs.tsx
 create mode 100644 src/components/dashboard/review/ReviewTable.tsx
 rename src/{app => components}/home/FoodCard.tsx (97%)
 rename src/{app => components}/home/FoodDiscoverySection.tsx (80%)
 rename src/{app => components}/home/FoodSearchBar.tsx (100%)
 rename src/{app => components}/home/RecommendationStack.tsx (96%)
 rename src/{app => components}/home/SectionModal.tsx (92%)
 create mode 100644 src/components/home/Spinwheel .tsx
 rename src/{app => components}/home/age.tsx (100%)
 rename src/{app => components}/home/event.tsx (100%)
 rename src/{app/home/FilterByCategory.tsx => components/home/filterByCategory.tsx} (100%)
 rename src/{app => components}/home/fitfood.tsx (100%)
 rename src/{app => components}/home/location.tsx (100%)
 rename src/{app => components}/home/popular.tsx (100%)
 rename src/{app/home/Recommand.tsx => components/home/recommand.tsx} (99%)
 rename src/{app => components}/home/season.tsx (100%)
 create mode 100644 src/components/layout/Aside.tsx
 rename src/{app => components}/layout/Footer.tsx (100%)
 rename src/{app => components}/layout/Navbar.tsx (100%)
 create mode 100644 src/config/dashboardNav.ts
 rename src/{app => }/hooks/useAppDispatch.ts (100%)
 create mode 100644 src/lib/notifications/category-styles.ts
 create mode 100644 src/lib/notifications/mock-data.ts
 create mode 100644 src/types/dashboard.ts
 create mode 100644 src/types/family-profile.ts
 create mode 100644 src/types/favorite.ts
 rename src/{app => }/types/food-v1.ts (100%)
 rename src/{app => }/types/food.ts (100%)
 create mode 100644 src/types/notifications.ts
 create mode 100644 src/types/review.ts

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git commit -m "Updated code lested pull commit 50th souheng"
On branch longfou
Your branch is ahead of 'origin/longfou' by 20 commits.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git checkout test/before-merge
Switched to branch 'test/before-merge'
Your branch is up to date with 'origin/test/before-merge'.
