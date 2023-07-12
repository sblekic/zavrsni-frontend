<script setup>
import { ref, onBeforeMount } from "vue";
import { ethers } from "ethers";
import contractArtifact from "D:/Documents/dApp/vjezbanje/dapp_demo/hardhat/artifacts/contracts/EventFactory.sol/EventFactory.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);

const eventFactory = new ethers.Contract(
  "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
  contractArtifact.abi,
  provider.getSigner() // bilo bi bolje ovo čupati iz localstorage-a, odnosno pinia
);

// ako ne stavim u reactive onda mi se ne azurira dom
// zbog asinkronosti fetch funkcije
// let eventList = reactive({
//   list: [],
// });

let eventList = ref([]);

console.log("logiram nešto:", provider.getSigner());
// console.log("logiram contract signer:", eventFactory.signer);

async function getEvents() {
  let data = await eventFactory.getRegisteredEvents();
  console.log("getEvents()");
  console.log(data);
  for (let d of data) {
    let temp = {
      eventName: d.eventName,
      proxy: d.proxyAddress,
    };
    console.log("value in data ", temp);
    eventList.value.push(temp);
  }
}

onBeforeMount(() => {
  getEvents();
});
</script>

<template>
  <main>
    <h2 class="text-2xl font-bold text-gray-900">Registered Events</h2>

    <div class="grid grid-cols-4 gap-4 mt-4">
      <div
        v-for="event in eventList"
        :key="event.proxy"
        class="flex justify-center"
      >
        <div class="shadow-lg bg-white max-w-sm">
          <RouterLink
            :to="{ name: 'EventDetails', params: { eventId: event.proxy } }"
          >
            <img src="https://placeholder.pics/svg/300" alt="" />
          </RouterLink>
          <div class="p-6">
            <h5 class="text-gray-900 text-xl font-bold mb-2">
              {{ event.eventName }}
            </h5>
            <p class="text-gray-700 text-base mb-4">
              <!-- {{ event.proxy }} -->Some quick example text to build on the
              card title and make up the bulk of the card's content.
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  margin: 5vh;
}
</style>
