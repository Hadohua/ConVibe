__d(function(g,r,i,_a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"PhCaretLeft",{enumerable:!0,get:function(){return n}}),r(_d[0]);var t=r(_d[1]),e=r(_d[2]),l=r(_d[3]),o=r(_d[4]),s=r(_d[5]),a=Object.defineProperty,p=Object.getOwnPropertyDescriptor,h=(t,e,l,o)=>{for(var s,h=o>1?void 0:o?p(e,l):e,n=t.length-1;n>=0;n--)(s=t[n])&&(h=(o?s(e,l,h):s(h))||h);return o&&h&&a(e,l,h),h};let n=class extends e.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var e;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${n.weightsMap.get(null!=(e=this.weight)?e:"regular")}
    </svg>`}};n.weightsMap=new Map([["thin",t.svg`<path d="M162.83,205.17a4,4,0,0,1-5.66,5.66l-80-80a4,4,0,0,1,0-5.66l80-80a4,4,0,1,1,5.66,5.66L85.66,128Z"/>`],["light",t.svg`<path d="M164.24,203.76a6,6,0,1,1-8.48,8.48l-80-80a6,6,0,0,1,0-8.48l80-80a6,6,0,0,1,8.48,8.48L88.49,128Z"/>`],["regular",t.svg`<path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/>`],["bold",t.svg`<path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z"/>`],["fill",t.svg`<path d="M168,48V208a8,8,0,0,1-13.66,5.66l-80-80a8,8,0,0,1,0-11.32l80-80A8,8,0,0,1,168,48Z"/>`],["duotone",t.svg`<path d="M160,48V208L80,128Z" opacity="0.2"/><path d="M163.06,40.61a8,8,0,0,0-8.72,1.73l-80,80a8,8,0,0,0,0,11.32l80,80A8,8,0,0,0,168,208V48A8,8,0,0,0,163.06,40.61ZM152,188.69,91.31,128,152,67.31Z"/>`]]),n.styles=s.css`
    :host {
      display: contents;
    }
  `,h([(0,o.property)({type:String,reflect:!0})],n.prototype,"size",2),h([(0,o.property)({type:String,reflect:!0})],n.prototype,"weight",2),h([(0,o.property)({type:String,reflect:!0})],n.prototype,"color",2),h([(0,o.property)({type:Boolean,reflect:!0})],n.prototype,"mirrored",2),n=h([(0,l.customElement)("ph-caret-left")],n)},6946,[4920,4922,4923,4924,4925,4921]);