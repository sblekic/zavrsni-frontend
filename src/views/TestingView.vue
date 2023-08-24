<script setup>
import { ref, onMounted } from "vue";
import { Posts, Tickets, Exchange } from "@/services";
import { useCounterStore } from "@/stores/counter";
import { BrowserProvider, Contract, parseEther } from "ethers";
import EventProxy from "@/assets/abi/EventImplementation";
import axios from "axios";
import { QrcodeStream } from "vue-qrcode-reader";

const provider = new BrowserProvider(window.ethereum);

async function exchange() {
  console.log(await Exchange.eurToMatic());
  // console.log(
  //   await axios.get(
  //     "https://min-api.cryptocompare.com/data/price?fsym=EUR&tsyms=ETH,USD,MATIC"
  //   )
  // );
}

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

let toggle = ref(false);

async function onDetect(qrValue) {
  console.log(qrValue[0].rawValue);
  let ticketId = qrValue[0].rawValue;
  let res = await Tickets.scanTicket(ticketId);
  console.log(res.data);
}

function onError(err) {
  console.log(err);
}

function start() {
  toggle.value = !toggle.value;
}
</script>

<template>
  <main>
    <div class="container border border-success">
      <h2 class="mb-3">Testing page</h2>
      <button class="btn btn-primary me-3" @click="buyTicket()">
        Buy ticket (bc)
      </button>
      <button class="btn btn-primary me-3" @click="postTicketMetadata(4)">
        Post ticket metadata to db
      </button>
      <button class="btn btn-primary me-3" @click="exchange()">
        get exchange rate
      </button>
      <p v-if="posts">{{ posts[2] }}</p>

      <button @click="start" class="btn btn-primary">QR scan</button>
      <div class="qr-wrapper">
        <qrcode-stream
          v-if="toggle"
          @error="onError"
          @detect="onDetect"
        ></qrcode-stream>
      </div>
    </div>
  </main>
</template>

<style scoped>
.qr-wrapper :deep() video {
  width: 50%;
}
</style>
