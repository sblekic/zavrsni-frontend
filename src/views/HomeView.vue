<script setup>
import { ref, onBeforeMount } from "vue";
import { Events } from "@/services";
import EventCard from "@/components/EventCard.vue";
import { useBreakpoints } from "@vueuse/core";
import router from "@/router";

const breakpoints = useBreakpoints({
  lg: 992,
});

const noButton = breakpoints.smaller("lg");

let events = ref("");

onBeforeMount(async () => {
  events.value = await Events.getEvents();
});

function goToDetails(eventId) {
  router.push(`/${eventId}`);
}
</script>

<template>
  <main>
    <div class="container">
      <!-- mobile; touch input na cijeli div otvara detalje o eventu -->
      <div
        v-if="noButton"
        v-for="event in events"
        @click="goToDetails(event.id)"
        class="row mb-4 me-1"
      >
        <EventCard :event="event" />
      </div>
      <!-- desktop; click na button otvara detalje o eventu -->
      <div v-else v-for="event in events" class="row mb-4 me-1">
        <EventCard @sendId="goToDetails" :event="event" />
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
