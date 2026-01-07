__d(function(g,_r,_i,_a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"PhCaretUp",{enumerable:!0,get:function(){return h}}),_r(_d[0]);var t=_r(_d[1]),r=_r(_d[2]),l=_r(_d[3]),o=_r(_d[4]),s=_r(_d[5]),a=Object.defineProperty,i=Object.getOwnPropertyDescriptor,p=(t,r,l,o)=>{for(var s,p=o>1?void 0:o?i(r,l):r,h=t.length-1;h>=0;h--)(s=t[h])&&(p=(o?s(r,l,p):s(p))||p);return o&&p&&a(r,l,p),p};let h=class extends r.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${h.weightsMap.get(null!=(r=this.weight)?r:"regular")}
    </svg>`}};h.weightsMap=new Map([["thin",t.svg`<path d="M210.83,162.83a4,4,0,0,1-5.66,0L128,85.66,50.83,162.83a4,4,0,0,1-5.66-5.66l80-80a4,4,0,0,1,5.66,0l80,80A4,4,0,0,1,210.83,162.83Z"/>`],["light",t.svg`<path d="M212.24,164.24a6,6,0,0,1-8.48,0L128,88.49,52.24,164.24a6,6,0,0,1-8.48-8.48l80-80a6,6,0,0,1,8.48,0l80,80A6,6,0,0,1,212.24,164.24Z"/>`],["regular",t.svg`<path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"/>`],["bold",t.svg`<path d="M216.49,168.49a12,12,0,0,1-17,0L128,97,56.49,168.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0l80,80A12,12,0,0,1,216.49,168.49Z"/>`],["fill",t.svg`<path d="M215.39,163.06A8,8,0,0,1,208,168H48a8,8,0,0,1-5.66-13.66l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,215.39,163.06Z"/>`],["duotone",t.svg`<path d="M208,160H48l80-80Z" opacity="0.2"/><path d="M213.66,154.34l-80-80a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,48,168H208a8,8,0,0,0,5.66-13.66ZM67.31,152,128,91.31,188.69,152Z"/>`]]),h.styles=s.css`
    :host {
      display: contents;
    }
  `,p([(0,o.property)({type:String,reflect:!0})],h.prototype,"size",2),p([(0,o.property)({type:String,reflect:!0})],h.prototype,"weight",2),p([(0,o.property)({type:String,reflect:!0})],h.prototype,"color",2),p([(0,o.property)({type:Boolean,reflect:!0})],h.prototype,"mirrored",2),h=p([(0,l.customElement)("ph-caret-up")],h)},4384,[4363,4365,4366,4367,4368,4364]);