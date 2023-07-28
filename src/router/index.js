import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CreateEventView from "@/views/CreateEventView.vue";
import EventView from "@/views/EventView.vue";
import TestingView from "@/views/TestingView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/create-event",
      name: "CreateEvent",
      component: CreateEventView,
    },
    {
      path: "/:eventId",
      name: "EventDetails",
      component: EventView,
    },
    {
      path: "/test",
      name: "testing",
      component: TestingView,
    },
  ],
});

export default router;
