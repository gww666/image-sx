<template>
	<div id="app">
		<image-x @fileChange="fileChange" mode="preview" :imgUrls="imgs"></image-x>
		<image-x @fileChange="fileChange" mode="preview" :imgUrls="imgs"></image-x>
		<image-x-mobile @fileChange="fileChange1" mode="clip" :clipOptions="{ratio: 2.37}" ref="com">
			<div>
				<div @click="itemClick">
					这是自定义的按钮1
				</div>
				<img :src="clipUrl" />
			</div>
		</image-x-mobile>
		<image-x-mobile @fileChange="fileChange2" mode="data">
			<div @click="itemClick">
				这是自定义的按钮2
			</div>
		</image-x-mobile>
	</div>
</template>

<script>
import ImageX from "./lib/index.vue";
import ImageXMobile from "./lib/mobile.vue";
export default {
	name: "app",
	data() {
		return {
			imgs: [],
			clipUrl: ""
		}
	},
	methods: {
		fileChange(arr) {
			console.log("arr", arr);
		},
		fileChange1({url, file}) {
			this.clipUrl = url;
		},
		fileChange2(arr) {
			console.log("2", arr);
		},
		itemClick() {
			this.$refs.com.comClick();
			// this.$emit("comClick");
		},
	},
	components: {
		ImageX,
		ImageXMobile
	},
	mounted() {
		
		// setTimeout(() => {
		// 	this.imgs = ["http://120.78.221.14:2233/public/upload/75909acdca7d6c9a9fd453c9f80a8472.jpeg", "http://120.78.221.14:2233/public/upload/75909acdca7d6c9a9fd453c9f80a8472.jpeg"];
		// }, 1000);
	}
	
};
</script>

<style>
* {
	padding: 0;
	margin: 0;
}
</style>
