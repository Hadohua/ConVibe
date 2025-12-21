__d(function(g,_r,_i,_a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"PhPlus",{enumerable:!0,get:function(){return l}}),_r(d[0]);var t=_r(d[1]),r=_r(d[2]),a=_r(d[3]),o=_r(d[4]),s=_r(d[5]),h=Object.defineProperty,i=Object.getOwnPropertyDescriptor,p=(t,r,a,o)=>{for(var s,p=o>1?void 0:o?i(r,a):r,l=t.length-1;l>=0;l--)(s=t[l])&&(p=(o?s(r,a,p):s(p))||p);return o&&p&&h(r,a,p),p};let l=class extends r.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${l.weightsMap.get(null!=(r=this.weight)?r:"regular")}
    </svg>`}};l.weightsMap=new Map([["thin",t.svg`<path d="M220,128a4,4,0,0,1-4,4H132v84a4,4,0,0,1-8,0V132H40a4,4,0,0,1,0-8h84V40a4,4,0,0,1,8,0v84h84A4,4,0,0,1,220,128Z"/>`],["light",t.svg`<path d="M222,128a6,6,0,0,1-6,6H134v82a6,6,0,0,1-12,0V134H40a6,6,0,0,1,0-12h82V40a6,6,0,0,1,12,0v82h82A6,6,0,0,1,222,128Z"/>`],["regular",t.svg`<path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>`],["bold",t.svg`<path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z"/>`],["fill",t.svg`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM184,136H136v48a8,8,0,0,1-16,0V136H72a8,8,0,0,1,0-16h48V72a8,8,0,0,1,16,0v48h48a8,8,0,0,1,0,16Z"/>`],["duotone",t.svg`<path d="M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z" opacity="0.2"/><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>`]]),l.styles=s.css`
    :host {
      display: contents;
    }
  `,p([(0,o.property)({type:String,reflect:!0})],l.prototype,"size",2),p([(0,o.property)({type:String,reflect:!0})],l.prototype,"weight",2),p([(0,o.property)({type:String,reflect:!0})],l.prototype,"color",2),p([(0,o.property)({type:Boolean,reflect:!0})],l.prototype,"mirrored",2),l=p([(0,a.customElement)("ph-plus")],l)},6969,[4920,4922,4923,4924,4925,4921]);