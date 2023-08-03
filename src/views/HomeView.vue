<script setup>
import { useCounterStore } from "@/stores/counter";
import EventFactory from "@/assets/abi/EventFactory";
import { BrowserProvider, Contract } from "ethers";
import { ref } from "vue";

const provider = new BrowserProvider(window.ethereum);

let eventId = null;

function logEventId() {
  console.log(eventId);
}

async function getContract() {
  let signer = await provider.getSigner();
  let contract = new Contract(
    import.meta.env.VITE_CONTRACT_ADDRESS,
    EventFactory.abi,
    signer
  );

  contract.once("EventCreated", (res) => {
    console.log("event listener radi");
    console.log("return value je: ", res);
    eventId = Number(res);
  });

  await contract.createEvent({
    name: "prvi event",
    price: 44,
  });
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
