<script setup>
import EventFactory from "@/assets/abi/EventFactory";
import { BrowserProvider, Contract } from "ethers";
import { onMounted, reactive, ref, watch } from "vue";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import _ from "lodash";
import { Dropdown } from "bootstrap/dist/js/bootstrap.js";
import { vOnClickOutside } from "@vueuse/components";
import { Venues, Artists } from "@/services";

const provider = new BrowserProvider(window.ethereum);

let venues = ref({ isNotFound: false });
let artistList = ref({ isNotFound: false });
let venueCapacity = 0;

let ticketSupply = ref("");
let currVenueCapacity = ref("");

const formData = reactive({
  eventName: "",
  venue: "",
  artists: [{ name: "", show: true }],
  genre: null,
  start: null,
  end: null,
  tickets: [{ type: "", supply: 0, price: "", show: true }],
});

let bsVenueDropdown;
let bsArtistDropdown;

// dinamicko racunanje preostalih mjesta u prostoru
// helper koji prikazuje korisniku preostala mjesta u prostoru pri definiranju količina karata po kategoriji
watch(ticketSupply, (newValue) => {
  // error catch ako je input prazan
  if (!isNaN(parseInt(newValue))) {
    formData.tickets.forEach((el) => {
      newValue = parseInt(newValue) + parseInt(el.supply);
    });
    currVenueCapacity.value = venueCapacity - newValue;
  } else {
    let temp = 0;
    formData.tickets.forEach((el) => {
      temp = parseInt(temp) + parseInt(el.supply);
    });
    currVenueCapacity.value = venueCapacity - temp;
  }
});

// dinamicko pretrazivanje prostora
watch(
  () => formData.venue,
  _.debounce(async (venueName) => {
    if (venueName.length > 1) {
      await fetchVenues(venueName);
    } else bsVenueDropdown.hide();
  }, 500)
);

watch(
  () => formData.artists,
  _.debounce(async (artistsRef) => {
    // watch gleda svaku promjenu u cijelom polju a meni treba samo ime izvođaća
    // json funkcije su ovdje zbog toga što mi watcher vraća cijeli proxy pa moram nekako izvući vrijednosti
    // koristim pop jer mi treba zadnji uneseni
    let currArtist = JSON.parse(JSON.stringify(artistsRef)).pop().name;

    if (currArtist.length > 1) {
      await fetchArtists(currArtist);
    } else bsArtistDropdown.hide();
  }, 500),
  { deep: true }
);

function selectVenue(selection) {
  formData.venue = selection;
  bsVenueDropdown.hide();
}

onMounted(() => {
  initDatetimePicker();
  bsVenueDropdown = Dropdown.getOrCreateInstance("#venueDropdown", {
    // default je dynamic pa zbog toga bs smjesti dropdown tamo gdje ja ne želim, sa static pojavi se odmah ispod input
    display: "static",
  });
  bsArtistDropdown = Dropdown.getOrCreateInstance("#artistDropdown", {
    // default je dynamic pa zbog toga bs smjesti dropdown tamo gdje ja ne želim, sa static pojavi se odmah ispod input
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

function closeDropdown() {
  // fundd
  const dropdownElementList = document.querySelectorAll(".dropdown-menu");
  const dropdownList = [...dropdownElementList].map((dropdownToggleEl) =>
    Dropdown.getOrCreateInstance(dropdownToggleEl)
  );
  dropdownList.forEach((el) => el.hide());
  // console.log(dropdownList);
}

async function fetchVenues(searchTerm) {
  venues.value = await Venues.getVenues(searchTerm);
  if (venues.value.length > 0) {
    // ako sam odabrao iz liste onda searchTerm ce biti isti kao i vrijednost iz baze
    if (venues.value[0].name === searchTerm) {
      venueCapacity = venues.value[0].capacity;
      currVenueCapacity.value = venues.value[0].capacity;
      return;
    }
    // prvi prikaz dropdowna nakon što je utipkano 3 slova (postavljeno u watcher )
    else bsVenueDropdown.show();
  } else {
    // ako nema rezultata obavijesti korisnika
    venues.value = { isNotFound: true };
    bsVenueDropdown.show();
  }
}

async function fetchArtists(searchTerm) {
  artistList.value = await Artists.getArtists(searchTerm);
  if (artistList.value.length > 0) {
    // zbog watchera funkcija ce se pokrenuti kako god, pa nakon sto je prostor odabran putem selectVenues treba mi grananje gdje se ne radi ništa
    if (artistList.value[0].name === searchTerm) return;
    // prvi prikaz dropdowna nakon što je utipkano 3 slova (postavljeno u watcher )
    else bsArtistDropdown.show();
  } else {
    // ako nema rezultata obavijesti korisnika
    artistList.value = { isNotFound: true };
    bsArtistDropdown.show();
  }
}

function selectArtist(selection) {
  const index = formData.artists.length - 1;
  formData.artists[index].name = selection.name;
  formData.artists[index].address = selection.address;
  bsArtistDropdown.hide();
}

function addArtist(index) {
  formData.artists.push({ name: "", show: true });
  formData.artists[index].show = false;
}

function removeArtist(index) {
  formData.artists.splice(index, 1);
}

function addTicket(index) {
  formData.tickets[index].supply = ticketSupply.value;
  formData.tickets.push({ type: "", supply: 0, price: "", show: true });
  ticketSupply.value = "";
  formData.tickets[index].show = false;
}

function removeTicket(index) {
  formData.tickets.splice(index, 1);
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
  console.log(signer);

  // await contract.createEvent(
  //   { name: "land of", start: 1694368800, end: 1694379600 },
  //   ["GA", "VIP"],
  //   [500, 100],
  //   [55, 140]
  // );
}
</script>

<template>
  <main>
    <div class="container px-4">
      {{ formData }}

      {{ venueCapacity }}
      <div class="d-flex mb-4 justify-content-center">
        <h1 class="">Organiziraj koncert</h1>
      </div>
      <!-- form za događaj -->
      <div class="event-form row">
        <!-- form left col; event data -->
        <div class="col">
          <div class="row g-3">
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
            <!-- odabir prostora -->
            <div class="col-12 mb">
              <!-- lista prostora -->
              <div class="dropdown" id="venueDropdown">
                <label for="inputProstor" class="form-label">Prostor</label>
                <input
                  v-model="formData.venue"
                  type="text"
                  class="form-control"
                  id="inputProstor"
                  placeholder="Pretraži iz liste prostora"
                />

                <ul class="dropdown-menu position-relative w-100 mt-1">
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

            <!-- odabir izvodaca -->
            <div class="col-12">
              <label class="form-label">Izvođači</label>

              <div
                v-for="(artist, index) in formData.artists"
                class="input-group mb-2"
              >
                <input
                  v-if="artist.show"
                  v-model="artist.name"
                  type="text"
                  class="form-control"
                  :id="`inputIzvodac-${index}`"
                  placeholder="Pretraži iz liste izvođača"
                />
                <input
                  v-else
                  v-model="artist.name"
                  type="text"
                  class="form-control"
                  :id="`inputIzvodac-${index}`"
                  placeholder="Pretraži iz liste izvođača"
                  disabled
                />
                <button
                  v-if="artist.show"
                  @click="addArtist(index)"
                  class="btn btn-outline-primary rounded-end"
                  type="button"
                >
                  <i class="bi bi-plus-lg"></i>
                </button>
                <button
                  v-else
                  @click="removeArtist(index)"
                  class="btn btn-outline-danger rounded-end"
                  type="button"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="dropdown">
                <ul
                  v-on-click-outside="closeDropdown"
                  class="dropdown-menu position-relative w-100 mt-1"
                  id="artistDropdown"
                >
                  <li
                    v-if="!artistList.isNotFound"
                    v-for="artist in artistList"
                  >
                    <button class="dropdown-item" @click="selectArtist(artist)">
                      {{ artist.name }}
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

            <!-- pocetak eventa -->
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

            <!-- kraj eventa -->
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
          </div>
        </div>

        <!-- form right col; picture upload -->
        <div
          class="col-sm-12 col-lg d-flex flex-column mt-md-3 mt-4 justify-content-center"
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
          <div v-for="(ticket, index) in formData.tickets" class="row mb-3">
            <!-- form elements -->
            <!-- naziv ulaznice -->
            <div class="col-lg-6 col-12">
              <label for="inputNazivUlaznice" class="form-label"
                >Naziv ulaznice</label
              >
              <input
                v-if="ticket.show"
                v-model="ticket.type"
                type="text"
                class="form-control"
                id="inputNazivUlaznice"
              />
              <input
                v-else
                v-model="ticket.type"
                type="text"
                class="form-control"
                id="inputNazivUlaznice"
                disabled
              />
            </div>

            <!-- kolicina -->
            <div class="col-lg-3">
              <label for="inputBrUlaznica" class="form-label">Količina</label>
              <div class="input-group">
                <input
                  v-if="ticket.show"
                  v-model="ticketSupply"
                  type="text"
                  class="form-control"
                  id="inputBrUlaznica"
                />
                <input
                  v-else
                  :placeholder="ticket.supply"
                  type="text"
                  class="form-control"
                  id="inputBrUlaznica"
                  disabled
                />
                <input
                  v-if="ticket.show"
                  type="text"
                  class="form-control"
                  :placeholder="currVenueCapacity"
                  disabled
                />
                <input v-else type="text" class="form-control" disabled />
              </div>
            </div>

            <!-- cijena -->
            <div class="col-lg-3">
              <label for="inputCijena" class="form-label">Cijena</label>
              <div class="input-group">
                <input
                  v-if="ticket.show"
                  v-model="ticket.price"
                  type="text"
                  class="form-control rounded-end"
                  id="inputCijena"
                />
                <input
                  v-else
                  v-model="ticket.price"
                  type="text"
                  class="form-control rounded-end"
                  id="inputCijena"
                  disabled
                />
                <button
                  v-if="ticket.show"
                  @click="addTicket(index)"
                  class="btn btn-outline-primary ms-3 rounded-start"
                >
                  <i class="bi bi-plus-lg"></i>
                </button>
                <button
                  v-else
                  @click="removeTicket(index)"
                  class="btn btn-outline-danger ms-3 rounded-start"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- form right col; nft picture upload -->
        <div
          class="col-sm-12 col-md d-flex flex-column justify-content-center mt-4 mt-md-0"
        >
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
          <button @click="createEvent" class="btn btn-primary ms-2">
            Kreiraj događaj
          </button>
        </div>

        <!-- mobile buttons -->
        <div class="d-flex justify-content-center">
          <div class="d-flex flex-column mt-4 pe-3 d-lg-none w-75">
            <button @click="previousForm" class="btn btn-primary">
              <i class="bi bi-caret-left"></i> Nazad
            </button>
            <button @click="createEvent" class="btn btn-primary mt-2">
              Kreiraj događaj
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
