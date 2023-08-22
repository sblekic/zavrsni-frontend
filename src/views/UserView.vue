<script setup>
import { ref, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { Tickets, Backend } from "@/services";
import { useQRCode } from "@vueuse/integrations/useQRCode";

const route = useRoute();

let tickets = ref("");
let checkInQr = ref({});
let showQr = ref(false);

onBeforeMount(async () => {
  tickets.value = await Tickets.getUserTickets(route.params.userId);
});

function generateQR(ticket) {
  // let baseURL = import.meta.env.VITE_AXIOS_URL;
  // console.log("vrijednost qr koda: ", baseURL + "tickets/" + ticket.id);
  // checkInQr.value = useQRCode(baseURL + "tickets/" + ticket.id);
  checkInQr.value = useQRCode(ticket.id);

  showQr.value = true;
}
</script>

<template>
  <main>
    <div class="container">
      <!-- {{ tickets }} -->

      <div class="row">
        <div v-for="ticket in tickets" class="col-lg-6">
          <div class="card mb-3 mx-auto mx-lg-0" style="max-width: 540px">
            <div class="row g-0">
              <div class="col-8">
                <div class="card-body">
                  <h5 class="card-title">{{ ticket.eventName }}</h5>
                  <p class="card-text">{{ ticket.venue }}</p>
                </div>
              </div>

              <div
                class="col-4 rounded-end d-flex flex-column align-items-center justify-content-center"
                data-bs-toggle="modal"
                data-bs-target="#ticketModal"
              >
                <div class="test row h-100 w-100">
                  <div class="col flex-grow-0 triangle-pattern"></div>
                  <div class="col show-details rounded-end py-4 text-center">
                    <i class="bi bi-ticket-perforated"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="modal fade"
            id="ticketModal"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-dialog-centered modal-sm">
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
                  <button
                    v-if="!showQr"
                    @click="generateQR(ticket)"
                    type="button"
                    class="btn btn-primary"
                  >
                    Kreiraj QR kod
                  </button>
                  <img v-else :src="checkInQr.value" alt="QR Code" />
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

.test:hover .show-details {
  background-color: #080b53;
  color: white;
}

.test:hover .triangle-pattern {
  background:
    linear-gradient(-45deg, #080b53 9px, rgba(125, 125, 125, 0) 0) 0 9px,
    linear-gradient(-135deg, #080b53 9px, rgba(125, 125, 125, 0) 0) 0 9px;
  background-repeat: repeat-y;
  background-size: 18px 18px;
  background-position: right top;
}
</style>
