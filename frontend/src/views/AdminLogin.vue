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
      <v-card-title class="headline">Administrační sekce</v-card-title>
      <v-card-subtitle>Přihlášení</v-card-subtitle>
      <v-form v-model="valid" @submit="submit()" @submit.prevent>
        <v-card-text>
          <v-text-field
            v-model="placeId"
            label="Identifikátor výdejního místa"
            :rules="commonRules"
            required
            filled
          />
          <v-text-field
            v-model="password"
            label="Heslo"
            :rules="commonRules"
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
            Přihlásit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { adminAuth } from "@/api/backend.js"
import { Base64 } from 'js-base64'

export default {
  name: "AdminLogin",
  components: {
  },
  data() {
    return {
      errorMessage: "",
      valid: false,
      placeId: "",
      password: "",
      commonRules: [
        v => !!v || 'Povinné pole',
      ],
    }
  },
  methods: {
    async submit() {
        const result = await adminAuth(this.placeId, this.password)
        if (result.statusCode !== 200) {
            this.errorMessage = "Špatné ID nebo heslo, zkuste to znovu"
        } else {
            this.errorMessage = ""
            const { placeId, password } = this
            this.$router.push({ name: 'AdminPlace', params: {
              authKey: Base64.encode(JSON.stringify({ placeId, password }))
            }})
        }
    },
  },
};
</script>
