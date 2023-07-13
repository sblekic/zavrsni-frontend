<script setup>
import { useCounterStore } from "@/stores/counter";

const counter = useCounterStore();
counter.count++;
</script>

<template>
  <main>
    <h2>Registered Events</h2>

    <div>Current Count: {{ counter.count }}</div>
    <button @click="counter.increment()" class="btn btn-primary">
      increment
    </button>
    <button @click="counter.reset()" class="btn btn-primary">reset</button>
  </main>
</template>

<style scoped>
main {
  margin: 5vh;
}
</style>
