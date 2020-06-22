<template>
    <div class="clip-model-box" v-show="value">
        <div class="box">
            <canvas class="canvas"></canvas>
            <canvas class="clip"></canvas>
            
            <div class="drag"></div>
            
        </div>
        <!-- <button type="button" class="clipBtn">裁剪</button> -->
        <div class="clip-btn-box">
            <div class="cancel" @click="cancel">取消</div>
            <div class="confirm">确定</div>
        </div>
        
        <!-- <canvas class="result" width="200" height="200"></canvas> -->
    </div>
</template>
<script>
import {rem2px} from "./util";
export default {
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        $(s) {
            return document.querySelector(s);
        },
        getStyle(el, styleName) {
            let result = window.getComputedStyle(el, null)[styleName];
            let px = ["width", "height", "left", "right", "top", "bottom"];
            if (px.indexOf(styleName) > -1) {
                return Number(result.slice(0, -2));
            }
        },
        init(url, {ratio} = {ratio: 2.37}) {
            let $ = this.$;
            let getStyle = this.getStyle;

            let img = new Image();
            // let canvas = document.getElementsByClassName("canvas")[0];
            let canvas = $(".canvas");
            let clipCanvas = $(".clip");
            // let resultCanvas = $(".result");
            let drag = $(".drag");
            drag.style.left = 0;
            drag.style.top = 0;
            let box = $(".box");
            let confirm = $(".confirm");
            // let clipBtn = $(".clipBtn");
            // console.log(canvas);
            
            let ctx = canvas.getContext("2d");
            let clipCtx = clipCanvas.getContext("2d");
            // let resultCtx = resultCanvas.getContext("2d");
            
            let offsetX = 0;
            let offsetY = 0;
            let boxLeft = 0;
            let boxTop = 0;
            console.log("boxTop", boxTop);
            
            let originWidth;
            let originHeight;
            let imgW;
            let imgH;
            let startX;
            let startY;
            let scrollTop;
            const area = {
                top: 20 || getStyle(drag, "height") * 0.2,
                bottom: 20 || getStyle(drag, "height") * 0.2,
                left: 20 || getStyle(drag, "width") * 0.2,
                right: 20 || getStyle(drag, "width") * 0.2
            }
            let xt = "";
            let yt = "";
            
            // console.log("left", boxLeft);
            const changeFn = {
                left(el, distance) {
                    let oWidth = getStyle(el, "width");
                    let oLeft = getStyle(el, "left");
                    let oTop = getStyle(el, "top");
                    let oHeight = getStyle(el, "height");
                    // distance为负代表向左拖动，width要变大
                    let dWidth = oWidth - distance > originWidth ? originWidth : oWidth - distance;
                    let dHeight = Math.round(dWidth / ratio);
                    // distance为正代表向右拖动，left要变大
                    // distance为负代表向左拖动，left要变小
                    let dLeft = oLeft + distance;
                    if (dLeft <= 0) return;
                    if (oTop + dHeight >= originHeight) {
                        // return el.style.top = originHeight - oHeight + "px";
                        return;
                    }
                    
                    el.style.height = dHeight + "px";
                    el.style.width = dWidth + "px";
                    el.style.left = dLeft + "px";
                    
                },
                right(el, distance) {
                    let oLeft = getStyle(el, "left");
                    let oWidth = getStyle(el, "width");
                    let oTop = getStyle(el, "top");
                    let oHeight = getStyle(el, "height");
                    //规定右边界
                    // console.log(oLeft + oWidth);
                    let dWidth = oWidth + distance > originWidth ? originWidth : oWidth + distance;
                    let dHeight = Math.round(dWidth / ratio);
                    if (oLeft + dWidth >= originWidth && distance > 0) {
                        return el.style.width = originWidth - oLeft + "px";
                    }
                    if (oTop + dHeight >= originHeight && distance > 0) {
                        return el.style.top = originHeight - oHeight + "px";
                    }
                    // if (oLeft + oWidth >= originWidth && distance > 0) return;
                    
                    el.style.width = dWidth + "px";
                    el.style.height = dHeight + "px";
                },
                top(el, distance) {
                    // console.log("distance", distance);
                    
                    let oHeight = getStyle(el, "height");
                    let dHeight = oHeight - distance > originHeight ? originHeight : oHeight - distance;
                    let oLeft = getStyle(el, "left");
                    let oWidth = getStyle(el, "width");
                    //distance > 0，代表向下拖动，top变大
                    let oTop = getStyle(el, "top");
                    // let dTop = distance >= 0 ? oTop + distance + "px" : oTop + distance + "px";
                    let dTop = oTop + distance;
                    let dWidth = Math.round(dHeight * ratio);
                    //规定上边界
                    if (oTop <= 0 && distance < 0) {
                        // el.style.height = dHeight + "px";
                        // el.style.top = 0;
                        return;
                    }
                    //判定右边是否抵达右边界
                    if (oLeft + dWidth >= originWidth) {
                        // return el.style.width = originWidth - oLeft + "px";
                        return;
                    }
                    
                    el.style.width = dWidth + "px";
                    el.style.height = dHeight + "px";
                    el.style.top = dTop + "px";
                },
                bottom(el, distance) {
                    let oTop = getStyle(el, "top");
                    let oHeight = getStyle(el, "height");
                    let oLeft = getStyle(el, "left");
                    let oWidth = getStyle(el, "width");

                    //判定底边是否抵达下边界
                    let dHeight = oHeight + distance > originHeight ? originHeight : oHeight + distance;
                    let dWidth = Math.round(dHeight * ratio);
                    //判断底边是否到达底边界
                    if (oTop + dHeight >= originHeight && distance > 0) {
                        // el.style.height = originHeight - oTop + "px";
                        return 
                    }
                    // el.style.top = originHeight - oHeight + "px";
                    //判定右边是否抵达右边界
                    if (oLeft + dWidth >= originWidth && distance > 0) {
                        // el.style.width = originWidth - oLeft + "px";
                        return;
                    }
                    el.style.height = dHeight + "px";
                    el.style.width = dWidth + "px";
                }

            }
            // const change = (el, direction) => {
                
            // }
            drag.ontouchstart = ({touches}) => {
                boxLeft = box.getBoundingClientRect().left;
                boxTop = box.getBoundingClientRect().top;

                startX = touches[0].pageX;
                startY = touches[0].pageY;
                // console.log("ontouchstart-startX", startX);
                
                // console.log(e);
                let top = drag.getBoundingClientRect().top;
                scrollTop = document.documentElement.scrollTop;

                let left = drag.getBoundingClientRect().left;
                // console.log("scrollTop", scrollTop);
                
                //手指相对于drag原点的偏移量
                offsetX = startX - left;
                offsetY = startY - top - scrollTop;
                // console.log("offsetY", offsetY);
                
                //判定手指处于拖拽框的哪个区域
                let absX;
                let absY;
                //判断手指离左右两边近还是上下两边近
                if (offsetX < area.left) {
                    absX = area.left - offsetX;
                    xt = "left";
                } else if (offsetX > getStyle(drag, "width") - area.right) { 
                    absX = offsetX - (getStyle(drag, "width") - area.right);
                    xt = "right";
                }
                //上下两边
                if (offsetY < area.top) {
                    absY = area.top - offsetY;
                    yt = "top";
                } else if (offsetY > getStyle(drag, "height") - area.bottom) {
                    absY = offsetY - (getStyle(drag, "height") - area.bottom);
                    yt = "bottom"
                }
                // console.log("absX", absX);
                // console.log("absY", absY);
                
                if (!absY || (absX + 10) <= absY) {
                    //左右两边
                    yt = "";
                } else if (!absX || (absX + 10) > absY) {
                    xt = "";
                }
                // console.log(xt + yt);
                console.log(xt +"---"+ yt);
                
                // console.log(offsetX);
                // console.log(offsetY);
                
                // console.log("startX", startX);
                
            }
            drag.ontouchmove = (e) => {
                let {target, touches} = e;
                e.preventDefault();
            // drag.ontouchmove = (e) => {
                // preventDefault();
                // console.log("preventDefault", preventDefault);
                let eventX = touches[0].pageX;
                let eventY = touches[0].pageY;

                // if (eventX - boxLeft > originWidth || eventY - boxTop > originHeight) return;
                
                // 拖拽框当前的原点坐标
                
                let distanceX = eventX - startX;
                let distanceY = eventY - startY;
                startX = touches[0].pageX;
                startY = touches[0].pageY;
                // console.log(distanceX);
                if (xt) changeFn[xt](drag, distanceX);
                if (yt) changeFn[yt](drag, distanceY);

                if (!xt && !yt) {
                    //当手指移出整个图片的时候，不再触发事件
                    // if (eventX - boxLeft > originWidth || eventY - boxTop > originHeight) return;
                    // let oTop = getStyle(drag, "top");
                    // let oLeft = getStyle(drag, "left");
                    // let oHeight = getStyle(drag, "height");
                    // let oWidth = getStyle(drag, "width");

                    let currentX = eventX - boxLeft - offsetX;
                    target.style.left = currentX + "px";
                    let currentY = eventY - boxTop - offsetY - scrollTop;
                    target.style.top = currentY + "px";
                }
                
                // console.log(e);
                // e.stopPropagation();
                // e.preventDefault();
                //canvas绘制透明区域
                //拖拽框的原点坐标
                // boxLeft = box.getBoundingClientRect().left;
                // boxTop = box.getBoundingClientRect().top;
                let _x = drag.getBoundingClientRect().left - boxLeft;
                let _y = drag.getBoundingClientRect().top - boxTop;

                clipCtx.clearRect(0, 0, originWidth, originHeight);
                clipCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
                clipCtx.fillRect(0, 0, originWidth, originHeight);
                //清除区域的宽高
                let clearWidth = getStyle(drag, "width");
                let clearHeight = getStyle(drag, "height");
                // console.log("clearHeight", clearHeight);
                
                clipCtx.clearRect(_x, _y, clearWidth, clearHeight);
            }
            drag.ontouchend = ({target}) => {
                
                let oTop = getStyle(drag, "top");
                let oLeft = getStyle(drag, "left");
                let oHeight = getStyle(drag, "height");
                let oWidth = getStyle(drag, "width");
                let needResetClearArea = false;
                if (oLeft < 0) {
                    needResetClearArea = true;
                    target.style.left = 0;
                } else if (oLeft + oWidth > originWidth) {
                    needResetClearArea = true;
                    target.style.left = originWidth - oWidth + "px";
                }
                if (oTop < 0) {
                    needResetClearArea = true;
                    target.style.top = 0;
                } else if (oTop + oHeight > originHeight) {
                    needResetClearArea = true;
                    target.style.top = originHeight - oHeight + "px";
                }
                if (needResetClearArea && !xt && !yt) {
                    //清除区域的宽高
                    let clearWidth = getStyle(drag, "width");
                    let clearHeight = getStyle(drag, "height");
                    console.log("clearHeight", clearHeight);
                    
                    let _x = drag.getBoundingClientRect().left - boxLeft;
                    let _y = drag.getBoundingClientRect().top - boxTop;
                    clipCtx.clearRect(_x, _y, clearWidth, clearHeight);
                }
                //清理操作
                xt = "";
                yt = "";
            }

            img.onload = () => {
                //初始化操作
                // console.log("img-h", img.height);
                // console.log("img-w", img.width);
                imgW = img.width;
                imgH = img.height;
                
                //预设宽高
                let clientWidth = window.innerWidth;
                let width = Math.round(clientWidth * 0.92);//6.9rem
                let height = Math.round(clientWidth * 0.92);//6.9rem

                let rw;
                let rh;
                if (img.width >= (img.height - 5)) {
                    rw = width;
                    rh = Math.round(width / (img.width / img.height));
                } else {
                    rw = Math.round(height * (img.width / img.height));
                    rh = height;
                }

                //初始化样式
                canvas.width = rw;
                canvas.height = rh;
                clipCanvas.width = rw;
                clipCanvas.height = rh;
                let dragW = 150;
                let dragH = Math.round(dragW / ratio);
                drag.style.width = dragW + "px";
                drag.style.height = dragH + "px";

                clipCanvas.style.display = "block";
                drag.style.display = "block";

                originWidth = rw;
                originHeight = rh;
                ctx.drawImage(img, 0, 0, rw, rh);
                clipCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
                clipCtx.fillRect(0, 0, rw, rh);
                clipCtx.clearRect(0, 0, dragW, dragH);
            }
            // img.src = "./timg.jpeg";
            img.src = url;
            confirm.onclick = () => {
                let resultCanvas = document.createElement("canvas");
                let resultCtx = resultCanvas.getContext("2d");
                let _x = drag.getBoundingClientRect().left - boxLeft;
                let _y = drag.getBoundingClientRect().top - boxTop - scrollTop;
                let clipBoxWidth = getStyle(drag, "width");
                let clipBoxHeight = getStyle(drag, "height");
                let ox = _x / originWidth * imgW;
                let oy = _y / originHeight * imgH;
                let ow = clipBoxWidth / originWidth * imgW;
                let oh = clipBoxHeight / originHeight * imgH;
                resultCanvas.width = clipBoxWidth;
                resultCanvas.height = clipBoxHeight;
                resultCtx.drawImage(img, ox, oy, ow, oh, 0, 0, clipBoxWidth, clipBoxHeight);
                // resultCtx.drawImage(img, _x, _y, clipBoxWidth, clipBoxHeight, 0, 0, clipBoxWidth, clipBoxHeight);
                resultCanvas.toBlob(blob => {
                    this.$emit("clipComplete", blob);
                    this.cancel();
                });
            }
            // clipBtn.onclick = () => {
            //     clipCanvas.style.display = "block";
            //     drag.style.display = "block";
            // }
        },
        cancel() {
            this.$emit("input", false);
            // let $ = this.$;
            // let drag = $(".drag");
            
        }
    }
}
</script>
<style lang="scss" scoped>
.clip-model-box {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    z-index: 1;
    background: rgba(#000, 0.9);
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;

    .clip-btn-box {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
        margin-top: 20px;

        &>div {
            font-size: 16px;
            height: 32px;
            line-height: normal;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 15px;
            color: #f1f1f1;
            border: 1px solid #f1f1f1;
            border-radius: 4px;
            margin-right: 10px;
        }
    }
}
.box {
    position: relative;
    /* margin-left: 30px;
    margin-top: 50px; */
}

.drag {
    box-sizing: border-box;
    // width: 150px;
    // height: 100px;
    position: absolute;
    left: 0;
    top: 0;
    /* left: 30px;
    top: 10px; */
    /* background: red; */
    border: 1px dashed red;
    display: none;
}
.clip {
    position: absolute;
    left: 0;
    top: 0;
    display: none;
}
</style>


