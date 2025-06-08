*** Begin Patch
*** Update File: vite.config.ts
@@ export default defineConfig(({ mode }) => {
-    <<<<<<< codex/refactor-define-section-in-vite.config.ts
-    server: {
-      host: "::",
-      port: 8080,
-    },
-    plugins: [
-      react(),
-      mode === 'development' &&
-      componentTagger(),
-    ].filter(Boolean),
-    resolve: {
-      alias: {
-        "@": path.resolve(__dirname, "./src"),
-      },
-    },
-    define: {
-      "process.env": env,
-    },
-    =======
-    server: { host: "::", port: 8080 },
-    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
-    define: { "process.env": env },
-    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
-    >>>>>>> main
+    server: {
+      host: "::",
+      port: 8080,
+    },
+    plugins: [
+      react(),
+      mode === "development" && componentTagger(),
+    ].filter(Boolean),
+    resolve: {
+      alias: {
+        "@": path.resolve(__dirname, "./src"),
+      },
+    },
+    define: {
+      "process.env": env,
+    },
*** End Patch
