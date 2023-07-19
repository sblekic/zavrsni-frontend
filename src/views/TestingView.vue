<script setup>
import { ref } from "vue";
import { Posts } from "@/services";
let test = ref();

async function fetchPosts() {
  try {
    test.value = await Posts.getAll();
  } catch (error) {
    console.log(error);
  }
}
</script>

<template>
  <main>
    <button @click="fetchPosts">testiraj funkciju</button>
    <p v-if="test">{{ test[2] }}</p>
  </main>
</template>

<style scoped>
main {
  margin: 5vh;
}
</style>
