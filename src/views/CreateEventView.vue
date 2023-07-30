<script setup>
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
      <div class="d-flex mb-4 justify-content-center">
        <h1 class="">Organiziraj koncert</h1>
      </div>
      <!-- form za događaj -->
      <div class="event-form row">
        <!-- form left col -->
        <div class="col">
          <div class="row">
            <!-- form elements -->
            <div class="col-12">
              <label for="inputImeEventa" class="form-label"
                >Naziv eventa</label
              >
              <input type="text" class="form-control" id="inputImeEventa" />
            </div>
            <div class="col-12">
              <label for="inputProstor" class="form-label">Prostor</label>
              <input type="text" class="form-control" id="inputProstor" />
            </div>
            <div class="col-12">
              <label for="inputIzvodac" class="form-label">Izvođač</label>
              <input type="text" class="form-control" id="inputIzvodac" />
            </div>
            <div class="col-12">
              <label for="inputPocetak" class="form-label">Početak</label>
              <input type="text" class="form-control" id="inputPocetak" />
            </div>
            <div class="col-12">
              <label for="inputKraj" class="form-label">Kraj</label>
              <input type="text" class="form-control" id="inputKraj" />
            </div>
            <div class="col-12">
              <label for="inputZanr" class="form-label">Žanr glazbe</label>
              <input type="text" class="form-control" id="inputZanr" />
            </div>
          </div>
        </div>
        <!-- form right col -->
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
        <!-- form left col -->
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
            <div class="col-12">
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
            </div>
          </div>
        </div>
        <!-- form right col -->
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
