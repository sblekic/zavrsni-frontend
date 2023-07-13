<script setup>
import { useCounterStore } from "@/stores/counter";

const counter = useCounterStore();
counter.count++;
</script>

<template>
  <main>
    <div class="container border border-success">
      <h2>Registered Events</h2>

      <div>Current Count: {{ counter.count }}</div>
      <button @click="counter.increment()" class="btn btn-primary">
        increment
      </button>
      <button @click="counter.reset()" class="btn btn-primary">reset</button>
    </div>
  </main>
</template>

<style scoped>
main {
  margin: 5vh;
}
</style>
