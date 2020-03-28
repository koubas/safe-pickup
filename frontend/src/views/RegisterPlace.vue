<template>
  <div>
    <v-alert prominent type="error" v-if="errorMessage !== ''">
      {{ errorMessage }}
    </v-alert>
    <v-card class="mx-auto" max-width="500" width="100%">
      <v-card-title class="headline">Registrace výdejního místa</v-card-title>
      <v-card-subtitle>Vyplňte údaje o výdejním místě</v-card-subtitle>
      <v-form v-model="valid" @submit="submit()" @submit.prevent>
        <v-card-text>
          <v-text-field
            v-model="placeName"
            label="Název místa"
            :rules="placeNameRules"
            required
            filled
          />
          <v-text-field
            v-model="email"
            label="Kontaktní e-mail"
            :rules="emailRules"
            type="email"
            required
            filled
          />
          <v-text-field
            v-model="password1"
            label="Heslo"
            :rules="passwordRules"
            required
            autocomplete="new-password"
            type="password"
            filled
          />
          <v-text-field
            v-model="password2"
            label="Heslo znovu"
            :rules="passwordRules"
            required
            autocomplete="new-password"
            type="password"
            filled
          />
        </v-card-text>
        <v-card-text>
          <p>
            Zadané údaje nebudou použity k marketingovým účelům a nebudou
            poskytnuty dalším subjektům.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="!valid" color="success" class="mr-4" type="submit">
            Odeslat ke schválení
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
    <v-dialog v-model="okDialog" width="100%" max-width="500" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          Registrace byla úspěšná
        </v-card-title>
        <v-card-text>
          <br />
          <p class="body-1">
            DÚLEŽITÉ: zapište si prosím tento kód, pomocí něj se budete
            přihlašovat do administrátorské sekce a bude součástí odkazu pro
            vaše zákazníky.
          </p>
          <p class="display-1">{{ placeId }}</p>
          <p>
            <a href="/admin"
              >Příhlásit se do administrace ({{ origin }}/admin)</a
            >
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { registerPlace } from "@/api/backend.js"

export default {
  name: "RegisterPlace",
  components: {},
  data() {
    return {
      errorMessage: "",
      valid: false,
      placeName: "",
      password1: "",
      password2: "",
      email: "",
      okDialog: false,
      placeId: "",
      origin: window.location.origin,
      placeNameRules: [
        v => !!v || "Povinné pole",
        v => (v || "").length <= 50 || `Příliš dlouhý název`,
        v => (v || "").length >= 10 || `Příliš krátký název`
      ],
      passwordRules: [
        v => !!v || "Povinné pole",
        v => (v || "").length <= 50 || `Příliš dlouhé heslo`,
        v => (v || "").length >= 8 || `Příliš krátké heslo`
      ],
      emailRules: [
        v =>
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            v
          ) || `Neplatný e-mail`
      ]
    }
  },
  methods: {
    async submit() {
      if (this.password1 !== this.password2) {
        return (this.errorMessage = "Zadaná hesla se neshodují")
      }

      try {
        const result = await registerPlace(
          this.placeName,
          this.email,
          this.password1
        )
        if (result.statusCode !== 200) {
          return (this.errorMessage = "Registrace se nezdařila")
        }
        this.errorMessage = ""
        this.okDialog = true
        console.log(result)
        this.placeId = result.placeId
      } catch {
        return (this.errorMessage = "Při registraci nastala chyba")
      }
    }
  }
}
</script>
