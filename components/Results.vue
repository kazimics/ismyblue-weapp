<template>
  <div class="results-container">
    <div class="svg-container">
      <l-echart ref="chartRef" class="w-full h-96 rect-svg"></l-echart>
      <!-- <svg ref="svg" class="w-full h-96 rect-svg"></svg> -->
      <div class="absolute top-0 left-0 p-1">
        <div class="blue-green-test-result-color">
          <p class="result-text bg-white bg-opacity-70 p-1 rounded"><i>你的</i> 绿色</p>
        </div>
      </div>
      <div class="absolute top-0 right-0 p-1">
        <div class="blue-green-test-result-color">
          <p class="result-text bg-white bg-opacity-70 p-1 rounded"><i>你的</i> 蓝色</p>
        </div>
      </div>
    </div>
    <div class="blue-green-test-result-text w-full mt-0 bg-white">
      <p class="result-text">
        你的边界色调为 {{ Math.round(userThreshold) }},
        <span v-if="greenInclusive > 0.55">
          比 {{ Math.round(greenInclusive * 100) }}% 的人更蓝。 对你来说,
          绿松石
          <span class="color-chip mr-1"></span>
          是绿色。
        </span>
        <span v-else-if="greenInclusive < 0.45">
          比 {{ Math.round((1 - greenInclusive) * 100) }}% 的人更绿。 对你来说
          绿松石
          <span class="color-chip mr-1"></span>
          是蓝色。
        </span>
        <span v-else> 就像人口中位数一样。你是真正的中立者. </span>
      </p>
    </div>
  </div>
</template>

<script>
  // #ifdef MP
  const echarts = require('../uni_modules/lime-echart/static/echarts.min')
  // #endif

  // #ifndef MP
  import * as echarts from '../uni_modules/lime-echart/static/echarts.min'
  // #endif

  import LEchart from '../uni_modules/lime-echart/components/l-echart/l-echart.vue'
  import {
    hslToHex
  } from '@/utils/hsl2hex'

  export default {
    props: {
      binPosition: Array,
      count: Array,
      xCdf: Array,
      yCdf: Array,
      userThreshold: Number
    },
    components: {
      LEchart
    },
    computed: {
      currentColor() {
        return `hsl(${this.userThreshold}, 100%, 50%)`
      },
      greenInclusive() {
        const index = this.xCdf.findIndex((value) => value > this.userThreshold)
        const greenInclusive = index !== -1 ? this.yCdf[index] : 1
        return greenInclusive
      }
    },
    async mounted() {
      setTimeout(async () => {
        console.log(0)
        console.log(this.$refs.chartRef)
        if (!this.$refs.chartRef) return
        console.log(1)
        await this.createPlot()
      }, 300)
    },
    methods: {
      handleResize() {
        this.createPlot()
      },
      async createPlot() {

        // 用户阈值
        const userThreshold = 180;

        // 初始化 ECharts 实例
        const myChart = await this.$refs.chartRef.init(echarts);

        let range_l = 155
        let range_r = 205

        // 背景渐变色
        
        const bgColorStop = () => {
          let res = []
          for (let i = range_l; i <= range_r; i++) {
            const hue = i
            res.push({
              offset: (i - range_l) / (range_r - range_l),
              color: hslToHex(hue, 100, 50)
            })
          }
          return res
        }
        

        // 配置图表选项
        const option = {
          grid: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
          },
          xAxis: {
            show: false,
            type: 'value',
            name: 'Value',
            min: range_l,
            max: range_r,
            splitLine: {
              show: false
            }
          },
          yAxis: {
            show: false,
            type: 'value',
            name: 'CDF',
            min: 0,
            max: 1,
            axisLabel: {
              formatter: '{value}%'
            },
            splitLine: {
              show: false
            }
          },
          series: [{
              name: 'CDF',
              type: 'line',
              data: this.xCdf.map((x, i) => [x, this.yCdf[i]]),
              smooth: true,
              symbol: 'none',
              lineStyle: {
                color: 'black',
                width: 2
              },
            },
            {
              name: 'User Threshold',
              type: 'line',
              data: [
                [this.userThreshold, 0],
                [this.userThreshold, 1]
              ],
              lineStyle: {
                color: 'red',
                type: 'dashed',
                width: 2
              },
            }
          ],
          backgroundColor: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: bgColorStop(),
            global: false // 缺省为 false
          }
        };
        console.log(option.backgroundColor)
        // 使用刚指定的配置项和数据显示图表
        myChart.setOption(option);
        /**
        const svg = d3.select(this.$refs.svg)
        // Clear the svg on resize.
        svg.selectAll('*').remove()
        // #ifdef H5
        let width = this.$refs.svg.clientWidth
        let height = this.$refs.svg.clientHeight
        // #endif
        // #ifdef MP
        let width = 0;
        let height = 0;

        var query = this.createSelectorQuery();
        query.select('.rect-svg').boundingClientRect(
          function(rect) {
            if (rect.width) {
              width = rect.width;
              height = rect.height;
            }
          }
        ).exec();
        // #endif
        const margin = {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        let range_l = 155
        let range_r = 205
        const x = d3.scaleLinear().domain([range_l, range_r]).range([0, innerWidth])
        const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0])

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

        // Create gradient background
        const defs = svg.append('defs')
        const gradient = defs
          .append('linearGradient')
          .attr('id', 'hue-gradient')
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '0%')

        for (let i = range_l; i <= range_r; i++) {
          const hue = i
          gradient
            .append('stop')
            .attr('offset', `${((i - range_l) / (range_r - range_l)) * 100}%`)
            .attr('stop-color', `hsl(${hue}, 100%, 50%)`)
        }

        g.append('rect')
          .attr('width', innerWidth)
          .attr('height', innerHeight)
          .attr('fill', 'url(#hue-gradient)')

        // Create line generator
        const line = d3
          .line()
          .x((d) => x(d[0]))
          .y((d) => y(d[1]))

        // Create path for CDF line
        const path = g
          .append('path')
          .datum(d3.zip(this.xCdf, this.yCdf))
          .attr('fill', 'none')
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('d', line)

        // Calculate the start and end points for clipping
        const startX = x(range_l)
        const endX = x(range_r)

        // Create a clip path
        const clipPath = defs.append('clipPath').attr('id', 'gradient-clip')

        clipPath
          .append('rect')
          .attr('x', startX)
          .attr('y', 0)
          .attr('width', endX - startX)
          .attr('height', innerHeight)

        // Add vertical line for user threshold
        const userThresholdX = x(this.userThreshold)
        const thresh = g
          .append('line')
          .attr('x1', userThresholdX)
          .attr('x2', userThresholdX)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', 'black')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '5,5')

        // Apply the clip path to the CDF line
        path.attr('clip-path', 'url(#gradient-clip)')

        // Animate the line
        const length = path.node().getTotalLength()
        path
          .attr('stroke-dasharray', length + ' ' + length)
          .attr('stroke-dashoffset', length)
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0)

        // Animate the threshold line

        thresh
          .attr('y2', 0)
          .transition()
          .delay(2000) // Start after the path animation
          .duration(1000)
          .ease(d3.easeLinear)
          .attr('y2', innerHeight)

        // Add axes
        g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5))

        g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')))

        // Add labels
        svg
          .append('text')
          .attr('x', width / 2)
          .attr('y', height - 5)
          .attr('text-anchor', 'middle')

        svg
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('x', -height / 2)
          .attr('y', 15)
          .attr('text-anchor', 'middle')

        // Add the label
        const label = svg
          .append('text')
          .attr('x', width - margin.right - 10)
          .attr('y', height - margin.bottom - 10)
          .attr('text-anchor', 'end')
          .attr('font-size', '12px')
          .attr('fill', 'black')
          .text('threshold distribution')

        const bbox = label.node().getBBox()
        // Add a small line
        svg
          .append('line')
          .attr('x1', bbox.x - 30)
          .attr('y1', bbox.y + 8)
          .attr('x2', bbox.x - 10)
          .attr('y2', bbox.y + 8)
          .attr('stroke', 'black')
          .attr('stroke-width', 3)

        window.addEventListener('resize', this.handleResize)
        */
      }
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize)
    }
  }
</script>

<style src="./BlueGreenTest.css" scoped />
<style scoped>
  .results-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  .svg-container {
    flex-grow: 1;
    position: relative;
    width: 100%;
  }

  .rect-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .color-chip {
    display: inline-block;
    width: 1em;
    height: 1em;
    background-color: turquoise;
    border: 2px solid black;
    border-radius: 0.2em;
    margin-bottom: -0.2em;
  }
</style>