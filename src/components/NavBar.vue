<script setup>
import { BrowserProvider } from "ethers";
import { Auth } from "@/services";
import { useWalletStore } from "@/stores/wallet";
import { Modal } from "bootstrap/dist/js/bootstrap.js";
import { onUnmounted } from "vue";

const wallet = useWalletStore();
const provider = new BrowserProvider(window.ethereum);

console.log(
  "test da provjerim ako netlify prepozna env var",
  import.meta.env.VITE_AXIOS_URL
);

// ako metamask nije instaliran ode cijela stranica
if (window.ethereum) {
  // event listener za hendlanje promjena spojenih računa. emit svaki put kada se vracena vrijednost metode eth_accounts mijenja
  window.ethereum.on("accountsChanged", handleAccountsChanged);
} else console.log("no mm detected");

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

// removal of event listeners
onUnmounted(() => {
  console.log("unMount");
  ethereum.removeListener("accountsChanged", handleAccountsChanged);
});

async function connectWallet() {
  try {
    const [address] = await provider.send("eth_requestAccounts", []);
    // upravljanje DOM-a na temelju MM adrese.
    wallet.user = address;
    wallet.isConnected = true;
  } catch (error) {
    // u slučaju odbijenog zahtjeva
    console.log(error);
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
    modalEl.addEventListener("hidden.bs.modal", (event) => {
      modal.dispose();
    });
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

async function disconnect() {
  // brisanje jwt cookie
  await Auth.logOut();
  // reset localHost/pinia wallet
  wallet.$reset();
}
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-body-tertiary">
    <div class="container justify-content-start">
      <!-- reminder; skraćeni logo ako bude trebalo. sakrij ovaj i zamijeni sa skraćenom verzijom -->
      <RouterLink :to="{ name: 'Home' }" class="navbar-brand"
        ><img
          src="https://placeholder.pics/svg/32x33/4FFF3B-3969FF"
          class="me-1"
          alt="Showstarter Logo"
        />
        Showstarter
      </RouterLink>

      <!-- search bar -->
      <form
        class="col-12 col-md-6 col-lg-5 col-xl-4 col-xxl-4 mt-3 mt-md-0 px-2 order-2 order-sm-2"
        role="search"
      >
        <div class="input-group">
          <input
            type="search"
            class="form-control"
            placeholder="Traži po izvođaču, lokaciji ili žanru"
            aria-label="Recipient's username"
            aria-describedby="button-addon2"
          />
          <button
            class="btn btn-outline-primary"
            type="button"
            id="button-addon2"
          >
            <i class="bi bi-search"></i>
          </button>
        </div>
      </form>

      <ul class="navbar-nav mx-2 d-none d-lg-block">
        <li class="nav-item">
          <RouterLink :to="{ name: 'CreateEvent' }" class="nav-link">
            <i class="bi bi-calendar-event me-2"></i> Organiziraj koncert
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
            class="btn btn-outline-primary"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasExample"
          >
            <i class="bi bi-person-circle me-1"></i> Moj profil
            <i
              v-if="wallet.isAuthWarning"
              class="bi bi-exclamation-square ms-1"
            ></i>
          </button>
        </li>
      </ul>

      <!-- Moj profil offcanvas -->
      <div
        class="offcanvas-xxxl offcanvas-end"
        tabindex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <!-- offcanvas header -->
        <div class="d-flex align-items-center px-3 pt-3">
          <i class="bi bi-person-circle me-3" style="font-size: 3rem"></i>
          <h5 class="offcanvas-title" id="offcanvasExampleLabel">
            0x732f28...E113612D
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
          <div class="d-flex my-1">
            <button class="btn btn-primary flex-grow-1">
              <i class="bi bi-ticket-perforated me-2"></i>Moje ulaznice
            </button>
          </div>

          <div class="d-flex my-1 d-lg-none">
            <RouterLink
              :to="{ name: 'CreateEvent' }"
              class="btn btn-primary flex-grow-1"
              data-bs-dismiss="offcanvas"
              data-bs-target="#offcanvasExample"
            >
              <i class="bi bi-calendar-event me-2"></i> Organiziraj koncert
            </RouterLink>
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
                class="mb-3"
                src="https://placeholder.pics/svg/64x64/FFB121"
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

<style></style>
