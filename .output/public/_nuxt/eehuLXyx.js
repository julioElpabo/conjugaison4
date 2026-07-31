const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./CU_Iov45.js","./BtnniV2X.js","./entry.CRRjxRjR.css"])))=>i.map(i=>d[i]);
import{a as ka,c as ar}from"./BeHZwg2h.js";import{u as st}from"./B5m_MpBT.js";import{p as F,e as Le,f as Pe,aa as $t,q as He,J as mt,c as $,a as r,t as c,h as o,L as ir,b as Ue,o as k,l as Q,y as wn,n as be,d as se,i as M,U as ut,w as Ve,F as Y,r as ie,j as At,E as Jt,g as kn,T as Sa,a9 as Ln,z as Tt,ab as rr,k as Zt,v as en,D as tn,C as or,a8 as sr,K as lr}from"./BtnniV2X.js";import{_ as Ft}from"./DlAUqK2U.js";import{u as $a}from"./V2wzTD_L.js";import{u as Pa}from"./D1CFC2v6.js";import{_ as ur}from"./9C8lto67.js";import{b as Dn}from"./CnD20lMG.js";import{i as Mn}from"./DiGbjIca.js";import{n as cr,m as fr}from"./g6ucs01C.js";const Ca=["cod-after","coi-after"];function dr(e,n){return e?n==="before"?["cod-before"]:n==="mixed"?["cod-after","cod-before","coi-after"]:[...Ca]:[]}function mr(e){const n=e.some(a=>a.endsWith("-before")),t=e.some(a=>a.endsWith("-after"));return{includeComplements:e.length>0,complementPlacement:n&&t?"mixed":n?"before":"after"}}function xm(e){return[e.groupLabel||ka[e.group]||e.group,e.label].filter(Boolean).join(" | ")}function _m(e){return Number.isInteger(e)&&Number(e)>0?`${Number(e)} au hasard`:"Tous les verbes"}const Rn={exerciseKind:"conjugation",pastSimplePronouns:"all",inclusivePronouns:!1,includeComplements:!0,complementPlacement:"after",complementOptions:[...Ca]},pr=()=>({title:"Défi de conjugaison",questionSpacingMm:8,titleSpacingMm:30,showGrade:!0,showVerbs:!1,showTenses:!1,showFirstName:!0,showLastName:!0,showDate:!0,showRandomNumber:!0}),Bn=()=>({verbIds:[1,2,3,4],tenseIds:[1,3,4,5],questionCount:10,...Rn,complementOptions:[...Rn.complementOptions],printOptions:pr()});function wm(){const e=st("challenge-catalogue",()=>({verbes:[],modes:[],temps:[],presets:[]})),n=st("challenge-config",Bn),t=st("challenge-catalogue-status",()=>"idle"),a=st("challenge-catalogue-error",()=>""),i=F(()=>{const d=new Map(e.value.verbes.map(P=>[P.id,P]));return n.value.verbIds.map(P=>d.get(P)).filter(P=>!!P)}),s=F(()=>{const d=new Map(e.value.temps.map(C=>[C.id,C])),P=new Map(e.value.modes.map(C=>[C.id,C]));return n.value.tenseIds.map(C=>d.get(C)).filter(C=>!!C).map(C=>({...C,mode:C.mode||P.get(C.modeId)}))}),l=F(()=>n.value.verbIds.length>0&&n.value.tenseIds.length>0&&n.value.questionCount>0);function u(){const d=e.value.modes.find(C=>C.name.toLocaleLowerCase("fr")==="indicatif");if(!d)return[1,3,4,5];const P=new Set(["présent","futur proche","imparfait","passé composé","futur","futur simple"]);return e.value.temps.filter(C=>C.modeId===d.id&&P.has(C.name.toLocaleLowerCase("fr"))).map(C=>C.id)}async function f(d=!1){const P=e.value.temps.length>0&&e.value.temps.every(C=>!!C.example?.trim());if(!d&&t.value==="success"&&P)return e.value;t.value="loading",a.value="";try{const C=await $fetch("/api/catalogue");e.value={verbes:[...C.verbes].sort((L,q)=>L.infinitif.localeCompare(q.infinitif,"fr")),modes:[...C.modes].sort((L,q)=>L.order-q.order||L.id-q.id),temps:[...C.temps],presets:[...C.presets]};const N=new Set(e.value.verbes.map(L=>L.id)),K=new Set(e.value.temps.map(L=>L.id)),R=u();return n.value.verbIds=n.value.verbIds.filter(L=>N.has(L)),n.value.tenseIds=n.value.tenseIds.filter(L=>K.has(L)),n.value.verbIds.length===0&&(n.value.verbIds=e.value.verbes.slice(0,4).map(L=>L.id)),n.value.tenseIds.length===0&&(n.value.tenseIds=R.length>0?R:e.value.temps.slice(0,1).map(L=>L.id)),t.value="success",e.value}catch(C){throw t.value="error",a.value=gr(C,"Impossible de charger le catalogue."),C}}function p(d){n.value.verbIds.includes(d)||(n.value.verbIds=[...n.value.verbIds,d])}function w(d){n.value.verbIds=n.value.verbIds.filter(P=>P!==d)}function _(){n.value.verbIds=[]}function O(d){n.value.tenseIds=n.value.tenseIds.includes(d)?n.value.tenseIds.filter(P=>P!==d):[...n.value.tenseIds,d]}function A(){n.value.tenseIds=e.value.temps.map(d=>d.id)}function S(){n.value.tenseIds=[]}function v(){n.value.tenseIds=u()}function I(d){const P=new Set(e.value.verbes.map(N=>N.id)),C=new Set(e.value.temps.map(N=>N.id));n.value={...n.value,verbIds:d.verbIds.filter(N=>P.has(N)),tenseIds:d.tenseIds.filter(N=>C.has(N)),questionCount:d.questionCount}}function b(d){const P=Bn();I(d);const C=d.complementOptions??(d.includeComplements===void 0?[...P.complementOptions]:dr(d.includeComplements,d.complementPlacement??"after")),N=mr(C);n.value={...n.value,exerciseKind:d.exerciseKind??P.exerciseKind,pastSimplePronouns:d.pastSimplePronouns??P.pastSimplePronouns,inclusivePronouns:d.inclusivePronouns??P.inclusivePronouns,includeComplements:N.includeComplements,complementPlacement:N.complementPlacement,complementOptions:C,printOptions:{...P.printOptions,...d.printOptions??{}}}}return{catalogue:e,challenge:n,catalogueStatus:t,catalogueError:a,selectedVerbs:i,selectedTenses:s,isReady:l,loadCatalogue:f,addVerb:p,removeVerb:w,clearVerbs:_,toggleTense:O,selectAllTenses:A,clearTenses:S,selectDefaultTenses:v,applySelection:I,applySharedChallenge:b}}function gr(e,n="Une erreur est survenue."){if(e&&typeof e=="object"){const t=e;return t.data?.statusMessage||t.data?.message||t.statusMessage||t.message||n}return n}function vr(e){return{verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions]}}function br(e){const n=e.toUpperCase().replace(/[^A-Z0-9]/g,"");return n.length===8?n.match(/.{1,2}/g)?.join("-")??n:e.trim().toUpperCase()}function hr(e,n,t){return{version:1,...n===void 0?{}:{title:n.trim()},...t?.trim()?{description:t.trim()}:{},verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions],printOptions:{...e.printOptions}}}function km(){async function e(a){return await $fetch("/api/questionnaires",{method:"POST",body:vr(a)})}async function n(a,i,s=""){return await $fetch("/api/defis",{method:"POST",body:hr(a,i,s)})}async function t(a){const i=br(a);return await $fetch(`/api/defis/${encodeURIComponent(i)}`)}return{generateQuestions:e,saveChallenge:n,loadChallenge:t}}function nn(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function yr(e){if(Array.isArray(e))return e}function xr(e){if(Array.isArray(e))return nn(e)}function _r(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function wr(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,Ia(a.key),a)}}function kr(e,n,t){return n&&wr(e.prototype,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function Pt(e,n){var t=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=Sn(e))||n){t&&(e=t);var a=0,i=function(){};return{s:i,n:function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}},e:function(f){throw f},f:i}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var s,l=!0,u=!1;return{s:function(){t=t.call(e)},n:function(){var f=t.next();return l=f.done,f},e:function(f){u=!0,s=f},f:function(){try{l||t.return==null||t.return()}finally{if(u)throw s}}}}function z(e,n,t){return(n=Ia(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function Sr(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function $r(e,n){var t=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(t!=null){var a,i,s,l,u=[],f=!0,p=!1;try{if(s=(t=t.call(e)).next,n===0){if(Object(t)!==t)return;f=!1}else for(;!(f=(a=s.call(t)).done)&&(u.push(a.value),u.length!==n);f=!0);}catch(w){p=!0,i=w}finally{try{if(!f&&t.return!=null&&(l=t.return(),Object(l)!==l))return}finally{if(p)throw i}}return u}}function Pr(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Cr(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Wn(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function x(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?Wn(Object(t),!0).forEach(function(a){z(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Wn(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function Nt(e,n){return yr(e)||$r(e,n)||Sn(e,n)||Pr()}function ye(e){return xr(e)||Sr(e)||Sn(e)||Cr()}function Ir(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function Ia(e){var n=Ir(e,"string");return typeof n=="symbol"?n:n+""}function Ot(e){"@babel/helpers - typeof";return Ot=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Ot(e)}function Sn(e,n){if(e){if(typeof e=="string")return nn(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?nn(e,n):void 0}}var Un=function(){},$n={},Aa={},Ta=null,Oa={mark:Un,measure:Un};try{typeof window<"u"&&($n=window),typeof document<"u"&&(Aa=document),typeof MutationObserver<"u"&&(Ta=MutationObserver),typeof performance<"u"&&(Oa=performance)}catch{}var Ar=$n.navigator||{},Vn=Ar.userAgent,Kn=Vn===void 0?"":Vn,Ee=$n,H=Aa,Gn=Ta,_t=Oa;Ee.document;var Ae=!!H.documentElement&&!!H.head&&typeof H.addEventListener=="function"&&typeof H.createElement=="function",ja=~Kn.indexOf("MSIE")||~Kn.indexOf("Trident/"),wt,Tr=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|gt|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt|sldr|slpdr|pr|ms|vs)?[\-\ ]/,Or=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Graphite|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Slab Duo|Slab Press Duo|Pixel|Mosaic|Vellum|Whiteboard)?.*/i,za={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},"slab-duo":{"fa-regular":"regular",fasldr:"regular"},"slab-press-duo":{"fa-regular":"regular",faslpdr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},vellum:{"fa-solid":"solid",favs:"solid"},pixel:{"fa-regular":"regular",fapr:"regular"},mosaic:{"fa-solid":"solid",fams:"solid"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},graphite:{"fa-thin":"thin",fagt:"thin"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},jr={GROUP:"duotone-group",PRIMARY:"primary",SECONDARY:"secondary"},Ea=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],Z="classic",pt="duotone",Fa="sharp",Na="sharp-duotone",La="chisel",Da="etch",Ma="graphite",Ra="jelly",Ba="jelly-duo",Wa="jelly-fill",Ua="mosaic",Va="notdog",Ka="notdog-duo",Ga="pixel",Ha="slab",qa="slab-duo",Xa="slab-press",Ya="slab-press-duo",Qa="thumbprint",Ja="utility",Za="utility-duo",ei="utility-fill",ti="vellum",ni="whiteboard",zr="Classic",Er="Duotone",Fr="Sharp",Nr="Sharp Duotone",Lr="Chisel",Dr="Etch",Mr="Graphite",Rr="Jelly",Br="Jelly Duo",Wr="Jelly Fill",Ur="Mosaic",Vr="Notdog",Kr="Notdog Duo",Gr="Pixel",Hr="Slab",qr="Slab Duo",Xr="Slab Press",Yr="Slab Press Duo",Qr="Thumbprint",Jr="Utility",Zr="Utility Duo",eo="Utility Fill",to="Vellum",no="Whiteboard",ai=[Z,pt,Fa,Na,La,Da,Ma,Ra,Ba,Wa,Ua,Va,Ka,Ga,Ha,qa,Xa,Ya,Qa,Ja,Za,ei,ti,ni];wt={},z(z(z(z(z(z(z(z(z(z(wt,Z,zr),pt,Er),Fa,Fr),Na,Nr),La,Lr),Da,Dr),Ma,Mr),Ra,Rr),Ba,Br),Wa,Wr),z(z(z(z(z(z(z(z(z(z(wt,Ua,Ur),Va,Vr),Ka,Kr),Ga,Gr),Ha,Hr),qa,qr),Xa,Xr),Ya,Yr),Qa,Qr),Ja,Jr),z(z(z(z(wt,Za,Zr),ei,eo),ti,to),ni,no);var ao={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},"slab-duo":{400:"fasldr"},"slab-press-duo":{400:"faslpdr"},vellum:{900:"favs"},mosaic:{900:"fams"},pixel:{400:"fapr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},graphite:{100:"fagt"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},io={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Slab Duo":{400:"fasldr",normal:"fasldr"},"Font Awesome 7 Slab Press Duo":{400:"faslpdr",normal:"faslpdr"},"Font Awesome 7 Pixel":{400:"fapr",normal:"fapr"},"Font Awesome 7 Mosaic":{900:"fams",normal:"fams"},"Font Awesome 7 Vellum":{900:"favs",normal:"favs"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Graphite":{100:"fagt",normal:"fagt"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},ro=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["graphite",{defaultShortPrefixId:"fagt",defaultStyleId:"thin",styleIds:["thin"],futureStyleIds:[],defaultFontWeight:100}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["mosaic",{defaultShortPrefixId:"fams",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["pixel",{defaultShortPrefixId:"fapr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-duo",{defaultShortPrefixId:"fasldr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press-duo",{defaultShortPrefixId:"faslpdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["vellum",{defaultShortPrefixId:"favs",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),oo={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},graphite:{thin:"fagt"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},mosaic:{solid:"fams"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},pixel:{regular:"fapr"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-duo":{regular:"fasldr"},"slab-press":{regular:"faslpr"},"slab-press-duo":{regular:"faslpdr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},vellum:{solid:"favs"},whiteboard:{semibold:"fawsb"}},ii=["fak","fa-kit","fakd","fa-kit-duotone"],Hn={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},so=["kit"],lo="kit",uo="kit-duotone",co="Kit",fo="Kit Duotone";z(z({},lo,co),uo,fo);var mo={kit:{"fa-kit":"fak"}},po={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},go={kit:{fak:"fa-kit"}},qn={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},kt,St={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},vo=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],bo="classic",ho="duotone",yo="sharp",xo="sharp-duotone",_o="chisel",wo="etch",ko="graphite",So="jelly",$o="jelly-duo",Po="jelly-fill",Co="mosaic",Io="notdog",Ao="notdog-duo",To="pixel",Oo="slab",jo="slab-duo",zo="slab-press",Eo="slab-press-duo",Fo="thumbprint",No="utility",Lo="utility-duo",Do="utility-fill",Mo="vellum",Ro="whiteboard",Bo="Classic",Wo="Duotone",Uo="Sharp",Vo="Sharp Duotone",Ko="Chisel",Go="Etch",Ho="Graphite",qo="Jelly",Xo="Jelly Duo",Yo="Jelly Fill",Qo="Mosaic",Jo="Notdog",Zo="Notdog Duo",es="Pixel",ts="Slab",ns="Slab Duo",as="Slab Press",is="Slab Press Duo",rs="Thumbprint",os="Utility",ss="Utility Duo",ls="Utility Fill",us="Vellum",cs="Whiteboard";kt={},z(z(z(z(z(z(z(z(z(z(kt,bo,Bo),ho,Wo),yo,Uo),xo,Vo),_o,Ko),wo,Go),ko,Ho),So,qo),$o,Xo),Po,Yo),z(z(z(z(z(z(z(z(z(z(kt,Co,Qo),Io,Jo),Ao,Zo),To,es),Oo,ts),jo,ns),zo,as),Eo,is),Fo,rs),No,os),z(z(z(z(kt,Lo,ss),Do,ls),Mo,us),Ro,cs);var fs="kit",ds="kit-duotone",ms="Kit",ps="Kit Duotone";z(z({},fs,ms),ds,ps);var gs={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},"slab-duo":{"fa-regular":"fasldr"},"slab-press-duo":{"fa-regular":"faslpdr"},pixel:{"fa-regular":"fapr"},mosaic:{"fa-solid":"fams"},vellum:{"fa-solid":"favs"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},graphite:{"fa-thin":"fagt"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},vs={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],"slab-duo":["fasldr"],"slab-press-duo":["faslpdr"],pixel:["fapr"],mosaic:["fams"],vellum:["favs"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],graphite:["fagt"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},an={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},"slab-duo":{fasldr:"fa-regular"},"slab-press-duo":{faslpdr:"fa-regular"},pixel:{fapr:"fa-regular"},mosaic:{fams:"fa-solid"},vellum:{favs:"fa-solid"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},graphite:{fagt:"fa-thin"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},bs=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],ri=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fasldr","faslpdr","fapr","fams","favs","fawsb","fatl","fans","fands","faes","fagt","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(vo,bs),hs=["solid","regular","light","thin","duotone","brands","semibold"],oi=[1,2,3,4,5,6,7,8,9,10],ys=oi.concat([11,12,13,14,15,16,17,18,19,20]),xs=["aw","fw","pull-left","pull-right"],_s=[].concat(ye(Object.keys(vs)),hs,xs,["2xs","xs","sm","lg","xl","2xl","beat","beat-fade","border","bounce","buzz","canvas-square","canvas-roomy","fade","flip-360","flip-both","flip-horizontal","flip-vertical","flip","float","inverse","jello","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","spin-snap","spin-snap-4","spin-snap-8","stack-1x","stack-2x","stack","swing","ul","wag","width-auto","width-fixed",St.GROUP,St.SWAP_OPACITY,St.PRIMARY,St.SECONDARY]).concat(oi.map(function(e){return"".concat(e,"x")})).concat(ys.map(function(e){return"w-".concat(e)})),ws={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},Ce="___FONT_AWESOME___",rn=16,si="fa",li="svg-inline--fa",Ke="data-fa-i2svg",on="data-fa-pseudo-element",ks="data-fa-pseudo-element-pending",Pn="data-prefix",Cn="data-icon",Xn="fontawesome-i2svg",Ss="async",$s=["HTML","HEAD","STYLE","SCRIPT"],ui=["::before","::after",":before",":after"],ci=(function(){try{return!0}catch{return!1}})();function gt(e){return new Proxy(e,{get:function(t,a){return a in t?t[a]:t[Z]}})}var fi=x({},za);fi[Z]=x(x(x(x({},{"fa-duotone":"duotone"}),za[Z]),Hn.kit),Hn["kit-duotone"]);var Ps=gt(fi),sn=x({},oo);sn[Z]=x(x(x(x({},{duotone:"fad"}),sn[Z]),qn.kit),qn["kit-duotone"]);var Yn=gt(sn),ln=x({},an);ln[Z]=x(x({},ln[Z]),go.kit);var In=gt(ln),un=x({},gs);un[Z]=x(x({},un[Z]),mo.kit);gt(un);var Cs=Tr,di="fa-layers-text",Is=Or,As=x({},ao);gt(As);var Ts=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],Vt=jr,Os=[].concat(ye(so),ye(_s)),ct=Ee.FontAwesomeConfig||{};function js(e){var n=H.querySelector("script["+e+"]");if(n)return n.getAttribute(e)}function zs(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}if(H&&typeof H.querySelector=="function"){var Es=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];Es.forEach(function(e){var n=Nt(e,2),t=n[0],a=n[1],i=zs(js(t));i!=null&&(ct[a]=i)})}var mi={styleDefault:"solid",familyDefault:Z,cssPrefix:si,replacementClass:li,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};ct.familyPrefix&&(ct.cssPrefix=ct.familyPrefix);var tt=x(x({},mi),ct);tt.autoReplaceSvg||(tt.observeMutations=!1);var j={};Object.keys(mi).forEach(function(e){Object.defineProperty(j,e,{enumerable:!0,set:function(t){tt[e]=t,ft.forEach(function(a){return a(j)})},get:function(){return tt[e]}})});Object.defineProperty(j,"familyPrefix",{enumerable:!0,set:function(n){tt.cssPrefix=n,ft.forEach(function(t){return t(j)})},get:function(){return tt.cssPrefix}});Ee.FontAwesomeConfig=j;var ft=[];function Fs(e){return ft.push(e),function(){ft.splice(ft.indexOf(e),1)}}var Qe=rn,we={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Ns(e){if(!(!e||!Ae)){var n=H.createElement("style");n.setAttribute("type","text/css"),n.innerHTML=e;for(var t=H.head.childNodes,a=null,i=t.length-1;i>-1;i--){var s=t[i],l=(s.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(l)>-1&&(a=s)}return H.head.insertBefore(n,a),e}}var Ls="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function Qn(){for(var e=12,n="";e-- >0;)n+=Ls[Math.random()*62|0];return n}function nt(e){for(var n=[],t=(e||[]).length>>>0;t--;)n[t]=e[t];return n}function An(e){return e.classList?nt(e.classList):(e.getAttribute("class")||"").split(" ").filter(function(n){return n})}function pi(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ds(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,'="').concat(pi(e[t]),'" ')},"").trim()}function Lt(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,": ").concat(e[t].trim(),";")},"")}function Tn(e){return e.size!==we.size||e.x!==we.x||e.y!==we.y||e.rotate!==we.rotate||e.flipX||e.flipY}function Ms(e){var n=e.transform,t=e.containerWidth,a=e.iconWidth,i={transform:"translate(".concat(t/2," 256)")},s="translate(".concat(n.x*32,", ").concat(n.y*32,") "),l="scale(".concat(n.size/16*(n.flipX?-1:1),", ").concat(n.size/16*(n.flipY?-1:1),") "),u="rotate(".concat(n.rotate," 0 0)"),f={transform:"".concat(s," ").concat(l," ").concat(u)},p={transform:"translate(".concat(a/2*-1," -256)")};return{outer:i,inner:f,path:p}}function Rs(e){var n=e.transform,t=e.width,a=t===void 0?rn:t,i=e.height,s=i===void 0?rn:i,l="";return ja?l+="translate(".concat(n.x/Qe-a/2,"em, ").concat(n.y/Qe-s/2,"em) "):l+="translate(calc(-50% + ".concat(n.x/Qe,"em), calc(-50% + ").concat(n.y/Qe,"em)) "),l+="scale(".concat(n.size/Qe*(n.flipX?-1:1),", ").concat(n.size/Qe*(n.flipY?-1:1),") "),l+="rotate(".concat(n.rotate,"deg) "),l}var Bs=`:root, :host {
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
}`;function gi(){var e=si,n=li,t=j.cssPrefix,a=j.replacementClass,i=Bs;if(t!==e||a!==n){var s=new RegExp("\\.".concat(e,"\\-"),"g"),l=new RegExp("\\--".concat(e,"\\-"),"g"),u=new RegExp("\\.".concat(n),"g");i=i.replace(s,".".concat(t,"-")).replace(l,"--".concat(t,"-")).replace(u,".".concat(a))}return i}var Jn=!1;function Kt(){j.autoAddCss&&!Jn&&(Ns(gi()),Jn=!0)}var Ws={mixout:function(){return{dom:{css:gi,insertCss:Kt}}},hooks:function(){return{beforeDOMElementCreation:function(){Kt()},beforeI2svg:function(){Kt()}}}},Ie=Ee||{};Ie[Ce]||(Ie[Ce]={});Ie[Ce].styles||(Ie[Ce].styles={});Ie[Ce].hooks||(Ie[Ce].hooks={});Ie[Ce].shims||(Ie[Ce].shims=[]);var he=Ie[Ce],vi=[],bi=function(){H.removeEventListener("DOMContentLoaded",bi),jt=1,vi.map(function(n){return n()})},jt=!1;Ae&&(jt=(H.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(H.readyState),jt||H.addEventListener("DOMContentLoaded",bi));function Us(e){Ae&&(jt?setTimeout(e,0):vi.push(e))}function vt(e){var n=e.tag,t=e.attributes,a=t===void 0?{}:t,i=e.children,s=i===void 0?[]:i;return typeof e=="string"?pi(e):"<".concat(n," ").concat(Ds(a),">").concat(s.map(vt).join(""),"</").concat(n,">")}function Zn(e,n,t){if(e&&e[n]&&e[n][t])return{prefix:n,iconName:t,icon:e[n][t]}}var Gt=function(n,t,a,i){var s=Object.keys(n),l=s.length,u=t,f,p,w;for(a===void 0?(f=1,w=n[s[0]]):(f=0,w=a);f<l;f++)p=s[f],w=u(w,n[p],p,n);return w};function hi(e){return ye(e).length!==1?null:e.codePointAt(0).toString(16)}function ea(e){return Object.keys(e).reduce(function(n,t){var a=e[t],i=!!a.icon;return i?n[a.iconName]=a.icon:n[t]=a,n},{})}function cn(e,n){var t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},a=t.skipHooks,i=a===void 0?!1:a,s=ea(n);typeof he.hooks.addPack=="function"&&!i?he.hooks.addPack(e,ea(n)):he.styles[e]=x(x({},he.styles[e]||{}),s),e==="fas"&&cn("fa",n)}var dt=he.styles,Vs=he.shims,yi=Object.keys(In),Ks=yi.reduce(function(e,n){return e[n]=Object.keys(In[n]),e},{}),On=null,xi={},_i={},wi={},ki={},Si={};function Gs(e){return~Os.indexOf(e)}function Hs(e,n){var t=n.split("-"),a=t[0],i=t.slice(1).join("-");return a===e&&i!==""&&!Gs(i)?i:null}var $i=function(){var n=function(s){return Gt(dt,function(l,u,f){return l[f]=Gt(u,s,{}),l},{})};xi=n(function(i,s,l){if(s[3]&&(i[s[3]]=l),s[2]){var u=s[2].filter(function(f){return typeof f=="number"});u.forEach(function(f){i[f.toString(16)]=l})}return i}),_i=n(function(i,s,l){if(i[l]=l,s[2]){var u=s[2].filter(function(f){return typeof f=="string"});u.forEach(function(f){i[f]=l})}return i}),Si=n(function(i,s,l){var u=s[2];return i[l]=l,u.forEach(function(f){i[f]=l}),i});var t="far"in dt||j.autoFetchSvg,a=Gt(Vs,function(i,s){var l=s[0],u=s[1],f=s[2];return u==="far"&&!t&&(u="fas"),typeof l=="string"&&(i.names[l]={prefix:u,iconName:f}),typeof l=="number"&&(i.unicodes[l.toString(16)]={prefix:u,iconName:f}),i},{names:{},unicodes:{}});wi=a.names,ki=a.unicodes,On=Dt(j.styleDefault,{family:j.familyDefault})};Fs(function(e){On=Dt(e.styleDefault,{family:j.familyDefault})});$i();function jn(e,n){return(xi[e]||{})[n]}function qs(e,n){return(_i[e]||{})[n]}function We(e,n){return(Si[e]||{})[n]}function Pi(e){return wi[e]||{prefix:null,iconName:null}}function Xs(e){var n=ki[e],t=jn("fas",e);return n||(t?{prefix:"fas",iconName:t}:null)||{prefix:null,iconName:null}}function Fe(){return On}var Ci=function(){return{prefix:null,iconName:null,rest:[]}};function Ys(e){var n=Z,t=yi.reduce(function(a,i){return a[i]="".concat(j.cssPrefix,"-").concat(i),a},{});return ai.forEach(function(a){(e.includes(t[a])||e.some(function(i){return Ks[a].includes(i)}))&&(n=a)}),n}function Dt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.family,a=t===void 0?Z:t,i=Ps[a][e];if(a===pt&&!e)return"fad";var s=Yn[a][e]||Yn[a][i],l=e in he.styles?e:null,u=s||l||null;return u}function Qs(e){var n=[],t=null;return e.forEach(function(a){var i=Hs(j.cssPrefix,a);i?t=i:a&&n.push(a)}),{iconName:t,rest:n}}function ta(e){return e.sort().filter(function(n,t,a){return a.indexOf(n)===t})}var na=ri.concat(ii);function Mt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.skipLookups,a=t===void 0?!1:t,i=null,s=ta(e.filter(function(A){return na.includes(A)})),l=ta(e.filter(function(A){return!na.includes(A)})),u=s.filter(function(A){return i=A,!Ea.includes(A)}),f=Nt(u,1),p=f[0],w=p===void 0?null:p,_=Ys(s),O=x(x({},Qs(l)),{},{prefix:Dt(w,{family:_})});return x(x(x({},O),tl({values:e,family:_,styles:dt,config:j,canonical:O,givenPrefix:i})),Js(a,i,O))}function Js(e,n,t){var a=t.prefix,i=t.iconName;if(e||!a||!i)return{prefix:a,iconName:i};var s=n==="fa"?Pi(i):{},l=We(a,i);return i=s.iconName||l||i,a=s.prefix||a,a==="far"&&!dt.far&&dt.fas&&!j.autoFetchSvg&&(a="fas"),{prefix:a,iconName:i}}var Zs=ai.filter(function(e){return e!==Z||e!==pt}),el=Object.keys(an).filter(function(e){return e!==Z}).map(function(e){return Object.keys(an[e])}).flat();function tl(e){var n=e.values,t=e.family,a=e.canonical,i=e.givenPrefix,s=i===void 0?"":i,l=e.styles,u=l===void 0?{}:l,f=e.config,p=f===void 0?{}:f,w=t===pt,_=n.includes("fa-duotone")||n.includes("fad"),O=p.familyDefault==="duotone",A=a.prefix==="fad"||a.prefix==="fa-duotone";if(!w&&(_||O||A)&&(a.prefix="fad"),(n.includes("fa-brands")||n.includes("fab"))&&(a.prefix="fab"),!a.prefix&&Zs.includes(t)){var S=Object.keys(u).find(function(I){return el.includes(I)});if(S||p.autoFetchSvg){var v=ro.get(t).defaultShortPrefixId;a.prefix=v,a.iconName=We(a.prefix,a.iconName)||a.iconName}}return(a.prefix==="fa"||s==="fa")&&(a.prefix=Fe()||"fas"),a}var nl=(function(){function e(){_r(this,e),this.definitions={}}return kr(e,[{key:"add",value:function(){for(var t=this,a=arguments.length,i=new Array(a),s=0;s<a;s++)i[s]=arguments[s];var l=i.reduce(this._pullDefinitions,{});Object.keys(l).forEach(function(u){t.definitions[u]=x(x({},t.definitions[u]||{}),l[u]),cn(u,l[u]);var f=In[Z][u];f&&cn(f,l[u]),$i()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(t,a){var i=a.prefix&&a.iconName&&a.icon?{0:a}:a;return Object.keys(i).map(function(s){var l=i[s],u=l.prefix,f=l.iconName,p=l.icon,w=p[2];t[u]||(t[u]={}),w.length>0&&w.forEach(function(_){typeof _=="string"&&(t[u][_]=p)}),t[u][f]=p}),t}}])})(),aa=[],Je={},et={},al=Object.keys(et);function il(e,n){var t=n.mixoutsTo;return aa=e,Je={},Object.keys(et).forEach(function(a){al.indexOf(a)===-1&&delete et[a]}),aa.forEach(function(a){var i=a.mixout?a.mixout():{};if(Object.keys(i).forEach(function(l){typeof i[l]=="function"&&(t[l]=i[l]),Ot(i[l])==="object"&&Object.keys(i[l]).forEach(function(u){t[l]||(t[l]={}),t[l][u]=i[l][u]})}),a.hooks){var s=a.hooks();Object.keys(s).forEach(function(l){Je[l]||(Je[l]=[]),Je[l].push(s[l])})}a.provides&&a.provides(et)}),t}function fn(e,n){for(var t=arguments.length,a=new Array(t>2?t-2:0),i=2;i<t;i++)a[i-2]=arguments[i];var s=Je[e]||[];return s.forEach(function(l){n=l.apply(null,[n].concat(a))}),n}function Ge(e){for(var n=arguments.length,t=new Array(n>1?n-1:0),a=1;a<n;a++)t[a-1]=arguments[a];var i=Je[e]||[];i.forEach(function(s){s.apply(null,t)})}function Ne(){var e=arguments[0],n=Array.prototype.slice.call(arguments,1);return et[e]?et[e].apply(null,n):void 0}function dn(e){e.prefix==="fa"&&(e.prefix="fas");var n=e.iconName,t=e.prefix||Fe();if(n)return n=We(t,n)||n,Zn(Ii.definitions,t,n)||Zn(he.styles,t,n)}var Ii=new nl,rl=function(){j.autoReplaceSvg=!1,j.observeMutations=!1,Ge("noAuto")},ol={i2svg:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return Ae?(Ge("beforeI2svg",n),Ne("pseudoElements2svg",n),Ne("i2svg",n)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot;j.autoReplaceSvg===!1&&(j.autoReplaceSvg=!0),j.observeMutations=!0,Us(function(){ll({autoReplaceSvgRoot:t}),Ge("watch",n)})}},sl={icon:function(n){if(n===null)return null;if(Ot(n)==="object"&&n.prefix&&n.iconName)return{prefix:n.prefix,iconName:We(n.prefix,n.iconName)||n.iconName};if(Array.isArray(n)&&n.length===2){var t=n[1].indexOf("fa-")===0?n[1].slice(3):n[1],a=Dt(n[0]);return{prefix:a,iconName:We(a,t)||t}}if(typeof n=="string"&&(n.indexOf("".concat(j.cssPrefix,"-"))>-1||n.match(Cs))){var i=Mt(n.split(" "),{skipLookups:!0});return{prefix:i.prefix||Fe(),iconName:We(i.prefix,i.iconName)||i.iconName}}if(typeof n=="string"){var s=Fe();return{prefix:s,iconName:We(s,n)||n}}}},le={noAuto:rl,config:j,dom:ol,parse:sl,library:Ii,findIconDefinition:dn,toHtml:vt},ll=function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot,a=t===void 0?H:t;(Object.keys(he.styles).length>0||j.autoFetchSvg)&&Ae&&j.autoReplaceSvg&&le.dom.i2svg({node:a})};function Rt(e,n){return Object.defineProperty(e,"abstract",{get:n}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(function(a){return vt(a)})}}),Object.defineProperty(e,"node",{get:function(){if(Ae){var a=H.createElement("div");return a.innerHTML=e.html,a.children}}}),e}function ul(e){var n=e.children,t=e.main,a=e.mask,i=e.attributes,s=e.styles,l=e.transform;if(Tn(l)&&t.found&&!a.found){var u=t.width,f=t.height,p={x:u/f/2,y:.5};i.style=Lt(x(x({},s),{},{"transform-origin":"".concat(p.x+l.x/16,"em ").concat(p.y+l.y/16,"em")}))}return[{tag:"svg",attributes:i,children:n}]}function cl(e){var n=e.prefix,t=e.iconName,a=e.children,i=e.attributes,s=e.symbol,l=s===!0?"".concat(n,"-").concat(j.cssPrefix,"-").concat(t):s;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:x(x({},i),{},{id:l}),children:a}]}]}function fl(e){var n=["aria-label","aria-labelledby","title","role"];return n.some(function(t){return t in e})}function zn(e){var n=e.icons,t=n.main,a=n.mask,i=e.prefix,s=e.iconName,l=e.transform,u=e.symbol,f=e.maskId,p=e.extra,w=e.watchable,_=w===void 0?!1:w,O=a.found?a:t,A=O.width,S=O.height,v=[j.replacementClass,s?"".concat(j.cssPrefix,"-").concat(s):""].filter(function(N){return p.classes.indexOf(N)===-1}).filter(function(N){return N!==""||!!N}).concat(p.classes).join(" "),I={children:[],attributes:x(x({},p.attributes),{},{"data-prefix":i,"data-icon":s,class:v,role:p.attributes.role||"img",viewBox:"0 0 ".concat(A," ").concat(S)})};!fl(p.attributes)&&!p.attributes["aria-hidden"]&&(I.attributes["aria-hidden"]="true"),_&&(I.attributes[Ke]="");var b=x(x({},I),{},{prefix:i,iconName:s,main:t,mask:a,maskId:f,transform:l,symbol:u,styles:x({},p.styles)}),d=a.found&&t.found?Ne("generateAbstractMask",b)||{children:[],attributes:{}}:Ne("generateAbstractIcon",b)||{children:[],attributes:{}},P=d.children,C=d.attributes;return b.children=P,b.attributes=C,u?cl(b):ul(b)}function ia(e){var n=e.content,t=e.width,a=e.height,i=e.transform,s=e.extra,l=e.watchable,u=l===void 0?!1:l,f=x(x({},s.attributes),{},{class:s.classes.join(" ")});u&&(f[Ke]="");var p=x({},s.styles);Tn(i)&&(p.transform=Rs({transform:i,width:t,height:a}),p["-webkit-transform"]=p.transform);var w=Lt(p);w.length>0&&(f.style=w);var _=[];return _.push({tag:"span",attributes:f,children:[n]}),_}function dl(e){var n=e.content,t=e.extra,a=x(x({},t.attributes),{},{class:t.classes.join(" ")}),i=Lt(t.styles);i.length>0&&(a.style=i);var s=[];return s.push({tag:"span",attributes:a,children:[n]}),s}var Ht=he.styles;function mn(e){var n=e[0],t=e[1],a=e.slice(4),i=Nt(a,1),s=i[0],l=null;return Array.isArray(s)?l={tag:"g",attributes:{class:"".concat(j.cssPrefix,"-").concat(Vt.GROUP)},children:[{tag:"path",attributes:{class:"".concat(j.cssPrefix,"-").concat(Vt.SECONDARY),fill:"currentColor",d:s[0]}},{tag:"path",attributes:{class:"".concat(j.cssPrefix,"-").concat(Vt.PRIMARY),fill:"currentColor",d:s[1]}}]}:l={tag:"path",attributes:{fill:"currentColor",d:s}},{found:!0,width:n,height:t,icon:l}}var ml={found:!1,width:512,height:512};function pl(e,n){!ci&&!j.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(n,'" is missing.'))}function pn(e,n){var t=n;return n==="fa"&&j.styleDefault!==null&&(n=Fe()),new Promise(function(a,i){if(t==="fa"){var s=Pi(e)||{};e=s.iconName||e,n=s.prefix||n}if(e&&n&&Ht[n]&&Ht[n][e]){var l=Ht[n][e];return a(mn(l))}pl(e,n),a(x(x({},ml),{},{icon:j.showMissingIcons&&e?Ne("missingIconAbstract")||{}:{}}))})}var ra=function(){},gn=j.measurePerformance&&_t&&_t.mark&&_t.measure?_t:{mark:ra,measure:ra},lt='FA "7.3.1"',gl=function(n){return gn.mark("".concat(lt," ").concat(n," begins")),function(){return Ai(n)}},Ai=function(n){gn.mark("".concat(lt," ").concat(n," ends")),gn.measure("".concat(lt," ").concat(n),"".concat(lt," ").concat(n," begins"),"".concat(lt," ").concat(n," ends"))},En={begin:gl,end:Ai},Ct=function(){};function oa(e){var n=e.getAttribute?e.getAttribute(Ke):null;return typeof n=="string"}function vl(e){var n=e.getAttribute?e.getAttribute(Pn):null,t=e.getAttribute?e.getAttribute(Cn):null;return n&&t}function bl(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(j.replacementClass)}function hl(){if(j.autoReplaceSvg===!0)return It.replace;var e=It[j.autoReplaceSvg];return e||It.replace}function yl(e){return H.createElementNS("http://www.w3.org/2000/svg",e)}function xl(e){return H.createElement(e)}function Ti(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.ceFn,a=t===void 0?e.tag==="svg"?yl:xl:t;if(typeof e=="string")return H.createTextNode(e);var i=a(e.tag);Object.keys(e.attributes||[]).forEach(function(l){i.setAttribute(l,e.attributes[l])});var s=e.children||[];return s.forEach(function(l){i.appendChild(Ti(l,{ceFn:a}))}),i}function _l(e){var n=" ".concat(e.outerHTML," ");return n="".concat(n,"Font Awesome fontawesome.com "),n}var It={replace:function(n){var t=n[0];if(t.parentNode)if(n[1].forEach(function(i){t.parentNode.insertBefore(Ti(i),t)}),t.getAttribute(Ke)===null&&j.keepOriginalSource){var a=H.createComment(_l(t));t.parentNode.replaceChild(a,t)}else t.remove()},nest:function(n){var t=n[0],a=n[1];if(~An(t).indexOf(j.replacementClass))return It.replace(n);var i=new RegExp("".concat(j.cssPrefix,"-.*"));if(delete a[0].attributes.id,a[0].attributes.class){var s=a[0].attributes.class.split(" ").reduce(function(u,f){return f===j.replacementClass||f.match(i)?u.toSvg.push(f):u.toNode.push(f),u},{toNode:[],toSvg:[]});a[0].attributes.class=s.toSvg.join(" "),s.toNode.length===0?t.removeAttribute("class"):t.setAttribute("class",s.toNode.join(" "))}var l=a.map(function(u){return vt(u)}).join(`
`);t.setAttribute(Ke,""),t.innerHTML=l}};function sa(e){e()}function Oi(e,n){var t=typeof n=="function"?n:Ct;if(e.length===0)t();else{var a=sa;j.mutateApproach===Ss&&(a=Ee.requestAnimationFrame||sa),a(function(){var i=hl(),s=En.begin("mutate");e.map(i),s(),t()})}}var Fn=!1;function ji(){Fn=!0}function vn(){Fn=!1}var zt=null;function la(e){if(Gn&&j.observeMutations){var n=e.treeCallback,t=n===void 0?Ct:n,a=e.nodeCallback,i=a===void 0?Ct:a,s=e.pseudoElementsCallback,l=s===void 0?Ct:s,u=e.observeMutationsRoot,f=u===void 0?H:u;zt=new Gn(function(p){if(!Fn){var w=Fe();nt(p).forEach(function(_){if(_.type==="childList"&&_.addedNodes.length>0&&!oa(_.addedNodes[0])&&(j.searchPseudoElements&&l(_.target),t(_.target)),_.type==="attributes"&&_.target.parentNode&&j.searchPseudoElements&&l([_.target],!0),_.type==="attributes"&&oa(_.target)&&~Ts.indexOf(_.attributeName))if(_.attributeName==="class"&&vl(_.target)){var O=Mt(An(_.target)),A=O.prefix,S=O.iconName;_.target.setAttribute(Pn,A||w),S&&_.target.setAttribute(Cn,S)}else bl(_.target)&&i(_.target)})}}),Ae&&zt.observe(f,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function wl(){zt&&zt.disconnect()}function kl(e){var n=e.getAttribute("style"),t=[];return n&&(t=n.split(";").reduce(function(a,i){var s=i.split(":"),l=s[0],u=s.slice(1);return l&&u.length>0&&(a[l]=u.join(":").trim()),a},{})),t}function Sl(e){var n=e.getAttribute("data-prefix"),t=e.getAttribute("data-icon"),a=e.innerText!==void 0?e.innerText.trim():"",i=Mt(An(e));return i.prefix||(i.prefix=Fe()),n&&t&&(i.prefix=n,i.iconName=t),i.iconName&&i.prefix||(i.prefix&&a.length>0&&(i.iconName=qs(i.prefix,e.innerText)||jn(i.prefix,hi(e.innerText))),!i.iconName&&j.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(i.iconName=e.firstChild.data)),i}function $l(e){var n=nt(e.attributes).reduce(function(t,a){return t.name!=="class"&&t.name!=="style"&&(t[a.name]=a.value),t},{});return n}function Pl(){return{iconName:null,prefix:null,transform:we,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function ua(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},t=Sl(e),a=t.iconName,i=t.prefix,s=t.rest,l=$l(e),u=fn("parseNodeAttributes",{},e),f=n.styleParser?kl(e):[];return x({iconName:a,prefix:i,transform:we,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:s,styles:f,attributes:l}},u)}var Cl=he.styles;function zi(e){var n=j.autoReplaceSvg==="nest"?ua(e,{styleParser:!1}):ua(e);return~n.extra.classes.indexOf(di)?Ne("generateLayersText",e,n):Ne("generateSvgReplacementMutation",e,n)}function Il(){return[].concat(ye(ii),ye(ri))}function ca(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!Ae)return Promise.resolve();var t=H.documentElement.classList,a=function(_){return t.add("".concat(Xn,"-").concat(_))},i=function(_){return t.remove("".concat(Xn,"-").concat(_))},s=j.autoFetchSvg?Il():Ea.concat(Object.keys(Cl));s.includes("fa")||s.push("fa");var l=[".".concat(di,":not([").concat(Ke,"])")].concat(s.map(function(w){return".".concat(w,":not([").concat(Ke,"])")})).join(", ");if(l.length===0)return Promise.resolve();var u=[];try{u=nt(e.querySelectorAll(l))}catch{}if(u.length>0)a("pending"),i("complete");else return Promise.resolve();var f=En.begin("onTree"),p=u.reduce(function(w,_){try{var O=zi(_);O&&w.push(O)}catch(A){ci||A.name==="MissingIcon"&&console.error(A)}return w},[]);return new Promise(function(w,_){Promise.all(p).then(function(O){Oi(O,function(){a("active"),a("complete"),i("pending"),typeof n=="function"&&n(),f(),w()})}).catch(function(O){f(),_(O)})})}function Al(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;zi(e).then(function(t){t&&Oi([t],n)})}function Tl(e){return function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=(n||{}).icon?n:dn(n||{}),i=t.mask;return i&&(i=(i||{}).icon?i:dn(i||{})),e(a,x(x({},t),{},{mask:i}))}}var Ol=function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=t.transform,i=a===void 0?we:a,s=t.symbol,l=s===void 0?!1:s,u=t.mask,f=u===void 0?null:u,p=t.maskId,w=p===void 0?null:p,_=t.classes,O=_===void 0?[]:_,A=t.attributes,S=A===void 0?{}:A,v=t.styles,I=v===void 0?{}:v;if(n){var b=n.prefix,d=n.iconName,P=n.icon;return Rt(x({type:"icon"},n),function(){return Ge("beforeDOMElementCreation",{iconDefinition:n,params:t}),zn({icons:{main:mn(P),mask:f?mn(f.icon):{found:!1,width:null,height:null,icon:{}}},prefix:b,iconName:d,transform:x(x({},we),i),symbol:l,maskId:w,extra:{attributes:S,styles:I,classes:O}})})}},jl={mixout:function(){return{icon:Tl(Ol)}},hooks:function(){return{mutationObserverCallbacks:function(t){return t.treeCallback=ca,t.nodeCallback=Al,t}}},provides:function(n){n.i2svg=function(t){var a=t.node,i=a===void 0?H:a,s=t.callback,l=s===void 0?function(){}:s;return ca(i,l)},n.generateSvgReplacementMutation=function(t,a){var i=a.iconName,s=a.prefix,l=a.transform,u=a.symbol,f=a.mask,p=a.maskId,w=a.extra;return new Promise(function(_,O){Promise.all([pn(i,s),f.iconName?pn(f.iconName,f.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(A){var S=Nt(A,2),v=S[0],I=S[1];_([t,zn({icons:{main:v,mask:I},prefix:s,iconName:i,transform:l,symbol:u,maskId:p,extra:w,watchable:!0})])}).catch(O)})},n.generateAbstractIcon=function(t){var a=t.children,i=t.attributes,s=t.main,l=t.transform,u=t.styles,f=Lt(u);f.length>0&&(i.style=f);var p;return Tn(l)&&(p=Ne("generateAbstractTransformGrouping",{main:s,transform:l,containerWidth:s.width,iconWidth:s.width})),a.push(p||s.icon),{children:a,attributes:i}}}},zl={mixout:function(){return{layer:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.classes,s=i===void 0?[]:i;return Rt({type:"layer"},function(){Ge("beforeDOMElementCreation",{assembler:t,params:a});var l=[];return t(function(u){Array.isArray(u)?u.map(function(f){l=l.concat(f.abstract)}):l=l.concat(u.abstract)}),[{tag:"span",attributes:{class:["".concat(j.cssPrefix,"-layers")].concat(ye(s)).join(" ")},children:l}]})}}}},El={mixout:function(){return{counter:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};a.title;var i=a.classes,s=i===void 0?[]:i,l=a.attributes,u=l===void 0?{}:l,f=a.styles,p=f===void 0?{}:f;return Rt({type:"counter",content:t},function(){return Ge("beforeDOMElementCreation",{content:t,params:a}),dl({content:t.toString(),extra:{attributes:u,styles:p,classes:["".concat(j.cssPrefix,"-layers-counter")].concat(ye(s))}})})}}}},Fl={mixout:function(){return{text:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.transform,s=i===void 0?we:i,l=a.classes,u=l===void 0?[]:l,f=a.attributes,p=f===void 0?{}:f,w=a.styles,_=w===void 0?{}:w;return Rt({type:"text",content:t},function(){return Ge("beforeDOMElementCreation",{content:t,params:a}),ia({content:t,transform:x(x({},we),s),extra:{attributes:p,styles:_,classes:["".concat(j.cssPrefix,"-layers-text")].concat(ye(u))}})})}}},provides:function(n){n.generateLayersText=function(t,a){var i=a.transform,s=a.extra,l=null,u=null;if(ja){var f=parseInt(getComputedStyle(t).fontSize,10),p=t.getBoundingClientRect();l=p.width/f,u=p.height/f}return Promise.resolve([t,ia({content:t.innerHTML,width:l,height:u,transform:i,extra:s,watchable:!0})])}}},Ei=new RegExp('"',"ug"),fa=[1105920,1112319],da=x(x(x(x({},{FontAwesome:{normal:"fas",400:"fas"}}),io),ws),po),bn=Object.keys(da).reduce(function(e,n){return e[n.toLowerCase()]=da[n],e},{}),Nl=Object.keys(bn).reduce(function(e,n){var t=bn[n];return e[n]=t[900]||ye(Object.entries(t))[0][1],e},{});function Ll(e){var n=e.replace(Ei,"");return hi(ye(n)[0]||"")}function Dl(e){var n=e.getPropertyValue("font-feature-settings").includes("ss01"),t=e.getPropertyValue("content"),a=t.replace(Ei,""),i=a.codePointAt(0),s=i>=fa[0]&&i<=fa[1],l=a.length===2?a[0]===a[1]:!1;return s||l||n}function Ml(e,n){var t=e.replace(/^['"]|['"]$/g,"").toLowerCase(),a=parseInt(n),i=isNaN(a)?"normal":a;return(bn[t]||{})[i]||Nl[t]}function ma(e,n){var t="".concat(ks).concat(n.replace(":","-"));return new Promise(function(a,i){if(e.getAttribute(t)!==null)return a();var s=nt(e.children),l=s.filter(function(K){return K.getAttribute(on)===n})[0],u=Ee.getComputedStyle(e,n),f=u.getPropertyValue("font-family"),p=f.match(Is),w=u.getPropertyValue("font-weight"),_=u.getPropertyValue("content");if(l&&!p)return e.removeChild(l),a();if(p&&_!=="none"&&_!==""){var O=u.getPropertyValue("content"),A=Ml(f,w),S=Ll(O),v=p[0].startsWith("FontAwesome"),I=Dl(u),b=jn(A,S),d=b;if(v){var P=Xs(S);P.iconName&&P.prefix&&(b=P.iconName,A=P.prefix)}if(b&&!I&&(!l||l.getAttribute(Pn)!==A||l.getAttribute(Cn)!==d)){e.setAttribute(t,d),l&&e.removeChild(l);var C=Pl(),N=C.extra;N.attributes[on]=n,pn(b,A).then(function(K){var R=zn(x(x({},C),{},{icons:{main:K,mask:Ci()},prefix:A,iconName:d,extra:N,watchable:!0})),L=H.createElementNS("http://www.w3.org/2000/svg","svg");n==="::before"?e.insertBefore(L,e.firstChild):e.appendChild(L),L.outerHTML=R.map(function(q){return vt(q)}).join(`
`),e.removeAttribute(t),a()}).catch(i)}else a()}else a()})}function Rl(e){return Promise.all([ma(e,"::before"),ma(e,"::after")])}function Bl(e){return e.parentNode!==document.head&&!~$s.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(on)&&(!e.parentNode||e.parentNode.tagName!=="svg")}var Wl=function(n){return!!n&&ui.some(function(t){return n.includes(t)})},Ul=function(n){if(!n)return[];var t=new Set,a=n.split(/,(?![^()]*\))/).map(function(f){return f.trim()});a=a.flatMap(function(f){return f.includes("(")?f:f.split(",").map(function(p){return p.trim()})});var i=Pt(a),s;try{for(i.s();!(s=i.n()).done;){var l=s.value;if(Wl(l)){var u=ui.reduce(function(f,p){return f.replace(p,"")},l);u!==""&&u!=="*"&&t.add(u)}}}catch(f){i.e(f)}finally{i.f()}return t};function pa(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if(Ae){var t;if(n)t=e;else if(j.searchPseudoElementsFullScan)t=e.querySelectorAll("*");else{var a=new Set,i=Pt(document.styleSheets),s;try{for(i.s();!(s=i.n()).done;){var l=s.value;try{var u=Pt(l.cssRules),f;try{for(u.s();!(f=u.n()).done;){var p=f.value,w=Ul(p.selectorText),_=Pt(w),O;try{for(_.s();!(O=_.n()).done;){var A=O.value;a.add(A)}}catch(v){_.e(v)}finally{_.f()}}}catch(v){u.e(v)}finally{u.f()}}catch(v){j.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(l.href," (").concat(v.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(v){i.e(v)}finally{i.f()}if(!a.size)return;var S=Array.from(a).join(", ");try{t=e.querySelectorAll(S)}catch{}}return new Promise(function(v,I){var b=nt(t).filter(Bl).map(Rl),d=En.begin("searchPseudoElements");ji(),Promise.all(b).then(function(){d(),vn(),v()}).catch(function(){d(),vn(),I()})})}}var Vl={hooks:function(){return{mutationObserverCallbacks:function(t){return t.pseudoElementsCallback=pa,t}}},provides:function(n){n.pseudoElements2svg=function(t){var a=t.node,i=a===void 0?H:a;j.searchPseudoElements&&pa(i)}}},ga=!1,Kl={mixout:function(){return{dom:{unwatch:function(){ji(),ga=!0}}}},hooks:function(){return{bootstrap:function(){la(fn("mutationObserverCallbacks",{}))},noAuto:function(){wl()},watch:function(t){var a=t.observeMutationsRoot;ga?vn():la(fn("mutationObserverCallbacks",{observeMutationsRoot:a}))}}}},va=function(n){var t={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return n.toLowerCase().split(" ").reduce(function(a,i){var s=i.toLowerCase().split("-"),l=s[0],u=s.slice(1).join("-");if(l&&u==="h")return a.flipX=!0,a;if(l&&u==="v")return a.flipY=!0,a;if(u=parseFloat(u),isNaN(u))return a;switch(l){case"grow":a.size=a.size+u;break;case"shrink":a.size=a.size-u;break;case"left":a.x=a.x-u;break;case"right":a.x=a.x+u;break;case"up":a.y=a.y-u;break;case"down":a.y=a.y+u;break;case"rotate":a.rotate=a.rotate+u;break}return a},t)},Gl={mixout:function(){return{parse:{transform:function(t){return va(t)}}}},hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-transform");return i&&(t.transform=va(i)),t}}},provides:function(n){n.generateAbstractTransformGrouping=function(t){var a=t.main,i=t.transform,s=t.containerWidth,l=t.iconWidth,u={transform:"translate(".concat(s/2," 256)")},f="translate(".concat(i.x*32,", ").concat(i.y*32,") "),p="scale(".concat(i.size/16*(i.flipX?-1:1),", ").concat(i.size/16*(i.flipY?-1:1),") "),w="rotate(".concat(i.rotate," 0 0)"),_={transform:"".concat(f," ").concat(p," ").concat(w)},O={transform:"translate(".concat(l/2*-1," -256)")},A={outer:u,inner:_,path:O};return{tag:"g",attributes:x({},A.outer),children:[{tag:"g",attributes:x({},A.inner),children:[{tag:a.icon.tag,children:a.icon.children,attributes:x(x({},a.icon.attributes),A.path)}]}]}}}},qt={x:0,y:0,width:"100%",height:"100%"};function ba(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||n)&&(e.attributes.fill="black"),e}function Hl(e){return e.tag==="g"?e.children:[e]}var ql={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-mask"),s=i?Mt(i.split(" ").map(function(l){return l.trim()})):Ci();return s.prefix||(s.prefix=Fe()),t.mask=s,t.maskId=a.getAttribute("data-fa-mask-id"),t}}},provides:function(n){n.generateAbstractMask=function(t){var a=t.children,i=t.attributes,s=t.main,l=t.mask,u=t.maskId,f=t.transform,p=s.width,w=s.icon,_=l.width,O=l.icon,A=Ms({transform:f,containerWidth:_,iconWidth:p}),S={tag:"rect",attributes:x(x({},qt),{},{fill:"white"})},v=w.children?{children:w.children.map(ba)}:{},I={tag:"g",attributes:x({},A.inner),children:[ba(x({tag:w.tag,attributes:x(x({},w.attributes),A.path)},v))]},b={tag:"g",attributes:x({},A.outer),children:[I]},d="mask-".concat(u||Qn()),P="clip-".concat(u||Qn()),C={tag:"mask",attributes:x(x({},qt),{},{id:d,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[S,b]},N={tag:"defs",children:[{tag:"clipPath",attributes:{id:P},children:Hl(O)},C]};return a.push(N,{tag:"rect",attributes:x({fill:"currentColor","clip-path":"url(#".concat(P,")"),mask:"url(#".concat(d,")")},qt)}),{children:a,attributes:i}}}},Xl={provides:function(n){var t=!1;Ee.matchMedia&&(t=Ee.matchMedia("(prefers-reduced-motion: reduce)").matches),n.missingIconAbstract=function(){var a=[],i={fill:"currentColor"},s={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};a.push({tag:"path",attributes:x(x({},i),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var l=x(x({},s),{},{attributeName:"opacity"}),u={tag:"circle",attributes:x(x({},i),{},{cx:"256",cy:"364",r:"28"}),children:[]};return t||u.children.push({tag:"animate",attributes:x(x({},s),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:x(x({},l),{},{values:"1;0;1;1;0;1;"})}),a.push(u),a.push({tag:"path",attributes:x(x({},i),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:t?[]:[{tag:"animate",attributes:x(x({},l),{},{values:"1;0;0;0;0;1;"})}]}),t||a.push({tag:"path",attributes:x(x({},i),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:x(x({},l),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:a}}}},Yl={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-symbol"),s=i===null?!1:i===""?!0:i;return t.symbol=s,t}}}},Ql=[Ws,jl,zl,El,Fl,Vl,Kl,Gl,ql,Xl,Yl];il(Ql,{mixoutsTo:le});le.noAuto;le.config;le.library;le.dom;var hn=le.parse;le.findIconDefinition;le.toHtml;var Jl=le.icon;le.layer;le.text;le.counter;function yn(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function Zl(e){if(Array.isArray(e))return yn(e)}function V(e,n,t){return(n=ru(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function eu(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function tu(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function ha(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function X(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?ha(Object(t),!0).forEach(function(a){V(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ha(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function Xt(e,n){if(e==null)return{};var t,a,i=nu(e,n);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(a=0;a<s.length;a++)t=s[a],n.indexOf(t)===-1&&{}.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}function nu(e,n){if(e==null)return{};var t={};for(var a in e)if({}.hasOwnProperty.call(e,a)){if(n.indexOf(a)!==-1)continue;t[a]=e[a]}return t}function au(e){return Zl(e)||eu(e)||ou(e)||tu()}function iu(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function ru(e){var n=iu(e,"string");return typeof n=="symbol"?n:n+""}function Et(e){"@babel/helpers - typeof";return Et=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Et(e)}function ou(e,n){if(e){if(typeof e=="string")return yn(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?yn(e,n):void 0}}function Yt(e,n){return Array.isArray(n)&&n.length>0||!Array.isArray(n)&&n?V({},e,n):{}}function su(e){var n,t=(n={"fa-spin":e.spin,"fa-pulse":e.pulse,"fa-fw":e.fixedWidth,"fa-border":e.border,"fa-li":e.listItem,"fa-inverse":e.inverse,"fa-flip":e.flip===!0,"fa-flip-horizontal":e.flip==="horizontal"||e.flip==="both","fa-flip-vertical":e.flip==="vertical"||e.flip==="both"},V(V(V(V(V(V(V(V(V(V(n,"fa-".concat(e.size),e.size!==null),"fa-rotate-".concat(e.rotation),e.rotation!==null),"fa-rotate-by",e.rotateBy),"fa-pull-".concat(e.pull),e.pull!==null),"fa-swap-opacity",e.swapOpacity),"fa-bounce",e.bounce),"fa-shake",e.shake),"fa-beat",e.beat),"fa-fade",e.fade),"fa-beat-fade",e.beatFade),V(V(V(V(V(V(V(V(V(V(n,"fa-flash",e.flash),"fa-spin-pulse",e.spinPulse),"fa-spin-reverse",e.spinReverse),"fa-width-auto",e.widthAuto),"fa-canvas-square",e.canvasSquare),"fa-canvas-roomy",e.canvasRoomy),"fa-flip-360",e.flip360),"fa-buzz",e.buzz),"fa-float",e.float),"fa-jello",e.jello),V(V(V(V(V(n,"fa-spin-snap",e.spinSnap),"fa-spin-snap-4",e.spinSnap4),"fa-spin-snap-8",e.spinSnap8),"fa-swing",e.swing),"fa-wag",e.wag));return Object.keys(t).map(function(a){return t[a]?a:null}).filter(function(a){return a})}var lu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Fi={exports:{}};(function(e){(function(n){var t=function(b,d,P){if(!p(d)||_(d)||O(d)||A(d)||f(d))return d;var C,N=0,K=0;if(w(d))for(C=[],K=d.length;N<K;N++)C.push(t(b,d[N],P));else{C={};for(var R in d)Object.prototype.hasOwnProperty.call(d,R)&&(C[b(R,P)]=t(b,d[R],P))}return C},a=function(b,d){d=d||{};var P=d.separator||"_",C=d.split||/(?=[A-Z])/;return b.split(C).join(P)},i=function(b){return S(b)?b:(b=b.replace(/[\-_\s]+(.)?/g,function(d,P){return P?P.toUpperCase():""}),b.substr(0,1).toLowerCase()+b.substr(1))},s=function(b){var d=i(b);return d.substr(0,1).toUpperCase()+d.substr(1)},l=function(b,d){return a(b,d).toLowerCase()},u=Object.prototype.toString,f=function(b){return typeof b=="function"},p=function(b){return b===Object(b)},w=function(b){return u.call(b)=="[object Array]"},_=function(b){return u.call(b)=="[object Date]"},O=function(b){return u.call(b)=="[object RegExp]"},A=function(b){return u.call(b)=="[object Boolean]"},S=function(b){return b=b-0,b===b},v=function(b,d){var P=d&&"process"in d?d.process:d;return typeof P!="function"?b:function(C,N){return P(C,b,N)}},I={camelize:i,decamelize:l,pascalize:s,depascalize:l,camelizeKeys:function(b,d){return t(v(i,d),b)},decamelizeKeys:function(b,d){return t(v(l,d),b,d)},pascalizeKeys:function(b,d){return t(v(s,d),b)},depascalizeKeys:function(){return this.decamelizeKeys.apply(this,arguments)}};e.exports?e.exports=I:n.humps=I})(lu)})(Fi);var uu=Fi.exports,cu=["gradientFill"],fu=["class","style"],du=["type","stops","id"];function mu(e){return e.split(";").map(function(n){return n.trim()}).filter(function(n){return n}).reduce(function(n,t){var a=t.indexOf(":"),i=uu.camelize(t.slice(0,a)),s=t.slice(a+1).trim();return n[i]=s,n},{})}function pu(e){return e.split(/\s+/).reduce(function(n,t){return n[t]=!0,n},{})}function gu(e,n){return $t("stop",X({key:"".concat(n,"-").concat(e.offset),offset:e.offset,"stop-color":e.color},e.opacity!==void 0&&{"stop-opacity":e.opacity}))}function Ni(e){if(typeof e=="string")return e;var n=(e.children||[]).map(Ni);return e.tag==="path"&&e.attributes&&"fill"in e.attributes?X(X({},e),{},{attributes:X(X({},e.attributes),{},{fill:void 0}),children:n}):X(X({},e),{},{children:n})}function Li(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof e=="string")return e;var a=n.gradientFill,i=a===void 0?null:a,s=Xt(n,cu),l=!!i||"fill"in t,u=l?Ni(e):e,f=(u.children||[]).map(function(C){return Li(C,{},{})}),p=Object.keys(u.attributes||{}).reduce(function(C,N){var K=u.attributes[N];switch(N){case"class":C.class=pu(K);break;case"style":C.style=mu(K);break;default:C.attrs[N]=K}return C},{attrs:{},class:{},style:{}});t.class;var w=t.style,_=w===void 0?{}:w,O=Xt(t,fu);if(i&&i.id&&(i.type==="linear"||i.type==="radial")){var A=i.type,S=i.stops,v=S===void 0?[]:S,I=i.id,b=Xt(i,du),d=A==="linear"?"linearGradient":"radialGradient",P=$t(d,X(X({},b),{},{id:I}),v.map(gu));return $t(u.tag,X(X(X(X({},s),{},{class:p.class,style:X(X({},p.style),_)},p.attrs),O),{},{fill:"url(#".concat(I,")")}),[P].concat(au(f)))}return $t(e.tag,X(X(X({},s),{},{class:p.class,style:X(X({},p.style),_)},p.attrs),O),f)}var Di=!1;try{Di=!0}catch{}function ya(){if(!Di&&console&&typeof console.error=="function"){var e;(e=console).error.apply(e,arguments)}}function xa(e){if(e&&Et(e)==="object"&&e.prefix&&e.iconName&&e.icon)return e;if(hn.icon)return hn.icon(e);if(e===null)return null;if(Et(e)==="object"&&e.prefix&&e.iconName)return e;if(Array.isArray(e)&&e.length===2)return{prefix:e[0],iconName:e[1]};if(typeof e=="string")return{prefix:"fas",iconName:e}}var vu=Le({name:"FontAwesomeIcon",props:{border:{type:Boolean,default:!1},fixedWidth:{type:Boolean,default:!1},flip:{type:[Boolean,String],default:!1,validator:function(n){return[!0,!1,"horizontal","vertical","both"].indexOf(n)>-1}},icon:{type:[Object,Array,String],required:!0},mask:{type:[Object,Array,String],default:null},maskId:{type:String,default:null},listItem:{type:Boolean,default:!1},pull:{type:String,default:null,validator:function(n){return["right","left"].indexOf(n)>-1}},pulse:{type:Boolean,default:!1},rotation:{type:[String,Number],default:null,validator:function(n){return[90,180,270].indexOf(Number.parseInt(n,10))>-1}},rotateBy:{type:Boolean,default:!1},swapOpacity:{type:Boolean,default:!1},size:{type:String,default:null,validator:function(n){return["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"].indexOf(n)>-1}},spin:{type:Boolean,default:!1},transform:{type:[String,Object],default:null},symbol:{type:[Boolean,String],default:!1},title:{type:String,default:null},titleId:{type:String,default:null},inverse:{type:Boolean,default:!1},bounce:{type:Boolean,default:!1},shake:{type:Boolean,default:!1},beat:{type:Boolean,default:!1},fade:{type:Boolean,default:!1},beatFade:{type:Boolean,default:!1},flash:{type:Boolean,default:!1},spinPulse:{type:Boolean,default:!1},spinReverse:{type:Boolean,default:!1},widthAuto:{type:Boolean,default:!1},canvasSquare:{type:Boolean,default:!1},canvasRoomy:{type:Boolean,default:!1},gradientFill:{type:Object,default:null,validator:function(n){return typeof n.id!="string"||!n.id?(console.warn("FontAwesomeIcon: gradientFill.id must be a non-empty string"),!1):n.type!=="linear"&&n.type!=="radial"?(console.warn('FontAwesomeIcon: gradientFill.type must be "linear" or "radial"'),!1):!0}},flip360:{type:Boolean,default:!1},buzz:{type:Boolean,default:!1},float:{type:Boolean,default:!1},jello:{type:Boolean,default:!1},spinSnap:{type:Boolean,default:!1},spinSnap4:{type:Boolean,default:!1},spinSnap8:{type:Boolean,default:!1},swing:{type:Boolean,default:!1},wag:{type:Boolean,default:!1}},setup:function(n,t){var a=t.attrs,i=F(function(){return xa(n.icon)}),s=F(function(){return Yt("classes",su(n))}),l=F(function(){return Yt("transform",typeof n.transform=="string"?hn.transform(n.transform):n.transform)}),u=F(function(){return Yt("mask",xa(n.mask))}),f=F(function(){var w=X(X(X(X({},s.value),l.value),u.value),{},{symbol:n.symbol,maskId:n.maskId});return w.title=n.title,w.titleId=n.titleId,Jl(i.value,w)});Pe(f,function(w){if(!w)return ya("Could not find one or more icon(s)",i.value,u.value)},{immediate:!0}),n.gradientFill&&n.symbol&&ya("gradientFill is not supported when symbol is true and will be ignored");var p=F(function(){return f.value?Li(f.value.abstract[0],{gradientFill:n.symbol?null:n.gradientFill},a):null});return function(){return p.value}}});var bu={prefix:"fas",iconName:"arrow-up-from-bracket",icon:[448,512,[],"e09a","M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"]};const hu={class:"challenge-launch","aria-labelledby":"launch-title"},yu={class:"challenge-launch__heading"},xu={class:"builder-card__eyebrow"},_u={id:"launch-title"},wu=["aria-label"],ku=["disabled"],Su=["disabled"],$u={class:"action-button__icon","aria-hidden":"true"},Pu=["src"],Cu={key:1,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},Iu=["disabled"],Au=["disabled"],Tu={class:"action-button__icon","aria-hidden":"true"},Ou=Le({__name:"ChallengeActions",props:{ready:{type:Boolean},busyAction:{}},emits:["exercise","print","save"],setup(e,{emit:n}){const{ui:t}=He(),a=n,i=st("challenge-random-coach-avatar",()=>"");return mt(async()=>{if(!i.value)try{const l=(await $fetch("/api/coaches")).coaches.filter(f=>f.avatarPath),u=l[Math.floor(Math.random()*l.length)];i.value=u?.avatarPath||""}catch{}}),(s,l)=>(k(),$("section",hu,[r("div",yu,[r("div",null,[r("p",xu,c(o(t)("Ton défi est prêt")),1),r("h2",_u,c(o(t)("Comment veux-tu l’utiliser ?")),1)])]),r("div",{class:"challenge-actions","aria-label":o(t)("Lancer le défi")},[r("button",{class:"action-button action-button--primary","data-tour":"action-classic",type:"button",disabled:!e.ready||!!e.busyAction,onClick:l[0]||(l[0]=u=>a("exercise","classic"))},[l[4]||(l[4]=r("span",{class:"action-button__icon","aria-hidden":"true"},"●",-1)),r("span",null,[r("strong",null,c(e.busyAction==="exercise"?o(t)("Préparation…"):o(t)("Classique")),1),r("small",null,c(o(t)("Questions et correction immédiate")),1)])],8,ku),r("button",{class:"action-button action-button--chat","data-tour":"action-coach",type:"button",disabled:!e.ready||!!e.busyAction,onClick:l[1]||(l[1]=u=>a("exercise","chat"))},[r("span",$u,[o(i)?(k(),$("img",{key:0,src:o(i),alt:""},null,8,Pu)):(k(),$("svg",Cu,[...l[5]||(l[5]=[r("circle",{cx:"12",cy:"8",r:"4"},null,-1),r("path",{d:"M4.5 21a7.5 7.5 0 0 1 15 0"},null,-1)])]))]),r("span",null,[r("strong",null,c(e.busyAction==="exercise"?o(t)("Préparation…"):o(t)("Avec un coach")),1),r("small",null,c(o(t)("Dialogue virtuel avec une aide pas à pas")),1)])],8,Su),r("button",{class:"action-button action-button--print","data-tour":"action-print",type:"button",disabled:!e.ready||!!e.busyAction,onClick:l[2]||(l[2]=u=>a("print"))},[l[6]||(l[6]=ir('<span class="action-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v7H6z"></path><path d="M18 12h.01"></path></svg></span>',1)),r("span",null,[r("strong",null,c(e.busyAction==="print"?o(t)("Préparation…"):o(t)("Imprimer")),1),r("small",null,c(o(t)("Les questions et le corrigé")),1)])],8,Iu),r("button",{class:"action-button action-button--share","data-tour":"action-share",type:"button",disabled:!e.ready||!!e.busyAction,onClick:l[3]||(l[3]=u=>a("save"))},[r("span",Tu,[Ue(o(vu),{icon:o(bu)},null,8,["icon"])]),r("span",null,[r("strong",null,c(e.busyAction==="save"?o(t)("Sauvegarde…"):o(t)("Partager")),1),r("small",null,c(o(t)("Partager ce défi avec d’autres personnes")),1)])],8,Au)],8,wu)]))}}),Sm=Object.assign(Ou,{__name:"ChallengeActions"}),ju=["aria-labelledby"],zu={class:"builder-card__header"},Eu={class:"builder-card__eyebrow"},Fu=["id"],Nu={class:"options-main-column"},Lu=["for"],Du=["id","value"],Mu={class:"check-row"},Ru=["checked"],Bu={class:"option-fieldset"},Wu={class:"segmented-control"},Uu=["name","checked"],Vu=["name","checked"],Ku=["aria-hidden"],Gu={key:0,class:"complement-options__title"},Hu={key:1,class:"complement-options__description"},qu=["disabled","aria-expanded","aria-controls"],Xu={"aria-hidden":"true"},Yu={key:3,class:"complement-options__unavailable"},Qu=["id"],Ju={class:"sr-only"},Zu=["disabled","checked"],ec=["disabled","checked"],tc=["disabled","checked"],nc=["disabled","checked"],ac={class:"conjugation-example__header"},ic={class:"conjugation-example__heading"},rc={class:"conjugation-example__screen"},oc={key:0,class:"conjugation-example__loading",role:"status"},sc={class:"sr-only"},lc={key:1,class:"conjugation-example__body"},uc={key:0,class:"conjugation-example__question"},cc={class:"conjugation-example__block-label"},fc={key:0,class:"conjugation-example__question-line"},dc={class:"conjugation-example__context"},mc={class:"conjugation-example__prompt"},pc={key:0,class:"conjugation-example__instruction"},gc={key:1,class:"conjugation-example__question-line"},vc={class:"conjugation-example__context"},bc={key:0,class:"conjugation-example__correction"},hc={key:1},yc=Le({__name:"ChallengeOptions",props:{questionCount:{},exerciseKind:{},inclusivePronouns:{type:Boolean},complementOptions:{},complementVerbs:{},eyebrow:{},idPrefix:{},gridLayout:{type:Boolean},conjugationInstruction:{},conjugationQuestionContext:{},conjugationQuestion:{},conjugationExample:{},conjugationExamplePrefix:{},conjugationExampleEmphasis:{},conjugationExampleSuffix:{},conjugationExampleLoading:{type:Boolean},revealPrefilledOptions:{type:Boolean}},emits:["updateQuestionCount","updateExerciseKind","updateInclusivePronouns","updateComplementOptions","prefilledOptionsRevealStart"],setup(e,{emit:n}){const{ui:t}=He(),a=e,i=n,s=Q(!!a.gridLayout),l=F(()=>(a.complementVerbs??[]).filter(D=>!!D.complementExample)),u=F(()=>a.exerciseKind==="conjugation"&&l.value.length>0),f=F(()=>l.value.some(D=>D.complementFunctions?.includes("cod")||D.complementExample?.functionObject==="cod")),p=F(()=>l.value.some(D=>D.complementFunctions?.includes("coi")||D.complementExample?.functionObject==="coi")),w=F(()=>l.value.some(D=>D.anteposableComplementFunctions?.includes("cod")||!!D.complementExample?.before)),_=F(()=>l.value.some(D=>D.anteposableComplementFunctions?.includes("coi"))),O=F(()=>a.idPrefix??"challenge-options"),A=F(()=>`${O.value}-title`),S=F(()=>`${O.value}-question-count`),v=F(()=>`${O.value}-exercise-kind`),I=F(()=>`${O.value}-complement-panel`),b=F(()=>!!((a.conjugationInstruction||a.conjugationQuestionContext||a.conjugationQuestion)&&a.conjugationExample)),d=F(()=>{const D=a.conjugationQuestion?.trim()??"";return D&&!/[.!?]$/u.test(D)?`${D}.`:D}),P=Q(0),C=[],N=Q(a.questionCount),K=Q([...a.complementOptions]),R=Q(!1);let L;const q=[];function Te(){for(L!==void 0&&(cancelAnimationFrame(L),L=void 0);q.length;)clearTimeout(q.pop())}function ke(){Te(),N.value=a.questionCount,K.value=[...a.complementOptions],R.value=!1}function Oe(){if(R.value)return;if(i("prefilledOptionsRevealStart"),Te(),window.matchMedia("(prefers-reduced-motion: reduce)").matches){ke();return}const D=Math.max(0,a.questionCount),T=[...a.complementOptions],m=500,h=performance.now();R.value=!0,N.value=0,K.value=[];const y=g=>{const E=Math.min(1,(g-h)/m);N.value=Math.round(D*E),E<1?L=requestAnimationFrame(y):L=void 0};L=requestAnimationFrame(y),T.forEach((g,E)=>{q.push(setTimeout(()=>{K.value=[...K.value,g]},Math.round(E/T.length*m)))}),q.push(setTimeout(ke,m))}function De(){for(;C.length;)clearTimeout(C.pop())}Pe(()=>a.conjugationExampleLoading,D=>{De(),P.value=0,!D&&C.push(setTimeout(()=>{P.value=1},80),setTimeout(()=>{P.value=2},280))},{immediate:!0}),Pe(()=>a.questionCount,D=>{R.value||(N.value=D)}),Pe(()=>a.complementOptions,D=>{R.value||(K.value=[...D])},{deep:!0}),Pe(()=>a.revealPrefilledOptions,D=>{D&&Oe()}),mt(()=>{a.revealPrefilledOptions&&Oe()}),wn(()=>{De(),Te()});function qe(D){R.value&&ke();const T=D.target.value;if(T==="")return;const m=Number(T);Number.isFinite(m)&&i("updateQuestionCount",Math.min(99,Math.max(1,Math.round(m))))}function je(D){i("updateExerciseKind",D.target.value)}function re(D,T){R.value&&ke();const m=new Set(a.complementOptions);T?m.add(D):m.delete(D),i("updateComplementOptions",[...m])}return Pe(u,D=>{D?a.gridLayout&&(s.value=!0):s.value=!1},{immediate:!0}),(D,T)=>(k(),$("section",{class:be(["builder-card options-card",{"options-card--grid":e.gridLayout,"options-card--revealing":o(R)}]),"aria-labelledby":o(A)},[r("div",zu,[r("div",null,[r("p",Eu,c(e.eyebrow??"Étape 3"),1),r("h2",{id:o(A)},c(o(t)("Mes options")),9,Fu)])]),r("div",{class:be(["options-layout",{"options-layout--columns":e.gridLayout}])},[r("div",{class:be(["options-fields",{"options-fields--columns":e.gridLayout}])},[r("div",Nu,[r("label",{class:"field-stack question-count-field",for:o(S)},[r("span",null,c(o(t)("Nombre de questions")),1),r("input",{id:o(S),type:"number",inputmode:"numeric",min:"1",max:"99",step:"1",value:o(N),onInput:qe},null,40,Du)],8,Lu),r("label",Mu,[r("input",{type:"checkbox",checked:e.inclusivePronouns,onChange:T[0]||(T[0]=m=>i("updateInclusivePronouns",m.target.checked))},null,40,Ru),r("span",null,[se(c(o(t)("Inclure les pronoms"))+" ",1),T[6]||(T[6]=r("strong",null,"iel / iels",-1)),r("small",null,c(o(t)("Ils apparaîtront ponctuellement dans les questions.")),1)])]),r("fieldset",Bu,[r("legend",null,c(o(t)("Type d’exercice")),1),r("div",Wu,[r("label",null,[r("input",{type:"radio",name:o(v),value:"conjugation",checked:e.exerciseKind==="conjugation",onChange:je},null,40,Uu),r("span",null,c(o(t)("Conjuguer")),1)]),r("label",null,[r("input",{type:"radio",name:o(v),value:"tense-identification",checked:e.exerciseKind==="tense-identification",onChange:je},null,40,Vu),r("span",null,c(o(t)("Trouver le mode et le temps")),1)])])])]),r("div",{class:be(["complement-options",{"complement-options--disabled":!o(u),"complement-options--hidden":e.gridLayout&&e.exerciseKind==="tense-identification"}]),"data-tour":"options-complements","aria-hidden":e.gridLayout&&e.exerciseKind==="tense-identification"?"true":void 0},[e.gridLayout?(k(),$("h3",Gu,c(o(t)("Compléments d’objets :")),1)):M("",!0),e.gridLayout?(k(),$("p",Hu,c(o(t)("Ajoute des compléments d’objets directs ou indirects.")),1)):(k(),$("button",{key:2,class:"complement-options__trigger",type:"button",disabled:!o(u),"aria-expanded":o(s),"aria-controls":o(I),onClick:T[1]||(T[1]=m=>s.value=!o(s))},[r("span",null,[se(c(o(t)("Compléments d’objets :"))+" ",1),r("small",null,c(o(t)("nouveau")),1)]),r("span",Xu,c(o(s)?"−":"+"),1)],8,qu)),o(u)?M("",!0):(k(),$("p",Yu,c(e.exerciseKind!=="conjugation"?"Disponible uniquement pour un exercice de conjugaison.":"Les verbes choisis ne proposent pas de complément."),1)),Ue(ut,{name:"complement-panel"},{default:Ve(()=>[e.gridLayout||o(s)?(k(),$("fieldset",{key:0,id:o(I),class:"complement-options__panel"},[r("legend",Ju,c(o(t)("Présentation des compléments d’objets")),1),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(f),checked:o(K).includes("cod-after"),onChange:T[2]||(T[2]=m=>re("cod-after",m.target.checked))},null,40,Zu),r("span",null,[r("strong",null,c(o(t)("COD placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(w),checked:o(K).includes("cod-before"),onChange:T[3]||(T[3]=m=>re("cod-before",m.target.checked))},null,40,ec),r("span",null,[r("strong",null,c(o(t)("COD placé avant")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(p),checked:o(K).includes("coi-after"),onChange:T[4]||(T[4]=m=>re("coi-after",m.target.checked))},null,40,tc),r("span",null,[r("strong",null,c(o(t)("COI placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(_),checked:o(K).includes("coi-before"),onChange:T[5]||(T[5]=m=>re("coi-before",m.target.checked))},null,40,nc),r("span",null,[r("strong",null,c(o(t)("COI placé avant")),1)])])],8,Qu)):M("",!0)]),_:1})],10,Ku)],2),e.gridLayout&&(e.conjugationExampleLoading||o(b))?(k(),$("div",{key:0,class:be(["conjugation-example",{"conjugation-example--wide":e.exerciseKind==="tense-identification"}]),"data-tour":"options-preview","aria-live":"polite","aria-atomic":"true"},[r("div",ac,[T[7]||(T[7]=r("span",{class:"conjugation-example__preview-icon","aria-hidden":"true"},[r("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},[r("path",{d:"M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z"}),r("circle",{cx:"12",cy:"12",r:"3"})])],-1)),r("div",ic,[r("span",null,c(o(t)("Aperçu d’une question")),1)])]),r("div",rc,[e.conjugationExampleLoading?(k(),$("div",oc,[T[8]||(T[8]=r("span",{class:"conjugation-example__spinner","aria-hidden":"true"},null,-1)),r("span",sc,c(o(t)("Préparation de l’aperçu")),1)])):(k(),$("div",lc,[Ue(ut,{name:"example-item"},{default:Ve(()=>[o(P)>=1?(k(),$("div",uc,[r("span",cc,c(o(t)("Exemple de question")),1),e.exerciseKind==="tense-identification"&&e.conjugationInstruction&&e.conjugationQuestion?(k(),$("p",fc,[r("span",dc,c(e.conjugationInstruction),1),T[9]||(T[9]=r("span",{class:"conjugation-example__question-separator","aria-hidden":"true"},"—",-1)),r("span",mc,c(o(d)),1)])):(k(),$(Y,{key:1},[e.conjugationInstruction?(k(),$("p",pc,c(e.conjugationInstruction),1)):M("",!0),e.conjugationQuestionContext?(k(),$("p",gc,[r("span",vc,c(e.conjugationQuestionContext),1)])):M("",!0)],64))])):M("",!0)]),_:1}),Ue(ut,{name:"example-item"},{default:Ve(()=>[o(P)>=2?(k(),$("div",bc,[r("span",null,c(o(t)("Réponse attendue")),1),r("p",null,[e.conjugationExampleEmphasis?(k(),$(Y,{key:0},[r("span",null,c(e.conjugationExamplePrefix),1),r("strong",null,c(e.conjugationExampleEmphasis),1),r("span",null,c(e.conjugationExampleSuffix),1)],64)):(k(),$("span",hc,c(e.conjugationExample),1))])])):M("",!0)]),_:1})]))])],2)):M("",!0)],2)],10,ju))}}),$m=Object.assign(Ft(yc,[["__scopeId","data-v-0408ee7c"]]),{__name:"ChallengeOptions"}),xc=["aria-labelledby","aria-label"],_c={key:0,class:"preset-browser"},wc={class:"preset-browser__columns"},kc={class:"preset-browser__column","data-browser-column":"1","aria-labelledby":"preset-browser-groups"},Sc={id:"preset-browser-groups"},$c={class:"preset-browser__list"},Pc=["aria-pressed","onClick"],Cc=["aria-label"],Ic={class:"preset-browser__list"},Ac={class:"preset-browser__info","data-preset-info":""},Tc=["aria-expanded","aria-controls","aria-label","onMouseenter","onClick"],Oc=["id"],jc={class:"preset-browser__tooltip-section"},zc={class:"preset-browser__verb-badges"},Ec={key:0,class:"preset-browser__other-verbs"},Fc={class:"preset-browser__tooltip-section"},Nc=["aria-pressed","onClick"],Lc=["aria-label"],Dc={class:"preset-browser__list"},Mc={class:"preset-browser__count"},Rc={class:"preset-panel__intro"},Bc={class:"builder-card__eyebrow"},Wc={id:"presets-title"},Uc={class:"preset-mobile-select"},Vc=["value"],Kc={value:""},Gc=["label"],Hc=["value"],qc=["aria-label"],Xc=["id","aria-selected","aria-controls","tabindex","onClick","onKeydown"],Yc=["id","aria-labelledby"],Qc=["onClick"],Jc={key:0,class:"preset-card__random"},Zc=["onClick"],ef=["onClick"],tf=["onClick"],nf=Le({__name:"PresetPicker",props:{presets:{},activePresetId:{},compact:{type:Boolean},verbs:{},modes:{},tenses:{}},emits:["select","stageChange"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=He(),{track:i}=$a(),s=e,l=n,u=F(()=>{const h=new Map;return s.presets.forEach(y=>{const g=h.get(y.group)??[];g.push(y),h.set(y.group,g)}),[...h.entries()].map(([y,g])=>({id:y,label:g[0]?.groupLabel??ka[y]??y,order:g[0]?.groupOrder??ar.indexOf(y),presets:g})).sort((y,g)=>y.order-g.order||y.label.localeCompare(g.label,"fr"))}),f=Q("school"),p=F(()=>u.value.find(h=>h.id===f.value)??u.value[0]),w=Q(""),_=F(()=>s.presets.find(h=>h.id===w.value)),O=Q(null),A=Q(null),S=F(()=>u.value.find(h=>h.id===O.value)),v=F(()=>s.presets.find(h=>h.id===A.value)),I=Q(null),b=Q(null),d=Q(null),P=new Set,C=F(()=>new Map((s.verbs??[]).map(h=>[h.id,h.infinitif]))),N=F(()=>new Map((s.tenses??[]).map(h=>[h.id,h]))),K=F(()=>new Map((s.modes??[]).map(h=>[h.id,h])));function R(h){return b.value===h||d.value===h}function L(h){return h.verbIds.slice(0,12).map(y=>C.value.get(y)??`Verbe ${y}`)}function q(h){const y=new Map;for(const g of h.tenseIds){const E=N.value.get(g);if(!E)continue;const ce=K.value.get(E.modeId),Se=y.get(E.modeId)??{mode:a(ce?.name??E.mode?.name??t("Autres temps")),order:ce?.order??E.mode?.order??Number.MAX_SAFE_INTEGER,tenses:[]};Se.tenses.push(a(E.name)),y.set(E.modeId,Se)}return[...y.values()].sort((g,E)=>g.order-E.order||g.mode.localeCompare(E.mode,"fr"))}function Te(h){d.value=d.value===h?null:h}function ke(h){h.target?.closest("[data-preset-info]")||(d.value=null)}mt(()=>document.addEventListener("pointerdown",ke)),wn(()=>document.removeEventListener("pointerdown",ke));function Oe(h){for(const y of h)P.has(y.id)||(P.add(y.id),i("feature_exposed",{feature:"preset",item:y.id}))}Pe([()=>s.compact,p,S],([h,y,g])=>{if(h){g&&Oe(g.presets);return}y&&Oe(y.presets)},{immediate:!0});function De(h){Jt(()=>{const y=I.value;if(!y||y.scrollWidth<=y.clientWidth+1)return;y.querySelector(`[data-browser-column="${h}"]`)?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"end"})})}function qe(h){O.value=h,A.value=null,d.value=null,b.value=null,l("stageChange","presets"),De(2)}function je(h){A.value=h,De(3)}function re(h,y){A.value=null,l("select",h,y)}function D(h){w.value=h.target.value,_.value&&l("select",_.value)}function T(h,y){let g;if((h.key==="ArrowRight"||h.key==="ArrowDown")&&(g=(y+1)%u.value.length),(h.key==="ArrowLeft"||h.key==="ArrowUp")&&(g=(y-1+u.value.length)%u.value.length),h.key==="Home"&&(g=0),h.key==="End"&&(g=u.value.length-1),g===void 0)return;h.preventDefault();const E=u.value[g];E&&(f.value=E.id,Jt(()=>document.getElementById(`preset-tab-${E.id}`)?.focus()))}function m(h,y){l("select",h,Math.min(y,h.verbIds.length))}return(h,y)=>(k(),$("section",{class:be(["preset-panel",{"preset-panel--compact":e.compact}]),"aria-labelledby":e.compact?void 0:"presets-title","aria-label":e.compact?"Défis prêts à l’emploi":void 0},[e.compact?(k(),$("div",_c,[r("div",{ref_key:"compactBrowser",ref:I,class:"preset-browser__scroll"},[r("div",wc,[r("section",kc,[r("h3",Sc,c(o(t)("Catégories")),1),r("div",$c,[(k(!0),$(Y,null,ie(o(u),g=>(k(),$("button",{key:g.id,type:"button",class:be({"is-selected":o(O)===g.id}),"aria-pressed":o(O)===g.id,onClick:E=>qe(g.id)},[r("span",null,c(g.label),1),y[7]||(y[7]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,Pc))),128))])]),Ue(ut,{name:"browser-column"},{default:Ve(()=>[o(S)?(k(),$("section",{key:o(S).id,class:"preset-browser__column","data-browser-column":"2","aria-label":`Défis de ${o(S).label}`},[r("div",Ic,[(k(!0),$(Y,null,ie(o(S).presets,g=>(k(),$("div",{key:g.id,class:"preset-browser__preset-row"},[r("div",Ac,[r("button",{class:"preset-browser__info-button",type:"button","aria-expanded":R(g.id),"aria-controls":`preset-info-${g.id}`,"aria-label":`Informations sur ${g.label}`,onMouseenter:E=>b.value=g.id,onMouseleave:y[0]||(y[0]=E=>b.value=null),onClick:At(E=>Te(g.id),["stop"])},"i",40,Tc),R(g.id)?(k(),$("section",{key:0,id:`preset-info-${g.id}`,class:"preset-browser__tooltip","aria-live":"polite"},[r("header",null,[r("strong",null,c(g.label),1),r("span",null,c(g.questionCount)+" "+c(o(t)("questions")),1)]),r("div",jc,[r("h4",null,c(o(t)("Verbes")),1),r("div",zc,[(k(!0),$(Y,null,ie(L(g),E=>(k(),$("span",{key:E},c(E),1))),128))]),g.verbIds.length>12?(k(),$("p",Ec,"+ "+c(g.verbIds.length-12)+" "+c(o(t)("autres verbes")),1)):M("",!0)]),r("div",Fc,[r("h4",null,c(o(t)("Temps")),1),r("dl",null,[(k(!0),$(Y,null,ie(q(g),E=>(k(),$("div",{key:E.mode},[r("dt",null,c(E.mode),1),r("dd",null,c(E.tenses.join(", ")),1)]))),128))])])],8,Oc)):M("",!0)]),r("button",{class:be(["preset-browser__preset-button",{"is-selected":o(A)===g.id||e.activePresetId===g.id}]),type:"button","aria-pressed":o(A)===g.id,onClick:E=>je(g.id)},[r("span",null,[r("strong",null,c(g.label),1)]),y[8]||(y[8]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,Nc)]))),128))])],8,Cc)):M("",!0)]),_:1}),Ue(ut,{name:"browser-column"},{default:Ve(()=>[o(v)?(k(),$("section",{key:o(v).id,class:"preset-browser__column preset-browser__column--quantity","data-browser-column":"3","aria-label":o(t)("Choisir le nombre de verbes")},[r("div",Dc,[r("button",{type:"button",onClick:y[1]||(y[1]=g=>re(o(v)))},[r("span",null,[r("strong",null,c(o(t)("Tous les verbes")),1)]),r("span",Mc,c(o(v).verbIds.length),1),y[9]||(y[9]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))]),y[20]||(y[20]=r("span",{class:"preset-browser__quantity-separator","aria-hidden":"true"},null,-1)),o(v).verbIds.length>=1&&o(v).verbIds.length<5?(k(),$("button",{key:0,type:"button",onClick:y[2]||(y[2]=g=>re(o(v),1))},[r("span",null,[r("strong",null,c(o(t)("1 au hasard")),1)]),y[10]||(y[10]=r("span",{class:"preset-browser__count"},"1",-1)),y[11]||(y[11]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),o(v).verbIds.length>=2&&o(v).verbIds.length<5?(k(),$("button",{key:1,type:"button",onClick:y[3]||(y[3]=g=>re(o(v),2))},[r("span",null,[r("strong",null,c(o(t)("2 au hasard")),1)]),y[12]||(y[12]=r("span",{class:"preset-browser__count"},"2",-1)),y[13]||(y[13]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),o(v).verbIds.length>=3?(k(),$("button",{key:2,type:"button",onClick:y[4]||(y[4]=g=>re(o(v),3))},[r("span",null,[r("strong",null,c(o(t)("3 au hasard")),1)]),y[14]||(y[14]=r("span",{class:"preset-browser__count"},"3",-1)),y[15]||(y[15]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),o(v).verbIds.length>=5?(k(),$("button",{key:3,type:"button",onClick:y[5]||(y[5]=g=>re(o(v),5))},[r("span",null,[r("strong",null,c(o(t)("5 au hasard")),1)]),y[16]||(y[16]=r("span",{class:"preset-browser__count"},"5",-1)),y[17]||(y[17]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),o(v).verbIds.length>=10?(k(),$("button",{key:4,type:"button",onClick:y[6]||(y[6]=g=>re(o(v),10))},[r("span",null,[r("strong",null,c(o(t)("10 au hasard")),1)]),y[18]||(y[18]=r("span",{class:"preset-browser__count"},"10",-1)),y[19]||(y[19]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0)])],8,Lc)):M("",!0)]),_:1})])],512)])):(k(),$(Y,{key:1},[r("div",Rc,[r("div",null,[r("p",Bc,c(o(t)("Pour démarrer rapidement")),1),r("h2",Wc,c(o(t)("Défis prêts à l’emploi")),1)]),r("p",null,c(o(t)("Choisissez un niveau ou une famille de verbes, puis ajustez librement la sélection.")),1)]),r("label",Uc,[r("span",null,c(o(t)("Choisir un défi prêt à l’emploi")),1),r("select",{value:e.activePresetId??o(w),onChange:D},[r("option",Kc,c(o(t)("Choisir un niveau ou un entraînement…")),1),(k(!0),$(Y,null,ie(o(u),g=>(k(),$("optgroup",{key:g.id,label:g.label},[(k(!0),$(Y,null,ie(g.presets,E=>(k(),$("option",{key:E.id,value:E.id},c(E.label)+" — "+c(E.verbIds.length)+" "+c(o(t)("verbes")),9,Hc))),128))],8,Gc))),128))],40,Vc)]),r("div",{class:"preset-groups",role:"tablist","aria-label":o(t)("Catégories de défis")},[(k(!0),$(Y,null,ie(o(u),(g,E)=>(k(),$("button",{id:`preset-tab-${g.id}`,key:g.id,class:be(["preset-group-button",{"preset-group-button--active":o(p)?.id===g.id}]),type:"button",role:"tab","aria-selected":o(p)?.id===g.id,"aria-controls":`preset-content-${g.id}`,tabindex:o(p)?.id===g.id?0:-1,onClick:ce=>f.value=g.id,onKeydown:ce=>T(ce,E)},c(g.label),43,Xc))),128))],8,qc),o(p)?(k(),$("div",{key:0,id:`preset-content-${o(p).id}`,class:"preset-list",role:"tabpanel","aria-labelledby":`preset-tab-${o(p).id}`},[(k(!0),$(Y,null,ie(o(p).presets,g=>(k(),$("article",{key:g.id,class:be(["preset-card",{"preset-card--active":e.activePresetId===g.id}])},[r("button",{type:"button",onClick:E=>l("select",g)},[r("strong",null,c(g.label),1),r("span",null,c(g.description),1),r("small",null,c(g.verbIds.length)+" verbes · "+c(g.questionCount)+" "+c(o(t)("questions")),1)],8,Qc),g.verbIds.length>5?(k(),$("div",Jc,[se(c(o(t)("Au hasard :"))+" ",1),r("button",{type:"button",onClick:E=>m(g,1)},"1",8,Zc),r("button",{type:"button",onClick:E=>m(g,5)},"5",8,ef),r("button",{type:"button",onClick:E=>m(g,10)},"10",8,tf)])):M("",!0)],2))),128))],8,Yc)):M("",!0)],64))],10,xc))}}),Pm=Object.assign(Ft(nf,[["__scopeId","data-v-405192b2"]]),{__name:"ChallengePresetPicker"}),_a="Quel est le temps et le mode de cette forme conjuguée ?";function xn(e,n){const t=String(e||"").split(/\r?\n/u);return Math.max(1,t.reduce((a,i)=>{const s=i.replace(/\s+/g," ").trim();return a+Math.max(1,Math.ceil(s.length/n))},0))}function af(e,n=8){return 5+n+(xn(e,86)-1)*5}function rf(e,n){return 8+(Math.max(xn(e,54),xn(n,38))-1)*5}function wa(e,n,t,a){const i=[];let s=[],l=0,u=n;return e.forEach((f,p)=>{const w=Math.max(1,a(f));s.length>0&&l+w>u&&(i.push(s),s=[],l=0,u=t),s.push({item:f,index:p}),l+=w}),s.length>0&&i.push(s),i}const Mi=".................................",of="......................................",sf=32;function lf(e,n){return n.mode?.trim().toLocaleLowerCase("fr-CH")!=="subjonctif"||n.complementPosition==="before"||/^(?:que|qu['’])\s*/iu.test(e)?e:`que ${e}`.replace(/^que (i(?:l|ls|el|els)|elle?s?|on)\b/iu,"qu'$1")}function uf(e,n){const t=lf(e.trim(),n),[a="",...i]=t.split("…"),s=i.join("…").trim(),u=n.mode?.trim().toLocaleLowerCase("fr-CH")==="impératif"&&!s.endsWith("!")?`${s}${s?" ":""}!`:s,f=n.complementPosition!=="before"&&n.saisiePrefixe!==void 0?n.saisiePrefixe.trim():a.trim(),p=Mi,w=u.length>sf,_=w?Math.max(32,Math.min(58,72-Math.round(u.length*.65))):100;return{completionPrefix:f,completionSuffix:u,fillBlank:t.includes("…")||i.length===0,suffixOnNextLine:w,blankWidthPercent:_,completion:[f,p,u].filter(Boolean).join(" ")}}function Ze(e,n){if(n==="tense-identification")return{label:"",completion:e.consigne,completionPrefix:e.consigne,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100};if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="gérondif"){const u=e.infinitif||e.titre,f=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${u} | ${f} :`,completion:`en ${of}`,completionPrefix:"en",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="participe"){const u=e.infinitif||e.titre,f=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${u} | ${f} :`,completion:Mi,completionPrefix:"",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}const t=e.consigne.split("|").map(u=>u.trim());if(t.length<3)return{label:"",completion:e.consigne,completionPrefix:e.consigne,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100};const a=t.slice(0,-2).join(" | "),i=t.at(-2)||e.infinitif||"",s=t.at(-1)||[e.temps,e.mode?`(${e.mode})`:""].filter(Boolean).join(" "),l=uf(a,e);return{label:`${i} | ${s} :`,...l}}function cf(e,n){const t=Ze(e,n);return[t.label,t.completion].filter(Boolean).join(" ")}function _n(e){const n=[...new Set(e.reponsesPourCorrige.map(t=>t.trim()).filter(Boolean))];return e.isCompound&&n.length>1?n.slice(0,1):n}function Qt(e,n){if(["gérondif","participe"].includes(e.mode?.trim().toLocaleLowerCase("fr-CH")||""))return e.consigne;const t=Ze(e,n);return t.label||t.completion}function ff(e){return _n(e).join(`
`)}const df={ref:"print-dialog",class:"print-overlay","data-tour":"print-preview",role:"dialog","aria-modal":"true","aria-labelledby":"print-preview-title",tabindex:"-1"},mf={class:"print-toolbar no-print"},pf={id:"print-preview-title"},gf=["disabled"],vf=["disabled"],bf={class:"print-preview-layout"},hf={class:"print-settings no-print","data-tour":"print-settings","aria-labelledby":"print-settings-title"},yf={class:"print-settings__heading"},xf={id:"print-settings-title"},_f={class:"print-settings__field",for:"preview-print-title"},wf=["value"],kf={class:"print-settings__group"},Sf={class:"print-settings__number-field",for:"preview-title-spacing"},$f=["value"],Pf={class:"print-settings__number-field",for:"preview-question-spacing"},Cf=["value"],If={class:"print-settings__group"},Af=["checked"],Tf=["checked"],Of=["checked"],jf=["checked"],zf={class:"print-settings__group"},Ef=["checked"],Ff=["checked"],Nf=["checked"],Lf={class:"print-document print-document--pdf"},Df=["src","title"],Mf={key:1,class:"pdf-preview-state",role:"status","aria-live":"polite"},Rf={key:2,class:"pdf-preview-state pdf-preview-state--error",role:"alert"},Bf=Le({__name:"PrintPreview",props:{questions:{},verbs:{},tenses:{},exerciseKind:{},options:{}},emits:["close","updateOptions"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=He(),i=e,s=n,{track:l}=$a(),u=Math.floor(Math.random()*9e3)+1e3,f=Tt("print-dialog"),p=Q(!1),w=Q(!1),_=Q(!0),O=Q(!1),A=Q(""),S=Q("");let v=0,I;function b(T,m,h,y){const g=Number(T);return Number.isFinite(g)?Math.min(y,Math.max(h,g)):m}const d=F(()=>b(i.options.questionSpacingMm,8,2,15)),P=F(()=>b(i.options.titleSpacingMm,30,8,30)),C=F(()=>{let T=226;return(i.options.showFirstName||i.options.showLastName||i.options.showDate)&&(T-=Math.max(0,P.value-1)),i.options.showVerbs&&(T-=8),i.options.showTenses&&(T-=8),i.exerciseKind==="tense-identification"&&(T-=13),T}),N=F(()=>wa(i.questions,C.value,220,T=>{const m=Ze(T,i.exerciseKind);return af(cf(T,i.exerciseKind),d.value)+(m.suffixOnNextLine?6:0)})),K=F(()=>wa(i.questions,205,220,T=>rf(Qt(T,i.exerciseKind),ff(T))));Pa(f,()=>s("close"));function R(T,m){s("updateOptions",{...i.options,[T]:m})}function L(T){return String(T??"").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/…/g,"...").replace(/–|—/g,"-")}function q(T){return String(T??"").replace(new RegExp("^(\\s*)(\\p{L})","u"),(m,h,y)=>`${h}${y.toLocaleUpperCase("fr-CH")}`)}function Te(T){return String(T??"").split(`
`).map(q).join(`
`)}function ke(){return`${(i.options.title||t("Défi de conjugaison")).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"")||"defi-conjugaison"}.pdf`}async function Oe(){const{jsPDF:T}=await Ln(async()=>{const{jsPDF:J}=await import("./CU_Iov45.js").then(G=>G.j);return{jsPDF:J}},__vite__mapDeps([0,1,2]),import.meta.url),m=new T({orientation:"portrait",unit:"mm",format:"a4",compress:!0}),h=210,y=297,g=17,E=193,ce=L(i.options.title||t("Défi de conjugaison")),Se=i.options.showRandomNumber?` n° ${u}`:"";let fe=0;function bt(){fe>0&&m.addPage("a4","portrait"),fe+=1}function ht(){m.setFont("helvetica","normal"),m.setFontSize(8),m.setTextColor(105,105,105),m.text("conjugaison.tatitotu.ch",h/2,y-8,{align:"center"}),m.setTextColor(20,20,20)}function Bt(J){if(J)return m.setFont("helvetica","normal"),m.setFontSize(8.5),m.setTextColor(90,90,90),m.text(`${ce}${Se}`,h/2,12,{align:"center"}),m.setTextColor(20,20,20),32;let G=18;const B=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean);B.length&&(m.setFont("helvetica","normal"),m.setFontSize(8.5),m.text(L(B.join("     ")),g,G),G+=P.value),i.options.showGrade&&(m.setDrawColor(40,40,40),m.rect(E-17,15,17,17)),m.setFont("helvetica","bold"),m.setFontSize(17);const ze=`${ce}${Se}`,de=m.splitTextToSize(ze.toUpperCase(),150);if(m.text(de,g,G+8),G+=de.length*7+10,m.setFontSize(9),i.options.showVerbs){const ee=m.splitTextToSize(`Verbes : ${L(i.verbs.map(W=>W.infinitif).join(", "))}`,176);m.text(ee,g,G),G+=ee.length*4.5+2}if(i.options.showTenses){const ee=m.splitTextToSize(`${t("Temps :")} ${L(i.tenses.map(W=>a(W.name)).join(", "))}`,176);m.text(ee,g,G),G+=ee.length*4.5+2}return i.exerciseKind==="tense-identification"&&(m.setDrawColor(120,120,120),m.rect(g,G,176,10),m.text(_a,g+3,G+6),G+=15),G+2}function at(J){return J?(m.setFont("helvetica","normal"),m.setFontSize(8.5),m.setTextColor(90,90,90),m.text(`${ce} - corrigé${Se}`,h/2,12,{align:"center"}),m.setTextColor(20,20,20),32):(m.setFont("helvetica","bold"),m.setFontSize(17),m.setTextColor(20,20,20),m.text(`${t("CORRIGÉ")}${Se}`,g,26),38)}function it(J,G){bt();let B=Bt(G);m.setFontSize(10.5),J.forEach(({item:ze,index:de})=>{const ee=`${de+1}. `,W=Ze(ze,i.exerciseKind);m.setFont("helvetica","normal");const me=m.splitTextToSize(L(q(W.label)),68),oe=W.label?96:169,pe=W.fillBlank?[L(q(W.completion))]:m.splitTextToSize(L(q(W.completion)),oe),ge=W.label?96:g+7,$e=L(q(W.completionPrefix)),xe=L(W.completionSuffix),ne=ge+($e?m.getTextWidth($e)+2:0),Ut=E-(!W.suffixOnNextLine&&xe?m.getTextWidth(xe)+2:0),ae=W.suffixOnNextLine?ge+oe*(W.blankWidthPercent/100):Ut;let Me="",_e=[];if(W.suffixOnNextLine&&xe){const rt=ae+2,ue=Math.max(0,E-rt),Re=xe.split(/\s+/u).filter(Boolean),Be=[];for(;Re.length;){const yt=[...Be,Re[0]].join(" ");if(Be.length&&m.getTextWidth(yt)>ue||!Be.length&&m.getTextWidth(yt)>ue)break;Be.push(Re.shift())}Me=Be.join(" "),_e=Re.length?m.splitTextToSize(Re.join(" "),oe):[]}const Xe=W.suffixOnNextLine?1+_e.length:pe.length,Ye=Math.max(me.length,Xe);m.text(ee,g,B),W.label&&m.text(me,g+7,B),W.fillBlank?($e&&m.text($e,ge,B),xe&&!W.suffixOnNextLine&&m.text(xe,E,B,{align:"right"}),ae>ne&&(m.setLineDashPattern([.7,.7],0),m.setDrawColor(55,55,55),m.line(ne,B+.8,ae,B+.8),m.setLineDashPattern([],0)),W.suffixOnNextLine&&(Me&&m.text(Me,ae+2,B),_e.forEach((rt,ue)=>{m.text(rt,ge,B+5+ue*5)}))):m.text(pe,ge,B),B+=Math.max(5+d.value,Ye*5+d.value)}),ht()}function Wt(J,G){bt();let B=at(G);m.setFontSize(9.5),J.forEach(({item:ze,index:de})=>{const ee=m.splitTextToSize(L(q(Qt(ze,i.exerciseKind))),79),W=_n(ze).flatMap(xe=>m.splitTextToSize(L(Te(xe)),82)),me=Math.max(ee.length,W.length),oe=Math.max(8,me*5+3),pe=B+Math.max(0,(oe-5)/2),ge=B+Math.max(0,(oe-ee.length*5)/2),$e=B+Math.max(0,(oe-W.length*5)/2);m.setFont("helvetica","normal"),m.text(`${de+1}.`,g,pe,{baseline:"top"}),m.text(ee,g+7,ge,{baseline:"top"}),m.setFont("helvetica","bold"),m.text(W,106,$e,{baseline:"top"}),m.setDrawColor(220,220,220),m.line(g,B+oe,E,B+oe),B+=oe}),ht()}return N.value.forEach((J,G)=>it(J,G>0)),K.value.forEach((J,G)=>Wt(J,G>0)),m}async function De(){if(!p.value){l("feature_selected",{feature:"download.pdf"}),p.value=!0;try{(await Oe()).save(ke()),l("pdf_downloaded",{exerciseKind:i.exerciseKind})}catch{l("feature_failed",{feature:"download.pdf"})}finally{p.value=!1}}}function qe(){A.value&&(URL.revokeObjectURL(A.value),A.value="")}async function je(){const T=++v;_.value=!0,O.value=!1,S.value="";try{const h=(await Oe()).output("blob");if(T!==v)return;qe(),A.value=URL.createObjectURL(h)}catch(m){if(T!==v)return;console.error(t("Impossible de générer l’aperçu PDF."),m),S.value=t("L’aperçu PDF n’a pas pu être créé.")}finally{T===v&&(_.value=!1)}}function re(){I&&clearTimeout(I),I=setTimeout(()=>{I=void 0,je()},250)}Pe(()=>({questions:i.questions,verbs:i.verbs,tenses:i.tenses,exerciseKind:i.exerciseKind,options:i.options}),re,{deep:!0}),mt(()=>{l("feature_exposed",{feature:"download.pdf"}),l("feature_exposed",{feature:"download.word"}),je()}),wn(()=>{v+=1,I&&clearTimeout(I),qe()});async function D(){if(!w.value){l("feature_selected",{feature:"download.word"}),w.value=!0;try{const{AlignmentType:T,BorderStyle:m,Document:h,Footer:y,Header:g,HeightRule:E,LeaderType:ce,Packer:Se,Paragraph:fe,SectionType:bt,Tab:ht,TabStopType:Bt,Table:at,TableBorders:it,TableCell:Wt,TableLayoutType:J,TableRow:G,TextRun:B,VerticalAlign:ze,WidthType:de}=await Ln(async()=>{const{AlignmentType:U,BorderStyle:te,Document:ve,Footer:xt,Header:Bi,HeightRule:Wi,LeaderType:Ui,Packer:Vi,Paragraph:Ki,SectionType:Gi,Tab:Hi,TabStopType:qi,Table:Xi,TableBorders:Yi,TableCell:Qi,TableLayoutType:Ji,TableRow:Zi,TextRun:er,VerticalAlign:tr,WidthType:nr}=await import("./BOF6v8rb.js");return{AlignmentType:U,BorderStyle:te,Document:ve,Footer:xt,Header:Bi,HeightRule:Wi,LeaderType:Ui,Packer:Vi,Paragraph:Ki,SectionType:Gi,Tab:Hi,TabStopType:qi,Table:Xi,TableBorders:Yi,TableCell:Qi,TableLayoutType:Ji,TableRow:Zi,TextRun:er,VerticalAlign:tr,WidthType:nr}},[],import.meta.url),ee=i.options.title||t("Défi de conjugaison"),W=i.options.showRandomNumber?` n° ${u}`:"",me=9975,oe={top:1020,right:965,bottom:850,left:965,header:360,footer:360,gutter:0},pe={before:0,after:0,line:240},ge=new y({children:[new fe({alignment:T.CENTER,spacing:pe,children:[new B({text:"conjugaison.tatitotu.ch",size:16,color:"666666"})]})]}),$e=U=>new g({children:[new fe({alignment:T.CENTER,spacing:pe,children:[new B({text:U,size:17,color:"666666"})]})]}),xe=new g({children:[new fe({spacing:pe})]}),ne=(U,te={})=>new fe({alignment:te.alignment,spacing:pe,children:[new B({text:U,bold:te.bold,size:te.size??21,font:"Arial"})]}),Ut=U=>{const te=Ze(U,i.exerciseKind);if(!te.fillBlank)return[ne(q(te.completion),{size:21})];const ve=q(te.completionPrefix),xt=te.completionSuffix;return[new fe({spacing:pe,tabStops:[{type:Bt.RIGHT,position:5300,leader:ce.DOT}],children:[new B({size:21,font:"Arial",children:[...ve?[ve," "]:[],new ht,...xt?[` ${xt}`]:[]]})]})]},ae=(U,te,ve={})=>new Wt({children:U,width:{size:te,type:de.DXA},verticalAlign:ze.CENTER,borders:ve.borders,margins:ve.margins??{top:70,bottom:70,left:70,right:70}}),Me={bottom:{style:m.SINGLE,size:2,color:"D9D9D9"}},_e=[],Xe=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean),Ye=i.options.showGrade?965:0,rt=Xe.length>0?Math.floor((me-Ye)/Xe.length):me-Ye;if(Xe.forEach(U=>_e.push(ae([ne(U,{size:18})],rt))),Xe.length===0&&i.options.showGrade&&_e.push(ae([ne("")],me-Ye)),i.options.showGrade){const U={style:m.SINGLE,size:8,color:"333333"};_e.push(ae([ne("")],Ye,{borders:{top:U,bottom:U,left:U,right:U},margins:{top:0,bottom:0,left:0,right:0}}))}const ue=[];_e.length>0&&ue.push(new at({width:{size:me,type:de.DXA},columnWidths:_e.map(U=>U.options.width?.size),layout:J.FIXED,borders:it.NONE,rows:[new G({height:{value:700,rule:E.ATLEAST},cantSplit:!0,children:_e})]})),ue.push(new fe({spacing:{before:Math.round(P.value*56.7),after:260},children:[new B({text:ee.toUpperCase(),bold:!0,size:34,font:"Arial"}),new B({text:W,size:18,font:"Arial"})]})),i.options.showVerbs&&ue.push(ne(`Verbes : ${i.verbs.map(U=>U.infinitif).join(", ")}`,{bold:!0,size:19})),i.options.showTenses&&ue.push(ne(`${t("Temps :")} ${i.tenses.map(U=>a(U.name)).join(", ")}`,{bold:!0,size:19})),i.exerciseKind==="tense-identification"&&ue.push(new fe({spacing:{before:160,after:160},border:{top:{style:m.SINGLE,size:4,color:"777777"},bottom:{style:m.SINGLE,size:4,color:"777777"},left:{style:m.SINGLE,size:4,color:"777777"},right:{style:m.SINGLE,size:4,color:"777777"}},children:[new B({text:_a,size:19,font:"Arial"})]})),ue.push(new at({width:{size:me,type:de.DXA},columnWidths:[480,3900,5595],layout:J.FIXED,borders:it.NONE,rows:i.questions.map((U,te)=>{const ve=Ze(U,i.exerciseKind);return new G({cantSplit:!0,height:{value:Math.round((5+d.value)*56.7),rule:E.ATLEAST},children:[ae([ne(`${te+1}.`,{size:21})],480,{margins:{top:70,bottom:70,left:0,right:40}}),ae([ne(q(ve.label),{size:21})],3900),ae(Ut(U),5595)]})})}));const Re=[new fe({spacing:{before:0,after:260},children:[new B({text:t("CORRIGÉ"),bold:!0,size:34,font:"Arial"}),new B({text:W,size:18,font:"Arial"})]}),new at({width:{size:me,type:de.DXA},columnWidths:[480,5100,4395],layout:J.FIXED,borders:it.NONE,rows:i.questions.map((U,te)=>new G({cantSplit:!0,height:{value:460,rule:E.ATLEAST},children:[ae([ne(`${te+1}.`,{size:19})],480,{borders:Me,margins:{top:55,bottom:55,left:0,right:40}}),ae([ne(q(Qt(U,i.exerciseKind)),{size:19})],5100,{borders:Me,margins:{top:55,bottom:55,left:70,right:70}}),ae(_n(U).map(ve=>ne(Te(ve),{bold:!0,size:19})),4395,{borders:Me,margins:{top:55,bottom:55,left:70,right:70}})]}))})],Be=new h({styles:{default:{document:{run:{font:"Arial",size:21},paragraph:{spacing:pe}}}},sections:[{properties:{page:{margin:oe},titlePage:!0},headers:{first:xe,default:$e(`${ee}${W}`)},footers:{first:ge,default:ge},children:ue},{properties:{page:{margin:oe},type:bt.NEXT_PAGE},headers:{default:$e(`${ee} — corrigé${W}`)},footers:{default:ge},children:Re}]}),yt=await Se.toBlob(Be),Nn=URL.createObjectURL(yt),ot=document.createElement("a"),Ri=ee.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"");ot.href=Nn,ot.download=`${Ri||"defi-conjugaison"}.docx`,document.body.appendChild(ot),ot.click(),l("word_downloaded",{exerciseKind:i.exerciseKind}),ot.remove(),URL.revokeObjectURL(Nn)}catch{l("feature_failed",{feature:"download.word"})}finally{w.value=!1}}}return(T,m)=>(k(),kn(Sa,{to:"body"},[r("div",df,[r("div",mf,[r("div",null,[r("strong",pf,c(o(t)("Aperçu avant impression")),1)]),r("div",null,[r("button",{class:"secondary-button",type:"button",onClick:m[0]||(m[0]=h=>s("close"))},c(o(t)("Fermer")),1),r("button",{class:"secondary-button",type:"button",disabled:o(w),onClick:D},c(o(w)?"Création du fichier Word…":"Télécharger au format Word"),9,gf),r("button",{class:"primary-button",type:"button",disabled:o(p),onClick:De},c(o(p)?"Création du PDF…":"Télécharger le PDF"),9,vf)])]),r("div",bf,[r("aside",hf,[r("div",yf,[r("p",null,c(o(t)("Personnalisation")),1),r("h2",xf,c(o(t)("Options de la fiche")),1),r("span",null,c(o(t)("Les changements apparaissent immédiatement dans l’aperçu.")),1)]),r("label",_f,[r("span",null,c(o(t)("Titre de la fiche")),1),r("input",{id:"preview-print-title",type:"text",value:e.options.title,onInput:m[1]||(m[1]=h=>R("title",h.target.value))},null,40,wf)]),r("fieldset",kf,[r("legend",null,c(o(t)("Mise en page")),1),r("label",Sf,[r("span",null,c(o(t)("Espace avant le titre")),1),r("span",null,[r("input",{id:"preview-title-spacing",type:"number",min:"8",max:"30",step:"1",value:o(P),onInput:m[2]||(m[2]=h=>R("titleSpacingMm",Number(h.target.value)))},null,40,$f),m[12]||(m[12]=se(" mm ",-1))])]),r("label",Pf,[r("span",null,c(o(t)("Espacement entre les questions")),1),r("span",null,[r("input",{id:"preview-question-spacing",type:"number",min:"2",max:"15",step:"0.5",value:o(d),onInput:m[3]||(m[3]=h=>R("questionSpacingMm",Number(h.target.value)))},null,40,Cf),m[13]||(m[13]=se(" mm ",-1))])])]),r("fieldset",If,[r("legend",null,c(o(t)("Informations de l’élève")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showFirstName,onChange:m[4]||(m[4]=h=>R("showFirstName",h.target.checked))},null,40,Af),r("span",null,c(o(t)("Prénom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showLastName,onChange:m[5]||(m[5]=h=>R("showLastName",h.target.checked))},null,40,Tf),r("span",null,c(o(t)("Nom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showDate,onChange:m[6]||(m[6]=h=>R("showDate",h.target.checked))},null,40,Of),r("span",null,c(o(t)("Date")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showGrade,onChange:m[7]||(m[7]=h=>R("showGrade",h.target.checked))},null,40,jf),r("span",null,c(o(t)("Espace pour la note")),1)])]),r("fieldset",zf,[r("legend",null,c(o(t)("Contenu affiché")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showVerbs,onChange:m[8]||(m[8]=h=>R("showVerbs",h.target.checked))},null,40,Ef),r("span",null,c(o(t)("Liste des verbes")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showTenses,onChange:m[9]||(m[9]=h=>R("showTenses",h.target.checked))},null,40,Ff),r("span",null,c(o(t)("Liste des temps")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showRandomNumber,onChange:m[10]||(m[10]=h=>R("showRandomNumber",h.target.checked))},null,40,Nf),r("span",null,c(o(t)("Numéro questionnaire/corrigé")),1)])])]),r("main",Lf,[o(A)?(k(),$("iframe",{key:0,class:"pdf-preview-frame",src:`${o(A)}#view=FitH&toolbar=1&navpanes=0`,title:o(t)("Aperçu exact de la fiche PDF et de son corrigé"),onLoad:m[11]||(m[11]=h=>O.value=!0)},null,40,Df)):M("",!0),!o(S)&&(o(_)||!o(O))?(k(),$("div",Mf,[m[14]||(m[14]=r("span",{class:"pdf-preview-spinner","aria-hidden":"true"},null,-1)),r("strong",null,c(o(t)("Création de l’aperçu PDF…")),1),r("span",null,c(o(t)("La fiche et le corrigé sont mis en page.")),1)])):M("",!0),o(S)?(k(),$("div",Rf,[r("strong",null,c(o(S)),1),r("button",{class:"secondary-button",type:"button",onClick:je},c(o(t)("Réessayer")),1)])):M("",!0)])])],512)]))}}),Cm=Object.assign(Bf,{__name:"ChallengePrintPreview"}),Wf=rr("/images/recharger-defi.svg?v=dynamic-code"),Uf={ref:"share-dialog",class:"app-dialog share-dialog","data-tour":"share-dialog",role:"dialog","aria-modal":"true","aria-labelledby":"share-title",tabindex:"-1"},Vf=["aria-label"],Kf={class:"dialog-kicker"},Gf={id:"share-title"},Hf={for:"share-challenge-title"},qf=["readonly","aria-invalid","aria-describedby"],Xf=["disabled"],Yf={for:"share-challenge-description"},Qf=["readonly","aria-describedby"],Jf={id:"share-description-help",class:"share-title-form__description-help"},Zf={key:0,id:"share-title-error",class:"form-error",role:"alert"},ed={key:0},td={key:1,class:"share-methods"},nd={class:"share-method","aria-labelledby":"share-code-title"},ad={id:"share-code-title"},id={class:"share-method__tip"},rd={class:"share-value"},od={for:"share-code"},sd=["value"],ld={class:"share-help"},ud={type:"button",class:"share-help__trigger","aria-describedby":"reload-help-tooltip"},cd={id:"reload-help-tooltip",class:"share-help__tooltip",role:"tooltip"},fd={class:"share-help__preview"},dd=["alt"],md={"aria-hidden":"true"},pd={class:"share-method","aria-labelledby":"share-link-title"},gd={id:"share-link-title"},vd={class:"share-method__tip"},bd={class:"share-value"},hd={for:"share-url"},yd=["value"],xd={class:"copy-status","aria-live":"polite"},_d=Le({__name:"ShareChallengeDialog",props:{code:{},url:{},busy:{type:Boolean},error:{},initialTitle:{},initialDescription:{}},emits:["close","save"],setup(e,{emit:n}){const{ui:t,localePath:a}=He(),i=e,s=n,l=Q(""),u=Q(i.initialTitle?.trim()||t("Défi de conjugaison")),f=Q(i.initialDescription?.trim()||""),p=Tt("close-button"),w=Tt("share-dialog"),_=F(()=>u.value.trim()),O=F(()=>f.value.trim()),A=F(()=>_.value.length>=1&&_.value.length<=80);Pa(w,()=>s("close"),p);async function S(b,d){try{await navigator.clipboard.writeText(b),l.value=`${d} copié.`}catch{l.value=`Sélectionnez puis copiez le ${d.toLocaleLowerCase("fr")}.`}}function v(){try{sessionStorage.setItem("highlight-home-challenge-loader","1")}catch{}}function I(){i.code||i.busy||!A.value||s("save",_.value,O.value)}return(b,d)=>{const P=ur;return k(),kn(Sa,{to:"body"},[r("div",{class:"dialog-backdrop",onClick:d[8]||(d[8]=At(C=>s("close"),["self"]))},[r("section",Uf,[r("button",{ref:"close-button",class:"dialog-close",type:"button","aria-label":o(t)("Fermer"),onClick:d[0]||(d[0]=C=>s("close"))}," × ",8,Vf),r("p",Kf,c(e.code?o(t)("Défi sauvegardé"):o(t)("Défi prêt à être partagé")),1),r("h2",Gf,c(o(t)("Votre défi est prêt à être partagé")),1),r("form",{class:"share-title-form",onSubmit:At(I,["prevent"])},[r("label",Hf,c(o(t)("Titre du défi")),1),r("div",null,[Zt(r("input",{id:"share-challenge-title","onUpdate:modelValue":d[1]||(d[1]=C=>tn(u)?u.value=C:null),type:"text",maxlength:"80",readonly:!!e.code,"aria-invalid":!o(A),"aria-describedby":e.error?"share-title-error":void 0,required:"",autofocus:""},null,8,qf),[[en,o(u)]]),e.code?M("",!0):(k(),$("button",{key:0,class:"primary-button",type:"submit",disabled:e.busy||!o(A)},c(e.busy?o(t)("Création…"):o(t)("Créer le code")),9,Xf))]),r("small",null,c(o(_).length)+"/80",1),r("label",Yf,c(o(t)("Description du défi")),1),Zt(r("textarea",{id:"share-challenge-description","onUpdate:modelValue":d[2]||(d[2]=C=>tn(f)?f.value=C:null),rows:"4",maxlength:"1000",readonly:!!e.code,"aria-describedby":e.error?"share-title-error share-description-help":"share-description-help"},null,8,Qf),[[en,o(f)]]),r("small",Jf,c(o(t)("Facultatif : une description à l’attention des personnes qui découvriront ce défi"))+" · "+c(o(O).length)+"/1000 ",1),e.error?(k(),$("p",Zf,c(e.error),1)):M("",!0)],32),e.code?(k(),$("p",ed,c(o(t)("Deux possibilités permettent à vos élèves de retrouver ce défi.")),1)):M("",!0),e.code?(k(),$("div",td,[r("section",nd,[r("header",null,[d[9]||(d[9]=r("span",{class:"share-method__number","aria-hidden":"true"},"1",-1)),r("div",null,[r("h3",ad,c(o(t)("Sauvegarder le code")),1),r("p",null,c(o(t)("L’élève conserve ce code. Plus tard, il le copie sur la page d’accueil pour retrouver ce défi.")),1),r("p",id,c(o(t)("Idéal pour transmettre le défi par écrit")),1)])]),r("div",rd,[r("label",od,c(o(t)("Code à conserver")),1),r("div",null,[r("input",{id:"share-code",value:e.code,readonly:"",onFocus:d[3]||(d[3]=C=>C.target.select())},null,40,sd),r("button",{type:"button",onClick:d[4]||(d[4]=C=>S(e.code,"Code"))},c(o(t)("Copier")),1)]),r("div",ld,[r("button",ud,c(o(t)("Comment le recharger plus tard ?")),1),r("div",cd,[r("div",fd,[r("img",{src:Wf,alt:o(t)("Emplacement du code reçu sur la page d’accueil")},null,8,dd),r("span",md,c(e.code),1)]),r("p",null,[d[10]||(d[10]=se("Tes élèves colleront le code à cet endroit dans la ",-1)),Ue(P,{to:o(a)("/"),onClick:v},{default:Ve(()=>[se(c(o(t)("page d’accueil")),1)]),_:1},8,["to"])])])])])]),r("section",pd,[r("header",null,[d[11]||(d[11]=r("span",{class:"share-method__number","aria-hidden":"true"},"2",-1)),r("div",null,[r("h3",gd,c(o(t)("Envoyer le lien direct")),1),r("p",null,c(o(t)("L’élève clique simplement sur ce lien : il arrive directement sur le défi, sans saisir le code.")),1),r("p",vd,c(o(t)("Idéal pour transmettre le défi par email")),1)])]),r("div",bd,[r("label",hd,c(o(t)("Lien à envoyer")),1),r("div",null,[r("input",{id:"share-url",value:e.url,readonly:"",onFocus:d[5]||(d[5]=C=>C.target.select())},null,40,yd),r("button",{type:"button",onClick:d[6]||(d[6]=C=>S(e.url,"Lien"))},c(o(t)("Copier")),1)])])])])):M("",!0),e.code?(k(),$(Y,{key:2},[r("p",xd,c(o(l)),1),r("button",{class:"primary-button",type:"button",onClick:d[7]||(d[7]=C=>s("close"))},c(o(t)("Terminé")),1)],64)):M("",!0)],512)])])}}}),Im=Object.assign(_d,{__name:"ChallengeShareChallengeDialog"}),wd={class:"builder-card tense-picker","aria-labelledby":"tenses-title"},kd={class:"builder-card__header"},Sd={class:"builder-card__eyebrow"},$d={id:"tenses-title"},Pd=["aria-label"],Cd={class:"selection-toolbar"},Id={class:"tense-groups"},Ad=["aria-labelledby"],Td=["id"],Od={class:"tense-group__items"},jd={class:"tense-row"},zd={class:"tense-info"},Ed=["aria-label","aria-describedby"],Fd=["id"],Nd={class:"switch-row"},Ld=["checked","onChange"],Dd={key:0,class:"tense-group__trailing"},Md={class:"tense-row"},Rd={class:"tense-info"},Bd=["aria-label","aria-describedby"],Wd=["id"],Ud={class:"switch-row"},Vd=["checked","onChange"],Kd=Le({__name:"TensePicker",props:{modes:{},tenses:{},verbs:{},selectedIds:{}},emits:["toggle","selectAll","clear"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=He(),i=e,s=n,l=F(()=>new Set(i.selectedIds)),u=Q({}),f=Q(!1),p=F(()=>{const S=i.verbs.filter(v=>v.complementExample?.functionObject==="cod");return S.length?S:i.verbs}),w=F(()=>`${p.value.map(S=>S.id).join(",")}|${i.tenses.map(S=>S.id).join(",")}`),_=F(()=>i.modes.map(S=>{const v=i.tenses.filter(d=>d.modeId===S.id).sort((d,P)=>Dn(S.name,d.name)-Dn(S.name,P.name)||d.id-P.id),I=v.filter(d=>Mn(d)),b=v.filter(d=>!Mn(d));return{mode:S,tenses:v,columns:[b.filter(d=>!d.isCompound),b.filter(d=>d.isCompound)].filter(d=>d.length>0),trailingTenses:I}}).filter(S=>S.tenses.length>0));let O=0;async function A(){const S=++O;if(u.value={},!(!p.value.length||!i.tenses.length)){f.value=!0;try{const v=await $fetch("/api/tense-examples",{method:"POST",body:{verbIds:p.value.map(I=>I.id),tenseIds:i.tenses.map(I=>I.id)}});S===O&&(u.value=v.examples)}catch{S===O&&(u.value={})}finally{S===O&&(f.value=!1)}}}return mt(A),Pe(w,()=>{A()}),(S,v)=>(k(),$("section",wd,[r("div",kd,[r("div",null,[r("p",Sd,c(o(t)("Étape 2")),1),r("h2",$d,c(o(t)("Mes temps")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} temps sélectionnés`},c(e.selectedIds.length),9,Pd)]),r("div",Cd,[r("button",{class:"text-button",type:"button",onClick:v[0]||(v[0]=I=>s("selectAll"))},c(o(t)("Tout cocher")),1),r("button",{class:"text-button text-button--danger",type:"button",onClick:v[1]||(v[1]=I=>s("clear"))},c(o(t)("Tout décocher")),1)]),r("div",Id,[(k(!0),$(Y,null,ie(o(_),I=>(k(),$("section",{key:I.mode.id,class:"tense-group",role:"group","aria-labelledby":`tense-mode-${I.mode.id}`},[r("h3",{id:`tense-mode-${I.mode.id}`,class:"tense-group__title"},c(o(a)(I.mode.name)),9,Td),r("div",{class:be(["tense-group__columns",{"tense-group__columns--single":I.columns.length===1}])},[(k(!0),$(Y,null,ie(I.columns,(b,d)=>(k(),$("div",{key:d,class:"tense-group__column"},[r("div",Od,[(k(!0),$(Y,null,ie(b,P=>(k(),$("div",{key:P.id,class:"tense-entry"},[r("div",jd,[r("span",zd,[r("button",{type:"button","aria-label":`${o(t)("Voir un exemple :")} ${o(a)(P.name)}`,"aria-describedby":`tense-example-${P.id}`},"i",8,Ed),r("span",{id:`tense-example-${P.id}`,class:"tense-tooltip",role:"tooltip"},[o(u)[P.id]?(k(),$(Y,{key:0},[se(c(o(t)("Exemple:"))+" ",1),r("strong",null,c(o(u)[P.id].emphasis),1),o(u)[P.id].rest?(k(),$(Y,{key:0},[se(c(o(u)[P.id].rest),1)],64)):M("",!0)],64)):(k(),$(Y,{key:1},[se(c(o(f)?o(t)("Chargement…"):o(t)("Exemple momentanément indisponible.")),1)],64))],8,Fd)]),r("label",Nd,[r("input",{type:"checkbox",checked:o(l).has(P.id),onChange:C=>s("toggle",P.id)},null,40,Ld),v[2]||(v[2]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,c(o(a)(P.name)),1)])])]))),128))])]))),128))],2),I.trailingTenses.length?(k(),$("div",Dd,[(k(!0),$(Y,null,ie(I.trailingTenses,b=>(k(),$("div",{key:b.id,class:"tense-entry"},[r("div",Md,[r("span",Rd,[r("button",{type:"button","aria-label":`${o(t)("Voir un exemple :")} ${o(a)(b.name)}`,"aria-describedby":`tense-example-${b.id}`},"i",8,Bd),r("span",{id:`tense-example-${b.id}`,class:"tense-tooltip",role:"tooltip"},[o(u)[b.id]?(k(),$(Y,{key:0},[se(c(o(t)("Exemple:"))+" ",1),r("strong",null,c(o(u)[b.id].emphasis),1),o(u)[b.id].rest?(k(),$(Y,{key:0},[se(c(o(u)[b.id].rest),1)],64)):M("",!0)],64)):(k(),$(Y,{key:1},[se(c(o(f)?o(t)("Chargement…"):o(t)("Exemple momentanément indisponible.")),1)],64))],8,Wd)]),r("label",Ud,[r("input",{type:"checkbox",checked:o(l).has(b.id),onChange:d=>s("toggle",b.id)},null,40,Vd),v[3]||(v[3]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,c(o(a)(b.name)),1)])])]))),128))])):M("",!0)],8,Ad))),128))])]))}}),Am=Object.assign(Ft(Kd,[["__scopeId","data-v-ee3658cb"]]),{__name:"ChallengeTensePicker"}),Gd={class:"builder-card verb-picker","aria-labelledby":"verbs-title"},Hd={class:"builder-card__header"},qd={class:"builder-card__eyebrow"},Xd={id:"verbs-title"},Yd=["aria-label"],Qd={class:"verb-search"},Jd={for:"verb-search-input"},Zd={class:"verb-search__control"},em=["placeholder","aria-expanded","onKeydown"],tm=["disabled","aria-label"],nm=["aria-label"],am=["onClick"],im={key:0},rm={key:1},om={key:1,class:"field-hint","aria-live":"polite"},sm={class:"selection-toolbar"},lm=["aria-label","onClick"],um=Le({__name:"VerbPicker",props:{verbs:{},selectedIds:{}},emits:["add","remove","clear"],setup(e,{emit:n}){const{ui:t}=He(),a=e,i=n,s=Q(""),l=Tt("verb-input"),u=F(()=>new Set(a.selectedIds)),f=F(()=>{const S=new Map(a.verbs.map(v=>[v.id,v]));return a.selectedIds.map(v=>S.get(v)).filter(v=>!!v)}),p=F(()=>{const S=f.value.length;return S<=3?1.35:Math.max(1,1.35-(S-3)/20)}),w=F(()=>{const S=p.value,v=1+(S-1)*.55;return{"--selected-chip-gap":`${7*S}px`,"--selected-chip-inner-gap":`${6*S}px`,"--selected-chip-padding-block":`${7*S}px`,"--selected-chip-padding-end":`${8*S}px`,"--selected-chip-padding-start":`${11*S}px`,"--selected-chip-font-size":`${.87*S}rem`,"--selected-chip-button-size":`${21*S}px`,"--selected-chip-button-font-size":`${S}rem`,"--selected-chip-mobile-gap":`${7*v}px`,"--selected-chip-mobile-inner-gap":`${6*v}px`,"--selected-chip-mobile-padding-block":`${7*v}px`,"--selected-chip-mobile-padding-end":`${8*v}px`,"--selected-chip-mobile-padding-start":`${11*v}px`,"--selected-chip-mobile-font-size":`${.87*v}rem`,"--selected-chip-mobile-button-size":`${21*v}px`,"--selected-chip-mobile-button-font-size":`${v}rem`}}),_=F(()=>cr(s.value)?fr(a.verbs.filter(v=>!u.value.has(v.id)),s.value).slice(0,8):[]);function O(S){i("add",S.id),s.value="",Jt(()=>l.value?.focus())}function A(){const S=_.value[0];S&&O(S)}return(S,v)=>(k(),$("section",Gd,[r("div",Hd,[r("div",null,[r("p",qd,c(o(t)("Étape 1")),1),r("h2",Xd,c(o(t)("Mes verbes")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} verbes sélectionnés`},c(e.selectedIds.length),9,Yd)]),r("div",Qd,[r("label",Jd,c(o(t)("Ajouter un verbe")),1),r("div",Zd,[Zt(r("input",{id:"verb-search-input",ref:"verb-input","onUpdate:modelValue":v[0]||(v[0]=I=>tn(s)?s.value=I:null),type:"search",autocomplete:"off",placeholder:o(t)("Ex. aller, être, finir…"),"aria-expanded":o(_).length>0,"aria-controls":"verb-suggestions",onKeydown:or(At(A,["prevent"]),["enter"])},null,40,em),[[en,o(s)]]),r("button",{class:"icon-button icon-button--add",type:"button",disabled:o(_).length===0,"aria-label":o(t)("Ajouter le premier verbe proposé"),onClick:A}," + ",8,tm)]),o(_).length>0?(k(),$("ul",{key:0,id:"verb-suggestions",class:"verb-suggestions",role:"listbox","aria-label":o(t)("Verbes proposés")},[(k(!0),$(Y,null,ie(o(_),I=>(k(),$("li",{key:I.id,role:"option"},[r("button",{type:"button",onClick:b=>O(I)},[r("strong",null,c(I.infinitif),1),I.isPronominalForm&&I.baseVerbId?(k(),$("span",im,c(o(t)("forme pronominale générée")),1)):I.auxiliaire?(k(),$("span",rm,c(o(t)("auxiliaire"))+" "+c(I.auxiliaire),1)):M("",!0)],8,am)]))),128))],8,nm)):o(s)?(k(),$("p",om," Aucun nouveau verbe ne commence par « "+c(o(s))+" ». ",1)):M("",!0)]),r("div",sm,[r("p",null,c(o(f).length?o(t)("Verbes retenus"):o(t)("Aucun verbe sélectionné")),1),o(f).length?(k(),$("button",{key:0,class:"text-button text-button--danger",type:"button",onClick:v[1]||(v[1]=I=>i("clear"))},c(o(t)("Tout supprimer")),1)):M("",!0)]),o(f).length?(k(),kn(sr,{key:0,tag:"ul",name:"verb-chip",class:"selected-chips selected-chips--adaptive",style:lr(o(w)),"aria-label":o(t)("Verbes sélectionnés")},{default:Ve(()=>[(k(!0),$(Y,null,ie(o(f),I=>(k(),$("li",{key:I.id},[r("span",null,c(I.infinitif),1),r("button",{type:"button","aria-label":o(t)("Retirer le verbe {verb}",{verb:I.infinitif}),onClick:b=>i("remove",I.id)},"×",8,lm)]))),128))]),_:1},8,["style","aria-label"])):M("",!0)]))}}),Tm=Object.assign(Ft(um,[["__scopeId","data-v-f03191bf"]]),{__name:"ChallengeVerbPicker"});function Om(e){return new URL(globalThis.location.href)}export{$m as C,Pm as P,Im as S,Am as T,Tm as V,Om as a,Sm as b,Cm as c,km as d,dr as e,_m as f,gr as g,xm as h,mr as l,br as n,wm as u};
