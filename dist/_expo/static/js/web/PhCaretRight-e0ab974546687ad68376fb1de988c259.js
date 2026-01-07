__d(function(g,_r,_i,_a,m,e,_d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"PhCaretRight",{enumerable:!0,get:function(){return h}}),_r(_d[0]);var t=_r(_d[1]),r=_r(_d[2]),l=_r(_d[3]),o=_r(_d[4]),i=_r(_d[5]),s=Object.defineProperty,p=Object.getOwnPropertyDescriptor,a=(t,r,l,o)=>{for(var i,a=o>1?void 0:o?p(r,l):r,h=t.length-1;h>=0;h--)(i=t[h])&&(a=(o?i(r,l,a):i(a))||a);return o&&a&&s(r,l,a),a};let h=class extends r.LitElement{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return t.html`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${h.weightsMap.get(null!=(r=this.weight)?r:"regular")}
    </svg>`}};h.weightsMap=new Map([["thin",t.svg`<path d="M178.83,130.83l-80,80a4,4,0,0,1-5.66-5.66L170.34,128,93.17,50.83a4,4,0,0,1,5.66-5.66l80,80A4,4,0,0,1,178.83,130.83Z"/>`],["light",t.svg`<path d="M180.24,132.24l-80,80a6,6,0,0,1-8.48-8.48L167.51,128,91.76,52.24a6,6,0,0,1,8.48-8.48l80,80A6,6,0,0,1,180.24,132.24Z"/>`],["regular",t.svg`<path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>`],["bold",t.svg`<path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"/>`],["fill",t.svg`<path d="M181.66,133.66l-80,80A8,8,0,0,1,88,208V48a8,8,0,0,1,13.66-5.66l80,80A8,8,0,0,1,181.66,133.66Z"/>`],["duotone",t.svg`<path d="M176,128,96,208V48Z" opacity="0.2"/><path d="M181.66,122.34l-80-80A8,8,0,0,0,88,48V208a8,8,0,0,0,13.66,5.66l80-80A8,8,0,0,0,181.66,122.34ZM104,188.69V67.31L164.69,128Z"/>`]]),h.styles=i.css`
    :host {
      display: contents;
    }
  `,a([(0,o.property)({type:String,reflect:!0})],h.prototype,"size",2),a([(0,o.property)({type:String,reflect:!0})],h.prototype,"weight",2),a([(0,o.property)({type:String,reflect:!0})],h.prototype,"color",2),a([(0,o.property)({type:Boolean,reflect:!0})],h.prototype,"mirrored",2),h=a([(0,l.customElement)("ph-caret-right")],h)},4383,[4363,4365,4366,4367,4368,4364]);