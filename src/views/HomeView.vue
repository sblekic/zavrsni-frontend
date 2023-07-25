<script setup>
import { useCounterStore } from "@/stores/counter";
import { useWalletStore } from "@/stores/wallet";

const wallet = useWalletStore();
const counter = useCounterStore();
</script>

<template>
  <main>
    <div class="container-fluid border border-success">
      <h2>Registered Events</h2>

      <div>Current Count: {{ counter.count }}</div>
      <button @click="counter.increment()" class="btn btn-primary">
        increment
      </button>
      <button @click="counter.reset()" class="btn btn-primary">reset</button>

      <div class="mt-4">contents of wallet store: {{ wallet }}</div>
    </div>
  </main>
</template>

<style scoped>
main {
  margin: 5vh;
}
</style>
