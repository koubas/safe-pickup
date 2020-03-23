<template>
  <div :class="`container ${vertical ? 'portrait' : 'landscape'}`">
    <v-slider id="myslider" class="large-slider" v-model="slider" :min="min" :max="max" thumb-label="always" thumb-size=62 :vertical="vertical">
      <template v-slot:thumb-label>
        {{ formatedTime }}
      </template>
    </v-slider>
  </div>
</template>

<script>

export default {
  name: "TimeAxis",
  components: {},

  props: {
    place: Object
  },

  data() {
    return {
      slider: 0,
      vertical: true,
      visitElms: [],
    };
  },

  computed: {
    min() {
      return (new Date(this.place.opens)).getTime()
    },
    max() {
      return (new Date(this.place.closes)).getTime()
    },
    formatedTime() {
      const date = new Date(this.slider)
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    }
  },

  methods: {
    orientationChange() {
      this.vertical = window.screen.orientation.type.match(/portrait/) !== null
    },
    drawVisits() {
      const sliderElm = document.getElementById("myslider")
      this.visitElms.forEach(elm => {
        elm.remove()
      })
      this.visitElms = []
      this.place.visits.forEach(visit => {
        const at = (new Date(visit.at)).getTime()
        const percent = (at - this.min) / (this.max - this.min) * 100
        let newElm = document.createElement('div')
        newElm.style.position = 'absolute'
        if (this.vertical) {
          newElm.style.top = `${ percent }%`
          newElm.style.left = '50%'
          newElm.style.marginLeft = '-5px'
        } else {
          newElm.style.left = `${ percent }%`
          newElm.style.top = '50%'
        newElm.style.marginTop = '-5px'
        }
        newElm.style.borderRadius = '50%'
        newElm.style.width = '10px'
        newElm.style.height = '10px'
        newElm.style.backgroundColor = 'maroon'
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
    this.slider = (new Date(this.place.myVisit.at)).getTime()
    this.drawVisits()
  },

  watch: {
    vertical() {
      this.drawVisits()
    }
  }
};
</script>

<style>
  html, body {
    /*touch-action: none;*/
    
  }
  * {
    overscroll-behavior: none
  }
</style>

<style scoped>
  .container.portrait  {
    margin: 0 0 0 0;
    width: 10em;
  }

  .portrait /deep/.v-slider {
    height: calc(92vh - 10em);
  }

  .landscape {
    padding: calc(5em + 20vh) 5em 0 5em;
  }
</style>
