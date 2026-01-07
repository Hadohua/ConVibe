__d(function(g,_r,i,_a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"PhCaretDown",{enumerable:!0,get:function(){return h}}),_r(d[0]);var t=_r(d[1]),r=_r(d[2]),l=_r(d[3]),o=_r(d[4]),s=_r(d[5]),a=Object.defineProperty,p=Object.getOwnPropertyDescriptor,n=(t,r,l,o)=>{for(var s,n=o>1?void 0:o?p(r,l):r,h=t.length-1;h>=0;h--)(s=t[h])&&(n=(o?s(r,l,n):s(n))||n);return o&&n&&a(r,l,n),n};let h=class extends r.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${h.weightsMap.get(null!=(r=this.weight)?r:"regular")}
    </svg>`}};h.weightsMap=new Map([["thin",t.svg`<path d="M210.83,98.83l-80,80a4,4,0,0,1-5.66,0l-80-80a4,4,0,0,1,5.66-5.66L128,170.34l77.17-77.17a4,4,0,1,1,5.66,5.66Z"/>`],["light",t.svg`<path d="M212.24,100.24l-80,80a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,8.48-8.48L128,167.51l75.76-75.75a6,6,0,0,1,8.48,8.48Z"/>`],["regular",t.svg`<path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>`],["bold",t.svg`<path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/>`],["fill",t.svg`<path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z"/>`],["duotone",t.svg`<path d="M208,96l-80,80L48,96Z" opacity="0.2"/><path d="M215.39,92.94A8,8,0,0,0,208,88H48a8,8,0,0,0-5.66,13.66l80,80a8,8,0,0,0,11.32,0l80-80A8,8,0,0,0,215.39,92.94ZM128,164.69,67.31,104H188.69Z"/>`]]),h.styles=s.css`
    :host {
      display: contents;
    }
  `,n([(0,o.property)({type:String,reflect:!0})],h.prototype,"size",2),n([(0,o.property)({type:String,reflect:!0})],h.prototype,"weight",2),n([(0,o.property)({type:String,reflect:!0})],h.prototype,"color",2),n([(0,o.property)({type:Boolean,reflect:!0})],h.prototype,"mirrored",2),h=n([(0,l.customElement)("ph-caret-down")],h)},4381,[4363,4365,4366,4367,4368,4364]);