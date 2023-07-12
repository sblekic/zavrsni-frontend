<script setup>
import { RouterView } from "vue-router";
import NavBar from "./components/NavBar.vue";
import BootstrapBar from "./components/BootstrapBar.vue";
</script>

<template>
  <header>
    <BootstrapBar />
  </header>
  <RouterView />
</template>
