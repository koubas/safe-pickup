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
      <v-card-title class="headline">Registrace výdejního místa</v-card-title>
      <v-card-subtitle>Vyplňte údaje o výdejním místě</v-card-subtitle>
      <v-form v-model="valid" @submit="submit()" @submit.prevent>
        <v-card-text>
          <v-text-field
            v-model="placeName"
            label="Název"
            :rules="placeNameRules"
            required
            filled
          />
          <v-text-field
            v-model="password1"
            label="Heslo"
            :rules="passwordRules"
            required
            autocomplete="off"
            type="password"
            filled
          />
          <v-text-field
            v-model="password2"
            label="Heslo znovu"
            :rules="passwordRules"
            required
            autocomplete="off"
            type="password"
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
            Odeslat ke schválení
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { registerPlace } from "@/api/backend.js"

export default {
  name: "RegisterPlace",
  components: {
  },
  data() {
    return {
      errorMessage: "",
      valid: false,
      placeName: "",
      password1: "",
      password2: "",
      placeNameRules: [
        v => !!v || 'Povinné pole',
        v => (v || '').length <= 50 ||
              `Příliš dlouhý název`,
        v => (v || '').length >= 10 ||
              `Příliš krátký název`,
      ],
      passwordRules: [
        v => !!v || 'Povinné pole',
        v => (v || '').length <= 50 ||
              `Příliš dlouhé heslo`,
        v => (v || '').length >= 8 ||
              `Příliš krátké heslo`,
      ],
    }
  },
  methods: {
    async submit() {
      if (this.password1 !== this.password2) {
        return this.errorMessage = "Zadaná hesla se neshodují"
      }

      try {
        const result = await registerPlace(this.placeName, this.password1)
        if (result.statusCode !== 200) {
          return this.errorMessage = "Registrace se nezdařila"
        }
      } catch {
          return this.errorMessage = "Při registraci nastala chyba"
      }
      
      this.errorMessage = ""
      alert("Povedlo se")
    },
  },
};
</script>
