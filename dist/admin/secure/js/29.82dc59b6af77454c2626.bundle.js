(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{235:function(e,n,t){"use strict";t.r(n);var r=t(6),a=t(0),s=t.n(a),l=t(60);n.default=class extends a.Component{constructor(){super(...arguments),Object(r.a)(this,"handleChange",e=>{const n=e.target.value;this.props.onChange(n.replace(/\D/g,""))})}render(){const e=this.props,n=e.filter,t=e.field,r=e.innerRef,a=e.value;if(!n)return null;const o=t.getFilterLabel(n);return s.a.createElement(l.c,{onChange:this.handleChange,ref:r,placeholder:o,value:a})}}}}]);