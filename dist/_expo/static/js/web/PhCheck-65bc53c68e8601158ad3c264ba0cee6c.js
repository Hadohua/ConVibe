__d(function(g,r,i,_a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"PhCheck",{enumerable:!0,get:function(){return n}}),r(_d[0]);var t=r(_d[1]),e=r(_d[2]),l=r(_d[3]),o=r(_d[4]),a=r(_d[5]),s=Object.defineProperty,p=Object.getOwnPropertyDescriptor,h=(t,e,l,o)=>{for(var a,h=o>1?void 0:o?p(e,l):e,n=t.length-1;n>=0;n--)(a=t[n])&&(h=(o?a(e,l,h):a(h))||h);return o&&h&&s(e,l,h),h};let n=class extends e.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var e;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${n.weightsMap.get(null!=(e=this.weight)?e:"regular")}
    </svg>`}};n.weightsMap=new Map([["thin",t.svg`<path d="M226.83,74.83l-128,128a4,4,0,0,1-5.66,0l-56-56a4,4,0,0,1,5.66-5.66L96,194.34,221.17,69.17a4,4,0,1,1,5.66,5.66Z"/>`],["light",t.svg`<path d="M228.24,76.24l-128,128a6,6,0,0,1-8.48,0l-56-56a6,6,0,0,1,8.48-8.48L96,191.51,219.76,67.76a6,6,0,0,1,8.48,8.48Z"/>`],["regular",t.svg`<path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>`],["bold",t.svg`<path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"/>`],["fill",t.svg`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM205.66,85.66l-96,96a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L104,164.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z"/>`],["duotone",t.svg`<path d="M232,56V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Z" opacity="0.2"/><path d="M205.66,85.66l-96,96a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L104,164.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z"/>`]]),n.styles=a.css`
    :host {
      display: contents;
    }
  `,h([(0,o.property)({type:String,reflect:!0})],n.prototype,"size",2),h([(0,o.property)({type:String,reflect:!0})],n.prototype,"weight",2),h([(0,o.property)({type:String,reflect:!0})],n.prototype,"color",2),h([(0,o.property)({type:Boolean,reflect:!0})],n.prototype,"mirrored",2),n=h([(0,l.customElement)("ph-check")],n)},4385,[4363,4365,4366,4367,4368,4364]);