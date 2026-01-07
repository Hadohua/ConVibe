__d(function(g,_r,i,_a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"PhArrowDown",{enumerable:!0,get:function(){return n}}),_r(d[0]);var t=_r(d[1]),r=_r(d[2]),l=_r(d[3]),o=_r(d[4]),a=_r(d[5]),s=Object.defineProperty,p=Object.getOwnPropertyDescriptor,h=(t,r,l,o)=>{for(var a,h=o>1?void 0:o?p(r,l):r,n=t.length-1;n>=0;n--)(a=t[n])&&(h=(o?a(r,l,h):a(h))||h);return o&&h&&s(r,l,h),h};let n=class extends r.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${n.weightsMap.get(null!=(r=this.weight)?r:"regular")}
    </svg>`}};n.weightsMap=new Map([["thin",t.svg`<path d="M202.83,146.83l-72,72a4,4,0,0,1-5.66,0l-72-72a4,4,0,0,1,5.66-5.66L124,206.34V40a4,4,0,0,1,8,0V206.34l65.17-65.17a4,4,0,0,1,5.66,5.66Z"/>`],["light",t.svg`<path d="M204.24,148.24l-72,72a6,6,0,0,1-8.48,0l-72-72a6,6,0,0,1,8.48-8.48L122,201.51V40a6,6,0,0,1,12,0V201.51l61.76-61.75a6,6,0,0,1,8.48,8.48Z"/>`],["regular",t.svg`<path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"/>`],["bold",t.svg`<path d="M208.49,152.49l-72,72a12,12,0,0,1-17,0l-72-72a12,12,0,0,1,17-17L116,187V40a12,12,0,0,1,24,0V187l51.51-51.52a12,12,0,0,1,17,17Z"/>`],["fill",t.svg`<path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72A8,8,0,0,1,56,136h64V40a8,8,0,0,1,16,0v96h64a8,8,0,0,1,5.66,13.66Z"/>`],["duotone",t.svg`<path d="M200,144l-72,72L56,144Z" opacity="0.2"/><path d="M207.39,140.94A8,8,0,0,0,200,136H136V40a8,8,0,0,0-16,0v96H56a8,8,0,0,0-5.66,13.66l72,72a8,8,0,0,0,11.32,0l72-72A8,8,0,0,0,207.39,140.94ZM128,204.69,75.31,152H180.69Z"/>`]]),n.styles=a.css`
    :host {
      display: contents;
    }
  `,h([(0,o.property)({type:String,reflect:!0})],n.prototype,"size",2),h([(0,o.property)({type:String,reflect:!0})],n.prototype,"weight",2),h([(0,o.property)({type:String,reflect:!0})],n.prototype,"color",2),h([(0,o.property)({type:Boolean,reflect:!0})],n.prototype,"mirrored",2),n=h([(0,l.customElement)("ph-arrow-down")],n)},4370,[4363,4365,4366,4367,4368,4364]);