import { reactive } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useWalletStore = defineStore("wallet", {
  state: () => ({
    //frontend; use for v-if blocks, display content if user is logged in
    isConnected: false,
    isAuthWarning: true,
    user: "",
    chainId: "",
  }),
  persist: true,
});

// //Composition API varijanta
// export const useWalletStore = defineStore(
//   "wallet",
//   () => {
//     const state = reactive({
//       //frontend; use for v-if blocks, display content if user is logged in
//       isConnected: false,
//       user: "",
//       chainId: "",
//       test: 3,
//       //frontend; ako želim izbaciti warning da je user na krivom bc-u
//       networkError: undefined,
//     });

//     return { state };
//   },
//   {
//     persist: true,
//   }
// );

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWalletStore, import.meta.hot));
}
