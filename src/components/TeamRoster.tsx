*** Begin Patch
*** Update File: src/components/TeamRoster.tsx
@@
-                <Button
-                  className="w-full"
-                  onClick={async () => {
-<<<<<<< codex/update-createteam-handler-with-validation-and-error-handling
-                    const valid = speakers.filter(Boolean);
-                    if (valid.length < 1 || valid.length > 5) {
-                      alert('Team must have between 1 and 5 speakers');
-=======
-                    const validSpeakers = speakers.filter(Boolean);
-                    if (validSpeakers.length < 1) {
-                      alert('Team must have at least one speaker');
-                      return;
-                    }
-                    if (validSpeakers.length > 5) {
-                      alert('Cannot add more than 5 speakers');
->>>>>>> main
-                      return;
-                    }
-                    try {
-                      await createTeam();
-                      setTeamName('');
-                      setOrganization('');
-                      setSpeakers(['', '']);
-                      if (fileInputRef.current) fileInputRef.current.value = '';
-                      setOpen(false);
-                    } catch (err) {
-<<<<<<< codex/update-createteam-handler-with-validation-and-error-handling
-                      console.error(err);
-                      alert(err instanceof Error ? err.message : String(err));
-=======
-                      alert('Failed to create team');
->>>>>>> main
-                    }
-                  }}
-                >
-                  Create Team
-                </Button>
+                <Button
+                  className="w-full"
+                  onClick={async () => {
+                    // Validate speaker count
+                    const validSpeakers = speakers.filter(Boolean);
+                    if (validSpeakers.length < 1) {
+                      alert('Team must have at least one speaker');
+                      return;
+                    }
+                    if (validSpeakers.length > 5) {
+                      alert('Cannot add more than 5 speakers');
+                      return;
+                    }
+
+                    try {
+                      await createTeam();
+                      // reset form
+                      setTeamName('');
+                      setOrganization('');
+                      setSpeakers(['', '']);
+                      if (fileInputRef.current) fileInputRef.current.value = '';
+                      setOpen(false);
+                    } catch (err) {
+                      console.error(err);
+                      alert(err instanceof Error ? err.message : 'Failed to create team');
+                    }
+                  }}
+                >
+                  Create Team
+                </Button>
*** End Patch
