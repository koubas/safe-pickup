<template>
  <div>
    <v-alert
      prominent
      type="error"
      v-if="errorMessage !== ''"
    >
      {{ errorMessage }}
    </v-alert>
    <v-card
      class="mx-auto"
      max-width="500"
      width="100%"
    >
      <v-card-title class="headline">Bezpečný výdej</v-card-title>
      <v-card-subtitle>{{ place.name }}</v-card-subtitle>
      <v-form v-model="valid" @submit="submit()" @submit.prevent>
        <v-card-text>
          <v-text-field
            v-model="visitorCode"
            label="Ověřovací kód objednávky"
            :rules="visitorCodeRules"
            required
            autocomplete="off"
            filled
          />
        </v-card-text>

        <v-card-actions>
          <v-btn 
            :disabled="!valid"
            color="success"
            class="mr-4"
            type="submit"
          >
            Přihlásit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { getPlacePublicInfo, getPlace } from "@/api/backend.js"
export default {
  name: "Home",
  components: {
  },
  data() {
    return {
      errorMessage: "",
      valid: false,
      visitorCode: "",
      visitorCodeRules: [
        v => !!v || 'Kód je povinný',
      ],
      place: {
        name: "načítám...",
      }
    }
  },
  methods: {
    async updatePlaceId() {
      const place = await getPlacePublicInfo(this.$route.params.placeId)
      if (place.statusCode === 200) {
        this.place = place
      } else if (place.statusCode === 404) {
        this.errorMessage = "Neplatný kód výdejního místa, zkontrolujte URL"
      } else {
        this.errorMessage = "Ups! Něco se pokazilo :("
      }
    },
    async submit() {
      const place = await getPlace(this.$route.params.placeId, this.visitorCode)
      if (place.statusCode === 200) {
        this.$router.push({ name: 'PickTime', params: { place, placeId: place.id, visitorCode: `${place.id}-${this.visitorCode}` } })
      } else if (place.statusCode === 401) {
        this.errorMessage = "Neplatný ověřovací kód, zkuste jej zadat znovu"
      } else {
        this.errorMessage = "Ups! Něco se pokazilo :("
      }
    },
  },
  watch: {
    $route() {
      this.errorMessage = ""
      this.updatePlaceId()
    }
  },
  mounted() {
    this.updatePlaceId()
  }
};
</script>

<style scoped>
  .v-card {
  }
</style>
