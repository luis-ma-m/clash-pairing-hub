let mockData = {};
export function __setMockData(data) {
  mockData = data;
}

const makeThenable = result => {
  const promise = Promise.resolve(result);
  return {
    then: (res, rej) => promise.then(res, rej),
  };
};

export const createClient = () => ({
  auth: {
    signInWithPassword: () => Promise.resolve({}),
    signUp: () => Promise.resolve({}),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    getSession: () => Promise.resolve({ data: { session: null } }),
  },
  from: table => ({
    select: () => {
      const result = { data: mockData[table] || [], error: null };
      const promise = makeThenable(result);
      promise.eq = (field, value) => {
        const records = (mockData[table] || []).filter(r => r[field] === value);
        const eqRes = { data: records, error: null };
        const eqPromise = makeThenable(eqRes);
        eqPromise.single = () => Promise.resolve({ data: records[0] || null, error: null });
        return eqPromise;
      };
      promise.single = () => Promise.resolve({ data: (mockData[table] || [])[0] || null, error: null });
      return promise;
    },
    insert: values => {
      const arr = Array.isArray(values) ? values : [values];
      const inserted = arr.map(v => ({ id: Date.now(), ...v }));
      mockData[table] = (mockData[table] || []).concat(inserted);
      const result = { data: Array.isArray(values) ? inserted : inserted[0], error: null };
      return {
        select: () => {
          const promise = makeThenable(result);
          promise.single = () => Promise.resolve(result);
          return promise;
        },
      };
    },
    update: values => ({
      eq: (field, value) => {
        const list = mockData[table] || [];
        const idx = list.findIndex(r => r[field] === value);
        if (idx !== -1) list[idx] = { ...list[idx], ...values };
        mockData[table] = list;
        const updated = { data: list[idx] || null, error: null };
        const promise = makeThenable(updated);
        promise.select = () => ({ single: () => Promise.resolve(updated) });
        return promise;
      },
    }),
    delete: () => ({
      eq: (field, value) => ({
        select: () => ({
          single: () => {
            const idx = (mockData[table] || []).findIndex(r => r[field] === value);
            const removed = idx !== -1 ? mockData[table].splice(idx, 1)[0] : null;
            return Promise.resolve({ data: removed, error: null });
          },
        }),
      }),
    }),
  }),
});
export default { createClient, __setMockData };
