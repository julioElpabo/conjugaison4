const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./BF4OoX5C.js","./kt2RgFmm.js","./entry.CRRjxRjR.css"])))=>i.map(i=>d[i]);
import{a as Oa,c as fr}from"./BeHZwg2h.js";import{u as bt}from"./DpBSGpeX.js";import{p as z,e as Ve,f as Le,ab as jt,q as et,M as kt,c as S,a as r,t as f,h as s,N as dr,b as qe,o as x,l as Y,y as In,n as ke,d as pe,i as M,W as yt,w as Qe,E as Mt,F as H,r as ve,j as Dt,g as An,T as za,aa as Un,z as Rt,ac as mr,k as sn,v as ln,D as un,C as pr,a9 as gr,J as vr}from"./kt2RgFmm.js";import{_ as Kt}from"./DlAUqK2U.js";import{u as ja}from"./Dn1uPlMm.js";import{u as Fa}from"./CUJ-12nG.js";import{_ as br}from"./CUqlu7Wi.js";import{b as Vn}from"./CgdsjPvq.js";import{i as Kn}from"./JVwMG1-O.js";import{n as hr,m as yr}from"./g6ucs01C.js";const Ea=["cod-after","coi-after"];function xr(e,n){return e?n==="before"?["cod-before"]:n==="mixed"?["cod-after","cod-before","coi-after"]:[...Ea]:[]}function wr(e){const n=e.some(a=>a.endsWith("-before")),t=e.some(a=>a.endsWith("-after"));return{includeComplements:e.length>0,complementPlacement:n&&t?"mixed":n?"before":"after"}}function zm(e){return[e.groupLabel||Oa[e.group]||e.group,e.label].filter(Boolean).join(" | ")}function jm(e){return Number.isInteger(e)&&Number(e)>0?`${Number(e)} au hasard`:"Tous les verbes"}const Gn={exerciseKind:"conjugation",identificationSource:"selected-verbs",literaryRegister:"all",pastSimplePronouns:"all",inclusivePronouns:!1,includeOnPronoun:!1,includeComplements:!0,complementPlacement:"after",complementOptions:[...Ea]},_r=()=>({title:"Défi de conjugaison",questionSpacingMm:8,titleSpacingMm:30,showGrade:!0,showVerbs:!1,showTenses:!1,showFirstName:!0,showLastName:!0,showDate:!0,showRandomNumber:!0}),Hn=()=>({verbIds:[1,2,3,4],tenseIds:[1,3,4,5],questionCount:10,...Gn,complementOptions:[...Gn.complementOptions],printOptions:_r()});function Fm(){const e=bt("challenge-catalogue",()=>({verbes:[],modes:[],temps:[],presets:[]})),n=bt("challenge-config",Hn),t=bt("challenge-catalogue-status",()=>"idle"),a=bt("challenge-catalogue-error",()=>""),i=z(()=>{const m=new Map(e.value.verbes.map(C=>[C.id,C]));return n.value.verbIds.map(C=>m.get(C)).filter(C=>!!C)}),l=z(()=>{const m=new Map(e.value.temps.map(y=>[y.id,y])),C=new Map(e.value.modes.map(y=>[y.id,y]));return n.value.tenseIds.map(y=>m.get(y)).filter(y=>!!y).map(y=>({...y,mode:y.mode||C.get(y.modeId)}))}),u=z(()=>n.value.verbIds.length>0&&n.value.tenseIds.length>0&&n.value.questionCount>0);function c(){const m=e.value.modes.find(y=>y.name.toLocaleLowerCase("fr")==="indicatif");if(!m)return[1,3,4,5];const C=new Set(["présent","futur proche","imparfait","passé composé","futur","futur simple"]);return e.value.temps.filter(y=>y.modeId===m.id&&C.has(y.name.toLocaleLowerCase("fr"))).map(y=>y.id)}async function d(m=!1){const C=e.value.temps.length>0&&e.value.temps.every(y=>!!y.example?.trim());if(!m&&t.value==="success"&&C)return e.value;t.value="loading",a.value="";try{const y=await $fetch("/api/catalogue");e.value={verbes:[...y.verbes].sort((D,ne)=>D.infinitif.localeCompare(ne.infinitif,"fr")),modes:[...y.modes].sort((D,ne)=>D.order-ne.order||D.id-ne.id),temps:[...y.temps],presets:[...y.presets]};const F=new Set(e.value.verbes.map(D=>D.id)),te=new Set(e.value.temps.map(D=>D.id)),Z=c();return n.value.verbIds=n.value.verbIds.filter(D=>F.has(D)),n.value.tenseIds=n.value.tenseIds.filter(D=>te.has(D)),n.value.verbIds.length===0&&(n.value.verbIds=e.value.verbes.slice(0,4).map(D=>D.id)),n.value.tenseIds.length===0&&(n.value.tenseIds=Z.length>0?Z:e.value.temps.slice(0,1).map(D=>D.id)),t.value="success",e.value}catch(y){throw t.value="error",a.value=kr(y,"Impossible de charger le catalogue."),y}}function v(m){n.value.verbIds.includes(m)||(n.value.verbIds=[...n.value.verbIds,m])}function k(m){n.value.verbIds=n.value.verbIds.filter(C=>C!==m)}function _(){n.value.verbIds=[]}function A(m){n.value.tenseIds=n.value.tenseIds.includes(m)?n.value.tenseIds.filter(C=>C!==m):[...n.value.tenseIds,m]}function I(){n.value.tenseIds=e.value.temps.map(m=>m.id)}function $(){n.value.tenseIds=[]}function b(){n.value.tenseIds=c()}function P(m){const C=new Set(e.value.verbes.map(F=>F.id)),y=new Set(e.value.temps.map(F=>F.id));n.value={...n.value,verbIds:m.verbIds.filter(F=>C.has(F)),tenseIds:m.tenseIds.filter(F=>y.has(F)),questionCount:m.questionCount}}function h(m){const C=Hn();P(m);const y=m.complementOptions??(m.includeComplements===void 0?[...C.complementOptions]:xr(m.includeComplements,m.complementPlacement??"after")),F=wr(y);n.value={...n.value,exerciseKind:m.exerciseKind??C.exerciseKind,identificationSource:m.identificationSource??C.identificationSource,literaryRegister:m.literaryRegister??C.literaryRegister,pastSimplePronouns:m.pastSimplePronouns??C.pastSimplePronouns,inclusivePronouns:m.inclusivePronouns??C.inclusivePronouns,includeOnPronoun:m.includeOnPronoun??C.includeOnPronoun,includeComplements:F.includeComplements,complementPlacement:F.complementPlacement,complementOptions:y,printOptions:{...C.printOptions,...m.printOptions??{}}}}return{catalogue:e,challenge:n,catalogueStatus:t,catalogueError:a,selectedVerbs:i,selectedTenses:l,isReady:u,loadCatalogue:d,addVerb:v,removeVerb:k,clearVerbs:_,toggleTense:A,selectAllTenses:I,clearTenses:$,selectDefaultTenses:b,applySelection:P,applySharedChallenge:h}}function kr(e,n="Une erreur est survenue."){if(e&&typeof e=="object"){const t=e;return t.data?.statusMessage||t.data?.message||t.statusMessage||t.message||n}return n}function Sr(e){return{verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,identificationSource:e.identificationSource??"selected-verbs",literaryRegister:e.literaryRegister??"all",pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeOnPronoun:e.includeOnPronoun,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions]}}function $r(e){const n=e.toUpperCase().replace(/[^A-Z0-9]/g,"");return n.length===8?n.match(/.{1,2}/g)?.join("-")??n:e.trim().toUpperCase()}function Cr(e,n,t){return{version:1,...n===void 0?{}:{title:n.trim()},...t?.trim()?{description:t.trim()}:{},verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,identificationSource:e.identificationSource??"selected-verbs",literaryRegister:e.literaryRegister??"all",pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeOnPronoun:e.includeOnPronoun,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions],printOptions:{...e.printOptions}}}function Em(){async function e(a){return await $fetch("/api/questionnaires",{method:"POST",body:Sr(a)})}async function n(a,i,l=""){return await $fetch("/api/defis",{method:"POST",body:Cr(a,i,l)})}async function t(a){const i=$r(a);return await $fetch(`/api/defis/${encodeURIComponent(i)}`)}return{generateQuestions:e,saveChallenge:n,loadChallenge:t}}function cn(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function Pr(e){if(Array.isArray(e))return e}function Ir(e){if(Array.isArray(e))return cn(e)}function Ar(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function Tr(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,La(a.key),a)}}function Or(e,n,t){return n&&Tr(e.prototype,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function Ft(e,n){var t=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=Tn(e))||n){t&&(e=t);var a=0,i=function(){};return{s:i,n:function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}},e:function(d){throw d},f:i}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var l,u=!0,c=!1;return{s:function(){t=t.call(e)},n:function(){var d=t.next();return u=d.done,d},e:function(d){c=!0,l=d},f:function(){try{u||t.return==null||t.return()}finally{if(c)throw l}}}}function O(e,n,t){return(n=La(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function zr(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function jr(e,n){var t=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(t!=null){var a,i,l,u,c=[],d=!0,v=!1;try{if(l=(t=t.call(e)).next,n===0){if(Object(t)!==t)return;d=!1}else for(;!(d=(a=l.call(t)).done)&&(c.push(a.value),c.length!==n);d=!0);}catch(k){v=!0,i=k}finally{try{if(!d&&t.return!=null&&(u=t.return(),Object(u)!==u))return}finally{if(v)throw i}}return c}}function Fr(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Er(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Yn(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function w(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?Yn(Object(t),!0).forEach(function(a){O(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Yn(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function Gt(e,n){return Pr(e)||jr(e,n)||Tn(e,n)||Fr()}function $e(e){return Ir(e)||zr(e)||Tn(e)||Er()}function Lr(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function La(e){var n=Lr(e,"string");return typeof n=="symbol"?n:n+""}function Bt(e){"@babel/helpers - typeof";return Bt=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Bt(e)}function Tn(e,n){if(e){if(typeof e=="string")return cn(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?cn(e,n):void 0}}var Xn=function(){},On={},Na={},Ma=null,Da={mark:Xn,measure:Xn};try{typeof window<"u"&&(On=window),typeof document<"u"&&(Na=document),typeof MutationObserver<"u"&&(Ma=MutationObserver),typeof performance<"u"&&(Da=performance)}catch{}var Nr=On.navigator||{},qn=Nr.userAgent,Qn=qn===void 0?"":qn,Be=On,X=Na,Jn=Ma,At=Da;Be.document;var De=!!X.documentElement&&!!X.head&&typeof X.addEventListener=="function"&&typeof X.createElement=="function",Ra=~Qn.indexOf("MSIE")||~Qn.indexOf("Trident/"),Tt,Mr=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|gt|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt|sldr|slpdr|pr|ms|vs)?[\-\ ]/,Dr=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Graphite|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Slab Duo|Slab Press Duo|Pixel|Mosaic|Vellum|Whiteboard)?.*/i,Ba={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},"slab-duo":{"fa-regular":"regular",fasldr:"regular"},"slab-press-duo":{"fa-regular":"regular",faslpdr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},vellum:{"fa-solid":"solid",favs:"solid"},pixel:{"fa-regular":"regular",fapr:"regular"},mosaic:{"fa-solid":"solid",fams:"solid"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},graphite:{"fa-thin":"thin",fagt:"thin"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},Rr={GROUP:"duotone-group",PRIMARY:"primary",SECONDARY:"secondary"},Wa=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],fe="classic",St="duotone",Ua="sharp",Va="sharp-duotone",Ka="chisel",Ga="etch",Ha="graphite",Ya="jelly",Xa="jelly-duo",qa="jelly-fill",Qa="mosaic",Ja="notdog",Za="notdog-duo",ei="pixel",ti="slab",ni="slab-duo",ai="slab-press",ii="slab-press-duo",ri="thumbprint",oi="utility",si="utility-duo",li="utility-fill",ui="vellum",ci="whiteboard",Br="Classic",Wr="Duotone",Ur="Sharp",Vr="Sharp Duotone",Kr="Chisel",Gr="Etch",Hr="Graphite",Yr="Jelly",Xr="Jelly Duo",qr="Jelly Fill",Qr="Mosaic",Jr="Notdog",Zr="Notdog Duo",eo="Pixel",to="Slab",no="Slab Duo",ao="Slab Press",io="Slab Press Duo",ro="Thumbprint",oo="Utility",so="Utility Duo",lo="Utility Fill",uo="Vellum",co="Whiteboard",fi=[fe,St,Ua,Va,Ka,Ga,Ha,Ya,Xa,qa,Qa,Ja,Za,ei,ti,ni,ai,ii,ri,oi,si,li,ui,ci];Tt={},O(O(O(O(O(O(O(O(O(O(Tt,fe,Br),St,Wr),Ua,Ur),Va,Vr),Ka,Kr),Ga,Gr),Ha,Hr),Ya,Yr),Xa,Xr),qa,qr),O(O(O(O(O(O(O(O(O(O(Tt,Qa,Qr),Ja,Jr),Za,Zr),ei,eo),ti,to),ni,no),ai,ao),ii,io),ri,ro),oi,oo),O(O(O(O(Tt,si,so),li,lo),ui,uo),ci,co);var fo={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},"slab-duo":{400:"fasldr"},"slab-press-duo":{400:"faslpdr"},vellum:{900:"favs"},mosaic:{900:"fams"},pixel:{400:"fapr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},graphite:{100:"fagt"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},mo={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Slab Duo":{400:"fasldr",normal:"fasldr"},"Font Awesome 7 Slab Press Duo":{400:"faslpdr",normal:"faslpdr"},"Font Awesome 7 Pixel":{400:"fapr",normal:"fapr"},"Font Awesome 7 Mosaic":{900:"fams",normal:"fams"},"Font Awesome 7 Vellum":{900:"favs",normal:"favs"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Graphite":{100:"fagt",normal:"fagt"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},po=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["graphite",{defaultShortPrefixId:"fagt",defaultStyleId:"thin",styleIds:["thin"],futureStyleIds:[],defaultFontWeight:100}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["mosaic",{defaultShortPrefixId:"fams",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["pixel",{defaultShortPrefixId:"fapr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-duo",{defaultShortPrefixId:"fasldr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press-duo",{defaultShortPrefixId:"faslpdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["vellum",{defaultShortPrefixId:"favs",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),go={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},graphite:{thin:"fagt"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},mosaic:{solid:"fams"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},pixel:{regular:"fapr"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-duo":{regular:"fasldr"},"slab-press":{regular:"faslpr"},"slab-press-duo":{regular:"faslpdr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},vellum:{solid:"favs"},whiteboard:{semibold:"fawsb"}},di=["fak","fa-kit","fakd","fa-kit-duotone"],Zn={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},vo=["kit"],bo="kit",ho="kit-duotone",yo="Kit",xo="Kit Duotone";O(O({},bo,yo),ho,xo);var wo={kit:{"fa-kit":"fak"}},_o={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},ko={kit:{fak:"fa-kit"}},ea={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},Ot,zt={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},So=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],$o="classic",Co="duotone",Po="sharp",Io="sharp-duotone",Ao="chisel",To="etch",Oo="graphite",zo="jelly",jo="jelly-duo",Fo="jelly-fill",Eo="mosaic",Lo="notdog",No="notdog-duo",Mo="pixel",Do="slab",Ro="slab-duo",Bo="slab-press",Wo="slab-press-duo",Uo="thumbprint",Vo="utility",Ko="utility-duo",Go="utility-fill",Ho="vellum",Yo="whiteboard",Xo="Classic",qo="Duotone",Qo="Sharp",Jo="Sharp Duotone",Zo="Chisel",es="Etch",ts="Graphite",ns="Jelly",as="Jelly Duo",is="Jelly Fill",rs="Mosaic",os="Notdog",ss="Notdog Duo",ls="Pixel",us="Slab",cs="Slab Duo",fs="Slab Press",ds="Slab Press Duo",ms="Thumbprint",ps="Utility",gs="Utility Duo",vs="Utility Fill",bs="Vellum",hs="Whiteboard";Ot={},O(O(O(O(O(O(O(O(O(O(Ot,$o,Xo),Co,qo),Po,Qo),Io,Jo),Ao,Zo),To,es),Oo,ts),zo,ns),jo,as),Fo,is),O(O(O(O(O(O(O(O(O(O(Ot,Eo,rs),Lo,os),No,ss),Mo,ls),Do,us),Ro,cs),Bo,fs),Wo,ds),Uo,ms),Vo,ps),O(O(O(O(Ot,Ko,gs),Go,vs),Ho,bs),Yo,hs);var ys="kit",xs="kit-duotone",ws="Kit",_s="Kit Duotone";O(O({},ys,ws),xs,_s);var ks={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},"slab-duo":{"fa-regular":"fasldr"},"slab-press-duo":{"fa-regular":"faslpdr"},pixel:{"fa-regular":"fapr"},mosaic:{"fa-solid":"fams"},vellum:{"fa-solid":"favs"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},graphite:{"fa-thin":"fagt"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},Ss={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],"slab-duo":["fasldr"],"slab-press-duo":["faslpdr"],pixel:["fapr"],mosaic:["fams"],vellum:["favs"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],graphite:["fagt"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},fn={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},"slab-duo":{fasldr:"fa-regular"},"slab-press-duo":{faslpdr:"fa-regular"},pixel:{fapr:"fa-regular"},mosaic:{fams:"fa-solid"},vellum:{favs:"fa-solid"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},graphite:{fagt:"fa-thin"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},$s=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],mi=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fasldr","faslpdr","fapr","fams","favs","fawsb","fatl","fans","fands","faes","fagt","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(So,$s),Cs=["solid","regular","light","thin","duotone","brands","semibold"],pi=[1,2,3,4,5,6,7,8,9,10],Ps=pi.concat([11,12,13,14,15,16,17,18,19,20]),Is=["aw","fw","pull-left","pull-right"],As=[].concat($e(Object.keys(Ss)),Cs,Is,["2xs","xs","sm","lg","xl","2xl","beat","beat-fade","border","bounce","buzz","canvas-square","canvas-roomy","fade","flip-360","flip-both","flip-horizontal","flip-vertical","flip","float","inverse","jello","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","spin-snap","spin-snap-4","spin-snap-8","stack-1x","stack-2x","stack","swing","ul","wag","width-auto","width-fixed",zt.GROUP,zt.SWAP_OPACITY,zt.PRIMARY,zt.SECONDARY]).concat(pi.map(function(e){return"".concat(e,"x")})).concat(Ps.map(function(e){return"w-".concat(e)})),Ts={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},Ne="___FONT_AWESOME___",dn=16,gi="fa",vi="svg-inline--fa",Je="data-fa-i2svg",mn="data-fa-pseudo-element",Os="data-fa-pseudo-element-pending",zn="data-prefix",jn="data-icon",ta="fontawesome-i2svg",zs="async",js=["HTML","HEAD","STYLE","SCRIPT"],bi=["::before","::after",":before",":after"],hi=(function(){try{return!0}catch{return!1}})();function $t(e){return new Proxy(e,{get:function(t,a){return a in t?t[a]:t[fe]}})}var yi=w({},Ba);yi[fe]=w(w(w(w({},{"fa-duotone":"duotone"}),Ba[fe]),Zn.kit),Zn["kit-duotone"]);var Fs=$t(yi),pn=w({},go);pn[fe]=w(w(w(w({},{duotone:"fad"}),pn[fe]),ea.kit),ea["kit-duotone"]);var na=$t(pn),gn=w({},fn);gn[fe]=w(w({},gn[fe]),ko.kit);var Fn=$t(gn),vn=w({},ks);vn[fe]=w(w({},vn[fe]),wo.kit);$t(vn);var Es=Mr,xi="fa-layers-text",Ls=Dr,Ns=w({},fo);$t(Ns);var Ms=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],Jt=Rr,Ds=[].concat($e(vo),$e(As)),xt=Be.FontAwesomeConfig||{};function Rs(e){var n=X.querySelector("script["+e+"]");if(n)return n.getAttribute(e)}function Bs(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}if(X&&typeof X.querySelector=="function"){var Ws=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];Ws.forEach(function(e){var n=Gt(e,2),t=n[0],a=n[1],i=Bs(Rs(t));i!=null&&(xt[a]=i)})}var wi={styleDefault:"solid",familyDefault:fe,cssPrefix:gi,replacementClass:vi,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};xt.familyPrefix&&(xt.cssPrefix=xt.familyPrefix);var ut=w(w({},wi),xt);ut.autoReplaceSvg||(ut.observeMutations=!1);var T={};Object.keys(wi).forEach(function(e){Object.defineProperty(T,e,{enumerable:!0,set:function(t){ut[e]=t,wt.forEach(function(a){return a(T)})},get:function(){return ut[e]}})});Object.defineProperty(T,"familyPrefix",{enumerable:!0,set:function(n){ut.cssPrefix=n,wt.forEach(function(t){return t(T)})},get:function(){return ut.cssPrefix}});Be.FontAwesomeConfig=T;var wt=[];function Us(e){return wt.push(e),function(){wt.splice(wt.indexOf(e),1)}}var ot=dn,je={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Vs(e){if(!(!e||!De)){var n=X.createElement("style");n.setAttribute("type","text/css"),n.innerHTML=e;for(var t=X.head.childNodes,a=null,i=t.length-1;i>-1;i--){var l=t[i],u=(l.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(u)>-1&&(a=l)}return X.head.insertBefore(n,a),e}}var Ks="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function aa(){for(var e=12,n="";e-- >0;)n+=Ks[Math.random()*62|0];return n}function ct(e){for(var n=[],t=(e||[]).length>>>0;t--;)n[t]=e[t];return n}function En(e){return e.classList?ct(e.classList):(e.getAttribute("class")||"").split(" ").filter(function(n){return n})}function _i(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Gs(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,'="').concat(_i(e[t]),'" ')},"").trim()}function Ht(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,": ").concat(e[t].trim(),";")},"")}function Ln(e){return e.size!==je.size||e.x!==je.x||e.y!==je.y||e.rotate!==je.rotate||e.flipX||e.flipY}function Hs(e){var n=e.transform,t=e.containerWidth,a=e.iconWidth,i={transform:"translate(".concat(t/2," 256)")},l="translate(".concat(n.x*32,", ").concat(n.y*32,") "),u="scale(".concat(n.size/16*(n.flipX?-1:1),", ").concat(n.size/16*(n.flipY?-1:1),") "),c="rotate(".concat(n.rotate," 0 0)"),d={transform:"".concat(l," ").concat(u," ").concat(c)},v={transform:"translate(".concat(a/2*-1," -256)")};return{outer:i,inner:d,path:v}}function Ys(e){var n=e.transform,t=e.width,a=t===void 0?dn:t,i=e.height,l=i===void 0?dn:i,u="";return Ra?u+="translate(".concat(n.x/ot-a/2,"em, ").concat(n.y/ot-l/2,"em) "):u+="translate(calc(-50% + ".concat(n.x/ot,"em), calc(-50% + ").concat(n.y/ot,"em)) "),u+="scale(".concat(n.size/ot*(n.flipX?-1:1),", ").concat(n.size/ot*(n.flipY?-1:1),") "),u+="rotate(".concat(n.rotate,"deg) "),u}var Xs=`:root, :host {
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
}`;function ki(){var e=gi,n=vi,t=T.cssPrefix,a=T.replacementClass,i=Xs;if(t!==e||a!==n){var l=new RegExp("\\.".concat(e,"\\-"),"g"),u=new RegExp("\\--".concat(e,"\\-"),"g"),c=new RegExp("\\.".concat(n),"g");i=i.replace(l,".".concat(t,"-")).replace(u,"--".concat(t,"-")).replace(c,".".concat(a))}return i}var ia=!1;function Zt(){T.autoAddCss&&!ia&&(Vs(ki()),ia=!0)}var qs={mixout:function(){return{dom:{css:ki,insertCss:Zt}}},hooks:function(){return{beforeDOMElementCreation:function(){Zt()},beforeI2svg:function(){Zt()}}}},Me=Be||{};Me[Ne]||(Me[Ne]={});Me[Ne].styles||(Me[Ne].styles={});Me[Ne].hooks||(Me[Ne].hooks={});Me[Ne].shims||(Me[Ne].shims=[]);var Se=Me[Ne],Si=[],$i=function(){X.removeEventListener("DOMContentLoaded",$i),Wt=1,Si.map(function(n){return n()})},Wt=!1;De&&(Wt=(X.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(X.readyState),Wt||X.addEventListener("DOMContentLoaded",$i));function Qs(e){De&&(Wt?setTimeout(e,0):Si.push(e))}function Ct(e){var n=e.tag,t=e.attributes,a=t===void 0?{}:t,i=e.children,l=i===void 0?[]:i;return typeof e=="string"?_i(e):"<".concat(n," ").concat(Gs(a),">").concat(l.map(Ct).join(""),"</").concat(n,">")}function ra(e,n,t){if(e&&e[n]&&e[n][t])return{prefix:n,iconName:t,icon:e[n][t]}}var en=function(n,t,a,i){var l=Object.keys(n),u=l.length,c=t,d,v,k;for(a===void 0?(d=1,k=n[l[0]]):(d=0,k=a);d<u;d++)v=l[d],k=c(k,n[v],v,n);return k};function Ci(e){return $e(e).length!==1?null:e.codePointAt(0).toString(16)}function oa(e){return Object.keys(e).reduce(function(n,t){var a=e[t],i=!!a.icon;return i?n[a.iconName]=a.icon:n[t]=a,n},{})}function bn(e,n){var t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},a=t.skipHooks,i=a===void 0?!1:a,l=oa(n);typeof Se.hooks.addPack=="function"&&!i?Se.hooks.addPack(e,oa(n)):Se.styles[e]=w(w({},Se.styles[e]||{}),l),e==="fas"&&bn("fa",n)}var _t=Se.styles,Js=Se.shims,Pi=Object.keys(Fn),Zs=Pi.reduce(function(e,n){return e[n]=Object.keys(Fn[n]),e},{}),Nn=null,Ii={},Ai={},Ti={},Oi={},zi={};function el(e){return~Ds.indexOf(e)}function tl(e,n){var t=n.split("-"),a=t[0],i=t.slice(1).join("-");return a===e&&i!==""&&!el(i)?i:null}var ji=function(){var n=function(l){return en(_t,function(u,c,d){return u[d]=en(c,l,{}),u},{})};Ii=n(function(i,l,u){if(l[3]&&(i[l[3]]=u),l[2]){var c=l[2].filter(function(d){return typeof d=="number"});c.forEach(function(d){i[d.toString(16)]=u})}return i}),Ai=n(function(i,l,u){if(i[u]=u,l[2]){var c=l[2].filter(function(d){return typeof d=="string"});c.forEach(function(d){i[d]=u})}return i}),zi=n(function(i,l,u){var c=l[2];return i[u]=u,c.forEach(function(d){i[d]=u}),i});var t="far"in _t||T.autoFetchSvg,a=en(Js,function(i,l){var u=l[0],c=l[1],d=l[2];return c==="far"&&!t&&(c="fas"),typeof u=="string"&&(i.names[u]={prefix:c,iconName:d}),typeof u=="number"&&(i.unicodes[u.toString(16)]={prefix:c,iconName:d}),i},{names:{},unicodes:{}});Ti=a.names,Oi=a.unicodes,Nn=Yt(T.styleDefault,{family:T.familyDefault})};Us(function(e){Nn=Yt(e.styleDefault,{family:T.familyDefault})});ji();function Mn(e,n){return(Ii[e]||{})[n]}function nl(e,n){return(Ai[e]||{})[n]}function Xe(e,n){return(zi[e]||{})[n]}function Fi(e){return Ti[e]||{prefix:null,iconName:null}}function al(e){var n=Oi[e],t=Mn("fas",e);return n||(t?{prefix:"fas",iconName:t}:null)||{prefix:null,iconName:null}}function We(){return Nn}var Ei=function(){return{prefix:null,iconName:null,rest:[]}};function il(e){var n=fe,t=Pi.reduce(function(a,i){return a[i]="".concat(T.cssPrefix,"-").concat(i),a},{});return fi.forEach(function(a){(e.includes(t[a])||e.some(function(i){return Zs[a].includes(i)}))&&(n=a)}),n}function Yt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.family,a=t===void 0?fe:t,i=Fs[a][e];if(a===St&&!e)return"fad";var l=na[a][e]||na[a][i],u=e in Se.styles?e:null,c=l||u||null;return c}function rl(e){var n=[],t=null;return e.forEach(function(a){var i=tl(T.cssPrefix,a);i?t=i:a&&n.push(a)}),{iconName:t,rest:n}}function sa(e){return e.sort().filter(function(n,t,a){return a.indexOf(n)===t})}var la=mi.concat(di);function Xt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.skipLookups,a=t===void 0?!1:t,i=null,l=sa(e.filter(function(I){return la.includes(I)})),u=sa(e.filter(function(I){return!la.includes(I)})),c=l.filter(function(I){return i=I,!Wa.includes(I)}),d=Gt(c,1),v=d[0],k=v===void 0?null:v,_=il(l),A=w(w({},rl(u)),{},{prefix:Yt(k,{family:_})});return w(w(w({},A),ul({values:e,family:_,styles:_t,config:T,canonical:A,givenPrefix:i})),ol(a,i,A))}function ol(e,n,t){var a=t.prefix,i=t.iconName;if(e||!a||!i)return{prefix:a,iconName:i};var l=n==="fa"?Fi(i):{},u=Xe(a,i);return i=l.iconName||u||i,a=l.prefix||a,a==="far"&&!_t.far&&_t.fas&&!T.autoFetchSvg&&(a="fas"),{prefix:a,iconName:i}}var sl=fi.filter(function(e){return e!==fe||e!==St}),ll=Object.keys(fn).filter(function(e){return e!==fe}).map(function(e){return Object.keys(fn[e])}).flat();function ul(e){var n=e.values,t=e.family,a=e.canonical,i=e.givenPrefix,l=i===void 0?"":i,u=e.styles,c=u===void 0?{}:u,d=e.config,v=d===void 0?{}:d,k=t===St,_=n.includes("fa-duotone")||n.includes("fad"),A=v.familyDefault==="duotone",I=a.prefix==="fad"||a.prefix==="fa-duotone";if(!k&&(_||A||I)&&(a.prefix="fad"),(n.includes("fa-brands")||n.includes("fab"))&&(a.prefix="fab"),!a.prefix&&sl.includes(t)){var $=Object.keys(c).find(function(P){return ll.includes(P)});if($||v.autoFetchSvg){var b=po.get(t).defaultShortPrefixId;a.prefix=b,a.iconName=Xe(a.prefix,a.iconName)||a.iconName}}return(a.prefix==="fa"||l==="fa")&&(a.prefix=We()||"fas"),a}var cl=(function(){function e(){Ar(this,e),this.definitions={}}return Or(e,[{key:"add",value:function(){for(var t=this,a=arguments.length,i=new Array(a),l=0;l<a;l++)i[l]=arguments[l];var u=i.reduce(this._pullDefinitions,{});Object.keys(u).forEach(function(c){t.definitions[c]=w(w({},t.definitions[c]||{}),u[c]),bn(c,u[c]);var d=Fn[fe][c];d&&bn(d,u[c]),ji()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(t,a){var i=a.prefix&&a.iconName&&a.icon?{0:a}:a;return Object.keys(i).map(function(l){var u=i[l],c=u.prefix,d=u.iconName,v=u.icon,k=v[2];t[c]||(t[c]={}),k.length>0&&k.forEach(function(_){typeof _=="string"&&(t[c][_]=v)}),t[c][d]=v}),t}}])})(),ua=[],st={},lt={},fl=Object.keys(lt);function dl(e,n){var t=n.mixoutsTo;return ua=e,st={},Object.keys(lt).forEach(function(a){fl.indexOf(a)===-1&&delete lt[a]}),ua.forEach(function(a){var i=a.mixout?a.mixout():{};if(Object.keys(i).forEach(function(u){typeof i[u]=="function"&&(t[u]=i[u]),Bt(i[u])==="object"&&Object.keys(i[u]).forEach(function(c){t[u]||(t[u]={}),t[u][c]=i[u][c]})}),a.hooks){var l=a.hooks();Object.keys(l).forEach(function(u){st[u]||(st[u]=[]),st[u].push(l[u])})}a.provides&&a.provides(lt)}),t}function hn(e,n){for(var t=arguments.length,a=new Array(t>2?t-2:0),i=2;i<t;i++)a[i-2]=arguments[i];var l=st[e]||[];return l.forEach(function(u){n=u.apply(null,[n].concat(a))}),n}function Ze(e){for(var n=arguments.length,t=new Array(n>1?n-1:0),a=1;a<n;a++)t[a-1]=arguments[a];var i=st[e]||[];i.forEach(function(l){l.apply(null,t)})}function Ue(){var e=arguments[0],n=Array.prototype.slice.call(arguments,1);return lt[e]?lt[e].apply(null,n):void 0}function yn(e){e.prefix==="fa"&&(e.prefix="fas");var n=e.iconName,t=e.prefix||We();if(n)return n=Xe(t,n)||n,ra(Li.definitions,t,n)||ra(Se.styles,t,n)}var Li=new cl,ml=function(){T.autoReplaceSvg=!1,T.observeMutations=!1,Ze("noAuto")},pl={i2svg:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return De?(Ze("beforeI2svg",n),Ue("pseudoElements2svg",n),Ue("i2svg",n)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot;T.autoReplaceSvg===!1&&(T.autoReplaceSvg=!0),T.observeMutations=!0,Qs(function(){vl({autoReplaceSvgRoot:t}),Ze("watch",n)})}},gl={icon:function(n){if(n===null)return null;if(Bt(n)==="object"&&n.prefix&&n.iconName)return{prefix:n.prefix,iconName:Xe(n.prefix,n.iconName)||n.iconName};if(Array.isArray(n)&&n.length===2){var t=n[1].indexOf("fa-")===0?n[1].slice(3):n[1],a=Yt(n[0]);return{prefix:a,iconName:Xe(a,t)||t}}if(typeof n=="string"&&(n.indexOf("".concat(T.cssPrefix,"-"))>-1||n.match(Es))){var i=Xt(n.split(" "),{skipLookups:!0});return{prefix:i.prefix||We(),iconName:Xe(i.prefix,i.iconName)||i.iconName}}if(typeof n=="string"){var l=We();return{prefix:l,iconName:Xe(l,n)||n}}}},he={noAuto:ml,config:T,dom:pl,parse:gl,library:Li,findIconDefinition:yn,toHtml:Ct},vl=function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot,a=t===void 0?X:t;(Object.keys(Se.styles).length>0||T.autoFetchSvg)&&De&&T.autoReplaceSvg&&he.dom.i2svg({node:a})};function qt(e,n){return Object.defineProperty(e,"abstract",{get:n}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(function(a){return Ct(a)})}}),Object.defineProperty(e,"node",{get:function(){if(De){var a=X.createElement("div");return a.innerHTML=e.html,a.children}}}),e}function bl(e){var n=e.children,t=e.main,a=e.mask,i=e.attributes,l=e.styles,u=e.transform;if(Ln(u)&&t.found&&!a.found){var c=t.width,d=t.height,v={x:c/d/2,y:.5};i.style=Ht(w(w({},l),{},{"transform-origin":"".concat(v.x+u.x/16,"em ").concat(v.y+u.y/16,"em")}))}return[{tag:"svg",attributes:i,children:n}]}function hl(e){var n=e.prefix,t=e.iconName,a=e.children,i=e.attributes,l=e.symbol,u=l===!0?"".concat(n,"-").concat(T.cssPrefix,"-").concat(t):l;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:w(w({},i),{},{id:u}),children:a}]}]}function yl(e){var n=["aria-label","aria-labelledby","title","role"];return n.some(function(t){return t in e})}function Dn(e){var n=e.icons,t=n.main,a=n.mask,i=e.prefix,l=e.iconName,u=e.transform,c=e.symbol,d=e.maskId,v=e.extra,k=e.watchable,_=k===void 0?!1:k,A=a.found?a:t,I=A.width,$=A.height,b=[T.replacementClass,l?"".concat(T.cssPrefix,"-").concat(l):""].filter(function(F){return v.classes.indexOf(F)===-1}).filter(function(F){return F!==""||!!F}).concat(v.classes).join(" "),P={children:[],attributes:w(w({},v.attributes),{},{"data-prefix":i,"data-icon":l,class:b,role:v.attributes.role||"img",viewBox:"0 0 ".concat(I," ").concat($)})};!yl(v.attributes)&&!v.attributes["aria-hidden"]&&(P.attributes["aria-hidden"]="true"),_&&(P.attributes[Je]="");var h=w(w({},P),{},{prefix:i,iconName:l,main:t,mask:a,maskId:d,transform:u,symbol:c,styles:w({},v.styles)}),m=a.found&&t.found?Ue("generateAbstractMask",h)||{children:[],attributes:{}}:Ue("generateAbstractIcon",h)||{children:[],attributes:{}},C=m.children,y=m.attributes;return h.children=C,h.attributes=y,c?hl(h):bl(h)}function ca(e){var n=e.content,t=e.width,a=e.height,i=e.transform,l=e.extra,u=e.watchable,c=u===void 0?!1:u,d=w(w({},l.attributes),{},{class:l.classes.join(" ")});c&&(d[Je]="");var v=w({},l.styles);Ln(i)&&(v.transform=Ys({transform:i,width:t,height:a}),v["-webkit-transform"]=v.transform);var k=Ht(v);k.length>0&&(d.style=k);var _=[];return _.push({tag:"span",attributes:d,children:[n]}),_}function xl(e){var n=e.content,t=e.extra,a=w(w({},t.attributes),{},{class:t.classes.join(" ")}),i=Ht(t.styles);i.length>0&&(a.style=i);var l=[];return l.push({tag:"span",attributes:a,children:[n]}),l}var tn=Se.styles;function xn(e){var n=e[0],t=e[1],a=e.slice(4),i=Gt(a,1),l=i[0],u=null;return Array.isArray(l)?u={tag:"g",attributes:{class:"".concat(T.cssPrefix,"-").concat(Jt.GROUP)},children:[{tag:"path",attributes:{class:"".concat(T.cssPrefix,"-").concat(Jt.SECONDARY),fill:"currentColor",d:l[0]}},{tag:"path",attributes:{class:"".concat(T.cssPrefix,"-").concat(Jt.PRIMARY),fill:"currentColor",d:l[1]}}]}:u={tag:"path",attributes:{fill:"currentColor",d:l}},{found:!0,width:n,height:t,icon:u}}var wl={found:!1,width:512,height:512};function _l(e,n){!hi&&!T.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(n,'" is missing.'))}function wn(e,n){var t=n;return n==="fa"&&T.styleDefault!==null&&(n=We()),new Promise(function(a,i){if(t==="fa"){var l=Fi(e)||{};e=l.iconName||e,n=l.prefix||n}if(e&&n&&tn[n]&&tn[n][e]){var u=tn[n][e];return a(xn(u))}_l(e,n),a(w(w({},wl),{},{icon:T.showMissingIcons&&e?Ue("missingIconAbstract")||{}:{}}))})}var fa=function(){},_n=T.measurePerformance&&At&&At.mark&&At.measure?At:{mark:fa,measure:fa},ht='FA "7.3.1"',kl=function(n){return _n.mark("".concat(ht," ").concat(n," begins")),function(){return Ni(n)}},Ni=function(n){_n.mark("".concat(ht," ").concat(n," ends")),_n.measure("".concat(ht," ").concat(n),"".concat(ht," ").concat(n," begins"),"".concat(ht," ").concat(n," ends"))},Rn={begin:kl,end:Ni},Et=function(){};function da(e){var n=e.getAttribute?e.getAttribute(Je):null;return typeof n=="string"}function Sl(e){var n=e.getAttribute?e.getAttribute(zn):null,t=e.getAttribute?e.getAttribute(jn):null;return n&&t}function $l(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(T.replacementClass)}function Cl(){if(T.autoReplaceSvg===!0)return Lt.replace;var e=Lt[T.autoReplaceSvg];return e||Lt.replace}function Pl(e){return X.createElementNS("http://www.w3.org/2000/svg",e)}function Il(e){return X.createElement(e)}function Mi(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.ceFn,a=t===void 0?e.tag==="svg"?Pl:Il:t;if(typeof e=="string")return X.createTextNode(e);var i=a(e.tag);Object.keys(e.attributes||[]).forEach(function(u){i.setAttribute(u,e.attributes[u])});var l=e.children||[];return l.forEach(function(u){i.appendChild(Mi(u,{ceFn:a}))}),i}function Al(e){var n=" ".concat(e.outerHTML," ");return n="".concat(n,"Font Awesome fontawesome.com "),n}var Lt={replace:function(n){var t=n[0];if(t.parentNode)if(n[1].forEach(function(i){t.parentNode.insertBefore(Mi(i),t)}),t.getAttribute(Je)===null&&T.keepOriginalSource){var a=X.createComment(Al(t));t.parentNode.replaceChild(a,t)}else t.remove()},nest:function(n){var t=n[0],a=n[1];if(~En(t).indexOf(T.replacementClass))return Lt.replace(n);var i=new RegExp("".concat(T.cssPrefix,"-.*"));if(delete a[0].attributes.id,a[0].attributes.class){var l=a[0].attributes.class.split(" ").reduce(function(c,d){return d===T.replacementClass||d.match(i)?c.toSvg.push(d):c.toNode.push(d),c},{toNode:[],toSvg:[]});a[0].attributes.class=l.toSvg.join(" "),l.toNode.length===0?t.removeAttribute("class"):t.setAttribute("class",l.toNode.join(" "))}var u=a.map(function(c){return Ct(c)}).join(`
`);t.setAttribute(Je,""),t.innerHTML=u}};function ma(e){e()}function Di(e,n){var t=typeof n=="function"?n:Et;if(e.length===0)t();else{var a=ma;T.mutateApproach===zs&&(a=Be.requestAnimationFrame||ma),a(function(){var i=Cl(),l=Rn.begin("mutate");e.map(i),l(),t()})}}var Bn=!1;function Ri(){Bn=!0}function kn(){Bn=!1}var Ut=null;function pa(e){if(Jn&&T.observeMutations){var n=e.treeCallback,t=n===void 0?Et:n,a=e.nodeCallback,i=a===void 0?Et:a,l=e.pseudoElementsCallback,u=l===void 0?Et:l,c=e.observeMutationsRoot,d=c===void 0?X:c;Ut=new Jn(function(v){if(!Bn){var k=We();ct(v).forEach(function(_){if(_.type==="childList"&&_.addedNodes.length>0&&!da(_.addedNodes[0])&&(T.searchPseudoElements&&u(_.target),t(_.target)),_.type==="attributes"&&_.target.parentNode&&T.searchPseudoElements&&u([_.target],!0),_.type==="attributes"&&da(_.target)&&~Ms.indexOf(_.attributeName))if(_.attributeName==="class"&&Sl(_.target)){var A=Xt(En(_.target)),I=A.prefix,$=A.iconName;_.target.setAttribute(zn,I||k),$&&_.target.setAttribute(jn,$)}else $l(_.target)&&i(_.target)})}}),De&&Ut.observe(d,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function Tl(){Ut&&Ut.disconnect()}function Ol(e){var n=e.getAttribute("style"),t=[];return n&&(t=n.split(";").reduce(function(a,i){var l=i.split(":"),u=l[0],c=l.slice(1);return u&&c.length>0&&(a[u]=c.join(":").trim()),a},{})),t}function zl(e){var n=e.getAttribute("data-prefix"),t=e.getAttribute("data-icon"),a=e.innerText!==void 0?e.innerText.trim():"",i=Xt(En(e));return i.prefix||(i.prefix=We()),n&&t&&(i.prefix=n,i.iconName=t),i.iconName&&i.prefix||(i.prefix&&a.length>0&&(i.iconName=nl(i.prefix,e.innerText)||Mn(i.prefix,Ci(e.innerText))),!i.iconName&&T.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(i.iconName=e.firstChild.data)),i}function jl(e){var n=ct(e.attributes).reduce(function(t,a){return t.name!=="class"&&t.name!=="style"&&(t[a.name]=a.value),t},{});return n}function Fl(){return{iconName:null,prefix:null,transform:je,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function ga(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},t=zl(e),a=t.iconName,i=t.prefix,l=t.rest,u=jl(e),c=hn("parseNodeAttributes",{},e),d=n.styleParser?Ol(e):[];return w({iconName:a,prefix:i,transform:je,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:l,styles:d,attributes:u}},c)}var El=Se.styles;function Bi(e){var n=T.autoReplaceSvg==="nest"?ga(e,{styleParser:!1}):ga(e);return~n.extra.classes.indexOf(xi)?Ue("generateLayersText",e,n):Ue("generateSvgReplacementMutation",e,n)}function Ll(){return[].concat($e(di),$e(mi))}function va(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!De)return Promise.resolve();var t=X.documentElement.classList,a=function(_){return t.add("".concat(ta,"-").concat(_))},i=function(_){return t.remove("".concat(ta,"-").concat(_))},l=T.autoFetchSvg?Ll():Wa.concat(Object.keys(El));l.includes("fa")||l.push("fa");var u=[".".concat(xi,":not([").concat(Je,"])")].concat(l.map(function(k){return".".concat(k,":not([").concat(Je,"])")})).join(", ");if(u.length===0)return Promise.resolve();var c=[];try{c=ct(e.querySelectorAll(u))}catch{}if(c.length>0)a("pending"),i("complete");else return Promise.resolve();var d=Rn.begin("onTree"),v=c.reduce(function(k,_){try{var A=Bi(_);A&&k.push(A)}catch(I){hi||I.name==="MissingIcon"&&console.error(I)}return k},[]);return new Promise(function(k,_){Promise.all(v).then(function(A){Di(A,function(){a("active"),a("complete"),i("pending"),typeof n=="function"&&n(),d(),k()})}).catch(function(A){d(),_(A)})})}function Nl(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;Bi(e).then(function(t){t&&Di([t],n)})}function Ml(e){return function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=(n||{}).icon?n:yn(n||{}),i=t.mask;return i&&(i=(i||{}).icon?i:yn(i||{})),e(a,w(w({},t),{},{mask:i}))}}var Dl=function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=t.transform,i=a===void 0?je:a,l=t.symbol,u=l===void 0?!1:l,c=t.mask,d=c===void 0?null:c,v=t.maskId,k=v===void 0?null:v,_=t.classes,A=_===void 0?[]:_,I=t.attributes,$=I===void 0?{}:I,b=t.styles,P=b===void 0?{}:b;if(n){var h=n.prefix,m=n.iconName,C=n.icon;return qt(w({type:"icon"},n),function(){return Ze("beforeDOMElementCreation",{iconDefinition:n,params:t}),Dn({icons:{main:xn(C),mask:d?xn(d.icon):{found:!1,width:null,height:null,icon:{}}},prefix:h,iconName:m,transform:w(w({},je),i),symbol:u,maskId:k,extra:{attributes:$,styles:P,classes:A}})})}},Rl={mixout:function(){return{icon:Ml(Dl)}},hooks:function(){return{mutationObserverCallbacks:function(t){return t.treeCallback=va,t.nodeCallback=Nl,t}}},provides:function(n){n.i2svg=function(t){var a=t.node,i=a===void 0?X:a,l=t.callback,u=l===void 0?function(){}:l;return va(i,u)},n.generateSvgReplacementMutation=function(t,a){var i=a.iconName,l=a.prefix,u=a.transform,c=a.symbol,d=a.mask,v=a.maskId,k=a.extra;return new Promise(function(_,A){Promise.all([wn(i,l),d.iconName?wn(d.iconName,d.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(I){var $=Gt(I,2),b=$[0],P=$[1];_([t,Dn({icons:{main:b,mask:P},prefix:l,iconName:i,transform:u,symbol:c,maskId:v,extra:k,watchable:!0})])}).catch(A)})},n.generateAbstractIcon=function(t){var a=t.children,i=t.attributes,l=t.main,u=t.transform,c=t.styles,d=Ht(c);d.length>0&&(i.style=d);var v;return Ln(u)&&(v=Ue("generateAbstractTransformGrouping",{main:l,transform:u,containerWidth:l.width,iconWidth:l.width})),a.push(v||l.icon),{children:a,attributes:i}}}},Bl={mixout:function(){return{layer:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.classes,l=i===void 0?[]:i;return qt({type:"layer"},function(){Ze("beforeDOMElementCreation",{assembler:t,params:a});var u=[];return t(function(c){Array.isArray(c)?c.map(function(d){u=u.concat(d.abstract)}):u=u.concat(c.abstract)}),[{tag:"span",attributes:{class:["".concat(T.cssPrefix,"-layers")].concat($e(l)).join(" ")},children:u}]})}}}},Wl={mixout:function(){return{counter:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};a.title;var i=a.classes,l=i===void 0?[]:i,u=a.attributes,c=u===void 0?{}:u,d=a.styles,v=d===void 0?{}:d;return qt({type:"counter",content:t},function(){return Ze("beforeDOMElementCreation",{content:t,params:a}),xl({content:t.toString(),extra:{attributes:c,styles:v,classes:["".concat(T.cssPrefix,"-layers-counter")].concat($e(l))}})})}}}},Ul={mixout:function(){return{text:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.transform,l=i===void 0?je:i,u=a.classes,c=u===void 0?[]:u,d=a.attributes,v=d===void 0?{}:d,k=a.styles,_=k===void 0?{}:k;return qt({type:"text",content:t},function(){return Ze("beforeDOMElementCreation",{content:t,params:a}),ca({content:t,transform:w(w({},je),l),extra:{attributes:v,styles:_,classes:["".concat(T.cssPrefix,"-layers-text")].concat($e(c))}})})}}},provides:function(n){n.generateLayersText=function(t,a){var i=a.transform,l=a.extra,u=null,c=null;if(Ra){var d=parseInt(getComputedStyle(t).fontSize,10),v=t.getBoundingClientRect();u=v.width/d,c=v.height/d}return Promise.resolve([t,ca({content:t.innerHTML,width:u,height:c,transform:i,extra:l,watchable:!0})])}}},Wi=new RegExp('"',"ug"),ba=[1105920,1112319],ha=w(w(w(w({},{FontAwesome:{normal:"fas",400:"fas"}}),mo),Ts),_o),Sn=Object.keys(ha).reduce(function(e,n){return e[n.toLowerCase()]=ha[n],e},{}),Vl=Object.keys(Sn).reduce(function(e,n){var t=Sn[n];return e[n]=t[900]||$e(Object.entries(t))[0][1],e},{});function Kl(e){var n=e.replace(Wi,"");return Ci($e(n)[0]||"")}function Gl(e){var n=e.getPropertyValue("font-feature-settings").includes("ss01"),t=e.getPropertyValue("content"),a=t.replace(Wi,""),i=a.codePointAt(0),l=i>=ba[0]&&i<=ba[1],u=a.length===2?a[0]===a[1]:!1;return l||u||n}function Hl(e,n){var t=e.replace(/^['"]|['"]$/g,"").toLowerCase(),a=parseInt(n),i=isNaN(a)?"normal":a;return(Sn[t]||{})[i]||Vl[t]}function ya(e,n){var t="".concat(Os).concat(n.replace(":","-"));return new Promise(function(a,i){if(e.getAttribute(t)!==null)return a();var l=ct(e.children),u=l.filter(function(te){return te.getAttribute(mn)===n})[0],c=Be.getComputedStyle(e,n),d=c.getPropertyValue("font-family"),v=d.match(Ls),k=c.getPropertyValue("font-weight"),_=c.getPropertyValue("content");if(u&&!v)return e.removeChild(u),a();if(v&&_!=="none"&&_!==""){var A=c.getPropertyValue("content"),I=Hl(d,k),$=Kl(A),b=v[0].startsWith("FontAwesome"),P=Gl(c),h=Mn(I,$),m=h;if(b){var C=al($);C.iconName&&C.prefix&&(h=C.iconName,I=C.prefix)}if(h&&!P&&(!u||u.getAttribute(zn)!==I||u.getAttribute(jn)!==m)){e.setAttribute(t,m),u&&e.removeChild(u);var y=Fl(),F=y.extra;F.attributes[mn]=n,wn(h,I).then(function(te){var Z=Dn(w(w({},y),{},{icons:{main:te,mask:Ei()},prefix:I,iconName:m,extra:F,watchable:!0})),D=X.createElementNS("http://www.w3.org/2000/svg","svg");n==="::before"?e.insertBefore(D,e.firstChild):e.appendChild(D),D.outerHTML=Z.map(function(ne){return Ct(ne)}).join(`
`),e.removeAttribute(t),a()}).catch(i)}else a()}else a()})}function Yl(e){return Promise.all([ya(e,"::before"),ya(e,"::after")])}function Xl(e){return e.parentNode!==document.head&&!~js.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(mn)&&(!e.parentNode||e.parentNode.tagName!=="svg")}var ql=function(n){return!!n&&bi.some(function(t){return n.includes(t)})},Ql=function(n){if(!n)return[];var t=new Set,a=n.split(/,(?![^()]*\))/).map(function(d){return d.trim()});a=a.flatMap(function(d){return d.includes("(")?d:d.split(",").map(function(v){return v.trim()})});var i=Ft(a),l;try{for(i.s();!(l=i.n()).done;){var u=l.value;if(ql(u)){var c=bi.reduce(function(d,v){return d.replace(v,"")},u);c!==""&&c!=="*"&&t.add(c)}}}catch(d){i.e(d)}finally{i.f()}return t};function xa(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if(De){var t;if(n)t=e;else if(T.searchPseudoElementsFullScan)t=e.querySelectorAll("*");else{var a=new Set,i=Ft(document.styleSheets),l;try{for(i.s();!(l=i.n()).done;){var u=l.value;try{var c=Ft(u.cssRules),d;try{for(c.s();!(d=c.n()).done;){var v=d.value,k=Ql(v.selectorText),_=Ft(k),A;try{for(_.s();!(A=_.n()).done;){var I=A.value;a.add(I)}}catch(b){_.e(b)}finally{_.f()}}}catch(b){c.e(b)}finally{c.f()}}catch(b){T.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(u.href," (").concat(b.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(b){i.e(b)}finally{i.f()}if(!a.size)return;var $=Array.from(a).join(", ");try{t=e.querySelectorAll($)}catch{}}return new Promise(function(b,P){var h=ct(t).filter(Xl).map(Yl),m=Rn.begin("searchPseudoElements");Ri(),Promise.all(h).then(function(){m(),kn(),b()}).catch(function(){m(),kn(),P()})})}}var Jl={hooks:function(){return{mutationObserverCallbacks:function(t){return t.pseudoElementsCallback=xa,t}}},provides:function(n){n.pseudoElements2svg=function(t){var a=t.node,i=a===void 0?X:a;T.searchPseudoElements&&xa(i)}}},wa=!1,Zl={mixout:function(){return{dom:{unwatch:function(){Ri(),wa=!0}}}},hooks:function(){return{bootstrap:function(){pa(hn("mutationObserverCallbacks",{}))},noAuto:function(){Tl()},watch:function(t){var a=t.observeMutationsRoot;wa?kn():pa(hn("mutationObserverCallbacks",{observeMutationsRoot:a}))}}}},_a=function(n){var t={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return n.toLowerCase().split(" ").reduce(function(a,i){var l=i.toLowerCase().split("-"),u=l[0],c=l.slice(1).join("-");if(u&&c==="h")return a.flipX=!0,a;if(u&&c==="v")return a.flipY=!0,a;if(c=parseFloat(c),isNaN(c))return a;switch(u){case"grow":a.size=a.size+c;break;case"shrink":a.size=a.size-c;break;case"left":a.x=a.x-c;break;case"right":a.x=a.x+c;break;case"up":a.y=a.y-c;break;case"down":a.y=a.y+c;break;case"rotate":a.rotate=a.rotate+c;break}return a},t)},eu={mixout:function(){return{parse:{transform:function(t){return _a(t)}}}},hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-transform");return i&&(t.transform=_a(i)),t}}},provides:function(n){n.generateAbstractTransformGrouping=function(t){var a=t.main,i=t.transform,l=t.containerWidth,u=t.iconWidth,c={transform:"translate(".concat(l/2," 256)")},d="translate(".concat(i.x*32,", ").concat(i.y*32,") "),v="scale(".concat(i.size/16*(i.flipX?-1:1),", ").concat(i.size/16*(i.flipY?-1:1),") "),k="rotate(".concat(i.rotate," 0 0)"),_={transform:"".concat(d," ").concat(v," ").concat(k)},A={transform:"translate(".concat(u/2*-1," -256)")},I={outer:c,inner:_,path:A};return{tag:"g",attributes:w({},I.outer),children:[{tag:"g",attributes:w({},I.inner),children:[{tag:a.icon.tag,children:a.icon.children,attributes:w(w({},a.icon.attributes),I.path)}]}]}}}},nn={x:0,y:0,width:"100%",height:"100%"};function ka(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||n)&&(e.attributes.fill="black"),e}function tu(e){return e.tag==="g"?e.children:[e]}var nu={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-mask"),l=i?Xt(i.split(" ").map(function(u){return u.trim()})):Ei();return l.prefix||(l.prefix=We()),t.mask=l,t.maskId=a.getAttribute("data-fa-mask-id"),t}}},provides:function(n){n.generateAbstractMask=function(t){var a=t.children,i=t.attributes,l=t.main,u=t.mask,c=t.maskId,d=t.transform,v=l.width,k=l.icon,_=u.width,A=u.icon,I=Hs({transform:d,containerWidth:_,iconWidth:v}),$={tag:"rect",attributes:w(w({},nn),{},{fill:"white"})},b=k.children?{children:k.children.map(ka)}:{},P={tag:"g",attributes:w({},I.inner),children:[ka(w({tag:k.tag,attributes:w(w({},k.attributes),I.path)},b))]},h={tag:"g",attributes:w({},I.outer),children:[P]},m="mask-".concat(c||aa()),C="clip-".concat(c||aa()),y={tag:"mask",attributes:w(w({},nn),{},{id:m,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[$,h]},F={tag:"defs",children:[{tag:"clipPath",attributes:{id:C},children:tu(A)},y]};return a.push(F,{tag:"rect",attributes:w({fill:"currentColor","clip-path":"url(#".concat(C,")"),mask:"url(#".concat(m,")")},nn)}),{children:a,attributes:i}}}},au={provides:function(n){var t=!1;Be.matchMedia&&(t=Be.matchMedia("(prefers-reduced-motion: reduce)").matches),n.missingIconAbstract=function(){var a=[],i={fill:"currentColor"},l={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};a.push({tag:"path",attributes:w(w({},i),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var u=w(w({},l),{},{attributeName:"opacity"}),c={tag:"circle",attributes:w(w({},i),{},{cx:"256",cy:"364",r:"28"}),children:[]};return t||c.children.push({tag:"animate",attributes:w(w({},l),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:w(w({},u),{},{values:"1;0;1;1;0;1;"})}),a.push(c),a.push({tag:"path",attributes:w(w({},i),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:t?[]:[{tag:"animate",attributes:w(w({},u),{},{values:"1;0;0;0;0;1;"})}]}),t||a.push({tag:"path",attributes:w(w({},i),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:w(w({},u),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:a}}}},iu={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-symbol"),l=i===null?!1:i===""?!0:i;return t.symbol=l,t}}}},ru=[qs,Rl,Bl,Wl,Ul,Jl,Zl,eu,nu,au,iu];dl(ru,{mixoutsTo:he});he.noAuto;he.config;he.library;he.dom;var $n=he.parse;he.findIconDefinition;he.toHtml;var ou=he.icon;he.layer;he.text;he.counter;function Cn(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function su(e){if(Array.isArray(e))return Cn(e)}function K(e,n,t){return(n=mu(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function lu(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function uu(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Sa(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function J(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?Sa(Object(t),!0).forEach(function(a){K(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Sa(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function an(e,n){if(e==null)return{};var t,a,i=cu(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)t=l[a],n.indexOf(t)===-1&&{}.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}function cu(e,n){if(e==null)return{};var t={};for(var a in e)if({}.hasOwnProperty.call(e,a)){if(n.indexOf(a)!==-1)continue;t[a]=e[a]}return t}function fu(e){return su(e)||lu(e)||pu(e)||uu()}function du(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function mu(e){var n=du(e,"string");return typeof n=="symbol"?n:n+""}function Vt(e){"@babel/helpers - typeof";return Vt=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Vt(e)}function pu(e,n){if(e){if(typeof e=="string")return Cn(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?Cn(e,n):void 0}}function rn(e,n){return Array.isArray(n)&&n.length>0||!Array.isArray(n)&&n?K({},e,n):{}}function gu(e){var n,t=(n={"fa-spin":e.spin,"fa-pulse":e.pulse,"fa-fw":e.fixedWidth,"fa-border":e.border,"fa-li":e.listItem,"fa-inverse":e.inverse,"fa-flip":e.flip===!0,"fa-flip-horizontal":e.flip==="horizontal"||e.flip==="both","fa-flip-vertical":e.flip==="vertical"||e.flip==="both"},K(K(K(K(K(K(K(K(K(K(n,"fa-".concat(e.size),e.size!==null),"fa-rotate-".concat(e.rotation),e.rotation!==null),"fa-rotate-by",e.rotateBy),"fa-pull-".concat(e.pull),e.pull!==null),"fa-swap-opacity",e.swapOpacity),"fa-bounce",e.bounce),"fa-shake",e.shake),"fa-beat",e.beat),"fa-fade",e.fade),"fa-beat-fade",e.beatFade),K(K(K(K(K(K(K(K(K(K(n,"fa-flash",e.flash),"fa-spin-pulse",e.spinPulse),"fa-spin-reverse",e.spinReverse),"fa-width-auto",e.widthAuto),"fa-canvas-square",e.canvasSquare),"fa-canvas-roomy",e.canvasRoomy),"fa-flip-360",e.flip360),"fa-buzz",e.buzz),"fa-float",e.float),"fa-jello",e.jello),K(K(K(K(K(n,"fa-spin-snap",e.spinSnap),"fa-spin-snap-4",e.spinSnap4),"fa-spin-snap-8",e.spinSnap8),"fa-swing",e.swing),"fa-wag",e.wag));return Object.keys(t).map(function(a){return t[a]?a:null}).filter(function(a){return a})}var vu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Ui={exports:{}};(function(e){(function(n){var t=function(h,m,C){if(!v(m)||_(m)||A(m)||I(m)||d(m))return m;var y,F=0,te=0;if(k(m))for(y=[],te=m.length;F<te;F++)y.push(t(h,m[F],C));else{y={};for(var Z in m)Object.prototype.hasOwnProperty.call(m,Z)&&(y[h(Z,C)]=t(h,m[Z],C))}return y},a=function(h,m){m=m||{};var C=m.separator||"_",y=m.split||/(?=[A-Z])/;return h.split(y).join(C)},i=function(h){return $(h)?h:(h=h.replace(/[\-_\s]+(.)?/g,function(m,C){return C?C.toUpperCase():""}),h.substr(0,1).toLowerCase()+h.substr(1))},l=function(h){var m=i(h);return m.substr(0,1).toUpperCase()+m.substr(1)},u=function(h,m){return a(h,m).toLowerCase()},c=Object.prototype.toString,d=function(h){return typeof h=="function"},v=function(h){return h===Object(h)},k=function(h){return c.call(h)=="[object Array]"},_=function(h){return c.call(h)=="[object Date]"},A=function(h){return c.call(h)=="[object RegExp]"},I=function(h){return c.call(h)=="[object Boolean]"},$=function(h){return h=h-0,h===h},b=function(h,m){var C=m&&"process"in m?m.process:m;return typeof C!="function"?h:function(y,F){return C(y,h,F)}},P={camelize:i,decamelize:u,pascalize:l,depascalize:u,camelizeKeys:function(h,m){return t(b(i,m),h)},decamelizeKeys:function(h,m){return t(b(u,m),h,m)},pascalizeKeys:function(h,m){return t(b(l,m),h)},depascalizeKeys:function(){return this.decamelizeKeys.apply(this,arguments)}};e.exports?e.exports=P:n.humps=P})(vu)})(Ui);var bu=Ui.exports,hu=["gradientFill"],yu=["class","style"],xu=["type","stops","id"];function wu(e){return e.split(";").map(function(n){return n.trim()}).filter(function(n){return n}).reduce(function(n,t){var a=t.indexOf(":"),i=bu.camelize(t.slice(0,a)),l=t.slice(a+1).trim();return n[i]=l,n},{})}function _u(e){return e.split(/\s+/).reduce(function(n,t){return n[t]=!0,n},{})}function ku(e,n){return jt("stop",J({key:"".concat(n,"-").concat(e.offset),offset:e.offset,"stop-color":e.color},e.opacity!==void 0&&{"stop-opacity":e.opacity}))}function Vi(e){if(typeof e=="string")return e;var n=(e.children||[]).map(Vi);return e.tag==="path"&&e.attributes&&"fill"in e.attributes?J(J({},e),{},{attributes:J(J({},e.attributes),{},{fill:void 0}),children:n}):J(J({},e),{},{children:n})}function Ki(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof e=="string")return e;var a=n.gradientFill,i=a===void 0?null:a,l=an(n,hu),u=!!i||"fill"in t,c=u?Vi(e):e,d=(c.children||[]).map(function(y){return Ki(y,{},{})}),v=Object.keys(c.attributes||{}).reduce(function(y,F){var te=c.attributes[F];switch(F){case"class":y.class=_u(te);break;case"style":y.style=wu(te);break;default:y.attrs[F]=te}return y},{attrs:{},class:{},style:{}});t.class;var k=t.style,_=k===void 0?{}:k,A=an(t,yu);if(i&&i.id&&(i.type==="linear"||i.type==="radial")){var I=i.type,$=i.stops,b=$===void 0?[]:$,P=i.id,h=an(i,xu),m=I==="linear"?"linearGradient":"radialGradient",C=jt(m,J(J({},h),{},{id:P}),b.map(ku));return jt(c.tag,J(J(J(J({},l),{},{class:v.class,style:J(J({},v.style),_)},v.attrs),A),{},{fill:"url(#".concat(P,")")}),[C].concat(fu(d)))}return jt(e.tag,J(J(J({},l),{},{class:v.class,style:J(J({},v.style),_)},v.attrs),A),d)}var Gi=!1;try{Gi=!0}catch{}function $a(){if(!Gi&&console&&typeof console.error=="function"){var e;(e=console).error.apply(e,arguments)}}function Ca(e){if(e&&Vt(e)==="object"&&e.prefix&&e.iconName&&e.icon)return e;if($n.icon)return $n.icon(e);if(e===null)return null;if(Vt(e)==="object"&&e.prefix&&e.iconName)return e;if(Array.isArray(e)&&e.length===2)return{prefix:e[0],iconName:e[1]};if(typeof e=="string")return{prefix:"fas",iconName:e}}var Su=Ve({name:"FontAwesomeIcon",props:{border:{type:Boolean,default:!1},fixedWidth:{type:Boolean,default:!1},flip:{type:[Boolean,String],default:!1,validator:function(n){return[!0,!1,"horizontal","vertical","both"].indexOf(n)>-1}},icon:{type:[Object,Array,String],required:!0},mask:{type:[Object,Array,String],default:null},maskId:{type:String,default:null},listItem:{type:Boolean,default:!1},pull:{type:String,default:null,validator:function(n){return["right","left"].indexOf(n)>-1}},pulse:{type:Boolean,default:!1},rotation:{type:[String,Number],default:null,validator:function(n){return[90,180,270].indexOf(Number.parseInt(n,10))>-1}},rotateBy:{type:Boolean,default:!1},swapOpacity:{type:Boolean,default:!1},size:{type:String,default:null,validator:function(n){return["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"].indexOf(n)>-1}},spin:{type:Boolean,default:!1},transform:{type:[String,Object],default:null},symbol:{type:[Boolean,String],default:!1},title:{type:String,default:null},titleId:{type:String,default:null},inverse:{type:Boolean,default:!1},bounce:{type:Boolean,default:!1},shake:{type:Boolean,default:!1},beat:{type:Boolean,default:!1},fade:{type:Boolean,default:!1},beatFade:{type:Boolean,default:!1},flash:{type:Boolean,default:!1},spinPulse:{type:Boolean,default:!1},spinReverse:{type:Boolean,default:!1},widthAuto:{type:Boolean,default:!1},canvasSquare:{type:Boolean,default:!1},canvasRoomy:{type:Boolean,default:!1},gradientFill:{type:Object,default:null,validator:function(n){return typeof n.id!="string"||!n.id?(console.warn("FontAwesomeIcon: gradientFill.id must be a non-empty string"),!1):n.type!=="linear"&&n.type!=="radial"?(console.warn('FontAwesomeIcon: gradientFill.type must be "linear" or "radial"'),!1):!0}},flip360:{type:Boolean,default:!1},buzz:{type:Boolean,default:!1},float:{type:Boolean,default:!1},jello:{type:Boolean,default:!1},spinSnap:{type:Boolean,default:!1},spinSnap4:{type:Boolean,default:!1},spinSnap8:{type:Boolean,default:!1},swing:{type:Boolean,default:!1},wag:{type:Boolean,default:!1}},setup:function(n,t){var a=t.attrs,i=z(function(){return Ca(n.icon)}),l=z(function(){return rn("classes",gu(n))}),u=z(function(){return rn("transform",typeof n.transform=="string"?$n.transform(n.transform):n.transform)}),c=z(function(){return rn("mask",Ca(n.mask))}),d=z(function(){var k=J(J(J(J({},l.value),u.value),c.value),{},{symbol:n.symbol,maskId:n.maskId});return k.title=n.title,k.titleId=n.titleId,ou(i.value,k)});Le(d,function(k){if(!k)return $a("Could not find one or more icon(s)",i.value,c.value)},{immediate:!0}),n.gradientFill&&n.symbol&&$a("gradientFill is not supported when symbol is true and will be ignored");var v=z(function(){return d.value?Ki(d.value.abstract[0],{gradientFill:n.symbol?null:n.gradientFill},a):null});return function(){return v.value}}});var $u={prefix:"fas",iconName:"arrow-up-from-bracket",icon:[448,512,[],"e09a","M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"]};const Cu={class:"challenge-launch","aria-labelledby":"launch-title"},Pu={class:"challenge-launch__heading"},Iu={class:"builder-card__eyebrow"},Au={id:"launch-title"},Tu=["aria-label"],Ou=["disabled"],zu=["disabled"],ju={class:"action-button__icon","aria-hidden":"true"},Fu=["src"],Eu={key:1,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},Lu=["disabled"],Nu=["disabled"],Mu={class:"action-button__icon","aria-hidden":"true"},Du=Ve({__name:"ChallengeActions",props:{ready:{type:Boolean},busyAction:{}},emits:["exercise","print","save"],setup(e,{emit:n}){const{ui:t}=et(),a=n,i=bt("challenge-random-coach-avatar",()=>"");return kt(async()=>{if(!i.value)try{const u=(await $fetch("/api/coaches")).coaches.filter(d=>d.avatarPath),c=u[Math.floor(Math.random()*u.length)];i.value=c?.avatarPath||""}catch{}}),(l,u)=>(x(),S("section",Cu,[r("div",Pu,[r("div",null,[r("p",Iu,f(s(t)("Ton défi est prêt")),1),r("h2",Au,f(s(t)("Comment veux-tu l’utiliser ?")),1)])]),r("div",{class:"challenge-actions","aria-label":s(t)("Lancer le défi")},[r("button",{class:"action-button action-button--primary","data-tour":"action-classic",type:"button",disabled:!e.ready||!!e.busyAction,onClick:u[0]||(u[0]=c=>a("exercise","classic"))},[u[4]||(u[4]=r("span",{class:"action-button__icon","aria-hidden":"true"},"●",-1)),r("span",null,[r("strong",null,f(e.busyAction==="exercise"?s(t)("Préparation…"):s(t)("Classique")),1),r("small",null,f(s(t)("Questions et correction immédiate")),1)])],8,Ou),r("button",{class:"action-button action-button--chat","data-tour":"action-coach",type:"button",disabled:!e.ready||!!e.busyAction,onClick:u[1]||(u[1]=c=>a("exercise","chat"))},[r("span",ju,[s(i)?(x(),S("img",{key:0,src:s(i),alt:""},null,8,Fu)):(x(),S("svg",Eu,[...u[5]||(u[5]=[r("circle",{cx:"12",cy:"8",r:"4"},null,-1),r("path",{d:"M4.5 21a7.5 7.5 0 0 1 15 0"},null,-1)])]))]),r("span",null,[r("strong",null,f(e.busyAction==="exercise"?s(t)("Préparation…"):s(t)("Avec un coach")),1),r("small",null,f(s(t)("Dialogue virtuel avec une aide pas à pas")),1)])],8,zu),r("button",{class:"action-button action-button--print","data-tour":"action-print",type:"button",disabled:!e.ready||!!e.busyAction,onClick:u[2]||(u[2]=c=>a("print"))},[u[6]||(u[6]=dr('<span class="action-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v7H6z"></path><path d="M18 12h.01"></path></svg></span>',1)),r("span",null,[r("strong",null,f(e.busyAction==="print"?s(t)("Préparation…"):s(t)("Imprimer")),1),r("small",null,f(s(t)("Les questions et le corrigé")),1)])],8,Lu),r("button",{class:"action-button action-button--share","data-tour":"action-share",type:"button",disabled:!e.ready||!!e.busyAction,onClick:u[3]||(u[3]=c=>a("save"))},[r("span",Mu,[qe(s(Su),{icon:s($u)},null,8,["icon"])]),r("span",null,[r("strong",null,f(e.busyAction==="save"?s(t)("Sauvegarde…"):s(t)("Partager")),1),r("small",null,f(s(t)("Partager ce défi avec d’autres personnes")),1)])],8,Nu)],8,Tu)]))}}),Lm=Object.assign(Du,{__name:"ChallengeActions"}),Ru=["aria-labelledby"],Bu={class:"builder-card__header"},Wu={class:"builder-card__eyebrow"},Uu=["id"],Vu={class:"options-main-column"},Ku=["for"],Gu=["id","value"],Hu={class:"check-row"},Yu=["checked"],Xu={class:"check-row"},qu=["checked"],Qu={class:"option-fieldset"},Ju={class:"segmented-control"},Zu=["name","checked"],ec=["name","checked"],tc={class:"segmented-control segmented-control--stacked"},nc=["name","checked"],ac=["name","checked"],ic=["aria-hidden"],rc={key:0,class:"complement-options__title"},oc={key:1,class:"complement-options__description"},sc=["disabled","aria-expanded","aria-controls"],lc={"aria-hidden":"true"},uc={key:3,class:"complement-options__unavailable"},cc=["id"],fc={class:"sr-only"},dc=["disabled","checked"],mc=["disabled","checked"],pc=["disabled","checked"],gc=["disabled","checked"],vc={class:"conjugation-example__header"},bc={class:"conjugation-example__heading"},hc={class:"conjugation-example__screen"},yc={key:0,class:"conjugation-example__loading",role:"status"},xc={class:"sr-only"},wc={key:1,class:"conjugation-example__body"},_c={key:0,class:"conjugation-example__question"},kc={class:"conjugation-example__block-label"},Sc={class:"conjugation-example__instruction"},$c={key:0,class:"conjugation-example__citation"},Cc={key:1,class:"conjugation-example__question-line"},Pc={class:"conjugation-example__prompt"},Ic={key:0,class:"conjugation-example__instruction"},Ac={key:1,class:"conjugation-example__question-line"},Tc={class:"conjugation-example__context"},Oc={key:0,class:"conjugation-example__correction"},zc={key:1},jc=Ve({__name:"ChallengeOptions",props:{questionCount:{},exerciseKind:{},identificationSource:{},inclusivePronouns:{type:Boolean},includeOnPronoun:{type:Boolean},complementOptions:{},complementVerbs:{},eyebrow:{},idPrefix:{},gridLayout:{type:Boolean},conjugationInstruction:{},conjugationQuestionContext:{},conjugationQuestion:{},conjugationExample:{},conjugationExamplePrefix:{},conjugationExampleEmphasis:{},conjugationExampleSuffix:{},conjugationLiteraryCitation:{},conjugationExampleLoading:{type:Boolean},revealPrefilledOptions:{type:Boolean}},emits:["updateQuestionCount","updateExerciseKind","updateIdentificationSource","updateInclusivePronouns","updateIncludeOnPronoun","updateComplementOptions","prefilledOptionsRevealStart"],setup(e,{emit:n}){const{ui:t}=et(),a=e,i=n,l=Y(!!a.gridLayout),u=z(()=>(a.complementVerbs??[]).filter(g=>!!g.complementExample)),c=z(()=>a.exerciseKind==="conjugation"&&u.value.length>0),d=z(()=>u.value.some(g=>g.complementFunctions?.includes("cod")||g.complementExample?.functionObject==="cod")),v=z(()=>u.value.some(g=>g.complementFunctions?.includes("coi")||g.complementExample?.functionObject==="coi")),k=z(()=>u.value.some(g=>g.anteposableComplementFunctions?.includes("cod")||!!g.complementExample?.before)),_=z(()=>u.value.some(g=>g.anteposableComplementFunctions?.includes("coi"))),A=z(()=>a.idPrefix??"challenge-options"),I=z(()=>`${A.value}-title`),$=z(()=>`${A.value}-question-count`),b=z(()=>`${A.value}-exercise-kind`),P=z(()=>`${A.value}-identification-source`),h=z(()=>`${A.value}-complement-panel`),m=z(()=>!!((a.conjugationInstruction||a.conjugationQuestionContext||a.conjugationQuestion)&&a.conjugationExample)),C=z(()=>{const g=a.conjugationQuestion?.trim()??"";return g&&!/[.!?]$/u.test(g)?`${g}.`:g}),y=Y(0),F=[],te=Y(a.questionCount),Z=Y([...a.complementOptions]),D=Y(!1),ne=Y(null);let G,q;const _e=[];function Re(){for(G!==void 0&&(cancelAnimationFrame(G),G=void 0);_e.length;)clearTimeout(_e.pop())}function Fe(){Re(),te.value=a.questionCount,Z.value=[...a.complementOptions],D.value=!1}function tt(){if(D.value)return;if(i("prefilledOptionsRevealStart"),Re(),window.matchMedia("(prefers-reduced-motion: reduce)").matches){Fe();return}const g=Math.max(0,a.questionCount),o=[...a.complementOptions],p=500,j=performance.now();D.value=!0,te.value=0,Z.value=[];const R=se=>{const xe=Math.min(1,(se-j)/p);te.value=Math.round(g*xe),xe<1?G=requestAnimationFrame(R):G=void 0};G=requestAnimationFrame(R),o.forEach((se,xe)=>{_e.push(setTimeout(()=>{Z.value=[...Z.value,se]},Math.round(xe/o.length*p)))}),_e.push(setTimeout(Fe,p))}function ye(){for(;F.length;)clearTimeout(F.pop())}Le(()=>a.conjugationExampleLoading,g=>{ye(),y.value=0,!g&&F.push(setTimeout(()=>{y.value=1},80),setTimeout(()=>{y.value=2},280))},{immediate:!0}),Le(()=>a.questionCount,g=>{D.value||(te.value=g)}),Le(()=>a.complementOptions,g=>{D.value||(Z.value=[...g])},{deep:!0}),Le(()=>a.revealPrefilledOptions,g=>{g&&tt()}),kt(()=>{a.revealPrefilledOptions&&tt()}),In(()=>{ye(),Re(),q!==void 0&&cancelAnimationFrame(q)});function Ke(g){D.value&&Fe();const o=g.target.value;if(o==="")return;const p=Number(o);Number.isFinite(p)&&i("updateQuestionCount",Math.min(99,Math.max(1,Math.round(p))))}async function nt(g){const o=g.target.value;i("updateExerciseKind",o),!(!a.gridLayout||o!=="tense-identification")&&(await Mt(),q!==void 0&&cancelAnimationFrame(q),q=requestAnimationFrame(()=>{ne.value?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"}),q=void 0}))}function Ce(g,o){D.value&&Fe();const p=new Set(a.complementOptions);o?p.add(g):p.delete(g),i("updateComplementOptions",[...p])}return Le(c,g=>{g?a.gridLayout&&(l.value=!0):l.value=!1},{immediate:!0}),(g,o)=>(x(),S("section",{class:ke(["builder-card options-card",{"options-card--grid":e.gridLayout,"options-card--revealing":s(D)}]),"aria-labelledby":s(I)},[r("div",Bu,[r("div",null,[r("p",Wu,f(e.eyebrow??"Étape 3"),1),r("h2",{id:s(I)},f(s(t)("Mes options")),9,Uu)])]),r("div",{class:ke(["options-layout",{"options-layout--columns":e.gridLayout}])},[r("div",{class:ke(["options-fields",{"options-fields--columns":e.gridLayout}])},[r("div",Vu,[r("label",{class:"field-stack question-count-field",for:s($)},[r("span",null,f(s(t)("Nombre de questions")),1),r("input",{id:s($),type:"number",inputmode:"numeric",min:"1",max:"99",step:"1",value:s(te),onInput:Ke},null,40,Gu)],8,Ku),r("label",Hu,[r("input",{type:"checkbox",checked:e.inclusivePronouns,onChange:o[0]||(o[0]=p=>i("updateInclusivePronouns",p.target.checked))},null,40,Yu),r("span",null,[pe(f(s(t)("Inclure les pronoms"))+" ",1),o[9]||(o[9]=r("strong",null,"iel / iels",-1)),r("small",null,f(s(t)("Ils apparaîtront ponctuellement dans les questions.")),1)])]),r("label",Xu,[r("input",{type:"checkbox",checked:e.includeOnPronoun,onChange:o[1]||(o[1]=p=>i("updateIncludeOnPronoun",p.target.checked))},null,40,qu),r("span",null,[pe(f(s(t)("Inclure le pronom"))+" ",1),o[10]||(o[10]=r("strong",null,"on",-1)),r("small",null,f(s(t)("Il apparaîtra ponctuellement dans les questions à la troisième personne du singulier.")),1)])]),r("fieldset",Qu,[r("legend",null,f(s(t)("Type d’exercice")),1),r("div",Ju,[r("label",null,[r("input",{type:"radio",name:s(b),value:"conjugation",checked:e.exerciseKind==="conjugation",onChange:nt},null,40,Zu),r("span",null,f(s(t)("Conjuguer")),1)]),r("label",null,[r("input",{type:"radio",name:s(b),value:"tense-identification",checked:e.exerciseKind==="tense-identification",onChange:nt},null,40,ec),r("span",null,f(s(t)("Trouver le mode et le temps")),1)])])]),e.exerciseKind==="tense-identification"?(x(),S("fieldset",{key:0,ref_key:"identificationSourceFieldset",ref:ne,class:"option-fieldset identification-source-fieldset"},[o[13]||(o[13]=r("legend",{class:"sr-only"},"Choix des verbes",-1)),r("div",tc,[r("label",null,[r("input",{type:"radio",name:s(P),value:"selected-verbs",checked:e.identificationSource==="selected-verbs",onChange:o[2]||(o[2]=p=>i("updateIdentificationSource","selected-verbs"))},null,40,nc),o[11]||(o[11]=r("span",null,[r("strong",null,"Avec mes verbes"),r("small",null,"Formes conjuguées simples, sans citation.")],-1))]),r("label",null,[r("input",{type:"radio",name:s(P),value:"literary-corpus",checked:e.identificationSource==="literary-corpus",onChange:o[3]||(o[3]=p=>i("updateIdentificationSource","literary-corpus"))},null,40,ac),o[12]||(o[12]=r("span",null,[r("strong",null,"Avec n’importe quel verbe"),r("small",null,"Construits avec des phrases littéraires")],-1))])])],512)):M("",!0)]),r("div",{class:ke(["complement-options",{"complement-options--disabled":!s(c),"complement-options--hidden":e.gridLayout&&e.exerciseKind==="tense-identification"}]),"data-tour":"options-complements","aria-hidden":e.gridLayout&&e.exerciseKind==="tense-identification"?"true":void 0},[e.gridLayout?(x(),S("h3",rc,f(s(t)("Compléments d’objets :")),1)):M("",!0),e.gridLayout?(x(),S("p",oc,f(s(t)("Ajoute des compléments d’objets directs ou indirects.")),1)):(x(),S("button",{key:2,class:"complement-options__trigger",type:"button",disabled:!s(c),"aria-expanded":s(l),"aria-controls":s(h),onClick:o[4]||(o[4]=p=>l.value=!s(l))},[r("span",null,[pe(f(s(t)("Compléments d’objets :"))+" ",1),r("small",null,f(s(t)("nouveau")),1)]),r("span",lc,f(s(l)?"−":"+"),1)],8,sc)),s(c)?M("",!0):(x(),S("p",uc,f(e.exerciseKind!=="conjugation"?"Disponible uniquement pour un exercice de conjugaison.":"Les verbes choisis ne proposent pas de complément."),1)),qe(yt,{name:"complement-panel"},{default:Qe(()=>[e.gridLayout||s(l)?(x(),S("fieldset",{key:0,id:s(h),class:"complement-options__panel"},[r("legend",fc,f(s(t)("Présentation des compléments d’objets")),1),r("label",null,[r("input",{type:"checkbox",disabled:!s(c)||!s(d),checked:s(Z).includes("cod-after"),onChange:o[5]||(o[5]=p=>Ce("cod-after",p.target.checked))},null,40,dc),r("span",null,[r("strong",null,f(s(t)("COD placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!s(c)||!s(k),checked:s(Z).includes("cod-before"),onChange:o[6]||(o[6]=p=>Ce("cod-before",p.target.checked))},null,40,mc),r("span",null,[r("strong",null,f(s(t)("COD placé avant")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!s(c)||!s(v),checked:s(Z).includes("coi-after"),onChange:o[7]||(o[7]=p=>Ce("coi-after",p.target.checked))},null,40,pc),r("span",null,[r("strong",null,f(s(t)("COI placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!s(c)||!s(_),checked:s(Z).includes("coi-before"),onChange:o[8]||(o[8]=p=>Ce("coi-before",p.target.checked))},null,40,gc),r("span",null,[r("strong",null,f(s(t)("COI placé avant")),1)])])],8,cc)):M("",!0)]),_:1})],10,ic)],2),e.gridLayout&&(e.conjugationExampleLoading||s(m))?(x(),S("div",{key:0,class:ke(["conjugation-example",{"conjugation-example--wide":e.exerciseKind==="tense-identification"}]),"data-tour":"options-preview","aria-live":"polite","aria-atomic":"true"},[r("div",vc,[o[14]||(o[14]=r("span",{class:"conjugation-example__preview-icon","aria-hidden":"true"},[r("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},[r("path",{d:"M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z"}),r("circle",{cx:"12",cy:"12",r:"3"})])],-1)),r("div",bc,[r("span",null,f(s(t)("Aperçu d’une question")),1)])]),r("div",hc,[e.conjugationExampleLoading?(x(),S("div",yc,[o[15]||(o[15]=r("span",{class:"conjugation-example__spinner","aria-hidden":"true"},null,-1)),r("span",xc,f(s(t)("Préparation de l’aperçu")),1)])):(x(),S("div",wc,[qe(yt,{name:"example-item"},{default:Qe(()=>[s(y)>=1?(x(),S("div",_c,[r("span",kc,f(s(t)("Exemple de question")),1),e.exerciseKind==="tense-identification"&&e.conjugationInstruction&&e.conjugationQuestion?(x(),S(H,{key:0},[r("p",Sc,f(e.conjugationInstruction),1),e.conjugationLiteraryCitation?(x(),S("blockquote",$c,[r("p",null,[r("span",null,f(e.conjugationLiteraryCitation.before),1),r("mark",null,f(e.conjugationLiteraryCitation.target),1),r("span",null,f(e.conjugationLiteraryCitation.after),1)]),r("footer",null,[pe(f(e.conjugationLiteraryCitation.author)+", ",1),r("cite",null,f(e.conjugationLiteraryCitation.work),1)])])):(x(),S("p",Cc,[r("span",Pc,f(s(C)),1)]))],64)):(x(),S(H,{key:1},[e.conjugationInstruction?(x(),S("p",Ic,f(e.conjugationInstruction),1)):M("",!0),e.conjugationQuestionContext?(x(),S("p",Ac,[r("span",Tc,f(e.conjugationQuestionContext),1)])):M("",!0)],64))])):M("",!0)]),_:1}),qe(yt,{name:"example-item"},{default:Qe(()=>[s(y)>=2?(x(),S("div",Oc,[r("span",null,f(s(t)("Réponse attendue")),1),r("p",null,[e.conjugationExampleEmphasis?(x(),S(H,{key:0},[r("span",null,f(e.conjugationExamplePrefix),1),r("strong",null,f(e.conjugationExampleEmphasis),1),r("span",null,f(e.conjugationExampleSuffix),1)],64)):(x(),S("span",zc,f(e.conjugationExample),1))])])):M("",!0)]),_:1})]))])],2)):M("",!0)],2)],10,Ru))}}),Nm=Object.assign(Kt(jc,[["__scopeId","data-v-2cee754f"]]),{__name:"ChallengeOptions"}),Fc=["aria-labelledby","aria-label"],Ec={key:0,class:"preset-browser"},Lc={class:"preset-browser__columns"},Nc={class:"preset-browser__column","data-browser-column":"1","aria-labelledby":"preset-browser-groups"},Mc={id:"preset-browser-groups"},Dc={class:"preset-browser__list"},Rc=["aria-pressed","onClick"],Bc=["aria-label"],Wc={class:"preset-browser__list"},Uc={class:"preset-browser__info","data-preset-info":""},Vc=["aria-expanded","aria-controls","aria-label","onMouseenter","onClick"],Kc=["id"],Gc={class:"preset-browser__tooltip-section"},Hc={class:"preset-browser__verb-badges"},Yc={key:0,class:"preset-browser__other-verbs"},Xc={class:"preset-browser__tooltip-section"},qc=["aria-pressed","onClick"],Qc=["aria-label"],Jc={class:"preset-browser__list"},Zc={class:"preset-browser__count"},ef={class:"preset-panel__intro"},tf={class:"builder-card__eyebrow"},nf={id:"presets-title"},af={class:"preset-mobile-select"},rf=["value"],of={value:""},sf=["label"],lf=["value"],uf=["aria-label"],cf=["id","aria-selected","aria-controls","tabindex","onClick","onKeydown"],ff=["id","aria-labelledby"],df=["onClick"],mf={key:0,class:"preset-card__random"},pf=["onClick"],gf=["onClick"],vf=["onClick"],bf=Ve({__name:"PresetPicker",props:{presets:{},activePresetId:{},compact:{type:Boolean},verbs:{},modes:{},tenses:{}},emits:["select","stageChange"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=et(),{track:i}=ja(),l=e,u=n,c=z(()=>{const g=new Map;return l.presets.forEach(o=>{const p=g.get(o.group)??[];p.push(o),g.set(o.group,p)}),[...g.entries()].map(([o,p])=>({id:o,label:p[0]?.groupLabel??Oa[o]??o,order:p[0]?.groupOrder??fr.indexOf(o),presets:p})).sort((o,p)=>o.order-p.order||o.label.localeCompare(p.label,"fr"))}),d=Y("school"),v=z(()=>c.value.find(g=>g.id===d.value)??c.value[0]),k=Y(""),_=z(()=>l.presets.find(g=>g.id===k.value)),A=Y(null),I=Y(null),$=z(()=>c.value.find(g=>g.id===A.value)),b=z(()=>l.presets.find(g=>g.id===I.value)),P=Y(null),h=Y(null),m=Y(null),C=new Set,y=z(()=>new Map((l.verbs??[]).map(g=>[g.id,g.infinitif]))),F=z(()=>new Map((l.tenses??[]).map(g=>[g.id,g]))),te=z(()=>new Map((l.modes??[]).map(g=>[g.id,g])));function Z(g){return h.value===g||m.value===g}function D(g){return g.verbIds.slice(0,12).map(o=>y.value.get(o)??`Verbe ${o}`)}function ne(g){const o=new Map;for(const p of g.tenseIds){const j=F.value.get(p);if(!j)continue;const R=te.value.get(j.modeId),se=o.get(j.modeId)??{mode:a(R?.name??j.mode?.name??t("Autres temps")),order:R?.order??j.mode?.order??Number.MAX_SAFE_INTEGER,tenses:[]};se.tenses.push(a(j.name)),o.set(j.modeId,se)}return[...o.values()].sort((p,j)=>p.order-j.order||p.mode.localeCompare(j.mode,"fr"))}function G(g){m.value=m.value===g?null:g}function q(g){g.target?.closest("[data-preset-info]")||(m.value=null)}kt(()=>document.addEventListener("pointerdown",q)),In(()=>document.removeEventListener("pointerdown",q));function _e(g){for(const o of g)C.has(o.id)||(C.add(o.id),i("feature_exposed",{feature:"preset",item:o.id}))}Le([()=>l.compact,v,$],([g,o,p])=>{if(g){p&&_e(p.presets);return}o&&_e(o.presets)},{immediate:!0});function Re(g){Mt(()=>{const o=P.value;if(!o||o.scrollWidth<=o.clientWidth+1)return;o.querySelector(`[data-browser-column="${g}"]`)?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"end"})})}function Fe(g){A.value=g,I.value=null,m.value=null,h.value=null,u("stageChange","presets"),Re(2)}function tt(g){I.value=g,Re(3)}function ye(g,o){I.value=null,u("select",g,o)}function Ke(g){k.value=g.target.value,_.value&&u("select",_.value)}function nt(g,o){let p;if((g.key==="ArrowRight"||g.key==="ArrowDown")&&(p=(o+1)%c.value.length),(g.key==="ArrowLeft"||g.key==="ArrowUp")&&(p=(o-1+c.value.length)%c.value.length),g.key==="Home"&&(p=0),g.key==="End"&&(p=c.value.length-1),p===void 0)return;g.preventDefault();const j=c.value[p];j&&(d.value=j.id,Mt(()=>document.getElementById(`preset-tab-${j.id}`)?.focus()))}function Ce(g,o){u("select",g,Math.min(o,g.verbIds.length))}return(g,o)=>(x(),S("section",{class:ke(["preset-panel",{"preset-panel--compact":e.compact}]),"aria-labelledby":e.compact?void 0:"presets-title","aria-label":e.compact?"Défis prêts à l’emploi":void 0},[e.compact?(x(),S("div",Ec,[r("div",{ref_key:"compactBrowser",ref:P,class:"preset-browser__scroll"},[r("div",Lc,[r("section",Nc,[r("h3",Mc,f(s(t)("Catégories")),1),r("div",Dc,[(x(!0),S(H,null,ve(s(c),p=>(x(),S("button",{key:p.id,type:"button",class:ke({"is-selected":s(A)===p.id}),"aria-pressed":s(A)===p.id,onClick:j=>Fe(p.id)},[r("span",null,f(p.label),1),o[7]||(o[7]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,Rc))),128))])]),qe(yt,{name:"browser-column"},{default:Qe(()=>[s($)?(x(),S("section",{key:s($).id,class:"preset-browser__column","data-browser-column":"2","aria-label":`Défis de ${s($).label}`},[r("div",Wc,[(x(!0),S(H,null,ve(s($).presets,p=>(x(),S("div",{key:p.id,class:"preset-browser__preset-row"},[r("div",Uc,[r("button",{class:"preset-browser__info-button",type:"button","aria-expanded":Z(p.id),"aria-controls":`preset-info-${p.id}`,"aria-label":`Informations sur ${p.label}`,onMouseenter:j=>h.value=p.id,onMouseleave:o[0]||(o[0]=j=>h.value=null),onClick:Dt(j=>G(p.id),["stop"])},"i",40,Vc),Z(p.id)?(x(),S("section",{key:0,id:`preset-info-${p.id}`,class:"preset-browser__tooltip","aria-live":"polite"},[r("header",null,[r("strong",null,f(p.label),1),r("span",null,f(p.questionCount)+" "+f(s(t)("questions")),1)]),r("div",Gc,[r("h4",null,f(s(t)("Verbes")),1),r("div",Hc,[(x(!0),S(H,null,ve(D(p),j=>(x(),S("span",{key:j},f(j),1))),128))]),p.verbIds.length>12?(x(),S("p",Yc,"+ "+f(p.verbIds.length-12)+" "+f(s(t)("autres verbes")),1)):M("",!0)]),r("div",Xc,[r("h4",null,f(s(t)("Temps")),1),r("dl",null,[(x(!0),S(H,null,ve(ne(p),j=>(x(),S("div",{key:j.mode},[r("dt",null,f(j.mode),1),r("dd",null,f(j.tenses.join(", ")),1)]))),128))])])],8,Kc)):M("",!0)]),r("button",{class:ke(["preset-browser__preset-button",{"is-selected":s(I)===p.id||e.activePresetId===p.id}]),type:"button","aria-pressed":s(I)===p.id,onClick:j=>tt(p.id)},[r("span",null,[r("strong",null,f(p.label),1)]),o[8]||(o[8]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,qc)]))),128))])],8,Bc)):M("",!0)]),_:1}),qe(yt,{name:"browser-column"},{default:Qe(()=>[s(b)?(x(),S("section",{key:s(b).id,class:"preset-browser__column preset-browser__column--quantity","data-browser-column":"3","aria-label":s(t)("Choisir le nombre de verbes")},[r("div",Jc,[r("button",{type:"button",onClick:o[1]||(o[1]=p=>ye(s(b)))},[r("span",null,[r("strong",null,f(s(t)("Tous les verbes")),1)]),r("span",Zc,f(s(b).verbIds.length),1),o[9]||(o[9]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))]),o[20]||(o[20]=r("span",{class:"preset-browser__quantity-separator","aria-hidden":"true"},null,-1)),s(b).verbIds.length>=1&&s(b).verbIds.length<5?(x(),S("button",{key:0,type:"button",onClick:o[2]||(o[2]=p=>ye(s(b),1))},[r("span",null,[r("strong",null,f(s(t)("1 au hasard")),1)]),o[10]||(o[10]=r("span",{class:"preset-browser__count"},"1",-1)),o[11]||(o[11]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),s(b).verbIds.length>=2&&s(b).verbIds.length<5?(x(),S("button",{key:1,type:"button",onClick:o[3]||(o[3]=p=>ye(s(b),2))},[r("span",null,[r("strong",null,f(s(t)("2 au hasard")),1)]),o[12]||(o[12]=r("span",{class:"preset-browser__count"},"2",-1)),o[13]||(o[13]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),s(b).verbIds.length>=3?(x(),S("button",{key:2,type:"button",onClick:o[4]||(o[4]=p=>ye(s(b),3))},[r("span",null,[r("strong",null,f(s(t)("3 au hasard")),1)]),o[14]||(o[14]=r("span",{class:"preset-browser__count"},"3",-1)),o[15]||(o[15]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),s(b).verbIds.length>=5?(x(),S("button",{key:3,type:"button",onClick:o[5]||(o[5]=p=>ye(s(b),5))},[r("span",null,[r("strong",null,f(s(t)("5 au hasard")),1)]),o[16]||(o[16]=r("span",{class:"preset-browser__count"},"5",-1)),o[17]||(o[17]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),s(b).verbIds.length>=10?(x(),S("button",{key:4,type:"button",onClick:o[6]||(o[6]=p=>ye(s(b),10))},[r("span",null,[r("strong",null,f(s(t)("10 au hasard")),1)]),o[18]||(o[18]=r("span",{class:"preset-browser__count"},"10",-1)),o[19]||(o[19]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0)])],8,Qc)):M("",!0)]),_:1})])],512)])):(x(),S(H,{key:1},[r("div",ef,[r("div",null,[r("p",tf,f(s(t)("Pour démarrer rapidement")),1),r("h2",nf,f(s(t)("Défis prêts à l’emploi")),1)]),r("p",null,f(s(t)("Choisissez un niveau ou une famille de verbes, puis ajustez librement la sélection.")),1)]),r("label",af,[r("span",null,f(s(t)("Choisir un défi prêt à l’emploi")),1),r("select",{value:e.activePresetId??s(k),onChange:Ke},[r("option",of,f(s(t)("Choisir un niveau ou un entraînement…")),1),(x(!0),S(H,null,ve(s(c),p=>(x(),S("optgroup",{key:p.id,label:p.label},[(x(!0),S(H,null,ve(p.presets,j=>(x(),S("option",{key:j.id,value:j.id},f(j.label)+" — "+f(j.verbIds.length)+" "+f(s(t)("verbes")),9,lf))),128))],8,sf))),128))],40,rf)]),r("div",{class:"preset-groups",role:"tablist","aria-label":s(t)("Catégories de défis")},[(x(!0),S(H,null,ve(s(c),(p,j)=>(x(),S("button",{id:`preset-tab-${p.id}`,key:p.id,class:ke(["preset-group-button",{"preset-group-button--active":s(v)?.id===p.id}]),type:"button",role:"tab","aria-selected":s(v)?.id===p.id,"aria-controls":`preset-content-${p.id}`,tabindex:s(v)?.id===p.id?0:-1,onClick:R=>d.value=p.id,onKeydown:R=>nt(R,j)},f(p.label),43,cf))),128))],8,uf),s(v)?(x(),S("div",{key:0,id:`preset-content-${s(v).id}`,class:"preset-list",role:"tabpanel","aria-labelledby":`preset-tab-${s(v).id}`},[(x(!0),S(H,null,ve(s(v).presets,p=>(x(),S("article",{key:p.id,class:ke(["preset-card",{"preset-card--active":e.activePresetId===p.id}])},[r("button",{type:"button",onClick:j=>u("select",p)},[r("strong",null,f(p.label),1),r("span",null,f(p.description),1),r("small",null,f(p.verbIds.length)+" verbes · "+f(p.questionCount)+" "+f(s(t)("questions")),1)],8,df),p.verbIds.length>5?(x(),S("div",mf,[pe(f(s(t)("Au hasard :"))+" ",1),r("button",{type:"button",onClick:j=>Ce(p,1)},"1",8,pf),r("button",{type:"button",onClick:j=>Ce(p,5)},"5",8,gf),r("button",{type:"button",onClick:j=>Ce(p,10)},"10",8,vf)])):M("",!0)],2))),128))],8,ff)):M("",!0)],64))],10,Fc))}}),Mm=Object.assign(Kt(bf,[["__scopeId","data-v-405192b2"]]),{__name:"ChallengePresetPicker"}),Pa="Quel est le mode et le temps de cette forme conjuguée ?";function Pn(e,n){const t=String(e||"").split(/\r?\n/u);return Math.max(1,t.reduce((a,i)=>{const l=i.replace(/\s+/g," ").trim();return a+Math.max(1,Math.ceil(l.length/n))},0))}function hf(e,n=8){return 5+n+(Pn(e,86)-1)*5}function Ia(e,n){return 8+(Math.max(Pn(e,54),Pn(n,38))-1)*5}function Aa(e,n,t,a){const i=[];let l=[],u=0,c=n;return e.forEach((d,v)=>{const k=Math.max(1,a(d));l.length>0&&u+k>c&&(i.push(l),l=[],u=0,c=t),l.push({item:d,index:v}),u+=k}),l.length>0&&i.push(l),i}const Hi=".................................",yf="......................................",xf=32;function wf(e,n){return n.mode?.trim().toLocaleLowerCase("fr-CH")!=="subjonctif"||n.complementPosition==="before"||/^(?:que|qu['’])\s*/iu.test(e)?e:`que ${e}`.replace(/^que (i(?:l|ls|el|els)|elle?s?|on)\b/iu,"qu'$1")}function _f(e,n){const t=wf(e.trim(),n),[a="",...i]=t.split("…"),l=i.join("…").trim(),c=n.mode?.trim().toLocaleLowerCase("fr-CH")==="impératif"&&!l.endsWith("!")?`${l}${l?" ":""}!`:l,d=n.complementPosition!=="before"&&n.saisiePrefixe!==void 0?n.saisiePrefixe.trim():a.trim(),v=Hi,k=c.length>xf,_=k?Math.max(32,Math.min(58,72-Math.round(c.length*.65))):100;return{completionPrefix:d,completionSuffix:c,fillBlank:t.includes("…")||i.length===0,suffixOnNextLine:k,blankWidthPercent:_,completion:[d,v,c].filter(Boolean).join(" ")}}function Ye(e,n){if(n==="tense-identification"){const c=e.literaryCitation?`${e.literaryCitation.before}【${e.literaryCitation.target}】${e.literaryCitation.after} — ${e.literaryCitation.author}, ${e.literaryCitation.work}`:e.consigne;return{label:"",completion:c,completionPrefix:c,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100}}if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="gérondif"){const c=e.infinitif||e.titre,d=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${c} | ${d} :`,completion:`en ${yf}`,completionPrefix:"en",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="participe"){const c=e.infinitif||e.titre,d=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${c} | ${d} :`,completion:Hi,completionPrefix:"",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}const t=e.consigne.split("|").map(c=>c.trim());if(t.length<3)return{label:"",completion:e.consigne,completionPrefix:e.consigne,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100};const a=t.slice(0,-2).join(" | "),i=t.at(-2)||e.infinitif||"",l=t.at(-1)||[e.temps,e.mode?`(${e.mode})`:""].filter(Boolean).join(" "),u=_f(a,e);return{label:`${i} | ${l} :`,...u}}function kf(e,n){const t=Ye(e,n);return[t.label,t.completion].filter(Boolean).join(" ")}function Nt(e){const n=[...new Set(e.reponsesPourCorrige.map(t=>t.trim()).filter(Boolean))];return e.isCompound&&n.length>1?n.slice(0,1):n}function on(e,n){if(["gérondif","participe"].includes(e.mode?.trim().toLocaleLowerCase("fr-CH")||""))return e.consigne;const t=Ye(e,n);return t.label||t.completion}function Ta(e){return Nt(e).join(`
`)}const Sf={ref:"print-dialog",class:"print-overlay","data-tour":"print-preview",role:"dialog","aria-modal":"true","aria-labelledby":"print-preview-title",tabindex:"-1"},$f={class:"print-toolbar no-print"},Cf={id:"print-preview-title"},Pf=["disabled"],If=["disabled"],Af={class:"print-preview-layout"},Tf={class:"print-settings no-print","data-tour":"print-settings","aria-labelledby":"print-settings-title"},Of={class:"print-settings__heading"},zf={id:"print-settings-title"},jf={class:"print-settings__field",for:"preview-print-title"},Ff=["value"],Ef={class:"print-settings__group"},Lf={class:"print-settings__number-field",for:"preview-title-spacing"},Nf=["value"],Mf={class:"print-settings__number-field",for:"preview-question-spacing"},Df=["value"],Rf={class:"print-settings__group"},Bf=["checked"],Wf=["checked"],Uf=["checked"],Vf=["checked"],Kf={class:"print-settings__group"},Gf=["checked"],Hf=["checked"],Yf=["checked"],Xf={class:"print-document print-document--pdf"},qf=["src","title"],Qf={key:1,class:"pdf-preview-state",role:"status","aria-live":"polite"},Jf={key:2,class:"pdf-preview-state pdf-preview-state--error",role:"alert"},Zf=Ve({__name:"PrintPreview",props:{questions:{},verbs:{},tenses:{},exerciseKind:{},options:{}},emits:["close","updateOptions"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=et(),i=e,l=n,{track:u}=ja(),c=Math.floor(Math.random()*9e3)+1e3,d=Rt("print-dialog"),v=Y(!1),k=Y(!1),_=Y(!0),A=Y(!1),I=Y(""),$=Y("");let b=0,P;function h(g,o,p,j){const R=Number(g);return Number.isFinite(R)?Math.min(j,Math.max(p,R)):o}const m=z(()=>h(i.options.questionSpacingMm,8,2,15)),C=z(()=>h(i.options.titleSpacingMm,30,8,30)),y=z(()=>i.exerciseKind==="tense-identification"),F=z(()=>8+Math.max(0,5-m.value)),te=z(()=>{let g=226;return(i.options.showFirstName||i.options.showLastName||i.options.showDate)&&(g-=Math.max(0,C.value-1)),i.options.showVerbs&&(g-=8),i.options.showTenses&&(g-=8),y.value?g-=19:g-=6,g}),Z=z(()=>Aa(i.questions,te.value,220,g=>{const o=Ye(g,i.exerciseKind);return hf(kf(g,i.exerciseKind),m.value)+(o.suffixOnNextLine?6:0)+(y.value?F.value:0)+(g.literaryCitation?4:0)})),D=z(()=>Aa(i.questions,205,220,g=>y.value?Ia("",Ta(g)):Ia(on(g,i.exerciseKind),Ta(g))));Fa(d,()=>l("close"));function ne(g,o){l("updateOptions",{...i.options,[g]:o})}function G(g){return String(g??"").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/…/g,"...").replace(/–|—/g,"-").replace(/【/g,"[").replace(/】/g,"]")}function q(g){return String(g??"").replace(new RegExp("^(\\s*)(\\p{L})","u"),(o,p,j)=>`${p}${j.toLocaleUpperCase("fr-CH")}`)}function _e(g){return String(g??"").split(`
`).map(q).join(`
`)}function Re(){return`${(i.options.title||t("Défi de conjugaison")).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"")||"defi-conjugaison"}.pdf`}async function Fe(){const{jsPDF:g}=await Un(async()=>{const{jsPDF:L}=await import("./BF4OoX5C.js").then(W=>W.j);return{jsPDF:L}},__vite__mapDeps([0,1,2]),import.meta.url),o=new g({orientation:"portrait",unit:"mm",format:"a4",compress:!0}),p=210,j=297,R=17,se=193,xe=G(i.options.title||t("Défi de conjugaison")),at=i.options.showRandomNumber?` n° ${c}`:"";let de=0;function Pt(){de>0&&o.addPage("a4","portrait"),de+=1}function it(){o.setFont("helvetica","normal"),o.setFontSize(8),o.setTextColor(105,105,105),o.text("conjugaison.tatitotu.ch",p/2,j-8,{align:"center"}),o.setTextColor(20,20,20)}function ft(L){if(L)return o.setFont("helvetica","normal"),o.setFontSize(8.5),o.setTextColor(90,90,90),o.text(`${xe}${at}`,p/2,12,{align:"center"}),o.setTextColor(20,20,20),32;let W=18;const N=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean);N.length&&(o.setFont("helvetica","normal"),o.setFontSize(8.5),o.text(G(N.join("     ")),R,W),W+=C.value),i.options.showGrade&&(o.setDrawColor(40,40,40),o.rect(se-17,15,17,17)),o.setFont("helvetica","bold"),o.setFontSize(17);const le=`${xe}${at}`,ue=o.splitTextToSize(le.toUpperCase(),150);if(o.text(ue,R,W+8),W+=ue.length*7+10,o.setFontSize(9),i.options.showVerbs){const U=o.splitTextToSize(`Verbes : ${G(i.verbs.map(E=>E.infinitif).join(", "))}`,176);o.text(U,R,W),W+=U.length*4.5+2}if(i.options.showTenses){const U=o.splitTextToSize(`${t("Temps :")} ${G(i.tenses.map(E=>a(E.name)).join(", "))}`,176);o.text(U,R,W),W+=U.length*4.5+2}return y.value&&(o.setDrawColor(120,120,120),o.rect(R,W,176,10),o.text(Pa,R+3,W+6),W+=21),W+(y.value?2:8)}function dt(L){return L?(o.setFont("helvetica","normal"),o.setFontSize(8.5),o.setTextColor(90,90,90),o.text(`${xe} - corrigé${at}`,p/2,12,{align:"center"}),o.setTextColor(20,20,20),32):(o.setFont("helvetica","bold"),o.setFontSize(17),o.setTextColor(20,20,20),o.text(`${t("CORRIGÉ")}${at}`,R,26),38)}function mt(L,W){const N=L.literaryCitation;if(!N)return null;const le=G(N.before).replace(/\s+/gu," "),ue=G(N.target).replace(/\s+/gu," "),U=G(N.after).replace(/\s+/gu," "),E=q(`${le}${ue}${U}`),ge=G(`- ${N.author}, ${N.work}`),ae=le.length,ee=ae+ue.length;let be=0;const me=o.splitTextToSize(E,W).map(Ge=>{const ie=E.indexOf(Ge,be),we=ie>=0?ie:be;return be=we+Ge.length,{text:Ge,start:we}}),V=o.getFontSize(),ce=o.getFont().fontStyle;o.setFont("helvetica","italic"),o.setFontSize(8.3);const Pe=o.splitTextToSize(ge,W);return o.setFont("helvetica",ce),o.setFontSize(V),{lines:me,sourceLines:Pe,targetStart:ae,targetEnd:ee,height:me.length*5+Pe.length*4}}function Qt(L,W,N){L.lines.forEach((U,E)=>{const ge=N+E*5;o.text(U.text,W,ge);const ae=Math.max(U.start,L.targetStart),ee=Math.min(U.start+U.text.length,L.targetEnd);if(ee<=ae)return;const be=U.text.slice(0,ae-U.start),me=U.text.slice(ae-U.start,ee-U.start),V=W+o.getTextWidth(be);o.setDrawColor(25,25,25),o.setLineWidth(.25),o.line(V,ge+.8,V+o.getTextWidth(me),ge+.8)});const le=o.getFontSize(),ue=o.getFont().fontStyle;o.setFont("helvetica","italic"),o.setFontSize(8.3),o.setTextColor(90,90,90),L.sourceLines.forEach((U,E)=>{o.text(U,W,N+L.lines.length*5+E*4)}),o.setTextColor(20,20,20),o.setFont("helvetica",ue),o.setFontSize(le)}function pt(L,W){Pt();let N=ft(W);o.setFontSize(10.5),L.forEach(({item:le,index:ue})=>{const U=`${ue+1}. `,E=Ye(le,i.exerciseKind);o.setFont("helvetica","normal");const ge=o.splitTextToSize(G(q(E.label)),68),ae=E.label?96:169,ee=mt(le,ae),be=ee?[...ee.lines.map(Ae=>Ae.text),...ee.sourceLines]:E.fillBlank?[G(q(E.completion))]:o.splitTextToSize(G(q(E.completion)),ae),me=E.label?96:R+7,V=G(q(E.completionPrefix)),ce=G(E.completionSuffix),Pe=me+(V?o.getTextWidth(V)+2:0),Ge=se-(!E.suffixOnNextLine&&ce?o.getTextWidth(ce)+2:0),ie=E.suffixOnNextLine?me+ae*(E.blankWidthPercent/100):Ge;let we="",Ie=[];if(E.suffixOnNextLine&&ce){const Ae=ie+2,re=Math.max(0,se-Ae),Te=ce.split(/\s+/u).filter(Boolean),Oe=[];for(;Te.length;){const It=[...Oe,Te[0]].join(" ");if(Oe.length&&o.getTextWidth(It)>re||!Oe.length&&o.getTextWidth(It)>re)break;Oe.push(Te.shift())}we=Oe.join(" "),Ie=Te.length?o.splitTextToSize(Te.join(" "),ae):[]}const rt=E.suffixOnNextLine?1+Ie.length:be.length,He=Math.max(ge.length,rt);if(o.text(U,R,N),E.label&&o.text(ge,R+7,N),E.fillBlank?(V&&o.text(V,me,N),ce&&!E.suffixOnNextLine&&o.text(ce,se,N,{align:"right"}),ie>Pe&&(o.setLineDashPattern([.7,.7],0),o.setDrawColor(55,55,55),o.line(Pe,N+.8,ie,N+.8),o.setLineDashPattern([],0)),E.suffixOnNextLine&&(we&&o.text(we,ie+2,N),Ie.forEach((Ae,re)=>{o.text(Ae,me,N+5+re*5)}))):ee?Qt(ee,me,N):o.text(be,me,N),y.value){const Ae=ee?ee.height:He*5,re=N+Ae+2,Te=G(t("Mode :")),Oe=G(t("Temps :"));o.setFont("helvetica","bold"),o.setFontSize(9.5),o.setTextColor(70,70,70),o.text(Te,R+7,re),o.text(Oe,108,re),o.setLineDashPattern([.65,.65],0),o.setDrawColor(105,105,105),o.line(R+7+o.getTextWidth(Te)+2,re+.7,101,re+.7),o.line(108+o.getTextWidth(Oe)+2,re+.7,se,re+.7),o.setLineDashPattern([],0),o.setTextColor(20,20,20),o.setFontSize(10.5),N+=Ae+8+Math.max(5,m.value)}else N+=Math.max(5+m.value,He*5+m.value)}),it()}function gt(L,W){Pt();let N=dt(W);o.setFontSize(9.5),L.forEach(({item:le,index:ue})=>{const U=Nt(le).flatMap(ce=>o.splitTextToSize(G(_e(ce)),y.value?169:82)),E=U.length*5;if(y.value){const ce=Math.max(9,E+4),Pe=N+Math.max(0,(ce-E)/2);o.setFont("helvetica","normal"),o.text(`${ue+1}.`,R,Pe,{baseline:"top"}),o.setFont("helvetica","bold"),o.text(U,R+10,Pe,{baseline:"top"}),o.setDrawColor(225,225,225),o.line(R,N+ce,se,N+ce),N+=ce;return}const ge=o.splitTextToSize(G(q(on(le,i.exerciseKind))),79),ae=ge.length*5,ee=Math.max(8,Math.max(ae,E)+3),be=N+Math.max(0,(ee-5)/2),me=N+Math.max(0,(ee-ae)/2),V=N+Math.max(0,(ee-E)/2);o.setFont("helvetica","normal"),o.text(`${ue+1}.`,R,be,{baseline:"top"}),o.text(ge,R+7,me,{baseline:"top"}),o.setFont("helvetica","bold"),o.text(U,106,V,{baseline:"top"}),o.setDrawColor(220,220,220),o.line(R,N+ee,se,N+ee),N+=ee}),it()}return Z.value.forEach((L,W)=>pt(L,W>0)),D.value.forEach((L,W)=>gt(L,W>0)),o}async function tt(){if(!v.value){u("feature_selected",{feature:"download.pdf"}),v.value=!0;try{(await Fe()).save(Re()),u("pdf_downloaded",{exerciseKind:i.exerciseKind})}catch{u("feature_failed",{feature:"download.pdf"})}finally{v.value=!1}}}function ye(){I.value&&(URL.revokeObjectURL(I.value),I.value="")}async function Ke(){const g=++b;_.value=!0,A.value=!1,$.value="";try{const p=(await Fe()).output("blob");if(g!==b)return;ye(),I.value=URL.createObjectURL(p)}catch(o){if(g!==b)return;console.error(t("Impossible de générer l’aperçu PDF."),o),$.value=t("L’aperçu PDF n’a pas pu être créé.")}finally{g===b&&(_.value=!1)}}function nt(){P&&clearTimeout(P),P=setTimeout(()=>{P=void 0,Ke()},250)}Le(()=>({questions:i.questions,verbs:i.verbs,tenses:i.tenses,exerciseKind:i.exerciseKind,options:i.options}),nt,{deep:!0}),kt(()=>{u("feature_exposed",{feature:"download.pdf"}),u("feature_exposed",{feature:"download.word"}),Ke()}),In(()=>{b+=1,P&&clearTimeout(P),ye()});async function Ce(){if(!k.value){u("feature_selected",{feature:"download.word"}),k.value=!0;try{const{AlignmentType:g,BorderStyle:o,Document:p,Footer:j,Header:R,HeightRule:se,LeaderType:xe,Packer:at,Paragraph:de,SectionType:Pt,Tab:it,TabStopType:ft,Table:dt,TableBorders:mt,TableCell:Qt,TableLayoutType:pt,TableRow:gt,TextRun:L,UnderlineType:W,VerticalAlign:N,WidthType:le}=await Un(async()=>{const{AlignmentType:B,BorderStyle:Q,Document:oe,Footer:ze,Header:Ee,HeightRule:Xi,LeaderType:qi,Packer:Qi,Paragraph:Ji,SectionType:Zi,Tab:er,TabStopType:tr,Table:nr,TableBorders:ar,TableCell:ir,TableLayoutType:rr,TableRow:or,TextRun:sr,UnderlineType:lr,VerticalAlign:ur,WidthType:cr}=await import("./BOF6v8rb.js");return{AlignmentType:B,BorderStyle:Q,Document:oe,Footer:ze,Header:Ee,HeightRule:Xi,LeaderType:qi,Packer:Qi,Paragraph:Ji,SectionType:Zi,Tab:er,TabStopType:tr,Table:nr,TableBorders:ar,TableCell:ir,TableLayoutType:rr,TableRow:or,TextRun:sr,UnderlineType:lr,VerticalAlign:ur,WidthType:cr}},[],import.meta.url),ue=i.options.title||t("Défi de conjugaison"),U=i.options.showRandomNumber?` n° ${c}`:"",E=9975,ge={top:1020,right:965,bottom:850,left:965,header:360,footer:360,gutter:0},ae={before:0,after:0,line:240},ee=new j({children:[new de({alignment:g.CENTER,spacing:ae,children:[new L({text:"conjugaison.tatitotu.ch",size:16,color:"666666"})]})]}),be=B=>new R({children:[new de({alignment:g.CENTER,spacing:ae,children:[new L({text:B,size:17,color:"666666"})]})]}),me=new R({children:[new de({spacing:ae})]}),V=(B,Q={})=>new de({alignment:Q.alignment,spacing:ae,children:[new L({text:B,bold:Q.bold,size:Q.size??21,font:"Arial"})]}),ce=(B,Q=21)=>{const oe=B.literaryCitation;if(!oe)return[V(q(Ye(B,i.exerciseKind).completion),{size:Q})];const ze=q(oe.before),Ee=oe.before?oe.target:q(oe.target);return[new de({spacing:ae,children:[new L({text:ze,size:Q,font:"Arial"}),new L({text:Ee,size:Q,font:"Arial",underline:{type:W.SINGLE}}),new L({text:oe.after,size:Q,font:"Arial"})]}),new de({spacing:{before:50,after:0,line:220},children:[new L({text:`— ${oe.author}, ${oe.work}`,size:Math.max(15,Q-3),italics:!0,color:"666666",font:"Arial"})]})]},Pe=B=>{const Q=Ye(B,i.exerciseKind);if(!Q.fillBlank)return[V(q(Q.completion),{size:21})];const oe=q(Q.completionPrefix),ze=Q.completionSuffix;return[new de({spacing:ae,tabStops:[{type:ft.RIGHT,position:5300,leader:xe.DOT}],children:[new L({size:21,font:"Arial",children:[...oe?[oe," "]:[],new it,...ze?[` ${ze}`]:[]]})]})]},Ge=()=>new de({spacing:{before:150,after:40,line:240},tabStops:[{type:ft.RIGHT,position:4300,leader:xe.DOT},{type:ft.RIGHT,position:9250,leader:xe.DOT}],children:[new L({text:`${t("Mode :")} `,bold:!0,size:19,color:"555555",font:"Arial"}),new L({children:[new it],size:19,font:"Arial"}),new L({text:`   ${t("Temps :")} `,bold:!0,size:19,color:"555555",font:"Arial"}),new L({children:[new it],size:19,font:"Arial"})]}),ie=(B,Q,oe={})=>new Qt({children:B,width:{size:Q,type:le.DXA},verticalAlign:N.CENTER,borders:oe.borders,margins:oe.margins??{top:70,bottom:70,left:70,right:70}}),we={bottom:{style:o.SINGLE,size:2,color:"D9D9D9"}},Ie=[],rt=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean),He=i.options.showGrade?965:0,Ae=rt.length>0?Math.floor((E-He)/rt.length):E-He;if(rt.forEach(B=>Ie.push(ie([V(B,{size:18})],Ae))),rt.length===0&&i.options.showGrade&&Ie.push(ie([V("")],E-He)),i.options.showGrade){const B={style:o.SINGLE,size:8,color:"333333"};Ie.push(ie([V("")],He,{borders:{top:B,bottom:B,left:B,right:B},margins:{top:0,bottom:0,left:0,right:0}}))}const re=[];Ie.length>0&&re.push(new dt({width:{size:E,type:le.DXA},columnWidths:Ie.map(B=>B.options.width?.size),layout:pt.FIXED,borders:mt.NONE,rows:[new gt({height:{value:700,rule:se.ATLEAST},cantSplit:!0,children:Ie})]})),re.push(new de({spacing:{before:Math.round(C.value*56.7),after:260},children:[new L({text:ue.toUpperCase(),bold:!0,size:34,font:"Arial"}),new L({text:U,size:18,font:"Arial"})]})),i.options.showVerbs&&re.push(V(`Verbes : ${i.verbs.map(B=>B.infinitif).join(", ")}`,{bold:!0,size:19})),i.options.showTenses&&re.push(V(`${t("Temps :")} ${i.tenses.map(B=>a(B.name)).join(", ")}`,{bold:!0,size:19})),y.value?re.push(new de({spacing:{before:160,after:480},border:{top:{style:o.SINGLE,size:4,color:"777777"},bottom:{style:o.SINGLE,size:4,color:"777777"},left:{style:o.SINGLE,size:4,color:"777777"},right:{style:o.SINGLE,size:4,color:"777777"}},children:[new L({text:Pa,size:19,font:"Arial"})]})):re.push(new de({spacing:{before:0,after:340},children:[]})),re.push(new dt({width:{size:E,type:le.DXA},columnWidths:y.value?[480,9495]:[480,3900,5595],layout:pt.FIXED,borders:mt.NONE,rows:i.questions.map((B,Q)=>{const oe=Ye(B,i.exerciseKind),ze=[ie([V(`${Q+1}.`,{size:21})],480,{margins:{top:90,bottom:90,left:0,right:40}}),ie([...ce(B),Ge()],9495,{margins:{top:90,bottom:100,left:70,right:70}})],Ee=[ie([V(`${Q+1}.`,{size:21})],480,{margins:{top:70,bottom:70,left:0,right:40}}),ie([V(q(oe.label),{size:21})],3900),ie(Pe(B),5595)];return new gt({cantSplit:!0,height:{value:Math.round(((y.value?13:5)+Math.max(y.value?5:0,m.value))*56.7),rule:se.ATLEAST},children:y.value?ze:Ee})})}));const Te=[new de({spacing:{before:0,after:260},children:[new L({text:t("CORRIGÉ"),bold:!0,size:34,font:"Arial"}),new L({text:U,size:18,font:"Arial"})]}),new dt({width:{size:E,type:le.DXA},columnWidths:y.value?[480,9495]:[480,5100,4395],layout:pt.FIXED,borders:mt.NONE,rows:i.questions.map((B,Q)=>{const oe=[ie([V(`${Q+1}.`,{size:19})],480,{borders:we,margins:{top:70,bottom:70,left:0,right:40}}),ie(Nt(B).map(Ee=>V(_e(Ee),{bold:!0,size:19})),9495,{borders:we,margins:{top:70,bottom:70,left:70,right:70}})],ze=[ie([V(`${Q+1}.`,{size:19})],480,{borders:we,margins:{top:55,bottom:55,left:0,right:40}}),ie([V(q(on(B,i.exerciseKind)),{size:19})],5100,{borders:we,margins:{top:55,bottom:55,left:70,right:70}}),ie(Nt(B).map(Ee=>V(_e(Ee),{bold:!0,size:19})),4395,{borders:we,margins:{top:55,bottom:55,left:70,right:70}})];return new gt({cantSplit:!0,height:{value:460,rule:se.ATLEAST},children:y.value?oe:ze})})})],Oe=new p({styles:{default:{document:{run:{font:"Arial",size:21},paragraph:{spacing:ae}}}},sections:[{properties:{page:{margin:ge},titlePage:!0},headers:{first:me,default:be(`${ue}${U}`)},footers:{first:ee,default:ee},children:re},{properties:{page:{margin:ge},type:Pt.NEXT_PAGE},headers:{default:be(`${ue} — corrigé${U}`)},footers:{default:ee},children:Te}]}),It=await at.toBlob(Oe),Wn=URL.createObjectURL(It),vt=document.createElement("a"),Yi=ue.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"");vt.href=Wn,vt.download=`${Yi||"defi-conjugaison"}.docx`,document.body.appendChild(vt),vt.click(),u("word_downloaded",{exerciseKind:i.exerciseKind}),vt.remove(),URL.revokeObjectURL(Wn)}catch{u("feature_failed",{feature:"download.word"})}finally{k.value=!1}}}return(g,o)=>(x(),An(za,{to:"body"},[r("div",Sf,[r("div",$f,[r("div",null,[r("strong",Cf,f(s(t)("Aperçu avant impression")),1)]),r("div",null,[r("button",{class:"secondary-button",type:"button",onClick:o[0]||(o[0]=p=>l("close"))},f(s(t)("Fermer")),1),r("button",{class:"secondary-button",type:"button",disabled:s(k),onClick:Ce},f(s(k)?"Création du fichier Word…":"Télécharger au format Word"),9,Pf),r("button",{class:"primary-button",type:"button",disabled:s(v),onClick:tt},f(s(v)?"Création du PDF…":"Télécharger le PDF"),9,If)])]),r("div",Af,[r("aside",Tf,[r("div",Of,[r("p",null,f(s(t)("Personnalisation")),1),r("h2",zf,f(s(t)("Options de la fiche")),1),r("span",null,f(s(t)("Les changements apparaissent immédiatement dans l’aperçu.")),1)]),r("label",jf,[r("span",null,f(s(t)("Titre de la fiche")),1),r("input",{id:"preview-print-title",type:"text",value:e.options.title,onInput:o[1]||(o[1]=p=>ne("title",p.target.value))},null,40,Ff)]),r("fieldset",Ef,[r("legend",null,f(s(t)("Mise en page")),1),r("label",Lf,[r("span",null,f(s(t)("Espace avant le titre")),1),r("span",null,[r("input",{id:"preview-title-spacing",type:"number",min:"8",max:"30",step:"1",value:s(C),onInput:o[2]||(o[2]=p=>ne("titleSpacingMm",Number(p.target.value)))},null,40,Nf),o[12]||(o[12]=pe(" mm ",-1))])]),r("label",Mf,[r("span",null,f(s(t)("Espacement entre les questions")),1),r("span",null,[r("input",{id:"preview-question-spacing",type:"number",min:"2",max:"15",step:"0.5",value:s(m),onInput:o[3]||(o[3]=p=>ne("questionSpacingMm",Number(p.target.value)))},null,40,Df),o[13]||(o[13]=pe(" mm ",-1))])])]),r("fieldset",Rf,[r("legend",null,f(s(t)("Informations de l’élève")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showFirstName,onChange:o[4]||(o[4]=p=>ne("showFirstName",p.target.checked))},null,40,Bf),r("span",null,f(s(t)("Prénom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showLastName,onChange:o[5]||(o[5]=p=>ne("showLastName",p.target.checked))},null,40,Wf),r("span",null,f(s(t)("Nom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showDate,onChange:o[6]||(o[6]=p=>ne("showDate",p.target.checked))},null,40,Uf),r("span",null,f(s(t)("Date")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showGrade,onChange:o[7]||(o[7]=p=>ne("showGrade",p.target.checked))},null,40,Vf),r("span",null,f(s(t)("Espace pour la note")),1)])]),r("fieldset",Kf,[r("legend",null,f(s(t)("Contenu affiché")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showVerbs,onChange:o[8]||(o[8]=p=>ne("showVerbs",p.target.checked))},null,40,Gf),r("span",null,f(s(t)("Liste des verbes")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showTenses,onChange:o[9]||(o[9]=p=>ne("showTenses",p.target.checked))},null,40,Hf),r("span",null,f(s(t)("Liste des temps")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showRandomNumber,onChange:o[10]||(o[10]=p=>ne("showRandomNumber",p.target.checked))},null,40,Yf),r("span",null,f(s(t)("Numéro questionnaire/corrigé")),1)])])]),r("main",Xf,[s(I)?(x(),S("iframe",{key:0,class:"pdf-preview-frame",src:`${s(I)}#view=FitH&toolbar=1&navpanes=0`,title:s(t)("Aperçu exact de la fiche PDF et de son corrigé"),onLoad:o[11]||(o[11]=p=>A.value=!0)},null,40,qf)):M("",!0),!s($)&&(s(_)||!s(A))?(x(),S("div",Qf,[o[14]||(o[14]=r("span",{class:"pdf-preview-spinner","aria-hidden":"true"},null,-1)),r("strong",null,f(s(t)("Création de l’aperçu PDF…")),1),r("span",null,f(s(t)("La fiche et le corrigé sont mis en page.")),1)])):M("",!0),s($)?(x(),S("div",Jf,[r("strong",null,f(s($)),1),r("button",{class:"secondary-button",type:"button",onClick:Ke},f(s(t)("Réessayer")),1)])):M("",!0)])])],512)]))}}),Dm=Object.assign(Zf,{__name:"ChallengePrintPreview"}),ed=mr("/images/recharger-defi.svg?v=dynamic-code"),td={ref:"share-dialog",class:"app-dialog share-dialog","data-tour":"share-dialog",role:"dialog","aria-modal":"true","aria-labelledby":"share-title",tabindex:"-1"},nd=["aria-label"],ad={class:"dialog-kicker"},id={id:"share-title"},rd={for:"share-challenge-title"},od=["readonly","aria-invalid","aria-describedby"],sd=["disabled"],ld={for:"share-challenge-description"},ud=["readonly","aria-describedby"],cd={id:"share-description-help",class:"share-title-form__description-help"},fd={key:0,id:"share-title-error",class:"form-error",role:"alert"},dd={key:0},md={key:1,class:"share-methods"},pd={class:"share-method","aria-labelledby":"share-code-title"},gd={id:"share-code-title"},vd={class:"share-method__tip"},bd={class:"share-value"},hd={for:"share-code"},yd=["value"],xd={class:"share-help"},wd={type:"button",class:"share-help__trigger","aria-describedby":"reload-help-tooltip"},_d={id:"reload-help-tooltip",class:"share-help__tooltip",role:"tooltip"},kd={class:"share-help__preview"},Sd=["alt"],$d={"aria-hidden":"true"},Cd={class:"share-method","aria-labelledby":"share-link-title"},Pd={id:"share-link-title"},Id={class:"share-method__tip"},Ad={class:"share-value"},Td={for:"share-url"},Od=["value"],zd={class:"copy-status","aria-live":"polite"},jd=Ve({__name:"ShareChallengeDialog",props:{code:{},url:{},busy:{type:Boolean},error:{},initialTitle:{},initialDescription:{}},emits:["close","save"],setup(e,{emit:n}){const{ui:t,localePath:a}=et(),i=e,l=n,u=Y(""),c=Y(i.initialTitle?.trim()||t("Défi de conjugaison")),d=Y(i.initialDescription?.trim()||""),v=Rt("close-button"),k=Rt("share-dialog"),_=z(()=>c.value.trim()),A=z(()=>d.value.trim()),I=z(()=>_.value.length>=1&&_.value.length<=80);Fa(k,()=>l("close"),v);async function $(h,m){try{await navigator.clipboard.writeText(h),u.value=`${m} copié.`}catch{u.value=`Sélectionnez puis copiez le ${m.toLocaleLowerCase("fr")}.`}}function b(){try{sessionStorage.setItem("highlight-home-challenge-loader","1")}catch{}}function P(){i.code||i.busy||!I.value||l("save",_.value,A.value)}return(h,m)=>{const C=br;return x(),An(za,{to:"body"},[r("div",{class:"dialog-backdrop",onClick:m[8]||(m[8]=Dt(y=>l("close"),["self"]))},[r("section",td,[r("button",{ref:"close-button",class:"dialog-close",type:"button","aria-label":s(t)("Fermer"),onClick:m[0]||(m[0]=y=>l("close"))}," × ",8,nd),r("p",ad,f(e.code?s(t)("Défi sauvegardé"):s(t)("Défi prêt à être partagé")),1),r("h2",id,f(s(t)("Votre défi est prêt à être partagé")),1),r("form",{class:"share-title-form",onSubmit:Dt(P,["prevent"])},[r("label",rd,f(s(t)("Titre du défi")),1),r("div",null,[sn(r("input",{id:"share-challenge-title","onUpdate:modelValue":m[1]||(m[1]=y=>un(c)?c.value=y:null),type:"text",maxlength:"80",readonly:!!e.code,"aria-invalid":!s(I),"aria-describedby":e.error?"share-title-error":void 0,required:"",autofocus:""},null,8,od),[[ln,s(c)]]),e.code?M("",!0):(x(),S("button",{key:0,class:"primary-button",type:"submit",disabled:e.busy||!s(I)},f(e.busy?s(t)("Création…"):s(t)("Créer le code")),9,sd))]),r("small",null,f(s(_).length)+"/80",1),r("label",ld,f(s(t)("Description du défi")),1),sn(r("textarea",{id:"share-challenge-description","onUpdate:modelValue":m[2]||(m[2]=y=>un(d)?d.value=y:null),rows:"4",maxlength:"1000",readonly:!!e.code,"aria-describedby":e.error?"share-title-error share-description-help":"share-description-help"},null,8,ud),[[ln,s(d)]]),r("small",cd,f(s(t)("Facultatif : une description à l’attention des personnes qui découvriront ce défi"))+" · "+f(s(A).length)+"/1000 ",1),e.error?(x(),S("p",fd,f(e.error),1)):M("",!0)],32),e.code?(x(),S("p",dd,f(s(t)("Deux possibilités permettent à vos élèves de retrouver ce défi.")),1)):M("",!0),e.code?(x(),S("div",md,[r("section",pd,[r("header",null,[m[9]||(m[9]=r("span",{class:"share-method__number","aria-hidden":"true"},"1",-1)),r("div",null,[r("h3",gd,f(s(t)("Sauvegarder le code")),1),r("p",null,f(s(t)("L’élève conserve ce code. Plus tard, il le copie sur la page d’accueil pour retrouver ce défi.")),1),r("p",vd,f(s(t)("Idéal pour transmettre le défi par écrit")),1)])]),r("div",bd,[r("label",hd,f(s(t)("Code à conserver")),1),r("div",null,[r("input",{id:"share-code",value:e.code,readonly:"",onFocus:m[3]||(m[3]=y=>y.target.select())},null,40,yd),r("button",{type:"button",onClick:m[4]||(m[4]=y=>$(e.code,"Code"))},f(s(t)("Copier")),1)]),r("div",xd,[r("button",wd,f(s(t)("Comment le recharger plus tard ?")),1),r("div",_d,[r("div",kd,[r("img",{src:ed,alt:s(t)("Emplacement du code reçu sur la page d’accueil")},null,8,Sd),r("span",$d,f(e.code),1)]),r("p",null,[m[10]||(m[10]=pe("Tes élèves colleront le code à cet endroit dans la ",-1)),qe(C,{to:s(a)("/"),onClick:b},{default:Qe(()=>[pe(f(s(t)("page d’accueil")),1)]),_:1},8,["to"])])])])])]),r("section",Cd,[r("header",null,[m[11]||(m[11]=r("span",{class:"share-method__number","aria-hidden":"true"},"2",-1)),r("div",null,[r("h3",Pd,f(s(t)("Envoyer le lien direct")),1),r("p",null,f(s(t)("L’élève clique simplement sur ce lien : il arrive directement sur le défi, sans saisir le code.")),1),r("p",Id,f(s(t)("Idéal pour transmettre le défi par email")),1)])]),r("div",Ad,[r("label",Td,f(s(t)("Lien à envoyer")),1),r("div",null,[r("input",{id:"share-url",value:e.url,readonly:"",onFocus:m[5]||(m[5]=y=>y.target.select())},null,40,Od),r("button",{type:"button",onClick:m[6]||(m[6]=y=>$(e.url,"Lien"))},f(s(t)("Copier")),1)])])])])):M("",!0),e.code?(x(),S(H,{key:2},[r("p",zd,f(s(u)),1),r("button",{class:"primary-button",type:"button",onClick:m[7]||(m[7]=y=>l("close"))},f(s(t)("Terminé")),1)],64)):M("",!0)],512)])])}}}),Rm=Object.assign(jd,{__name:"ChallengeShareChallengeDialog"}),Fd={class:"builder-card tense-picker","aria-labelledby":"tenses-title"},Ed={class:"builder-card__header"},Ld={class:"builder-card__eyebrow"},Nd={id:"tenses-title"},Md=["aria-label"],Dd={class:"selection-toolbar"},Rd={class:"tense-groups"},Bd=["aria-labelledby"],Wd=["id"],Ud={class:"tense-group__items"},Vd={class:"tense-row"},Kd={class:"tense-info"},Gd=["aria-label","aria-describedby"],Hd=["id"],Yd={class:"switch-row"},Xd=["checked","onChange"],qd={key:0,class:"tense-group__trailing"},Qd={class:"tense-row"},Jd={class:"tense-info"},Zd=["aria-label","aria-describedby"],em=["id"],tm={class:"switch-row"},nm=["checked","onChange"],am=Ve({__name:"TensePicker",props:{modes:{},tenses:{},verbs:{},selectedIds:{}},emits:["toggle","selectAll","clear"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=et(),i=e,l=n,u=z(()=>new Set(i.selectedIds)),c=Y({}),d=Y(!1),v=z(()=>{const $=i.verbs.filter(b=>b.complementExample?.functionObject==="cod");return $.length?$:i.verbs}),k=z(()=>`${v.value.map($=>$.id).join(",")}|${i.tenses.map($=>$.id).join(",")}`),_=z(()=>i.modes.map($=>{const b=i.tenses.filter(m=>m.modeId===$.id).sort((m,C)=>Vn($.name,m.name)-Vn($.name,C.name)||m.id-C.id),P=b.filter(m=>Kn(m)),h=b.filter(m=>!Kn(m));return{mode:$,tenses:b,columns:[h.filter(m=>!m.isCompound),h.filter(m=>m.isCompound)].filter(m=>m.length>0),trailingTenses:P}}).filter($=>$.tenses.length>0));let A=0;async function I(){const $=++A;if(c.value={},!(!v.value.length||!i.tenses.length)){d.value=!0;try{const b=await $fetch("/api/tense-examples",{method:"POST",body:{verbIds:v.value.map(P=>P.id),tenseIds:i.tenses.map(P=>P.id)}});$===A&&(c.value=b.examples)}catch{$===A&&(c.value={})}finally{$===A&&(d.value=!1)}}}return kt(I),Le(k,()=>{I()}),($,b)=>(x(),S("section",Fd,[r("div",Ed,[r("div",null,[r("p",Ld,f(s(t)("Étape 2")),1),r("h2",Nd,f(s(t)("Mes temps")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} temps sélectionnés`},f(e.selectedIds.length),9,Md)]),r("div",Dd,[r("button",{class:"text-button",type:"button",onClick:b[0]||(b[0]=P=>l("selectAll"))},f(s(t)("Tout cocher")),1),r("button",{class:"text-button text-button--danger",type:"button",onClick:b[1]||(b[1]=P=>l("clear"))},f(s(t)("Tout décocher")),1)]),r("div",Rd,[(x(!0),S(H,null,ve(s(_),P=>(x(),S("section",{key:P.mode.id,class:"tense-group",role:"group","aria-labelledby":`tense-mode-${P.mode.id}`},[r("h3",{id:`tense-mode-${P.mode.id}`,class:"tense-group__title"},f(s(a)(P.mode.name)),9,Wd),r("div",{class:ke(["tense-group__columns",{"tense-group__columns--single":P.columns.length===1}])},[(x(!0),S(H,null,ve(P.columns,(h,m)=>(x(),S("div",{key:m,class:"tense-group__column"},[r("div",Ud,[(x(!0),S(H,null,ve(h,C=>(x(),S("div",{key:C.id,class:"tense-entry"},[r("div",Vd,[r("span",Kd,[r("button",{type:"button","aria-label":`${s(t)("Voir un exemple :")} ${s(a)(C.name)}`,"aria-describedby":`tense-example-${C.id}`},"i",8,Gd),r("span",{id:`tense-example-${C.id}`,class:"tense-tooltip",role:"tooltip"},[s(c)[C.id]?(x(),S(H,{key:0},[pe(f(s(t)("Exemple:"))+" ",1),r("strong",null,f(s(c)[C.id].emphasis),1),s(c)[C.id].rest?(x(),S(H,{key:0},[pe(f(s(c)[C.id].rest),1)],64)):M("",!0)],64)):(x(),S(H,{key:1},[pe(f(s(d)?s(t)("Chargement…"):s(t)("Exemple momentanément indisponible.")),1)],64))],8,Hd)]),r("label",Yd,[r("input",{type:"checkbox",checked:s(u).has(C.id),onChange:y=>l("toggle",C.id)},null,40,Xd),b[2]||(b[2]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,f(s(a)(C.name)),1)])])]))),128))])]))),128))],2),P.trailingTenses.length?(x(),S("div",qd,[(x(!0),S(H,null,ve(P.trailingTenses,h=>(x(),S("div",{key:h.id,class:"tense-entry"},[r("div",Qd,[r("span",Jd,[r("button",{type:"button","aria-label":`${s(t)("Voir un exemple :")} ${s(a)(h.name)}`,"aria-describedby":`tense-example-${h.id}`},"i",8,Zd),r("span",{id:`tense-example-${h.id}`,class:"tense-tooltip",role:"tooltip"},[s(c)[h.id]?(x(),S(H,{key:0},[pe(f(s(t)("Exemple:"))+" ",1),r("strong",null,f(s(c)[h.id].emphasis),1),s(c)[h.id].rest?(x(),S(H,{key:0},[pe(f(s(c)[h.id].rest),1)],64)):M("",!0)],64)):(x(),S(H,{key:1},[pe(f(s(d)?s(t)("Chargement…"):s(t)("Exemple momentanément indisponible.")),1)],64))],8,em)]),r("label",tm,[r("input",{type:"checkbox",checked:s(u).has(h.id),onChange:m=>l("toggle",h.id)},null,40,nm),b[3]||(b[3]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,f(s(a)(h.name)),1)])])]))),128))])):M("",!0)],8,Bd))),128))])]))}}),Bm=Object.assign(Kt(am,[["__scopeId","data-v-ee3658cb"]]),{__name:"ChallengeTensePicker"}),im={class:"builder-card verb-picker","aria-labelledby":"verbs-title"},rm={class:"builder-card__header"},om={class:"builder-card__eyebrow"},sm={id:"verbs-title"},lm=["aria-label"],um={class:"verb-search"},cm={for:"verb-search-input"},fm={class:"verb-search__control"},dm=["placeholder","aria-expanded","onKeydown"],mm=["disabled","aria-label"],pm=["aria-label"],gm=["onClick"],vm={key:0},bm={key:1},hm={key:1,class:"field-hint","aria-live":"polite"},ym={class:"selection-toolbar"},xm=["aria-label","onClick"],wm=Ve({__name:"VerbPicker",props:{verbs:{},selectedIds:{}},emits:["add","remove","clear"],setup(e,{emit:n}){const{ui:t}=et(),a=e,i=n,l=Y(""),u=Rt("verb-input"),c=z(()=>new Set(a.selectedIds)),d=z(()=>{const $=new Map(a.verbs.map(b=>[b.id,b]));return a.selectedIds.map(b=>$.get(b)).filter(b=>!!b)}),v=z(()=>{const $=d.value.length;return $<=3?1.35:Math.max(1,1.35-($-3)/20)}),k=z(()=>{const $=v.value,b=1+($-1)*.55;return{"--selected-chip-gap":`${7*$}px`,"--selected-chip-inner-gap":`${6*$}px`,"--selected-chip-padding-block":`${7*$}px`,"--selected-chip-padding-end":`${8*$}px`,"--selected-chip-padding-start":`${11*$}px`,"--selected-chip-font-size":`${.87*$}rem`,"--selected-chip-button-size":`${21*$}px`,"--selected-chip-button-font-size":`${$}rem`,"--selected-chip-mobile-gap":`${7*b}px`,"--selected-chip-mobile-inner-gap":`${6*b}px`,"--selected-chip-mobile-padding-block":`${7*b}px`,"--selected-chip-mobile-padding-end":`${8*b}px`,"--selected-chip-mobile-padding-start":`${11*b}px`,"--selected-chip-mobile-font-size":`${.87*b}rem`,"--selected-chip-mobile-button-size":`${21*b}px`,"--selected-chip-mobile-button-font-size":`${b}rem`}}),_=z(()=>hr(l.value)?yr(a.verbs.filter(b=>!c.value.has(b.id)),l.value).slice(0,8):[]);function A($){i("add",$.id),l.value="",Mt(()=>u.value?.focus())}function I(){const $=_.value[0];$&&A($)}return($,b)=>(x(),S("section",im,[r("div",rm,[r("div",null,[r("p",om,f(s(t)("Étape 1")),1),r("h2",sm,f(s(t)("Mes verbes")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} verbes sélectionnés`},f(e.selectedIds.length),9,lm)]),r("div",um,[r("label",cm,f(s(t)("Ajouter un verbe")),1),r("div",fm,[sn(r("input",{id:"verb-search-input",ref:"verb-input","onUpdate:modelValue":b[0]||(b[0]=P=>un(l)?l.value=P:null),type:"search",autocomplete:"off",placeholder:s(t)("Ex. aller, être, finir…"),"aria-expanded":s(_).length>0,"aria-controls":"verb-suggestions",onKeydown:pr(Dt(I,["prevent"]),["enter"])},null,40,dm),[[ln,s(l)]]),r("button",{class:"icon-button icon-button--add",type:"button",disabled:s(_).length===0,"aria-label":s(t)("Ajouter le premier verbe proposé"),onClick:I}," + ",8,mm)]),s(_).length>0?(x(),S("ul",{key:0,id:"verb-suggestions",class:"verb-suggestions",role:"listbox","aria-label":s(t)("Verbes proposés")},[(x(!0),S(H,null,ve(s(_),P=>(x(),S("li",{key:P.id,role:"option"},[r("button",{type:"button",onClick:h=>A(P)},[r("strong",null,f(P.infinitif),1),P.isPronominalForm&&P.baseVerbId?(x(),S("span",vm,f(s(t)("forme pronominale générée")),1)):P.auxiliaire?(x(),S("span",bm,f(s(t)("auxiliaire"))+" "+f(P.auxiliaire),1)):M("",!0)],8,gm)]))),128))],8,pm)):s(l)?(x(),S("p",hm," Aucun nouveau verbe ne commence par « "+f(s(l))+" ». ",1)):M("",!0)]),r("div",ym,[r("p",null,f(s(d).length?s(t)("Verbes retenus"):s(t)("Aucun verbe sélectionné")),1),s(d).length?(x(),S("button",{key:0,class:"text-button text-button--danger",type:"button",onClick:b[1]||(b[1]=P=>i("clear"))},f(s(t)("Tout supprimer")),1)):M("",!0)]),s(d).length?(x(),An(gr,{key:0,tag:"ul",name:"verb-chip",class:"selected-chips selected-chips--adaptive",style:vr(s(k)),"aria-label":s(t)("Verbes sélectionnés")},{default:Qe(()=>[(x(!0),S(H,null,ve(s(d),P=>(x(),S("li",{key:P.id},[r("span",null,f(P.infinitif),1),r("button",{type:"button","aria-label":s(t)("Retirer le verbe {verb}",{verb:P.infinitif}),onClick:h=>i("remove",P.id)},"×",8,xm)]))),128))]),_:1},8,["style","aria-label"])):M("",!0)]))}}),Wm=Object.assign(Kt(wm,[["__scopeId","data-v-f03191bf"]]),{__name:"ChallengeVerbPicker"});function Um(e){return new URL(globalThis.location.href)}export{Nm as C,Mm as P,Rm as S,Bm as T,Wm as V,Um as a,Lm as b,Dm as c,Em as d,xr as e,jm as f,kr as g,zm as h,wr as l,$r as n,Fm as u};
