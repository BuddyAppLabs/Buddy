import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useActionActiveStore = defineStore('action-active', () => {
  const activeIndex = ref(-1);

  function setActiveIndex(index: number) {
    console.log('setActiveIndex', index);
    activeIndex.value = index;
  }

  function resetActiveIndex() {
    activeIndex.value = -1;
  }

  return {
    activeIndex,
    setActiveIndex,
    resetActiveIndex,
  };
});
