
USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git add .

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git commit -m "fixed error confliction codes longfou with main "
[longfou 281cfb7] fixed error confliction codes longfou with main
 2 files changed, 6 deletions(-)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git push origin longfou
To https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git
 ! [rejected]        longfou -> longfou (non-fast-forward)
error: failed to push some refs to 'https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git commit -m "fixed error confliction codes longfou with main "
[longfou 90779ca] fixed error confliction codes longfou with main
 2 files changed, 18 insertions(+), 25 deletions(-)
 create mode 100644 zNOte.version.MD

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git add .

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git commit -m "fixed error confliction codes longfou with main "
[longfou 9761597] fixed error confliction codes longfou with main
 1 file changed, 1 insertion(+)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git pull origin souheng
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            souheng    -> FETCH_HEAD
Auto-merging src/app/food/page.tsx
CONFLICT (content): Merge conflict in src/app/food/page.tsx
Automatic merge failed; fix conflicts and then commit the result.


USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou|MERGING)
$ git add .

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou|MERGING)
$ git commit -m "fixed errors in food page of applyFilters(recommendedFoods)"
[longfou 45387ab] fixed errors in food page of applyFilters(recommendedFoods)

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git fetch origin
remote: Enumerating objects: 19, done.
remote: Counting objects: 100% (19/19), done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 19 (delta 13), reused 19 (delta 13), pack-reused 0 (from 0)
Unpacking objects: 100% (19/19), 11.68 KiB | 50.00 KiB/s, done.
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
   6d76606..a2d97d6  souheng    -> origin/souheng


   
USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git stash
Saved working directory and index state WIP on longfou: ed846f8 Update zNOte.version.MD

USER@DESKTOP-M1TVSAR MINGW64 /d/ISTAD/ITE3rd/ITE-FOODHUB-3rd-Frontend/foodhub-frontend (longfou)
$ git pull origin longfou
From https://github.com/ITE-GEN03-BASIC-COURSE/foodhub-frontend
 * branch            longfou    -> FETCH_HEAD
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.