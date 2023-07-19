<script setup>
import { BrowserProvider } from "ethers";
import { Auth } from "@/services";
const provider = new BrowserProvider(window.ethereum);

// window.ethereum.on('accountsChanged', handleAccountsChanged);

// // eth_accounts always returns an array.
// function handleAccountsChanged(accounts) {
//   if (accounts.length === 0) {
//     // MetaMask is locked or the user has not connected any accounts.
//     console.log('Please connect to MetaMask.');
//   } else if (accounts[0] !== currentAccount) {
//     // Reload your interface with accounts[0].
//     currentAccount = accounts[0];
//     // Update the account displayed (see the HTML for the connect button)
//     showAccount.innerHTML = currentAccount;
//   }
// }

async function connectWallet() {
  try {
    const [address] = await provider.send("eth_requestAccounts", []);
    // console.log(address);

    // const chainId = await provider.send("eth_chainId");
    // console.log(chainId);

    // chain = polygon mumbai
    const userData = { address, chain: 80001 };
    // console.log(userData);

    const signer = await provider.getSigner();
    const message = await Auth.requestMessage(userData);

    const signature = await signer.signMessage(message);
    // console.log(message);
    // console.log(signature);

    await Auth.verifySignature(message, signature);
  } catch (error) {
    // u slučaju odbijenog zahtjeva
    console.log(error);
  }
}

async function disconnect() {
  // await Auth.logOut();
  const signer = await provider.getSigner();

  const signature = await signer.signMessage("test");
}
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid justify-content-start">
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
        class="col-12 col-md-6 col-lg-6 col-xl-4 col-xxl-3 mt-3 mt-md-0 px-2 order-2 order-sm-2"
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

      <button class="btn btn-primary" @click="disconnect">test</button>
      <!-- gumb prijave -->
      <ul class="navbar-nav ms-auto order-1 order-md-2">
        <li class="nav-item">
          <button
            v-on:click="connectWallet"
            type="button"
            class="btn btn-outline-primary"
          >
            Spoji novčanik <i class="bi bi-person-circle"></i>
          </button>
        </li>
      </ul>

      <!-- profil offcanvas gumb -->
      <ul class="navbar-nav ms-auto order-1 order-md-2">
        <li class="nav-item">
          <button
            type="button"
            class="btn btn-outline-primary"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasExample"
          >
            <i class="bi bi-person-circle"></i> Moj profil
          </button>
        </li>
      </ul>

      <!-- profil offcanvas -->
      <div
        class="offcanvas-xxxl offcanvas-end"
        tabindex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div class="offcanvas-header justify-content-start">
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
        <div class="offcanvas-body">
          <ul class="navbar-nav ps-4">
            <li class="nav-item">
              <a class="nav-link" aria-current="page" href="#">
                <i class="bi bi-ticket-perforated me-2"></i>Moje ulaznice
              </a>
            </li>
          </ul>
          <ul class="navbar-nav ps-4">
            <li class="nav-item">
              <a class="nav-link" aria-current="page" href="#">
                <i class="bi bi-calendar-event me-2"></i>Organiziraj koncert
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<style></style>
