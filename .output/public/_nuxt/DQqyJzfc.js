import{K as Zt,E as qt,y as ae,e as ne,f as te,p as Y,ae as la}from"./C-GVb6R3.js";import{u as ee}from"./B1VWDx8c.js";const re=["a[href]","button:not([disabled])","input:not([disabled])","select:not([disabled])","textarea:not([disabled])",'[tabindex]:not([tabindex="-1"])'].join(",");function rs(a,n,t){let e=null;function r(){return a.value?[...a.value.querySelectorAll(re)].filter(i=>!i.hidden&&i.offsetParent!==null):[]}function o(i){if(document.body.classList.contains("guided-tour-active"))return;if(i.key==="Escape"){i.preventDefault(),n();return}if(i.key!=="Tab")return;const s=r();if(s.length===0){i.preventDefault(),a.value?.focus();return}const l=s[0],u=s[s.length-1];i.shiftKey&&document.activeElement===l?(i.preventDefault(),u.focus()):!i.shiftKey&&document.activeElement===u&&(i.preventDefault(),l.focus())}Zt(()=>{e=document.activeElement instanceof HTMLElement?document.activeElement:null,document.body.classList.add("dialog-open"),document.addEventListener("keydown",o),qt(()=>(t?.value??r()[0]??a.value)?.focus())}),ae(()=>{document.body.classList.remove("dialog-open"),document.removeEventListener("keydown",o),e?.focus()})}var is={prefix:"fas",iconName:"stop",icon:[448,512,[9209],"f04d","M64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32z"]},os={prefix:"fas",iconName:"print",icon:[512,512,[128424,128438,9113],"f02f","M64 64C64 28.7 92.7 0 128 0L341.5 0c17 0 33.3 6.7 45.3 18.7l42.5 42.5c12 12 18.7 28.3 18.7 45.3l0 37.5-384 0 0-80zM0 256c0-35.3 28.7-64 64-64l384 0c35.3 0 64 28.7 64 64l0 96c0 17.7-14.3 32-32 32l-32 0 0 64c0 35.3-28.7 64-64 64l-256 0c-35.3 0-64-28.7-64-64l0-64-32 0c-17.7 0-32-14.3-32-32l0-96zM128 416l0 32 256 0 0-96-256 0 0 64zM456 272a24 24 0 1 0 -48 0 24 24 0 1 0 48 0z"]},ss={prefix:"fas",iconName:"arrow-up-from-bracket",icon:[448,512,[],"e09a","M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"]},ls={prefix:"fas",iconName:"bullhorn",icon:[512,512,[128226,128363],"f0a1","M461.2 18.9C472.7 24 480 35.4 480 48l0 416c0 12.6-7.3 24-18.8 29.1s-24.8 3.2-34.3-5.1l-46.6-40.7c-43.6-38.1-98.7-60.3-156.4-63l0 95.7c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-96C57.3 384 0 326.7 0 256S57.3 128 128 128l84.5 0c61.8-.2 121.4-22.7 167.9-63.3l46.6-40.7c9.4-8.3 22.9-10.2 34.3-5.1zM224 320l0 .2c70.3 2.7 137.8 28.5 192 73.4l0-275.3c-54.2 44.9-121.7 70.7-192 73.4L224 320z"]},fs={prefix:"fas",iconName:"volume-high",icon:[640,512,[128266,"volume-up"],"f028","M533.6 32.5c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C557.5 113.8 592 180.8 592 256s-34.5 142.2-88.7 186.3c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5C598.5 426.7 640 346.2 640 256S598.5 85.2 533.6 32.5zM473.1 107c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C475.3 170.7 496 210.9 496 256s-20.7 85.3-53.2 111.8c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5c43.2-35.2 70.9-88.9 70.9-149s-27.7-113.8-70.9-149zm-60.5 74.5c-10.3-8.4-25.4-6.8-33.8 3.5s-6.8 25.4 3.5 33.8C393.1 227.6 400 241 400 256s-6.9 28.4-17.7 37.3c-10.3 8.4-11.8 23.5-3.5 33.8s23.5 11.8 33.8 3.5C434.1 312.9 448 286.1 448 256s-13.9-56.9-35.4-74.5zM80 352l48 0 134.1 119.2c6.4 5.7 14.6 8.8 23.1 8.8 19.2 0 34.8-15.6 34.8-34.8l0-378.4c0-19.2-15.6-34.8-34.8-34.8-8.5 0-16.7 3.1-23.1 8.8L128 160 80 160c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48z"]};function Oa(a,n){(n==null||n>a.length)&&(n=a.length);for(var t=0,e=Array(n);t<n;t++)e[t]=a[t];return e}function ie(a){if(Array.isArray(a))return a}function oe(a){if(Array.isArray(a))return Oa(a)}function se(a,n){if(!(a instanceof n))throw new TypeError("Cannot call a class as a function")}function le(a,n){for(var t=0;t<n.length;t++){var e=n[t];e.enumerable=e.enumerable||!1,e.configurable=!0,"value"in e&&(e.writable=!0),Object.defineProperty(a,Ln(e.key),e)}}function fe(a,n,t){return n&&le(a.prototype,n),Object.defineProperty(a,"prototype",{writable:!1}),a}function fa(a,n){var t=typeof Symbol<"u"&&a[Symbol.iterator]||a["@@iterator"];if(!t){if(Array.isArray(a)||(t=Ha(a))||n){t&&(a=t);var e=0,r=function(){};return{s:r,n:function(){return e>=a.length?{done:!0}:{done:!1,value:a[e++]}},e:function(l){throw l},f:r}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var o,i=!0,s=!1;return{s:function(){t=t.call(a)},n:function(){var l=t.next();return i=l.done,l},e:function(l){s=!0,o=l},f:function(){try{i||t.return==null||t.return()}finally{if(s)throw o}}}}function v(a,n,t){return(n=Ln(n))in a?Object.defineProperty(a,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):a[n]=t,a}function ue(a){if(typeof Symbol<"u"&&a[Symbol.iterator]!=null||a["@@iterator"]!=null)return Array.from(a)}function ce(a,n){var t=a==null?null:typeof Symbol<"u"&&a[Symbol.iterator]||a["@@iterator"];if(t!=null){var e,r,o,i,s=[],l=!0,u=!1;try{if(o=(t=t.call(a)).next,n===0){if(Object(t)!==t)return;l=!1}else for(;!(l=(e=o.call(t)).done)&&(s.push(e.value),s.length!==n);l=!0);}catch(m){u=!0,r=m}finally{try{if(!l&&t.return!=null&&(i=t.return(),Object(i)!==i))return}finally{if(u)throw r}}return s}}function de(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function me(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function rn(a,n){var t=Object.keys(a);if(Object.getOwnPropertySymbols){var e=Object.getOwnPropertySymbols(a);n&&(e=e.filter(function(r){return Object.getOwnPropertyDescriptor(a,r).enumerable})),t.push.apply(t,e)}return t}function f(a){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?rn(Object(t),!0).forEach(function(e){v(a,e,t[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(t)):rn(Object(t)).forEach(function(e){Object.defineProperty(a,e,Object.getOwnPropertyDescriptor(t,e))})}return a}function pa(a,n){return ie(a)||ce(a,n)||Ha(a,n)||de()}function j(a){return oe(a)||ue(a)||Ha(a)||me()}function ge(a,n){if(typeof a!="object"||!a)return a;var t=a[Symbol.toPrimitive];if(t!==void 0){var e=t.call(a,n);if(typeof e!="object")return e;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(a)}function Ln(a){var n=ge(a,"string");return typeof n=="symbol"?n:n+""}function da(a){"@babel/helpers - typeof";return da=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},da(a)}function Ha(a,n){if(a){if(typeof a=="string")return Oa(a,n);var t={}.toString.call(a).slice(8,-1);return t==="Object"&&a.constructor&&(t=a.constructor.name),t==="Map"||t==="Set"?Array.from(a):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?Oa(a,n):void 0}}var on=function(){},Ga={},Rn={},Wn=null,Un={mark:on,measure:on};try{typeof window<"u"&&(Ga=window),typeof document<"u"&&(Rn=document),typeof MutationObserver<"u"&&(Wn=MutationObserver),typeof performance<"u"&&(Un=performance)}catch{}var ve=Ga.navigator||{},sn=ve.userAgent,ln=sn===void 0?"":sn,M=Ga,S=Rn,fn=Wn,ra=Un;M.document;var $=!!S.documentElement&&!!S.head&&typeof S.addEventListener=="function"&&typeof S.createElement=="function",Bn=~ln.indexOf("MSIE")||~ln.indexOf("Trident/"),ia,pe=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|gt|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt|sldr|slpdr|pr|ms|vs)?[\-\ ]/,be=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Graphite|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Slab Duo|Slab Press Duo|Pixel|Mosaic|Vellum|Whiteboard)?.*/i,Yn={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},"slab-duo":{"fa-regular":"regular",fasldr:"regular"},"slab-press-duo":{"fa-regular":"regular",faslpdr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},vellum:{"fa-solid":"solid",favs:"solid"},pixel:{"fa-regular":"regular",fapr:"regular"},mosaic:{"fa-solid":"solid",fams:"solid"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},graphite:{"fa-thin":"thin",fagt:"thin"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},he={GROUP:"duotone-group",PRIMARY:"primary",SECONDARY:"secondary"},Xn=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],F="classic",na="duotone",Hn="sharp",Gn="sharp-duotone",Kn="chisel",Vn="etch",Jn="graphite",Qn="jelly",Zn="jelly-duo",qn="jelly-fill",at="mosaic",nt="notdog",tt="notdog-duo",et="pixel",rt="slab",it="slab-duo",ot="slab-press",st="slab-press-duo",lt="thumbprint",ft="utility",ut="utility-duo",ct="utility-fill",dt="vellum",mt="whiteboard",ye="Classic",xe="Duotone",we="Sharp",Se="Sharp Duotone",Ae="Chisel",ke="Etch",Pe="Graphite",Ie="Jelly",ze="Jelly Duo",Fe="Jelly Fill",Oe="Mosaic",Ee="Notdog",je="Notdog Duo",Ce="Pixel",Ne="Slab",Te="Slab Duo",_e="Slab Press",$e="Slab Press Duo",Me="Thumbprint",De="Utility",Le="Utility Duo",Re="Utility Fill",We="Vellum",Ue="Whiteboard",gt=[F,na,Hn,Gn,Kn,Vn,Jn,Qn,Zn,qn,at,nt,tt,et,rt,it,ot,st,lt,ft,ut,ct,dt,mt];ia={},v(v(v(v(v(v(v(v(v(v(ia,F,ye),na,xe),Hn,we),Gn,Se),Kn,Ae),Vn,ke),Jn,Pe),Qn,Ie),Zn,ze),qn,Fe),v(v(v(v(v(v(v(v(v(v(ia,at,Oe),nt,Ee),tt,je),et,Ce),rt,Ne),it,Te),ot,_e),st,$e),lt,Me),ft,De),v(v(v(v(ia,ut,Le),ct,Re),dt,We),mt,Ue);var Be={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},"slab-duo":{400:"fasldr"},"slab-press-duo":{400:"faslpdr"},vellum:{900:"favs"},mosaic:{900:"fams"},pixel:{400:"fapr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},graphite:{100:"fagt"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},Ye={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Slab Duo":{400:"fasldr",normal:"fasldr"},"Font Awesome 7 Slab Press Duo":{400:"faslpdr",normal:"faslpdr"},"Font Awesome 7 Pixel":{400:"fapr",normal:"fapr"},"Font Awesome 7 Mosaic":{900:"fams",normal:"fams"},"Font Awesome 7 Vellum":{900:"favs",normal:"favs"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Graphite":{100:"fagt",normal:"fagt"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},Xe=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["graphite",{defaultShortPrefixId:"fagt",defaultStyleId:"thin",styleIds:["thin"],futureStyleIds:[],defaultFontWeight:100}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["mosaic",{defaultShortPrefixId:"fams",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["pixel",{defaultShortPrefixId:"fapr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-duo",{defaultShortPrefixId:"fasldr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press-duo",{defaultShortPrefixId:"faslpdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["vellum",{defaultShortPrefixId:"favs",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),He={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},graphite:{thin:"fagt"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},mosaic:{solid:"fams"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},pixel:{regular:"fapr"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-duo":{regular:"fasldr"},"slab-press":{regular:"faslpr"},"slab-press-duo":{regular:"faslpdr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},vellum:{solid:"favs"},whiteboard:{semibold:"fawsb"}},vt=["fak","fa-kit","fakd","fa-kit-duotone"],un={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},Ge=["kit"],Ke="kit",Ve="kit-duotone",Je="Kit",Qe="Kit Duotone";v(v({},Ke,Je),Ve,Qe);var Ze={kit:{"fa-kit":"fak"}},qe={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},ar={kit:{fak:"fa-kit"}},cn={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},oa,sa={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},nr=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],tr="classic",er="duotone",rr="sharp",ir="sharp-duotone",or="chisel",sr="etch",lr="graphite",fr="jelly",ur="jelly-duo",cr="jelly-fill",dr="mosaic",mr="notdog",gr="notdog-duo",vr="pixel",pr="slab",br="slab-duo",hr="slab-press",yr="slab-press-duo",xr="thumbprint",wr="utility",Sr="utility-duo",Ar="utility-fill",kr="vellum",Pr="whiteboard",Ir="Classic",zr="Duotone",Fr="Sharp",Or="Sharp Duotone",Er="Chisel",jr="Etch",Cr="Graphite",Nr="Jelly",Tr="Jelly Duo",_r="Jelly Fill",$r="Mosaic",Mr="Notdog",Dr="Notdog Duo",Lr="Pixel",Rr="Slab",Wr="Slab Duo",Ur="Slab Press",Br="Slab Press Duo",Yr="Thumbprint",Xr="Utility",Hr="Utility Duo",Gr="Utility Fill",Kr="Vellum",Vr="Whiteboard";oa={},v(v(v(v(v(v(v(v(v(v(oa,tr,Ir),er,zr),rr,Fr),ir,Or),or,Er),sr,jr),lr,Cr),fr,Nr),ur,Tr),cr,_r),v(v(v(v(v(v(v(v(v(v(oa,dr,$r),mr,Mr),gr,Dr),vr,Lr),pr,Rr),br,Wr),hr,Ur),yr,Br),xr,Yr),wr,Xr),v(v(v(v(oa,Sr,Hr),Ar,Gr),kr,Kr),Pr,Vr);var Jr="kit",Qr="kit-duotone",Zr="Kit",qr="Kit Duotone";v(v({},Jr,Zr),Qr,qr);var ai={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},"slab-duo":{"fa-regular":"fasldr"},"slab-press-duo":{"fa-regular":"faslpdr"},pixel:{"fa-regular":"fapr"},mosaic:{"fa-solid":"fams"},vellum:{"fa-solid":"favs"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},graphite:{"fa-thin":"fagt"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},ni={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],"slab-duo":["fasldr"],"slab-press-duo":["faslpdr"],pixel:["fapr"],mosaic:["fams"],vellum:["favs"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],graphite:["fagt"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},Ea={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},"slab-duo":{fasldr:"fa-regular"},"slab-press-duo":{faslpdr:"fa-regular"},pixel:{fapr:"fa-regular"},mosaic:{fams:"fa-solid"},vellum:{favs:"fa-solid"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},graphite:{fagt:"fa-thin"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},ti=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],pt=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fasldr","faslpdr","fapr","fams","favs","fawsb","fatl","fans","fands","faes","fagt","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(nr,ti),ei=["solid","regular","light","thin","duotone","brands","semibold"],bt=[1,2,3,4,5,6,7,8,9,10],ri=bt.concat([11,12,13,14,15,16,17,18,19,20]),ii=["aw","fw","pull-left","pull-right"],oi=[].concat(j(Object.keys(ni)),ei,ii,["2xs","xs","sm","lg","xl","2xl","beat","beat-fade","border","bounce","buzz","canvas-square","canvas-roomy","fade","flip-360","flip-both","flip-horizontal","flip-vertical","flip","float","inverse","jello","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","spin-snap","spin-snap-4","spin-snap-8","stack-1x","stack-2x","stack","swing","ul","wag","width-auto","width-fixed",sa.GROUP,sa.SWAP_OPACITY,sa.PRIMARY,sa.SECONDARY]).concat(bt.map(function(a){return"".concat(a,"x")})).concat(ri.map(function(a){return"w-".concat(a)})),si={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},T="___FONT_AWESOME___",ja=16,ht="fa",yt="svg-inline--fa",U="data-fa-i2svg",Ca="data-fa-pseudo-element",li="data-fa-pseudo-element-pending",Ka="data-prefix",Va="data-icon",dn="fontawesome-i2svg",fi="async",ui=["HTML","HEAD","STYLE","SCRIPT"],xt=["::before","::after",":before",":after"],wt=(function(){try{return!0}catch{return!1}})();function ta(a){return new Proxy(a,{get:function(t,e){return e in t?t[e]:t[F]}})}var St=f({},Yn);St[F]=f(f(f(f({},{"fa-duotone":"duotone"}),Yn[F]),un.kit),un["kit-duotone"]);var ci=ta(St),Na=f({},He);Na[F]=f(f(f(f({},{duotone:"fad"}),Na[F]),cn.kit),cn["kit-duotone"]);var mn=ta(Na),Ta=f({},Ea);Ta[F]=f(f({},Ta[F]),ar.kit);var Ja=ta(Ta),_a=f({},ai);_a[F]=f(f({},_a[F]),Ze.kit);ta(_a);var di=pe,At="fa-layers-text",mi=be,gi=f({},Be);ta(gi);var vi=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],Sa=he,pi=[].concat(j(Ge),j(oi)),Z=M.FontAwesomeConfig||{};function bi(a){var n=S.querySelector("script["+a+"]");if(n)return n.getAttribute(a)}function hi(a){return a===""?!0:a==="false"?!1:a==="true"?!0:a}if(S&&typeof S.querySelector=="function"){var yi=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];yi.forEach(function(a){var n=pa(a,2),t=n[0],e=n[1],r=hi(bi(t));r!=null&&(Z[e]=r)})}var kt={styleDefault:"solid",familyDefault:F,cssPrefix:ht,replacementClass:yt,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};Z.familyPrefix&&(Z.cssPrefix=Z.familyPrefix);var K=f(f({},kt),Z);K.autoReplaceSvg||(K.observeMutations=!1);var g={};Object.keys(kt).forEach(function(a){Object.defineProperty(g,a,{enumerable:!0,set:function(t){K[a]=t,q.forEach(function(e){return e(g)})},get:function(){return K[a]}})});Object.defineProperty(g,"familyPrefix",{enumerable:!0,set:function(n){K.cssPrefix=n,q.forEach(function(t){return t(g)})},get:function(){return K.cssPrefix}});M.FontAwesomeConfig=g;var q=[];function xi(a){return q.push(a),function(){q.splice(q.indexOf(a),1)}}var X=ja,N={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function wi(a){if(!(!a||!$)){var n=S.createElement("style");n.setAttribute("type","text/css"),n.innerHTML=a;for(var t=S.head.childNodes,e=null,r=t.length-1;r>-1;r--){var o=t[r],i=(o.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(i)>-1&&(e=o)}return S.head.insertBefore(n,e),a}}var Si="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function gn(){for(var a=12,n="";a-- >0;)n+=Si[Math.random()*62|0];return n}function V(a){for(var n=[],t=(a||[]).length>>>0;t--;)n[t]=a[t];return n}function Qa(a){return a.classList?V(a.classList):(a.getAttribute("class")||"").split(" ").filter(function(n){return n})}function Pt(a){return"".concat(a).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ai(a){return Object.keys(a||{}).reduce(function(n,t){return n+"".concat(t,'="').concat(Pt(a[t]),'" ')},"").trim()}function ba(a){return Object.keys(a||{}).reduce(function(n,t){return n+"".concat(t,": ").concat(a[t].trim(),";")},"")}function Za(a){return a.size!==N.size||a.x!==N.x||a.y!==N.y||a.rotate!==N.rotate||a.flipX||a.flipY}function ki(a){var n=a.transform,t=a.containerWidth,e=a.iconWidth,r={transform:"translate(".concat(t/2," 256)")},o="translate(".concat(n.x*32,", ").concat(n.y*32,") "),i="scale(".concat(n.size/16*(n.flipX?-1:1),", ").concat(n.size/16*(n.flipY?-1:1),") "),s="rotate(".concat(n.rotate," 0 0)"),l={transform:"".concat(o," ").concat(i," ").concat(s)},u={transform:"translate(".concat(e/2*-1," -256)")};return{outer:r,inner:l,path:u}}function Pi(a){var n=a.transform,t=a.width,e=t===void 0?ja:t,r=a.height,o=r===void 0?ja:r,i="";return Bn?i+="translate(".concat(n.x/X-e/2,"em, ").concat(n.y/X-o/2,"em) "):i+="translate(calc(-50% + ".concat(n.x/X,"em), calc(-50% + ").concat(n.y/X,"em)) "),i+="scale(".concat(n.size/X*(n.flipX?-1:1),", ").concat(n.size/X*(n.flipY?-1:1),") "),i+="rotate(".concat(n.rotate,"deg) "),i}var Ii=`:root, :host {
  --fa-font-solid: normal 900 1em/1 'Font Awesome 7 Free';
  --fa-font-regular: normal 400 1em/1 'Font Awesome 7 Free';
  --fa-font-light: normal 300 1em/1 'Font Awesome 7 Pro';
  --fa-font-thin: normal 100 1em/1 'Font Awesome 7 Pro';
  --fa-font-duotone: normal 900 1em/1 'Font Awesome 7 Duotone';
  --fa-font-duotone-regular: normal 400 1em/1 'Font Awesome 7 Duotone';
  --fa-font-duotone-light: normal 300 1em/1 'Font Awesome 7 Duotone';
  --fa-font-duotone-thin: normal 100 1em/1 'Font Awesome 7 Duotone';
  --fa-font-brands: normal 400 1em/1 'Font Awesome 7 Brands';
  --fa-font-sharp-solid: normal 900 1em/1 'Font Awesome 7 Sharp';
  --fa-font-sharp-regular: normal 400 1em/1 'Font Awesome 7 Sharp';
  --fa-font-sharp-light: normal 300 1em/1 'Font Awesome 7 Sharp';
  --fa-font-sharp-thin: normal 100 1em/1 'Font Awesome 7 Sharp';
  --fa-font-sharp-duotone-solid: normal 900 1em/1 'Font Awesome 7 Sharp Duotone';
  --fa-font-sharp-duotone-regular: normal 400 1em/1 'Font Awesome 7 Sharp Duotone';
  --fa-font-sharp-duotone-light: normal 300 1em/1 'Font Awesome 7 Sharp Duotone';
  --fa-font-sharp-duotone-thin: normal 100 1em/1 'Font Awesome 7 Sharp Duotone';
  --fa-font-slab-regular: normal 400 1em/1 'Font Awesome 7 Slab';
  --fa-font-slab-press-regular: normal 400 1em/1 'Font Awesome 7 Slab Press';
  --fa-font-slab-duo-regular: normal 400 1em/1 'Font Awesome 7 Slab Duo';
  --fa-font-slab-press-duo-regular: normal 400 1em/1 'Font Awesome 7 Slab Press Duo';
  --fa-font-pixel-regular: normal 400 1em/1 'Font Awesome 7 Pixel';
  --fa-font-mosaic-solid: normal 900 1em/1 'Font Awesome 7 Mosaic';
  --fa-font-vellum-solid: normal 900 1em/1 'Font Awesome 7 Vellum';
  --fa-font-whiteboard-semibold: normal 600 1em/1 'Font Awesome 7 Whiteboard';
  --fa-font-thumbprint-light: normal 300 1em/1 'Font Awesome 7 Thumbprint';
  --fa-font-notdog-solid: normal 900 1em/1 'Font Awesome 7 Notdog';
  --fa-font-notdog-duo-solid: normal 900 1em/1 'Font Awesome 7 Notdog Duo';
  --fa-font-etch-solid: normal 900 1em/1 'Font Awesome 7 Etch';
  --fa-font-graphite-thin: normal 100 1em/1 'Font Awesome 7 Graphite';
  --fa-font-jelly-regular: normal 400 1em/1 'Font Awesome 7 Jelly';
  --fa-font-jelly-fill-regular: normal 400 1em/1 'Font Awesome 7 Jelly Fill';
  --fa-font-jelly-duo-regular: normal 400 1em/1 'Font Awesome 7 Jelly Duo';
  --fa-font-chisel-regular: normal 400 1em/1 'Font Awesome 7 Chisel';
  --fa-font-utility-semibold: normal 600 1em/1 'Font Awesome 7 Utility';
  --fa-font-utility-duo-semibold: normal 600 1em/1 'Font Awesome 7 Utility Duo';
  --fa-font-utility-fill-semibold: normal 600 1em/1 'Font Awesome 7 Utility Fill';
}

.svg-inline--fa {
  box-sizing: content-box;
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285714em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left,
.svg-inline--fa .fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-pull-right,
.svg-inline--fa .fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  inset-block-start: 0.25em; /* syncing vertical alignment with Web Font rendering */
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.fa-layers .svg-inline--fa {
  inset: 0;
  margin: auto;
  position: absolute;
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: calc(10 / 16 * 1em); /* converts a 10px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 10 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 10 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xs {
  font-size: calc(12 / 16 * 1em); /* converts a 12px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 12 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 12 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-sm {
  font-size: calc(14 / 16 * 1em); /* converts a 14px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 14 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 14 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-lg {
  font-size: calc(20 / 16 * 1em); /* converts a 20px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 20 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 20 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xl {
  font-size: calc(24 / 16 * 1em); /* converts a 24px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 24 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 24 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-2xl {
  font-size: calc(32 / 16 * 1em); /* converts a 32px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 32 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 32 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-width-auto {
  --fa-width: auto;
}

.fa-fw,
.fa-width-fixed {
  --fa-width: 1.25em;
}

.fa-canvas-square {
  padding-block: 0.125em;
  margin-block-end: -0.125em;
}

.fa-canvas-roomy {
  padding-block: 0.25em;
  padding-inline: 0.125em;
  margin-block-end: -0.25em;
  box-sizing: content-box;
}

.fa-ul {
  list-style-type: none;
  margin-inline-start: var(--fa-li-margin, 2.5em);
  padding-inline-start: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

/* Heads Up: Bordered Icons will not be supported in the future!
  - This feature will be deprecated in the next major release of Font Awesome (v8)!
  - You may continue to use it in this version *v7), but it will not be supported in Font Awesome v8.
*/
/* Notes:
* --@{v.$css-prefix}-border-width = 1/16 by default (to render as ~1px based on a 16px default font-size)
* --@{v.$css-prefix}-border-padding =
  ** 3/16 for vertical padding (to give ~2px of vertical whitespace around an icon considering it's vertical alignment)
  ** 4/16 for horizontal padding (to give ~4px of horizontal whitespace around an icon)
*/
.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.0625em);
  box-sizing: var(--fa-border-box-sizing, content-box);
  padding: var(--fa-border-padding, 0.1875em 0.25em);
}

.fa-pull-left,
.fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right,
.fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1.5s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-flip-360 {
  animation-name: fa-flip-360;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 0.75s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

.fa-spin-snap {
  animation-name: fa-spin-snap;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 3s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-snap-4 {
  animation-name: fa-spin-snap-4;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2.4s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-snap-8 {
  animation-name: fa-spin-snap-8;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 4s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-buzz {
  animation-name: fa-buzz;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 0.6s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-wag {
  animation-name: fa-wag;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 0.9s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-out);
  transform-origin: bottom center;
}

.fa-float {
  animation-name: fa-float;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 3s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
  will-change: transform;
}

.fa-swing {
  animation-name: fa-swing;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1.2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-out);
  transform-origin: top center;
}

.fa-jello {
  animation-name: fa-jello;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 0.9s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
  .fa-bounce,
  .fa-fade,
  .fa-beat-fade,
  .fa-flip,
  .fa-flip-360,
  .fa-pulse,
  .fa-shake,
  .fa-spin,
  .fa-spin-pulse,
  .fa-buzz,
  .fa-float,
  .fa-jello,
  .fa-spin-snap,
  .fa-spin-snap-4,
  .fa-spin-snap-8,
  .fa-swing,
  .fa-wag {
    animation: none !important;
    transition: none !important;
  }
}
@keyframes fa-beat {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(calc(1.25 * var(--fa-beat-scale, 1.25)));
  }
  45% {
    transform: scale(calc(1.22 * var(--fa-beat-scale, 1.22)));
  }
  65% {
    transform: scale(calc(1.25 * var(--fa-beat-scale, 1.25)));
  }
  90% {
    transform: scale(1);
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
    animation-timing-function: var(--fa-animation-timing);
  }
  14% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.06), var(--fa-bounce-start-scale-y, 0.94)) translateY(var(--fa-bounce-anticipation, 3px));
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
  }
  32% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.94), var(--fa-bounce-jump-scale-y, 1.12)) translateY(calc(-1 * var(--fa-bounce-height, 0.5em)));
    animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
  }
  52% {
    transform: scale(1, 1) translateY(calc(-1 * var(--fa-bounce-height, 0.5em) * 1.1));
    animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5);
  }
  70% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.06), var(--fa-bounce-land-scale-y, 0.92)) translateY(0);
    animation-timing-function: cubic-bezier(0.33, 0.33, 0.66, 1);
  }
  85% {
    transform: scale(0.98, 1.04) translateY(calc(-2px * var(--fa-bounce-rebound, 1)));
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  0% {
    opacity: 1;
    transform: scale(1);
    animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
  }
  40% {
    opacity: var(--fa-fade-opacity, 0.4);
    transform: scale(0.98);
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes fa-beat-fade {
  0% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
    animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
  }
  25% {
    opacity: calc(var(--fa-beat-fade-opacity, 0.4) + 0.4);
    transform: scale(var(--fa-beat-fade-scale, 1.28));
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  45% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.25));
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  65% {
    opacity: calc(var(--fa-beat-fade-opacity, 0.4) + 0.4);
    transform: scale(var(--fa-beat-fade-scale, 1.28));
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
}
@keyframes fa-flip {
  0% {
    transform: perspective(2em) scale(1) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), 0deg);
    animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
  }
  8% {
    transform: perspective(2em) scale(var(--fa-flip-anticipation-scale, 0.95)) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), 0deg);
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
  }
  35% {
    transform: perspective(2em) scale(1) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), calc(var(--fa-flip-angle, -360deg) * 0.6));
    animation-timing-function: linear;
  }
  65% {
    transform: perspective(2em) scale(1) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), calc(var(--fa-flip-angle, -360deg) * 0.5));
    animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
  }
  92% {
    transform: perspective(2em) scale(1) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), calc(var(--fa-flip-angle, -360deg) * var(--fa-flip-overshoot, 1.04)));
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
  }
  100% {
    transform: perspective(2em) scale(1) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -360deg));
  }
}
@keyframes fa-flip-360 {
  0% {
    transform: perspective(2em) scale(1) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), 0deg);
    animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
  }
  8% {
    transform: perspective(2em) scale(var(--fa-flip-anticipation-scale, 0.95)) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), 0deg);
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
  }
  50% {
    transform: perspective(2em) scale(1) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), calc(var(--fa-flip-angle, -360deg) * 0.6));
    animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
  }
  80% {
    transform: perspective(2em) scale(1) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), calc(var(--fa-flip-angle, -360deg) * var(--fa-flip-overshoot, 1.04)));
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
  }
  100% {
    transform: perspective(2em) scale(1) rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -360deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
  }
  8% {
    transform: rotate(35deg) translateX(1px);
    animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
  }
  20% {
    transform: rotate(-22deg) translateX(-1px);
    animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
  }
  35% {
    transform: rotate(15deg) translateX(1px);
    animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
  }
  50% {
    transform: rotate(-9deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  65% {
    transform: rotate(5deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  78% {
    transform: rotate(-3deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  90% {
    transform: rotate(1deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes fa-spin-snap {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  12% {
    transform: rotate(60deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  16.67% {
    transform: rotate(60deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  28.67% {
    transform: rotate(120deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  33.33% {
    transform: rotate(120deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  45.33% {
    transform: rotate(180deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: rotate(180deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  62% {
    transform: rotate(240deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  66.67% {
    transform: rotate(240deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  78.67% {
    transform: rotate(300deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  83.33% {
    transform: rotate(300deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  95.33% {
    transform: rotate(360deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes fa-spin-snap-4 {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  15% {
    transform: rotate(90deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  25% {
    transform: rotate(90deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  40% {
    transform: rotate(180deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: rotate(180deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  65% {
    transform: rotate(270deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  75% {
    transform: rotate(270deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  90% {
    transform: rotate(360deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes fa-spin-snap-8 {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  9% {
    transform: rotate(45deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  12.5% {
    transform: rotate(45deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  21.5% {
    transform: rotate(90deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  25% {
    transform: rotate(90deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  34% {
    transform: rotate(135deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  37.5% {
    transform: rotate(135deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  46.5% {
    transform: rotate(180deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: rotate(180deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  59% {
    transform: rotate(225deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  62.5% {
    transform: rotate(225deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  71.5% {
    transform: rotate(270deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  75% {
    transform: rotate(270deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  84% {
    transform: rotate(315deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  87.5% {
    transform: rotate(315deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  96.5% {
    transform: rotate(360deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes fa-buzz {
  0% {
    transform: translateX(0) rotate(0deg);
    animation-timing-function: cubic-bezier(0.1, 0, 0.9, 1);
  }
  5% {
    transform: translateX(var(--fa-buzz-distance, 4px)) rotate(0.5deg);
  }
  10% {
    transform: translateX(calc(-1 * var(--fa-buzz-distance, 4px))) rotate(-0.5deg);
  }
  15% {
    transform: translateX(var(--fa-buzz-distance, 4px)) rotate(0.3deg);
  }
  20% {
    transform: translateX(calc(-1 * var(--fa-buzz-distance, 4px))) rotate(-0.3deg);
  }
  25% {
    transform: translateX(calc(var(--fa-buzz-distance, 4px) * 0.7)) rotate(0.2deg);
  }
  30% {
    transform: translateX(calc(-1 * var(--fa-buzz-distance, 4px) * 0.7)) rotate(-0.2deg);
  }
  35% {
    transform: translateX(calc(var(--fa-buzz-distance, 4px) * 0.4)) rotate(0.1deg);
  }
  40% {
    transform: translateX(0) rotate(0deg);
  }
  100% {
    transform: translateX(0) rotate(0deg);
  }
}
@keyframes fa-wag {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
  }
  12% {
    transform: rotate(var(--fa-wag-angle, 12deg));
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  24% {
    transform: rotate(2deg);
    animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
  }
  36% {
    transform: rotate(calc(var(--fa-wag-angle, 12deg) * 0.85));
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  48% {
    transform: rotate(1deg);
    animation-timing-function: cubic-bezier(0.2, 0, 0.6, 1);
  }
  58% {
    transform: rotate(calc(var(--fa-wag-angle, 12deg) * 0.6));
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  68% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-float {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(var(--fa-float-squash-x, 1.02), var(--fa-float-squash-y, 0.98));
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
  }
  15% {
    transform: translateY(calc(-0.4 * var(--fa-float-height, 6px))) translateX(var(--fa-float-drift, 1px)) rotate(var(--fa-float-tilt, 1deg)) scale(1, 1);
    animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
  }
  35% {
    transform: translateY(calc(-1 * var(--fa-float-height, 6px))) translateX(0) rotate(0deg) scale(var(--fa-float-stretch-x, 0.98), var(--fa-float-stretch-y, 1.03));
    animation-timing-function: cubic-bezier(0.5, 0, 0.5, 0);
  }
  50% {
    transform: translateY(calc(-0.92 * var(--fa-float-height, 6px))) translateX(calc(-0.5 * var(--fa-float-drift, 1px))) rotate(calc(-0.5 * var(--fa-float-tilt, 1deg))) scale(0.995, 1.01);
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 0.33);
  }
  70% {
    transform: translateY(calc(-0.3 * var(--fa-float-height, 6px))) translateX(calc(-1 * var(--fa-float-drift, 1px))) rotate(calc(-1 * var(--fa-float-tilt, 1deg))) scale(1, 1);
    animation-timing-function: cubic-bezier(0.33, 0.66, 0.66, 1);
  }
  90% {
    transform: translateY(calc(0.05 * var(--fa-float-height, 6px))) translateX(0) rotate(0deg) scale(var(--fa-float-squash-x, 1.02), var(--fa-float-squash-y, 0.98));
    animation-timing-function: cubic-bezier(0.33, 0, 0.66, 1);
  }
  100% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(var(--fa-float-squash-x, 1.02), var(--fa-float-squash-y, 0.98));
  }
}
@keyframes fa-swing {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
  }
  8% {
    transform: rotate(var(--fa-swing-angle, 22deg));
    animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
  }
  18% {
    transform: rotate(calc(-1 * var(--fa-swing-angle, 22deg) * 0.85));
    animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
  }
  28% {
    transform: rotate(calc(var(--fa-swing-angle, 22deg) * 0.65));
    animation-timing-function: cubic-bezier(0.35, 0, 0.65, 1);
  }
  38% {
    transform: rotate(calc(-1 * var(--fa-swing-angle, 22deg) * 0.45));
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  48% {
    transform: rotate(calc(var(--fa-swing-angle, 22deg) * 0.25));
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  56% {
    transform: rotate(calc(-1 * var(--fa-swing-angle, 22deg) * 0.1));
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  64% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-jello {
  0% {
    transform: scale(1, 1);
    animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1);
  }
  12% {
    transform: scale(var(--fa-jello-scale-x, 1.15), calc(2 - var(--fa-jello-scale-x, 1.15)));
    animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
  }
  24% {
    transform: scale(calc(2 - var(--fa-jello-scale-y, 1.12)), var(--fa-jello-scale-y, 1.12));
    animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1);
  }
  36% {
    transform: scale(calc(1 + (var(--fa-jello-scale-x, 1.15) - 1) * 0.5), calc(2 - (1 + (var(--fa-jello-scale-x, 1.15) - 1) * 0.5)));
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  48% {
    transform: scale(calc(2 - (1 + (var(--fa-jello-scale-y, 1.12) - 1) * 0.3)), calc(1 + (var(--fa-jello-scale-y, 1.12) - 1) * 0.3));
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  58% {
    transform: scale(1.02, 0.98);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  68% {
    transform: scale(1, 1);
  }
  100% {
    transform: scale(1, 1);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.svg-inline--fa.fa-inverse {
  fill: var(--fa-inverse, #fff);
}

.fa-stack {
  display: inline-block;
  height: 2em;
  line-height: 2em;
  position: relative;
  vertical-align: middle;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.svg-inline--fa.fa-stack-1x {
  --fa-width: 1.25em;
  height: 1em;
  width: var(--fa-width);
}
.svg-inline--fa.fa-stack-2x {
  --fa-width: 2.5em;
  height: 2em;
  width: var(--fa-width);
}

.fa-stack-1x,
.fa-stack-2x {
  inset: 0;
  margin: auto;
  position: absolute;
  z-index: var(--fa-stack-z-index, auto);
}`;function It(){var a=ht,n=yt,t=g.cssPrefix,e=g.replacementClass,r=Ii;if(t!==a||e!==n){var o=new RegExp("\\.".concat(a,"\\-"),"g"),i=new RegExp("\\--".concat(a,"\\-"),"g"),s=new RegExp("\\.".concat(n),"g");r=r.replace(o,".".concat(t,"-")).replace(i,"--".concat(t,"-")).replace(s,".".concat(e))}return r}var vn=!1;function Aa(){g.autoAddCss&&!vn&&(wi(It()),vn=!0)}var zi={mixout:function(){return{dom:{css:It,insertCss:Aa}}},hooks:function(){return{beforeDOMElementCreation:function(){Aa()},beforeI2svg:function(){Aa()}}}},_=M||{};_[T]||(_[T]={});_[T].styles||(_[T].styles={});_[T].hooks||(_[T].hooks={});_[T].shims||(_[T].shims=[]);var E=_[T],zt=[],Ft=function(){S.removeEventListener("DOMContentLoaded",Ft),ma=1,zt.map(function(n){return n()})},ma=!1;$&&(ma=(S.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(S.readyState),ma||S.addEventListener("DOMContentLoaded",Ft));function Fi(a){$&&(ma?setTimeout(a,0):zt.push(a))}function ea(a){var n=a.tag,t=a.attributes,e=t===void 0?{}:t,r=a.children,o=r===void 0?[]:r;return typeof a=="string"?Pt(a):"<".concat(n," ").concat(Ai(e),">").concat(o.map(ea).join(""),"</").concat(n,">")}function pn(a,n,t){if(a&&a[n]&&a[n][t])return{prefix:n,iconName:t,icon:a[n][t]}}var ka=function(n,t,e,r){var o=Object.keys(n),i=o.length,s=t,l,u,m;for(e===void 0?(l=1,m=n[o[0]]):(l=0,m=e);l<i;l++)u=o[l],m=s(m,n[u],u,n);return m};function Ot(a){return j(a).length!==1?null:a.codePointAt(0).toString(16)}function bn(a){return Object.keys(a).reduce(function(n,t){var e=a[t],r=!!e.icon;return r?n[e.iconName]=e.icon:n[t]=e,n},{})}function $a(a,n){var t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},e=t.skipHooks,r=e===void 0?!1:e,o=bn(n);typeof E.hooks.addPack=="function"&&!r?E.hooks.addPack(a,bn(n)):E.styles[a]=f(f({},E.styles[a]||{}),o),a==="fas"&&$a("fa",n)}var aa=E.styles,Oi=E.shims,Et=Object.keys(Ja),Ei=Et.reduce(function(a,n){return a[n]=Object.keys(Ja[n]),a},{}),qa=null,jt={},Ct={},Nt={},Tt={},_t={};function ji(a){return~pi.indexOf(a)}function Ci(a,n){var t=n.split("-"),e=t[0],r=t.slice(1).join("-");return e===a&&r!==""&&!ji(r)?r:null}var $t=function(){var n=function(o){return ka(aa,function(i,s,l){return i[l]=ka(s,o,{}),i},{})};jt=n(function(r,o,i){if(o[3]&&(r[o[3]]=i),o[2]){var s=o[2].filter(function(l){return typeof l=="number"});s.forEach(function(l){r[l.toString(16)]=i})}return r}),Ct=n(function(r,o,i){if(r[i]=i,o[2]){var s=o[2].filter(function(l){return typeof l=="string"});s.forEach(function(l){r[l]=i})}return r}),_t=n(function(r,o,i){var s=o[2];return r[i]=i,s.forEach(function(l){r[l]=i}),r});var t="far"in aa||g.autoFetchSvg,e=ka(Oi,function(r,o){var i=o[0],s=o[1],l=o[2];return s==="far"&&!t&&(s="fas"),typeof i=="string"&&(r.names[i]={prefix:s,iconName:l}),typeof i=="number"&&(r.unicodes[i.toString(16)]={prefix:s,iconName:l}),r},{names:{},unicodes:{}});Nt=e.names,Tt=e.unicodes,qa=ha(g.styleDefault,{family:g.familyDefault})};xi(function(a){qa=ha(a.styleDefault,{family:g.familyDefault})});$t();function an(a,n){return(jt[a]||{})[n]}function Ni(a,n){return(Ct[a]||{})[n]}function W(a,n){return(_t[a]||{})[n]}function Mt(a){return Nt[a]||{prefix:null,iconName:null}}function Ti(a){var n=Tt[a],t=an("fas",a);return n||(t?{prefix:"fas",iconName:t}:null)||{prefix:null,iconName:null}}function D(){return qa}var Dt=function(){return{prefix:null,iconName:null,rest:[]}};function _i(a){var n=F,t=Et.reduce(function(e,r){return e[r]="".concat(g.cssPrefix,"-").concat(r),e},{});return gt.forEach(function(e){(a.includes(t[e])||a.some(function(r){return Ei[e].includes(r)}))&&(n=e)}),n}function ha(a){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.family,e=t===void 0?F:t,r=ci[e][a];if(e===na&&!a)return"fad";var o=mn[e][a]||mn[e][r],i=a in E.styles?a:null,s=o||i||null;return s}function $i(a){var n=[],t=null;return a.forEach(function(e){var r=Ci(g.cssPrefix,e);r?t=r:e&&n.push(e)}),{iconName:t,rest:n}}function hn(a){return a.sort().filter(function(n,t,e){return e.indexOf(n)===t})}var yn=pt.concat(vt);function ya(a){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.skipLookups,e=t===void 0?!1:t,r=null,o=hn(a.filter(function(b){return yn.includes(b)})),i=hn(a.filter(function(b){return!yn.includes(b)})),s=o.filter(function(b){return r=b,!Xn.includes(b)}),l=pa(s,1),u=l[0],m=u===void 0?null:u,c=_i(o),h=f(f({},$i(i)),{},{prefix:ha(m,{family:c})});return f(f(f({},h),Ri({values:a,family:c,styles:aa,config:g,canonical:h,givenPrefix:r})),Mi(e,r,h))}function Mi(a,n,t){var e=t.prefix,r=t.iconName;if(a||!e||!r)return{prefix:e,iconName:r};var o=n==="fa"?Mt(r):{},i=W(e,r);return r=o.iconName||i||r,e=o.prefix||e,e==="far"&&!aa.far&&aa.fas&&!g.autoFetchSvg&&(e="fas"),{prefix:e,iconName:r}}var Di=gt.filter(function(a){return a!==F||a!==na}),Li=Object.keys(Ea).filter(function(a){return a!==F}).map(function(a){return Object.keys(Ea[a])}).flat();function Ri(a){var n=a.values,t=a.family,e=a.canonical,r=a.givenPrefix,o=r===void 0?"":r,i=a.styles,s=i===void 0?{}:i,l=a.config,u=l===void 0?{}:l,m=t===na,c=n.includes("fa-duotone")||n.includes("fad"),h=u.familyDefault==="duotone",b=e.prefix==="fad"||e.prefix==="fa-duotone";if(!m&&(c||h||b)&&(e.prefix="fad"),(n.includes("fa-brands")||n.includes("fab"))&&(e.prefix="fab"),!e.prefix&&Di.includes(t)){var k=Object.keys(s).find(function(I){return Li.includes(I)});if(k||u.autoFetchSvg){var y=Xe.get(t).defaultShortPrefixId;e.prefix=y,e.iconName=W(e.prefix,e.iconName)||e.iconName}}return(e.prefix==="fa"||o==="fa")&&(e.prefix=D()||"fas"),e}var Wi=(function(){function a(){se(this,a),this.definitions={}}return fe(a,[{key:"add",value:function(){for(var t=this,e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];var i=r.reduce(this._pullDefinitions,{});Object.keys(i).forEach(function(s){t.definitions[s]=f(f({},t.definitions[s]||{}),i[s]),$a(s,i[s]);var l=Ja[F][s];l&&$a(l,i[s]),$t()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(t,e){var r=e.prefix&&e.iconName&&e.icon?{0:e}:e;return Object.keys(r).map(function(o){var i=r[o],s=i.prefix,l=i.iconName,u=i.icon,m=u[2];t[s]||(t[s]={}),m.length>0&&m.forEach(function(c){typeof c=="string"&&(t[s][c]=u)}),t[s][l]=u}),t}}])})(),xn=[],H={},G={},Ui=Object.keys(G);function Bi(a,n){var t=n.mixoutsTo;return xn=a,H={},Object.keys(G).forEach(function(e){Ui.indexOf(e)===-1&&delete G[e]}),xn.forEach(function(e){var r=e.mixout?e.mixout():{};if(Object.keys(r).forEach(function(i){typeof r[i]=="function"&&(t[i]=r[i]),da(r[i])==="object"&&Object.keys(r[i]).forEach(function(s){t[i]||(t[i]={}),t[i][s]=r[i][s]})}),e.hooks){var o=e.hooks();Object.keys(o).forEach(function(i){H[i]||(H[i]=[]),H[i].push(o[i])})}e.provides&&e.provides(G)}),t}function Ma(a,n){for(var t=arguments.length,e=new Array(t>2?t-2:0),r=2;r<t;r++)e[r-2]=arguments[r];var o=H[a]||[];return o.forEach(function(i){n=i.apply(null,[n].concat(e))}),n}function B(a){for(var n=arguments.length,t=new Array(n>1?n-1:0),e=1;e<n;e++)t[e-1]=arguments[e];var r=H[a]||[];r.forEach(function(o){o.apply(null,t)})}function L(){var a=arguments[0],n=Array.prototype.slice.call(arguments,1);return G[a]?G[a].apply(null,n):void 0}function Da(a){a.prefix==="fa"&&(a.prefix="fas");var n=a.iconName,t=a.prefix||D();if(n)return n=W(t,n)||n,pn(Lt.definitions,t,n)||pn(E.styles,t,n)}var Lt=new Wi,Yi=function(){g.autoReplaceSvg=!1,g.observeMutations=!1,B("noAuto")},Xi={i2svg:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return $?(B("beforeI2svg",n),L("pseudoElements2svg",n),L("i2svg",n)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot;g.autoReplaceSvg===!1&&(g.autoReplaceSvg=!0),g.observeMutations=!0,Fi(function(){Gi({autoReplaceSvgRoot:t}),B("watch",n)})}},Hi={icon:function(n){if(n===null)return null;if(da(n)==="object"&&n.prefix&&n.iconName)return{prefix:n.prefix,iconName:W(n.prefix,n.iconName)||n.iconName};if(Array.isArray(n)&&n.length===2){var t=n[1].indexOf("fa-")===0?n[1].slice(3):n[1],e=ha(n[0]);return{prefix:e,iconName:W(e,t)||t}}if(typeof n=="string"&&(n.indexOf("".concat(g.cssPrefix,"-"))>-1||n.match(di))){var r=ya(n.split(" "),{skipLookups:!0});return{prefix:r.prefix||D(),iconName:W(r.prefix,r.iconName)||r.iconName}}if(typeof n=="string"){var o=D();return{prefix:o,iconName:W(o,n)||n}}}},O={noAuto:Yi,config:g,dom:Xi,parse:Hi,library:Lt,findIconDefinition:Da,toHtml:ea},Gi=function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot,e=t===void 0?S:t;(Object.keys(E.styles).length>0||g.autoFetchSvg)&&$&&g.autoReplaceSvg&&O.dom.i2svg({node:e})};function xa(a,n){return Object.defineProperty(a,"abstract",{get:n}),Object.defineProperty(a,"html",{get:function(){return a.abstract.map(function(e){return ea(e)})}}),Object.defineProperty(a,"node",{get:function(){if($){var e=S.createElement("div");return e.innerHTML=a.html,e.children}}}),a}function Ki(a){var n=a.children,t=a.main,e=a.mask,r=a.attributes,o=a.styles,i=a.transform;if(Za(i)&&t.found&&!e.found){var s=t.width,l=t.height,u={x:s/l/2,y:.5};r.style=ba(f(f({},o),{},{"transform-origin":"".concat(u.x+i.x/16,"em ").concat(u.y+i.y/16,"em")}))}return[{tag:"svg",attributes:r,children:n}]}function Vi(a){var n=a.prefix,t=a.iconName,e=a.children,r=a.attributes,o=a.symbol,i=o===!0?"".concat(n,"-").concat(g.cssPrefix,"-").concat(t):o;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:f(f({},r),{},{id:i}),children:e}]}]}function Ji(a){var n=["aria-label","aria-labelledby","title","role"];return n.some(function(t){return t in a})}function nn(a){var n=a.icons,t=n.main,e=n.mask,r=a.prefix,o=a.iconName,i=a.transform,s=a.symbol,l=a.maskId,u=a.extra,m=a.watchable,c=m===void 0?!1:m,h=e.found?e:t,b=h.width,k=h.height,y=[g.replacementClass,o?"".concat(g.cssPrefix,"-").concat(o):""].filter(function(z){return u.classes.indexOf(z)===-1}).filter(function(z){return z!==""||!!z}).concat(u.classes).join(" "),I={children:[],attributes:f(f({},u.attributes),{},{"data-prefix":r,"data-icon":o,class:y,role:u.attributes.role||"img",viewBox:"0 0 ".concat(b," ").concat(k)})};!Ji(u.attributes)&&!u.attributes["aria-hidden"]&&(I.attributes["aria-hidden"]="true"),c&&(I.attributes[U]="");var d=f(f({},I),{},{prefix:r,iconName:o,main:t,mask:e,maskId:l,transform:i,symbol:s,styles:f({},u.styles)}),p=e.found&&t.found?L("generateAbstractMask",d)||{children:[],attributes:{}}:L("generateAbstractIcon",d)||{children:[],attributes:{}},w=p.children,P=p.attributes;return d.children=w,d.attributes=P,s?Vi(d):Ki(d)}function wn(a){var n=a.content,t=a.width,e=a.height,r=a.transform,o=a.extra,i=a.watchable,s=i===void 0?!1:i,l=f(f({},o.attributes),{},{class:o.classes.join(" ")});s&&(l[U]="");var u=f({},o.styles);Za(r)&&(u.transform=Pi({transform:r,width:t,height:e}),u["-webkit-transform"]=u.transform);var m=ba(u);m.length>0&&(l.style=m);var c=[];return c.push({tag:"span",attributes:l,children:[n]}),c}function Qi(a){var n=a.content,t=a.extra,e=f(f({},t.attributes),{},{class:t.classes.join(" ")}),r=ba(t.styles);r.length>0&&(e.style=r);var o=[];return o.push({tag:"span",attributes:e,children:[n]}),o}var Pa=E.styles;function La(a){var n=a[0],t=a[1],e=a.slice(4),r=pa(e,1),o=r[0],i=null;return Array.isArray(o)?i={tag:"g",attributes:{class:"".concat(g.cssPrefix,"-").concat(Sa.GROUP)},children:[{tag:"path",attributes:{class:"".concat(g.cssPrefix,"-").concat(Sa.SECONDARY),fill:"currentColor",d:o[0]}},{tag:"path",attributes:{class:"".concat(g.cssPrefix,"-").concat(Sa.PRIMARY),fill:"currentColor",d:o[1]}}]}:i={tag:"path",attributes:{fill:"currentColor",d:o}},{found:!0,width:n,height:t,icon:i}}var Zi={found:!1,width:512,height:512};function qi(a,n){!wt&&!g.showMissingIcons&&a&&console.error('Icon with name "'.concat(a,'" and prefix "').concat(n,'" is missing.'))}function Ra(a,n){var t=n;return n==="fa"&&g.styleDefault!==null&&(n=D()),new Promise(function(e,r){if(t==="fa"){var o=Mt(a)||{};a=o.iconName||a,n=o.prefix||n}if(a&&n&&Pa[n]&&Pa[n][a]){var i=Pa[n][a];return e(La(i))}qi(a,n),e(f(f({},Zi),{},{icon:g.showMissingIcons&&a?L("missingIconAbstract")||{}:{}}))})}var Sn=function(){},Wa=g.measurePerformance&&ra&&ra.mark&&ra.measure?ra:{mark:Sn,measure:Sn},Q='FA "7.3.1"',ao=function(n){return Wa.mark("".concat(Q," ").concat(n," begins")),function(){return Rt(n)}},Rt=function(n){Wa.mark("".concat(Q," ").concat(n," ends")),Wa.measure("".concat(Q," ").concat(n),"".concat(Q," ").concat(n," begins"),"".concat(Q," ").concat(n," ends"))},tn={begin:ao,end:Rt},ua=function(){};function An(a){var n=a.getAttribute?a.getAttribute(U):null;return typeof n=="string"}function no(a){var n=a.getAttribute?a.getAttribute(Ka):null,t=a.getAttribute?a.getAttribute(Va):null;return n&&t}function to(a){return a&&a.classList&&a.classList.contains&&a.classList.contains(g.replacementClass)}function eo(){if(g.autoReplaceSvg===!0)return ca.replace;var a=ca[g.autoReplaceSvg];return a||ca.replace}function ro(a){return S.createElementNS("http://www.w3.org/2000/svg",a)}function io(a){return S.createElement(a)}function Wt(a){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.ceFn,e=t===void 0?a.tag==="svg"?ro:io:t;if(typeof a=="string")return S.createTextNode(a);var r=e(a.tag);Object.keys(a.attributes||[]).forEach(function(i){r.setAttribute(i,a.attributes[i])});var o=a.children||[];return o.forEach(function(i){r.appendChild(Wt(i,{ceFn:e}))}),r}function oo(a){var n=" ".concat(a.outerHTML," ");return n="".concat(n,"Font Awesome fontawesome.com "),n}var ca={replace:function(n){var t=n[0];if(t.parentNode)if(n[1].forEach(function(r){t.parentNode.insertBefore(Wt(r),t)}),t.getAttribute(U)===null&&g.keepOriginalSource){var e=S.createComment(oo(t));t.parentNode.replaceChild(e,t)}else t.remove()},nest:function(n){var t=n[0],e=n[1];if(~Qa(t).indexOf(g.replacementClass))return ca.replace(n);var r=new RegExp("".concat(g.cssPrefix,"-.*"));if(delete e[0].attributes.id,e[0].attributes.class){var o=e[0].attributes.class.split(" ").reduce(function(s,l){return l===g.replacementClass||l.match(r)?s.toSvg.push(l):s.toNode.push(l),s},{toNode:[],toSvg:[]});e[0].attributes.class=o.toSvg.join(" "),o.toNode.length===0?t.removeAttribute("class"):t.setAttribute("class",o.toNode.join(" "))}var i=e.map(function(s){return ea(s)}).join(`
`);t.setAttribute(U,""),t.innerHTML=i}};function kn(a){a()}function Ut(a,n){var t=typeof n=="function"?n:ua;if(a.length===0)t();else{var e=kn;g.mutateApproach===fi&&(e=M.requestAnimationFrame||kn),e(function(){var r=eo(),o=tn.begin("mutate");a.map(r),o(),t()})}}var en=!1;function Bt(){en=!0}function Ua(){en=!1}var ga=null;function Pn(a){if(fn&&g.observeMutations){var n=a.treeCallback,t=n===void 0?ua:n,e=a.nodeCallback,r=e===void 0?ua:e,o=a.pseudoElementsCallback,i=o===void 0?ua:o,s=a.observeMutationsRoot,l=s===void 0?S:s;ga=new fn(function(u){if(!en){var m=D();V(u).forEach(function(c){if(c.type==="childList"&&c.addedNodes.length>0&&!An(c.addedNodes[0])&&(g.searchPseudoElements&&i(c.target),t(c.target)),c.type==="attributes"&&c.target.parentNode&&g.searchPseudoElements&&i([c.target],!0),c.type==="attributes"&&An(c.target)&&~vi.indexOf(c.attributeName))if(c.attributeName==="class"&&no(c.target)){var h=ya(Qa(c.target)),b=h.prefix,k=h.iconName;c.target.setAttribute(Ka,b||m),k&&c.target.setAttribute(Va,k)}else to(c.target)&&r(c.target)})}}),$&&ga.observe(l,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function so(){ga&&ga.disconnect()}function lo(a){var n=a.getAttribute("style"),t=[];return n&&(t=n.split(";").reduce(function(e,r){var o=r.split(":"),i=o[0],s=o.slice(1);return i&&s.length>0&&(e[i]=s.join(":").trim()),e},{})),t}function fo(a){var n=a.getAttribute("data-prefix"),t=a.getAttribute("data-icon"),e=a.innerText!==void 0?a.innerText.trim():"",r=ya(Qa(a));return r.prefix||(r.prefix=D()),n&&t&&(r.prefix=n,r.iconName=t),r.iconName&&r.prefix||(r.prefix&&e.length>0&&(r.iconName=Ni(r.prefix,a.innerText)||an(r.prefix,Ot(a.innerText))),!r.iconName&&g.autoFetchSvg&&a.firstChild&&a.firstChild.nodeType===Node.TEXT_NODE&&(r.iconName=a.firstChild.data)),r}function uo(a){var n=V(a.attributes).reduce(function(t,e){return t.name!=="class"&&t.name!=="style"&&(t[e.name]=e.value),t},{});return n}function co(){return{iconName:null,prefix:null,transform:N,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function In(a){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},t=fo(a),e=t.iconName,r=t.prefix,o=t.rest,i=uo(a),s=Ma("parseNodeAttributes",{},a),l=n.styleParser?lo(a):[];return f({iconName:e,prefix:r,transform:N,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:o,styles:l,attributes:i}},s)}var mo=E.styles;function Yt(a){var n=g.autoReplaceSvg==="nest"?In(a,{styleParser:!1}):In(a);return~n.extra.classes.indexOf(At)?L("generateLayersText",a,n):L("generateSvgReplacementMutation",a,n)}function go(){return[].concat(j(vt),j(pt))}function zn(a){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!$)return Promise.resolve();var t=S.documentElement.classList,e=function(c){return t.add("".concat(dn,"-").concat(c))},r=function(c){return t.remove("".concat(dn,"-").concat(c))},o=g.autoFetchSvg?go():Xn.concat(Object.keys(mo));o.includes("fa")||o.push("fa");var i=[".".concat(At,":not([").concat(U,"])")].concat(o.map(function(m){return".".concat(m,":not([").concat(U,"])")})).join(", ");if(i.length===0)return Promise.resolve();var s=[];try{s=V(a.querySelectorAll(i))}catch{}if(s.length>0)e("pending"),r("complete");else return Promise.resolve();var l=tn.begin("onTree"),u=s.reduce(function(m,c){try{var h=Yt(c);h&&m.push(h)}catch(b){wt||b.name==="MissingIcon"&&console.error(b)}return m},[]);return new Promise(function(m,c){Promise.all(u).then(function(h){Ut(h,function(){e("active"),e("complete"),r("pending"),typeof n=="function"&&n(),l(),m()})}).catch(function(h){l(),c(h)})})}function vo(a){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;Yt(a).then(function(t){t&&Ut([t],n)})}function po(a){return function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=(n||{}).icon?n:Da(n||{}),r=t.mask;return r&&(r=(r||{}).icon?r:Da(r||{})),a(e,f(f({},t),{},{mask:r}))}}var bo=function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=t.transform,r=e===void 0?N:e,o=t.symbol,i=o===void 0?!1:o,s=t.mask,l=s===void 0?null:s,u=t.maskId,m=u===void 0?null:u,c=t.classes,h=c===void 0?[]:c,b=t.attributes,k=b===void 0?{}:b,y=t.styles,I=y===void 0?{}:y;if(n){var d=n.prefix,p=n.iconName,w=n.icon;return xa(f({type:"icon"},n),function(){return B("beforeDOMElementCreation",{iconDefinition:n,params:t}),nn({icons:{main:La(w),mask:l?La(l.icon):{found:!1,width:null,height:null,icon:{}}},prefix:d,iconName:p,transform:f(f({},N),r),symbol:i,maskId:m,extra:{attributes:k,styles:I,classes:h}})})}},ho={mixout:function(){return{icon:po(bo)}},hooks:function(){return{mutationObserverCallbacks:function(t){return t.treeCallback=zn,t.nodeCallback=vo,t}}},provides:function(n){n.i2svg=function(t){var e=t.node,r=e===void 0?S:e,o=t.callback,i=o===void 0?function(){}:o;return zn(r,i)},n.generateSvgReplacementMutation=function(t,e){var r=e.iconName,o=e.prefix,i=e.transform,s=e.symbol,l=e.mask,u=e.maskId,m=e.extra;return new Promise(function(c,h){Promise.all([Ra(r,o),l.iconName?Ra(l.iconName,l.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(b){var k=pa(b,2),y=k[0],I=k[1];c([t,nn({icons:{main:y,mask:I},prefix:o,iconName:r,transform:i,symbol:s,maskId:u,extra:m,watchable:!0})])}).catch(h)})},n.generateAbstractIcon=function(t){var e=t.children,r=t.attributes,o=t.main,i=t.transform,s=t.styles,l=ba(s);l.length>0&&(r.style=l);var u;return Za(i)&&(u=L("generateAbstractTransformGrouping",{main:o,transform:i,containerWidth:o.width,iconWidth:o.width})),e.push(u||o.icon),{children:e,attributes:r}}}},yo={mixout:function(){return{layer:function(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.classes,o=r===void 0?[]:r;return xa({type:"layer"},function(){B("beforeDOMElementCreation",{assembler:t,params:e});var i=[];return t(function(s){Array.isArray(s)?s.map(function(l){i=i.concat(l.abstract)}):i=i.concat(s.abstract)}),[{tag:"span",attributes:{class:["".concat(g.cssPrefix,"-layers")].concat(j(o)).join(" ")},children:i}]})}}}},xo={mixout:function(){return{counter:function(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};e.title;var r=e.classes,o=r===void 0?[]:r,i=e.attributes,s=i===void 0?{}:i,l=e.styles,u=l===void 0?{}:l;return xa({type:"counter",content:t},function(){return B("beforeDOMElementCreation",{content:t,params:e}),Qi({content:t.toString(),extra:{attributes:s,styles:u,classes:["".concat(g.cssPrefix,"-layers-counter")].concat(j(o))}})})}}}},wo={mixout:function(){return{text:function(t){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.transform,o=r===void 0?N:r,i=e.classes,s=i===void 0?[]:i,l=e.attributes,u=l===void 0?{}:l,m=e.styles,c=m===void 0?{}:m;return xa({type:"text",content:t},function(){return B("beforeDOMElementCreation",{content:t,params:e}),wn({content:t,transform:f(f({},N),o),extra:{attributes:u,styles:c,classes:["".concat(g.cssPrefix,"-layers-text")].concat(j(s))}})})}}},provides:function(n){n.generateLayersText=function(t,e){var r=e.transform,o=e.extra,i=null,s=null;if(Bn){var l=parseInt(getComputedStyle(t).fontSize,10),u=t.getBoundingClientRect();i=u.width/l,s=u.height/l}return Promise.resolve([t,wn({content:t.innerHTML,width:i,height:s,transform:r,extra:o,watchable:!0})])}}},Xt=new RegExp('"',"ug"),Fn=[1105920,1112319],On=f(f(f(f({},{FontAwesome:{normal:"fas",400:"fas"}}),Ye),si),qe),Ba=Object.keys(On).reduce(function(a,n){return a[n.toLowerCase()]=On[n],a},{}),So=Object.keys(Ba).reduce(function(a,n){var t=Ba[n];return a[n]=t[900]||j(Object.entries(t))[0][1],a},{});function Ao(a){var n=a.replace(Xt,"");return Ot(j(n)[0]||"")}function ko(a){var n=a.getPropertyValue("font-feature-settings").includes("ss01"),t=a.getPropertyValue("content"),e=t.replace(Xt,""),r=e.codePointAt(0),o=r>=Fn[0]&&r<=Fn[1],i=e.length===2?e[0]===e[1]:!1;return o||i||n}function Po(a,n){var t=a.replace(/^['"]|['"]$/g,"").toLowerCase(),e=parseInt(n),r=isNaN(e)?"normal":e;return(Ba[t]||{})[r]||So[t]}function En(a,n){var t="".concat(li).concat(n.replace(":","-"));return new Promise(function(e,r){if(a.getAttribute(t)!==null)return e();var o=V(a.children),i=o.filter(function(C){return C.getAttribute(Ca)===n})[0],s=M.getComputedStyle(a,n),l=s.getPropertyValue("font-family"),u=l.match(mi),m=s.getPropertyValue("font-weight"),c=s.getPropertyValue("content");if(i&&!u)return a.removeChild(i),e();if(u&&c!=="none"&&c!==""){var h=s.getPropertyValue("content"),b=Po(l,m),k=Ao(h),y=u[0].startsWith("FontAwesome"),I=ko(s),d=an(b,k),p=d;if(y){var w=Ti(k);w.iconName&&w.prefix&&(d=w.iconName,b=w.prefix)}if(d&&!I&&(!i||i.getAttribute(Ka)!==b||i.getAttribute(Va)!==p)){a.setAttribute(t,p),i&&a.removeChild(i);var P=co(),z=P.extra;z.attributes[Ca]=n,Ra(d,b).then(function(C){var J=nn(f(f({},P),{},{icons:{main:C,mask:Dt()},prefix:b,iconName:p,extra:z,watchable:!0})),wa=S.createElementNS("http://www.w3.org/2000/svg","svg");n==="::before"?a.insertBefore(wa,a.firstChild):a.appendChild(wa),wa.outerHTML=J.map(function(Qt){return ea(Qt)}).join(`
`),a.removeAttribute(t),e()}).catch(r)}else e()}else e()})}function Io(a){return Promise.all([En(a,"::before"),En(a,"::after")])}function zo(a){return a.parentNode!==document.head&&!~ui.indexOf(a.tagName.toUpperCase())&&!a.getAttribute(Ca)&&(!a.parentNode||a.parentNode.tagName!=="svg")}var Fo=function(n){return!!n&&xt.some(function(t){return n.includes(t)})},Oo=function(n){if(!n)return[];var t=new Set,e=n.split(/,(?![^()]*\))/).map(function(l){return l.trim()});e=e.flatMap(function(l){return l.includes("(")?l:l.split(",").map(function(u){return u.trim()})});var r=fa(e),o;try{for(r.s();!(o=r.n()).done;){var i=o.value;if(Fo(i)){var s=xt.reduce(function(l,u){return l.replace(u,"")},i);s!==""&&s!=="*"&&t.add(s)}}}catch(l){r.e(l)}finally{r.f()}return t};function jn(a){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if($){var t;if(n)t=a;else if(g.searchPseudoElementsFullScan)t=a.querySelectorAll("*");else{var e=new Set,r=fa(document.styleSheets),o;try{for(r.s();!(o=r.n()).done;){var i=o.value;try{var s=fa(i.cssRules),l;try{for(s.s();!(l=s.n()).done;){var u=l.value,m=Oo(u.selectorText),c=fa(m),h;try{for(c.s();!(h=c.n()).done;){var b=h.value;e.add(b)}}catch(y){c.e(y)}finally{c.f()}}}catch(y){s.e(y)}finally{s.f()}}catch(y){g.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(i.href," (").concat(y.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(y){r.e(y)}finally{r.f()}if(!e.size)return;var k=Array.from(e).join(", ");try{t=a.querySelectorAll(k)}catch{}}return new Promise(function(y,I){var d=V(t).filter(zo).map(Io),p=tn.begin("searchPseudoElements");Bt(),Promise.all(d).then(function(){p(),Ua(),y()}).catch(function(){p(),Ua(),I()})})}}var Eo={hooks:function(){return{mutationObserverCallbacks:function(t){return t.pseudoElementsCallback=jn,t}}},provides:function(n){n.pseudoElements2svg=function(t){var e=t.node,r=e===void 0?S:e;g.searchPseudoElements&&jn(r)}}},Cn=!1,jo={mixout:function(){return{dom:{unwatch:function(){Bt(),Cn=!0}}}},hooks:function(){return{bootstrap:function(){Pn(Ma("mutationObserverCallbacks",{}))},noAuto:function(){so()},watch:function(t){var e=t.observeMutationsRoot;Cn?Ua():Pn(Ma("mutationObserverCallbacks",{observeMutationsRoot:e}))}}}},Nn=function(n){var t={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return n.toLowerCase().split(" ").reduce(function(e,r){var o=r.toLowerCase().split("-"),i=o[0],s=o.slice(1).join("-");if(i&&s==="h")return e.flipX=!0,e;if(i&&s==="v")return e.flipY=!0,e;if(s=parseFloat(s),isNaN(s))return e;switch(i){case"grow":e.size=e.size+s;break;case"shrink":e.size=e.size-s;break;case"left":e.x=e.x-s;break;case"right":e.x=e.x+s;break;case"up":e.y=e.y-s;break;case"down":e.y=e.y+s;break;case"rotate":e.rotate=e.rotate+s;break}return e},t)},Co={mixout:function(){return{parse:{transform:function(t){return Nn(t)}}}},hooks:function(){return{parseNodeAttributes:function(t,e){var r=e.getAttribute("data-fa-transform");return r&&(t.transform=Nn(r)),t}}},provides:function(n){n.generateAbstractTransformGrouping=function(t){var e=t.main,r=t.transform,o=t.containerWidth,i=t.iconWidth,s={transform:"translate(".concat(o/2," 256)")},l="translate(".concat(r.x*32,", ").concat(r.y*32,") "),u="scale(".concat(r.size/16*(r.flipX?-1:1),", ").concat(r.size/16*(r.flipY?-1:1),") "),m="rotate(".concat(r.rotate," 0 0)"),c={transform:"".concat(l," ").concat(u," ").concat(m)},h={transform:"translate(".concat(i/2*-1," -256)")},b={outer:s,inner:c,path:h};return{tag:"g",attributes:f({},b.outer),children:[{tag:"g",attributes:f({},b.inner),children:[{tag:e.icon.tag,children:e.icon.children,attributes:f(f({},e.icon.attributes),b.path)}]}]}}}},Ia={x:0,y:0,width:"100%",height:"100%"};function Tn(a){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return a.attributes&&(a.attributes.fill||n)&&(a.attributes.fill="black"),a}function No(a){return a.tag==="g"?a.children:[a]}var To={hooks:function(){return{parseNodeAttributes:function(t,e){var r=e.getAttribute("data-fa-mask"),o=r?ya(r.split(" ").map(function(i){return i.trim()})):Dt();return o.prefix||(o.prefix=D()),t.mask=o,t.maskId=e.getAttribute("data-fa-mask-id"),t}}},provides:function(n){n.generateAbstractMask=function(t){var e=t.children,r=t.attributes,o=t.main,i=t.mask,s=t.maskId,l=t.transform,u=o.width,m=o.icon,c=i.width,h=i.icon,b=ki({transform:l,containerWidth:c,iconWidth:u}),k={tag:"rect",attributes:f(f({},Ia),{},{fill:"white"})},y=m.children?{children:m.children.map(Tn)}:{},I={tag:"g",attributes:f({},b.inner),children:[Tn(f({tag:m.tag,attributes:f(f({},m.attributes),b.path)},y))]},d={tag:"g",attributes:f({},b.outer),children:[I]},p="mask-".concat(s||gn()),w="clip-".concat(s||gn()),P={tag:"mask",attributes:f(f({},Ia),{},{id:p,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[k,d]},z={tag:"defs",children:[{tag:"clipPath",attributes:{id:w},children:No(h)},P]};return e.push(z,{tag:"rect",attributes:f({fill:"currentColor","clip-path":"url(#".concat(w,")"),mask:"url(#".concat(p,")")},Ia)}),{children:e,attributes:r}}}},_o={provides:function(n){var t=!1;M.matchMedia&&(t=M.matchMedia("(prefers-reduced-motion: reduce)").matches),n.missingIconAbstract=function(){var e=[],r={fill:"currentColor"},o={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};e.push({tag:"path",attributes:f(f({},r),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var i=f(f({},o),{},{attributeName:"opacity"}),s={tag:"circle",attributes:f(f({},r),{},{cx:"256",cy:"364",r:"28"}),children:[]};return t||s.children.push({tag:"animate",attributes:f(f({},o),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:f(f({},i),{},{values:"1;0;1;1;0;1;"})}),e.push(s),e.push({tag:"path",attributes:f(f({},r),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:t?[]:[{tag:"animate",attributes:f(f({},i),{},{values:"1;0;0;0;0;1;"})}]}),t||e.push({tag:"path",attributes:f(f({},r),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:f(f({},i),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:e}}}},$o={hooks:function(){return{parseNodeAttributes:function(t,e){var r=e.getAttribute("data-fa-symbol"),o=r===null?!1:r===""?!0:r;return t.symbol=o,t}}}},Mo=[zi,ho,yo,xo,wo,Eo,jo,Co,To,_o,$o];Bi(Mo,{mixoutsTo:O});O.noAuto;O.config;O.library;O.dom;var Ya=O.parse;O.findIconDefinition;O.toHtml;var Do=O.icon;O.layer;O.text;O.counter;function Xa(a,n){(n==null||n>a.length)&&(n=a.length);for(var t=0,e=Array(n);t<n;t++)e[t]=a[t];return e}function Lo(a){if(Array.isArray(a))return Xa(a)}function x(a,n,t){return(n=Xo(n))in a?Object.defineProperty(a,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):a[n]=t,a}function Ro(a){if(typeof Symbol<"u"&&a[Symbol.iterator]!=null||a["@@iterator"]!=null)return Array.from(a)}function Wo(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function _n(a,n){var t=Object.keys(a);if(Object.getOwnPropertySymbols){var e=Object.getOwnPropertySymbols(a);n&&(e=e.filter(function(r){return Object.getOwnPropertyDescriptor(a,r).enumerable})),t.push.apply(t,e)}return t}function A(a){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?_n(Object(t),!0).forEach(function(e){x(a,e,t[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(t)):_n(Object(t)).forEach(function(e){Object.defineProperty(a,e,Object.getOwnPropertyDescriptor(t,e))})}return a}function za(a,n){if(a==null)return{};var t,e,r=Uo(a,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(a);for(e=0;e<o.length;e++)t=o[e],n.indexOf(t)===-1&&{}.propertyIsEnumerable.call(a,t)&&(r[t]=a[t])}return r}function Uo(a,n){if(a==null)return{};var t={};for(var e in a)if({}.hasOwnProperty.call(a,e)){if(n.indexOf(e)!==-1)continue;t[e]=a[e]}return t}function Bo(a){return Lo(a)||Ro(a)||Ho(a)||Wo()}function Yo(a,n){if(typeof a!="object"||!a)return a;var t=a[Symbol.toPrimitive];if(t!==void 0){var e=t.call(a,n);if(typeof e!="object")return e;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(a)}function Xo(a){var n=Yo(a,"string");return typeof n=="symbol"?n:n+""}function va(a){"@babel/helpers - typeof";return va=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},va(a)}function Ho(a,n){if(a){if(typeof a=="string")return Xa(a,n);var t={}.toString.call(a).slice(8,-1);return t==="Object"&&a.constructor&&(t=a.constructor.name),t==="Map"||t==="Set"?Array.from(a):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?Xa(a,n):void 0}}function Fa(a,n){return Array.isArray(n)&&n.length>0||!Array.isArray(n)&&n?x({},a,n):{}}function Go(a){var n,t=(n={"fa-spin":a.spin,"fa-pulse":a.pulse,"fa-fw":a.fixedWidth,"fa-border":a.border,"fa-li":a.listItem,"fa-inverse":a.inverse,"fa-flip":a.flip===!0,"fa-flip-horizontal":a.flip==="horizontal"||a.flip==="both","fa-flip-vertical":a.flip==="vertical"||a.flip==="both"},x(x(x(x(x(x(x(x(x(x(n,"fa-".concat(a.size),a.size!==null),"fa-rotate-".concat(a.rotation),a.rotation!==null),"fa-rotate-by",a.rotateBy),"fa-pull-".concat(a.pull),a.pull!==null),"fa-swap-opacity",a.swapOpacity),"fa-bounce",a.bounce),"fa-shake",a.shake),"fa-beat",a.beat),"fa-fade",a.fade),"fa-beat-fade",a.beatFade),x(x(x(x(x(x(x(x(x(x(n,"fa-flash",a.flash),"fa-spin-pulse",a.spinPulse),"fa-spin-reverse",a.spinReverse),"fa-width-auto",a.widthAuto),"fa-canvas-square",a.canvasSquare),"fa-canvas-roomy",a.canvasRoomy),"fa-flip-360",a.flip360),"fa-buzz",a.buzz),"fa-float",a.float),"fa-jello",a.jello),x(x(x(x(x(n,"fa-spin-snap",a.spinSnap),"fa-spin-snap-4",a.spinSnap4),"fa-spin-snap-8",a.spinSnap8),"fa-swing",a.swing),"fa-wag",a.wag));return Object.keys(t).map(function(e){return t[e]?e:null}).filter(function(e){return e})}var Ko=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Ht={exports:{}};(function(a){(function(n){var t=function(d,p,w){if(!u(p)||c(p)||h(p)||b(p)||l(p))return p;var P,z=0,C=0;if(m(p))for(P=[],C=p.length;z<C;z++)P.push(t(d,p[z],w));else{P={};for(var J in p)Object.prototype.hasOwnProperty.call(p,J)&&(P[d(J,w)]=t(d,p[J],w))}return P},e=function(d,p){p=p||{};var w=p.separator||"_",P=p.split||/(?=[A-Z])/;return d.split(P).join(w)},r=function(d){return k(d)?d:(d=d.replace(/[\-_\s]+(.)?/g,function(p,w){return w?w.toUpperCase():""}),d.substr(0,1).toLowerCase()+d.substr(1))},o=function(d){var p=r(d);return p.substr(0,1).toUpperCase()+p.substr(1)},i=function(d,p){return e(d,p).toLowerCase()},s=Object.prototype.toString,l=function(d){return typeof d=="function"},u=function(d){return d===Object(d)},m=function(d){return s.call(d)=="[object Array]"},c=function(d){return s.call(d)=="[object Date]"},h=function(d){return s.call(d)=="[object RegExp]"},b=function(d){return s.call(d)=="[object Boolean]"},k=function(d){return d=d-0,d===d},y=function(d,p){var w=p&&"process"in p?p.process:p;return typeof w!="function"?d:function(P,z){return w(P,d,z)}},I={camelize:r,decamelize:i,pascalize:o,depascalize:i,camelizeKeys:function(d,p){return t(y(r,p),d)},decamelizeKeys:function(d,p){return t(y(i,p),d,p)},pascalizeKeys:function(d,p){return t(y(o,p),d)},depascalizeKeys:function(){return this.decamelizeKeys.apply(this,arguments)}};a.exports?a.exports=I:n.humps=I})(Ko)})(Ht);var Vo=Ht.exports,Jo=["gradientFill"],Qo=["class","style"],Zo=["type","stops","id"];function qo(a){return a.split(";").map(function(n){return n.trim()}).filter(function(n){return n}).reduce(function(n,t){var e=t.indexOf(":"),r=Vo.camelize(t.slice(0,e)),o=t.slice(e+1).trim();return n[r]=o,n},{})}function as(a){return a.split(/\s+/).reduce(function(n,t){return n[t]=!0,n},{})}function ns(a,n){return la("stop",A({key:"".concat(n,"-").concat(a.offset),offset:a.offset,"stop-color":a.color},a.opacity!==void 0&&{"stop-opacity":a.opacity}))}function Gt(a){if(typeof a=="string")return a;var n=(a.children||[]).map(Gt);return a.tag==="path"&&a.attributes&&"fill"in a.attributes?A(A({},a),{},{attributes:A(A({},a.attributes),{},{fill:void 0}),children:n}):A(A({},a),{},{children:n})}function Kt(a){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof a=="string")return a;var e=n.gradientFill,r=e===void 0?null:e,o=za(n,Jo),i=!!r||"fill"in t,s=i?Gt(a):a,l=(s.children||[]).map(function(P){return Kt(P,{},{})}),u=Object.keys(s.attributes||{}).reduce(function(P,z){var C=s.attributes[z];switch(z){case"class":P.class=as(C);break;case"style":P.style=qo(C);break;default:P.attrs[z]=C}return P},{attrs:{},class:{},style:{}});t.class;var m=t.style,c=m===void 0?{}:m,h=za(t,Qo);if(r&&r.id&&(r.type==="linear"||r.type==="radial")){var b=r.type,k=r.stops,y=k===void 0?[]:k,I=r.id,d=za(r,Zo),p=b==="linear"?"linearGradient":"radialGradient",w=la(p,A(A({},d),{},{id:I}),y.map(ns));return la(s.tag,A(A(A(A({},o),{},{class:u.class,style:A(A({},u.style),c)},u.attrs),h),{},{fill:"url(#".concat(I,")")}),[w].concat(Bo(l)))}return la(a.tag,A(A(A({},o),{},{class:u.class,style:A(A({},u.style),c)},u.attrs),h),l)}var Vt=!1;try{Vt=!0}catch{}function $n(){if(!Vt&&console&&typeof console.error=="function"){var a;(a=console).error.apply(a,arguments)}}function Mn(a){if(a&&va(a)==="object"&&a.prefix&&a.iconName&&a.icon)return a;if(Ya.icon)return Ya.icon(a);if(a===null)return null;if(va(a)==="object"&&a.prefix&&a.iconName)return a;if(Array.isArray(a)&&a.length===2)return{prefix:a[0],iconName:a[1]};if(typeof a=="string")return{prefix:"fas",iconName:a}}var us=ne({name:"FontAwesomeIcon",props:{border:{type:Boolean,default:!1},fixedWidth:{type:Boolean,default:!1},flip:{type:[Boolean,String],default:!1,validator:function(n){return[!0,!1,"horizontal","vertical","both"].indexOf(n)>-1}},icon:{type:[Object,Array,String],required:!0},mask:{type:[Object,Array,String],default:null},maskId:{type:String,default:null},listItem:{type:Boolean,default:!1},pull:{type:String,default:null,validator:function(n){return["right","left"].indexOf(n)>-1}},pulse:{type:Boolean,default:!1},rotation:{type:[String,Number],default:null,validator:function(n){return[90,180,270].indexOf(Number.parseInt(n,10))>-1}},rotateBy:{type:Boolean,default:!1},swapOpacity:{type:Boolean,default:!1},size:{type:String,default:null,validator:function(n){return["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"].indexOf(n)>-1}},spin:{type:Boolean,default:!1},transform:{type:[String,Object],default:null},symbol:{type:[Boolean,String],default:!1},title:{type:String,default:null},titleId:{type:String,default:null},inverse:{type:Boolean,default:!1},bounce:{type:Boolean,default:!1},shake:{type:Boolean,default:!1},beat:{type:Boolean,default:!1},fade:{type:Boolean,default:!1},beatFade:{type:Boolean,default:!1},flash:{type:Boolean,default:!1},spinPulse:{type:Boolean,default:!1},spinReverse:{type:Boolean,default:!1},widthAuto:{type:Boolean,default:!1},canvasSquare:{type:Boolean,default:!1},canvasRoomy:{type:Boolean,default:!1},gradientFill:{type:Object,default:null,validator:function(n){return typeof n.id!="string"||!n.id?(console.warn("FontAwesomeIcon: gradientFill.id must be a non-empty string"),!1):n.type!=="linear"&&n.type!=="radial"?(console.warn('FontAwesomeIcon: gradientFill.type must be "linear" or "radial"'),!1):!0}},flip360:{type:Boolean,default:!1},buzz:{type:Boolean,default:!1},float:{type:Boolean,default:!1},jello:{type:Boolean,default:!1},spinSnap:{type:Boolean,default:!1},spinSnap4:{type:Boolean,default:!1},spinSnap8:{type:Boolean,default:!1},swing:{type:Boolean,default:!1},wag:{type:Boolean,default:!1}},setup:function(n,t){var e=t.attrs,r=Y(function(){return Mn(n.icon)}),o=Y(function(){return Fa("classes",Go(n))}),i=Y(function(){return Fa("transform",typeof n.transform=="string"?Ya.transform(n.transform):n.transform)}),s=Y(function(){return Fa("mask",Mn(n.mask))}),l=Y(function(){var m=A(A(A(A({},o.value),i.value),s.value),{},{symbol:n.symbol,maskId:n.maskId});return m.title=n.title,m.titleId=n.titleId,Do(r.value,m)});te(l,function(m){if(!m)return $n("Could not find one or more icon(s)",r.value,s.value)},{immediate:!0}),n.gradientFill&&n.symbol&&$n("gradientFill is not supported when symbol is true and will be ignored");var u=Y(function(){return l.value?Kt(l.value.abstract[0],{gradientFill:n.symbol?null:n.gradientFill},e):null});return function(){return u.value}}});let R=Promise.resolve(!0);function Jt(a){const n=globalThis.crypto?.randomUUID?.();return`${a}-${n||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`}`}function cs(a){return{...a,runId:Jt("run")}}function Dn(a){return{titre:a.titre,instruction:a.instruction,consigne:a.consigne,reponses:[...a.reponses],reponsesPourCorrige:[...a.reponsesPourCorrige],futureSimpleAnswers:a.futureSimpleAnswers?[...a.futureSimpleAnswers]:void 0,conjugationConfusions:a.conjugationConfusions?a.conjugationConfusions.map(n=>({tense:n.tense,mode:n.mode,answers:[...n.answers]})):void 0,verbeId:a.verbeId,tenseId:a.tenseId,personId:a.personId,infinitif:a.infinitif,pronom:a.pronom,temps:a.temps,mode:a.mode,isCompound:a.isCompound,conjugaison1:a.conjugaison1,conjugaison2:a.conjugaison2,conjugaison3:a.conjugaison3,radicalReference:a.radicalReference?.paradigmForms?.length?{kind:a.radicalReference.kind,label:a.radicalReference.label,form:a.radicalReference.form,removableEnding:a.radicalReference.removableEnding,radical:a.radicalReference.radical,paradigmForms:a.radicalReference.paradigmForms.map(n=>({...n}))}:void 0,complement:a.complement,complementPosition:a.complementPosition,complementFunction:a.complementFunction,saisiePrefixe:a.saisiePrefixe,agreementReminder:a.agreementReminder?{...a.agreementReminder}:void 0,literaryCitation:a.literaryCitation?{...a.literaryCitation}:void 0}}function ds(){const{user:a,clearUser:n}=ee();function t(r,o){if(!r||!a.value||!o.length)return Promise.resolve(!1);const i=async()=>{try{return await $fetch("/api/learner/activity/plan",{method:"POST",credentials:"same-origin",body:{...r,questions:o.map(Dn)}}),!0}catch(s){return(s?.statusCode??s?.response?.status)===401&&n(),console.error("[learner] Plan de questions non enregistré.",s),!1}};return R=R.then(i,i),R}function e(r,o,i){if(!r||!a.value)return Promise.resolve(!1);const s=async()=>{try{return await $fetch("/api/learner/activity/attempt",{method:"POST",credentials:"same-origin",body:{attemptId:Jt("attempt"),...r,questionIndex:i+(r.questionIndexOffset||0),attemptNumber:o.attemptNumber||1,question:Dn(o.question),answer:o.answer,correct:o.status==="correct"&&!o.answerWasHeard}}),!0}catch(l){return(l?.statusCode??l?.response?.status)===401&&n(),console.error("[learner] Tentative non enregistrée.",l),!1}};return R=R.then(s,s),R}return{recordQuestionPlan:t,recordAttempt:e,flushProgress:()=>R}}export{us as F,ds as a,ls as b,cs as c,ss as d,os as e,is as f,fs as g,rs as u};
