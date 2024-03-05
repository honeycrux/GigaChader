// import all contracts and merge them into one big contract

import { initContract } from '@ts-rest/core';
import { userContract } from './user'

const c = initContract();
export const apiContract = c.router({
    user: userContract
});