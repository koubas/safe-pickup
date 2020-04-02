<template>
  <div :class="`container ${vertical ? 'portrait' : 'landscape'}`">
    <v-slider
      id="myslider"
      class="large-slider"
      v-model="slider"
      @end="emitEnd"
      @click="emitEnd"
      :min="min"
      :max="max"
      thumb-label="always"
      thumb-size="62"
      :thumb-color="sliderThumbColor"
      :vertical="vertical"
      step="300000"
    >
      <template v-slot:thumb-label>
        {{ formatedTime }}
      </template>
    </v-slider>
  </div>
</template>

<script>
import moment from "moment-timezone"
export default {
  name: "TimeAxis",
  components: {},

  props: {
    place: Object
  },
  data() {
    return {
      slider: 0,
      sliderLast: 0,
      sliderThumbColor: "green",
      vertical: true,
      visitElms: [],
      timestamps: [],
    }
  },

  computed: {
    min() {
      return new Date(this.place.opens).getTime()
    },
    max() {
      return new Date(this.place.closes).getTime()
    },
    formatedTime() {
      const date = new Date(this.slider)
      return `${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    }
  },

  methods: {
    emitEnd() {
      if (this.slider !== this.sliderLast) {
        this.$emit("end", {
          moment: new moment(this.slider)
        })
        this.sliderLast = this.slider
      }
    },
    orientationChange() {
      this.vertical = window.screen.orientation.type.match(/portrait/) !== null
    },
    drawVisits() {
      const sliderElm = document.getElementById("myslider")
      this.visitElms.forEach(elm => {
        elm.remove()
      })
      this.visitElms = []

      // todo: rename method from draw... to update... or move elsewhere
      this.timestamps = this.place.visits
        .filter(visit => visit.at.length > 1)
        .map(visit => (new moment(visit.at).valueOf()))

      this.place.visits.forEach(visit => {
        if (visit.at.length <= 1) {
          // space means empty (dynamodb)
          return
        }

        const moreAtSameTime = this.place.visits.filter(_visit => _visit.at === visit.at).length - 1

        const at = new Date(visit.at).getTime()
        const percent =
          (this.vertical ? 100 : 0) -
          ((at - this.min) / (this.max - this.min)) *
            100 *
            (this.vertical ? 1 : -1)
        let newElm = document.createElement("div")
        newElm.style.position = "absolute"
        if (this.vertical) {
          newElm.style.top = `${percent}%`
          newElm.style.left = "50%"
          newElm.style.marginTop = "-5px"
          newElm.style.marginLeft = `${-5 - moreAtSameTime*3}px`
          newElm.style.width = `${10 + moreAtSameTime*6}px`
          newElm.style.height = "10px"
        } else {
          newElm.style.left = `${percent}%`
          newElm.style.top = "50%"
          newElm.style.marginTop = `${-5 - moreAtSameTime*3}px`
          newElm.style.marginLeft = "-5px"
          newElm.style.width = "10px"
          newElm.style.height = `${10 + moreAtSameTime*6}px`
        }
        newElm.style.borderRadius = "50%"
        newElm.style.backgroundColor = "maroon"
        sliderElm.parentNode.insertBefore(newElm, sliderElm.previousSibling)
        this.visitElms.push(newElm)
      })
    }
  },

  created() {
    this.orientationChange()
    window.addEventListener("orientationchange", this.orientationChange)
  },

  destroyed() {
    window.removeEventListener("orientationchange", this.orientationChange)
  },

  mounted() {
    this.slider = new Date(this.place.myVisit.at).getTime()
    this.drawVisits()
  },

  watch: {
    vertical() {
      this.drawVisits()
    },
    place() {
      this.drawVisits()
    },
    slider(val) {
      // same time as other
      if (this.timestamps.some(ts => ts === val)) {
        this.sliderThumbColor = "red"

      // direct vicinity of other
      } else if (this.timestamps.some(ts =>  val + 310000 > ts && val - 310000 < ts)) {
        this.sliderThumbColor = "orange"

      // away from others
      } else {
        this.sliderThumbColor = "green"
      }
    }
  }
}
</script>

<style>
html,
body {
  /*touch-action: none;*/
}
* {
  overscroll-behavior: none;
}
</style>

<style scoped>
.container.portrait {
  margin: 0 0 0 0;
  width: 10em;
}

.portrait /deep/.v-slider {
  height: calc(80vh - 10em);
}

.landscape {
  padding: 1em 5em 0 5em;
}
</style>
