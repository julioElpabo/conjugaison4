const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./ni5V7eBP.js","./DXMz2Rmn.js","./entry.CRRjxRjR.css"])))=>i.map(i=>d[i]);
import{a as ka,c as ar}from"./BeHZwg2h.js";import{u as st}from"./CC6Dg-HR.js";import{p as F,e as Me,f as Ie,ab as $t,q as He,M as mt,c as S,a as r,t as c,h as o,N as ir,b as Ue,o as x,l as G,y as wn,n as ye,d as oe,i as M,W as ut,w as Ve,E as At,F as K,r as re,j as Tt,g as kn,T as Sa,aa as Nn,z as jt,ac as rr,k as Zt,v as en,D as tn,C as or,a9 as sr,J as lr}from"./DXMz2Rmn.js";import{_ as Lt}from"./DlAUqK2U.js";import{u as $a}from"./mptZLsEg.js";import{u as Ca}from"./CIWLdEfe.js";import{_ as ur}from"./CZmBEfY8.js";import{b as Mn}from"./CgdsjPvq.js";import{i as Dn}from"./gJpU8yXm.js";import{n as cr,m as fr}from"./g6ucs01C.js";const Pa=["cod-after","coi-after"];function dr(e,n){return e?n==="before"?["cod-before"]:n==="mixed"?["cod-after","cod-before","coi-after"]:[...Pa]:[]}function mr(e){const n=e.some(a=>a.endsWith("-before")),t=e.some(a=>a.endsWith("-after"));return{includeComplements:e.length>0,complementPlacement:n&&t?"mixed":n?"before":"after"}}function Sm(e){return[e.groupLabel||ka[e.group]||e.group,e.label].filter(Boolean).join(" | ")}function $m(e){return Number.isInteger(e)&&Number(e)>0?`${Number(e)} au hasard`:"Tous les verbes"}const Rn={exerciseKind:"conjugation",identificationSource:"selected-verbs",literaryRegister:"all",pastSimplePronouns:"all",inclusivePronouns:!1,includeComplements:!0,complementPlacement:"after",complementOptions:[...Pa]},pr=()=>({title:"Défi de conjugaison",questionSpacingMm:8,titleSpacingMm:30,showGrade:!0,showVerbs:!1,showTenses:!1,showFirstName:!0,showLastName:!0,showDate:!0,showRandomNumber:!0}),Bn=()=>({verbIds:[1,2,3,4],tenseIds:[1,3,4,5],questionCount:10,...Rn,complementOptions:[...Rn.complementOptions],printOptions:pr()});function Cm(){const e=st("challenge-catalogue",()=>({verbes:[],modes:[],temps:[],presets:[]})),n=st("challenge-config",Bn),t=st("challenge-catalogue-status",()=>"idle"),a=st("challenge-catalogue-error",()=>""),i=F(()=>{const d=new Map(e.value.verbes.map(P=>[P.id,P]));return n.value.verbIds.map(P=>d.get(P)).filter(P=>!!P)}),s=F(()=>{const d=new Map(e.value.temps.map(C=>[C.id,C])),P=new Map(e.value.modes.map(C=>[C.id,C]));return n.value.tenseIds.map(C=>d.get(C)).filter(C=>!!C).map(C=>({...C,mode:C.mode||P.get(C.modeId)}))}),l=F(()=>n.value.verbIds.length>0&&n.value.tenseIds.length>0&&n.value.questionCount>0);function u(){const d=e.value.modes.find(C=>C.name.toLocaleLowerCase("fr")==="indicatif");if(!d)return[1,3,4,5];const P=new Set(["présent","futur proche","imparfait","passé composé","futur","futur simple"]);return e.value.temps.filter(C=>C.modeId===d.id&&P.has(C.name.toLocaleLowerCase("fr"))).map(C=>C.id)}async function f(d=!1){const P=e.value.temps.length>0&&e.value.temps.every(C=>!!C.example?.trim());if(!d&&t.value==="success"&&P)return e.value;t.value="loading",a.value="";try{const C=await $fetch("/api/catalogue");e.value={verbes:[...C.verbes].sort((E,Y)=>E.infinitif.localeCompare(Y.infinitif,"fr")),modes:[...C.modes].sort((E,Y)=>E.order-Y.order||E.id-Y.id),temps:[...C.temps],presets:[...C.presets]};const L=new Set(e.value.verbes.map(E=>E.id)),X=new Set(e.value.temps.map(E=>E.id)),D=u();return n.value.verbIds=n.value.verbIds.filter(E=>L.has(E)),n.value.tenseIds=n.value.tenseIds.filter(E=>X.has(E)),n.value.verbIds.length===0&&(n.value.verbIds=e.value.verbes.slice(0,4).map(E=>E.id)),n.value.tenseIds.length===0&&(n.value.tenseIds=D.length>0?D:e.value.temps.slice(0,1).map(E=>E.id)),t.value="success",e.value}catch(C){throw t.value="error",a.value=gr(C,"Impossible de charger le catalogue."),C}}function b(d){n.value.verbIds.includes(d)||(n.value.verbIds=[...n.value.verbIds,d])}function k(d){n.value.verbIds=n.value.verbIds.filter(P=>P!==d)}function w(){n.value.verbIds=[]}function T(d){n.value.tenseIds=n.value.tenseIds.includes(d)?n.value.tenseIds.filter(P=>P!==d):[...n.value.tenseIds,d]}function A(){n.value.tenseIds=e.value.temps.map(d=>d.id)}function $(){n.value.tenseIds=[]}function h(){n.value.tenseIds=u()}function I(d){const P=new Set(e.value.verbes.map(L=>L.id)),C=new Set(e.value.temps.map(L=>L.id));n.value={...n.value,verbIds:d.verbIds.filter(L=>P.has(L)),tenseIds:d.tenseIds.filter(L=>C.has(L)),questionCount:d.questionCount}}function y(d){const P=Bn();I(d);const C=d.complementOptions??(d.includeComplements===void 0?[...P.complementOptions]:dr(d.includeComplements,d.complementPlacement??"after")),L=mr(C);n.value={...n.value,exerciseKind:d.exerciseKind??P.exerciseKind,identificationSource:d.identificationSource??P.identificationSource,literaryRegister:d.literaryRegister??P.literaryRegister,pastSimplePronouns:d.pastSimplePronouns??P.pastSimplePronouns,inclusivePronouns:d.inclusivePronouns??P.inclusivePronouns,includeComplements:L.includeComplements,complementPlacement:L.complementPlacement,complementOptions:C,printOptions:{...P.printOptions,...d.printOptions??{}}}}return{catalogue:e,challenge:n,catalogueStatus:t,catalogueError:a,selectedVerbs:i,selectedTenses:s,isReady:l,loadCatalogue:f,addVerb:b,removeVerb:k,clearVerbs:w,toggleTense:T,selectAllTenses:A,clearTenses:$,selectDefaultTenses:h,applySelection:I,applySharedChallenge:y}}function gr(e,n="Une erreur est survenue."){if(e&&typeof e=="object"){const t=e;return t.data?.statusMessage||t.data?.message||t.statusMessage||t.message||n}return n}function vr(e){return{verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,identificationSource:e.identificationSource??"selected-verbs",literaryRegister:e.literaryRegister??"all",pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions]}}function br(e){const n=e.toUpperCase().replace(/[^A-Z0-9]/g,"");return n.length===8?n.match(/.{1,2}/g)?.join("-")??n:e.trim().toUpperCase()}function hr(e,n,t){return{version:1,...n===void 0?{}:{title:n.trim()},...t?.trim()?{description:t.trim()}:{},verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,identificationSource:e.identificationSource??"selected-verbs",literaryRegister:e.literaryRegister??"all",pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions],printOptions:{...e.printOptions}}}function Pm(){async function e(a){return await $fetch("/api/questionnaires",{method:"POST",body:vr(a)})}async function n(a,i,s=""){return await $fetch("/api/defis",{method:"POST",body:hr(a,i,s)})}async function t(a){const i=br(a);return await $fetch(`/api/defis/${encodeURIComponent(i)}`)}return{generateQuestions:e,saveChallenge:n,loadChallenge:t}}function nn(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function yr(e){if(Array.isArray(e))return e}function xr(e){if(Array.isArray(e))return nn(e)}function _r(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function wr(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,Ia(a.key),a)}}function kr(e,n,t){return n&&wr(e.prototype,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function Ct(e,n){var t=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=Sn(e))||n){t&&(e=t);var a=0,i=function(){};return{s:i,n:function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}},e:function(f){throw f},f:i}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var s,l=!0,u=!1;return{s:function(){t=t.call(e)},n:function(){var f=t.next();return l=f.done,f},e:function(f){u=!0,s=f},f:function(){try{l||t.return==null||t.return()}finally{if(u)throw s}}}}function O(e,n,t){return(n=Ia(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function Sr(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function $r(e,n){var t=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(t!=null){var a,i,s,l,u=[],f=!0,b=!1;try{if(s=(t=t.call(e)).next,n===0){if(Object(t)!==t)return;f=!1}else for(;!(f=(a=s.call(t)).done)&&(u.push(a.value),u.length!==n);f=!0);}catch(k){b=!0,i=k}finally{try{if(!f&&t.return!=null&&(l=t.return(),Object(l)!==l))return}finally{if(b)throw i}}return u}}function Cr(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Pr(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Wn(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function _(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?Wn(Object(t),!0).forEach(function(a){O(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Wn(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function Nt(e,n){return yr(e)||$r(e,n)||Sn(e,n)||Cr()}function _e(e){return xr(e)||Sr(e)||Sn(e)||Pr()}function Ir(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function Ia(e){var n=Ir(e,"string");return typeof n=="symbol"?n:n+""}function Ot(e){"@babel/helpers - typeof";return Ot=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Ot(e)}function Sn(e,n){if(e){if(typeof e=="string")return nn(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?nn(e,n):void 0}}var Un=function(){},$n={},Aa={},Ta=null,ja={mark:Un,measure:Un};try{typeof window<"u"&&($n=window),typeof document<"u"&&(Aa=document),typeof MutationObserver<"u"&&(Ta=MutationObserver),typeof performance<"u"&&(ja=performance)}catch{}var Ar=$n.navigator||{},Vn=Ar.userAgent,Kn=Vn===void 0?"":Vn,Ee=$n,H=Aa,Gn=Ta,_t=ja;Ee.document;var je=!!H.documentElement&&!!H.head&&typeof H.addEventListener=="function"&&typeof H.createElement=="function",Oa=~Kn.indexOf("MSIE")||~Kn.indexOf("Trident/"),wt,Tr=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|gt|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt|sldr|slpdr|pr|ms|vs)?[\-\ ]/,jr=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Graphite|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Slab Duo|Slab Press Duo|Pixel|Mosaic|Vellum|Whiteboard)?.*/i,za={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},"slab-duo":{"fa-regular":"regular",fasldr:"regular"},"slab-press-duo":{"fa-regular":"regular",faslpdr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},vellum:{"fa-solid":"solid",favs:"solid"},pixel:{"fa-regular":"regular",fapr:"regular"},mosaic:{"fa-solid":"solid",fams:"solid"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},graphite:{"fa-thin":"thin",fagt:"thin"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},Or={GROUP:"duotone-group",PRIMARY:"primary",SECONDARY:"secondary"},Fa=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],J="classic",pt="duotone",Ea="sharp",La="sharp-duotone",Na="chisel",Ma="etch",Da="graphite",Ra="jelly",Ba="jelly-duo",Wa="jelly-fill",Ua="mosaic",Va="notdog",Ka="notdog-duo",Ga="pixel",Ha="slab",qa="slab-duo",Xa="slab-press",Ya="slab-press-duo",Qa="thumbprint",Ja="utility",Za="utility-duo",ei="utility-fill",ti="vellum",ni="whiteboard",zr="Classic",Fr="Duotone",Er="Sharp",Lr="Sharp Duotone",Nr="Chisel",Mr="Etch",Dr="Graphite",Rr="Jelly",Br="Jelly Duo",Wr="Jelly Fill",Ur="Mosaic",Vr="Notdog",Kr="Notdog Duo",Gr="Pixel",Hr="Slab",qr="Slab Duo",Xr="Slab Press",Yr="Slab Press Duo",Qr="Thumbprint",Jr="Utility",Zr="Utility Duo",eo="Utility Fill",to="Vellum",no="Whiteboard",ai=[J,pt,Ea,La,Na,Ma,Da,Ra,Ba,Wa,Ua,Va,Ka,Ga,Ha,qa,Xa,Ya,Qa,Ja,Za,ei,ti,ni];wt={},O(O(O(O(O(O(O(O(O(O(wt,J,zr),pt,Fr),Ea,Er),La,Lr),Na,Nr),Ma,Mr),Da,Dr),Ra,Rr),Ba,Br),Wa,Wr),O(O(O(O(O(O(O(O(O(O(wt,Ua,Ur),Va,Vr),Ka,Kr),Ga,Gr),Ha,Hr),qa,qr),Xa,Xr),Ya,Yr),Qa,Qr),Ja,Jr),O(O(O(O(wt,Za,Zr),ei,eo),ti,to),ni,no);var ao={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},"slab-duo":{400:"fasldr"},"slab-press-duo":{400:"faslpdr"},vellum:{900:"favs"},mosaic:{900:"fams"},pixel:{400:"fapr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},graphite:{100:"fagt"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},io={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Slab Duo":{400:"fasldr",normal:"fasldr"},"Font Awesome 7 Slab Press Duo":{400:"faslpdr",normal:"faslpdr"},"Font Awesome 7 Pixel":{400:"fapr",normal:"fapr"},"Font Awesome 7 Mosaic":{900:"fams",normal:"fams"},"Font Awesome 7 Vellum":{900:"favs",normal:"favs"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Graphite":{100:"fagt",normal:"fagt"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},ro=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["graphite",{defaultShortPrefixId:"fagt",defaultStyleId:"thin",styleIds:["thin"],futureStyleIds:[],defaultFontWeight:100}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["mosaic",{defaultShortPrefixId:"fams",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["pixel",{defaultShortPrefixId:"fapr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-duo",{defaultShortPrefixId:"fasldr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press-duo",{defaultShortPrefixId:"faslpdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["vellum",{defaultShortPrefixId:"favs",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),oo={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},graphite:{thin:"fagt"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},mosaic:{solid:"fams"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},pixel:{regular:"fapr"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-duo":{regular:"fasldr"},"slab-press":{regular:"faslpr"},"slab-press-duo":{regular:"faslpdr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},vellum:{solid:"favs"},whiteboard:{semibold:"fawsb"}},ii=["fak","fa-kit","fakd","fa-kit-duotone"],Hn={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},so=["kit"],lo="kit",uo="kit-duotone",co="Kit",fo="Kit Duotone";O(O({},lo,co),uo,fo);var mo={kit:{"fa-kit":"fak"}},po={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},go={kit:{fak:"fa-kit"}},qn={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},kt,St={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},vo=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],bo="classic",ho="duotone",yo="sharp",xo="sharp-duotone",_o="chisel",wo="etch",ko="graphite",So="jelly",$o="jelly-duo",Co="jelly-fill",Po="mosaic",Io="notdog",Ao="notdog-duo",To="pixel",jo="slab",Oo="slab-duo",zo="slab-press",Fo="slab-press-duo",Eo="thumbprint",Lo="utility",No="utility-duo",Mo="utility-fill",Do="vellum",Ro="whiteboard",Bo="Classic",Wo="Duotone",Uo="Sharp",Vo="Sharp Duotone",Ko="Chisel",Go="Etch",Ho="Graphite",qo="Jelly",Xo="Jelly Duo",Yo="Jelly Fill",Qo="Mosaic",Jo="Notdog",Zo="Notdog Duo",es="Pixel",ts="Slab",ns="Slab Duo",as="Slab Press",is="Slab Press Duo",rs="Thumbprint",os="Utility",ss="Utility Duo",ls="Utility Fill",us="Vellum",cs="Whiteboard";kt={},O(O(O(O(O(O(O(O(O(O(kt,bo,Bo),ho,Wo),yo,Uo),xo,Vo),_o,Ko),wo,Go),ko,Ho),So,qo),$o,Xo),Co,Yo),O(O(O(O(O(O(O(O(O(O(kt,Po,Qo),Io,Jo),Ao,Zo),To,es),jo,ts),Oo,ns),zo,as),Fo,is),Eo,rs),Lo,os),O(O(O(O(kt,No,ss),Mo,ls),Do,us),Ro,cs);var fs="kit",ds="kit-duotone",ms="Kit",ps="Kit Duotone";O(O({},fs,ms),ds,ps);var gs={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},"slab-duo":{"fa-regular":"fasldr"},"slab-press-duo":{"fa-regular":"faslpdr"},pixel:{"fa-regular":"fapr"},mosaic:{"fa-solid":"fams"},vellum:{"fa-solid":"favs"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},graphite:{"fa-thin":"fagt"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},vs={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],"slab-duo":["fasldr"],"slab-press-duo":["faslpdr"],pixel:["fapr"],mosaic:["fams"],vellum:["favs"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],graphite:["fagt"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},an={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},"slab-duo":{fasldr:"fa-regular"},"slab-press-duo":{faslpdr:"fa-regular"},pixel:{fapr:"fa-regular"},mosaic:{fams:"fa-solid"},vellum:{favs:"fa-solid"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},graphite:{fagt:"fa-thin"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},bs=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],ri=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fasldr","faslpdr","fapr","fams","favs","fawsb","fatl","fans","fands","faes","fagt","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(vo,bs),hs=["solid","regular","light","thin","duotone","brands","semibold"],oi=[1,2,3,4,5,6,7,8,9,10],ys=oi.concat([11,12,13,14,15,16,17,18,19,20]),xs=["aw","fw","pull-left","pull-right"],_s=[].concat(_e(Object.keys(vs)),hs,xs,["2xs","xs","sm","lg","xl","2xl","beat","beat-fade","border","bounce","buzz","canvas-square","canvas-roomy","fade","flip-360","flip-both","flip-horizontal","flip-vertical","flip","float","inverse","jello","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","spin-snap","spin-snap-4","spin-snap-8","stack-1x","stack-2x","stack","swing","ul","wag","width-auto","width-fixed",St.GROUP,St.SWAP_OPACITY,St.PRIMARY,St.SECONDARY]).concat(oi.map(function(e){return"".concat(e,"x")})).concat(ys.map(function(e){return"w-".concat(e)})),ws={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},Ae="___FONT_AWESOME___",rn=16,si="fa",li="svg-inline--fa",Ke="data-fa-i2svg",on="data-fa-pseudo-element",ks="data-fa-pseudo-element-pending",Cn="data-prefix",Pn="data-icon",Xn="fontawesome-i2svg",Ss="async",$s=["HTML","HEAD","STYLE","SCRIPT"],ui=["::before","::after",":before",":after"],ci=(function(){try{return!0}catch{return!1}})();function gt(e){return new Proxy(e,{get:function(t,a){return a in t?t[a]:t[J]}})}var fi=_({},za);fi[J]=_(_(_(_({},{"fa-duotone":"duotone"}),za[J]),Hn.kit),Hn["kit-duotone"]);var Cs=gt(fi),sn=_({},oo);sn[J]=_(_(_(_({},{duotone:"fad"}),sn[J]),qn.kit),qn["kit-duotone"]);var Yn=gt(sn),ln=_({},an);ln[J]=_(_({},ln[J]),go.kit);var In=gt(ln),un=_({},gs);un[J]=_(_({},un[J]),mo.kit);gt(un);var Ps=Tr,di="fa-layers-text",Is=jr,As=_({},ao);gt(As);var Ts=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],Kt=Or,js=[].concat(_e(so),_e(_s)),ct=Ee.FontAwesomeConfig||{};function Os(e){var n=H.querySelector("script["+e+"]");if(n)return n.getAttribute(e)}function zs(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}if(H&&typeof H.querySelector=="function"){var Fs=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];Fs.forEach(function(e){var n=Nt(e,2),t=n[0],a=n[1],i=zs(Os(t));i!=null&&(ct[a]=i)})}var mi={styleDefault:"solid",familyDefault:J,cssPrefix:si,replacementClass:li,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};ct.familyPrefix&&(ct.cssPrefix=ct.familyPrefix);var et=_(_({},mi),ct);et.autoReplaceSvg||(et.observeMutations=!1);var j={};Object.keys(mi).forEach(function(e){Object.defineProperty(j,e,{enumerable:!0,set:function(t){et[e]=t,ft.forEach(function(a){return a(j)})},get:function(){return et[e]}})});Object.defineProperty(j,"familyPrefix",{enumerable:!0,set:function(n){et.cssPrefix=n,ft.forEach(function(t){return t(j)})},get:function(){return et.cssPrefix}});Ee.FontAwesomeConfig=j;var ft=[];function Es(e){return ft.push(e),function(){ft.splice(ft.indexOf(e),1)}}var Ye=rn,$e={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Ls(e){if(!(!e||!je)){var n=H.createElement("style");n.setAttribute("type","text/css"),n.innerHTML=e;for(var t=H.head.childNodes,a=null,i=t.length-1;i>-1;i--){var s=t[i],l=(s.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(l)>-1&&(a=s)}return H.head.insertBefore(n,a),e}}var Ns="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function Qn(){for(var e=12,n="";e-- >0;)n+=Ns[Math.random()*62|0];return n}function tt(e){for(var n=[],t=(e||[]).length>>>0;t--;)n[t]=e[t];return n}function An(e){return e.classList?tt(e.classList):(e.getAttribute("class")||"").split(" ").filter(function(n){return n})}function pi(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ms(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,'="').concat(pi(e[t]),'" ')},"").trim()}function Mt(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,": ").concat(e[t].trim(),";")},"")}function Tn(e){return e.size!==$e.size||e.x!==$e.x||e.y!==$e.y||e.rotate!==$e.rotate||e.flipX||e.flipY}function Ds(e){var n=e.transform,t=e.containerWidth,a=e.iconWidth,i={transform:"translate(".concat(t/2," 256)")},s="translate(".concat(n.x*32,", ").concat(n.y*32,") "),l="scale(".concat(n.size/16*(n.flipX?-1:1),", ").concat(n.size/16*(n.flipY?-1:1),") "),u="rotate(".concat(n.rotate," 0 0)"),f={transform:"".concat(s," ").concat(l," ").concat(u)},b={transform:"translate(".concat(a/2*-1," -256)")};return{outer:i,inner:f,path:b}}function Rs(e){var n=e.transform,t=e.width,a=t===void 0?rn:t,i=e.height,s=i===void 0?rn:i,l="";return Oa?l+="translate(".concat(n.x/Ye-a/2,"em, ").concat(n.y/Ye-s/2,"em) "):l+="translate(calc(-50% + ".concat(n.x/Ye,"em), calc(-50% + ").concat(n.y/Ye,"em)) "),l+="scale(".concat(n.size/Ye*(n.flipX?-1:1),", ").concat(n.size/Ye*(n.flipY?-1:1),") "),l+="rotate(".concat(n.rotate,"deg) "),l}var Bs=`:root, :host {
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
}`;function gi(){var e=si,n=li,t=j.cssPrefix,a=j.replacementClass,i=Bs;if(t!==e||a!==n){var s=new RegExp("\\.".concat(e,"\\-"),"g"),l=new RegExp("\\--".concat(e,"\\-"),"g"),u=new RegExp("\\.".concat(n),"g");i=i.replace(s,".".concat(t,"-")).replace(l,"--".concat(t,"-")).replace(u,".".concat(a))}return i}var Jn=!1;function Gt(){j.autoAddCss&&!Jn&&(Ls(gi()),Jn=!0)}var Ws={mixout:function(){return{dom:{css:gi,insertCss:Gt}}},hooks:function(){return{beforeDOMElementCreation:function(){Gt()},beforeI2svg:function(){Gt()}}}},Te=Ee||{};Te[Ae]||(Te[Ae]={});Te[Ae].styles||(Te[Ae].styles={});Te[Ae].hooks||(Te[Ae].hooks={});Te[Ae].shims||(Te[Ae].shims=[]);var xe=Te[Ae],vi=[],bi=function(){H.removeEventListener("DOMContentLoaded",bi),zt=1,vi.map(function(n){return n()})},zt=!1;je&&(zt=(H.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(H.readyState),zt||H.addEventListener("DOMContentLoaded",bi));function Us(e){je&&(zt?setTimeout(e,0):vi.push(e))}function vt(e){var n=e.tag,t=e.attributes,a=t===void 0?{}:t,i=e.children,s=i===void 0?[]:i;return typeof e=="string"?pi(e):"<".concat(n," ").concat(Ms(a),">").concat(s.map(vt).join(""),"</").concat(n,">")}function Zn(e,n,t){if(e&&e[n]&&e[n][t])return{prefix:n,iconName:t,icon:e[n][t]}}var Ht=function(n,t,a,i){var s=Object.keys(n),l=s.length,u=t,f,b,k;for(a===void 0?(f=1,k=n[s[0]]):(f=0,k=a);f<l;f++)b=s[f],k=u(k,n[b],b,n);return k};function hi(e){return _e(e).length!==1?null:e.codePointAt(0).toString(16)}function ea(e){return Object.keys(e).reduce(function(n,t){var a=e[t],i=!!a.icon;return i?n[a.iconName]=a.icon:n[t]=a,n},{})}function cn(e,n){var t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},a=t.skipHooks,i=a===void 0?!1:a,s=ea(n);typeof xe.hooks.addPack=="function"&&!i?xe.hooks.addPack(e,ea(n)):xe.styles[e]=_(_({},xe.styles[e]||{}),s),e==="fas"&&cn("fa",n)}var dt=xe.styles,Vs=xe.shims,yi=Object.keys(In),Ks=yi.reduce(function(e,n){return e[n]=Object.keys(In[n]),e},{}),jn=null,xi={},_i={},wi={},ki={},Si={};function Gs(e){return~js.indexOf(e)}function Hs(e,n){var t=n.split("-"),a=t[0],i=t.slice(1).join("-");return a===e&&i!==""&&!Gs(i)?i:null}var $i=function(){var n=function(s){return Ht(dt,function(l,u,f){return l[f]=Ht(u,s,{}),l},{})};xi=n(function(i,s,l){if(s[3]&&(i[s[3]]=l),s[2]){var u=s[2].filter(function(f){return typeof f=="number"});u.forEach(function(f){i[f.toString(16)]=l})}return i}),_i=n(function(i,s,l){if(i[l]=l,s[2]){var u=s[2].filter(function(f){return typeof f=="string"});u.forEach(function(f){i[f]=l})}return i}),Si=n(function(i,s,l){var u=s[2];return i[l]=l,u.forEach(function(f){i[f]=l}),i});var t="far"in dt||j.autoFetchSvg,a=Ht(Vs,function(i,s){var l=s[0],u=s[1],f=s[2];return u==="far"&&!t&&(u="fas"),typeof l=="string"&&(i.names[l]={prefix:u,iconName:f}),typeof l=="number"&&(i.unicodes[l.toString(16)]={prefix:u,iconName:f}),i},{names:{},unicodes:{}});wi=a.names,ki=a.unicodes,jn=Dt(j.styleDefault,{family:j.familyDefault})};Es(function(e){jn=Dt(e.styleDefault,{family:j.familyDefault})});$i();function On(e,n){return(xi[e]||{})[n]}function qs(e,n){return(_i[e]||{})[n]}function We(e,n){return(Si[e]||{})[n]}function Ci(e){return wi[e]||{prefix:null,iconName:null}}function Xs(e){var n=ki[e],t=On("fas",e);return n||(t?{prefix:"fas",iconName:t}:null)||{prefix:null,iconName:null}}function Le(){return jn}var Pi=function(){return{prefix:null,iconName:null,rest:[]}};function Ys(e){var n=J,t=yi.reduce(function(a,i){return a[i]="".concat(j.cssPrefix,"-").concat(i),a},{});return ai.forEach(function(a){(e.includes(t[a])||e.some(function(i){return Ks[a].includes(i)}))&&(n=a)}),n}function Dt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.family,a=t===void 0?J:t,i=Cs[a][e];if(a===pt&&!e)return"fad";var s=Yn[a][e]||Yn[a][i],l=e in xe.styles?e:null,u=s||l||null;return u}function Qs(e){var n=[],t=null;return e.forEach(function(a){var i=Hs(j.cssPrefix,a);i?t=i:a&&n.push(a)}),{iconName:t,rest:n}}function ta(e){return e.sort().filter(function(n,t,a){return a.indexOf(n)===t})}var na=ri.concat(ii);function Rt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.skipLookups,a=t===void 0?!1:t,i=null,s=ta(e.filter(function(A){return na.includes(A)})),l=ta(e.filter(function(A){return!na.includes(A)})),u=s.filter(function(A){return i=A,!Fa.includes(A)}),f=Nt(u,1),b=f[0],k=b===void 0?null:b,w=Ys(s),T=_(_({},Qs(l)),{},{prefix:Dt(k,{family:w})});return _(_(_({},T),tl({values:e,family:w,styles:dt,config:j,canonical:T,givenPrefix:i})),Js(a,i,T))}function Js(e,n,t){var a=t.prefix,i=t.iconName;if(e||!a||!i)return{prefix:a,iconName:i};var s=n==="fa"?Ci(i):{},l=We(a,i);return i=s.iconName||l||i,a=s.prefix||a,a==="far"&&!dt.far&&dt.fas&&!j.autoFetchSvg&&(a="fas"),{prefix:a,iconName:i}}var Zs=ai.filter(function(e){return e!==J||e!==pt}),el=Object.keys(an).filter(function(e){return e!==J}).map(function(e){return Object.keys(an[e])}).flat();function tl(e){var n=e.values,t=e.family,a=e.canonical,i=e.givenPrefix,s=i===void 0?"":i,l=e.styles,u=l===void 0?{}:l,f=e.config,b=f===void 0?{}:f,k=t===pt,w=n.includes("fa-duotone")||n.includes("fad"),T=b.familyDefault==="duotone",A=a.prefix==="fad"||a.prefix==="fa-duotone";if(!k&&(w||T||A)&&(a.prefix="fad"),(n.includes("fa-brands")||n.includes("fab"))&&(a.prefix="fab"),!a.prefix&&Zs.includes(t)){var $=Object.keys(u).find(function(I){return el.includes(I)});if($||b.autoFetchSvg){var h=ro.get(t).defaultShortPrefixId;a.prefix=h,a.iconName=We(a.prefix,a.iconName)||a.iconName}}return(a.prefix==="fa"||s==="fa")&&(a.prefix=Le()||"fas"),a}var nl=(function(){function e(){_r(this,e),this.definitions={}}return kr(e,[{key:"add",value:function(){for(var t=this,a=arguments.length,i=new Array(a),s=0;s<a;s++)i[s]=arguments[s];var l=i.reduce(this._pullDefinitions,{});Object.keys(l).forEach(function(u){t.definitions[u]=_(_({},t.definitions[u]||{}),l[u]),cn(u,l[u]);var f=In[J][u];f&&cn(f,l[u]),$i()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(t,a){var i=a.prefix&&a.iconName&&a.icon?{0:a}:a;return Object.keys(i).map(function(s){var l=i[s],u=l.prefix,f=l.iconName,b=l.icon,k=b[2];t[u]||(t[u]={}),k.length>0&&k.forEach(function(w){typeof w=="string"&&(t[u][w]=b)}),t[u][f]=b}),t}}])})(),aa=[],Qe={},Ze={},al=Object.keys(Ze);function il(e,n){var t=n.mixoutsTo;return aa=e,Qe={},Object.keys(Ze).forEach(function(a){al.indexOf(a)===-1&&delete Ze[a]}),aa.forEach(function(a){var i=a.mixout?a.mixout():{};if(Object.keys(i).forEach(function(l){typeof i[l]=="function"&&(t[l]=i[l]),Ot(i[l])==="object"&&Object.keys(i[l]).forEach(function(u){t[l]||(t[l]={}),t[l][u]=i[l][u]})}),a.hooks){var s=a.hooks();Object.keys(s).forEach(function(l){Qe[l]||(Qe[l]=[]),Qe[l].push(s[l])})}a.provides&&a.provides(Ze)}),t}function fn(e,n){for(var t=arguments.length,a=new Array(t>2?t-2:0),i=2;i<t;i++)a[i-2]=arguments[i];var s=Qe[e]||[];return s.forEach(function(l){n=l.apply(null,[n].concat(a))}),n}function Ge(e){for(var n=arguments.length,t=new Array(n>1?n-1:0),a=1;a<n;a++)t[a-1]=arguments[a];var i=Qe[e]||[];i.forEach(function(s){s.apply(null,t)})}function Ne(){var e=arguments[0],n=Array.prototype.slice.call(arguments,1);return Ze[e]?Ze[e].apply(null,n):void 0}function dn(e){e.prefix==="fa"&&(e.prefix="fas");var n=e.iconName,t=e.prefix||Le();if(n)return n=We(t,n)||n,Zn(Ii.definitions,t,n)||Zn(xe.styles,t,n)}var Ii=new nl,rl=function(){j.autoReplaceSvg=!1,j.observeMutations=!1,Ge("noAuto")},ol={i2svg:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return je?(Ge("beforeI2svg",n),Ne("pseudoElements2svg",n),Ne("i2svg",n)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot;j.autoReplaceSvg===!1&&(j.autoReplaceSvg=!0),j.observeMutations=!0,Us(function(){ll({autoReplaceSvgRoot:t}),Ge("watch",n)})}},sl={icon:function(n){if(n===null)return null;if(Ot(n)==="object"&&n.prefix&&n.iconName)return{prefix:n.prefix,iconName:We(n.prefix,n.iconName)||n.iconName};if(Array.isArray(n)&&n.length===2){var t=n[1].indexOf("fa-")===0?n[1].slice(3):n[1],a=Dt(n[0]);return{prefix:a,iconName:We(a,t)||t}}if(typeof n=="string"&&(n.indexOf("".concat(j.cssPrefix,"-"))>-1||n.match(Ps))){var i=Rt(n.split(" "),{skipLookups:!0});return{prefix:i.prefix||Le(),iconName:We(i.prefix,i.iconName)||i.iconName}}if(typeof n=="string"){var s=Le();return{prefix:s,iconName:We(s,n)||n}}}},ue={noAuto:rl,config:j,dom:ol,parse:sl,library:Ii,findIconDefinition:dn,toHtml:vt},ll=function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot,a=t===void 0?H:t;(Object.keys(xe.styles).length>0||j.autoFetchSvg)&&je&&j.autoReplaceSvg&&ue.dom.i2svg({node:a})};function Bt(e,n){return Object.defineProperty(e,"abstract",{get:n}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(function(a){return vt(a)})}}),Object.defineProperty(e,"node",{get:function(){if(je){var a=H.createElement("div");return a.innerHTML=e.html,a.children}}}),e}function ul(e){var n=e.children,t=e.main,a=e.mask,i=e.attributes,s=e.styles,l=e.transform;if(Tn(l)&&t.found&&!a.found){var u=t.width,f=t.height,b={x:u/f/2,y:.5};i.style=Mt(_(_({},s),{},{"transform-origin":"".concat(b.x+l.x/16,"em ").concat(b.y+l.y/16,"em")}))}return[{tag:"svg",attributes:i,children:n}]}function cl(e){var n=e.prefix,t=e.iconName,a=e.children,i=e.attributes,s=e.symbol,l=s===!0?"".concat(n,"-").concat(j.cssPrefix,"-").concat(t):s;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:_(_({},i),{},{id:l}),children:a}]}]}function fl(e){var n=["aria-label","aria-labelledby","title","role"];return n.some(function(t){return t in e})}function zn(e){var n=e.icons,t=n.main,a=n.mask,i=e.prefix,s=e.iconName,l=e.transform,u=e.symbol,f=e.maskId,b=e.extra,k=e.watchable,w=k===void 0?!1:k,T=a.found?a:t,A=T.width,$=T.height,h=[j.replacementClass,s?"".concat(j.cssPrefix,"-").concat(s):""].filter(function(L){return b.classes.indexOf(L)===-1}).filter(function(L){return L!==""||!!L}).concat(b.classes).join(" "),I={children:[],attributes:_(_({},b.attributes),{},{"data-prefix":i,"data-icon":s,class:h,role:b.attributes.role||"img",viewBox:"0 0 ".concat(A," ").concat($)})};!fl(b.attributes)&&!b.attributes["aria-hidden"]&&(I.attributes["aria-hidden"]="true"),w&&(I.attributes[Ke]="");var y=_(_({},I),{},{prefix:i,iconName:s,main:t,mask:a,maskId:f,transform:l,symbol:u,styles:_({},b.styles)}),d=a.found&&t.found?Ne("generateAbstractMask",y)||{children:[],attributes:{}}:Ne("generateAbstractIcon",y)||{children:[],attributes:{}},P=d.children,C=d.attributes;return y.children=P,y.attributes=C,u?cl(y):ul(y)}function ia(e){var n=e.content,t=e.width,a=e.height,i=e.transform,s=e.extra,l=e.watchable,u=l===void 0?!1:l,f=_(_({},s.attributes),{},{class:s.classes.join(" ")});u&&(f[Ke]="");var b=_({},s.styles);Tn(i)&&(b.transform=Rs({transform:i,width:t,height:a}),b["-webkit-transform"]=b.transform);var k=Mt(b);k.length>0&&(f.style=k);var w=[];return w.push({tag:"span",attributes:f,children:[n]}),w}function dl(e){var n=e.content,t=e.extra,a=_(_({},t.attributes),{},{class:t.classes.join(" ")}),i=Mt(t.styles);i.length>0&&(a.style=i);var s=[];return s.push({tag:"span",attributes:a,children:[n]}),s}var qt=xe.styles;function mn(e){var n=e[0],t=e[1],a=e.slice(4),i=Nt(a,1),s=i[0],l=null;return Array.isArray(s)?l={tag:"g",attributes:{class:"".concat(j.cssPrefix,"-").concat(Kt.GROUP)},children:[{tag:"path",attributes:{class:"".concat(j.cssPrefix,"-").concat(Kt.SECONDARY),fill:"currentColor",d:s[0]}},{tag:"path",attributes:{class:"".concat(j.cssPrefix,"-").concat(Kt.PRIMARY),fill:"currentColor",d:s[1]}}]}:l={tag:"path",attributes:{fill:"currentColor",d:s}},{found:!0,width:n,height:t,icon:l}}var ml={found:!1,width:512,height:512};function pl(e,n){!ci&&!j.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(n,'" is missing.'))}function pn(e,n){var t=n;return n==="fa"&&j.styleDefault!==null&&(n=Le()),new Promise(function(a,i){if(t==="fa"){var s=Ci(e)||{};e=s.iconName||e,n=s.prefix||n}if(e&&n&&qt[n]&&qt[n][e]){var l=qt[n][e];return a(mn(l))}pl(e,n),a(_(_({},ml),{},{icon:j.showMissingIcons&&e?Ne("missingIconAbstract")||{}:{}}))})}var ra=function(){},gn=j.measurePerformance&&_t&&_t.mark&&_t.measure?_t:{mark:ra,measure:ra},lt='FA "7.3.1"',gl=function(n){return gn.mark("".concat(lt," ").concat(n," begins")),function(){return Ai(n)}},Ai=function(n){gn.mark("".concat(lt," ").concat(n," ends")),gn.measure("".concat(lt," ").concat(n),"".concat(lt," ").concat(n," begins"),"".concat(lt," ").concat(n," ends"))},Fn={begin:gl,end:Ai},Pt=function(){};function oa(e){var n=e.getAttribute?e.getAttribute(Ke):null;return typeof n=="string"}function vl(e){var n=e.getAttribute?e.getAttribute(Cn):null,t=e.getAttribute?e.getAttribute(Pn):null;return n&&t}function bl(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(j.replacementClass)}function hl(){if(j.autoReplaceSvg===!0)return It.replace;var e=It[j.autoReplaceSvg];return e||It.replace}function yl(e){return H.createElementNS("http://www.w3.org/2000/svg",e)}function xl(e){return H.createElement(e)}function Ti(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.ceFn,a=t===void 0?e.tag==="svg"?yl:xl:t;if(typeof e=="string")return H.createTextNode(e);var i=a(e.tag);Object.keys(e.attributes||[]).forEach(function(l){i.setAttribute(l,e.attributes[l])});var s=e.children||[];return s.forEach(function(l){i.appendChild(Ti(l,{ceFn:a}))}),i}function _l(e){var n=" ".concat(e.outerHTML," ");return n="".concat(n,"Font Awesome fontawesome.com "),n}var It={replace:function(n){var t=n[0];if(t.parentNode)if(n[1].forEach(function(i){t.parentNode.insertBefore(Ti(i),t)}),t.getAttribute(Ke)===null&&j.keepOriginalSource){var a=H.createComment(_l(t));t.parentNode.replaceChild(a,t)}else t.remove()},nest:function(n){var t=n[0],a=n[1];if(~An(t).indexOf(j.replacementClass))return It.replace(n);var i=new RegExp("".concat(j.cssPrefix,"-.*"));if(delete a[0].attributes.id,a[0].attributes.class){var s=a[0].attributes.class.split(" ").reduce(function(u,f){return f===j.replacementClass||f.match(i)?u.toSvg.push(f):u.toNode.push(f),u},{toNode:[],toSvg:[]});a[0].attributes.class=s.toSvg.join(" "),s.toNode.length===0?t.removeAttribute("class"):t.setAttribute("class",s.toNode.join(" "))}var l=a.map(function(u){return vt(u)}).join(`
`);t.setAttribute(Ke,""),t.innerHTML=l}};function sa(e){e()}function ji(e,n){var t=typeof n=="function"?n:Pt;if(e.length===0)t();else{var a=sa;j.mutateApproach===Ss&&(a=Ee.requestAnimationFrame||sa),a(function(){var i=hl(),s=Fn.begin("mutate");e.map(i),s(),t()})}}var En=!1;function Oi(){En=!0}function vn(){En=!1}var Ft=null;function la(e){if(Gn&&j.observeMutations){var n=e.treeCallback,t=n===void 0?Pt:n,a=e.nodeCallback,i=a===void 0?Pt:a,s=e.pseudoElementsCallback,l=s===void 0?Pt:s,u=e.observeMutationsRoot,f=u===void 0?H:u;Ft=new Gn(function(b){if(!En){var k=Le();tt(b).forEach(function(w){if(w.type==="childList"&&w.addedNodes.length>0&&!oa(w.addedNodes[0])&&(j.searchPseudoElements&&l(w.target),t(w.target)),w.type==="attributes"&&w.target.parentNode&&j.searchPseudoElements&&l([w.target],!0),w.type==="attributes"&&oa(w.target)&&~Ts.indexOf(w.attributeName))if(w.attributeName==="class"&&vl(w.target)){var T=Rt(An(w.target)),A=T.prefix,$=T.iconName;w.target.setAttribute(Cn,A||k),$&&w.target.setAttribute(Pn,$)}else bl(w.target)&&i(w.target)})}}),je&&Ft.observe(f,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function wl(){Ft&&Ft.disconnect()}function kl(e){var n=e.getAttribute("style"),t=[];return n&&(t=n.split(";").reduce(function(a,i){var s=i.split(":"),l=s[0],u=s.slice(1);return l&&u.length>0&&(a[l]=u.join(":").trim()),a},{})),t}function Sl(e){var n=e.getAttribute("data-prefix"),t=e.getAttribute("data-icon"),a=e.innerText!==void 0?e.innerText.trim():"",i=Rt(An(e));return i.prefix||(i.prefix=Le()),n&&t&&(i.prefix=n,i.iconName=t),i.iconName&&i.prefix||(i.prefix&&a.length>0&&(i.iconName=qs(i.prefix,e.innerText)||On(i.prefix,hi(e.innerText))),!i.iconName&&j.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(i.iconName=e.firstChild.data)),i}function $l(e){var n=tt(e.attributes).reduce(function(t,a){return t.name!=="class"&&t.name!=="style"&&(t[a.name]=a.value),t},{});return n}function Cl(){return{iconName:null,prefix:null,transform:$e,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function ua(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},t=Sl(e),a=t.iconName,i=t.prefix,s=t.rest,l=$l(e),u=fn("parseNodeAttributes",{},e),f=n.styleParser?kl(e):[];return _({iconName:a,prefix:i,transform:$e,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:s,styles:f,attributes:l}},u)}var Pl=xe.styles;function zi(e){var n=j.autoReplaceSvg==="nest"?ua(e,{styleParser:!1}):ua(e);return~n.extra.classes.indexOf(di)?Ne("generateLayersText",e,n):Ne("generateSvgReplacementMutation",e,n)}function Il(){return[].concat(_e(ii),_e(ri))}function ca(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!je)return Promise.resolve();var t=H.documentElement.classList,a=function(w){return t.add("".concat(Xn,"-").concat(w))},i=function(w){return t.remove("".concat(Xn,"-").concat(w))},s=j.autoFetchSvg?Il():Fa.concat(Object.keys(Pl));s.includes("fa")||s.push("fa");var l=[".".concat(di,":not([").concat(Ke,"])")].concat(s.map(function(k){return".".concat(k,":not([").concat(Ke,"])")})).join(", ");if(l.length===0)return Promise.resolve();var u=[];try{u=tt(e.querySelectorAll(l))}catch{}if(u.length>0)a("pending"),i("complete");else return Promise.resolve();var f=Fn.begin("onTree"),b=u.reduce(function(k,w){try{var T=zi(w);T&&k.push(T)}catch(A){ci||A.name==="MissingIcon"&&console.error(A)}return k},[]);return new Promise(function(k,w){Promise.all(b).then(function(T){ji(T,function(){a("active"),a("complete"),i("pending"),typeof n=="function"&&n(),f(),k()})}).catch(function(T){f(),w(T)})})}function Al(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;zi(e).then(function(t){t&&ji([t],n)})}function Tl(e){return function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=(n||{}).icon?n:dn(n||{}),i=t.mask;return i&&(i=(i||{}).icon?i:dn(i||{})),e(a,_(_({},t),{},{mask:i}))}}var jl=function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=t.transform,i=a===void 0?$e:a,s=t.symbol,l=s===void 0?!1:s,u=t.mask,f=u===void 0?null:u,b=t.maskId,k=b===void 0?null:b,w=t.classes,T=w===void 0?[]:w,A=t.attributes,$=A===void 0?{}:A,h=t.styles,I=h===void 0?{}:h;if(n){var y=n.prefix,d=n.iconName,P=n.icon;return Bt(_({type:"icon"},n),function(){return Ge("beforeDOMElementCreation",{iconDefinition:n,params:t}),zn({icons:{main:mn(P),mask:f?mn(f.icon):{found:!1,width:null,height:null,icon:{}}},prefix:y,iconName:d,transform:_(_({},$e),i),symbol:l,maskId:k,extra:{attributes:$,styles:I,classes:T}})})}},Ol={mixout:function(){return{icon:Tl(jl)}},hooks:function(){return{mutationObserverCallbacks:function(t){return t.treeCallback=ca,t.nodeCallback=Al,t}}},provides:function(n){n.i2svg=function(t){var a=t.node,i=a===void 0?H:a,s=t.callback,l=s===void 0?function(){}:s;return ca(i,l)},n.generateSvgReplacementMutation=function(t,a){var i=a.iconName,s=a.prefix,l=a.transform,u=a.symbol,f=a.mask,b=a.maskId,k=a.extra;return new Promise(function(w,T){Promise.all([pn(i,s),f.iconName?pn(f.iconName,f.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(A){var $=Nt(A,2),h=$[0],I=$[1];w([t,zn({icons:{main:h,mask:I},prefix:s,iconName:i,transform:l,symbol:u,maskId:b,extra:k,watchable:!0})])}).catch(T)})},n.generateAbstractIcon=function(t){var a=t.children,i=t.attributes,s=t.main,l=t.transform,u=t.styles,f=Mt(u);f.length>0&&(i.style=f);var b;return Tn(l)&&(b=Ne("generateAbstractTransformGrouping",{main:s,transform:l,containerWidth:s.width,iconWidth:s.width})),a.push(b||s.icon),{children:a,attributes:i}}}},zl={mixout:function(){return{layer:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.classes,s=i===void 0?[]:i;return Bt({type:"layer"},function(){Ge("beforeDOMElementCreation",{assembler:t,params:a});var l=[];return t(function(u){Array.isArray(u)?u.map(function(f){l=l.concat(f.abstract)}):l=l.concat(u.abstract)}),[{tag:"span",attributes:{class:["".concat(j.cssPrefix,"-layers")].concat(_e(s)).join(" ")},children:l}]})}}}},Fl={mixout:function(){return{counter:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};a.title;var i=a.classes,s=i===void 0?[]:i,l=a.attributes,u=l===void 0?{}:l,f=a.styles,b=f===void 0?{}:f;return Bt({type:"counter",content:t},function(){return Ge("beforeDOMElementCreation",{content:t,params:a}),dl({content:t.toString(),extra:{attributes:u,styles:b,classes:["".concat(j.cssPrefix,"-layers-counter")].concat(_e(s))}})})}}}},El={mixout:function(){return{text:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.transform,s=i===void 0?$e:i,l=a.classes,u=l===void 0?[]:l,f=a.attributes,b=f===void 0?{}:f,k=a.styles,w=k===void 0?{}:k;return Bt({type:"text",content:t},function(){return Ge("beforeDOMElementCreation",{content:t,params:a}),ia({content:t,transform:_(_({},$e),s),extra:{attributes:b,styles:w,classes:["".concat(j.cssPrefix,"-layers-text")].concat(_e(u))}})})}}},provides:function(n){n.generateLayersText=function(t,a){var i=a.transform,s=a.extra,l=null,u=null;if(Oa){var f=parseInt(getComputedStyle(t).fontSize,10),b=t.getBoundingClientRect();l=b.width/f,u=b.height/f}return Promise.resolve([t,ia({content:t.innerHTML,width:l,height:u,transform:i,extra:s,watchable:!0})])}}},Fi=new RegExp('"',"ug"),fa=[1105920,1112319],da=_(_(_(_({},{FontAwesome:{normal:"fas",400:"fas"}}),io),ws),po),bn=Object.keys(da).reduce(function(e,n){return e[n.toLowerCase()]=da[n],e},{}),Ll=Object.keys(bn).reduce(function(e,n){var t=bn[n];return e[n]=t[900]||_e(Object.entries(t))[0][1],e},{});function Nl(e){var n=e.replace(Fi,"");return hi(_e(n)[0]||"")}function Ml(e){var n=e.getPropertyValue("font-feature-settings").includes("ss01"),t=e.getPropertyValue("content"),a=t.replace(Fi,""),i=a.codePointAt(0),s=i>=fa[0]&&i<=fa[1],l=a.length===2?a[0]===a[1]:!1;return s||l||n}function Dl(e,n){var t=e.replace(/^['"]|['"]$/g,"").toLowerCase(),a=parseInt(n),i=isNaN(a)?"normal":a;return(bn[t]||{})[i]||Ll[t]}function ma(e,n){var t="".concat(ks).concat(n.replace(":","-"));return new Promise(function(a,i){if(e.getAttribute(t)!==null)return a();var s=tt(e.children),l=s.filter(function(X){return X.getAttribute(on)===n})[0],u=Ee.getComputedStyle(e,n),f=u.getPropertyValue("font-family"),b=f.match(Is),k=u.getPropertyValue("font-weight"),w=u.getPropertyValue("content");if(l&&!b)return e.removeChild(l),a();if(b&&w!=="none"&&w!==""){var T=u.getPropertyValue("content"),A=Dl(f,k),$=Nl(T),h=b[0].startsWith("FontAwesome"),I=Ml(u),y=On(A,$),d=y;if(h){var P=Xs($);P.iconName&&P.prefix&&(y=P.iconName,A=P.prefix)}if(y&&!I&&(!l||l.getAttribute(Cn)!==A||l.getAttribute(Pn)!==d)){e.setAttribute(t,d),l&&e.removeChild(l);var C=Cl(),L=C.extra;L.attributes[on]=n,pn(y,A).then(function(X){var D=zn(_(_({},C),{},{icons:{main:X,mask:Pi()},prefix:A,iconName:d,extra:L,watchable:!0})),E=H.createElementNS("http://www.w3.org/2000/svg","svg");n==="::before"?e.insertBefore(E,e.firstChild):e.appendChild(E),E.outerHTML=D.map(function(Y){return vt(Y)}).join(`
`),e.removeAttribute(t),a()}).catch(i)}else a()}else a()})}function Rl(e){return Promise.all([ma(e,"::before"),ma(e,"::after")])}function Bl(e){return e.parentNode!==document.head&&!~$s.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(on)&&(!e.parentNode||e.parentNode.tagName!=="svg")}var Wl=function(n){return!!n&&ui.some(function(t){return n.includes(t)})},Ul=function(n){if(!n)return[];var t=new Set,a=n.split(/,(?![^()]*\))/).map(function(f){return f.trim()});a=a.flatMap(function(f){return f.includes("(")?f:f.split(",").map(function(b){return b.trim()})});var i=Ct(a),s;try{for(i.s();!(s=i.n()).done;){var l=s.value;if(Wl(l)){var u=ui.reduce(function(f,b){return f.replace(b,"")},l);u!==""&&u!=="*"&&t.add(u)}}}catch(f){i.e(f)}finally{i.f()}return t};function pa(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if(je){var t;if(n)t=e;else if(j.searchPseudoElementsFullScan)t=e.querySelectorAll("*");else{var a=new Set,i=Ct(document.styleSheets),s;try{for(i.s();!(s=i.n()).done;){var l=s.value;try{var u=Ct(l.cssRules),f;try{for(u.s();!(f=u.n()).done;){var b=f.value,k=Ul(b.selectorText),w=Ct(k),T;try{for(w.s();!(T=w.n()).done;){var A=T.value;a.add(A)}}catch(h){w.e(h)}finally{w.f()}}}catch(h){u.e(h)}finally{u.f()}}catch(h){j.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(l.href," (").concat(h.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(h){i.e(h)}finally{i.f()}if(!a.size)return;var $=Array.from(a).join(", ");try{t=e.querySelectorAll($)}catch{}}return new Promise(function(h,I){var y=tt(t).filter(Bl).map(Rl),d=Fn.begin("searchPseudoElements");Oi(),Promise.all(y).then(function(){d(),vn(),h()}).catch(function(){d(),vn(),I()})})}}var Vl={hooks:function(){return{mutationObserverCallbacks:function(t){return t.pseudoElementsCallback=pa,t}}},provides:function(n){n.pseudoElements2svg=function(t){var a=t.node,i=a===void 0?H:a;j.searchPseudoElements&&pa(i)}}},ga=!1,Kl={mixout:function(){return{dom:{unwatch:function(){Oi(),ga=!0}}}},hooks:function(){return{bootstrap:function(){la(fn("mutationObserverCallbacks",{}))},noAuto:function(){wl()},watch:function(t){var a=t.observeMutationsRoot;ga?vn():la(fn("mutationObserverCallbacks",{observeMutationsRoot:a}))}}}},va=function(n){var t={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return n.toLowerCase().split(" ").reduce(function(a,i){var s=i.toLowerCase().split("-"),l=s[0],u=s.slice(1).join("-");if(l&&u==="h")return a.flipX=!0,a;if(l&&u==="v")return a.flipY=!0,a;if(u=parseFloat(u),isNaN(u))return a;switch(l){case"grow":a.size=a.size+u;break;case"shrink":a.size=a.size-u;break;case"left":a.x=a.x-u;break;case"right":a.x=a.x+u;break;case"up":a.y=a.y-u;break;case"down":a.y=a.y+u;break;case"rotate":a.rotate=a.rotate+u;break}return a},t)},Gl={mixout:function(){return{parse:{transform:function(t){return va(t)}}}},hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-transform");return i&&(t.transform=va(i)),t}}},provides:function(n){n.generateAbstractTransformGrouping=function(t){var a=t.main,i=t.transform,s=t.containerWidth,l=t.iconWidth,u={transform:"translate(".concat(s/2," 256)")},f="translate(".concat(i.x*32,", ").concat(i.y*32,") "),b="scale(".concat(i.size/16*(i.flipX?-1:1),", ").concat(i.size/16*(i.flipY?-1:1),") "),k="rotate(".concat(i.rotate," 0 0)"),w={transform:"".concat(f," ").concat(b," ").concat(k)},T={transform:"translate(".concat(l/2*-1," -256)")},A={outer:u,inner:w,path:T};return{tag:"g",attributes:_({},A.outer),children:[{tag:"g",attributes:_({},A.inner),children:[{tag:a.icon.tag,children:a.icon.children,attributes:_(_({},a.icon.attributes),A.path)}]}]}}}},Xt={x:0,y:0,width:"100%",height:"100%"};function ba(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||n)&&(e.attributes.fill="black"),e}function Hl(e){return e.tag==="g"?e.children:[e]}var ql={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-mask"),s=i?Rt(i.split(" ").map(function(l){return l.trim()})):Pi();return s.prefix||(s.prefix=Le()),t.mask=s,t.maskId=a.getAttribute("data-fa-mask-id"),t}}},provides:function(n){n.generateAbstractMask=function(t){var a=t.children,i=t.attributes,s=t.main,l=t.mask,u=t.maskId,f=t.transform,b=s.width,k=s.icon,w=l.width,T=l.icon,A=Ds({transform:f,containerWidth:w,iconWidth:b}),$={tag:"rect",attributes:_(_({},Xt),{},{fill:"white"})},h=k.children?{children:k.children.map(ba)}:{},I={tag:"g",attributes:_({},A.inner),children:[ba(_({tag:k.tag,attributes:_(_({},k.attributes),A.path)},h))]},y={tag:"g",attributes:_({},A.outer),children:[I]},d="mask-".concat(u||Qn()),P="clip-".concat(u||Qn()),C={tag:"mask",attributes:_(_({},Xt),{},{id:d,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[$,y]},L={tag:"defs",children:[{tag:"clipPath",attributes:{id:P},children:Hl(T)},C]};return a.push(L,{tag:"rect",attributes:_({fill:"currentColor","clip-path":"url(#".concat(P,")"),mask:"url(#".concat(d,")")},Xt)}),{children:a,attributes:i}}}},Xl={provides:function(n){var t=!1;Ee.matchMedia&&(t=Ee.matchMedia("(prefers-reduced-motion: reduce)").matches),n.missingIconAbstract=function(){var a=[],i={fill:"currentColor"},s={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};a.push({tag:"path",attributes:_(_({},i),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var l=_(_({},s),{},{attributeName:"opacity"}),u={tag:"circle",attributes:_(_({},i),{},{cx:"256",cy:"364",r:"28"}),children:[]};return t||u.children.push({tag:"animate",attributes:_(_({},s),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:_(_({},l),{},{values:"1;0;1;1;0;1;"})}),a.push(u),a.push({tag:"path",attributes:_(_({},i),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:t?[]:[{tag:"animate",attributes:_(_({},l),{},{values:"1;0;0;0;0;1;"})}]}),t||a.push({tag:"path",attributes:_(_({},i),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:_(_({},l),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:a}}}},Yl={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-symbol"),s=i===null?!1:i===""?!0:i;return t.symbol=s,t}}}},Ql=[Ws,Ol,zl,Fl,El,Vl,Kl,Gl,ql,Xl,Yl];il(Ql,{mixoutsTo:ue});ue.noAuto;ue.config;ue.library;ue.dom;var hn=ue.parse;ue.findIconDefinition;ue.toHtml;var Jl=ue.icon;ue.layer;ue.text;ue.counter;function yn(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function Zl(e){if(Array.isArray(e))return yn(e)}function U(e,n,t){return(n=ru(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function eu(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function tu(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function ha(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function q(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?ha(Object(t),!0).forEach(function(a){U(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ha(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function Yt(e,n){if(e==null)return{};var t,a,i=nu(e,n);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(a=0;a<s.length;a++)t=s[a],n.indexOf(t)===-1&&{}.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}function nu(e,n){if(e==null)return{};var t={};for(var a in e)if({}.hasOwnProperty.call(e,a)){if(n.indexOf(a)!==-1)continue;t[a]=e[a]}return t}function au(e){return Zl(e)||eu(e)||ou(e)||tu()}function iu(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function ru(e){var n=iu(e,"string");return typeof n=="symbol"?n:n+""}function Et(e){"@babel/helpers - typeof";return Et=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Et(e)}function ou(e,n){if(e){if(typeof e=="string")return yn(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?yn(e,n):void 0}}function Qt(e,n){return Array.isArray(n)&&n.length>0||!Array.isArray(n)&&n?U({},e,n):{}}function su(e){var n,t=(n={"fa-spin":e.spin,"fa-pulse":e.pulse,"fa-fw":e.fixedWidth,"fa-border":e.border,"fa-li":e.listItem,"fa-inverse":e.inverse,"fa-flip":e.flip===!0,"fa-flip-horizontal":e.flip==="horizontal"||e.flip==="both","fa-flip-vertical":e.flip==="vertical"||e.flip==="both"},U(U(U(U(U(U(U(U(U(U(n,"fa-".concat(e.size),e.size!==null),"fa-rotate-".concat(e.rotation),e.rotation!==null),"fa-rotate-by",e.rotateBy),"fa-pull-".concat(e.pull),e.pull!==null),"fa-swap-opacity",e.swapOpacity),"fa-bounce",e.bounce),"fa-shake",e.shake),"fa-beat",e.beat),"fa-fade",e.fade),"fa-beat-fade",e.beatFade),U(U(U(U(U(U(U(U(U(U(n,"fa-flash",e.flash),"fa-spin-pulse",e.spinPulse),"fa-spin-reverse",e.spinReverse),"fa-width-auto",e.widthAuto),"fa-canvas-square",e.canvasSquare),"fa-canvas-roomy",e.canvasRoomy),"fa-flip-360",e.flip360),"fa-buzz",e.buzz),"fa-float",e.float),"fa-jello",e.jello),U(U(U(U(U(n,"fa-spin-snap",e.spinSnap),"fa-spin-snap-4",e.spinSnap4),"fa-spin-snap-8",e.spinSnap8),"fa-swing",e.swing),"fa-wag",e.wag));return Object.keys(t).map(function(a){return t[a]?a:null}).filter(function(a){return a})}var lu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Ei={exports:{}};(function(e){(function(n){var t=function(y,d,P){if(!b(d)||w(d)||T(d)||A(d)||f(d))return d;var C,L=0,X=0;if(k(d))for(C=[],X=d.length;L<X;L++)C.push(t(y,d[L],P));else{C={};for(var D in d)Object.prototype.hasOwnProperty.call(d,D)&&(C[y(D,P)]=t(y,d[D],P))}return C},a=function(y,d){d=d||{};var P=d.separator||"_",C=d.split||/(?=[A-Z])/;return y.split(C).join(P)},i=function(y){return $(y)?y:(y=y.replace(/[\-_\s]+(.)?/g,function(d,P){return P?P.toUpperCase():""}),y.substr(0,1).toLowerCase()+y.substr(1))},s=function(y){var d=i(y);return d.substr(0,1).toUpperCase()+d.substr(1)},l=function(y,d){return a(y,d).toLowerCase()},u=Object.prototype.toString,f=function(y){return typeof y=="function"},b=function(y){return y===Object(y)},k=function(y){return u.call(y)=="[object Array]"},w=function(y){return u.call(y)=="[object Date]"},T=function(y){return u.call(y)=="[object RegExp]"},A=function(y){return u.call(y)=="[object Boolean]"},$=function(y){return y=y-0,y===y},h=function(y,d){var P=d&&"process"in d?d.process:d;return typeof P!="function"?y:function(C,L){return P(C,y,L)}},I={camelize:i,decamelize:l,pascalize:s,depascalize:l,camelizeKeys:function(y,d){return t(h(i,d),y)},decamelizeKeys:function(y,d){return t(h(l,d),y,d)},pascalizeKeys:function(y,d){return t(h(s,d),y)},depascalizeKeys:function(){return this.decamelizeKeys.apply(this,arguments)}};e.exports?e.exports=I:n.humps=I})(lu)})(Ei);var uu=Ei.exports,cu=["gradientFill"],fu=["class","style"],du=["type","stops","id"];function mu(e){return e.split(";").map(function(n){return n.trim()}).filter(function(n){return n}).reduce(function(n,t){var a=t.indexOf(":"),i=uu.camelize(t.slice(0,a)),s=t.slice(a+1).trim();return n[i]=s,n},{})}function pu(e){return e.split(/\s+/).reduce(function(n,t){return n[t]=!0,n},{})}function gu(e,n){return $t("stop",q({key:"".concat(n,"-").concat(e.offset),offset:e.offset,"stop-color":e.color},e.opacity!==void 0&&{"stop-opacity":e.opacity}))}function Li(e){if(typeof e=="string")return e;var n=(e.children||[]).map(Li);return e.tag==="path"&&e.attributes&&"fill"in e.attributes?q(q({},e),{},{attributes:q(q({},e.attributes),{},{fill:void 0}),children:n}):q(q({},e),{},{children:n})}function Ni(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof e=="string")return e;var a=n.gradientFill,i=a===void 0?null:a,s=Yt(n,cu),l=!!i||"fill"in t,u=l?Li(e):e,f=(u.children||[]).map(function(C){return Ni(C,{},{})}),b=Object.keys(u.attributes||{}).reduce(function(C,L){var X=u.attributes[L];switch(L){case"class":C.class=pu(X);break;case"style":C.style=mu(X);break;default:C.attrs[L]=X}return C},{attrs:{},class:{},style:{}});t.class;var k=t.style,w=k===void 0?{}:k,T=Yt(t,fu);if(i&&i.id&&(i.type==="linear"||i.type==="radial")){var A=i.type,$=i.stops,h=$===void 0?[]:$,I=i.id,y=Yt(i,du),d=A==="linear"?"linearGradient":"radialGradient",P=$t(d,q(q({},y),{},{id:I}),h.map(gu));return $t(u.tag,q(q(q(q({},s),{},{class:b.class,style:q(q({},b.style),w)},b.attrs),T),{},{fill:"url(#".concat(I,")")}),[P].concat(au(f)))}return $t(e.tag,q(q(q({},s),{},{class:b.class,style:q(q({},b.style),w)},b.attrs),T),f)}var Mi=!1;try{Mi=!0}catch{}function ya(){if(!Mi&&console&&typeof console.error=="function"){var e;(e=console).error.apply(e,arguments)}}function xa(e){if(e&&Et(e)==="object"&&e.prefix&&e.iconName&&e.icon)return e;if(hn.icon)return hn.icon(e);if(e===null)return null;if(Et(e)==="object"&&e.prefix&&e.iconName)return e;if(Array.isArray(e)&&e.length===2)return{prefix:e[0],iconName:e[1]};if(typeof e=="string")return{prefix:"fas",iconName:e}}var vu=Me({name:"FontAwesomeIcon",props:{border:{type:Boolean,default:!1},fixedWidth:{type:Boolean,default:!1},flip:{type:[Boolean,String],default:!1,validator:function(n){return[!0,!1,"horizontal","vertical","both"].indexOf(n)>-1}},icon:{type:[Object,Array,String],required:!0},mask:{type:[Object,Array,String],default:null},maskId:{type:String,default:null},listItem:{type:Boolean,default:!1},pull:{type:String,default:null,validator:function(n){return["right","left"].indexOf(n)>-1}},pulse:{type:Boolean,default:!1},rotation:{type:[String,Number],default:null,validator:function(n){return[90,180,270].indexOf(Number.parseInt(n,10))>-1}},rotateBy:{type:Boolean,default:!1},swapOpacity:{type:Boolean,default:!1},size:{type:String,default:null,validator:function(n){return["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"].indexOf(n)>-1}},spin:{type:Boolean,default:!1},transform:{type:[String,Object],default:null},symbol:{type:[Boolean,String],default:!1},title:{type:String,default:null},titleId:{type:String,default:null},inverse:{type:Boolean,default:!1},bounce:{type:Boolean,default:!1},shake:{type:Boolean,default:!1},beat:{type:Boolean,default:!1},fade:{type:Boolean,default:!1},beatFade:{type:Boolean,default:!1},flash:{type:Boolean,default:!1},spinPulse:{type:Boolean,default:!1},spinReverse:{type:Boolean,default:!1},widthAuto:{type:Boolean,default:!1},canvasSquare:{type:Boolean,default:!1},canvasRoomy:{type:Boolean,default:!1},gradientFill:{type:Object,default:null,validator:function(n){return typeof n.id!="string"||!n.id?(console.warn("FontAwesomeIcon: gradientFill.id must be a non-empty string"),!1):n.type!=="linear"&&n.type!=="radial"?(console.warn('FontAwesomeIcon: gradientFill.type must be "linear" or "radial"'),!1):!0}},flip360:{type:Boolean,default:!1},buzz:{type:Boolean,default:!1},float:{type:Boolean,default:!1},jello:{type:Boolean,default:!1},spinSnap:{type:Boolean,default:!1},spinSnap4:{type:Boolean,default:!1},spinSnap8:{type:Boolean,default:!1},swing:{type:Boolean,default:!1},wag:{type:Boolean,default:!1}},setup:function(n,t){var a=t.attrs,i=F(function(){return xa(n.icon)}),s=F(function(){return Qt("classes",su(n))}),l=F(function(){return Qt("transform",typeof n.transform=="string"?hn.transform(n.transform):n.transform)}),u=F(function(){return Qt("mask",xa(n.mask))}),f=F(function(){var k=q(q(q(q({},s.value),l.value),u.value),{},{symbol:n.symbol,maskId:n.maskId});return k.title=n.title,k.titleId=n.titleId,Jl(i.value,k)});Ie(f,function(k){if(!k)return ya("Could not find one or more icon(s)",i.value,u.value)},{immediate:!0}),n.gradientFill&&n.symbol&&ya("gradientFill is not supported when symbol is true and will be ignored");var b=F(function(){return f.value?Ni(f.value.abstract[0],{gradientFill:n.symbol?null:n.gradientFill},a):null});return function(){return b.value}}});var bu={prefix:"fas",iconName:"arrow-up-from-bracket",icon:[448,512,[],"e09a","M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"]};const hu={class:"challenge-launch","aria-labelledby":"launch-title"},yu={class:"challenge-launch__heading"},xu={class:"builder-card__eyebrow"},_u={id:"launch-title"},wu=["aria-label"],ku=["disabled"],Su=["disabled"],$u={class:"action-button__icon","aria-hidden":"true"},Cu=["src"],Pu={key:1,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},Iu=["disabled"],Au=["disabled"],Tu={class:"action-button__icon","aria-hidden":"true"},ju=Me({__name:"ChallengeActions",props:{ready:{type:Boolean},busyAction:{}},emits:["exercise","print","save"],setup(e,{emit:n}){const{ui:t}=He(),a=n,i=st("challenge-random-coach-avatar",()=>"");return mt(async()=>{if(!i.value)try{const l=(await $fetch("/api/coaches")).coaches.filter(f=>f.avatarPath),u=l[Math.floor(Math.random()*l.length)];i.value=u?.avatarPath||""}catch{}}),(s,l)=>(x(),S("section",hu,[r("div",yu,[r("div",null,[r("p",xu,c(o(t)("Ton défi est prêt")),1),r("h2",_u,c(o(t)("Comment veux-tu l’utiliser ?")),1)])]),r("div",{class:"challenge-actions","aria-label":o(t)("Lancer le défi")},[r("button",{class:"action-button action-button--primary","data-tour":"action-classic",type:"button",disabled:!e.ready||!!e.busyAction,onClick:l[0]||(l[0]=u=>a("exercise","classic"))},[l[4]||(l[4]=r("span",{class:"action-button__icon","aria-hidden":"true"},"●",-1)),r("span",null,[r("strong",null,c(e.busyAction==="exercise"?o(t)("Préparation…"):o(t)("Classique")),1),r("small",null,c(o(t)("Questions et correction immédiate")),1)])],8,ku),r("button",{class:"action-button action-button--chat","data-tour":"action-coach",type:"button",disabled:!e.ready||!!e.busyAction,onClick:l[1]||(l[1]=u=>a("exercise","chat"))},[r("span",$u,[o(i)?(x(),S("img",{key:0,src:o(i),alt:""},null,8,Cu)):(x(),S("svg",Pu,[...l[5]||(l[5]=[r("circle",{cx:"12",cy:"8",r:"4"},null,-1),r("path",{d:"M4.5 21a7.5 7.5 0 0 1 15 0"},null,-1)])]))]),r("span",null,[r("strong",null,c(e.busyAction==="exercise"?o(t)("Préparation…"):o(t)("Avec un coach")),1),r("small",null,c(o(t)("Dialogue virtuel avec une aide pas à pas")),1)])],8,Su),r("button",{class:"action-button action-button--print","data-tour":"action-print",type:"button",disabled:!e.ready||!!e.busyAction,onClick:l[2]||(l[2]=u=>a("print"))},[l[6]||(l[6]=ir('<span class="action-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v7H6z"></path><path d="M18 12h.01"></path></svg></span>',1)),r("span",null,[r("strong",null,c(e.busyAction==="print"?o(t)("Préparation…"):o(t)("Imprimer")),1),r("small",null,c(o(t)("Les questions et le corrigé")),1)])],8,Iu),r("button",{class:"action-button action-button--share","data-tour":"action-share",type:"button",disabled:!e.ready||!!e.busyAction,onClick:l[3]||(l[3]=u=>a("save"))},[r("span",Tu,[Ue(o(vu),{icon:o(bu)},null,8,["icon"])]),r("span",null,[r("strong",null,c(e.busyAction==="save"?o(t)("Sauvegarde…"):o(t)("Partager")),1),r("small",null,c(o(t)("Partager ce défi avec d’autres personnes")),1)])],8,Au)],8,wu)]))}}),Im=Object.assign(ju,{__name:"ChallengeActions"}),Ou=["aria-labelledby"],zu={class:"builder-card__header"},Fu={class:"builder-card__eyebrow"},Eu=["id"],Lu={class:"options-main-column"},Nu=["for"],Mu=["id","value"],Du={class:"check-row"},Ru=["checked"],Bu={class:"option-fieldset"},Wu={class:"segmented-control"},Uu=["name","checked"],Vu=["name","checked"],Ku={class:"segmented-control segmented-control--stacked"},Gu=["name","checked"],Hu=["name","checked"],qu=["aria-hidden"],Xu={key:0,class:"complement-options__title"},Yu={key:1,class:"complement-options__description"},Qu=["disabled","aria-expanded","aria-controls"],Ju={"aria-hidden":"true"},Zu={key:3,class:"complement-options__unavailable"},ec=["id"],tc={class:"sr-only"},nc=["disabled","checked"],ac=["disabled","checked"],ic=["disabled","checked"],rc=["disabled","checked"],oc={class:"conjugation-example__header"},sc={class:"conjugation-example__heading"},lc={class:"conjugation-example__screen"},uc={key:0,class:"conjugation-example__loading",role:"status"},cc={class:"sr-only"},fc={key:1,class:"conjugation-example__body"},dc={key:0,class:"conjugation-example__question"},mc={class:"conjugation-example__block-label"},pc={class:"conjugation-example__instruction"},gc={key:0,class:"conjugation-example__citation"},vc={key:1,class:"conjugation-example__question-line"},bc={class:"conjugation-example__prompt"},hc={key:0,class:"conjugation-example__instruction"},yc={key:1,class:"conjugation-example__question-line"},xc={class:"conjugation-example__context"},_c={key:0,class:"conjugation-example__correction"},wc={key:1},kc=Me({__name:"ChallengeOptions",props:{questionCount:{},exerciseKind:{},identificationSource:{},inclusivePronouns:{type:Boolean},complementOptions:{},complementVerbs:{},eyebrow:{},idPrefix:{},gridLayout:{type:Boolean},conjugationInstruction:{},conjugationQuestionContext:{},conjugationQuestion:{},conjugationExample:{},conjugationExamplePrefix:{},conjugationExampleEmphasis:{},conjugationExampleSuffix:{},conjugationLiteraryCitation:{},conjugationExampleLoading:{type:Boolean},revealPrefilledOptions:{type:Boolean}},emits:["updateQuestionCount","updateExerciseKind","updateIdentificationSource","updateInclusivePronouns","updateComplementOptions","prefilledOptionsRevealStart"],setup(e,{emit:n}){const{ui:t}=He(),a=e,i=n,s=G(!!a.gridLayout),l=F(()=>(a.complementVerbs??[]).filter(m=>!!m.complementExample)),u=F(()=>a.exerciseKind==="conjugation"&&l.value.length>0),f=F(()=>l.value.some(m=>m.complementFunctions?.includes("cod")||m.complementExample?.functionObject==="cod")),b=F(()=>l.value.some(m=>m.complementFunctions?.includes("coi")||m.complementExample?.functionObject==="coi")),k=F(()=>l.value.some(m=>m.anteposableComplementFunctions?.includes("cod")||!!m.complementExample?.before)),w=F(()=>l.value.some(m=>m.anteposableComplementFunctions?.includes("coi"))),T=F(()=>a.idPrefix??"challenge-options"),A=F(()=>`${T.value}-title`),$=F(()=>`${T.value}-question-count`),h=F(()=>`${T.value}-exercise-kind`),I=F(()=>`${T.value}-identification-source`),y=F(()=>`${T.value}-complement-panel`),d=F(()=>!!((a.conjugationInstruction||a.conjugationQuestionContext||a.conjugationQuestion)&&a.conjugationExample)),P=F(()=>{const m=a.conjugationQuestion?.trim()??"";return m&&!/[.!?]$/u.test(m)?`${m}.`:m}),C=G(0),L=[],X=G(a.questionCount),D=G([...a.complementOptions]),E=G(!1),Y=G(null);let fe,de;const we=[];function Oe(){for(fe!==void 0&&(cancelAnimationFrame(fe),fe=void 0);we.length;)clearTimeout(we.pop())}function Ce(){Oe(),X.value=a.questionCount,D.value=[...a.complementOptions],E.value=!1}function ze(){if(E.value)return;if(i("prefilledOptionsRevealStart"),Oe(),window.matchMedia("(prefers-reduced-motion: reduce)").matches){Ce();return}const m=Math.max(0,a.questionCount),p=[...a.complementOptions],v=500,z=performance.now();E.value=!0,X.value=0,D.value=[];const ne=se=>{const Z=Math.min(1,(se-z)/v);X.value=Math.round(m*Z),Z<1?fe=requestAnimationFrame(ne):fe=void 0};fe=requestAnimationFrame(ne),p.forEach((se,Z)=>{we.push(setTimeout(()=>{D.value=[...D.value,se]},Math.round(Z/p.length*v)))}),we.push(setTimeout(Ce,v))}function me(){for(;L.length;)clearTimeout(L.pop())}Ie(()=>a.conjugationExampleLoading,m=>{me(),C.value=0,!m&&L.push(setTimeout(()=>{C.value=1},80),setTimeout(()=>{C.value=2},280))},{immediate:!0}),Ie(()=>a.questionCount,m=>{E.value||(X.value=m)}),Ie(()=>a.complementOptions,m=>{E.value||(D.value=[...m])},{deep:!0}),Ie(()=>a.revealPrefilledOptions,m=>{m&&ze()}),mt(()=>{a.revealPrefilledOptions&&ze()}),wn(()=>{me(),Oe(),de!==void 0&&cancelAnimationFrame(de)});function nt(m){E.value&&Ce();const p=m.target.value;if(p==="")return;const v=Number(p);Number.isFinite(v)&&i("updateQuestionCount",Math.min(99,Math.max(1,Math.round(v))))}async function N(m){const p=m.target.value;i("updateExerciseKind",p),!(!a.gridLayout||p!=="tense-identification")&&(await At(),de!==void 0&&cancelAnimationFrame(de),de=requestAnimationFrame(()=>{Y.value?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"}),de=void 0}))}function g(m,p){E.value&&Ce();const v=new Set(a.complementOptions);p?v.add(m):v.delete(m),i("updateComplementOptions",[...v])}return Ie(u,m=>{m?a.gridLayout&&(s.value=!0):s.value=!1},{immediate:!0}),(m,p)=>(x(),S("section",{class:ye(["builder-card options-card",{"options-card--grid":e.gridLayout,"options-card--revealing":o(E)}]),"aria-labelledby":o(A)},[r("div",zu,[r("div",null,[r("p",Fu,c(e.eyebrow??"Étape 3"),1),r("h2",{id:o(A)},c(o(t)("Mes options")),9,Eu)])]),r("div",{class:ye(["options-layout",{"options-layout--columns":e.gridLayout}])},[r("div",{class:ye(["options-fields",{"options-fields--columns":e.gridLayout}])},[r("div",Lu,[r("label",{class:"field-stack question-count-field",for:o($)},[r("span",null,c(o(t)("Nombre de questions")),1),r("input",{id:o($),type:"number",inputmode:"numeric",min:"1",max:"99",step:"1",value:o(X),onInput:nt},null,40,Mu)],8,Nu),r("label",Du,[r("input",{type:"checkbox",checked:e.inclusivePronouns,onChange:p[0]||(p[0]=v=>i("updateInclusivePronouns",v.target.checked))},null,40,Ru),r("span",null,[oe(c(o(t)("Inclure les pronoms"))+" ",1),p[8]||(p[8]=r("strong",null,"iel / iels",-1)),r("small",null,c(o(t)("Ils apparaîtront ponctuellement dans les questions.")),1)])]),r("fieldset",Bu,[r("legend",null,c(o(t)("Type d’exercice")),1),r("div",Wu,[r("label",null,[r("input",{type:"radio",name:o(h),value:"conjugation",checked:e.exerciseKind==="conjugation",onChange:N},null,40,Uu),r("span",null,c(o(t)("Conjuguer")),1)]),r("label",null,[r("input",{type:"radio",name:o(h),value:"tense-identification",checked:e.exerciseKind==="tense-identification",onChange:N},null,40,Vu),r("span",null,c(o(t)("Trouver le mode et le temps")),1)])])]),e.exerciseKind==="tense-identification"?(x(),S("fieldset",{key:0,ref_key:"identificationSourceFieldset",ref:Y,class:"option-fieldset identification-source-fieldset"},[p[11]||(p[11]=r("legend",{class:"sr-only"},"Choix des verbes",-1)),r("div",Ku,[r("label",null,[r("input",{type:"radio",name:o(I),value:"selected-verbs",checked:e.identificationSource==="selected-verbs",onChange:p[1]||(p[1]=v=>i("updateIdentificationSource","selected-verbs"))},null,40,Gu),p[9]||(p[9]=r("span",null,[r("strong",null,"Avec mes verbes"),r("small",null,"Formes conjuguées simples, sans citation.")],-1))]),r("label",null,[r("input",{type:"radio",name:o(I),value:"literary-corpus",checked:e.identificationSource==="literary-corpus",onChange:p[2]||(p[2]=v=>i("updateIdentificationSource","literary-corpus"))},null,40,Hu),p[10]||(p[10]=r("span",null,[r("strong",null,"Avec n’importe quel verbe"),r("small",null,"Construits avec des phrases littéraires")],-1))])])],512)):M("",!0)]),r("div",{class:ye(["complement-options",{"complement-options--disabled":!o(u),"complement-options--hidden":e.gridLayout&&e.exerciseKind==="tense-identification"}]),"data-tour":"options-complements","aria-hidden":e.gridLayout&&e.exerciseKind==="tense-identification"?"true":void 0},[e.gridLayout?(x(),S("h3",Xu,c(o(t)("Compléments d’objets :")),1)):M("",!0),e.gridLayout?(x(),S("p",Yu,c(o(t)("Ajoute des compléments d’objets directs ou indirects.")),1)):(x(),S("button",{key:2,class:"complement-options__trigger",type:"button",disabled:!o(u),"aria-expanded":o(s),"aria-controls":o(y),onClick:p[3]||(p[3]=v=>s.value=!o(s))},[r("span",null,[oe(c(o(t)("Compléments d’objets :"))+" ",1),r("small",null,c(o(t)("nouveau")),1)]),r("span",Ju,c(o(s)?"−":"+"),1)],8,Qu)),o(u)?M("",!0):(x(),S("p",Zu,c(e.exerciseKind!=="conjugation"?"Disponible uniquement pour un exercice de conjugaison.":"Les verbes choisis ne proposent pas de complément."),1)),Ue(ut,{name:"complement-panel"},{default:Ve(()=>[e.gridLayout||o(s)?(x(),S("fieldset",{key:0,id:o(y),class:"complement-options__panel"},[r("legend",tc,c(o(t)("Présentation des compléments d’objets")),1),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(f),checked:o(D).includes("cod-after"),onChange:p[4]||(p[4]=v=>g("cod-after",v.target.checked))},null,40,nc),r("span",null,[r("strong",null,c(o(t)("COD placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(k),checked:o(D).includes("cod-before"),onChange:p[5]||(p[5]=v=>g("cod-before",v.target.checked))},null,40,ac),r("span",null,[r("strong",null,c(o(t)("COD placé avant")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(b),checked:o(D).includes("coi-after"),onChange:p[6]||(p[6]=v=>g("coi-after",v.target.checked))},null,40,ic),r("span",null,[r("strong",null,c(o(t)("COI placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(w),checked:o(D).includes("coi-before"),onChange:p[7]||(p[7]=v=>g("coi-before",v.target.checked))},null,40,rc),r("span",null,[r("strong",null,c(o(t)("COI placé avant")),1)])])],8,ec)):M("",!0)]),_:1})],10,qu)],2),e.gridLayout&&(e.conjugationExampleLoading||o(d))?(x(),S("div",{key:0,class:ye(["conjugation-example",{"conjugation-example--wide":e.exerciseKind==="tense-identification"}]),"data-tour":"options-preview","aria-live":"polite","aria-atomic":"true"},[r("div",oc,[p[12]||(p[12]=r("span",{class:"conjugation-example__preview-icon","aria-hidden":"true"},[r("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},[r("path",{d:"M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z"}),r("circle",{cx:"12",cy:"12",r:"3"})])],-1)),r("div",sc,[r("span",null,c(o(t)("Aperçu d’une question")),1)])]),r("div",lc,[e.conjugationExampleLoading?(x(),S("div",uc,[p[13]||(p[13]=r("span",{class:"conjugation-example__spinner","aria-hidden":"true"},null,-1)),r("span",cc,c(o(t)("Préparation de l’aperçu")),1)])):(x(),S("div",fc,[Ue(ut,{name:"example-item"},{default:Ve(()=>[o(C)>=1?(x(),S("div",dc,[r("span",mc,c(o(t)("Exemple de question")),1),e.exerciseKind==="tense-identification"&&e.conjugationInstruction&&e.conjugationQuestion?(x(),S(K,{key:0},[r("p",pc,c(e.conjugationInstruction),1),e.conjugationLiteraryCitation?(x(),S("blockquote",gc,[r("p",null,[r("span",null,c(e.conjugationLiteraryCitation.before),1),r("mark",null,c(e.conjugationLiteraryCitation.target),1),r("span",null,c(e.conjugationLiteraryCitation.after),1)]),r("footer",null,[oe(c(e.conjugationLiteraryCitation.author)+", ",1),r("cite",null,c(e.conjugationLiteraryCitation.work),1)])])):(x(),S("p",vc,[r("span",bc,c(o(P)),1)]))],64)):(x(),S(K,{key:1},[e.conjugationInstruction?(x(),S("p",hc,c(e.conjugationInstruction),1)):M("",!0),e.conjugationQuestionContext?(x(),S("p",yc,[r("span",xc,c(e.conjugationQuestionContext),1)])):M("",!0)],64))])):M("",!0)]),_:1}),Ue(ut,{name:"example-item"},{default:Ve(()=>[o(C)>=2?(x(),S("div",_c,[r("span",null,c(o(t)("Réponse attendue")),1),r("p",null,[e.conjugationExampleEmphasis?(x(),S(K,{key:0},[r("span",null,c(e.conjugationExamplePrefix),1),r("strong",null,c(e.conjugationExampleEmphasis),1),r("span",null,c(e.conjugationExampleSuffix),1)],64)):(x(),S("span",wc,c(e.conjugationExample),1))])])):M("",!0)]),_:1})]))])],2)):M("",!0)],2)],10,Ou))}}),Am=Object.assign(Lt(kc,[["__scopeId","data-v-a4b4faf2"]]),{__name:"ChallengeOptions"}),Sc=["aria-labelledby","aria-label"],$c={key:0,class:"preset-browser"},Cc={class:"preset-browser__columns"},Pc={class:"preset-browser__column","data-browser-column":"1","aria-labelledby":"preset-browser-groups"},Ic={id:"preset-browser-groups"},Ac={class:"preset-browser__list"},Tc=["aria-pressed","onClick"],jc=["aria-label"],Oc={class:"preset-browser__list"},zc={class:"preset-browser__info","data-preset-info":""},Fc=["aria-expanded","aria-controls","aria-label","onMouseenter","onClick"],Ec=["id"],Lc={class:"preset-browser__tooltip-section"},Nc={class:"preset-browser__verb-badges"},Mc={key:0,class:"preset-browser__other-verbs"},Dc={class:"preset-browser__tooltip-section"},Rc=["aria-pressed","onClick"],Bc=["aria-label"],Wc={class:"preset-browser__list"},Uc={class:"preset-browser__count"},Vc={class:"preset-panel__intro"},Kc={class:"builder-card__eyebrow"},Gc={id:"presets-title"},Hc={class:"preset-mobile-select"},qc=["value"],Xc={value:""},Yc=["label"],Qc=["value"],Jc=["aria-label"],Zc=["id","aria-selected","aria-controls","tabindex","onClick","onKeydown"],ef=["id","aria-labelledby"],tf=["onClick"],nf={key:0,class:"preset-card__random"},af=["onClick"],rf=["onClick"],of=["onClick"],sf=Me({__name:"PresetPicker",props:{presets:{},activePresetId:{},compact:{type:Boolean},verbs:{},modes:{},tenses:{}},emits:["select","stageChange"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=He(),{track:i}=$a(),s=e,l=n,u=F(()=>{const m=new Map;return s.presets.forEach(p=>{const v=m.get(p.group)??[];v.push(p),m.set(p.group,v)}),[...m.entries()].map(([p,v])=>({id:p,label:v[0]?.groupLabel??ka[p]??p,order:v[0]?.groupOrder??ar.indexOf(p),presets:v})).sort((p,v)=>p.order-v.order||p.label.localeCompare(v.label,"fr"))}),f=G("school"),b=F(()=>u.value.find(m=>m.id===f.value)??u.value[0]),k=G(""),w=F(()=>s.presets.find(m=>m.id===k.value)),T=G(null),A=G(null),$=F(()=>u.value.find(m=>m.id===T.value)),h=F(()=>s.presets.find(m=>m.id===A.value)),I=G(null),y=G(null),d=G(null),P=new Set,C=F(()=>new Map((s.verbs??[]).map(m=>[m.id,m.infinitif]))),L=F(()=>new Map((s.tenses??[]).map(m=>[m.id,m]))),X=F(()=>new Map((s.modes??[]).map(m=>[m.id,m])));function D(m){return y.value===m||d.value===m}function E(m){return m.verbIds.slice(0,12).map(p=>C.value.get(p)??`Verbe ${p}`)}function Y(m){const p=new Map;for(const v of m.tenseIds){const z=L.value.get(v);if(!z)continue;const ne=X.value.get(z.modeId),se=p.get(z.modeId)??{mode:a(ne?.name??z.mode?.name??t("Autres temps")),order:ne?.order??z.mode?.order??Number.MAX_SAFE_INTEGER,tenses:[]};se.tenses.push(a(z.name)),p.set(z.modeId,se)}return[...p.values()].sort((v,z)=>v.order-z.order||v.mode.localeCompare(z.mode,"fr"))}function fe(m){d.value=d.value===m?null:m}function de(m){m.target?.closest("[data-preset-info]")||(d.value=null)}mt(()=>document.addEventListener("pointerdown",de)),wn(()=>document.removeEventListener("pointerdown",de));function we(m){for(const p of m)P.has(p.id)||(P.add(p.id),i("feature_exposed",{feature:"preset",item:p.id}))}Ie([()=>s.compact,b,$],([m,p,v])=>{if(m){v&&we(v.presets);return}p&&we(p.presets)},{immediate:!0});function Oe(m){At(()=>{const p=I.value;if(!p||p.scrollWidth<=p.clientWidth+1)return;p.querySelector(`[data-browser-column="${m}"]`)?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"end"})})}function Ce(m){T.value=m,A.value=null,d.value=null,y.value=null,l("stageChange","presets"),Oe(2)}function ze(m){A.value=m,Oe(3)}function me(m,p){A.value=null,l("select",m,p)}function nt(m){k.value=m.target.value,w.value&&l("select",w.value)}function N(m,p){let v;if((m.key==="ArrowRight"||m.key==="ArrowDown")&&(v=(p+1)%u.value.length),(m.key==="ArrowLeft"||m.key==="ArrowUp")&&(v=(p-1+u.value.length)%u.value.length),m.key==="Home"&&(v=0),m.key==="End"&&(v=u.value.length-1),v===void 0)return;m.preventDefault();const z=u.value[v];z&&(f.value=z.id,At(()=>document.getElementById(`preset-tab-${z.id}`)?.focus()))}function g(m,p){l("select",m,Math.min(p,m.verbIds.length))}return(m,p)=>(x(),S("section",{class:ye(["preset-panel",{"preset-panel--compact":e.compact}]),"aria-labelledby":e.compact?void 0:"presets-title","aria-label":e.compact?"Défis prêts à l’emploi":void 0},[e.compact?(x(),S("div",$c,[r("div",{ref_key:"compactBrowser",ref:I,class:"preset-browser__scroll"},[r("div",Cc,[r("section",Pc,[r("h3",Ic,c(o(t)("Catégories")),1),r("div",Ac,[(x(!0),S(K,null,re(o(u),v=>(x(),S("button",{key:v.id,type:"button",class:ye({"is-selected":o(T)===v.id}),"aria-pressed":o(T)===v.id,onClick:z=>Ce(v.id)},[r("span",null,c(v.label),1),p[7]||(p[7]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,Tc))),128))])]),Ue(ut,{name:"browser-column"},{default:Ve(()=>[o($)?(x(),S("section",{key:o($).id,class:"preset-browser__column","data-browser-column":"2","aria-label":`Défis de ${o($).label}`},[r("div",Oc,[(x(!0),S(K,null,re(o($).presets,v=>(x(),S("div",{key:v.id,class:"preset-browser__preset-row"},[r("div",zc,[r("button",{class:"preset-browser__info-button",type:"button","aria-expanded":D(v.id),"aria-controls":`preset-info-${v.id}`,"aria-label":`Informations sur ${v.label}`,onMouseenter:z=>y.value=v.id,onMouseleave:p[0]||(p[0]=z=>y.value=null),onClick:Tt(z=>fe(v.id),["stop"])},"i",40,Fc),D(v.id)?(x(),S("section",{key:0,id:`preset-info-${v.id}`,class:"preset-browser__tooltip","aria-live":"polite"},[r("header",null,[r("strong",null,c(v.label),1),r("span",null,c(v.questionCount)+" "+c(o(t)("questions")),1)]),r("div",Lc,[r("h4",null,c(o(t)("Verbes")),1),r("div",Nc,[(x(!0),S(K,null,re(E(v),z=>(x(),S("span",{key:z},c(z),1))),128))]),v.verbIds.length>12?(x(),S("p",Mc,"+ "+c(v.verbIds.length-12)+" "+c(o(t)("autres verbes")),1)):M("",!0)]),r("div",Dc,[r("h4",null,c(o(t)("Temps")),1),r("dl",null,[(x(!0),S(K,null,re(Y(v),z=>(x(),S("div",{key:z.mode},[r("dt",null,c(z.mode),1),r("dd",null,c(z.tenses.join(", ")),1)]))),128))])])],8,Ec)):M("",!0)]),r("button",{class:ye(["preset-browser__preset-button",{"is-selected":o(A)===v.id||e.activePresetId===v.id}]),type:"button","aria-pressed":o(A)===v.id,onClick:z=>ze(v.id)},[r("span",null,[r("strong",null,c(v.label),1)]),p[8]||(p[8]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,Rc)]))),128))])],8,jc)):M("",!0)]),_:1}),Ue(ut,{name:"browser-column"},{default:Ve(()=>[o(h)?(x(),S("section",{key:o(h).id,class:"preset-browser__column preset-browser__column--quantity","data-browser-column":"3","aria-label":o(t)("Choisir le nombre de verbes")},[r("div",Wc,[r("button",{type:"button",onClick:p[1]||(p[1]=v=>me(o(h)))},[r("span",null,[r("strong",null,c(o(t)("Tous les verbes")),1)]),r("span",Uc,c(o(h).verbIds.length),1),p[9]||(p[9]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))]),p[20]||(p[20]=r("span",{class:"preset-browser__quantity-separator","aria-hidden":"true"},null,-1)),o(h).verbIds.length>=1&&o(h).verbIds.length<5?(x(),S("button",{key:0,type:"button",onClick:p[2]||(p[2]=v=>me(o(h),1))},[r("span",null,[r("strong",null,c(o(t)("1 au hasard")),1)]),p[10]||(p[10]=r("span",{class:"preset-browser__count"},"1",-1)),p[11]||(p[11]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),o(h).verbIds.length>=2&&o(h).verbIds.length<5?(x(),S("button",{key:1,type:"button",onClick:p[3]||(p[3]=v=>me(o(h),2))},[r("span",null,[r("strong",null,c(o(t)("2 au hasard")),1)]),p[12]||(p[12]=r("span",{class:"preset-browser__count"},"2",-1)),p[13]||(p[13]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),o(h).verbIds.length>=3?(x(),S("button",{key:2,type:"button",onClick:p[4]||(p[4]=v=>me(o(h),3))},[r("span",null,[r("strong",null,c(o(t)("3 au hasard")),1)]),p[14]||(p[14]=r("span",{class:"preset-browser__count"},"3",-1)),p[15]||(p[15]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),o(h).verbIds.length>=5?(x(),S("button",{key:3,type:"button",onClick:p[5]||(p[5]=v=>me(o(h),5))},[r("span",null,[r("strong",null,c(o(t)("5 au hasard")),1)]),p[16]||(p[16]=r("span",{class:"preset-browser__count"},"5",-1)),p[17]||(p[17]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),o(h).verbIds.length>=10?(x(),S("button",{key:4,type:"button",onClick:p[6]||(p[6]=v=>me(o(h),10))},[r("span",null,[r("strong",null,c(o(t)("10 au hasard")),1)]),p[18]||(p[18]=r("span",{class:"preset-browser__count"},"10",-1)),p[19]||(p[19]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0)])],8,Bc)):M("",!0)]),_:1})])],512)])):(x(),S(K,{key:1},[r("div",Vc,[r("div",null,[r("p",Kc,c(o(t)("Pour démarrer rapidement")),1),r("h2",Gc,c(o(t)("Défis prêts à l’emploi")),1)]),r("p",null,c(o(t)("Choisissez un niveau ou une famille de verbes, puis ajustez librement la sélection.")),1)]),r("label",Hc,[r("span",null,c(o(t)("Choisir un défi prêt à l’emploi")),1),r("select",{value:e.activePresetId??o(k),onChange:nt},[r("option",Xc,c(o(t)("Choisir un niveau ou un entraînement…")),1),(x(!0),S(K,null,re(o(u),v=>(x(),S("optgroup",{key:v.id,label:v.label},[(x(!0),S(K,null,re(v.presets,z=>(x(),S("option",{key:z.id,value:z.id},c(z.label)+" — "+c(z.verbIds.length)+" "+c(o(t)("verbes")),9,Qc))),128))],8,Yc))),128))],40,qc)]),r("div",{class:"preset-groups",role:"tablist","aria-label":o(t)("Catégories de défis")},[(x(!0),S(K,null,re(o(u),(v,z)=>(x(),S("button",{id:`preset-tab-${v.id}`,key:v.id,class:ye(["preset-group-button",{"preset-group-button--active":o(b)?.id===v.id}]),type:"button",role:"tab","aria-selected":o(b)?.id===v.id,"aria-controls":`preset-content-${v.id}`,tabindex:o(b)?.id===v.id?0:-1,onClick:ne=>f.value=v.id,onKeydown:ne=>N(ne,z)},c(v.label),43,Zc))),128))],8,Jc),o(b)?(x(),S("div",{key:0,id:`preset-content-${o(b).id}`,class:"preset-list",role:"tabpanel","aria-labelledby":`preset-tab-${o(b).id}`},[(x(!0),S(K,null,re(o(b).presets,v=>(x(),S("article",{key:v.id,class:ye(["preset-card",{"preset-card--active":e.activePresetId===v.id}])},[r("button",{type:"button",onClick:z=>l("select",v)},[r("strong",null,c(v.label),1),r("span",null,c(v.description),1),r("small",null,c(v.verbIds.length)+" verbes · "+c(v.questionCount)+" "+c(o(t)("questions")),1)],8,tf),v.verbIds.length>5?(x(),S("div",nf,[oe(c(o(t)("Au hasard :"))+" ",1),r("button",{type:"button",onClick:z=>g(v,1)},"1",8,af),r("button",{type:"button",onClick:z=>g(v,5)},"5",8,rf),r("button",{type:"button",onClick:z=>g(v,10)},"10",8,of)])):M("",!0)],2))),128))],8,ef)):M("",!0)],64))],10,Sc))}}),Tm=Object.assign(Lt(sf,[["__scopeId","data-v-405192b2"]]),{__name:"ChallengePresetPicker"}),_a="Quel est le mode et le temps de cette forme conjuguée ?";function xn(e,n){const t=String(e||"").split(/\r?\n/u);return Math.max(1,t.reduce((a,i)=>{const s=i.replace(/\s+/g," ").trim();return a+Math.max(1,Math.ceil(s.length/n))},0))}function lf(e,n=8){return 5+n+(xn(e,86)-1)*5}function uf(e,n){return 8+(Math.max(xn(e,54),xn(n,38))-1)*5}function wa(e,n,t,a){const i=[];let s=[],l=0,u=n;return e.forEach((f,b)=>{const k=Math.max(1,a(f));s.length>0&&l+k>u&&(i.push(s),s=[],l=0,u=t),s.push({item:f,index:b}),l+=k}),s.length>0&&i.push(s),i}const Di=".................................",cf="......................................",ff=32;function df(e,n){return n.mode?.trim().toLocaleLowerCase("fr-CH")!=="subjonctif"||n.complementPosition==="before"||/^(?:que|qu['’])\s*/iu.test(e)?e:`que ${e}`.replace(/^que (i(?:l|ls|el|els)|elle?s?|on)\b/iu,"qu'$1")}function mf(e,n){const t=df(e.trim(),n),[a="",...i]=t.split("…"),s=i.join("…").trim(),u=n.mode?.trim().toLocaleLowerCase("fr-CH")==="impératif"&&!s.endsWith("!")?`${s}${s?" ":""}!`:s,f=n.complementPosition!=="before"&&n.saisiePrefixe!==void 0?n.saisiePrefixe.trim():a.trim(),b=Di,k=u.length>ff,w=k?Math.max(32,Math.min(58,72-Math.round(u.length*.65))):100;return{completionPrefix:f,completionSuffix:u,fillBlank:t.includes("…")||i.length===0,suffixOnNextLine:k,blankWidthPercent:w,completion:[f,b,u].filter(Boolean).join(" ")}}function Je(e,n){if(n==="tense-identification"){const u=e.literaryCitation?`${e.literaryCitation.before}【${e.literaryCitation.target}】${e.literaryCitation.after} — ${e.literaryCitation.author}, ${e.literaryCitation.work}`:e.consigne;return{label:"",completion:u,completionPrefix:u,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100}}if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="gérondif"){const u=e.infinitif||e.titre,f=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${u} | ${f} :`,completion:`en ${cf}`,completionPrefix:"en",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="participe"){const u=e.infinitif||e.titre,f=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${u} | ${f} :`,completion:Di,completionPrefix:"",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}const t=e.consigne.split("|").map(u=>u.trim());if(t.length<3)return{label:"",completion:e.consigne,completionPrefix:e.consigne,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100};const a=t.slice(0,-2).join(" | "),i=t.at(-2)||e.infinitif||"",s=t.at(-1)||[e.temps,e.mode?`(${e.mode})`:""].filter(Boolean).join(" "),l=mf(a,e);return{label:`${i} | ${s} :`,...l}}function pf(e,n){const t=Je(e,n);return[t.label,t.completion].filter(Boolean).join(" ")}function _n(e){const n=[...new Set(e.reponsesPourCorrige.map(t=>t.trim()).filter(Boolean))];return e.isCompound&&n.length>1?n.slice(0,1):n}function Jt(e,n){if(["gérondif","participe"].includes(e.mode?.trim().toLocaleLowerCase("fr-CH")||""))return e.consigne;const t=Je(e,n);return t.label||t.completion}function gf(e){return _n(e).join(`
`)}const vf={ref:"print-dialog",class:"print-overlay","data-tour":"print-preview",role:"dialog","aria-modal":"true","aria-labelledby":"print-preview-title",tabindex:"-1"},bf={class:"print-toolbar no-print"},hf={id:"print-preview-title"},yf=["disabled"],xf=["disabled"],_f={class:"print-preview-layout"},wf={class:"print-settings no-print","data-tour":"print-settings","aria-labelledby":"print-settings-title"},kf={class:"print-settings__heading"},Sf={id:"print-settings-title"},$f={class:"print-settings__field",for:"preview-print-title"},Cf=["value"],Pf={class:"print-settings__group"},If={class:"print-settings__number-field",for:"preview-title-spacing"},Af=["value"],Tf={class:"print-settings__number-field",for:"preview-question-spacing"},jf=["value"],Of={class:"print-settings__group"},zf=["checked"],Ff=["checked"],Ef=["checked"],Lf=["checked"],Nf={class:"print-settings__group"},Mf=["checked"],Df=["checked"],Rf=["checked"],Bf={class:"print-document print-document--pdf"},Wf=["src","title"],Uf={key:1,class:"pdf-preview-state",role:"status","aria-live":"polite"},Vf={key:2,class:"pdf-preview-state pdf-preview-state--error",role:"alert"},Kf=Me({__name:"PrintPreview",props:{questions:{},verbs:{},tenses:{},exerciseKind:{},options:{}},emits:["close","updateOptions"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=He(),i=e,s=n,{track:l}=$a(),u=Math.floor(Math.random()*9e3)+1e3,f=jt("print-dialog"),b=G(!1),k=G(!1),w=G(!0),T=G(!1),A=G(""),$=G("");let h=0,I;function y(N,g,m,p){const v=Number(N);return Number.isFinite(v)?Math.min(p,Math.max(m,v)):g}const d=F(()=>y(i.options.questionSpacingMm,8,2,15)),P=F(()=>y(i.options.titleSpacingMm,30,8,30)),C=F(()=>{let N=226;return(i.options.showFirstName||i.options.showLastName||i.options.showDate)&&(N-=Math.max(0,P.value-1)),i.options.showVerbs&&(N-=8),i.options.showTenses&&(N-=8),i.exerciseKind==="tense-identification"&&(N-=13),N}),L=F(()=>wa(i.questions,C.value,220,N=>{const g=Je(N,i.exerciseKind);return lf(pf(N,i.exerciseKind),d.value)+(g.suffixOnNextLine?6:0)})),X=F(()=>wa(i.questions,205,220,N=>uf(Jt(N,i.exerciseKind),gf(N))));Ca(f,()=>s("close"));function D(N,g){s("updateOptions",{...i.options,[N]:g})}function E(N){return String(N??"").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/…/g,"...").replace(/–|—/g,"-").replace(/【/g,"[").replace(/】/g,"]")}function Y(N){return String(N??"").replace(new RegExp("^(\\s*)(\\p{L})","u"),(g,m,p)=>`${m}${p.toLocaleUpperCase("fr-CH")}`)}function fe(N){return String(N??"").split(`
`).map(Y).join(`
`)}function de(){return`${(i.options.title||t("Défi de conjugaison")).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"")||"defi-conjugaison"}.pdf`}async function we(){const{jsPDF:N}=await Nn(async()=>{const{jsPDF:Q}=await import("./ni5V7eBP.js").then(V=>V.j);return{jsPDF:Q}},__vite__mapDeps([0,1,2]),import.meta.url),g=new N({orientation:"portrait",unit:"mm",format:"a4",compress:!0}),m=210,p=297,v=17,z=193,ne=E(i.options.title||t("Défi de conjugaison")),se=i.options.showRandomNumber?` n° ${u}`:"";let Z=0;function bt(){Z>0&&g.addPage("a4","portrait"),Z+=1}function ht(){g.setFont("helvetica","normal"),g.setFontSize(8),g.setTextColor(105,105,105),g.text("conjugaison.tatitotu.ch",m/2,p-8,{align:"center"}),g.setTextColor(20,20,20)}function Wt(Q){if(Q)return g.setFont("helvetica","normal"),g.setFontSize(8.5),g.setTextColor(90,90,90),g.text(`${ne}${se}`,m/2,12,{align:"center"}),g.setTextColor(20,20,20),32;let V=18;const R=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean);R.length&&(g.setFont("helvetica","normal"),g.setFontSize(8.5),g.text(E(R.join("     ")),v,V),V+=P.value),i.options.showGrade&&(g.setDrawColor(40,40,40),g.rect(z-17,15,17,17)),g.setFont("helvetica","bold"),g.setFontSize(17);const Fe=`${ne}${se}`,pe=g.splitTextToSize(Fe.toUpperCase(),150);if(g.text(pe,v,V+8),V+=pe.length*7+10,g.setFontSize(9),i.options.showVerbs){const ee=g.splitTextToSize(`Verbes : ${E(i.verbs.map(B=>B.infinitif).join(", "))}`,176);g.text(ee,v,V),V+=ee.length*4.5+2}if(i.options.showTenses){const ee=g.splitTextToSize(`${t("Temps :")} ${E(i.tenses.map(B=>a(B.name)).join(", "))}`,176);g.text(ee,v,V),V+=ee.length*4.5+2}return i.exerciseKind==="tense-identification"&&(g.setDrawColor(120,120,120),g.rect(v,V,176,10),g.text(_a,v+3,V+6),V+=15),V+2}function at(Q){return Q?(g.setFont("helvetica","normal"),g.setFontSize(8.5),g.setTextColor(90,90,90),g.text(`${ne} - corrigé${se}`,m/2,12,{align:"center"}),g.setTextColor(20,20,20),32):(g.setFont("helvetica","bold"),g.setFontSize(17),g.setTextColor(20,20,20),g.text(`${t("CORRIGÉ")}${se}`,v,26),38)}function it(Q,V){bt();let R=Wt(V);g.setFontSize(10.5),Q.forEach(({item:Fe,index:pe})=>{const ee=`${pe+1}. `,B=Je(Fe,i.exerciseKind);g.setFont("helvetica","normal");const ge=g.splitTextToSize(E(Y(B.label)),68),le=B.label?96:169,ve=B.fillBlank?[E(Y(B.completion))]:g.splitTextToSize(E(Y(B.completion)),le),be=B.label?96:v+7,Pe=E(Y(B.completionPrefix)),ke=E(B.completionSuffix),ae=be+(Pe?g.getTextWidth(Pe)+2:0),Vt=z-(!B.suffixOnNextLine&&ke?g.getTextWidth(ke)+2:0),ie=B.suffixOnNextLine?be+le*(B.blankWidthPercent/100):Vt;let De="",Se=[];if(B.suffixOnNextLine&&ke){const rt=ie+2,ce=Math.max(0,z-rt),Re=ke.split(/\s+/u).filter(Boolean),Be=[];for(;Re.length;){const yt=[...Be,Re[0]].join(" ");if(Be.length&&g.getTextWidth(yt)>ce||!Be.length&&g.getTextWidth(yt)>ce)break;Be.push(Re.shift())}De=Be.join(" "),Se=Re.length?g.splitTextToSize(Re.join(" "),le):[]}const qe=B.suffixOnNextLine?1+Se.length:ve.length,Xe=Math.max(ge.length,qe);g.text(ee,v,R),B.label&&g.text(ge,v+7,R),B.fillBlank?(Pe&&g.text(Pe,be,R),ke&&!B.suffixOnNextLine&&g.text(ke,z,R,{align:"right"}),ie>ae&&(g.setLineDashPattern([.7,.7],0),g.setDrawColor(55,55,55),g.line(ae,R+.8,ie,R+.8),g.setLineDashPattern([],0)),B.suffixOnNextLine&&(De&&g.text(De,ie+2,R),Se.forEach((rt,ce)=>{g.text(rt,be,R+5+ce*5)}))):g.text(ve,be,R),R+=Math.max(5+d.value,Xe*5+d.value)}),ht()}function Ut(Q,V){bt();let R=at(V);g.setFontSize(9.5),Q.forEach(({item:Fe,index:pe})=>{const ee=g.splitTextToSize(E(Y(Jt(Fe,i.exerciseKind))),79),B=_n(Fe).flatMap(ke=>g.splitTextToSize(E(fe(ke)),82)),ge=Math.max(ee.length,B.length),le=Math.max(8,ge*5+3),ve=R+Math.max(0,(le-5)/2),be=R+Math.max(0,(le-ee.length*5)/2),Pe=R+Math.max(0,(le-B.length*5)/2);g.setFont("helvetica","normal"),g.text(`${pe+1}.`,v,ve,{baseline:"top"}),g.text(ee,v+7,be,{baseline:"top"}),g.setFont("helvetica","bold"),g.text(B,106,Pe,{baseline:"top"}),g.setDrawColor(220,220,220),g.line(v,R+le,z,R+le),R+=le}),ht()}return L.value.forEach((Q,V)=>it(Q,V>0)),X.value.forEach((Q,V)=>Ut(Q,V>0)),g}async function Oe(){if(!b.value){l("feature_selected",{feature:"download.pdf"}),b.value=!0;try{(await we()).save(de()),l("pdf_downloaded",{exerciseKind:i.exerciseKind})}catch{l("feature_failed",{feature:"download.pdf"})}finally{b.value=!1}}}function Ce(){A.value&&(URL.revokeObjectURL(A.value),A.value="")}async function ze(){const N=++h;w.value=!0,T.value=!1,$.value="";try{const m=(await we()).output("blob");if(N!==h)return;Ce(),A.value=URL.createObjectURL(m)}catch(g){if(N!==h)return;console.error(t("Impossible de générer l’aperçu PDF."),g),$.value=t("L’aperçu PDF n’a pas pu être créé.")}finally{N===h&&(w.value=!1)}}function me(){I&&clearTimeout(I),I=setTimeout(()=>{I=void 0,ze()},250)}Ie(()=>({questions:i.questions,verbs:i.verbs,tenses:i.tenses,exerciseKind:i.exerciseKind,options:i.options}),me,{deep:!0}),mt(()=>{l("feature_exposed",{feature:"download.pdf"}),l("feature_exposed",{feature:"download.word"}),ze()}),wn(()=>{h+=1,I&&clearTimeout(I),Ce()});async function nt(){if(!k.value){l("feature_selected",{feature:"download.word"}),k.value=!0;try{const{AlignmentType:N,BorderStyle:g,Document:m,Footer:p,Header:v,HeightRule:z,LeaderType:ne,Packer:se,Paragraph:Z,SectionType:bt,Tab:ht,TabStopType:Wt,Table:at,TableBorders:it,TableCell:Ut,TableLayoutType:Q,TableRow:V,TextRun:R,VerticalAlign:Fe,WidthType:pe}=await Nn(async()=>{const{AlignmentType:W,BorderStyle:te,Document:he,Footer:xt,Header:Bi,HeightRule:Wi,LeaderType:Ui,Packer:Vi,Paragraph:Ki,SectionType:Gi,Tab:Hi,TabStopType:qi,Table:Xi,TableBorders:Yi,TableCell:Qi,TableLayoutType:Ji,TableRow:Zi,TextRun:er,VerticalAlign:tr,WidthType:nr}=await import("./BOF6v8rb.js");return{AlignmentType:W,BorderStyle:te,Document:he,Footer:xt,Header:Bi,HeightRule:Wi,LeaderType:Ui,Packer:Vi,Paragraph:Ki,SectionType:Gi,Tab:Hi,TabStopType:qi,Table:Xi,TableBorders:Yi,TableCell:Qi,TableLayoutType:Ji,TableRow:Zi,TextRun:er,VerticalAlign:tr,WidthType:nr}},[],import.meta.url),ee=i.options.title||t("Défi de conjugaison"),B=i.options.showRandomNumber?` n° ${u}`:"",ge=9975,le={top:1020,right:965,bottom:850,left:965,header:360,footer:360,gutter:0},ve={before:0,after:0,line:240},be=new p({children:[new Z({alignment:N.CENTER,spacing:ve,children:[new R({text:"conjugaison.tatitotu.ch",size:16,color:"666666"})]})]}),Pe=W=>new v({children:[new Z({alignment:N.CENTER,spacing:ve,children:[new R({text:W,size:17,color:"666666"})]})]}),ke=new v({children:[new Z({spacing:ve})]}),ae=(W,te={})=>new Z({alignment:te.alignment,spacing:ve,children:[new R({text:W,bold:te.bold,size:te.size??21,font:"Arial"})]}),Vt=W=>{const te=Je(W,i.exerciseKind);if(!te.fillBlank)return[ae(Y(te.completion),{size:21})];const he=Y(te.completionPrefix),xt=te.completionSuffix;return[new Z({spacing:ve,tabStops:[{type:Wt.RIGHT,position:5300,leader:ne.DOT}],children:[new R({size:21,font:"Arial",children:[...he?[he," "]:[],new ht,...xt?[` ${xt}`]:[]]})]})]},ie=(W,te,he={})=>new Ut({children:W,width:{size:te,type:pe.DXA},verticalAlign:Fe.CENTER,borders:he.borders,margins:he.margins??{top:70,bottom:70,left:70,right:70}}),De={bottom:{style:g.SINGLE,size:2,color:"D9D9D9"}},Se=[],qe=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean),Xe=i.options.showGrade?965:0,rt=qe.length>0?Math.floor((ge-Xe)/qe.length):ge-Xe;if(qe.forEach(W=>Se.push(ie([ae(W,{size:18})],rt))),qe.length===0&&i.options.showGrade&&Se.push(ie([ae("")],ge-Xe)),i.options.showGrade){const W={style:g.SINGLE,size:8,color:"333333"};Se.push(ie([ae("")],Xe,{borders:{top:W,bottom:W,left:W,right:W},margins:{top:0,bottom:0,left:0,right:0}}))}const ce=[];Se.length>0&&ce.push(new at({width:{size:ge,type:pe.DXA},columnWidths:Se.map(W=>W.options.width?.size),layout:Q.FIXED,borders:it.NONE,rows:[new V({height:{value:700,rule:z.ATLEAST},cantSplit:!0,children:Se})]})),ce.push(new Z({spacing:{before:Math.round(P.value*56.7),after:260},children:[new R({text:ee.toUpperCase(),bold:!0,size:34,font:"Arial"}),new R({text:B,size:18,font:"Arial"})]})),i.options.showVerbs&&ce.push(ae(`Verbes : ${i.verbs.map(W=>W.infinitif).join(", ")}`,{bold:!0,size:19})),i.options.showTenses&&ce.push(ae(`${t("Temps :")} ${i.tenses.map(W=>a(W.name)).join(", ")}`,{bold:!0,size:19})),i.exerciseKind==="tense-identification"&&ce.push(new Z({spacing:{before:160,after:160},border:{top:{style:g.SINGLE,size:4,color:"777777"},bottom:{style:g.SINGLE,size:4,color:"777777"},left:{style:g.SINGLE,size:4,color:"777777"},right:{style:g.SINGLE,size:4,color:"777777"}},children:[new R({text:_a,size:19,font:"Arial"})]})),ce.push(new at({width:{size:ge,type:pe.DXA},columnWidths:[480,3900,5595],layout:Q.FIXED,borders:it.NONE,rows:i.questions.map((W,te)=>{const he=Je(W,i.exerciseKind);return new V({cantSplit:!0,height:{value:Math.round((5+d.value)*56.7),rule:z.ATLEAST},children:[ie([ae(`${te+1}.`,{size:21})],480,{margins:{top:70,bottom:70,left:0,right:40}}),ie([ae(Y(he.label),{size:21})],3900),ie(Vt(W),5595)]})})}));const Re=[new Z({spacing:{before:0,after:260},children:[new R({text:t("CORRIGÉ"),bold:!0,size:34,font:"Arial"}),new R({text:B,size:18,font:"Arial"})]}),new at({width:{size:ge,type:pe.DXA},columnWidths:[480,5100,4395],layout:Q.FIXED,borders:it.NONE,rows:i.questions.map((W,te)=>new V({cantSplit:!0,height:{value:460,rule:z.ATLEAST},children:[ie([ae(`${te+1}.`,{size:19})],480,{borders:De,margins:{top:55,bottom:55,left:0,right:40}}),ie([ae(Y(Jt(W,i.exerciseKind)),{size:19})],5100,{borders:De,margins:{top:55,bottom:55,left:70,right:70}}),ie(_n(W).map(he=>ae(fe(he),{bold:!0,size:19})),4395,{borders:De,margins:{top:55,bottom:55,left:70,right:70}})]}))})],Be=new m({styles:{default:{document:{run:{font:"Arial",size:21},paragraph:{spacing:ve}}}},sections:[{properties:{page:{margin:le},titlePage:!0},headers:{first:ke,default:Pe(`${ee}${B}`)},footers:{first:be,default:be},children:ce},{properties:{page:{margin:le},type:bt.NEXT_PAGE},headers:{default:Pe(`${ee} — corrigé${B}`)},footers:{default:be},children:Re}]}),yt=await se.toBlob(Be),Ln=URL.createObjectURL(yt),ot=document.createElement("a"),Ri=ee.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"");ot.href=Ln,ot.download=`${Ri||"defi-conjugaison"}.docx`,document.body.appendChild(ot),ot.click(),l("word_downloaded",{exerciseKind:i.exerciseKind}),ot.remove(),URL.revokeObjectURL(Ln)}catch{l("feature_failed",{feature:"download.word"})}finally{k.value=!1}}}return(N,g)=>(x(),kn(Sa,{to:"body"},[r("div",vf,[r("div",bf,[r("div",null,[r("strong",hf,c(o(t)("Aperçu avant impression")),1)]),r("div",null,[r("button",{class:"secondary-button",type:"button",onClick:g[0]||(g[0]=m=>s("close"))},c(o(t)("Fermer")),1),r("button",{class:"secondary-button",type:"button",disabled:o(k),onClick:nt},c(o(k)?"Création du fichier Word…":"Télécharger au format Word"),9,yf),r("button",{class:"primary-button",type:"button",disabled:o(b),onClick:Oe},c(o(b)?"Création du PDF…":"Télécharger le PDF"),9,xf)])]),r("div",_f,[r("aside",wf,[r("div",kf,[r("p",null,c(o(t)("Personnalisation")),1),r("h2",Sf,c(o(t)("Options de la fiche")),1),r("span",null,c(o(t)("Les changements apparaissent immédiatement dans l’aperçu.")),1)]),r("label",$f,[r("span",null,c(o(t)("Titre de la fiche")),1),r("input",{id:"preview-print-title",type:"text",value:e.options.title,onInput:g[1]||(g[1]=m=>D("title",m.target.value))},null,40,Cf)]),r("fieldset",Pf,[r("legend",null,c(o(t)("Mise en page")),1),r("label",If,[r("span",null,c(o(t)("Espace avant le titre")),1),r("span",null,[r("input",{id:"preview-title-spacing",type:"number",min:"8",max:"30",step:"1",value:o(P),onInput:g[2]||(g[2]=m=>D("titleSpacingMm",Number(m.target.value)))},null,40,Af),g[12]||(g[12]=oe(" mm ",-1))])]),r("label",Tf,[r("span",null,c(o(t)("Espacement entre les questions")),1),r("span",null,[r("input",{id:"preview-question-spacing",type:"number",min:"2",max:"15",step:"0.5",value:o(d),onInput:g[3]||(g[3]=m=>D("questionSpacingMm",Number(m.target.value)))},null,40,jf),g[13]||(g[13]=oe(" mm ",-1))])])]),r("fieldset",Of,[r("legend",null,c(o(t)("Informations de l’élève")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showFirstName,onChange:g[4]||(g[4]=m=>D("showFirstName",m.target.checked))},null,40,zf),r("span",null,c(o(t)("Prénom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showLastName,onChange:g[5]||(g[5]=m=>D("showLastName",m.target.checked))},null,40,Ff),r("span",null,c(o(t)("Nom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showDate,onChange:g[6]||(g[6]=m=>D("showDate",m.target.checked))},null,40,Ef),r("span",null,c(o(t)("Date")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showGrade,onChange:g[7]||(g[7]=m=>D("showGrade",m.target.checked))},null,40,Lf),r("span",null,c(o(t)("Espace pour la note")),1)])]),r("fieldset",Nf,[r("legend",null,c(o(t)("Contenu affiché")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showVerbs,onChange:g[8]||(g[8]=m=>D("showVerbs",m.target.checked))},null,40,Mf),r("span",null,c(o(t)("Liste des verbes")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showTenses,onChange:g[9]||(g[9]=m=>D("showTenses",m.target.checked))},null,40,Df),r("span",null,c(o(t)("Liste des temps")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showRandomNumber,onChange:g[10]||(g[10]=m=>D("showRandomNumber",m.target.checked))},null,40,Rf),r("span",null,c(o(t)("Numéro questionnaire/corrigé")),1)])])]),r("main",Bf,[o(A)?(x(),S("iframe",{key:0,class:"pdf-preview-frame",src:`${o(A)}#view=FitH&toolbar=1&navpanes=0`,title:o(t)("Aperçu exact de la fiche PDF et de son corrigé"),onLoad:g[11]||(g[11]=m=>T.value=!0)},null,40,Wf)):M("",!0),!o($)&&(o(w)||!o(T))?(x(),S("div",Uf,[g[14]||(g[14]=r("span",{class:"pdf-preview-spinner","aria-hidden":"true"},null,-1)),r("strong",null,c(o(t)("Création de l’aperçu PDF…")),1),r("span",null,c(o(t)("La fiche et le corrigé sont mis en page.")),1)])):M("",!0),o($)?(x(),S("div",Vf,[r("strong",null,c(o($)),1),r("button",{class:"secondary-button",type:"button",onClick:ze},c(o(t)("Réessayer")),1)])):M("",!0)])])],512)]))}}),jm=Object.assign(Kf,{__name:"ChallengePrintPreview"}),Gf=rr("/images/recharger-defi.svg?v=dynamic-code"),Hf={ref:"share-dialog",class:"app-dialog share-dialog","data-tour":"share-dialog",role:"dialog","aria-modal":"true","aria-labelledby":"share-title",tabindex:"-1"},qf=["aria-label"],Xf={class:"dialog-kicker"},Yf={id:"share-title"},Qf={for:"share-challenge-title"},Jf=["readonly","aria-invalid","aria-describedby"],Zf=["disabled"],ed={for:"share-challenge-description"},td=["readonly","aria-describedby"],nd={id:"share-description-help",class:"share-title-form__description-help"},ad={key:0,id:"share-title-error",class:"form-error",role:"alert"},id={key:0},rd={key:1,class:"share-methods"},od={class:"share-method","aria-labelledby":"share-code-title"},sd={id:"share-code-title"},ld={class:"share-method__tip"},ud={class:"share-value"},cd={for:"share-code"},fd=["value"],dd={class:"share-help"},md={type:"button",class:"share-help__trigger","aria-describedby":"reload-help-tooltip"},pd={id:"reload-help-tooltip",class:"share-help__tooltip",role:"tooltip"},gd={class:"share-help__preview"},vd=["alt"],bd={"aria-hidden":"true"},hd={class:"share-method","aria-labelledby":"share-link-title"},yd={id:"share-link-title"},xd={class:"share-method__tip"},_d={class:"share-value"},wd={for:"share-url"},kd=["value"],Sd={class:"copy-status","aria-live":"polite"},$d=Me({__name:"ShareChallengeDialog",props:{code:{},url:{},busy:{type:Boolean},error:{},initialTitle:{},initialDescription:{}},emits:["close","save"],setup(e,{emit:n}){const{ui:t,localePath:a}=He(),i=e,s=n,l=G(""),u=G(i.initialTitle?.trim()||t("Défi de conjugaison")),f=G(i.initialDescription?.trim()||""),b=jt("close-button"),k=jt("share-dialog"),w=F(()=>u.value.trim()),T=F(()=>f.value.trim()),A=F(()=>w.value.length>=1&&w.value.length<=80);Ca(k,()=>s("close"),b);async function $(y,d){try{await navigator.clipboard.writeText(y),l.value=`${d} copié.`}catch{l.value=`Sélectionnez puis copiez le ${d.toLocaleLowerCase("fr")}.`}}function h(){try{sessionStorage.setItem("highlight-home-challenge-loader","1")}catch{}}function I(){i.code||i.busy||!A.value||s("save",w.value,T.value)}return(y,d)=>{const P=ur;return x(),kn(Sa,{to:"body"},[r("div",{class:"dialog-backdrop",onClick:d[8]||(d[8]=Tt(C=>s("close"),["self"]))},[r("section",Hf,[r("button",{ref:"close-button",class:"dialog-close",type:"button","aria-label":o(t)("Fermer"),onClick:d[0]||(d[0]=C=>s("close"))}," × ",8,qf),r("p",Xf,c(e.code?o(t)("Défi sauvegardé"):o(t)("Défi prêt à être partagé")),1),r("h2",Yf,c(o(t)("Votre défi est prêt à être partagé")),1),r("form",{class:"share-title-form",onSubmit:Tt(I,["prevent"])},[r("label",Qf,c(o(t)("Titre du défi")),1),r("div",null,[Zt(r("input",{id:"share-challenge-title","onUpdate:modelValue":d[1]||(d[1]=C=>tn(u)?u.value=C:null),type:"text",maxlength:"80",readonly:!!e.code,"aria-invalid":!o(A),"aria-describedby":e.error?"share-title-error":void 0,required:"",autofocus:""},null,8,Jf),[[en,o(u)]]),e.code?M("",!0):(x(),S("button",{key:0,class:"primary-button",type:"submit",disabled:e.busy||!o(A)},c(e.busy?o(t)("Création…"):o(t)("Créer le code")),9,Zf))]),r("small",null,c(o(w).length)+"/80",1),r("label",ed,c(o(t)("Description du défi")),1),Zt(r("textarea",{id:"share-challenge-description","onUpdate:modelValue":d[2]||(d[2]=C=>tn(f)?f.value=C:null),rows:"4",maxlength:"1000",readonly:!!e.code,"aria-describedby":e.error?"share-title-error share-description-help":"share-description-help"},null,8,td),[[en,o(f)]]),r("small",nd,c(o(t)("Facultatif : une description à l’attention des personnes qui découvriront ce défi"))+" · "+c(o(T).length)+"/1000 ",1),e.error?(x(),S("p",ad,c(e.error),1)):M("",!0)],32),e.code?(x(),S("p",id,c(o(t)("Deux possibilités permettent à vos élèves de retrouver ce défi.")),1)):M("",!0),e.code?(x(),S("div",rd,[r("section",od,[r("header",null,[d[9]||(d[9]=r("span",{class:"share-method__number","aria-hidden":"true"},"1",-1)),r("div",null,[r("h3",sd,c(o(t)("Sauvegarder le code")),1),r("p",null,c(o(t)("L’élève conserve ce code. Plus tard, il le copie sur la page d’accueil pour retrouver ce défi.")),1),r("p",ld,c(o(t)("Idéal pour transmettre le défi par écrit")),1)])]),r("div",ud,[r("label",cd,c(o(t)("Code à conserver")),1),r("div",null,[r("input",{id:"share-code",value:e.code,readonly:"",onFocus:d[3]||(d[3]=C=>C.target.select())},null,40,fd),r("button",{type:"button",onClick:d[4]||(d[4]=C=>$(e.code,"Code"))},c(o(t)("Copier")),1)]),r("div",dd,[r("button",md,c(o(t)("Comment le recharger plus tard ?")),1),r("div",pd,[r("div",gd,[r("img",{src:Gf,alt:o(t)("Emplacement du code reçu sur la page d’accueil")},null,8,vd),r("span",bd,c(e.code),1)]),r("p",null,[d[10]||(d[10]=oe("Tes élèves colleront le code à cet endroit dans la ",-1)),Ue(P,{to:o(a)("/"),onClick:h},{default:Ve(()=>[oe(c(o(t)("page d’accueil")),1)]),_:1},8,["to"])])])])])]),r("section",hd,[r("header",null,[d[11]||(d[11]=r("span",{class:"share-method__number","aria-hidden":"true"},"2",-1)),r("div",null,[r("h3",yd,c(o(t)("Envoyer le lien direct")),1),r("p",null,c(o(t)("L’élève clique simplement sur ce lien : il arrive directement sur le défi, sans saisir le code.")),1),r("p",xd,c(o(t)("Idéal pour transmettre le défi par email")),1)])]),r("div",_d,[r("label",wd,c(o(t)("Lien à envoyer")),1),r("div",null,[r("input",{id:"share-url",value:e.url,readonly:"",onFocus:d[5]||(d[5]=C=>C.target.select())},null,40,kd),r("button",{type:"button",onClick:d[6]||(d[6]=C=>$(e.url,"Lien"))},c(o(t)("Copier")),1)])])])])):M("",!0),e.code?(x(),S(K,{key:2},[r("p",Sd,c(o(l)),1),r("button",{class:"primary-button",type:"button",onClick:d[7]||(d[7]=C=>s("close"))},c(o(t)("Terminé")),1)],64)):M("",!0)],512)])])}}}),Om=Object.assign($d,{__name:"ChallengeShareChallengeDialog"}),Cd={class:"builder-card tense-picker","aria-labelledby":"tenses-title"},Pd={class:"builder-card__header"},Id={class:"builder-card__eyebrow"},Ad={id:"tenses-title"},Td=["aria-label"],jd={class:"selection-toolbar"},Od={class:"tense-groups"},zd=["aria-labelledby"],Fd=["id"],Ed={class:"tense-group__items"},Ld={class:"tense-row"},Nd={class:"tense-info"},Md=["aria-label","aria-describedby"],Dd=["id"],Rd={class:"switch-row"},Bd=["checked","onChange"],Wd={key:0,class:"tense-group__trailing"},Ud={class:"tense-row"},Vd={class:"tense-info"},Kd=["aria-label","aria-describedby"],Gd=["id"],Hd={class:"switch-row"},qd=["checked","onChange"],Xd=Me({__name:"TensePicker",props:{modes:{},tenses:{},verbs:{},selectedIds:{}},emits:["toggle","selectAll","clear"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=He(),i=e,s=n,l=F(()=>new Set(i.selectedIds)),u=G({}),f=G(!1),b=F(()=>{const $=i.verbs.filter(h=>h.complementExample?.functionObject==="cod");return $.length?$:i.verbs}),k=F(()=>`${b.value.map($=>$.id).join(",")}|${i.tenses.map($=>$.id).join(",")}`),w=F(()=>i.modes.map($=>{const h=i.tenses.filter(d=>d.modeId===$.id).sort((d,P)=>Mn($.name,d.name)-Mn($.name,P.name)||d.id-P.id),I=h.filter(d=>Dn(d)),y=h.filter(d=>!Dn(d));return{mode:$,tenses:h,columns:[y.filter(d=>!d.isCompound),y.filter(d=>d.isCompound)].filter(d=>d.length>0),trailingTenses:I}}).filter($=>$.tenses.length>0));let T=0;async function A(){const $=++T;if(u.value={},!(!b.value.length||!i.tenses.length)){f.value=!0;try{const h=await $fetch("/api/tense-examples",{method:"POST",body:{verbIds:b.value.map(I=>I.id),tenseIds:i.tenses.map(I=>I.id)}});$===T&&(u.value=h.examples)}catch{$===T&&(u.value={})}finally{$===T&&(f.value=!1)}}}return mt(A),Ie(k,()=>{A()}),($,h)=>(x(),S("section",Cd,[r("div",Pd,[r("div",null,[r("p",Id,c(o(t)("Étape 2")),1),r("h2",Ad,c(o(t)("Mes temps")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} temps sélectionnés`},c(e.selectedIds.length),9,Td)]),r("div",jd,[r("button",{class:"text-button",type:"button",onClick:h[0]||(h[0]=I=>s("selectAll"))},c(o(t)("Tout cocher")),1),r("button",{class:"text-button text-button--danger",type:"button",onClick:h[1]||(h[1]=I=>s("clear"))},c(o(t)("Tout décocher")),1)]),r("div",Od,[(x(!0),S(K,null,re(o(w),I=>(x(),S("section",{key:I.mode.id,class:"tense-group",role:"group","aria-labelledby":`tense-mode-${I.mode.id}`},[r("h3",{id:`tense-mode-${I.mode.id}`,class:"tense-group__title"},c(o(a)(I.mode.name)),9,Fd),r("div",{class:ye(["tense-group__columns",{"tense-group__columns--single":I.columns.length===1}])},[(x(!0),S(K,null,re(I.columns,(y,d)=>(x(),S("div",{key:d,class:"tense-group__column"},[r("div",Ed,[(x(!0),S(K,null,re(y,P=>(x(),S("div",{key:P.id,class:"tense-entry"},[r("div",Ld,[r("span",Nd,[r("button",{type:"button","aria-label":`${o(t)("Voir un exemple :")} ${o(a)(P.name)}`,"aria-describedby":`tense-example-${P.id}`},"i",8,Md),r("span",{id:`tense-example-${P.id}`,class:"tense-tooltip",role:"tooltip"},[o(u)[P.id]?(x(),S(K,{key:0},[oe(c(o(t)("Exemple:"))+" ",1),r("strong",null,c(o(u)[P.id].emphasis),1),o(u)[P.id].rest?(x(),S(K,{key:0},[oe(c(o(u)[P.id].rest),1)],64)):M("",!0)],64)):(x(),S(K,{key:1},[oe(c(o(f)?o(t)("Chargement…"):o(t)("Exemple momentanément indisponible.")),1)],64))],8,Dd)]),r("label",Rd,[r("input",{type:"checkbox",checked:o(l).has(P.id),onChange:C=>s("toggle",P.id)},null,40,Bd),h[2]||(h[2]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,c(o(a)(P.name)),1)])])]))),128))])]))),128))],2),I.trailingTenses.length?(x(),S("div",Wd,[(x(!0),S(K,null,re(I.trailingTenses,y=>(x(),S("div",{key:y.id,class:"tense-entry"},[r("div",Ud,[r("span",Vd,[r("button",{type:"button","aria-label":`${o(t)("Voir un exemple :")} ${o(a)(y.name)}`,"aria-describedby":`tense-example-${y.id}`},"i",8,Kd),r("span",{id:`tense-example-${y.id}`,class:"tense-tooltip",role:"tooltip"},[o(u)[y.id]?(x(),S(K,{key:0},[oe(c(o(t)("Exemple:"))+" ",1),r("strong",null,c(o(u)[y.id].emphasis),1),o(u)[y.id].rest?(x(),S(K,{key:0},[oe(c(o(u)[y.id].rest),1)],64)):M("",!0)],64)):(x(),S(K,{key:1},[oe(c(o(f)?o(t)("Chargement…"):o(t)("Exemple momentanément indisponible.")),1)],64))],8,Gd)]),r("label",Hd,[r("input",{type:"checkbox",checked:o(l).has(y.id),onChange:d=>s("toggle",y.id)},null,40,qd),h[3]||(h[3]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,c(o(a)(y.name)),1)])])]))),128))])):M("",!0)],8,zd))),128))])]))}}),zm=Object.assign(Lt(Xd,[["__scopeId","data-v-ee3658cb"]]),{__name:"ChallengeTensePicker"}),Yd={class:"builder-card verb-picker","aria-labelledby":"verbs-title"},Qd={class:"builder-card__header"},Jd={class:"builder-card__eyebrow"},Zd={id:"verbs-title"},em=["aria-label"],tm={class:"verb-search"},nm={for:"verb-search-input"},am={class:"verb-search__control"},im=["placeholder","aria-expanded","onKeydown"],rm=["disabled","aria-label"],om=["aria-label"],sm=["onClick"],lm={key:0},um={key:1},cm={key:1,class:"field-hint","aria-live":"polite"},fm={class:"selection-toolbar"},dm=["aria-label","onClick"],mm=Me({__name:"VerbPicker",props:{verbs:{},selectedIds:{}},emits:["add","remove","clear"],setup(e,{emit:n}){const{ui:t}=He(),a=e,i=n,s=G(""),l=jt("verb-input"),u=F(()=>new Set(a.selectedIds)),f=F(()=>{const $=new Map(a.verbs.map(h=>[h.id,h]));return a.selectedIds.map(h=>$.get(h)).filter(h=>!!h)}),b=F(()=>{const $=f.value.length;return $<=3?1.35:Math.max(1,1.35-($-3)/20)}),k=F(()=>{const $=b.value,h=1+($-1)*.55;return{"--selected-chip-gap":`${7*$}px`,"--selected-chip-inner-gap":`${6*$}px`,"--selected-chip-padding-block":`${7*$}px`,"--selected-chip-padding-end":`${8*$}px`,"--selected-chip-padding-start":`${11*$}px`,"--selected-chip-font-size":`${.87*$}rem`,"--selected-chip-button-size":`${21*$}px`,"--selected-chip-button-font-size":`${$}rem`,"--selected-chip-mobile-gap":`${7*h}px`,"--selected-chip-mobile-inner-gap":`${6*h}px`,"--selected-chip-mobile-padding-block":`${7*h}px`,"--selected-chip-mobile-padding-end":`${8*h}px`,"--selected-chip-mobile-padding-start":`${11*h}px`,"--selected-chip-mobile-font-size":`${.87*h}rem`,"--selected-chip-mobile-button-size":`${21*h}px`,"--selected-chip-mobile-button-font-size":`${h}rem`}}),w=F(()=>cr(s.value)?fr(a.verbs.filter(h=>!u.value.has(h.id)),s.value).slice(0,8):[]);function T($){i("add",$.id),s.value="",At(()=>l.value?.focus())}function A(){const $=w.value[0];$&&T($)}return($,h)=>(x(),S("section",Yd,[r("div",Qd,[r("div",null,[r("p",Jd,c(o(t)("Étape 1")),1),r("h2",Zd,c(o(t)("Mes verbes")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} verbes sélectionnés`},c(e.selectedIds.length),9,em)]),r("div",tm,[r("label",nm,c(o(t)("Ajouter un verbe")),1),r("div",am,[Zt(r("input",{id:"verb-search-input",ref:"verb-input","onUpdate:modelValue":h[0]||(h[0]=I=>tn(s)?s.value=I:null),type:"search",autocomplete:"off",placeholder:o(t)("Ex. aller, être, finir…"),"aria-expanded":o(w).length>0,"aria-controls":"verb-suggestions",onKeydown:or(Tt(A,["prevent"]),["enter"])},null,40,im),[[en,o(s)]]),r("button",{class:"icon-button icon-button--add",type:"button",disabled:o(w).length===0,"aria-label":o(t)("Ajouter le premier verbe proposé"),onClick:A}," + ",8,rm)]),o(w).length>0?(x(),S("ul",{key:0,id:"verb-suggestions",class:"verb-suggestions",role:"listbox","aria-label":o(t)("Verbes proposés")},[(x(!0),S(K,null,re(o(w),I=>(x(),S("li",{key:I.id,role:"option"},[r("button",{type:"button",onClick:y=>T(I)},[r("strong",null,c(I.infinitif),1),I.isPronominalForm&&I.baseVerbId?(x(),S("span",lm,c(o(t)("forme pronominale générée")),1)):I.auxiliaire?(x(),S("span",um,c(o(t)("auxiliaire"))+" "+c(I.auxiliaire),1)):M("",!0)],8,sm)]))),128))],8,om)):o(s)?(x(),S("p",cm," Aucun nouveau verbe ne commence par « "+c(o(s))+" ». ",1)):M("",!0)]),r("div",fm,[r("p",null,c(o(f).length?o(t)("Verbes retenus"):o(t)("Aucun verbe sélectionné")),1),o(f).length?(x(),S("button",{key:0,class:"text-button text-button--danger",type:"button",onClick:h[1]||(h[1]=I=>i("clear"))},c(o(t)("Tout supprimer")),1)):M("",!0)]),o(f).length?(x(),kn(sr,{key:0,tag:"ul",name:"verb-chip",class:"selected-chips selected-chips--adaptive",style:lr(o(k)),"aria-label":o(t)("Verbes sélectionnés")},{default:Ve(()=>[(x(!0),S(K,null,re(o(f),I=>(x(),S("li",{key:I.id},[r("span",null,c(I.infinitif),1),r("button",{type:"button","aria-label":o(t)("Retirer le verbe {verb}",{verb:I.infinitif}),onClick:y=>i("remove",I.id)},"×",8,dm)]))),128))]),_:1},8,["style","aria-label"])):M("",!0)]))}}),Fm=Object.assign(Lt(mm,[["__scopeId","data-v-f03191bf"]]),{__name:"ChallengeVerbPicker"});function Em(e){return new URL(globalThis.location.href)}export{Am as C,Tm as P,Om as S,zm as T,Fm as V,Em as a,Im as b,jm as c,Pm as d,dr as e,$m as f,gr as g,Sm as h,mr as l,br as n,Cm as u};
