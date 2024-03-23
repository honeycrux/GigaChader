// import all contracts and merge them into one big contract

import { initContract } from '@ts-rest/core';
import { userContract } from './user'
import { authContract } from './auth'

const c = initContract();
export const apiContract = c.router({
    user: userContract,
    auth: authContract,
});