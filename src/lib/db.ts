
// @ts-ignore
global.__db = {};

// define simply a global object for our DB.. we don't need persistence or specific queries
// @ts-ignore
export const db:() => any = () => global.__db;
