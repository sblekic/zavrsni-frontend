<script setup>
import { ref } from "vue";
import { Posts } from "@/services";
import { useCounterStore } from "@/stores/counter";
import { BrowserProvider, Contract } from "ethers";

const counter = useCounterStore();

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
    <div class="container border border-success">
      <h2 class="mb-3">Testing page</h2>

      <button class="btn btn-primary" @click="fetchPosts">
        testiraj funkciju
      </button>
      <p v-if="test">{{ test[2] }}</p>
    </div>
  </main>
</template>

<style scoped></style>
