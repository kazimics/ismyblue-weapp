"use strict";
const common_vendor=require("../../common/vendor.js");
const BlueGreenTest=()=>"../../components/BlueGreenTest.js";
const _sfc_main={
components:{
BlueGreenTest
},
onLoad(){
},
methods:{}
};
if(!Array){
const _component_BlueGreenTest=common_vendor.resolveComponent("BlueGreenTest");
_component_BlueGreenTest();
}
function _sfc_render(_ctx,_cache,$props,$setup,$data,$options){
return{};
}
const MiniProgramPage=/* @__PURE__ */common_vendor._export_sfc(_sfc_main,[["render",_sfc_render]]);
wx.createPage(MiniProgramPage);