__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})});var n=r(d[1]);Object.keys(n).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})});var c=r(d[2]);Object.keys(c).forEach(function(t){'default'===t||Object.prototype.hasOwnProperty.call(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:function(){return c[t]}})})},4266,[4819,4854,4856]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mModalBase",{enumerable:!0,get:function(){return u}}),Object.defineProperty(_e,"W3mModal",{enumerable:!0,get:function(){return C}}),Object.defineProperty(_e,"AppKitModal",{enumerable:!0,get:function(){return w}});var e=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]),r=_r(_d[3]),s=_r(_d[4]),i=_r(_d[5]);_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]),_r(_d[10]),_r(_d[11]);var n=_r(_d[12]);_r(_d[13]),_r(_d[14]);var l,d=_r(_d[15]),c=(l=d)&&l.__esModule?l:{default:l},h=this&&this.__decorate||function(e,t,o,r){var s,i=arguments.length,n=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(n=(i<3?s(n):i>3?s(t,o,n):s(t,o))||n);return i>3&&n&&Object.defineProperty(t,o,n),n};const p='scroll-lock',b={PayWithExchange:'0',PayWithExchangeSelectAsset:'0'};class u extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=s.OptionsController.state.enableEmbedded,this.open=s.ModalController.state.open,this.caipAddress=s.ChainController.state.activeCaipAddress,this.caipNetwork=s.ChainController.state.activeCaipNetwork,this.shake=s.ModalController.state.shake,this.filterByNamespace=s.ConnectorController.state.filterByNamespace,this.padding=i.vars.spacing[1],this.mobileFullScreen=s.OptionsController.state.enableMobileFullScreen,this.initializeTheming(),s.ApiController.prefetchAnalyticsConfig(),this.unsubscribe.push(s.ModalController.subscribeKey('open',e=>e?this.onOpen():this.onClose()),s.ModalController.subscribeKey('shake',e=>this.shake=e),s.ChainController.subscribeKey('activeCaipNetwork',e=>this.onNewNetwork(e)),s.ChainController.subscribeKey('activeCaipAddress',e=>this.onNewAddress(e)),s.OptionsController.subscribeKey('enableEmbedded',e=>this.enableEmbedded=e),s.ConnectorController.subscribeKey('filterByNamespace',e=>{this.filterByNamespace===e||s.ChainController.getAccountData(e)?.caipAddress||(s.ApiController.fetchRecommendedWallets(),this.filterByNamespace=e)}),s.RouterController.subscribeKey('view',()=>{this.dataset.border=n.HelpersUtil.hasFooter()?'true':'false',this.padding=b[s.RouterController.state.view]??i.vars.spacing[1]}))}firstUpdated(){if(this.dataset.border=n.HelpersUtil.hasFooter()?'true':'false',this.mobileFullScreen&&this.setAttribute('data-mobile-fullscreen','true'),this.caipAddress){if(this.enableEmbedded)return s.ModalController.close(),void this.prefetch();this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.style.setProperty('--local-modal-padding',this.padding),this.enableEmbedded?e.html`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?e.html`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return e.html` <wui-card
      shake="${this.shake}"
      data-embedded="${(0,o.ifDefined)(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){if(e.target===e.currentTarget){if(this.mobileFullScreen)return;await this.handleClose()}}async handleClose(){await s.ModalUtil.safeClose()}initializeTheming(){const{themeVariables:e,themeMode:t}=s.ThemeController.state,o=i.UiHelperUtil.getColorTheme(t);(0,i.initializeTheming)(e,o)}onClose(){this.open=!1,this.classList.remove('open'),this.onScrollUnlock(),s.SnackController.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add('open'),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const e=document.createElement('style');e.dataset.w3m=p,e.textContent="\n      body {\n        touch-action: none;\n        overflow: hidden;\n        overscroll-behavior: contain;\n      }\n      w3m-modal {\n        pointer-events: auto;\n      }\n    ",document.head.appendChild(e)}onScrollUnlock(){const e=document.head.querySelector(`style[data-w3m="${p}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;const e=this.shadowRoot?.querySelector('wui-card');e?.focus(),window.addEventListener('keydown',t=>{if('Escape'===t.key)this.handleClose();else if('Tab'===t.key){const{tagName:o}=t.target;!o||o.includes('W3M-')||o.includes('WUI-')||e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(e){const t=s.ChainController.state.isSwitchingNamespace,o='ProfileWallets'===s.RouterController.state.view;e?await this.onConnected({caipAddress:e,isSwitchingNamespace:t,isInProfileView:o}):t||this.enableEmbedded||o||s.ModalController.close(),await s.SIWXUtil.initializeIfEnabled(e),this.caipAddress=e,s.ChainController.setIsSwitchingNamespace(!1)}async onConnected(e){if(e.isInProfileView)return;const{chainNamespace:t,chainId:o,address:i}=r.ParseUtil.parseCaipAddress(e.caipAddress),n=`${t}:${o}`,l=!s.CoreHelperUtil.getPlainAddress(this.caipAddress),d=await s.SIWXUtil.getSessions({address:i,caipNetworkId:n}),c=!s.SIWXUtil.getSIWX()||d.some(e=>e.data.accountAddress===i),h=e.isSwitchingNamespace&&c&&!this.enableEmbedded,p=this.enableEmbedded&&l;h?s.RouterController.goBack():p&&s.ModalController.close()}onNewNetwork(e){const t=this.caipNetwork,o=t?.caipNetworkId?.toString(),i=t?.chainNamespace,n=e?.caipNetworkId?.toString(),l=e?.chainNamespace,d=o!==n,c=d&&!(i!==l),h=t?.name===r.ConstantsUtil.UNSUPPORTED_NETWORK_NAME,p='ConnectingExternal'===s.RouterController.state.view,b='ProfileWallets'===s.RouterController.state.view,u=!s.ChainController.getAccountData(e?.chainNamespace)?.caipAddress,C='UnsupportedChain'===s.RouterController.state.view,w=s.ModalController.state.open;let f=!1;this.enableEmbedded&&'SwitchNetwork'===s.RouterController.state.view&&(f=!0),d&&s.SwapController.resetState(),!w||p||b||(u?d&&(f=!0):(C||c&&!h)&&(f=!0)),f&&'SIWXSignMessage'!==s.RouterController.state.view&&s.RouterController.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||(s.ApiController.prefetch(),s.ApiController.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}u.styles=c.default,h([(0,t.property)({type:Boolean})],u.prototype,"enableEmbedded",void 0),h([(0,t.state)()],u.prototype,"open",void 0),h([(0,t.state)()],u.prototype,"caipAddress",void 0),h([(0,t.state)()],u.prototype,"caipNetwork",void 0),h([(0,t.state)()],u.prototype,"shake",void 0),h([(0,t.state)()],u.prototype,"filterByNamespace",void 0),h([(0,t.state)()],u.prototype,"padding",void 0),h([(0,t.state)()],u.prototype,"mobileFullScreen",void 0);let C=class extends u{};C=h([(0,i.customElement)('w3m-modal')],C);let w=class extends u{};w=h([(0,i.customElement)('appkit-modal')],w)},4819,[3022,4802,4804,2158,2180,3019,4820,4803,4823,4828,4837,4842,4844,4845,4851,4853]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},4820,[4821]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiCard",{enumerable:!0,get:function(){return s}});var e,t=_r(_d[0]),r=_r(_d[1]),l=_r(_d[2]),n=_r(_d[3]),o=(e=n)&&e.__esModule?e:{default:e},c=this&&this.__decorate||function(e,t,r,l){var n,o=arguments.length,c=o<3?t:null===l?l=Object.getOwnPropertyDescriptor(t,r):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,r,l);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(c=(o<3?n(c):o>3?n(t,r,c):n(t,r))||c);return o>3&&c&&Object.defineProperty(t,r,c),c};let s=class extends t.LitElement{render(){return t.html`<slot></slot>`}};s.styles=[r.resetStyles,o.default],s=c([(0,l.customElement)('wui-card')],s)},4821,[3022,3021,3032,4822]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:o})=>o[8]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:o})=>o.theme.foregroundPrimary};
    overflow: hidden;
  }
`},4822,[3028]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"presets",{enumerable:!0,get:function(){return l}}),Object.defineProperty(_e,"W3mAlertBar",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),r=_r(_d[1]),o=_r(_d[2]),t=_r(_d[3]);_r(_d[4]);var n,s=_r(_d[5]),c=(n=s)&&n.__esModule?n:{default:n},i=this&&this.__decorate||function(e,r,o,t){var n,s=arguments.length,c=s<3?r:null===t?t=Object.getOwnPropertyDescriptor(r,o):t;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,r,o,t);else for(var i=e.length-1;i>=0;i--)(n=e[i])&&(c=(s<3?n(c):s>3?n(r,o,c):n(r,o))||c);return s>3&&c&&Object.defineProperty(r,o,c),c};const l={info:{backgroundColor:'fg-350',iconColor:'fg-325',icon:'info'},success:{backgroundColor:'success-glass-reown-020',iconColor:'success-125',icon:'checkmark'},warning:{backgroundColor:'warning-glass-reown-020',iconColor:'warning-100',icon:'warningCircle'},error:{backgroundColor:'error-glass-reown-020',iconColor:'error-125',icon:'warning'}};let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.open=o.AlertController.state.open,this.onOpen(!0),this.unsubscribe.push(o.AlertController.subscribeKey('open',e=>{this.open=e,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{message:r,variant:t}=o.AlertController.state,n=l[t];return e.html`
      <wui-alertbar
        message=${r}
        backgroundColor=${n?.backgroundColor}
        iconColor=${n?.iconColor}
        icon=${n?.icon}
        type=${t}
      ></wui-alertbar>
    `}onOpen(e){this.open?(this.animate([{opacity:0,transform:'scale(0.85)'},{opacity:1,transform:'scale(1)'}],{duration:150,fill:'forwards',easing:'ease'}),this.style.cssText="pointer-events: auto"):e||(this.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(0.85)'}],{duration:150,fill:'forwards',easing:'ease'}),this.style.cssText="pointer-events: none")}};u.styles=c.default,i([(0,r.state)()],u.prototype,"open",void 0),u=i([(0,t.customElement)('w3m-alertbar')],u)},4823,[3022,4802,2180,3019,4824,4827]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},4824,[4825]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiAlertBar",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),r=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]);var n,o=_r(_d[7]),s=_r(_d[8]),l=_r(_d[9]),c=(n=l)&&n.__esModule?n:{default:n},u=this&&this.__decorate||function(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s};const f={info:'info',success:'checkmark',warning:'warningCircle',error:'warning'};let p=class extends e.LitElement{constructor(){super(...arguments),this.message='',this.type='info'}render(){return e.html`
      <wui-flex
        data-type=${(0,i.ifDefined)(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${f[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){r.AlertController.close()}};p.styles=[o.resetStyles,c.default],u([(0,t.property)()],p.prototype,"message",void 0),u([(0,t.property)()],p.prototype,"type",void 0),p=u([(0,s.customElement)('wui-alertbar')],p)},4825,[3022,4802,4804,2180,4806,4807,4814,3021,3032,4826]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:o})=>o[2]};
    padding: ${({spacing:o})=>o[3]};
    border-radius: ${({borderRadius:o})=>o[6]};
    border: 1px solid ${({tokens:o})=>o.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:o})=>o.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:o})=>o.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:o})=>o.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:o})=>o.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:o})=>o.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:o})=>o.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:o})=>o.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:o})=>o.core.backgroundError};

      wui-icon {
        color: ${({tokens:o})=>o.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:o})=>o.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:o})=>o[2]};
    background-color: var(--local-icon-bg-value);
  }
`},4826,[3028]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:t})=>t[3]};
    left: ${({spacing:t})=>t[4]};
    right: ${({spacing:t})=>t[4]};
    opacity: 0;
    pointer-events: none;
  }
`},4827,[3019]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mHeader",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),o=_r(_d[3]),n=_r(_d[4]);_r(_d[5]),_r(_d[6]),_r(_d[7]),_r(_d[8]),_r(_d[9]);var r,l=_r(_d[10]),s=_r(_d[11]),c=(r=s)&&r.__esModule?r:{default:r},h=this&&this.__decorate||function(e,t,i,o){var n,r=arguments.length,l=r<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,o);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(l=(r<3?n(l):r>3?n(t,i,l):n(t,i))||l);return r>3&&l&&Object.defineProperty(t,i,l),l};const d=['SmartSessionList'],u={PayWithExchange:n.vars.tokens.theme.foregroundPrimary};function w(){const e=o.RouterController.state.data?.connector?.name,t=o.RouterController.state.data?.wallet?.name,i=o.RouterController.state.data?.network?.name,n=t??e,r=o.ConnectorController.getConnectors(),l=1===r.length&&'w3m-email'===r[0]?.id,s=o.ChainController.getAccountData()?.socialProvider;return{Connect:`Connect ${l?'Email':''} Wallet`,Create:'Create Wallet',ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:'All Wallets',ApproveTransaction:'Approve Transaction',BuyInProgress:'Buy',ConnectingExternal:n??'Connect Wallet',ConnectingWalletConnect:n??'WalletConnect',ConnectingWalletConnectBasic:'WalletConnect',ConnectingSiwe:'Sign In',Convert:'Convert',ConvertSelectToken:'Select token',ConvertPreview:'Preview Convert',Downloads:n?`Get ${n}`:'Downloads',EmailLogin:'Email Login',EmailVerifyOtp:'Confirm Email',EmailVerifyDevice:'Register Device',GetWallet:'Get a Wallet',Networks:'Choose Network',OnRampProviders:'Choose Provider',OnRampActivity:'Activity',OnRampTokenSelect:'Select Token',OnRampFiatSelect:'Select Currency',Pay:'How you pay',ProfileWallets:'Wallets',SwitchNetwork:i??'Switch Network',Transactions:'Activity',UnsupportedChain:'Switch Network',UpgradeEmailWallet:'Upgrade Your Wallet',UpdateEmailWallet:'Edit Email',UpdateEmailPrimaryOtp:'Confirm Current Email',UpdateEmailSecondaryOtp:'Confirm New Email',WhatIsABuy:'What is Buy?',RegisterAccountName:'Choose Name',RegisterAccountNameSuccess:'',WalletReceive:'Receive',WalletCompatibleNetworks:'Compatible Networks',Swap:'Swap',SwapSelectToken:'Select Token',SwapPreview:'Preview Swap',WalletSend:'Send',WalletSendPreview:'Review Send',WalletSendSelectToken:'Select Token',WalletSendConfirmed:'Confirmed',WhatIsANetwork:'What is a network?',WhatIsAWallet:'What is a Wallet?',ConnectWallets:'Connect Wallet',ConnectSocials:'All Socials',ConnectingSocial:s?s.charAt(0).toUpperCase()+s.slice(1):'Connect Social',ConnectingMultiChain:'Select Chain',ConnectingFarcaster:'Farcaster',SwitchActiveChain:'Switch Chain',SmartSessionCreated:void 0,SmartSessionList:'Smart Sessions',SIWXSignMessage:'Sign In',PayLoading:'Payment in Progress',DataCapture:'Profile',DataCaptureOtpConfirm:'Confirm Email',FundWallet:'Fund Wallet',PayWithExchange:'Deposit from Exchange',PayWithExchangeSelectAsset:'Select Asset'}}let p=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.heading=w()[o.RouterController.state.view],this.network=o.ChainController.state.activeCaipNetwork,this.networkImage=o.AssetUtil.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=o.RouterController.state.view,this.viewDirection='',this.unsubscribe.push(o.AssetController.subscribeNetworkImages(()=>{this.networkImage=o.AssetUtil.getNetworkImage(this.network)}),o.RouterController.subscribeKey('view',e=>{setTimeout(()=>{this.view=e,this.heading=w()[e]},l.ConstantsUtil.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),o.ChainController.subscribeKey('activeCaipNetwork',e=>{this.network=e,this.networkImage=o.AssetUtil.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){const t=u[o.RouterController.state.view]??n.vars.tokens.theme.backgroundPrimary;return this.style.setProperty('--local-header-background-color',t),e.html`
      <wui-flex
        .padding=${['0','4','0','4']}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){o.EventsController.sendEvent({type:'track',event:'CLICK_WALLET_HELP'}),o.RouterController.push('WhatIsAWallet')}async onClose(){await o.ModalUtil.safeClose()}rightHeaderTemplate(){const t=o.OptionsController?.state?.features?.smartSessions;return'Account'===o.RouterController.state.view&&t?e.html`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>o.RouterController.push('SmartSessionList')}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `:this.closeButtonTemplate()}closeButtonTemplate(){return e.html`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){const t=d.includes(this.view);return e.html`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${t?e.html`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){const{view:t}=o.RouterController.state,n='Connect'===t,r=o.OptionsController.state.enableEmbedded,l='ApproveTransaction'===t,s='ConnectingSiwe'===t,c='Account'===t,h=o.OptionsController.state.enableNetworkSwitch,d=l||s||n&&r;return c&&h?e.html`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${(0,i.ifDefined)(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${(0,i.ifDefined)(this.networkImage)}
      ></wui-select>`:this.showBack&&!d?e.html`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:e.html`<wui-icon-button
      data-hidden=${!n}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(o.EventsController.sendEvent({type:'track',event:'CLICK_NETWORKS'}),o.RouterController.push('Networks'))}isAllowedNetworkSwitch(){const e=o.ChainController.getAllRequestedCaipNetworks(),t=!!e&&e.length>1,i=e?.find(({id:e})=>e===this.network?.id);return t||!i}onViewChange(){const{history:e}=o.RouterController.state;let t=l.ConstantsUtil.VIEW_DIRECTION.Next;e.length<this.prevHistoryLength&&(t=l.ConstantsUtil.VIEW_DIRECTION.Prev),this.prevHistoryLength=e.length,this.viewDirection=t}async onHistoryChange(){const{history:e}=o.RouterController.state,t=this.shadowRoot?.querySelector('#dynamic');e.length>1&&!this.showBack&&t?(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards',easing:'ease'}).finished,this.showBack=!0,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:'forwards',easing:'ease'})):e.length<=1&&this.showBack&&t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards',easing:'ease'}).finished,this.showBack=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:'forwards',easing:'ease'}))}onGoBack(){o.RouterController.goBack()}};p.styles=c.default,h([(0,t.state)()],p.prototype,"heading",void 0),h([(0,t.state)()],p.prototype,"network",void 0),h([(0,t.state)()],p.prototype,"networkImage",void 0),h([(0,t.state)()],p.prototype,"showBack",void 0),h([(0,t.state)()],p.prototype,"prevHistoryLength",void 0),h([(0,t.state)()],p.prototype,"view",void 0),h([(0,t.state)()],p.prototype,"viewDirection",void 0),p=h([(0,n.customElement)('w3m-header')],p)},4828,[3022,4802,4804,2180,3019,4803,4829,4832,4835,4810,3018,4836]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},4829,[4830]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiIconButton",{enumerable:!0,get:function(){return l}});var t=_r(_d[0]),e=_r(_d[1]),i=_r(_d[2]);_r(_d[3]);var o,r=_r(_d[4]),n=_r(_d[5]),p=_r(_d[6]),s=(o=p)&&o.__esModule?o:{default:o},d=this&&this.__decorate||function(t,e,i,o){var r,n=arguments.length,p=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(r=t[s])&&(p=(n<3?r(p):n>3?r(e,i,p):r(e,i))||p);return n>3&&p&&Object.defineProperty(e,i,p),p};let l=class extends t.LitElement{constructor(){super(...arguments),this.icon='card',this.variant='primary',this.type='accent',this.size='md',this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return t.html`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,i.ifDefined)(this.iconSize)}></wui-icon>
    </button>`}};l.styles=[r.resetStyles,r.elementStyles,s.default],d([(0,e.property)()],l.prototype,"icon",void 0),d([(0,e.property)()],l.prototype,"variant",void 0),d([(0,e.property)()],l.prototype,"type",void 0),d([(0,e.property)()],l.prototype,"size",void 0),d([(0,e.property)()],l.prototype,"iconSize",void 0),d([(0,e.property)({type:Boolean})],l.prototype,"fullWidth",void 0),d([(0,e.property)({type:Boolean})],l.prototype,"disabled",void 0),l=d([(0,n.customElement)('wui-icon-button')],l)},4830,[3022,4802,4804,4806,3021,3032,4831]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:t})=>t[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:t})=>t.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:t})=>t.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:t})=>t.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:t})=>t.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:t})=>t[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:t})=>t[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:t})=>t.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:t})=>t.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:t})=>t.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`},4831,[3028]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},4832,[4833]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiSelect",{enumerable:!0,get:function(){return p}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]),_r(_d[4]);var i,r=_r(_d[5]),o=_r(_d[6]),s=_r(_d[7]),l=(i=s)&&i.__esModule?i:{default:i},n=this&&this.__decorate||function(e,t,i,r){var o,s=arguments.length,l=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(l=(s<3?o(l):s>3?o(t,i,l):o(t,i))||l);return s>3&&l&&Object.defineProperty(t,i,l),l};const c={lg:'lg-regular',md:'md-regular',sm:'sm-regular'},u={lg:'lg',md:'md',sm:'sm'};let p=class extends e.LitElement{constructor(){super(...arguments),this.imageSrc='',this.text='',this.size='lg',this.type='text-dropdown',this.disabled=!1}render(){return e.html`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){const t=c[this.size];return this.text?e.html`<wui-text color="primary" variant=${t}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return e.html`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;const t=u[this.size];return e.html` <wui-flex class="left-icon-container">
      <wui-icon size=${t} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};p.styles=[r.resetStyles,r.elementStyles,l.default],n([(0,t.property)()],p.prototype,"imageSrc",void 0),n([(0,t.property)()],p.prototype,"text",void 0),n([(0,t.property)()],p.prototype,"size",void 0),n([(0,t.property)()],p.prototype,"type",void 0),n([(0,t.property)({type:Boolean})],p.prototype,"disabled",void 0),p=n([(0,o.customElement)('wui-select')],p)},4833,[3022,4802,4806,4816,4807,3021,3032,4834]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:t})=>t[1]};
    transition: background-color ${({durations:t})=>t.lg}
      ${({easings:t})=>t['ease-out-power-2']};
    will-change: background-color;
    border-radius: ${({borderRadius:t})=>t[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:t})=>t[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    opacity: 0.5;
  }
`},4834,[3028]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},4835,[4858]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:t})=>t['ease-out-power-2']},
      slide-down-in 120ms forwards ${({easings:t})=>t['ease-out-power-2']};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:t})=>t['ease-out-power-2']},
      slide-up-in 120ms forwards ${({easings:t})=>t['ease-out-power-2']};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`},4836,[3019]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mSnackBar",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),s=_r(_d[3]);_r(_d[4]);var n,o=_r(_d[5]),i=(n=o)&&n.__esModule?n:{default:n},c=this&&this.__decorate||function(e,t,r,s){var n,o=arguments.length,i=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,s);else for(var c=e.length-1;c>=0;c--)(n=e[c])&&(i=(o<3?n(i):o>3?n(t,r,i):n(t,r))||i);return o>3&&i&&Object.defineProperty(t,r,i),i};let l=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=r.SnackController.state.open,this.unsubscribe.push(r.SnackController.subscribeKey('open',e=>{this.open=e,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(e=>e())}render(){const{message:t,variant:s}=r.SnackController.state;return e.html` <wui-snackbar message=${t} variant=${s}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:'translateX(-50%) scale(0.85)'},{opacity:1,transform:'translateX(-50%) scale(1)'}],{duration:150,fill:'forwards',easing:'ease'}),this.timeout&&clearTimeout(this.timeout),r.SnackController.state.autoClose&&(this.timeout=setTimeout(()=>r.SnackController.hide(),2500))):this.animate([{opacity:1,transform:'translateX(-50%) scale(1)'},{opacity:0,transform:'translateX(-50%) scale(0.85)'}],{duration:150,fill:'forwards',easing:'ease'})}};l.styles=i.default,c([(0,t.state)()],l.prototype,"open",void 0),l=c([(0,s.customElement)('w3m-snackbar')],l)},4837,[3022,4802,2180,3019,4838,4841]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){'default'===n||Object.prototype.hasOwnProperty.call(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})},4838,[4839]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"WuiSnackbar",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]);_r(_d[2]),_r(_d[3]);var r=_r(_d[4]),n=_r(_d[5]);_r(_d[6]);var i,s=_r(_d[7]),o=(i=s)&&i.__esModule?i:{default:i},c=this&&this.__decorate||function(e,t,r,n){var i,s=arguments.length,o=s<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,r):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,r,n);else for(var c=e.length-1;c>=0;c--)(i=e[c])&&(o=(s<3?i(o):s>3?i(t,r,o):i(t,r))||o);return s>3&&o&&Object.defineProperty(t,r,o),o};let l=class extends e.LitElement{constructor(){super(...arguments),this.message='',this.variant='success'}render(){return e.html`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return'loading'===this.variant?e.html`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:e.html`<wui-icon-box
      size="md"
      color=${{success:'success',error:'error',warning:'warning',info:'default'}[this.variant]}
      icon=${{success:'checkmark',error:'warning',warning:'warningCircle',info:'info'}[this.variant]}
    ></wui-icon-box>`}};l.styles=[r.resetStyles,o.default],c([(0,t.property)()],l.prototype,"message",void 0),c([(0,t.property)()],l.prototype,"variant",void 0),l=c([(0,n.customElement)('wui-snackbar')],l)},4839,[3022,4802,4811,4807,3021,3032,4812,4840]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:o})=>o[1]};
    padding: ${({spacing:o})=>o[2]} ${({spacing:o})=>o[3]}
      ${({spacing:o})=>o[2]} ${({spacing:o})=>o[2]};
    border-radius: ${({borderRadius:o})=>o[20]};
    background-color: ${({tokens:o})=>o.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:o})=>o.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:o})=>o.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:o})=>o[1]};
    background-color: ${({tokens:o})=>o.core.foregroundAccent010};
    border-radius: ${({borderRadius:o})=>o.round} !important;
  }
`},4840,[3028]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`},4841,[3022]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mTooltip",{enumerable:!0,get:function(){return p}});var t=_r(_d[0]),e=_r(_d[1]),o=_r(_d[2]),i=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]);var r,s=_r(_d[7]),n=(r=s)&&r.__esModule?r:{default:r},l=this&&this.__decorate||function(t,e,o,i){var r,s=arguments.length,n=s<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(n=(s<3?r(n):s>3?r(e,o,n):r(e,o))||n);return s>3&&n&&Object.defineProperty(e,o,n),n};let p=class extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.open=o.TooltipController.state.open,this.message=o.TooltipController.state.message,this.triggerRect=o.TooltipController.state.triggerRect,this.variant=o.TooltipController.state.variant,this.unsubscribe.push(o.TooltipController.subscribe(t=>{this.open=t.open,this.message=t.message,this.triggerRect=t.triggerRect,this.variant=t.variant}))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){this.dataset.variant=this.variant;const e=this.triggerRect.top,o=this.triggerRect.left;return this.style.cssText=`\n    --w3m-tooltip-top: ${e}px;\n    --w3m-tooltip-left: ${o}px;\n    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;\n    --w3m-tooltip-display: ${this.open?'flex':'none'};\n    --w3m-tooltip-opacity: ${this.open?1:0};\n    `,t.html`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};p.styles=[n.default],l([(0,e.state)()],p.prototype,"open",void 0),l([(0,e.state)()],p.prototype,"message",void 0),l([(0,e.state)()],p.prototype,"triggerRect",void 0),l([(0,e.state)()],p.prototype,"variant",void 0),p=l([(0,i.customElement)('w3m-tooltip')],p)},4842,[3022,4802,2180,3019,4803,4808,4810,4843]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing:t})=>t[3]} 10px ${({spacing:t})=>t[3]};
    border-radius: ${({borderRadius:t})=>t[3]};
    color: ${({tokens:t})=>t.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing:t})=>t[5]});
    transition: opacity ${({durations:t})=>t.lg}
      ${({easings:t})=>t['ease-out-power-2']};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations:t})=>t.xl};
    animation-timing-function: ${({easings:t})=>t['ease-out-power-2']};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens:t})=>t.theme.textPrimary};
    border: none;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`},4843,[3019]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"HelpersUtil",{enumerable:!0,get:function(){return n}});var t=r(d[0]),s=r(d[1]),o=r(d[2]);const n={getTabsByNamespace:n=>Boolean(n)&&n===t.ConstantsUtil.CHAIN.EVM?!1===s.OptionsController.state.remoteFeatures?.activity?o.ConstantsUtil.ACCOUNT_TABS.filter(t=>'Activity'!==t.label):o.ConstantsUtil.ACCOUNT_TABS:[],isValidReownName:t=>/^[a-zA-Z0-9]+$/gu.test(t),isValidEmail:t=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(t),validateReownName:t=>t.replace(/\^/gu,'').toLowerCase().replace(/[^a-zA-Z0-9]/gu,''),hasFooter(){const t=s.RouterController.state.view;if(o.ConstantsUtil.VIEWS_WITH_LEGAL_FOOTER.includes(t)){const{termsConditionsUrl:t,privacyPolicyUrl:o}=s.OptionsController.state,n=s.OptionsController.state.features?.legalCheckbox;return!(!t&&!o||n)}return o.ConstantsUtil.VIEWS_WITH_DEFAULT_FOOTER.includes(t)}}},4844,[2158,2180,3018]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mFooter",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),o=_r(_d[3]);_r(_d[4]),_r(_d[5]);var s,i=_r(_d[6]),n=_r(_d[7]),l=(s=n)&&s.__esModule?s:{default:s},c=this&&this.__decorate||function(e,t,r,o){var s,i=arguments.length,n=i<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,o);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(n=(i<3?s(n):i>3?s(t,r,n):s(t,r))||n);return i>3&&n&&Object.defineProperty(t,r,n),n};let u=class extends e.LitElement{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status='hide',this.view=r.RouterController.state.view}firstUpdated(){this.status=i.HelpersUtil.hasFooter()?'show':'hide',this.unsubscribe.push(r.RouterController.subscribeKey('view',e=>{if(this.view=e,this.status=i.HelpersUtil.hasFooter()?'show':'hide','hide'===this.status){document.documentElement.style.setProperty('--apkt-footer-height','0px')}})),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)if(t.target===this.getWrapper()){const e=`${t.contentRect.height}px`;document.documentElement.style.setProperty('--apkt-footer-height',e)}}),this.resizeObserver.observe(this.getWrapper())}render(){return e.html`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return i.HelpersUtil.hasFooter()?e.html` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case'Networks':return this.templateNetworksFooter();case'Connect':case'ConnectWallets':case'OnRampFiatSelect':case'OnRampTokenSelect':return e.html`<w3m-legal-footer></w3m-legal-footer>`;case'OnRampProviders':return e.html`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return e.html` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){r.EventsController.sendEvent({type:'track',event:'CLICK_NETWORK_HELP'}),r.RouterController.push('WhatIsANetwork')}getWrapper(){return this.shadowRoot?.querySelector('div.container')}};u.styles=[l.default],c([(0,t.state)()],u.prototype,"status",void 0),c([(0,t.state)()],u.prototype,"view",void 0),u=c([(0,o.customElement)('w3m-footer')],u)},4845,[3022,4802,2180,3019,4846,4848,4844,4850]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mLegalFooter",{enumerable:!0,get:function(){return u}});var e=_r(_d[0]),t=_r(_d[1]),r=_r(_d[2]),n=_r(_d[3]);_r(_d[4]),_r(_d[5]),_r(_d[6]);var o,l=_r(_d[7]),i=(o=l)&&o.__esModule?o:{default:o},s=this&&this.__decorate||function(e,t,r,n){var o,l=arguments.length,i=l<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,r):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,n);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(l<3?o(i):l>3?o(t,r,i):o(t,r))||i);return l>3&&i&&Object.defineProperty(t,r,i),i};let u=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=r.OptionsController.state.remoteFeatures,this.unsubscribe.push(r.OptionsController.subscribeKey('remoteFeatures',e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{termsConditionsUrl:t,privacyPolicyUrl:n}=r.OptionsController.state,o=r.OptionsController.state.features?.legalCheckbox;return!t&&!n||o?e.html`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `:e.html`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${['4','3','3','3']} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}andTemplate(){const{termsConditionsUrl:e,privacyPolicyUrl:t}=r.OptionsController.state;return e&&t?'and':''}termsTemplate(){const{termsConditionsUrl:t}=r.OptionsController.state;return t?e.html`<a href=${t} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){const{privacyPolicyUrl:t}=r.OptionsController.state;return t?e.html`<a href=${t} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(t=!1){return this.remoteFeatures?.reownBranding?t?e.html`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:e.html`<wui-ux-by-reown></wui-ux-by-reown>`:null}};u.styles=[i.default],s([(0,t.state)()],u.prototype,"remoteFeatures",void 0),u=s([(0,n.customElement)('w3m-legal-footer')],u)},4846,[3022,4802,2180,3019,4803,4810,4815,4847]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:t})=>t[3]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:t})=>t.core.textAccentPrimary};
    font-weight: 500;
  }
`},4847,[3019]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mOnRampProvidersFooter",{enumerable:!0,get:function(){return c}});var e=_r(_d[0]),t=_r(_d[1]),o=_r(_d[2]);_r(_d[3]),_r(_d[4]),_r(_d[5]),_r(_d[6]);var r,n=_r(_d[7]),i=_r(_d[8]),l=(r=i)&&r.__esModule?r:{default:r},s=this&&this.__decorate||function(e,t,o,r){var n,i=arguments.length,l=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(l=(i<3?n(l):i>3?n(t,o,l):n(t,o))||l);return i>3&&l&&Object.defineProperty(t,o,l),l};let c=class extends e.LitElement{render(){const{termsConditionsUrl:o,privacyPolicyUrl:r}=t.OptionsController.state;return o||r?e.html`
      <wui-flex
        .padding=${['4','3','3','3']}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `:null}howDoesItWorkTemplate(){return e.html` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){t.EventsController.sendEvent({type:'track',event:'SELECT_WHAT_IS_A_BUY',properties:{isSmartAccount:(0,t.getPreferredAccountType)(t.ChainController.state.activeChain)===n.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),t.RouterController.push('WhatIsABuy')}};c.styles=[l.default],c=s([(0,o.customElement)('w3m-onramp-providers-footer')],c)},4848,[3022,2180,3019,4803,4808,4809,4810,2201,4849]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css``},4849,[3022]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:t})=>t['ease-out-power-2']};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:t})=>t['ease-out-power-2']};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`},4850,[3019]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mRouter",{enumerable:!0,get:function(){return l}});var e=_r(_d[0]),t=_r(_d[1]),i=_r(_d[2]),n=_r(_d[3]);_r(_d[4]);var w,r=_r(_d[5]),s=(w=r)&&w.__esModule?w:{default:w},c=this&&this.__decorate||function(e,t,i,n){var w,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var c=e.length-1;c>=0;c--)(w=e[c])&&(s=(r<3?w(s):r>3?w(t,i,s):w(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};let l=class extends e.LitElement{constructor(){super(),this.unsubscribe=[],this.viewState=i.RouterController.state.view,this.history=i.RouterController.state.history.join(','),this.unsubscribe.push(i.RouterController.subscribeKey('view',()=>{this.history=i.RouterController.state.history.join(','),document.documentElement.style.setProperty('--apkt-duration-dynamic','var(--apkt-durations-lg)')}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),document.documentElement.style.setProperty('--apkt-duration-dynamic','0s')}render(){return e.html`${this.templatePageContainer()}`}templatePageContainer(){return e.html`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=i.RouterController.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(t){switch(t){case'AccountSettings':return e.html`<w3m-account-settings-view></w3m-account-settings-view>`;case'Account':return e.html`<w3m-account-view></w3m-account-view>`;case'AllWallets':return e.html`<w3m-all-wallets-view></w3m-all-wallets-view>`;case'ApproveTransaction':return e.html`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case'BuyInProgress':return e.html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case'ChooseAccountName':return e.html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case'Connect':default:return e.html`<w3m-connect-view></w3m-connect-view>`;case'Create':return e.html`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case'ConnectingWalletConnect':return e.html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case'ConnectingWalletConnectBasic':return e.html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case'ConnectingExternal':return e.html`<w3m-connecting-external-view></w3m-connecting-external-view>`;case'ConnectingSiwe':return e.html`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case'ConnectWallets':return e.html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case'ConnectSocials':return e.html`<w3m-connect-socials-view></w3m-connect-socials-view>`;case'ConnectingSocial':return e.html`<w3m-connecting-social-view></w3m-connecting-social-view>`;case'DataCapture':return e.html`<w3m-data-capture-view></w3m-data-capture-view>`;case'DataCaptureOtpConfirm':return e.html`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case'Downloads':return e.html`<w3m-downloads-view></w3m-downloads-view>`;case'EmailLogin':return e.html`<w3m-email-login-view></w3m-email-login-view>`;case'EmailVerifyOtp':return e.html`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case'EmailVerifyDevice':return e.html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case'GetWallet':return e.html`<w3m-get-wallet-view></w3m-get-wallet-view>`;case'Networks':return e.html`<w3m-networks-view></w3m-networks-view>`;case'SwitchNetwork':return e.html`<w3m-network-switch-view></w3m-network-switch-view>`;case'ProfileWallets':return e.html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case'Transactions':return e.html`<w3m-transactions-view></w3m-transactions-view>`;case'OnRampProviders':return e.html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case'OnRampTokenSelect':return e.html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case'OnRampFiatSelect':return e.html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case'UpgradeEmailWallet':return e.html`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case'UpdateEmailWallet':return e.html`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case'UpdateEmailPrimaryOtp':return e.html`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case'UpdateEmailSecondaryOtp':return e.html`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case'UnsupportedChain':return e.html`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case'Swap':return e.html`<w3m-swap-view></w3m-swap-view>`;case'SwapSelectToken':return e.html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case'SwapPreview':return e.html`<w3m-swap-preview-view></w3m-swap-preview-view>`;case'WalletSend':return e.html`<w3m-wallet-send-view></w3m-wallet-send-view>`;case'WalletSendSelectToken':return e.html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case'WalletSendPreview':return e.html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case'WalletSendConfirmed':return e.html`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case'WhatIsABuy':return e.html`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case'WalletReceive':return e.html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case'WalletCompatibleNetworks':return e.html`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case'WhatIsAWallet':return e.html`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case'ConnectingMultiChain':return e.html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case'WhatIsANetwork':return e.html`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case'ConnectingFarcaster':return e.html`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case'SwitchActiveChain':return e.html`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case'RegisterAccountName':return e.html`<w3m-register-account-name-view></w3m-register-account-name-view>`;case'RegisterAccountNameSuccess':return e.html`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case'SmartSessionCreated':return e.html`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case'SmartSessionList':return e.html`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case'SIWXSignMessage':return e.html`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case'Pay':return e.html`<w3m-pay-view></w3m-pay-view>`;case'PayLoading':return e.html`<w3m-pay-loading-view></w3m-pay-loading-view>`;case'FundWallet':return e.html`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case'PayWithExchange':return e.html`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case'PayWithExchangeSelectAsset':return e.html`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`}}};l.styles=[s.default],c([(0,t.state)()],l.prototype,"viewState",void 0),c([(0,t.state)()],l.prototype,"history",void 0),l=c([(0,n.customElement)('w3m-router')],l)},4851,[3022,4802,2180,3019,4845,4852]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    display: block;
    width: inherit;
  }
`},4852,[3019]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return o}});var o=r(d[0]).css`
  :host {
    z-index: ${({tokens:o})=>o.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:o})=>o.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']},
      backdrop-filter ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-2']},
      border-radius ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-1']},
      background-color ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-1']},
      box-shadow ${({durations:o})=>o.lg}
        ${({easings:o})=>o['ease-out-power-1']};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:o})=>o.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:o})=>o.lg}
      ${({easings:o})=>o['ease-out-power-2']};
    transition-delay: ${({durations:o})=>o.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:o})=>o.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:o})=>o.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:o})=>o['ease-out-power-2']};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:o})=>o['ease-out-power-2']};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:o})=>o.lg} ${({easings:o})=>o['ease-out-power-2']},
      w3m-shake ${({durations:o})=>o.xl}
        ${({easings:o})=>o['ease-out-power-2']};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:o})=>o['ease-out-power-2']};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:o})=>o.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:o})=>o.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:o})=>o.theme.backgroundPrimary};
    }
  }
`},4853,[3019]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mListWallet",{enumerable:!0,get:function(){return d}});var e=_r(_d[0]),t=_r(_d[1]),s=_r(_d[2]),i=_r(_d[3]),r=_r(_d[4]);_r(_d[5]);var o,n=_r(_d[6]),l=(o=n)&&o.__esModule?o:{default:o},p=this&&this.__decorate||function(e,t,s,i){var r,o=arguments.length,n=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,s,i);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(n=(o<3?r(n):o>3?r(t,s,n):r(t,s))||n);return o>3&&n&&Object.defineProperty(t,s,n),n};let d=class extends e.LitElement{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc='',this.name='',this.size='md',this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor='accent-100',this.rdnsId='',this.displayIndex=void 0,this.walletRank=void 0}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(e){super.updated(e),(e.has('name')||e.has('imageSrc')||e.has('walletRank'))&&(this.hasImpressionSent=!1);e.has('walletRank')&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(e=>{e.forEach(e=>{!e.isIntersecting||this.loading||this.hasImpressionSent||this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=void 0)}sendImpressionEvent(){this.name&&!this.hasImpressionSent&&this.walletRank&&(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&i.EventsController.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:i.RouterController.state.view,displayIndex:this.displayIndex}))}render(){return e.html`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${(0,s.ifDefined)(this.imageSrc)}
        name=${this.name}
        size=${(0,s.ifDefined)(this.size)}
        tagLabel=${(0,s.ifDefined)(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
      ></wui-list-wallet>
    `}};d.styles=l.default,p([(0,t.property)({type:Array})],d.prototype,"walletImages",void 0),p([(0,t.property)()],d.prototype,"imageSrc",void 0),p([(0,t.property)()],d.prototype,"name",void 0),p([(0,t.property)()],d.prototype,"size",void 0),p([(0,t.property)()],d.prototype,"tagLabel",void 0),p([(0,t.property)()],d.prototype,"tagVariant",void 0),p([(0,t.property)()],d.prototype,"walletIcon",void 0),p([(0,t.property)()],d.prototype,"tabIdx",void 0),p([(0,t.property)({type:Boolean})],d.prototype,"disabled",void 0),p([(0,t.property)({type:Boolean})],d.prototype,"showAllWallets",void 0),p([(0,t.property)({type:Boolean})],d.prototype,"loading",void 0),p([(0,t.property)({type:String})],d.prototype,"loadingSpinnerColor",void 0),p([(0,t.property)()],d.prototype,"rdnsId",void 0),p([(0,t.property)()],d.prototype,"displayIndex",void 0),p([(0,t.property)()],d.prototype,"walletRank",void 0),d=p([(0,r.customElement)('w3m-list-wallet')],d)},4854,[3022,4802,4804,2180,3019,4805,4855]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    width: 100%;
  }
`},4855,[3019]);
__d(function(g,_r,_i,a,m,_e,_d){"use strict";Object.defineProperty(_e,'__esModule',{value:!0}),Object.defineProperty(_e,"W3mRouterContainer",{enumerable:!0,get:function(){return p}});var t,e=_r(_d[0]),i=_r(_d[1]),r=_r(_d[2]),o=_r(_d[3]),s=_r(_d[4]),n=_r(_d[5]),h=(t=n)&&t.__esModule?t:{default:t},l=this&&this.__decorate||function(t,e,i,r){var o,s=arguments.length,n=s<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,r);else for(var h=t.length-1;h>=0;h--)(o=t[h])&&(n=(s<3?o(n):s>3?o(e,i,n):o(e,i))||n);return s>3&&n&&Object.defineProperty(e,i,n),n};let p=class extends e.LitElement{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration='0.15s',this.transitionFunction='',this.history='',this.view='',this.setView=void 0,this.viewDirection='',this.historyState='',this.previousHeight='0px',this.mobileFullScreen=o.OptionsController.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(t){if(t.has('history')){const t=this.history;''!==this.historyState&&this.historyState!==t&&this.onViewChange(t)}t.has('transitionDuration')&&this.style.setProperty('--local-duration',this.transitionDuration),t.has('transitionFunction')&&this.style.setProperty('--local-transition',this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty('--local-transition',this.transitionFunction),this.style.setProperty('--local-duration',this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(t=>{for(const e of t)if(e.target===this.getWrapper()){let t=e.contentRect.height;const i=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--apkt-footer-height')||'0');if(this.mobileFullScreen){t=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-i,this.style.setProperty('--local-border-bottom-radius','0px')}else{t=t+i,this.style.setProperty('--local-border-bottom-radius',i?'var(--apkt-borderRadius-5)':'0px')}this.style.setProperty('--local-container-height',`${t}px`),'0px'!==this.previousHeight&&this.style.setProperty('--local-duration-height',this.transitionDuration),this.previousHeight=`${t}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener('resize',this.onViewportResize),window.visualViewport?.addEventListener('resize',this.onViewportResize)}disconnectedCallback(){const t=this.getWrapper();t&&this.resizeObserver&&this.resizeObserver.unobserve(t),window.removeEventListener('resize',this.onViewportResize),window.visualViewport?.removeEventListener('resize',this.onViewportResize)}render(){return e.html`
      <div class="container" data-mobile-fullscreen="${(0,r.ifDefined)(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${(0,r.ifDefined)(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(t){const e=t.split(',').filter(Boolean),i=this.historyState.split(',').filter(Boolean),r=i.length,o=e.length,n=e[e.length-1]||'',h=s.UiHelperUtil.cssDurationToNumber(this.transitionDuration);let l='';o>r?l='next':o<r?l='prev':o===r&&e[o-1]!==i[r-1]&&(l='next'),this.viewDirection=`${l}-${n}`,setTimeout(()=>{this.historyState=t,this.setView?.(n)},h),setTimeout(()=>{this.viewDirection=''},2*h)}getWrapper(){return this.shadowRoot?.querySelector('div.page')}updateContainerHeight(){const t=this.getWrapper();if(!t)return;const e=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--apkt-footer-height')||'0');let i=0;if(this.mobileFullScreen){i=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-e,this.style.setProperty('--local-border-bottom-radius','0px')}else i=t.getBoundingClientRect().height+e,this.style.setProperty('--local-border-bottom-radius',e?'var(--apkt-borderRadius-5)':'0px');this.style.setProperty('--local-container-height',`${i}px`),'0px'!==this.previousHeight&&this.style.setProperty('--local-duration-height',this.transitionDuration),this.previousHeight=`${i}px`}getHeaderHeight(){return 60}};p.styles=[h.default],l([(0,i.property)({type:String})],p.prototype,"transitionDuration",void 0),l([(0,i.property)({type:String})],p.prototype,"transitionFunction",void 0),l([(0,i.property)({type:String})],p.prototype,"history",void 0),l([(0,i.property)({type:String})],p.prototype,"view",void 0),l([(0,i.property)({attribute:!1})],p.prototype,"setView",void 0),l([(0,i.state)()],p.prototype,"viewDirection",void 0),l([(0,i.state)()],p.prototype,"historyState",void 0),l([(0,i.state)()],p.prototype,"previousHeight",void 0),l([(0,i.state)()],p.prototype,"mobileFullScreen",void 0),p=l([(0,s.customElement)('w3m-router-container')],p)},4856,[3022,4802,4804,2180,3019,4857]);
__d(function(g,r,i,a,m,e,d){"use strict";Object.defineProperty(e,'__esModule',{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t}});var t=r(d[0]).css`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:t})=>t.lg};
    --local-transition: ${({easings:t})=>t['ease-out-power-2']};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:t})=>t.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:t})=>t.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`},4857,[3019]);