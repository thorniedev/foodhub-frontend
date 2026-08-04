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

<!-- 1. Rename your current branch
Example: you are currently on longfou: -->
git branch -m new_name

<!-- Example: -->
git branch -m longfou main

<!-- Now longfou becomes main. -->
<!-- 2. Rename a branch you are not currently on -->
git branch -m old_name new_name

<!-- Example: -->
git branch -m longfou foodhub-dev

<!-- 3. If the branch already exists on GitHub (remote)
After renaming locally, push the new branch: -->

git push origin -u new_name

<!-- Example: -->
git push origin -u foodhub-dev

<!-- Then delete the old remote branch: -->
git push origin --delete old_name

<!-- Example: -->
git push origin --delete longfou

<!-- 4. Check your branches
Local:
git branch -->
<!-- All branches: -->
git branch -a

<!-- For your current situation, you are on: -->
<!-- (longfou) -->
<!-- If you want to rename it to main, run: -->
git branch -m main

<!-- Then update GitHub: -->
git push origin -u main

<!-- % --delete branch -->
git push origin --delete fou

<!-- % -- -->
git pull origin souheng

<!-- % --reset contributeor -->

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

<!-- --------------------------------- -->
git reset --soft HEAD~1

means:

Remove only the latest one commit from the current branch, but keep all changes from that commit.

Let's break it down:

HEAD

Means your current commit.

Example history:

A --- B --- C --- D (HEAD)

D is your latest commit.

HEAD~1

Means:

Go back 1 commit before HEAD

So:

A --- B --- C --- D (HEAD)

reset to:

A --- B --- C (HEAD)

The commit D is removed from the branch history.

What does --soft do?

--soft keeps the changes from the removed commit:

Before:

Commit D:
- changed file1
- changed file2

After:

Commit D removed

Changes are still staged:
- file1 modified
- file2 modified

You can create a new commit:

git commit -m "better message"


<!-- ----- Save history to file command ----- -->
git fetch --all
git status
git add .

history >> Git-Commands.md

<!-- ----- Save history to file command Ubuntu ----- -->
<!-- 1. start recording history -->
script Git-Session.log
script Git-Commands.md
script -a Git-FoodHub-Commands-$(date +%Y-%m-%d).log

<!-- 2. middle recording history your tasks -->
git status
git add .
git push origin longfou

<!-- 3. Stop recording when finished -->
<!-- Run: -->

exit

<!-- =======================
    Standard Commit 
 ======================= -->
<!-- Types -->
 feat: A completely new "FEATURE" addition for the codebase or application.
 fix: A bug "FIX" or technical error resolution.
 docs: Changes limited exclusively to "Documentation", markdown files, or code comments.
 style: "Formatting" and visual adjustments that do not impact code logic (e.g., indentation, whitespaces).
 refactor: "Rewriting or Updating" or restructuring production code without altering its behavior or adding features.
 perf: "Performance" updates specifically implemented to speed up or optimize the application.
 test: Adding missing unit "TESTS" or correcting existing test suites.
 build: Modifications affecting "Build Systems", external dependencies, or package versions.
 ci: "Continuous Integration" or deployment updates (e.g., GitHub Actions, GitLab CI scripts).
 chore: Routine maintenance tasks such as updating .gitignore

<!-- =======================
    Real-World
 ======================= -->
<!-- Examples -->
<!-- Simple Feature: -->
feat(auth): add JWT-based session expiration handling 
<!-- Bug Fix: -->
fix(api): correct rounding error on checkout tax calculations 
<!-- Breaking Change: -->
feat(database)!: drop support for legacy PostgreSQL v11 engines
<!-- Documentation Update: -->
docs(readme): add environment variable installation steps

<!-- -- -->
git commit -m "chore: save progress before merge"