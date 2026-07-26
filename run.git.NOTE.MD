git fetch --all
git branch -a

<!-- foodhub-frontend (souheng) -->
$ git branch -a
* souheng
  remotes/origin/HEAD -> origin/souheng
  remotes/origin/dara
  remotes/origin/longfou
  remotes/origin/lyta
  remotes/origin/mingyeak
  remotes/origin/souheng

git checkout longfou
git pull origin <branch-name>

% 1.Stash local changes:Saves temporary work.Save your modified files to Git's temporary storage:
git stash
% Now switch over to the branch:
git branch -m master longfou

git checkout longfou

git checkout package-lock.json


git init
git remote add origin https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
git fetch origin
git checkout longfou

git status
% If you want your changes back later:
git stash pop

% Option C (delete your changes)
% If you don't need them:
git restore note.git.MD run.git.NOTE.MD

git remote -v
git branch -a

% ---
git checkout -b longfou origin/longfou
git switch -c longfou origin/longfou
$ git switch -c longfou
Switched to a new branch 'longfou'

<!-- --push -->
git push --force origin longfou
git push -f origin longfou

git add note.git.MD run.git.NOTE.MD

# Make sure you're on the latest main branch
git checkout main
git pull origin main

# Create a new branch
git checkout -b your-new-branch

# Or with the newer command
git switch -c your-new-branch

# Push the new branch to GitHub
git push -u origin your-new-branch


<!-- foodhub-frontend (master) -->
$ git switch -c fou
Switched to a new branch 'fou'

% foodhub-frontend (fou)
$ git branch
* fou
  master

<!-- foodhub-frontend (fou) -->
$ git remote -v

% foodhub-frontend (fou)
git remote add origin https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
<!-- 
% foodhub-frontend (fou) -->
git remote -v
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (fetch)
origin  https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git (push)

% foodhub-frontend (fou)
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

<!-- foodhub-frontend (fou) -->
git log --format="%an <%ae>" -5

git log --format='%an <%ae>'
Longfou1900 <foufou9172@gmail.com>  

1. Rename your local branch
You are currently on fou, so run:

git branch -m main

Check:

git branch

You should see:

* main
  master

% --delete branch
git push origin --delete fou

% --
git pull origin souheng

% --reset contributeor
 .

git config --global user.name "Longfou1900"
git config --global user.email "FouFou9172@gmail.com"
git commit --amend --reset-author --no-edit
git push --force origin longfou

% --
% # Remove node_modules and lock files completely
rm -rf node_modules
rm -rf package-lock.json
or
% # Step 2: Remove everything
rm -rf node_modules package-lock.json

% # Clear npm cache completely
npm cache clean --force

% # Try installing again
npm install
npm run dev

% ==Solution 2: Update npm to the Latest Version====
% Your npm version might be outdated. Update it:

npm install -g npm@latest

% # Step 1: Update valibot
npm install valibot@latest --save


% ---
# Step 1: Kill current process (Ctrl + C)
# Then try:

# Step 2: Quick fix with legacy-peer-deps
npm install --legacy-peer-deps

# If that still uses too much RAM, try Yarn:
npm install -g yarn
rm -rf node_modules package-lock.json
yarn install

# If Yarn also fails, try pnpm (most efficient):
npm install -g pnpm
rm -rf node_modules package-lock.json
pnpm install


% --fix 
% # First, try the safe fix
npm audit fix

% # If that doesn't fix all, use force
npm audit fix --force

% # Then check what was fixed
npm audit


% ----save stash code version
% # Step 1: Undo the commit but keep changes
git reset HEAD~1

% # Step 2: Now stash the changes
git stash

% # Step 3: Switch to target branch
git checkout your-target-branch-name

% # Step 4: Apply/restore the stash
git stash pop

% -------check git match gmail github or not
% Does your git email match your GitHub email? Check it:

git config --global user.email
FouFou9172@gmail.com

% ---
git pull origin longfou --allow-unrelated-histories

% # Step 1: Stop npm (Ctrl + C)

% # Step 2: Accept your local changes
git diff --name-only --diff-filter=U | xargs git checkout --ours

% # Step 3: Complete the merge
git add .
git commit -m "Resolve merge conflicts - keep local version"

% # Step 4: Clean and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

% # Step 5: Push
git push origin longfou



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

 

