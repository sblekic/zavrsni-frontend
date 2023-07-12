<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ethers } from "ethers";
import contractArtifact from "D:/Documents/dApp/vjezbanje/dapp_demo/hardhat/artifacts/contracts/EventImplementation.sol/EventImplementation.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const route = useRoute();

const eventContract = new ethers.Contract(
  route.params.eventId,
  contractArtifact.abi,
  provider.getSigner(0)
);

let test = ref("");

onMounted(async () => {
  console.log(route.params.eventId);
  const eventName = await eventContract.eventData();
  console.log(eventName.name);
  test.value = eventName.name;
});
</script>

<template>
  <main>{{ $route.params.eventId }} {{ test }}</main>
</template>

<style scoped>
main {
  margin: 5vh;
}
</style>
