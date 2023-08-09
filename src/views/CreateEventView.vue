<script setup>
import EventFactory from "@/assets/abi/EventFactory";
import { BrowserProvider, Contract } from "ethers";
import { onMounted, reactive, ref, watch } from "vue";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import _ from "lodash";
import { Dropdown } from "bootstrap/dist/js/bootstrap.js";
import { vOnClickOutside } from "@vueuse/components";
import { Venues } from "@/services";

const provider = new BrowserProvider(window.ethereum);

let venues = ref({ isNotFound: false });

const formData = reactive({
  eventName: [],
  venue: "",
  artists: null,
  genre: null,
  start: null,
  end: null,
  ticketType: [],
  ticketSupply: [],
  ticketPrice: [],
});

let bsVenueDropdown;

// dinamicko pretrazivanje prostora
watch(
  () => formData.venue,
  _.debounce(async (venueName) => {
    if (venueName.length > 2) {
      await fetchVenues(venueName);
    } else bsVenueDropdown.hide();
  }, 500)
);

onMounted(() => {
  initDatetimePicker();
  bsVenueDropdown = Dropdown.getOrCreateInstance("#venueDropdown", {
    display: "static",
  });
});

function initDatetimePicker() {
  flatpickr(".flatpickr", {
    enableTime: true,
    altInput: true,
    altFormat: "d-m-y H:i",
    dateFormat: "U",
    time_24hr: true,
    position: "above center",
    wrap: true,
  });
}

function getDropdown() {
  // const dropdownInstance = Dropdown.getOrCreateInstance("#venueDropdown");
  // bsVenueDropdown.toggle();
  // console.log(bsVenueDropdown._isShown());
}

function closeVenueDropdown() {
  bsVenueDropdown.hide();
}

async function fetchVenues(searchTerm) {
  console.log("raw response", await Venues.getVenues(searchTerm));
  // console.log("dropdown element", bsVenueDropdown);

  venues.value = await Venues.getVenues(searchTerm);

  // console.log("Response backenda ", venues.value[0].name);
  console.log("Upisani search term ", searchTerm);
  console.log("Duzina polja iz res ", venues.value.length);

  if (venues.value.length > 0) {
    // zbog watchera funkcija ce se pokrenuti kako god, pa nakon sto je prostor odabran putem selectVenze treba mi grananje gdje se ne radi ništa
    if (venues.value[0].name === searchTerm) return;
    // prostor nije odabran iz liste ali prikazi drop
    // else if (!bsVenueDropdown._isShown()) {
    //   console.log("ovo mi je bitno");
    //   document.getElementById("dropdownButton").click();
    // }
    else bsVenueDropdown.show();
  } else {
    // ako nema rezultata obavijesti korisnika
    venues.value = { isNotFound: true };
    bsVenueDropdown.show();
  }
}

function selectVenue(selection) {
  console.log("Odabrano iz liste prostora: ", selection);
  formData.venue = selection;
  bsVenueDropdown.hide();
}

async function createEvent() {
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

  // await contract.createEvent(
  //   { name: "land of", start: 1694368800, end: 1694379600 },
  //   ["GA", "VIP"],
  //   [500, 100],
  //   [55, 140]
  // );
}

function nextForm() {
  let [eventForm] = document.getElementsByClassName("event-form");
  eventForm.classList.add("d-none");

  let [ticketForm] = document.getElementsByClassName("ticket-form");
  ticketForm.classList.remove("d-none");
}

function previousForm() {
  let [ticketForm] = document.getElementsByClassName("ticket-form");
  ticketForm.classList.add("d-none");
  let [eventForm] = document.getElementsByClassName("event-form");
  eventForm.classList.remove("d-none");
}
</script>

<template>
  <main>
    <div class="container px-4">
      {{ formData }}
      <button class="btn btn-primary" @click="fetchVenues()">
        fetch venues
      </button>
      <button class="btn btn-primary ms-2" @click="getDropdown()">
        get dropdown
      </button>
      <div class="d-flex mb-4 justify-content-center">
        <h1 class="">Organiziraj koncert</h1>
      </div>
      <!-- form za događaj -->
      <div class="event-form row">
        <!-- form left col; event data -->
        <div class="col">
          <div class="row">
            <!-- form elements -->
            <div class="col-12">
              <label for="inputImeEventa" class="form-label"
                >Naziv eventa</label
              >
              <input
                v-model="formData.eventName"
                type="text"
                class="form-control"
                id="inputImeEventa"
              />
            </div>
            <div class="col-12">
              <!-- lista prostora -->
              <div class="dropdown position-relative" id="venueDropdown">
                <label for="inputProstor" class="form-label">Prostor</label>
                <input
                  v-model="formData.venue"
                  type="text"
                  class="form-control"
                  id="inputProstor"
                />

                <ul
                  class="dropdown-menu w-100 mt-1"
                  v-on-click-outside="closeVenueDropdown"
                >
                  <li v-if="!venues.isNotFound" v-for="venue in venues">
                    <button
                      class="dropdown-item"
                      @click="selectVenue(venue.name)"
                    >
                      {{ venue.name }}
                    </button>
                  </li>
                  <li v-else>
                    <button class="dropdown-item disabled">
                      Nema pronađenih rezultata
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-12">
              <label for="inputIzvodac" class="form-label">Izvođač</label>
              <input
                v-model="formData.artists"
                type="text"
                class="form-control"
                id="inputIzvodac"
              />
            </div>
            <div class="col-12 flatpickr">
              <label for="inputPocetak" class="form-label">Početak</label>
              <input
                v-model="formData.start"
                type="text"
                class="form-control"
                id="inputPocetak"
                placeholder="Odaberi datum i vrijeme.."
                data-input
              />
            </div>
            <div class="col-12 flatpickr">
              <label for="inputKraj" class="form-label">Kraj</label>
              <input
                v-model="formData.end"
                type="text"
                class="form-control"
                id="inputKraj"
                placeholder="Odaberi datum i vrijeme.."
                data-input
              />
            </div>
            <div class="col-12">
              <label for="inputZanr" class="form-label">Žanr glazbe</label>
              <input
                v-model="formData.genre"
                type="text"
                class="form-control"
                id="inputZanr"
              />
            </div>
          </div>
        </div>
        <!-- form right col; picture upload -->
        <div
          class="col-sm-12 col-lg d-flex flex-column mt-md-3 justify-content-center"
        >
          <div class="text-center">
            <p>Poster</p>
            <img class="w-75" src="https://placeholder.pics/svg/300x200" />
          </div>
        </div>

        <!-- pc button -->
        <div class="d-flex mt-4 pe-3 justify-content-end d-none d-lg-flex">
          <button @click="nextForm" class="btn btn-primary">
            Dalje <i class="bi bi-caret-right"></i>
          </button>
        </div>
        <!-- mobile button -->
        <div class="d-flex justify-content-center">
          <div class="d-flex flex-column mt-4 pe-3 d-lg-none w-75">
            <button @click="nextForm" class="btn btn-primary">
              Dalje <i class="bi bi-caret-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- form za ulaznice -->
      <div class="ticket-form row d-none">
        <!-- form left col; ticket data -->
        <div class="col">
          <div class="row">
            <!-- form elements -->
            <div class="col-12">
              <label for="inputNazivUlaznice" class="form-label"
                >Naziv ulaznice</label
              >
              <input type="text" class="form-control" id="inputNazivUlaznice" />
            </div>
            <div class="col-12">
              <label for="inputBrUlaznica" class="form-label"
                >Broj dostupnih ulaznica</label
              >
              <input type="text" class="form-control" id="inputBrUlaznica" />
            </div>
            <div class="col-12">
              <label for="inputCijena" class="form-label">Cijena</label>
              <input type="text" class="form-control" id="inputCijena" />
            </div>
            <!-- <div class="col-12">
              <label for="inputDostupnostOd" class="form-label"
                >Dostupne od</label
              >
              <input type="text" class="form-control" id="inputDostupnostOd" />
            </div>
            <div class="col-12">
              <label for="inputDostupnostDo" class="form-label"
                >Dostupne do</label
              >
              <input type="text" class="form-control" id="inputDostupnostDo" />
            </div> -->
          </div>
        </div>
        <!-- form right col; nft picture upload -->
        <div class="col-sm-12 col-md d-flex flex-column justify-content-center">
          <div class="text-center">
            <p>Ilustracija NFT-a</p>
            <img src="https://placeholder.pics/svg/200x300" />
          </div>
        </div>

        <!-- desktop buttons -->
        <div class="d-flex mt-4 pe-3 justify-content-end d-none d-lg-flex">
          <button @click="previousForm" class="btn btn-primary">
            <i class="bi bi-caret-left"></i> Nazad
          </button>
          <button @click="" class="btn btn-primary ms-2">
            Kreiraj događaj
          </button>
        </div>

        <!-- mobile buttons -->
        <div class="d-flex justify-content-center">
          <div class="d-flex flex-column mt-4 pe-3 d-lg-none w-75">
            <button @click="previousForm" class="btn btn-primary">
              <i class="bi bi-caret-left"></i> Nazad
            </button>
            <button @click="" class="btn btn-primary mt-2">
              Kreiraj događaj
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
