<template>
  <div>
    <v-card class="mx-auto" max-width="1200" width="100%">
      <v-card-title class="headline">{{ place.name }}</v-card-title>
      <v-card-subtitle>Bezpečný výdej</v-card-subtitle>
      <v-card-text>
        <p>
          Posuvníkem zvolte čas, kdy se dostavíte na výdejní místo. Volte dobu v
          intervalech mezi návštěvami jiných zákazníků, vyznačených tečkami na
          časové ose. Prosíme o dochvilnost, čas můžete kdykoliv opakovaně změnit posuvníkem.
        </p>
        <p>Děkujeme</p>
      </v-card-text>
      <v-card-text>
        <TimeAxis :place="place" @end="startSaveTimeout" />
      </v-card-text>
      <div style="height: 5em"></div>
    </v-card>
    <v-snackbar v-model="saveSnack" :timeout="0">
      Výběr bude uložen za {{ saveTimeout }}
      <v-btn color="pink" text @click="saveNow">
        Ulož teď!
      </v-btn>
    </v-snackbar>
    <v-snackbar v-model="saveDone" :timeout="1000" color="success">
      Uloženo!
    </v-snackbar>
  </div>
</template>

<script>
import TimeAxis from "@/components/TimeAxis.vue"
import { updateVisit, getPlace } from "@/api/backend.js"

export default {
  name: "PickTime",
  components: {
    TimeAxis
  },
  props: {
    place: Object,
    placeId: String,
    visitorCode: String
  },
  data() {
    return {
      saveMoment: null,
      saveSnack: false,
      saveTimeout: 0,
      saveInterval: null,
      saveDone: false,
      refreshInterval: null
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
    },
    async refrestVisits() {
      const freshPlace = await getPlace(
        this.placeId,
        this.place.myVisit.visitor_id
      )
      this.place = {
        ...this.place,
        visits: freshPlace.visits
      }
    }
  },
  mounted() {
    if (this.place === undefined) {
      this.$router.push({ name: "Home", params: { placeId: this.placeId } })
    }
    this.refreshInterval = setInterval(this.refrestVisits, 10000)
  },
  destroyed() {
    clearInterval(this.refreshInterval)
  }
}
</script>
