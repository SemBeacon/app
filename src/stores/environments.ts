import { defineStore } from 'pinia';
import { useUserStore } from './user';

export interface EnvironmentState {

}

// User store
const userStore = useUserStore();
  
export const useEnvironmentStore = defineStore('environments', {
    state: (): EnvironmentState => ({

    }),
    getters: { 

    },
    actions: {
        fetchEnvironments(): Promise<void> {
            return new Promise((resolve, reject) => {

            });
        }
    }
});
