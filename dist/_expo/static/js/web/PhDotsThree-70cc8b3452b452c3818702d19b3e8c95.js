__d(function(g,r,_i,_a,_m,_e,d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"PhDotsThree",{enumerable:!0,get:function(){return h}}),r(d[0]);var t=r(d[1]),e=r(d[2]),o=r(d[3]),a=r(d[4]),s=r(d[5]),i=Object.defineProperty,p=Object.getOwnPropertyDescriptor,l=(t,e,o,a)=>{for(var s,l=a>1?void 0:a?p(e,o):e,h=t.length-1;h>=0;h--)(s=t[h])&&(l=(a?s(e,o,l):s(l))||l);return a&&l&&i(e,o,l),l};let h=class extends e.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var e;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${h.weightsMap.get(null!=(e=this.weight)?e:"regular")}
    </svg>`}};h.weightsMap=new Map([["thin",t.svg`<path d="M136,128a8,8,0,1,1-8-8A8,8,0,0,1,136,128Zm-76-8a8,8,0,1,0,8,8A8,8,0,0,0,60,120Zm136,0a8,8,0,1,0,8,8A8,8,0,0,0,196,120Z"/>`],["light",t.svg`<path d="M138,128a10,10,0,1,1-10-10A10,10,0,0,1,138,128ZM60,118a10,10,0,1,0,10,10A10,10,0,0,0,60,118Zm136,0a10,10,0,1,0,10,10A10,10,0,0,0,196,118Z"/>`],["regular",t.svg`<path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z"/>`],["bold",t.svg`<path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z"/>`],["fill",t.svg`<path d="M224,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V96A16,16,0,0,0,224,80ZM60,140a12,12,0,1,1,12-12A12,12,0,0,1,60,140Zm68,0a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm68,0a12,12,0,1,1,12-12A12,12,0,0,1,196,140Z"/>`],["duotone",t.svg`<path d="M240,96v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V96A16,16,0,0,1,32,80H224A16,16,0,0,1,240,96Z" opacity="0.2"/><path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z"/>`]]),h.styles=s.css`
    :host {
      display: contents;
    }
  `,l([(0,a.property)({type:String,reflect:!0})],h.prototype,"size",2),l([(0,a.property)({type:String,reflect:!0})],h.prototype,"weight",2),l([(0,a.property)({type:String,reflect:!0})],h.prototype,"color",2),l([(0,a.property)({type:Boolean,reflect:!0})],h.prototype,"mirrored",2),h=l([(0,o.customElement)("ph-dots-three")],h)},6958,[4920,4922,4923,4924,4925,4921]);