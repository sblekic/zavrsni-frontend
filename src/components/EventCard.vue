<script setup>
defineProps(["event"]);
defineEmits(["sendId"]);
</script>

<template>
  <div class="col-4 pe-0">
    <img
      class="img-fluid rounded-start d-none d-sm-inline h-100"
      src="https://picsum.photos/430/180"
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
        <div class="card-element display-6 fs-4">
          {{ event.date }}
        </div>
        <div class="card-element display-6 fs-6">{{ event.dayHour }}</div>
      </div>
      <div class="col-lg-4">
        <h4 class="card-element">{{ event.name }}</h4>
        <div class="card-element text-body-secondary">
          {{ event.location }}
        </div>
      </div>
      <div
        class="col-lg-4 d-flex justify-content-end align-content-center d-none d-lg-flex"
      >
        <button
          class="btn btn-primary my-auto me-3"
          @click="$emit('sendId', event.id)"
        >
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>
