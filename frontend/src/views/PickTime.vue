<template>
  <div>
    <h1 class="headline">Bezpečný výdej</h1>
    <h2 class="subtitle-1" style="color: rgb(0, 0, 0, 0.6)">{{ place.name }}</h2>
    <TimeAxis :place="place" @end="startSaveTimeout" />
    <v-snackbar
      v-model="saveSnack"
      :timeout="0"
    >
      Výběr bude uložen za {{ saveTimeout }}
      <v-btn
        color="pink"
        text
        @click="saveNow"
      >
        Ulož teď!
      </v-btn>
    </v-snackbar>
    <v-snackbar
      v-model="saveDone"
      :timeout="2000"
      color="success"
    >
      Uloženo!
    </v-snackbar>
  </div>
</template>

<script>
import TimeAxis from "@/components/TimeAxis.vue";
import { updateVisit } from "@/api/backend.js"

export default {
  name: "PickTime",
  components: {
    TimeAxis
  },
  props: {
    place: Object,
    placeId: String,
    visitorCode: String,
  },
  data() {
    return {
      saveMoment: null,
      saveSnack: false,
      saveTimeout: 0,
      saveInterval: null,
      saveDone: false,
    }
  },
  methods: {
    startSaveTimeout(target) {
      this.saveMoment = target.moment
      clearInterval(this.saveInterval)
      this.saveSnack = true
      this.saveTimeout = 5
      this.saveInterval = setInterval(() => {
        this.saveTimeout--
        if (this.saveTimeout == 0) {
          clearInterval(this.saveInterval)
          this.saveSnack = false
          this.save()
        }
      }, 1000)
      
    },
    saveNow() {
      clearInterval(this.saveInterval)
      this.saveSnack = false
      clearInterval(this.saveInterval)
      this.save()
    },
    async save() {
      await updateVisit(this.saveMoment.toISOString(true), this.visitorCode)
      this.saveDone = true
    }
  },
  mounted() {
    if (this.place === undefined) {
      this.$router.push({ name: 'Home', params: { placeId: this.placeId }})
    }
  }
};
</script>
