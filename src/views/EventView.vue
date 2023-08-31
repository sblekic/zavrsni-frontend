<script setup>
import EventImplementation from "@/assets/abi/EventImplementation";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { ref, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { Events, Tickets } from "@/services";

const provider = new BrowserProvider(window.ethereum);

let event = ref({ venueInfo: { address: "" } });
let listings = ref([]);
const route = useRoute();

function weiToEth(price) {
  // js implicit string to number conversion
  let temp = price * 10 ** -18;
  return Math.round(temp * 1000000) / 1000000;
}

onBeforeMount(async () => {
  event.value = await Events.getEventById(route.params.eventId);
  listings.value = await Tickets.getListings(route.params.eventId);
});

async function postTicketMeta(tokenId, ticketType, price, owner) {
  let ticketMeta = {
    tokenId: parseInt(tokenId),
    eventName: event.value.name,
    type: ticketType,
    price,
    startTime: event.value.startStamp,
    venue: event.value.venueInfo.name,
    city: event.value.venueInfo.address.city,
    eventAddress: route.params.eventId,
    owner: owner.toLowerCase(),
  };
  let res = await Tickets.postTicketMeta(ticketMeta);
  console.log(res.data);
}

async function secondarySale(listing) {
  if (provider) {
    let signer = await provider.getSigner();
    let contract = new Contract(
      route.params.eventId,
      EventImplementation.abi,
      signer
    );
    try {
      await contract.secondarySale(listing.tokenId, { value: 11000000000000n });

      contract.once("SecondarySale", async (tokenId) => {
        console.log(`Preprodaja ulaznice # ${tokenId}}`);
        let properties = {
          owner: signer.address.toLowerCase(),
          isListed: false,
        };
        await Tickets.patchTicketMeta(listing._id, properties);
      });
    } catch (error) {
      console.log(error);
    }
  }
}

async function buyTicket(ticket) {
  if (provider) {
    let signer = await provider.getSigner();
    let contract = new Contract(
      route.params.eventId,
      EventImplementation.abi,
      signer
    );
    try {
      let ticketStruct = await contract.tickets(`${ticket.type}`);
      console.log("ticket price on .sol", ticketStruct.price);
      console.log(
        "parsed value on frontend",
        parseUnits(`${ticket.weiPrice}`, "wei")
      );
      await contract.buyTicket(ticket.type, {
        value: parseUnits(`${ticket.weiPrice}`, "wei"),
      });

      contract.once("TicketSale", async (proxyAddress, tokenId) => {
        console.log(
          `Prodana ulaznica # ${tokenId} za event s adrese ${proxyAddress}`
        );
        await postTicketMeta(
          tokenId,
          ticket.type,
          ticket.eurPrice,
          signer.address
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
}

function shortenAddress(address) {
  address = (address.slice(0, 5) + ".." + address.slice(-4)).toUpperCase();
  return address;
}
</script>

<template>
  <main>
    <div class="container">
      <!-- main info -->
      <div class="row mb-4">
        <div class="col-lg-6">
          <!-- <img
            class="w-100 mb-3 mb-lg-0"
            src="https://placeholder.pics/svg/300x200"
          /> -->
          <img class="w-75 mb-3 mb-lg-0" src="@/assets/img-placeholder.svg" />
        </div>
        <div class="col-lg-6 my-auto">
          <h2>{{ event.name }}</h2>
          <h4>{{ event.location }}</h4>
          <h5>{{ event.dayHour }}</h5>
        </div>
      </div>
      <!-- prodaja ulaznica -->
      <div class="row mt-5 mb-4 px-2">
        <table class="table table-borderless table-hover align-middle border">
          <thead>
            <tr>
              <th scope="col" width="40%">Ulaznice</th>
              <th scope="col" class="text-center">Cijena</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody class="border-top">
            <tr v-for="ticket in event.tickets">
              <td>{{ ticket.type }}</td>
              <td class="text-center">
                {{ ticket.eurPrice }} EUR ~
                {{ weiToEth(ticket.weiPrice) }} MATIC
              </td>
              <td class="text-center">
                <button
                  v-if="ticket.supply"
                  @click="buyTicket(ticket)"
                  class="btn btn-primary"
                >
                  <i class="bi bi-cart-plus"></i>
                </button>
                <button v-else class="btn btn-secondary disabled">
                  <i class="bi bi-cart-x"></i> Rasprodano
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- secondary market -->

      <div class="row mt-4 mb-4 px-2">
        <h2 class="ps-0 mb-3">
          Ulaznice u preprodaji
          <span class="badge text-bg-primary">{{ listings.length }}</span>
        </h2>
        <table
          v-show="listings.length"
          class="table table-borderless table-hover align-middle"
        >
          <thead>
            <tr>
              <th scope="col">Korisnik</th>
              <th scope="col">Ulaznice</th>
              <th scope="col" class="text-center">Cijena</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody class="border-top">
            <tr v-for="listing in listings">
              <td>
                <a
                  class="text-decoration-none"
                  :href="`https://mumbai.polygonscan.com/address/${listing.owner}`"
                  >{{ shortenAddress(listing.owner) }}</a
                >
              </td>

              <td>{{ listing.type }}</td>
              <td class="text-center">
                {{ listing.listingEurPrice }} EUR ~
                {{ weiToEth(listing.listingWeiPrice) }} MATIC
              </td>
              <td class="text-center">
                <button @click="secondarySale(listing)" class="btn btn-primary">
                  <i class="bi bi-cart-plus"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- lineup i prostor -->
      <div class="row mt-3">
        <div class="col-lg-6 mb-4">
          <h4>Lineup</h4>
          <div
            v-for="artist in event.lineup"
            class="row mt-4 align-items-center border lineup-card me-1 me-lg-5"
          >
            <div class="col ps-0">
              <img
                style="min-height: 12vh"
                class="img-fluid"
                :src="`https://picsum.photos/200/100?random=${
                  Math.floor(Math.random() * 100) + 10
                }`"
              />
            </div>
            <div class="col text-center">
              <h4>{{ artist.name }}</h4>
            </div>
            <div class="col text-end">
              <i class="bi bi-caret-right"></i>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <h4>Informacije o prostoru</h4>
          <div class="mb-1 mt-3">{{ event.venueInfo.name }}</div>
          <div class="mb-1">{{ event.venueInfo.address.streetAddress }}</div>
          <div>
            {{ event.venueInfo.address.postalCode }},
            {{ event.venueInfo.address.city }}
          </div>

          <h4 class="my-3">Mapa prostora</h4>
          <!-- <img class="w-100" src="https://placeholder.pics/svg/300x200" /> -->
          <img class="w-75" src="@/assets/img-placeholder.svg" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.lineup-card {
  margin-left: 0rem;
}
.lineup-card:hover {
  background: #00000013;
}
</style>
