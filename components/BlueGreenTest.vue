<template>
  <div class="blue-green-test-wrapper">
    <div :style="containerStyle" class="blue-green-test-container">
      <div v-if="rounds < MAX_ROUNDS" class="blue-green-test-content">
        <transition name="fade-up" mode="out-in">
          <h1 v-if="showInitialMessage" key="initial" class="blue-green-test-title">
            <span>测试您的颜色分类能力</span>
          </h1>
          <h1 v-else key="main" class="blue-green-test-title">
            <span>我眼中的蓝色是你眼中的蓝色吗？</span>
          </h1>
        </transition>
      </div>
      <div v-else class="blue-green-test-content blue-green-test-result-screen">
        <Results style="height:100%;" :binPosition="binPosition" :count="count" :xCdf="xCdf" :yCdf="yCdf"
          :userThreshold="finalHue" />
      </div>
      <div v-if="rounds < MAX_ROUNDS" class="blue-green-test-button-container three-buttons">
        <button @click="selectColor('blue')" class="blue-green-test-button blue-button grow-button">
          蓝色
        </button>
        <button @click="reset" class="blue-green-test-button mid-reset-button grow-button">
          重新开始
        </button>
        <button @click="selectColor('green')" class="blue-green-test-button green-button grow-button">
          绿色
        </button>
      </div>
      <div v-else class="blue-green-test-button-container two-buttons">
        <!-- <button @click="submitResults" class="blue-green-test-button submit-button grow-button" :disabled="submitted">
          {{ submitted ? '已提交' : '上传结果' }}
        </button> -->

        <button @click="reset" class="blue-green-test-button final-reset-button grow-button">
          重新开始
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    MAX_ROUNDS,
    VERSION,
    BIN_POSITION,
    BIN_COUNT,
    X_CDF,
    Y_CDF
  } from '@/config'
  import Results from './Results.vue'
  import {
    fitSigmoid
  } from '@/utils/glmUtils'

  import maskImage from '@/assets/mask.png'

  export default {
    components: {
      Results
    },
    data() {
      return {
        MAX_ROUNDS: MAX_ROUNDS,
        currentHue: Math.random() > 0.5 ? 150 : 210,
        showInitialMessage: true,
        polarity: 0,
        rounds: 0,
        finalHue: 0,
        responses: [],
        userAgent: '',
        screenWidth: 0,
        screenHeight: 0,
        colorDepth: 0,
        pixelRatio: 1,
        timestamp: '',
        submitted: false,
        showMask: false,
        maskImageUrl: maskImage,
        binPosition: BIN_POSITION,
        count: BIN_COUNT,
        xCdf: X_CDF,
        yCdf: Y_CDF,
        showAbout: false,
        showDemo: false,
        anonymousId: this.generateAnonymousId()
      }
    },
    computed: {
      currentColor() {
        return `hsl(${this.currentHue}, 100%, 50%)`
      },
      bluerColor() {
        return `hsl(${this.finalHue + 5}, 100%, 50%)`
      },
      greenerColor() {
        return `hsl(${this.finalHue - 5}, 100%, 50%)`
      },
      containerStyle() {
        if (this.rounds === MAX_ROUNDS) {
          return {
            backgroundColor: 'white'
          }
        } else if (this.showMask) {
          return {
            backgroundColor: this.showMask ? 'transparent' : this.currentColor,
            backgroundImage: this.showMask ? `url(${this.maskImageUrl})` : 'none',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto'
          }
        } else {
          return {
            backgroundColor: this.currentColor
          }
        }
      }
    },
    methods: {
      selectColor(color) {
        this.responses.push({
          hue: this.currentHue,
          response: color
        })

        // Get the new probe value
        const {
          b,
          newProbe,
          polarity
        } = fitSigmoid(
          this.responses.map((r) => r.hue),
          this.responses.map((r) => r.response === 'blue'),
          this.polarity,
          0.4
        )
        this.polarity = polarity == 1 ? -1 : 1
        this.currentHue = newProbe
        this.rounds++
        if (this.rounds === MAX_ROUNDS) {
          this.finalHue = 180 - b
          this.currentHue = this.finalHue
        }
        this.showMask = true
        setTimeout(() => {
          this.showMask = false
        }, 200)
      },
      reset() {
        this.anonymousId = this.generateAnonymousId()
        this.currentHue = Math.random() > 0.5 ? 150 : 210
        this.rounds = 0
        this.finalHue = 0
        this.showInitialMessage = true
        this.submitted = false
        this.responses = []
        this.showMask = false
        setTimeout(() => {
          this.showInitialMessage = false
        }, 2000)
      },
      generateAnonymousId() {
        return (
          Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        )
      },
      async submitDemographics() {
        try {
          const {
            data,
            error
          } = await supabase.from('color_test_demo').insert([{
            anonymous_id: this.anonymousId,
            first_language: this.firstLanguage,
            color_blindness: this.colorBlindness
          }])
          this.showDemo = false
        } catch (error) {
          console.error('Error submitting demographics:', error)
          alert('Failed to submit demographics. Please try again.')
        }
      },
      async submitResults() {
        this.gatherDeviceInfo()
        const now = new Date()
        this.timestamp = now.toISOString()
        this.localTimestamp = now.toLocaleString()

        try {
          const payload = {
            anonymous_id: this.anonymousId,
            user_agent: this.userAgent,
            screen_width: this.screenWidth,
            screen_height: this.screenHeight,
            color_depth: this.colorDepth,
            pixel_ratio: this.pixelRatio,
            timestamp: this.timestamp,
            local_timestamp: this.localTimestamp,
            responses: this.responses,
            final_hue: this.finalHue,
            version: VERSION
          }
          const {
            data,
            error
          } = await supabase.from('color_test_results').insert([payload])
          console.log(payload)

          if (error) throw error

          this.submitted = true
          this.showDemo = true
        } catch (error) {
          console.error('Error submitting results:', error)
          alert('Failed to submit results. Please try again.')
        }
      },
      gatherDeviceInfo() {
        this.userAgent = navigator.userAgent
        this.screenWidth = window.screen.width
        this.screenHeight = window.screen.height
        this.colorDepth = window.screen.colorDepth
        this.pixelRatio = window.devicePixelRatio || 1
      }
    },
    mounted() {
      setTimeout(() => {
        this.showInitialMessage = false
      }, 2000)
    }
  }
</script>

<style src="./BlueGreenTest.css" scoped />
<style scoped>
  .color-chip-turquoise {
    display: inline-block;
    width: 1em;
    height: 1em;
    background-color: turquoise;
    border: 2rpx solid black;
    border-radius: 0.2em;
    margin-bottom: -0.2em;
  }

  .color-chip-cyan {
    display: inline-block;
    width: 1em;
    height: 1em;
    background-color: cyan;
    border: 2rpx solid black;
    border-radius: 0.2em;
    margin-bottom: -0.2em;
  }

  .about-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .about-content {
    background-color: white;
    color: black;
    padding: 2rem;
    border-radius: 8rpx;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
    position: relative;
    font-family: 'Cabin', sans-serif;
    font-size: 0.9rem;
  }

  .close-button {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
  }

  .about-content h2 {
    margin-top: 0;
    font-size: 1.2rem;
  }

  .about-content h3 {
    font-size: 1.2rem;
    margin-top: 1rem;
  }

  .about-content p {
    margin-bottom: 1rem;
  }

  .form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1rpx solid #ccc;
    border-radius: 4rpx;
    font-family: 'Cabin', sans-serif;
    font-size: 1rem;
    color: #333;
    background-color: #fff;
    appearance: none;
    /* Removes default styling in some browsers */
    -webkit-appearance: none;
    /* For older versions of Safari */
    -moz-appearance: none;
  }

  select.form-control {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23333' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 12rpx;
    padding-right: 2rem;
  }

  .form-control:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2rpx rgba(74, 144, 226, 0.2);
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
  }

  /* Style specifically for the language dropdown */
  #firstLanguage {
    border: 2rpx solid #4a90e2;
    transition: border-color 0.3s ease;
  }

  #firstLanguage:hover {
    border-color: #2a70c2;
  }

  /* Ensure text inputs match select styling */
  input[type='text'].form-control {
    border: 2rpx solid #4a90e2;
  }

  /* Style for the submit button */
  .submit-button-demo {
    background-color: #4a90e2;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4rpx;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
  }

  .submit-button-demo:hover {
    background-color: #2a70c2;
  }
</style>