<script setup>
import { BrowserProvider } from "ethers";
import { Auth } from "@/services";
import { useWalletStore } from "@/stores/wallet";
import { Modal } from "bootstrap/dist/js/bootstrap.js";
import { Dropdown } from "bootstrap/dist/js/bootstrap.js";
import _ from "lodash";
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import router from "@/router";
import { Events } from "@/services";

const wallet = useWalletStore();
const provider = new BrowserProvider(window.ethereum);
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;
const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME;
let shortAddr = ref(shortenAddress(wallet.user));
let searchTerm = ref("");
let bsSearchDropdown;
let foundEvents = ref({ isNotFound: false });

const isWrongNetwork = computed(() => {
  return wallet.chainId !== CHAIN_ID;
});

// ako metamask nije instaliran ode cijela stranica
if (window.ethereum) {
  // event listener za hendlanje promjena spojenih računa. emit svaki put kada se vracena vrijednost metode eth_accounts mijenja
  window.ethereum.on("accountsChanged", handleAccountsChanged);
  window.ethereum.on("chainChanged", updateChainId);
} else console.log("no mm detected");

watch(
  () => wallet.user,
  (newUser) => {
    shortAddr.value = shortenAddress(newUser);
  }
);

watch(
  searchTerm,
  _.debounce(async (newTerm) => {
    if (newTerm.length > 1) {
      await fetchEvent(newTerm);
      console.log("trazim");
    } else bsSearchDropdown.hide();
  }, 500)
);

onMounted(() => {
  bsSearchDropdown = Dropdown.getOrCreateInstance("#search-dropdown");
});

// removal of event listeners
onUnmounted(() => {
  console.log("unMount");
  ethereum.removeListener("accountsChanged", handleAccountsChanged);
  ethereum.removeListener("chainChanged", updateChainId);
});

async function connectWallet() {
  try {
    const [address] = await provider.send("eth_requestAccounts", []);
    // upravljanje DOM-a na temelju MM adrese.
    wallet.chainId = await provider.send("eth_chainId", []);
    wallet.user = address;
    wallet.isConnected = true;
    if (wallet.chainId !== CHAIN_ID) {
      console.log("wrong network busta");
      await changeNetwork();
    }
  } catch (error) {
    // u slučaju odbijenog zahtjeva
    console.log(error);
  }
}

// accounts = eth_accounts
function handleAccountsChanged(accounts) {
  console.log("accountsChanged event emitted");
  console.log(accounts);
  if (accounts.length === 0) {
    console.log(
      "MetaMask is locked or the user has not connected any accounts."
    );
    disconnect();
  } else if (accounts[0] !== wallet.user) {
    // azuriranje localStorage sa aktualnim userom. eth_accounts na prvom mjestu stavlja adresu koja se trenutno koristi
    wallet.user = accounts[0];
  }
}

function updateChainId(id) {
  console.log("CALL - chainchanged()");
  wallet.chainId = id;
  // po metamask dokumentaciji preporučeno je ponovno učitati stranicu.
  window.location.reload();
}

async function changeNetwork() {
  try {
    console.log("call: changeNetwork()");
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `${CHAIN_ID}` }],
    });
    wallet.chainId = CHAIN_ID;
    window.location.reload();
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `${CHAIN_ID}`,
              chainName: `${import.meta.env.VITE_CHAIN_NAME}`,
              rpcUrls: [`${import.meta.env.VITE_RPC_URL}`],
              nativeCurrency: {
                name: `${import.meta.env.VITE_CHAIN_CURRENCY}`,
                symbol: `${import.meta.env.VITE_CHAIN_CURRENCY}`,
                decimals: 18,
              },
            },
          ],
        });
        wallet.chainId = CHAIN_ID;
        window.location.reload();
      } catch (addError) {
        // handle error in adding chain
        console.log(addError);
      }
    }
    // handle other "switch" errors
    console.error("Greška: wallet_switchEthereumChain", switchError);
  }
}

function getAuthModal() {
  const modalEl = document.getElementById("authModal");
  const modal = Modal.getInstance(modalEl);
  return modal;
}

function closeAuthModal() {
  const modalEl = document.getElementById("authModal");
  const modal = Modal.getInstance(modalEl);
  try {
    modal.hide();
    function removeOnHidden() {
      modal.dispose();
    }
    modalEl.addEventListener("hidden.bs.modal", removeOnHidden);
    modalEl.removeEventListener("hidden.bs.modal", removeOnHidden);
  } catch (error) {
    // zna izbaciti grešku da je modal backdrop null ili nešto
    console.log("čisto da uhvatim error ali radi ok inače ", error);
  }

  // // alternativa ako ovo gore ne radi. kliknem gumb modal-a da se zatvori
  // const modalEl = document.getElementById("closeAuthModal");
  // modalEl.click();
}

async function authenticateUser() {
  try {
    // chain = polygon mumbai
    const userData = { address: wallet.user, chain: 80001 };
    const signer = await provider.getSigner();
    const message = await Auth.requestMessage(userData);
    const signature = await signer.signMessage(message);
    const res = await Auth.verifySignature(message, signature);
    if (res.status === 200) {
      console.log("authentication successful 🥳");
      wallet.isAuthWarning = false;
      if (getAuthModal()) {
        closeAuthModal();
      }
    }
  } catch (error) {
    if (error.code === "ACTION_REJECTED") {
      console.log("why u no auth? 😒 user rejected MM message signing process");
    } else {
      console.log(error);
    }
  }
}

function shortenAddress(address) {
  address = (address.slice(0, 5) + ".." + address.slice(-4)).toUpperCase();
  return address;
}

async function fetchEvent(searchTerm) {
  foundEvents.value = await Events.getEvents(searchTerm);
  if (foundEvents.value.length > 0) {
    // ako sam odabrao iz liste onda searchTerm ce biti isti kao i vrijednost iz baze
    if (foundEvents.value[0].name === searchTerm) return;
    // prvi prikaz dropdowna nakon što je utipkano 3 slova (postavljeno u watcher )
    else bsSearchDropdown.show();
  } else {
    // ako nema rezultata obavijesti korisnika
    foundEvents.value = { isNotFound: true };
    bsSearchDropdown.show();
  }
}

async function disconnect() {
  // brisanje jwt cookiea
  await Auth.logOut();
  // reset localHost/pinia wallet
  wallet.$reset();
}
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-body-tertiary">
    <div class="container justify-content-start">
      <!-- reminder; skraćeni logo ako bude trebalo. sakrij ovaj i zamijeni sa skraćenom verzijom -->
      <RouterLink :to="{ name: 'Home' }" class="navbar-brand">
        <img alt="showStarter logo" class="logo" src="@/assets/logo.svg" />
      </RouterLink>

      <!-- search bar -->
      <form
        class="col-12 col-md-6 col-lg-5 col-xl-4 col-xxl-4 mt-3 mt-md-0 px-2 order-2 order-sm-2"
        role="search"
      >
        <div class="input-group">
          <input
            v-model="searchTerm"
            type="search"
            class="form-control"
            placeholder="Traži po izvođaču ili lokaciji"
            aria-label="Recipient's username"
            aria-describedby="button-addon2"
          />

          <button
            class="btn btn-outline-primary rounded-end"
            type="button"
            id="button-addon2"
          >
            <i class="bi bi-search"></i>
          </button>

          <ul class="search-results dropdown-menu w-100" id="search-dropdown">
            <li v-if="!foundEvents.isNotFound" v-for="event in foundEvents">
              <a :href="`/events/${event.id}`" class="dropdown-item">
                {{ event.name }}
              </a>
            </li>
            <li v-else>
              <button class="dropdown-item disabled">
                Nema pronađenih rezultata
              </button>
            </li>
          </ul>
        </div>
      </form>

      <ul class="navbar-nav mx-2 d-none d-lg-block">
        <li class="nav-item fw-semibold">
          <RouterLink :to="{ name: 'BrowseEvents' }" class="nav-link">
            <i class="bi bi-music-note me-2"></i>Događaji
          </RouterLink>
        </li>
      </ul>

      <ul class="navbar-nav mx-2 fw-semibold d-none d-xl-block">
        <li class="nav-item">
          <RouterLink :to="{ name: 'CreateEvent' }" class="nav-link">
            <i class="bi bi-calendar-event me-2"></i>Organiziraj koncert
          </RouterLink>
        </li>
      </ul>

      <!-- gumb prijave -->
      <ul
        v-if="!wallet.isConnected"
        class="navbar-nav ms-auto order-1 order-md-2"
      >
        <li class="nav-item">
          <button
            v-on:click="connectWallet"
            type="button"
            class="btn btn-outline-primary"
            data-bs-toggle="modal"
            data-bs-target="#authModal"
          >
            <i class="bi bi-cash-stack"></i> Spoji novčanik
          </button>
        </li>
      </ul>

      <!-- Moj profil offcanvas gumb -->
      <ul v-else class="navbar-nav ms-auto order-1 order-md-2">
        <li class="nav-item">
          <button
            type="button"
            class="btn btn-outline-primary fw-semibold"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasExample"
          >
            <i class="bi bi-person-circle me-1"></i>
            Moj profil
            <i
              v-if="wallet.isAuthWarning"
              class="bi bi-exclamation-square ms-1"
            ></i>
          </button>
        </li>
      </ul>

      <!-- Moj profil offcanvas -->
      <div
        class="offcanvas-xxxl offcanvas-end bg-body-secondary"
        tabindex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <!-- offcanvas header -->
        <div class="d-flex align-items-center px-3 pt-3">
          <!-- <i class="bi bi-person-circle me-3" style="font-size: 3rem"></i> -->
          <img
            class="me-3"
            src="https://api.dicebear.com/6.x/pixel-art/svg"
            width="50"
            height="72"
          />
          <h5 class="offcanvas-title mx-auto" id="offcanvasExampleLabel">
            {{ shortAddr }}
          </h5>
          <button
            type="button"
            class="btn-close ms-auto"
            data-bs-dismiss="offcanvas"
            data-bs-target="#offcanvasExample"
            aria-label="Close"
          ></button>
        </div>
        <div v-if="wallet.isAuthWarning" class="px-3 text-danger">
          <i class="bi bi-exclamation-square me-1"></i>
          Prijava nije dovršena
        </div>

        <!-- offcanvas body -->
        <div class="offcanvas-body primary">
          <div class="d-flex my-1 d-lg-none">
            <button
              @click="router.push('/events')"
              class="btn btn-primary flex-grow-1"
              data-bs-dismiss="offcanvas"
              data-bs-target="#offcanvasExample"
            >
              <i class="bi bi-music-note me-2"></i>Događaji
            </button>
          </div>
          <div class="d-flex my-1">
            <button
              @click="router.push(`/user/${wallet.user}`)"
              class="btn btn-primary flex-grow-1"
              data-bs-dismiss="offcanvas"
              data-bs-target="#offcanvasExample"
            >
              <i class="bi bi-ticket-perforated me-2"></i>Moje ulaznice
            </button>
          </div>

          <div class="d-flex my-1">
            <button
              @click="router.push('/scan-ticket')"
              class="btn btn-primary flex-grow-1"
              data-bs-dismiss="offcanvas"
              data-bs-target="#offcanvasExample"
            >
              <i class="bi bi-qr-code-scan me-2"></i>Skeniraj ulaznice
            </button>
          </div>

          <div class="d-flex my-1 d-xl-none">
            <button
              @click="router.push('/create-event')"
              class="btn btn-primary flex-grow-1"
              data-bs-dismiss="offcanvas"
              data-bs-target="#offcanvasExample"
            >
              <i class="bi bi-calendar-event me-2"></i> Organiziraj koncert
            </button>
          </div>

          <div class="d-flex my-1">
            <button
              v-if="wallet.isAuthWarning"
              @click="authenticateUser"
              type="button"
              class="btn btn-warning flex-grow-1"
            >
              Dovrši prijavu
            </button>
          </div>

          <div class="d-flex my-1">
            <button
              @click="disconnect"
              data-bs-dismiss="offcanvas"
              data-bs-target="#offcanvasExample"
              class="btn btn-primary flex-grow-1"
            >
              Odjava
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <div v-if="wallet.isConnected">
    <div v-if="isWrongNetwork" class="navbar bg-body-tertiary">
      <div class="container text-center">
        <div class="alert alert-danger m-0 flex-grow-1" role="alert">
          Novčanik je spojen na krivoj mreži. Kako bi stranica funkcionirala
          predviđeni način, klikni
          <a href="#" class="fw-bold" @click="changeNetwork($event)">ovdje</a>
          kako biš se spojio na {{ CHAIN_NAME }} mreži
        </div>
      </div>
    </div>
  </div>

  <!-- Modal za potpis odnosno auth -->
  <!-- modal je izvan navbara jer mu smeta sticky position navbara -->
  <div class="modal fade" id="authModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-bottom-0">
          <button
            id="closeAuthModal"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body px-5 d-flex justify-content-center text-center">
          <div class="d-flex flex-column">
            <div>
              <img
                height="100px"
                width="100px"
                class="mb-3"
                src="@/assets/metamask-logo.svg"
                alt="Metamask Logo"
              />
              <h1 class="m-4">Dobrodošao!</h1>
              <p class="m-0 lead">
                Potpiši se za prijavu na svoj showStarter račun. Valjan potpis
                dokazuje da si legitiman vlasnik ove adrese. Postupak je
                besplatan pošto ne zahtjeva blockhain transakciju.
              </p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click="authenticateUser"
            type="button"
            class="btn btn-primary flex-grow-1"
          >
            Potpiši se
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-results {
  margin-top: 40px;
}
</style>
