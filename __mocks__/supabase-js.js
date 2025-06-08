export const createClient = () => ({
  auth: {
    signInWithPassword: () => Promise.resolve({}),
    signUp: () => Promise.resolve({}),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    getSession: () => Promise.resolve({ data: { session: null } }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [] }),
    insert: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  }),
});
export default { createClient };
