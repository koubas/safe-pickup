import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/pick-time",
    name: "PickTime",
    props: true,
    component: () =>
      import(/* webpackChunkName: "pick-time" */ "../views/PickTime.vue")
  },
  {
    path: "/:placeId",
    name: "Home",
    component: Home
  },
];

const router = new VueRouter({
  routes
});

export default router;
