--- a/src/components/__tests__/TeamRoster.test.tsx
+++ b/src/components/__tests__/TeamRoster.test.tsx
@@ -12,13 +12,13 @@ globalThis.fetch = jest.fn(() =>
   Promise.resolve({
     ok: true,
     headers: { get: () => 'application/json' },
-<<<<<<< 4u5gyb-codex/fix-json-parsing-error-on-team-creation
-    json: () => Promise.resolve(mockTeams),
-    text: () => Promise.resolve(JSON.stringify(mockTeams))
-=======
-    json: () => Promise.resolve(mockTeams)
->>>>>>> main
+    json: () => Promise.resolve(mockTeams),
+    text: () => Promise.resolve(JSON.stringify(mockTeams))
   })
 ) as jest.Mock;
