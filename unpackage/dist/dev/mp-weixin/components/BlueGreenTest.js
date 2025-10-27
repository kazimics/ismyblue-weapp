"use strict";
const config=require("../config.js");
const utils_glmUtils=require("../utils/glmUtils.js");
const common_assets=require("../common/assets.js");
const common_vendor=require("../common/vendor.js");
const Results=()=>"./Results.js";
const _sfc_main={
components:{
Results
},
data(){
return{
MAX_ROUNDS:config.MAX_ROUNDS,
currentHue:Math.random()>0.5?150:210,
showInitialMessage:true,
polarity:0,
rounds:0,
finalHue:0,
responses:[],
userAgent:"",
screenWidth:0,
screenHeight:0,
colorDepth:0,
pixelRatio:1,
timestamp:"",
submitted:false,
showMask:false,
maskImageUrl:common_assets.maskImage,
binPosition:config.BIN_POSITION,
count:config.BIN_COUNT,
xCdf:config.X_CDF,
yCdf:config.Y_CDF,
showAbout:false,
showDemo:false,
anonymousId:this.generateAnonymousId()
};
},
computed:{
currentColor(){
return`hsl(${this.currentHue}, 100%, 50%)`;
},
bluerColor(){
return`hsl(${this.finalHue+5}, 100%, 50%)`;
},
greenerColor(){
return`hsl(${this.finalHue-5}, 100%, 50%)`;
},
containerStyle(){
if(this.rounds===config.MAX_ROUNDS){
return{
backgroundColor:"white"
};
}else if(this.showMask){
return{
backgroundColor:this.showMask?"transparent":this.currentColor,
backgroundImage:this.showMask?`url(${this.maskImageUrl})`:"none",
backgroundRepeat:"repeat",
backgroundSize:"auto"
};
}else{
return{
backgroundColor:this.currentColor
};
}
}
},
methods:{
selectColor(color){
this.responses.push({
hue:this.currentHue,
response:color
});
const{
b,
newProbe,
polarity
}=utils_glmUtils.fitSigmoid(
this.responses.map((r)=>r.hue),
this.responses.map((r)=>r.response==="blue"),
this.polarity,
0.4
);
this.polarity=polarity==1?-1:1;
this.currentHue=newProbe;
this.rounds++;
if(this.rounds===config.MAX_ROUNDS){
this.finalHue=180-b;
this.currentHue=this.finalHue;
}
this.showMask=true;
setTimeout(()=>{
this.showMask=false;
},200);
},
reset(){
this.anonymousId=this.generateAnonymousId();
this.currentHue=Math.random()>0.5?150:210;
this.rounds=0;
this.finalHue=0;
this.showInitialMessage=true;
this.submitted=false;
this.responses=[];
this.showMask=false;
setTimeout(()=>{
this.showInitialMessage=false;
},2e3);
},
generateAnonymousId(){
return Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15);
},
async submitDemographics(){
try{
const{
data,
error
}=await supabase.from("color_test_demo").insert([{
anonymous_id:this.anonymousId,
first_language:this.firstLanguage,
color_blindness:this.colorBlindness
}]);
this.showDemo=false;
}catch(error){
console.error("Error submitting demographics:",error);
alert("Failed to submit demographics. Please try again.");
}
},
async submitResults(){
this.gatherDeviceInfo();
const now=/* @__PURE__ */new Date();
this.timestamp=now.toISOString();
this.localTimestamp=now.toLocaleString();
try{
const payload={
anonymous_id:this.anonymousId,
user_agent:this.userAgent,
screen_width:this.screenWidth,
screen_height:this.screenHeight,
color_depth:this.colorDepth,
pixel_ratio:this.pixelRatio,
timestamp:this.timestamp,
local_timestamp:this.localTimestamp,
responses:this.responses,
final_hue:this.finalHue,
version:config.VERSION
};
const{
data,
error
}=await supabase.from("color_test_results").insert([payload]);
console.log(payload);
if(error)
throw error;
this.submitted=true;
this.showDemo=true;
}catch(error){
console.error("Error submitting results:",error);
alert("Failed to submit results. Please try again.");
}
},
gatherDeviceInfo(){
this.userAgent=navigator.userAgent;
this.screenWidth=window.screen.width;
this.screenHeight=window.screen.height;
this.colorDepth=window.screen.colorDepth;
this.pixelRatio=window.devicePixelRatio||1;
}
},
mounted(){
setTimeout(()=>{
this.showInitialMessage=false;
},2e3);
}
};
if(!Array){
const _component_transition=common_vendor.resolveComponent("transition");
const _component_Results=common_vendor.resolveComponent("Results");
(_component_transition+_component_Results)();
}
function _sfc_render(_ctx,_cache,$props,$setup,$data,$options){
return common_vendor.e({
a:$data.rounds<$data.MAX_ROUNDS
},$data.rounds<$data.MAX_ROUNDS?common_vendor.e({
b:$data.showInitialMessage
},$data.showInitialMessage?{}:{},{
c:common_vendor.p({
name:"fade-up",
mode:"out-in"
})
}):{
d:common_vendor.p({
binPosition:$data.binPosition,
count:$data.count,
xCdf:$data.xCdf,
yCdf:$data.yCdf,
userThreshold:$data.finalHue
})
},{
e:$data.rounds<$data.MAX_ROUNDS
},$data.rounds<$data.MAX_ROUNDS?{
f:common_vendor.o(($event)=>$options.selectColor("blue")),
g:common_vendor.o((...args)=>$options.reset&&$options.reset(...args)),
h:common_vendor.o(($event)=>$options.selectColor("green"))
}:{
i:common_vendor.o((...args)=>$options.reset&&$options.reset(...args))
},{
j:common_vendor.s($options.containerStyle)
});
}
const Component=/* @__PURE__ */common_vendor._export_sfc(_sfc_main,[["render",_sfc_render],["__scopeId","data-v-f1181506"]]);
wx.createComponent(Component);