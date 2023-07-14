// stores/counter.js
import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useCounterStore = defineStore(
  "counter",
  () => {
    const count = ref(0);
    function increment() {
      count.value++;
    }
    function reset() {
      count.value = 0;
    }
    return { count, increment, reset };
  },
  {
    //piniaPluginPersistedstate - option to enable persisted storage with default settings
    //default settings available at the plugins page.
    //persists the login state on refresh
    persist: true,
  }
);
//hot module replacement; changes in store are hot reloaded -> ne moram refreshati stranicu kada mijenjam kod u komponentama
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot));
}
