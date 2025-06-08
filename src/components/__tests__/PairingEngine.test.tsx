```ts
/// <reference types="@testing-library/jest-dom" />
-import { render, screen, waitFor } from '@testing-library/react';
-import { act } from 'react';
+import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
-
-jest.mock('@/lib/supabase');
+// Mock Supabase client to avoid ESM-only package loading
+jest.mock('@/lib/supabase', () => ({
+  supabase: { from: jest.fn() },
+  __esModule: true,
+}));

-import PairingEngine from '../PairingEngine';
-import { supabase } from '@/lib/supabase';
+import PairingEngine from '../PairingEngine';
+import { supabase } from '@/lib/supabase';
```
