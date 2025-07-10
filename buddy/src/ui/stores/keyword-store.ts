import { defineStore } from 'pinia';

export const useKeywordStore = defineStore('keyword', {
  state: () => ({
    keyword: '',
  }),
});
