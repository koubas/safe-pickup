import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import AdminLogin from "../views/AdminLogin.vue";
import AdminPlace from "../views/AdminPlace.vue";

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
    path: "/register-place",
    name: "RegisterPlace",
    component: () =>
      import(/* webpackChunkName: "register-place" */ "../views/RegisterPlace.vue")
  },

  // admin routes
  {
    path: "/admin",
    name: "AdminLogin",
    component: AdminLogin
    //component: () => {
    //  import(/* webpackChunkName: "admin-login" */ "../views/AdminLogin.vue")
    //}
  },

  {
    path: "/admin/place",
    name: "AdminPlace",
    props: true,
    component: AdminPlace
    //component: () => {
    //  import(/* webpackChunkName: "admin-place" */ "../views/AdminPlace.vue")
    //}
  },

  // fallback - placeId alone
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
