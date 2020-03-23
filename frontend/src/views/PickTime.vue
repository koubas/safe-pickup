<template>
  <div>
    <h1 class="headline">Bezpečný výdej</h1>
    <h2 class="subtitle-1" style="color: rgb(0, 0, 0, 0.6)">{{ place.name }}</h2>
    <TimeAxis :place="place" />
  </div>
</template>

<script>
import TimeAxis from "@/components/TimeAxis.vue";

export default {
  name: "PickTime",
  components: {
    TimeAxis
  },
  props: {
    place: Object
  },
  mounted() {
    console.log(this.place)
  }
};
</script>
