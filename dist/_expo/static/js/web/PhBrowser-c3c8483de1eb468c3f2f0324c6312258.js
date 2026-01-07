__d(function(g,_r,_i,_a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"PhBrowser",{enumerable:!0,get:function(){return h}}),_r(d[0]);var t=_r(d[1]),r=_r(d[2]),o=_r(d[3]),s=_r(d[4]),i=_r(d[5]),a=Object.defineProperty,p=Object.getOwnPropertyDescriptor,l=(t,r,o,s)=>{for(var i,l=s>1?void 0:s?p(r,o):r,h=t.length-1;h>=0;h--)(i=t[h])&&(l=(s?i(r,o,l):i(l))||l);return s&&l&&a(r,o,l),l};let h=class extends r.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${h.weightsMap.get(null!=(r=this.weight)?r:"regular")}
    </svg>`}};h.weightsMap=new Map([["thin",t.svg`<path d="M216,44H40A12,12,0,0,0,28,56V200a12,12,0,0,0,12,12H216a12,12,0,0,0,12-12V56A12,12,0,0,0,216,44ZM40,52H216a4,4,0,0,1,4,4V92H36V56A4,4,0,0,1,40,52ZM216,204H40a4,4,0,0,1-4-4V100H220V200A4,4,0,0,1,216,204Z"/>`],["light",t.svg`<path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM40,54H216a2,2,0,0,1,2,2V90H38V56A2,2,0,0,1,40,54ZM216,202H40a2,2,0,0,1-2-2V102H218v98A2,2,0,0,1,216,202Z"/>`],["regular",t.svg`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V88H40V56Zm0,144H40V104H216v96Z"/>`],["bold",t.svg`<path d="M216,36H40A20,20,0,0,0,20,56V200a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V56A20,20,0,0,0,216,36Zm-4,24V84H44V60ZM44,196V108H212v88Z"/>`],["fill",t.svg`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V88H40V56Z"/>`],["duotone",t.svg`<path d="M224,56V96H32V56a8,8,0,0,1,8-8H216A8,8,0,0,1,224,56Z" opacity="0.2"/><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V88H40V56Zm0,144H40V104H216v96Z"/>`]]),h.styles=i.css`
    :host {
      display: contents;
    }
  `,l([(0,s.property)({type:String,reflect:!0})],h.prototype,"size",2),l([(0,s.property)({type:String,reflect:!0})],h.prototype,"weight",2),l([(0,s.property)({type:String,reflect:!0})],h.prototype,"color",2),l([(0,s.property)({type:Boolean,reflect:!0})],h.prototype,"mirrored",2),h=l([(0,o.customElement)("ph-browser")],h)},4380,[4363,4365,4366,4367,4368,4364]);