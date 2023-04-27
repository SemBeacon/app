import { defineStore } from 'pinia';

export interface UserState {

}
  
export const userUserStore = defineStore('user', {
    state: (): UserState => ({

    }),
    getters: {

    },
    actions: {
        authenticate(): Promise<void> {
            return new Promise((resolve, reject) => {

            });
        }
    }
});
