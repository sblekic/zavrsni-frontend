import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import BrowseEventsView from "@/views/BrowseEventsView.vue";
import CreateEventView from "@/views/CreateEventView.vue";
import EventView from "@/views/EventView.vue";
import UserView from "@/views/UserView.vue";
import TicketScanView from "@/views/TicketScanView.vue";
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
      path: "/events",
      name: "BrowseEvents",
      component: BrowseEventsView,
    },
    {
      path: "/create-event",
      name: "CreateEvent",
      component: CreateEventView,
    },
    {
      path: "/events/:eventId",
      name: "EventDetails",
      component: EventView,
    },
    {
      path: "/user/:userId",
      name: "UserView",
      component: UserView,
    },
    {
      path: "/scan-ticket",
      name: "ScanView",
      component: TicketScanView,
    },
    {
      path: "/dev",
      name: "dev",
      component: TestingView,
    },
  ],
});

export default router;
