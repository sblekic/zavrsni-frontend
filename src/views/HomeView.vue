<script setup>
import { useCounterStore } from "@/stores/counter";
import EventFactory from "@/assets/abi/EventFactory";
import { BrowserProvider, Contract } from "ethers";

const provider = new BrowserProvider(window.ethereum);

let eventId = null;

function logEventId() {
  console.log(eventId);
}
async function getContract() {
  let signer = await provider.getSigner();
  let contract = new Contract(
    EventFactory.contractAddress,
    EventFactory.abi,
    signer
  );

  contract.once("EventCreated", (log) => {
    console.log("Novi event kreiran na adresu: ", log);
    eventId = log;
  });

  await contract.createEvent(
    { name: "land of", start: 1694368800, end: 1694379600 },
    ["GA", "VIP"],
    [500, 100],
    [55, 140]
  );
}

const counter = useCounterStore();
</script>

<template>
  <main>
    <div class="container border border-success">
      <h2 class="mb-3">Testing page</h2>
      <button @click="getContract" class="btn btn-primary me-3">
        testEventCreation
      </button>
      <button @click="logEventId" class="btn btn-primary">logEventId</button>
    </div>
  </main>
</template>

<style scoped></style>
