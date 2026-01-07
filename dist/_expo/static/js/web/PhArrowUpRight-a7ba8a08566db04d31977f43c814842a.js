__d(function(g,_r,_i,_a,_m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"PhArrowUpRight",{enumerable:!0,get:function(){return h}}),_r(d[0]);var t=_r(d[1]),r=_r(d[2]),o=_r(d[3]),i=_r(d[4]),s=_r(d[5]),p=Object.defineProperty,a=Object.getOwnPropertyDescriptor,l=(t,r,o,i)=>{for(var s,l=i>1?void 0:i?a(r,o):r,h=t.length-1;h>=0;h--)(s=t[h])&&(l=(i?s(r,o,l):s(l))||l);return i&&l&&p(r,o,l),l};let h=class extends r.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${h.weightsMap.get(null!=(r=this.weight)?r:"regular")}
    </svg>`}};h.weightsMap=new Map([["thin",t.svg`<path d="M196,64V168a4,4,0,0,1-8,0V73.66L66.83,194.83a4,4,0,0,1-5.66-5.66L182.34,68H88a4,4,0,0,1,0-8H192A4,4,0,0,1,196,64Z"/>`],["light",t.svg`<path d="M198,64V168a6,6,0,0,1-12,0V78.48L68.24,196.24a6,6,0,0,1-8.48-8.48L177.52,70H88a6,6,0,0,1,0-12H192A6,6,0,0,1,198,64Z"/>`],["regular",t.svg`<path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/>`],["bold",t.svg`<path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"/>`],["fill",t.svg`<path d="M200,64V168a8,8,0,0,1-13.66,5.66L140,127.31,69.66,197.66a8,8,0,0,1-11.32-11.32L128.69,116,82.34,69.66A8,8,0,0,1,88,56H192A8,8,0,0,1,200,64Z"/>`],["duotone",t.svg`<path d="M192,64V168L88,64Z" opacity="0.2"/><path d="M192,56H88a8,8,0,0,0-5.66,13.66L128.69,116,58.34,186.34a8,8,0,0,0,11.32,11.32L140,127.31l46.34,46.35A8,8,0,0,0,200,168V64A8,8,0,0,0,192,56Zm-8,92.69-38.34-38.34h0L107.31,72H184Z"/>`]]),h.styles=s.css`
    :host {
      display: contents;
    }
  `,l([(0,i.property)({type:String,reflect:!0})],h.prototype,"size",2),l([(0,i.property)({type:String,reflect:!0})],h.prototype,"weight",2),l([(0,i.property)({type:String,reflect:!0})],h.prototype,"color",2),l([(0,i.property)({type:Boolean,reflect:!0})],h.prototype,"mirrored",2),h=l([(0,o.customElement)("ph-arrow-up-right")],h)},4377,[4363,4365,4366,4367,4368,4364]);