<script setup></script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
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
        class="d-flex flex-grow-1 mx-auto mt-3 mt-md-0 px-2 order-2 order-sm-2"
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
        class="offcanvas-xxl offcanvas-end"
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
