import { defineStore } from 'pinia';

export const useKeywordStore = defineStore('keyword', {
  state: () => ({
    keyword: '',
  }),
  actions: {
    setKeyword(keyword: string) {
      this.keyword = keyword;
    },
    clearKeyword() {
      this.keyword = '';
    },
  },
});
