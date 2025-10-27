"use strict";
const utils_hsl2hex=require("../utils/hsl2hex.js");
const common_vendor=require("../common/vendor.js");
const echarts=require("../uni_modules/lime-echart/static/echarts.min");
const LEchart=()=>"../uni_modules/lime-echart/components/l-echart/l-echart.js";
const _sfc_main={
props:{
binPosition:Array,
count:Array,
xCdf:Array,
yCdf:Array,
userThreshold:Number
},
components:{
LEchart
},
computed:{
currentColor(){
return`hsl(${this.userThreshold}, 100%, 50%)`;
},
greenInclusive(){
const index=this.xCdf.findIndex((value)=>value>this.userThreshold);
const greenInclusive=index!==-1?this.yCdf[index]:1;
return greenInclusive;
}
},
async mounted(){
setTimeout(async()=>{
console.log(0);
console.log(this.$refs.chartRef);
if(!this.$refs.chartRef)
return;
console.log(1);
await this.createPlot();
},300);
},
methods:{
handleResize(){
this.createPlot();
},
async createPlot(){
const myChart=await this.$refs.chartRef.init(echarts);
let range_l=155;
let range_r=205;
const bgColorStop=()=>{
let res=[];
for(let i=range_l;i<=range_r;i++){
const hue=i;
res.push({
offset:(i-range_l)/(range_r-range_l),
color:utils_hsl2hex.hslToHex(hue,100,50)
});
}
return res;
};
const option={
grid:{
left:0,
top:0,
right:0,
bottom:0
},
xAxis:{
show:false,
type:"value",
name:"Value",
min:range_l,
max:range_r,
splitLine:{
show:false
}
},
yAxis:{
show:false,
type:"value",
name:"CDF",
min:0,
max:1,
axisLabel:{
formatter:"{value}%"
},
splitLine:{
show:false
}
},
series:[
{
name:"CDF",
type:"line",
data:this.xCdf.map((x,i)=>[x,this.yCdf[i]]),
smooth:true,
symbol:"none",
lineStyle:{
color:"black",
width:2
}
},
{
name:"User Threshold",
type:"line",
data:[
[this.userThreshold,0],
[this.userThreshold,1]],

lineStyle:{
color:"red",
type:"dashed",
width:2
}
}],

backgroundColor:{
type:"linear",
x:0,
y:0,
x2:1,
y2:0,
colorStops:bgColorStop(),
global:false
// 缺省为 false
}
};
console.log(option.backgroundColor);
myChart.setOption(option);
}
},
beforeUnmount(){
window.removeEventListener("resize",this.handleResize);
}
};
if(!Array){
const _component_l_echart=common_vendor.resolveComponent("l-echart");
_component_l_echart();
}
function _sfc_render(_ctx,_cache,$props,$setup,$data,$options){
return common_vendor.e({
a:common_vendor.sr("chartRef","6ac4d277-0"),
b:common_vendor.t(Math.round($props.userThreshold)),
c:$options.greenInclusive>0.55
},$options.greenInclusive>0.55?{
d:common_vendor.t(Math.round($options.greenInclusive*100))
}:$options.greenInclusive<0.45?{
f:common_vendor.t(Math.round((1-$options.greenInclusive)*100))
}:{},{
e:$options.greenInclusive<0.45
});
}
const Component=/* @__PURE__ */common_vendor._export_sfc(_sfc_main,[["render",_sfc_render],["__scopeId","data-v-6ac4d277"]]);
wx.createComponent(Component);