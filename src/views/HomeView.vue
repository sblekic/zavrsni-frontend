<script setup>
import { useCounterStore } from "@/stores/counter";
import { useWalletStore } from "@/stores/wallet";

const wallet = useWalletStore();
const counter = useCounterStore();
</script>

<template>
  <main>
    <div class="container-fluid border border-success">
      <h2>Registered Events</h2>

      <div>Current Count: {{ counter.count }}</div>
      <button @click="counter.increment()" class="btn btn-primary">
        increment
      </button>
      <button @click="counter.reset()" class="btn btn-primary">reset</button>
    </div>

    <div>{{ wallet }}</div>

    <!-- Button trigger modal -->
    <button
      type="button"
      class="btn btn-primary"
      data-bs-toggle="modal"
      data-bs-target="#exampleModal"
    >
      Launch demo modal
    </button>

    <!-- Modal -->
    <div
      class="modal fade"
      id="exampleModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">...</div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button type="button" class="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  margin: 5vh;
}
</style>
