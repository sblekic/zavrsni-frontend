<script setup>
import { ref } from "vue";
import { Posts, Tickets } from "@/services";
import { useCounterStore } from "@/stores/counter";
import { BrowserProvider, Contract, parseEther } from "ethers";
import EventProxy from "@/assets/abi/EventImplementation";

const provider = new BrowserProvider(window.ethereum);

async function postTicketMetadata(ticketId) {
  let ticket = {
    tokenId: ticketId,
  };
  await Tickets.postTicketMeta(ticket);
}

async function buyTicket(ticketType = "GA", ticketPrice = "0.035503483779348") {
  let signer = await provider.getSigner();
  let event = new Contract(EventProxy.contractAddress, EventProxy.abi, signer);
  let weiPrice = { value: parseEther(ticketPrice) };
  try {
    await event.buyTicket(ticketType, weiPrice);
    event.once("TicketSale", async (eventAddress, ticketId) => {
      console.log("Izvršena kupnja ulaznica", eventAddress, ticketId);
      // createEventDb(log, signer.address);
      console.log(await event.tickets("GA"));
    });
  } catch (error) {}
}

const counter = useCounterStore();

let posts = ref();
async function fetchPosts() {
  try {
    posts.value = await Posts.getAll();
  } catch (error) {
    console.log(error);
  }
}
</script>

<template>
  <main>
    <div class="container border border-success">
      <h2 class="mb-3">Testing page</h2>
      <button class="btn btn-primary me-3" @click="buyTicket()">
        Buy ticket (bc)
      </button>
      <button class="btn btn-primary" @click="postTicketMetadata(4)">
        Post ticket metadata to db
      </button>
      <p v-if="posts">{{ posts[2] }}</p>
    </div>
  </main>
</template>

<style scoped></style>
