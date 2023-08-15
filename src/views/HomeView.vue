<script setup>
import { ref } from "vue";

// import { } from "@/services";
</script>

<template>
  <main>
    <div class="container">
      <div class="row mb-4 me-1">
        <div class="col-4 pe-0">
          <img
            class="img-fluid rounded-start d-none d-sm-inline h-100"
            src="https://picsum.photos/430/150"
          />
          <img
            class="img-fluid rounded-start d-sm-none h-100"
            src="https://picsum.photos/200/280"
          />
        </div>
        <div
          class="col-8 d-flex flex-column border border-dark-subtle rounded-end justify-content-center"
        >
          <div class="row">
            <div class="col-lg-4 my-auto">
              <div class="card-element display-6 fs-4">LIP 21</div>
              <div class="card-element display-6 fs-6">Sri - 20:00h</div>
            </div>
            <div class="col-lg-4">
              <h4 class="card-element">Arch Enemy u Tvornici Kulture</h4>
              <div class="card-element text-body-secondary">
                Tvornica Kulture, Zagreb
              </div>
            </div>
            <div
              class="col-lg-4 d-flex justify-content-end align-content-center d-none d-lg-flex"
            >
              <button class="btn btn-primary my-auto me-3" @click="test()">
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.card-element {
  padding-left: 0.25rem;
  margin-bottom: 0.25rem;
}
</style>
