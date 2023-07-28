<script setup></script>

<template>
  <main>
    <div class="container">
      <div class="d-flex mb-5 align-items-center justify-content-center">
        <h1 class="">Organiziraj koncert</h1>
      </div>
      <div class="row">
        <!-- form left col -->
        <div class="col">
          <div class="row">
            <div class="col-md-6">
              <label for="inputEmail4" class="form-label">Email</label>
              <input type="email" class="form-control" id="inputEmail4" />
            </div>
            <div class="col-md-6">
              <label for="inputPassword4" class="form-label">Password</label>
              <input type="password" class="form-control" id="inputPassword4" />
            </div>

            <div class="col-12">
              <label for="inputAddress2" class="form-label">Address 2</label>
              <input
                type="text"
                class="form-control"
                id="inputAddress2"
                placeholder="Apartment, studio, or floor"
              />
            </div>
          </div>
        </div>
        <!-- form right col -->
        <div class="col-sm-12 col-md d-flex justify-content-center">
          <img src="https://placeholder.pics/svg/300" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
