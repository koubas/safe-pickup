<template>
  <div>
    <v-alert prominent type="error" v-if="errorMessage !== ''">
      {{ errorMessage }}
    </v-alert>
    <v-card class="mx-auto" max-width="1000" width="100%">
      <v-card-title class="headline">Správa výdejního místa</v-card-title>
      <v-card-subtitle>{{ place.name }}</v-card-subtitle>
      <v-card-text>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Hledat"
          single-line
          hide-details
        />
        <v-data-table
          :headers="headers"
          :items="visitsEnhanced"
          :search="search"
          class="elevation-1"
        />
      </v-card-text>
      <v-card-text class="d-flex justify-end">
        <v-dialog v-model="editVisitsDialog" persistent max-width="900">
          <template v-slot:activator="{ on }">
            <v-btn color="green darken" text dark v-on="on" @click="disablePeriodicRefresh()"
              >Upravit seznam vyzvednutí</v-btn
            >
          </template>
          <v-card>
            <v-card-title class="headline"
              >Editace seznamu vyzvednutí</v-card-title
            >
            <v-card-text>
              <v-textarea
                v-model="visitsCsv"
                label="CSV s aktuálními objednávkami (sloupce: ověřovací kód, identtifikátor (např. jméno, nebo ID z vašeho systému) "
                :placeholder="
                  '\nPříklad:\n1234, Jan Novák\n5678, Rudolf Skočdopole\n789az-235-cb489, 5679867'
                "
                rows="15"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="cancelCsvDialog"
                >Zrušit</v-btn
              >
              <v-btn color="green darken-1" text @click="saveCsvAndCloseDialog"
                >Uložit</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
      <v-card-subtitle>Podrobnosti o výdejním místě</v-card-subtitle>
      <v-form v-model="valid" @submit="submit()" @submit.prevent>
        <v-card-text>
          <v-text-field
            v-model="place.name"
            label="Název"
            required
            filled
            dense
            disabled
          />
          <v-row>
            <v-col cols="11" sm="3">
              <v-menu
                ref="opensDateMenu"
                v-model="opensDateMenu"
                :close-on-content-click="false"
                :return-value.sync="opensDate"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="opensDate"
                    label="Otevírá v (datum)"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-on="on"
                  />
                </template>
                <v-date-picker v-model="opensDate" no-title scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="opensDate = false"
                    >Zrušit</v-btn
                  >
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.opensDateMenu.save(opensDate)"
                    >OK</v-btn
                  >
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="11" sm="2">
              <v-menu
                ref="opensTimeMenu"
                v-model="opensTimeMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="opensTime"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="opensTime"
                    label="(čas)"
                    prepend-icon="mdi-clock-outline"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-time-picker
                  v-if="opensTimeMenu"
                  v-model="opensTime"
                  full-width
                  @click:minute="$refs.opensTimeMenu.save(opensTime)"
                ></v-time-picker>
              </v-menu>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="11" sm="3">
              <v-menu
                ref="closesDateMenu"
                v-model="closesDateMenu"
                :close-on-content-click="false"
                :return-value.sync="closesDate"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="closesDate"
                    label="Zavírá v (datum)"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-on="on"
                  />
                </template>
                <v-date-picker v-model="closesDate" no-title scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="closesDateMenu = false"
                    >Zrušit</v-btn
                  >
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.closesDateMenu.save(closesDate)"
                    >OK</v-btn
                  >
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="11" sm="2">
              <v-menu
                ref="closesTimeMenu"
                v-model="closesTimeMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="closesTime"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="closesTime"
                    label="(čas)"
                    prepend-icon="mdi-clock-outline"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-time-picker
                  v-if="closesTimeMenu"
                  v-model="closesTime"
                  full-width
                  @click:minute="$refs.closesTimeMenu.save(closesTime)"
                ></v-time-picker>
              </v-menu>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn disabledx="!valid" color="success" class="mr-4" type="submit">
            Uložit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import {
  adminGetPlace,
  adminUpdateVisits,
  adminUpdatePlace
} from "@/api/backend.js"
import moment from "moment-timezone"

export default {
  name: "AdminPlace",
  components: {},
  props: {
    authKey: String
  },
  data() {
    return {
      errorMessage: "",
      place: {
        name: "loading...",
        visits: []
      },

      valid: true,

      opensDateMenu: false,
      opensDate: "",
      opensTimeMenu: false,
      opensTime: "",

      closesDateMenu: false,
      closesDate: "",
      closesTimeMenu: false,
      closesTime: "",

      search: "",
      headers: [
        { text: "Kód", value: "visitor_id" },
        { text: "Zákazník", value: "visitor" },
        { text: "Čas", value: "at" }
      ],

      editVisitsDialog: false,
      visitsCsv: "",
      visitsCsvPrev: "",

      periodicRefresh: null
    }
  },
  computed: {
    visitsEnhanced() {
      return this.place.visits.map(visit => ({
        ...visit,
        at: visit.at.length < 3 ? "" : moment(visit.at).format("D.M.YYYY HH:mm")
      }))
    }
  },
  async mounted() {
    if (this.authKey === undefined) {
      return this.$router.push({ name: "AdminLogin" })
    }

    await this.loadPlace()
    this.opensDate = moment(this.place.opens).format("YYYY-MM-DD")
    this.opensTime = moment(this.place.opens).format("HH:mm")
    this.closesDate = moment(this.place.closes).format("YYYY-MM-DD")
    this.closesTime = moment(this.place.closes).format("HH:mm")

    this.visitsToCsv()
    this.enablePeriodicRefresh()
  },
  methods: {
    async submit() {
      const placeUpdate = {
        opens: moment(`${this.opensDate} ${this.opensTime}`).toISOString(true),
        closes: moment(`${this.closesDate} ${this.closesTime}`).toISOString(
          true
        )
      }
      adminUpdatePlace(placeUpdate, this.authKey)
    },
    visitsToCsv() {
      console.log(this.place)
      this.visitsCsv = this.place.visits.reduce((csv, visit) => {
        return `${csv}${visit.visitor_id}, ${visit.visitor || ""}\n`
      }, "")
      this.visitsCsvPrev = this.visitsCsv
    },
    cancelCsvDialog() {
      if (this.visitsCsv !== this.visitsCsvPrev) {
        if (confirm("Chcete opravdu zahodit provedené změny?")) {
          this.visitsCsv = this.visitsCsvPrev
        } else {
          return
        }
      }
      this.editVisitsDialog = false
      this.enablePeriodicRefresh()
    },
    async saveCsvAndCloseDialog() {
      const lines = this.visitsCsv
        .split("\n")
        .filter(line => !line.match(/^\s*$/))

      const errors = lines.reduce((error, line) => {
        if (error === null) {
          if (!line.match(/^\s*[a-zA-Z0-9-]{4,20}\s*,/)) {
            return `Neplatný formát kódu (min. 4 znaky a-z, 0-9, -), nebo za ním chybí čárka ("${line}")`
          }
          if (!line.match(/^[^,]+,[^,]*$/)) {
            return `Každý řádek může obsahovat pouze jednu čárku ("${line}")`
          }
        }
        return error
      }, null)
      if (errors === null) {
        const visitUpdates = lines.map(line => {
          const [visitor_id, visitor] = line.split(",")
          return {
            visitor_id: visitor_id.trim().toLowerCase(),
            visitor: visitor.trim()
          }
        })

        await adminUpdateVisits(visitUpdates, this.authKey)

        this.editVisitsDialog = false
      } else {
        alert(errors)
      }
      await this.loadPlace()
      this.enablePeriodicRefresh()
    },
    async loadPlace() {
      this.place = await adminGetPlace(this.authKey)
    },
    enablePeriodicRefresh() {
      console.log('enable periodic refresh')
      this.periodicRefresh = setInterval(async () => {
        const freshPlace = await adminGetPlace(this.authKey)
        this.place = {
          ... this.place,
          visits: freshPlace.visits,
        }
      }, 3000)
    },
    disablePeriodicRefresh() {
      console.log('disable periodic refresh')
      if (this.periodicRefresh !== null) {
        clearInterval(this.periodicRefresh)
        this.periodicRefresh = null
      }
    },
  }
}
</script>
