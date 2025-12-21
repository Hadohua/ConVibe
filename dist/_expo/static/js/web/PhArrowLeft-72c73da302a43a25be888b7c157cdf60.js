__d(function(g,_r,i,_a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"PhArrowLeft",{enumerable:!0,get:function(){return n}}),_r(d[0]);var t=_r(d[1]),r=_r(d[2]),l=_r(d[3]),o=_r(d[4]),a=_r(d[5]),s=Object.defineProperty,p=Object.getOwnPropertyDescriptor,h=(t,r,l,o)=>{for(var a,h=o>1?void 0:o?p(r,l):r,n=t.length-1;n>=0;n--)(a=t[n])&&(h=(o?a(r,l,h):a(h))||h);return o&&h&&s(r,l,h),h};let n=class extends r.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${n.weightsMap.get(null!=(r=this.weight)?r:"regular")}
    </svg>`}};n.weightsMap=new Map([["thin",t.svg`<path d="M220,128a4,4,0,0,1-4,4H49.66l65.17,65.17a4,4,0,0,1-5.66,5.66l-72-72a4,4,0,0,1,0-5.66l72-72a4,4,0,0,1,5.66,5.66L49.66,124H216A4,4,0,0,1,220,128Z"/>`],["light",t.svg`<path d="M222,128a6,6,0,0,1-6,6H54.49l61.75,61.76a6,6,0,1,1-8.48,8.48l-72-72a6,6,0,0,1,0-8.48l72-72a6,6,0,0,1,8.48,8.48L54.49,122H216A6,6,0,0,1,222,128Z"/>`],["regular",t.svg`<path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/>`],["bold",t.svg`<path d="M228,128a12,12,0,0,1-12,12H69l51.52,51.51a12,12,0,0,1-17,17l-72-72a12,12,0,0,1,0-17l72-72a12,12,0,0,1,17,17L69,116H216A12,12,0,0,1,228,128Z"/>`],["fill",t.svg`<path d="M224,128a8,8,0,0,1-8,8H120v64a8,8,0,0,1-13.66,5.66l-72-72a8,8,0,0,1,0-11.32l72-72A8,8,0,0,1,120,56v64h96A8,8,0,0,1,224,128Z"/>`],["duotone",t.svg`<path d="M112,56V200L40,128Z" opacity="0.2"/><path d="M216,120H120V56a8,8,0,0,0-13.66-5.66l-72,72a8,8,0,0,0,0,11.32l72,72A8,8,0,0,0,120,200V136h96a8,8,0,0,0,0-16ZM104,180.69,51.31,128,104,75.31Z"/>`]]),n.styles=a.css`
    :host {
      display: contents;
    }
  `,h([(0,o.property)({type:String,reflect:!0})],n.prototype,"size",2),h([(0,o.property)({type:String,reflect:!0})],n.prototype,"weight",2),h([(0,o.property)({type:String,reflect:!0})],n.prototype,"color",2),h([(0,o.property)({type:Boolean,reflect:!0})],n.prototype,"mirrored",2),n=h([(0,l.customElement)("ph-arrow-left")],n)},6935,[4920,4922,4923,4924,4925,4921]);