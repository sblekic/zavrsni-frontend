<script setup>
import { ref, onBeforeMount, watch } from "vue";
import { BrowserProvider, Contract, parseEther, parseUnits } from "ethers";
import EventImplementation from "@/assets/abi/EventImplementation";

import { useRoute } from "vue-router";
import { Tickets, Exchange } from "@/services";
import { useQRCode } from "@vueuse/integrations/useQRCode";
import { Modal } from "bootstrap/dist/js/bootstrap.js";

const route = useRoute();

let tickets = ref("");
let checkInQr = ref({});
let showQr = ref(false);
let resellPrice = ref("");
let exchangeRate;
let maticPrice;
let weiPrice;
let isPostingForm = ref(false);

const provider = new BrowserProvider(window.ethereum);

watch(resellPrice, (newPrice) => {
  if (!isNaN(parseInt(newPrice))) {
    weiPrice = parseInt(resellPrice.value) * exchangeRate;
    weiPrice = weiPrice * 10 ** -18;
    maticPrice = Math.round(weiPrice * 1000000) / 1000000;
  } else maticPrice = null;
});

onBeforeMount(async () => {
  tickets.value = await Tickets.getUserTickets(route.params.userId);
  exchangeRate = await Exchange.eurToMatic();
});

function generateQR(ticket) {
  // let baseURL = import.meta.env.VITE_AXIOS_URL;
  // console.log("vrijednost qr koda: ", baseURL + "tickets/" + ticket.id);
  // checkInQr.value = useQRCode(baseURL + "tickets/" + ticket.id);
  const bsTicketModal = document.getElementById(`ticketModal-${ticket.id}`);
  bsTicketModal.addEventListener("hidden.bs.modal", (event) => {
    showQr.value = false;
  });
  checkInQr.value = useQRCode(ticket.id);

  showQr.value = true;
}

async function setListing(id, resellPrice, maticPrice) {
  const bsResellModal = Modal.getOrCreateInstance(`#saleForm-${id}`);
  let properties = {
    listingEurPrice: parseInt(resellPrice.value),
    listingWeiPrice: String(parseEther(`${maticPrice}`)),
    isListed: true,
  };
  let res = await Tickets.patchTicketMeta(id, properties);
  isPostingForm.value = !isPostingForm.value;
  resellPrice.value = "";
  bsResellModal.hide();
}

async function sellTicket(eventId, maticPrice, tokenId, ticketType, ticketId) {
  // console.log(eventId);

  if (provider) {
    isPostingForm.value = !isPostingForm.value;
    let signer = await provider.getSigner();
    let contract = new Contract(eventId, EventImplementation.abi, signer);
    // await setListing(ticketId, resellPrice, maticPrice);

    try {
      console.log("seller address", await contract.ownerOf(tokenId));
      // !!!!!! PROMJENI KADA SI GOTOV SA TESTIRANJEM!!!!!! namjerno su postavljene jako niske cijene jer faucet daje 1 matic/dan
      await contract.sellTicket(tokenId, 11000000000000n, ticketType);
      // await contract.sellTicket(
      //   tokenId,
      //   parseEther(`${maticPrice}`),
      //   ticketType
      // );
      contract.once("ListedTicketSuccess", async (tokenId) => {
        console.log(`Preprodaja ulaznice # ${tokenId}`);
        console.log(
          "novi vlasnik je eventContract address:",
          await contract.ownerOf(tokenId)
        );
        await setListing(ticketId, resellPrice, maticPrice);
      });
    } catch (error) {}
  }
}
</script>

<template>
  <main>
    <div class="container">
      {{ tickets }}
      <div class="row">
        <div v-for="ticket in tickets" class="col-lg-6">
          <div class="card mb-3 mx-auto mx-lg-0" style="max-width: 540px">
            <div class="row g-0">
              <div class="col-8">
                <div
                  class="card-body d-flex flex-column justify-content-center"
                  style="min-height: 140px"
                >
                  <h5 class="card-title">{{ ticket.eventName }}</h5>
                  <p class="card-text">{{ ticket.venue }}</p>
                </div>
              </div>

              <div
                class="col-4 rounded-end d-flex flex-column align-items-center justify-content-center"
                data-bs-toggle="modal"
                :data-bs-target="`#ticketModal-${ticket.id}`"
              >
                <div class="ticket-pattern row h-100 w-100">
                  <div class="col flex-grow-0 triangle-pattern"></div>
                  <div
                    class="col show-details rounded-end d-flex align-items-center justify-content-center"
                  >
                    <i class="bi bi-ticket-perforated"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="modal fade"
            :id="`ticketModal-${ticket.id}`"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-sm">
              <div class="modal-content">
                <div
                  class="modal-header border-bottom border-3 border-primary mb-3"
                >
                  <h1 class="modal-title fs-2" id="exampleModalLabel">
                    Ulaznica #{{ ticket.tokenId }}
                  </h1>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <div class="display-6 text-end mb-3">
                    {{ ticket.eventName }}
                  </div>
                  <div class="text-end mb-5">{{ ticket.customDate }}</div>
                  <div class="row text-center mb-4">
                    <div class="col">
                      <h6 class="fw-lighter">CIJENA</h6>
                      <h4>{{ ticket.price }}€</h4>
                    </div>
                    <div class="col">
                      <h6 class="fw-lighter">POČETAK</h6>
                      <h4>{{ ticket.start }}</h4>
                    </div>
                    <div class="col">
                      <h6 class="fw-lighter">KATEGORIJA</h6>
                      <h4>{{ ticket.type }}</h4>
                    </div>
                  </div>
                  <h5>{{ ticket.venue }},</h5>
                  <h5>{{ ticket.city }}</h5>
                </div>
                <div class="modal-footer justify-content-center">
                  <div v-if="!showQr" class="d-flex flex-column flex-grow-1">
                    <button
                      @click="generateQR(ticket)"
                      type="button"
                      class="btn btn-primary"
                    >
                      Prikaži QR kod
                    </button>
                    <button
                      class="btn btn-secondary mt-2"
                      :data-bs-target="`#saleForm-${ticket.id}`"
                      data-bs-toggle="modal"
                    >
                      Prodaj ulaznicu
                    </button>
                  </div>

                  <img v-else :src="checkInQr.value" alt="QR Code" />
                </div>
              </div>
            </div>
          </div>

          <div
            class="modal fade"
            :id="`saleForm-${ticket.id}`"
            aria-hidden="true"
            aria-labelledby="exampleModalToggleLabel2"
            tabindex="-1"
          >
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-3" id="exampleModalToggleLabel2">
                    Preprodaja ulaznice
                  </h1>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <div class="input-group my-3">
                    <input
                      v-model="resellPrice"
                      type="text"
                      class="form-control col"
                      placeholder="Cijena preprodaje €"
                    />
                    <span class="input-group-text col" id="basic-addon2"
                      >{{ maticPrice }} MATIC</span
                    >
                    {{ ticket }}
                  </div>
                </div>
                <div class="modal-footer">
                  <button
                    v-if="!isPostingForm"
                    @click="
                      sellTicket(
                        ticket.eventId,
                        maticPrice,
                        ticket.tokenId,
                        ticket.type,
                        ticket.id
                      )
                    "
                    class="btn btn-primary"
                  >
                    Predaj zahtjev
                  </button>

                  <div v-else class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.show-details {
  background-color: #dee2e6;
  font-size: 1.5rem;
}

.triangle-pattern {
  background:
    linear-gradient(-45deg, #dee2e6 9px, rgba(125, 125, 125, 0) 0) 0 9px,
    linear-gradient(-135deg, #dee2e6 9px, rgba(125, 125, 125, 0) 0) 0 9px;
  background-repeat: repeat-y;
  background-size: 18px 18px;
  background-position: right top;
}

.ticket-pattern:hover .show-details {
  background-color: #080b53;
  color: white;
}

.ticket-pattern:hover .triangle-pattern {
  background:
    linear-gradient(-45deg, #080b53 9px, rgba(125, 125, 125, 0) 0) 0 9px,
    linear-gradient(-135deg, #080b53 9px, rgba(125, 125, 125, 0) 0) 0 9px;
  background-repeat: repeat-y;
  background-size: 18px 18px;
  background-position: right top;
}
</style>
