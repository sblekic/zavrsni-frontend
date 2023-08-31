<script setup>
import { ref, onMounted } from "vue";
import { Events } from "@/services";

let events = ref([]);
let scrollContainer = ref(null);

function horizontalScroll(event, scrollContainer) {
  event.preventDefault();
  scrollContainer.scrollLeft += event.deltaY;
}

onMounted(async () => {
  events.value = await Events.getEvents();
});
</script>

<template>
  <main>
    <div class="container">
      <div
        class="row flex-lg-row-reverse justify-content-center align-items-center g-5 py-4 px-3"
      >
        <div class="col-10 col-sm-8 col-lg-6 d-none d-lg-block">
          <img
            src="@/assets/ticket-eth.svg"
            class="d-block mx-lg-auto"
            width="400"
          />
        </div>
        <div class="col-lg-6 text-center text-lg-start">
          <h1 class="display-5 fw-bold lh-1 mb-3 text-primary">
            Zakorači u budućnost prodaje ulaznica
          </h1>
          <p class="lead">
            Zahvaljujući blockchain tehnologiji u kombinaciji sa pametnim
            ugovorima, kupi i prodaj NFT ulaznice za koncerte na siguran i
            transparentan način.
          </p>
        </div>
      </div>

      <h1 class="fs-1 fw-bold lh-1 text-primary text-center my-5">
        Zašto NFT ulaznice?
      </h1>
      <div class="row text-center justify-content-center">
        <div class="card m-3" style="width: 18rem">
          <!-- <img src="" class="card-img-top" alt="..." /> -->
          <i class="bi bi-shield-check fs-1 p-3 text-primary"></i>
          <div class="card-body">
            <h5 class="card-title fw-semibold text-primary pb-4">
              Sigurnost u kupovini
            </h5>
            <p class="card-text mt-4">
              Kada su ulaznice određenog koncerta rasprodane, obožavatelji ih
              često otkupljuju od preprodavača. Tim načinom kupnje, autentičnost
              ulaznice nije garantirana, te kupac tu informaciju ne može
              provjeriti do skeniranja ulaznice na samom događaju.
            </p>
            <p class="card-text">
              U slučaju NFT ulaznica, svaka izdana ulaznica je zapisana na
              blockchainu. S obzirom da su podaci na blockchain mreži
              nepromjenjivi i svima dohvatljivi, kupac ima dokaz da se radi o
              legitimnoj ulaznici.
            </p>
          </div>
        </div>
        <div class="card m-3" style="width: 18rem">
          <!-- <img src="" class="card-img-top" alt="..." /> -->
          <i class="bi bi-graph-up-arrow fs-1 p-3 text-primary"></i>
          <div class="card-body">
            <h5 class="card-title fw-semibold text-primary pb-3">
              Upravljanje sekundarnog tržišta
            </h5>
            <p class="card-text">
              Fenomen <i>"scalpinga"</i>, odnosno preprodaja ulaznica
              rasprodanih događaja po znatno višim cijenama, je pojava koja
              nepotrebno otežava kupnju ulaznica direktno od organizatora i
              obeshrabruje obožavatelje od kupovine zbog prenapuhanih cijena.
            </p>
            <p class="card-text">
              Na našoj platformi cijena preprodaje je regulirana od strane
              pametnih ugovora, kako bi ulaznice dospjele u prave ruke.
            </p>
          </div>
        </div>
        <div class="card m-3" style="width: 18rem">
          <!-- <img src="" class="card-img-top" alt="..." /> -->
          <i class="bi bi-currency-bitcoin fs-1 p-3 text-primary pb-3"></i>
          <div class="card-body">
            <h5 class="card-title fw-semibold text-primary pb-3">
              Automatizirana podjela tantijema
            </h5>
            <p class="card-text">
              Zbog bolje kontrole sekundarnog tržišta, NFT ulaznice omogućuju
              uplatu definiranog postotka prihoda od preprodaje ulaznica na
              računu izvođača na automatizirani način.
            </p>
            <p class="card-text">
              Uplata je izvršena od strane pametnog ugovora koji upravlja
              ulaznicama i prati svaku promjenu vlasništva, odnosno svaku
              prodaju i preprodaju.
            </p>
          </div>
        </div>
      </div>

      <h1 class="fs-2 fw-bold lh-1 text-primary text-center text-lg-start mt-5">
        Izdvojeni koncerti
      </h1>

      <div
        ref="scrollContainer"
        @wheel="horizontalScroll($event, scrollContainer)"
        class="scrolling-wrapper row flex-row flex-nowrap mt-4 pb-4 pt-2"
      >
        <div
          v-for="(event, index) in events.slice(0, 4)"
          class="col-11 col-lg-4"
        >
          <RouterLink
            class="text-decoration-none"
            :to="{ name: 'EventDetails', params: { eventId: event.id } }"
          >
            <div
              :class="`card card-block rounded-bottom-0 card-${index} justify-content-center align-items-center`"
            >
              <p class="fw-semibold">Poster koncerta</p>
            </div>
          </RouterLink>
          <div class="card-body border rounded-bottom-4 p-3">
            <RouterLink
              class="fs-5 text-decoration-none"
              :to="{ name: 'EventDetails', params: { eventId: event.id } }"
            >
              {{ event.name }}
            </RouterLink>

            <div class="d-flex mt-2">
              <p class="">
                <i class="bi bi-calendar4-event me-2"></i>{{ event.date }}
              </p>
              <p class="ms-auto">
                <i class="bi bi-clock me-2"></i>{{ event.dayHour }}
              </p>
            </div>

            <p class="card-text">
              <i class="bi bi-geo-alt me-2"></i>{{ event.location }}
            </p>
          </div>
        </div>
      </div>
      <div class="col-12 text-center text-lg-end mt-2">
        <RouterLink :to="{ name: 'BrowseEvents' }" class="btn btn-primary"
          >Pregled svih događaja
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.scrolling-wrapper {
  overflow-x: auto;
  /* overflow-y: scroll; */
  scrollbar-width: thin;
}

.card-block {
  height: 200px;
  background-color: #fff;
  border: none;
  border-radius: 1rem;
  background-position: center;
  background-size: cover;
  transition: all 0.2s ease-in-out !important;
  &:hover {
    transform: translateY(-5px);
    box-shadow: none;
    opacity: 0.9;
  }
}

.card-0 {
  background-color: #ff3cac;
  background-image: linear-gradient(
    225deg,
    #ff3cac 0%,
    #784ba0 50%,
    #2b86c5 100%
  );
}
.card-1 {
  background-color: #4158d0;
  background-image: linear-gradient(
    43deg,
    #4158d0 0%,
    #c850c0 46%,
    #ffcc70 100%
  );
}

.card-2 {
  background-color: #0093e9;
  background-image: linear-gradient(160deg, #0093e9 0%, #80d0c7 100%);
}

.card-3 {
  background-color: #00dbde;
  background-image: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
}

.card-4 {
  background-color: #fbab7e;
  background-image: linear-gradient(62deg, #fbab7e 0%, #f7ce68 100%);
}
</style>
