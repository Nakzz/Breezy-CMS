(window.webpackJsonp=window.webpackJsonp||[]).push([[28],{226:function(t,e,a){"use strict";a.r(e);a(29);var l=a(6),n=(a(202),a(201));e.default=class extends n.a{constructor(){super(...arguments),Object(l.a)(this,"getFilterGraphQL",t=>{let e=t.type,a=t.value;const l="is"===e?"".concat(this.path):"".concat(this.path,"_").concat(e);return"".concat(l,": ").concat(a)}),Object(l.a)(this,"getFilterLabel",t=>{let e=t.label;return"".concat(this.label," ").concat(e.toLowerCase())}),Object(l.a)(this,"formatFilter",t=>{let e=t.label,a=t.value;return"".concat(this.getFilterLabel({label:e}),': "').concat(a,'"')}),Object(l.a)(this,"serialize",t=>{const e=t[this.path];return"number"==typeof e?e:"string"==typeof e&&e.length>0?parseFloat(e):null}),Object(l.a)(this,"getFilterTypes",()=>[{type:"is",label:"Is exactly",getInitialValue:()=>""},{type:"not",label:"Is not exactly",getInitialValue:()=>""},{type:"gt",label:"Is greater than",getInitialValue:()=>""},{type:"lt",label:"Is less than",getInitialValue:()=>""},{type:"gte",label:"Is greater than or equal to",getInitialValue:()=>""},{type:"lte",label:"Is less than or equal to",getInitialValue:()=>""}])}}}}]);