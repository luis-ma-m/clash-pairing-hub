*** Begin Patch
*** Update File: vite.config.ts
@@
-export default defineConfig(({ mode }) => {
+export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd(), "VITE_");
   return {
-  server: {
-    host: "::",
-    port: 8080,
-  },
-  plugins: [
-    react(),
-    mode === 'development' &&
-    componentTagger(),
-  ].filter(Boolean),
-  resolve: {
-    alias: {
-      "@": path.resolve(__dirname, "./src"),
-    },
-  },
-    define: {
-      "process.env": env,
-    },
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
   };
 });
*** End Patch
