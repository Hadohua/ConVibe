__d(function(g,_r,_i,_a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"PhArrowUp",{enumerable:!0,get:function(){return h}}),_r(d[0]);var t=_r(d[1]),r=_r(d[2]),o=_r(d[3]),l=_r(d[4]),a=_r(d[5]),s=Object.defineProperty,i=Object.getOwnPropertyDescriptor,p=(t,r,o,l)=>{for(var a,p=l>1?void 0:l?i(r,o):r,h=t.length-1;h>=0;h--)(a=t[h])&&(p=(l?a(r,o,p):a(p))||p);return l&&p&&s(r,o,p),p};let h=class extends r.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${h.weightsMap.get(null!=(r=this.weight)?r:"regular")}
    </svg>`}};h.weightsMap=new Map([["thin",t.svg`<path d="M202.83,114.83a4,4,0,0,1-5.66,0L132,49.66V216a4,4,0,0,1-8,0V49.66L58.83,114.83a4,4,0,0,1-5.66-5.66l72-72a4,4,0,0,1,5.66,0l72,72A4,4,0,0,1,202.83,114.83Z"/>`],["light",t.svg`<path d="M204.24,116.24a6,6,0,0,1-8.48,0L134,54.49V216a6,6,0,0,1-12,0V54.49L60.24,116.24a6,6,0,0,1-8.48-8.48l72-72a6,6,0,0,1,8.48,0l72,72A6,6,0,0,1,204.24,116.24Z"/>`],["regular",t.svg`<path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z"/>`],["bold",t.svg`<path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"/>`],["fill",t.svg`<path d="M207.39,115.06A8,8,0,0,1,200,120H136v96a8,8,0,0,1-16,0V120H56a8,8,0,0,1-5.66-13.66l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,207.39,115.06Z"/>`],["duotone",t.svg`<path d="M200,112H56l72-72Z" opacity="0.2"/><path d="M205.66,106.34l-72-72a8,8,0,0,0-11.32,0l-72,72A8,8,0,0,0,56,120h64v96a8,8,0,0,0,16,0V120h64a8,8,0,0,0,5.66-13.66ZM75.31,104,128,51.31,180.69,104Z"/>`]]),h.styles=a.css`
    :host {
      display: contents;
    }
  `,p([(0,l.property)({type:String,reflect:!0})],h.prototype,"size",2),p([(0,l.property)({type:String,reflect:!0})],h.prototype,"weight",2),p([(0,l.property)({type:String,reflect:!0})],h.prototype,"color",2),p([(0,l.property)({type:Boolean,reflect:!0})],h.prototype,"mirrored",2),h=p([(0,o.customElement)("ph-arrow-up")],h)},6940,[4920,4922,4923,4924,4925,4921]);