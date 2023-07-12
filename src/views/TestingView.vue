<script setup>
import { ref } from "vue";
import { Posts } from "@/services";
let test = ref();

async function fetchPosts() {
  test.value = await Posts.getAll();
}
</script>

<template>
  <main>
    <button @click="fetchPosts">testiraj funkciju</button>
    <p>{{ test[2] }}</p>
  </main>
</template>

<style scoped>
main {
  margin: 5vh;
}
</style>
