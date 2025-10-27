<template>
  <div id="color-app">
	<BlueGreenTest />
  </div>
</template>

<script>
	import BlueGreenTest from '../../components/BlueGreenTest.vue'
	export default {
		components: {
			BlueGreenTest
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style>
  #color-app{
    position: absolute;
    top: 0;
    left: 0;
  }
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
