const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./BaH0Kb2C.js","./BrTgHTF3.js","./entry.CRRjxRjR.css"])))=>i.map(i=>d[i]);
import{a as za,c as fr}from"./BeHZwg2h.js";import{u as bt}from"./DjqiTNeV.js";import{p as j,e as Ve,f as Le,ab as Ot,q as et,M as kt,c as S,a as r,t as f,h as s,N as dr,b as qe,o as x,l as Y,y as In,n as ke,d as ve,i as M,W as yt,w as Qe,E as Mt,F as H,r as ge,j as Dt,g as An,T as ja,aa as Un,z as Rt,ac as mr,k as sn,v as ln,D as cn,C as pr,a9 as gr,J as vr}from"./BrTgHTF3.js";import{_ as Kt}from"./DlAUqK2U.js";import{u as Oa}from"./DjaOQ5vW.js";import{u as Fa}from"./3XExM7s6.js";import{_ as br}from"./Bu9w35MM.js";import{b as Vn}from"./CgdsjPvq.js";import{i as Kn}from"./C2fSTVzi.js";import{n as hr,m as yr}from"./g6ucs01C.js";const Ea=["cod-after","coi-after"];function xr(e,n){return e?n==="before"?["cod-before"]:n==="mixed"?["cod-after","cod-before","coi-after"]:[...Ea]:[]}function wr(e){const n=e.some(a=>a.endsWith("-before")),t=e.some(a=>a.endsWith("-after"));return{includeComplements:e.length>0,complementPlacement:n&&t?"mixed":n?"before":"after"}}function Tm(e){return[e.groupLabel||za[e.group]||e.group,e.label].filter(Boolean).join(" | ")}function zm(e){return Number.isInteger(e)&&Number(e)>0?`${Number(e)} au hasard`:"Tous les verbes"}const Gn={exerciseKind:"conjugation",identificationSource:"selected-verbs",literaryRegister:"all",pastSimplePronouns:"all",inclusivePronouns:!1,includeComplements:!0,complementPlacement:"after",complementOptions:[...Ea]},_r=()=>({title:"Défi de conjugaison",questionSpacingMm:8,titleSpacingMm:30,showGrade:!0,showVerbs:!1,showTenses:!1,showFirstName:!0,showLastName:!0,showDate:!0,showRandomNumber:!0}),Hn=()=>({verbIds:[1,2,3,4],tenseIds:[1,3,4,5],questionCount:10,...Gn,complementOptions:[...Gn.complementOptions],printOptions:_r()});function jm(){const e=bt("challenge-catalogue",()=>({verbes:[],modes:[],temps:[],presets:[]})),n=bt("challenge-config",Hn),t=bt("challenge-catalogue-status",()=>"idle"),a=bt("challenge-catalogue-error",()=>""),i=j(()=>{const m=new Map(e.value.verbes.map(C=>[C.id,C]));return n.value.verbIds.map(C=>m.get(C)).filter(C=>!!C)}),l=j(()=>{const m=new Map(e.value.temps.map(y=>[y.id,y])),C=new Map(e.value.modes.map(y=>[y.id,y]));return n.value.tenseIds.map(y=>m.get(y)).filter(y=>!!y).map(y=>({...y,mode:y.mode||C.get(y.modeId)}))}),c=j(()=>n.value.verbIds.length>0&&n.value.tenseIds.length>0&&n.value.questionCount>0);function u(){const m=e.value.modes.find(y=>y.name.toLocaleLowerCase("fr")==="indicatif");if(!m)return[1,3,4,5];const C=new Set(["présent","futur proche","imparfait","passé composé","futur","futur simple"]);return e.value.temps.filter(y=>y.modeId===m.id&&C.has(y.name.toLocaleLowerCase("fr"))).map(y=>y.id)}async function d(m=!1){const C=e.value.temps.length>0&&e.value.temps.every(y=>!!y.example?.trim());if(!m&&t.value==="success"&&C)return e.value;t.value="loading",a.value="";try{const y=await $fetch("/api/catalogue");e.value={verbes:[...y.verbes].sort((D,ne)=>D.infinitif.localeCompare(ne.infinitif,"fr")),modes:[...y.modes].sort((D,ne)=>D.order-ne.order||D.id-ne.id),temps:[...y.temps],presets:[...y.presets]};const F=new Set(e.value.verbes.map(D=>D.id)),te=new Set(e.value.temps.map(D=>D.id)),Z=u();return n.value.verbIds=n.value.verbIds.filter(D=>F.has(D)),n.value.tenseIds=n.value.tenseIds.filter(D=>te.has(D)),n.value.verbIds.length===0&&(n.value.verbIds=e.value.verbes.slice(0,4).map(D=>D.id)),n.value.tenseIds.length===0&&(n.value.tenseIds=Z.length>0?Z:e.value.temps.slice(0,1).map(D=>D.id)),t.value="success",e.value}catch(y){throw t.value="error",a.value=kr(y,"Impossible de charger le catalogue."),y}}function v(m){n.value.verbIds.includes(m)||(n.value.verbIds=[...n.value.verbIds,m])}function k(m){n.value.verbIds=n.value.verbIds.filter(C=>C!==m)}function _(){n.value.verbIds=[]}function A(m){n.value.tenseIds=n.value.tenseIds.includes(m)?n.value.tenseIds.filter(C=>C!==m):[...n.value.tenseIds,m]}function I(){n.value.tenseIds=e.value.temps.map(m=>m.id)}function $(){n.value.tenseIds=[]}function b(){n.value.tenseIds=u()}function P(m){const C=new Set(e.value.verbes.map(F=>F.id)),y=new Set(e.value.temps.map(F=>F.id));n.value={...n.value,verbIds:m.verbIds.filter(F=>C.has(F)),tenseIds:m.tenseIds.filter(F=>y.has(F)),questionCount:m.questionCount}}function h(m){const C=Hn();P(m);const y=m.complementOptions??(m.includeComplements===void 0?[...C.complementOptions]:xr(m.includeComplements,m.complementPlacement??"after")),F=wr(y);n.value={...n.value,exerciseKind:m.exerciseKind??C.exerciseKind,identificationSource:m.identificationSource??C.identificationSource,literaryRegister:m.literaryRegister??C.literaryRegister,pastSimplePronouns:m.pastSimplePronouns??C.pastSimplePronouns,inclusivePronouns:m.inclusivePronouns??C.inclusivePronouns,includeComplements:F.includeComplements,complementPlacement:F.complementPlacement,complementOptions:y,printOptions:{...C.printOptions,...m.printOptions??{}}}}return{catalogue:e,challenge:n,catalogueStatus:t,catalogueError:a,selectedVerbs:i,selectedTenses:l,isReady:c,loadCatalogue:d,addVerb:v,removeVerb:k,clearVerbs:_,toggleTense:A,selectAllTenses:I,clearTenses:$,selectDefaultTenses:b,applySelection:P,applySharedChallenge:h}}function kr(e,n="Une erreur est survenue."){if(e&&typeof e=="object"){const t=e;return t.data?.statusMessage||t.data?.message||t.statusMessage||t.message||n}return n}function Sr(e){return{verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,identificationSource:e.identificationSource??"selected-verbs",literaryRegister:e.literaryRegister??"all",pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions]}}function $r(e){const n=e.toUpperCase().replace(/[^A-Z0-9]/g,"");return n.length===8?n.match(/.{1,2}/g)?.join("-")??n:e.trim().toUpperCase()}function Cr(e,n,t){return{version:1,...n===void 0?{}:{title:n.trim()},...t?.trim()?{description:t.trim()}:{},verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,identificationSource:e.identificationSource??"selected-verbs",literaryRegister:e.literaryRegister??"all",pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions],printOptions:{...e.printOptions}}}function Om(){async function e(a){return await $fetch("/api/questionnaires",{method:"POST",body:Sr(a)})}async function n(a,i,l=""){return await $fetch("/api/defis",{method:"POST",body:Cr(a,i,l)})}async function t(a){const i=$r(a);return await $fetch(`/api/defis/${encodeURIComponent(i)}`)}return{generateQuestions:e,saveChallenge:n,loadChallenge:t}}function un(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function Pr(e){if(Array.isArray(e))return e}function Ir(e){if(Array.isArray(e))return un(e)}function Ar(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function Tr(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,La(a.key),a)}}function zr(e,n,t){return n&&Tr(e.prototype,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function Ft(e,n){var t=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=Tn(e))||n){t&&(e=t);var a=0,i=function(){};return{s:i,n:function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}},e:function(d){throw d},f:i}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var l,c=!0,u=!1;return{s:function(){t=t.call(e)},n:function(){var d=t.next();return c=d.done,d},e:function(d){u=!0,l=d},f:function(){try{c||t.return==null||t.return()}finally{if(u)throw l}}}}function z(e,n,t){return(n=La(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function jr(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Or(e,n){var t=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(t!=null){var a,i,l,c,u=[],d=!0,v=!1;try{if(l=(t=t.call(e)).next,n===0){if(Object(t)!==t)return;d=!1}else for(;!(d=(a=l.call(t)).done)&&(u.push(a.value),u.length!==n);d=!0);}catch(k){v=!0,i=k}finally{try{if(!d&&t.return!=null&&(c=t.return(),Object(c)!==c))return}finally{if(v)throw i}}return u}}function Fr(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Er(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Yn(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function w(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?Yn(Object(t),!0).forEach(function(a){z(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Yn(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function Gt(e,n){return Pr(e)||Or(e,n)||Tn(e,n)||Fr()}function $e(e){return Ir(e)||jr(e)||Tn(e)||Er()}function Lr(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function La(e){var n=Lr(e,"string");return typeof n=="symbol"?n:n+""}function Bt(e){"@babel/helpers - typeof";return Bt=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Bt(e)}function Tn(e,n){if(e){if(typeof e=="string")return un(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?un(e,n):void 0}}var Xn=function(){},zn={},Na={},Ma=null,Da={mark:Xn,measure:Xn};try{typeof window<"u"&&(zn=window),typeof document<"u"&&(Na=document),typeof MutationObserver<"u"&&(Ma=MutationObserver),typeof performance<"u"&&(Da=performance)}catch{}var Nr=zn.navigator||{},qn=Nr.userAgent,Qn=qn===void 0?"":qn,Be=zn,X=Na,Jn=Ma,At=Da;Be.document;var De=!!X.documentElement&&!!X.head&&typeof X.addEventListener=="function"&&typeof X.createElement=="function",Ra=~Qn.indexOf("MSIE")||~Qn.indexOf("Trident/"),Tt,Mr=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|gt|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt|sldr|slpdr|pr|ms|vs)?[\-\ ]/,Dr=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Graphite|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Slab Duo|Slab Press Duo|Pixel|Mosaic|Vellum|Whiteboard)?.*/i,Ba={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},"slab-duo":{"fa-regular":"regular",fasldr:"regular"},"slab-press-duo":{"fa-regular":"regular",faslpdr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},vellum:{"fa-solid":"solid",favs:"solid"},pixel:{"fa-regular":"regular",fapr:"regular"},mosaic:{"fa-solid":"solid",fams:"solid"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},graphite:{"fa-thin":"thin",fagt:"thin"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},Rr={GROUP:"duotone-group",PRIMARY:"primary",SECONDARY:"secondary"},Wa=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],fe="classic",St="duotone",Ua="sharp",Va="sharp-duotone",Ka="chisel",Ga="etch",Ha="graphite",Ya="jelly",Xa="jelly-duo",qa="jelly-fill",Qa="mosaic",Ja="notdog",Za="notdog-duo",ei="pixel",ti="slab",ni="slab-duo",ai="slab-press",ii="slab-press-duo",ri="thumbprint",oi="utility",si="utility-duo",li="utility-fill",ci="vellum",ui="whiteboard",Br="Classic",Wr="Duotone",Ur="Sharp",Vr="Sharp Duotone",Kr="Chisel",Gr="Etch",Hr="Graphite",Yr="Jelly",Xr="Jelly Duo",qr="Jelly Fill",Qr="Mosaic",Jr="Notdog",Zr="Notdog Duo",eo="Pixel",to="Slab",no="Slab Duo",ao="Slab Press",io="Slab Press Duo",ro="Thumbprint",oo="Utility",so="Utility Duo",lo="Utility Fill",co="Vellum",uo="Whiteboard",fi=[fe,St,Ua,Va,Ka,Ga,Ha,Ya,Xa,qa,Qa,Ja,Za,ei,ti,ni,ai,ii,ri,oi,si,li,ci,ui];Tt={},z(z(z(z(z(z(z(z(z(z(Tt,fe,Br),St,Wr),Ua,Ur),Va,Vr),Ka,Kr),Ga,Gr),Ha,Hr),Ya,Yr),Xa,Xr),qa,qr),z(z(z(z(z(z(z(z(z(z(Tt,Qa,Qr),Ja,Jr),Za,Zr),ei,eo),ti,to),ni,no),ai,ao),ii,io),ri,ro),oi,oo),z(z(z(z(Tt,si,so),li,lo),ci,co),ui,uo);var fo={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},"slab-duo":{400:"fasldr"},"slab-press-duo":{400:"faslpdr"},vellum:{900:"favs"},mosaic:{900:"fams"},pixel:{400:"fapr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},graphite:{100:"fagt"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},mo={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Slab Duo":{400:"fasldr",normal:"fasldr"},"Font Awesome 7 Slab Press Duo":{400:"faslpdr",normal:"faslpdr"},"Font Awesome 7 Pixel":{400:"fapr",normal:"fapr"},"Font Awesome 7 Mosaic":{900:"fams",normal:"fams"},"Font Awesome 7 Vellum":{900:"favs",normal:"favs"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Graphite":{100:"fagt",normal:"fagt"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},po=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["graphite",{defaultShortPrefixId:"fagt",defaultStyleId:"thin",styleIds:["thin"],futureStyleIds:[],defaultFontWeight:100}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["mosaic",{defaultShortPrefixId:"fams",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["pixel",{defaultShortPrefixId:"fapr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-duo",{defaultShortPrefixId:"fasldr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press-duo",{defaultShortPrefixId:"faslpdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["vellum",{defaultShortPrefixId:"favs",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),go={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},graphite:{thin:"fagt"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},mosaic:{solid:"fams"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},pixel:{regular:"fapr"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-duo":{regular:"fasldr"},"slab-press":{regular:"faslpr"},"slab-press-duo":{regular:"faslpdr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},vellum:{solid:"favs"},whiteboard:{semibold:"fawsb"}},di=["fak","fa-kit","fakd","fa-kit-duotone"],Zn={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},vo=["kit"],bo="kit",ho="kit-duotone",yo="Kit",xo="Kit Duotone";z(z({},bo,yo),ho,xo);var wo={kit:{"fa-kit":"fak"}},_o={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},ko={kit:{fak:"fa-kit"}},ea={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},zt,jt={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},So=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],$o="classic",Co="duotone",Po="sharp",Io="sharp-duotone",Ao="chisel",To="etch",zo="graphite",jo="jelly",Oo="jelly-duo",Fo="jelly-fill",Eo="mosaic",Lo="notdog",No="notdog-duo",Mo="pixel",Do="slab",Ro="slab-duo",Bo="slab-press",Wo="slab-press-duo",Uo="thumbprint",Vo="utility",Ko="utility-duo",Go="utility-fill",Ho="vellum",Yo="whiteboard",Xo="Classic",qo="Duotone",Qo="Sharp",Jo="Sharp Duotone",Zo="Chisel",es="Etch",ts="Graphite",ns="Jelly",as="Jelly Duo",is="Jelly Fill",rs="Mosaic",os="Notdog",ss="Notdog Duo",ls="Pixel",cs="Slab",us="Slab Duo",fs="Slab Press",ds="Slab Press Duo",ms="Thumbprint",ps="Utility",gs="Utility Duo",vs="Utility Fill",bs="Vellum",hs="Whiteboard";zt={},z(z(z(z(z(z(z(z(z(z(zt,$o,Xo),Co,qo),Po,Qo),Io,Jo),Ao,Zo),To,es),zo,ts),jo,ns),Oo,as),Fo,is),z(z(z(z(z(z(z(z(z(z(zt,Eo,rs),Lo,os),No,ss),Mo,ls),Do,cs),Ro,us),Bo,fs),Wo,ds),Uo,ms),Vo,ps),z(z(z(z(zt,Ko,gs),Go,vs),Ho,bs),Yo,hs);var ys="kit",xs="kit-duotone",ws="Kit",_s="Kit Duotone";z(z({},ys,ws),xs,_s);var ks={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},"slab-duo":{"fa-regular":"fasldr"},"slab-press-duo":{"fa-regular":"faslpdr"},pixel:{"fa-regular":"fapr"},mosaic:{"fa-solid":"fams"},vellum:{"fa-solid":"favs"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},graphite:{"fa-thin":"fagt"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},Ss={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],"slab-duo":["fasldr"],"slab-press-duo":["faslpdr"],pixel:["fapr"],mosaic:["fams"],vellum:["favs"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],graphite:["fagt"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},fn={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},"slab-duo":{fasldr:"fa-regular"},"slab-press-duo":{faslpdr:"fa-regular"},pixel:{fapr:"fa-regular"},mosaic:{fams:"fa-solid"},vellum:{favs:"fa-solid"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},graphite:{fagt:"fa-thin"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},$s=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],mi=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fasldr","faslpdr","fapr","fams","favs","fawsb","fatl","fans","fands","faes","fagt","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(So,$s),Cs=["solid","regular","light","thin","duotone","brands","semibold"],pi=[1,2,3,4,5,6,7,8,9,10],Ps=pi.concat([11,12,13,14,15,16,17,18,19,20]),Is=["aw","fw","pull-left","pull-right"],As=[].concat($e(Object.keys(Ss)),Cs,Is,["2xs","xs","sm","lg","xl","2xl","beat","beat-fade","border","bounce","buzz","canvas-square","canvas-roomy","fade","flip-360","flip-both","flip-horizontal","flip-vertical","flip","float","inverse","jello","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","spin-snap","spin-snap-4","spin-snap-8","stack-1x","stack-2x","stack","swing","ul","wag","width-auto","width-fixed",jt.GROUP,jt.SWAP_OPACITY,jt.PRIMARY,jt.SECONDARY]).concat(pi.map(function(e){return"".concat(e,"x")})).concat(Ps.map(function(e){return"w-".concat(e)})),Ts={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},Ne="___FONT_AWESOME___",dn=16,gi="fa",vi="svg-inline--fa",Je="data-fa-i2svg",mn="data-fa-pseudo-element",zs="data-fa-pseudo-element-pending",jn="data-prefix",On="data-icon",ta="fontawesome-i2svg",js="async",Os=["HTML","HEAD","STYLE","SCRIPT"],bi=["::before","::after",":before",":after"],hi=(function(){try{return!0}catch{return!1}})();function $t(e){return new Proxy(e,{get:function(t,a){return a in t?t[a]:t[fe]}})}var yi=w({},Ba);yi[fe]=w(w(w(w({},{"fa-duotone":"duotone"}),Ba[fe]),Zn.kit),Zn["kit-duotone"]);var Fs=$t(yi),pn=w({},go);pn[fe]=w(w(w(w({},{duotone:"fad"}),pn[fe]),ea.kit),ea["kit-duotone"]);var na=$t(pn),gn=w({},fn);gn[fe]=w(w({},gn[fe]),ko.kit);var Fn=$t(gn),vn=w({},ks);vn[fe]=w(w({},vn[fe]),wo.kit);$t(vn);var Es=Mr,xi="fa-layers-text",Ls=Dr,Ns=w({},fo);$t(Ns);var Ms=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],Jt=Rr,Ds=[].concat($e(vo),$e(As)),xt=Be.FontAwesomeConfig||{};function Rs(e){var n=X.querySelector("script["+e+"]");if(n)return n.getAttribute(e)}function Bs(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}if(X&&typeof X.querySelector=="function"){var Ws=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];Ws.forEach(function(e){var n=Gt(e,2),t=n[0],a=n[1],i=Bs(Rs(t));i!=null&&(xt[a]=i)})}var wi={styleDefault:"solid",familyDefault:fe,cssPrefix:gi,replacementClass:vi,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};xt.familyPrefix&&(xt.cssPrefix=xt.familyPrefix);var ct=w(w({},wi),xt);ct.autoReplaceSvg||(ct.observeMutations=!1);var T={};Object.keys(wi).forEach(function(e){Object.defineProperty(T,e,{enumerable:!0,set:function(t){ct[e]=t,wt.forEach(function(a){return a(T)})},get:function(){return ct[e]}})});Object.defineProperty(T,"familyPrefix",{enumerable:!0,set:function(n){ct.cssPrefix=n,wt.forEach(function(t){return t(T)})},get:function(){return ct.cssPrefix}});Be.FontAwesomeConfig=T;var wt=[];function Us(e){return wt.push(e),function(){wt.splice(wt.indexOf(e),1)}}var ot=dn,Oe={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Vs(e){if(!(!e||!De)){var n=X.createElement("style");n.setAttribute("type","text/css"),n.innerHTML=e;for(var t=X.head.childNodes,a=null,i=t.length-1;i>-1;i--){var l=t[i],c=(l.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(c)>-1&&(a=l)}return X.head.insertBefore(n,a),e}}var Ks="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function aa(){for(var e=12,n="";e-- >0;)n+=Ks[Math.random()*62|0];return n}function ut(e){for(var n=[],t=(e||[]).length>>>0;t--;)n[t]=e[t];return n}function En(e){return e.classList?ut(e.classList):(e.getAttribute("class")||"").split(" ").filter(function(n){return n})}function _i(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Gs(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,'="').concat(_i(e[t]),'" ')},"").trim()}function Ht(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,": ").concat(e[t].trim(),";")},"")}function Ln(e){return e.size!==Oe.size||e.x!==Oe.x||e.y!==Oe.y||e.rotate!==Oe.rotate||e.flipX||e.flipY}function Hs(e){var n=e.transform,t=e.containerWidth,a=e.iconWidth,i={transform:"translate(".concat(t/2," 256)")},l="translate(".concat(n.x*32,", ").concat(n.y*32,") "),c="scale(".concat(n.size/16*(n.flipX?-1:1),", ").concat(n.size/16*(n.flipY?-1:1),") "),u="rotate(".concat(n.rotate," 0 0)"),d={transform:"".concat(l," ").concat(c," ").concat(u)},v={transform:"translate(".concat(a/2*-1," -256)")};return{outer:i,inner:d,path:v}}function Ys(e){var n=e.transform,t=e.width,a=t===void 0?dn:t,i=e.height,l=i===void 0?dn:i,c="";return Ra?c+="translate(".concat(n.x/ot-a/2,"em, ").concat(n.y/ot-l/2,"em) "):c+="translate(calc(-50% + ".concat(n.x/ot,"em), calc(-50% + ").concat(n.y/ot,"em)) "),c+="scale(".concat(n.size/ot*(n.flipX?-1:1),", ").concat(n.size/ot*(n.flipY?-1:1),") "),c+="rotate(".concat(n.rotate,"deg) "),c}var Xs=`:root, :host {
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
}`;function ki(){var e=gi,n=vi,t=T.cssPrefix,a=T.replacementClass,i=Xs;if(t!==e||a!==n){var l=new RegExp("\\.".concat(e,"\\-"),"g"),c=new RegExp("\\--".concat(e,"\\-"),"g"),u=new RegExp("\\.".concat(n),"g");i=i.replace(l,".".concat(t,"-")).replace(c,"--".concat(t,"-")).replace(u,".".concat(a))}return i}var ia=!1;function Zt(){T.autoAddCss&&!ia&&(Vs(ki()),ia=!0)}var qs={mixout:function(){return{dom:{css:ki,insertCss:Zt}}},hooks:function(){return{beforeDOMElementCreation:function(){Zt()},beforeI2svg:function(){Zt()}}}},Me=Be||{};Me[Ne]||(Me[Ne]={});Me[Ne].styles||(Me[Ne].styles={});Me[Ne].hooks||(Me[Ne].hooks={});Me[Ne].shims||(Me[Ne].shims=[]);var Se=Me[Ne],Si=[],$i=function(){X.removeEventListener("DOMContentLoaded",$i),Wt=1,Si.map(function(n){return n()})},Wt=!1;De&&(Wt=(X.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(X.readyState),Wt||X.addEventListener("DOMContentLoaded",$i));function Qs(e){De&&(Wt?setTimeout(e,0):Si.push(e))}function Ct(e){var n=e.tag,t=e.attributes,a=t===void 0?{}:t,i=e.children,l=i===void 0?[]:i;return typeof e=="string"?_i(e):"<".concat(n," ").concat(Gs(a),">").concat(l.map(Ct).join(""),"</").concat(n,">")}function ra(e,n,t){if(e&&e[n]&&e[n][t])return{prefix:n,iconName:t,icon:e[n][t]}}var en=function(n,t,a,i){var l=Object.keys(n),c=l.length,u=t,d,v,k;for(a===void 0?(d=1,k=n[l[0]]):(d=0,k=a);d<c;d++)v=l[d],k=u(k,n[v],v,n);return k};function Ci(e){return $e(e).length!==1?null:e.codePointAt(0).toString(16)}function oa(e){return Object.keys(e).reduce(function(n,t){var a=e[t],i=!!a.icon;return i?n[a.iconName]=a.icon:n[t]=a,n},{})}function bn(e,n){var t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},a=t.skipHooks,i=a===void 0?!1:a,l=oa(n);typeof Se.hooks.addPack=="function"&&!i?Se.hooks.addPack(e,oa(n)):Se.styles[e]=w(w({},Se.styles[e]||{}),l),e==="fas"&&bn("fa",n)}var _t=Se.styles,Js=Se.shims,Pi=Object.keys(Fn),Zs=Pi.reduce(function(e,n){return e[n]=Object.keys(Fn[n]),e},{}),Nn=null,Ii={},Ai={},Ti={},zi={},ji={};function el(e){return~Ds.indexOf(e)}function tl(e,n){var t=n.split("-"),a=t[0],i=t.slice(1).join("-");return a===e&&i!==""&&!el(i)?i:null}var Oi=function(){var n=function(l){return en(_t,function(c,u,d){return c[d]=en(u,l,{}),c},{})};Ii=n(function(i,l,c){if(l[3]&&(i[l[3]]=c),l[2]){var u=l[2].filter(function(d){return typeof d=="number"});u.forEach(function(d){i[d.toString(16)]=c})}return i}),Ai=n(function(i,l,c){if(i[c]=c,l[2]){var u=l[2].filter(function(d){return typeof d=="string"});u.forEach(function(d){i[d]=c})}return i}),ji=n(function(i,l,c){var u=l[2];return i[c]=c,u.forEach(function(d){i[d]=c}),i});var t="far"in _t||T.autoFetchSvg,a=en(Js,function(i,l){var c=l[0],u=l[1],d=l[2];return u==="far"&&!t&&(u="fas"),typeof c=="string"&&(i.names[c]={prefix:u,iconName:d}),typeof c=="number"&&(i.unicodes[c.toString(16)]={prefix:u,iconName:d}),i},{names:{},unicodes:{}});Ti=a.names,zi=a.unicodes,Nn=Yt(T.styleDefault,{family:T.familyDefault})};Us(function(e){Nn=Yt(e.styleDefault,{family:T.familyDefault})});Oi();function Mn(e,n){return(Ii[e]||{})[n]}function nl(e,n){return(Ai[e]||{})[n]}function Xe(e,n){return(ji[e]||{})[n]}function Fi(e){return Ti[e]||{prefix:null,iconName:null}}function al(e){var n=zi[e],t=Mn("fas",e);return n||(t?{prefix:"fas",iconName:t}:null)||{prefix:null,iconName:null}}function We(){return Nn}var Ei=function(){return{prefix:null,iconName:null,rest:[]}};function il(e){var n=fe,t=Pi.reduce(function(a,i){return a[i]="".concat(T.cssPrefix,"-").concat(i),a},{});return fi.forEach(function(a){(e.includes(t[a])||e.some(function(i){return Zs[a].includes(i)}))&&(n=a)}),n}function Yt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.family,a=t===void 0?fe:t,i=Fs[a][e];if(a===St&&!e)return"fad";var l=na[a][e]||na[a][i],c=e in Se.styles?e:null,u=l||c||null;return u}function rl(e){var n=[],t=null;return e.forEach(function(a){var i=tl(T.cssPrefix,a);i?t=i:a&&n.push(a)}),{iconName:t,rest:n}}function sa(e){return e.sort().filter(function(n,t,a){return a.indexOf(n)===t})}var la=mi.concat(di);function Xt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.skipLookups,a=t===void 0?!1:t,i=null,l=sa(e.filter(function(I){return la.includes(I)})),c=sa(e.filter(function(I){return!la.includes(I)})),u=l.filter(function(I){return i=I,!Wa.includes(I)}),d=Gt(u,1),v=d[0],k=v===void 0?null:v,_=il(l),A=w(w({},rl(c)),{},{prefix:Yt(k,{family:_})});return w(w(w({},A),cl({values:e,family:_,styles:_t,config:T,canonical:A,givenPrefix:i})),ol(a,i,A))}function ol(e,n,t){var a=t.prefix,i=t.iconName;if(e||!a||!i)return{prefix:a,iconName:i};var l=n==="fa"?Fi(i):{},c=Xe(a,i);return i=l.iconName||c||i,a=l.prefix||a,a==="far"&&!_t.far&&_t.fas&&!T.autoFetchSvg&&(a="fas"),{prefix:a,iconName:i}}var sl=fi.filter(function(e){return e!==fe||e!==St}),ll=Object.keys(fn).filter(function(e){return e!==fe}).map(function(e){return Object.keys(fn[e])}).flat();function cl(e){var n=e.values,t=e.family,a=e.canonical,i=e.givenPrefix,l=i===void 0?"":i,c=e.styles,u=c===void 0?{}:c,d=e.config,v=d===void 0?{}:d,k=t===St,_=n.includes("fa-duotone")||n.includes("fad"),A=v.familyDefault==="duotone",I=a.prefix==="fad"||a.prefix==="fa-duotone";if(!k&&(_||A||I)&&(a.prefix="fad"),(n.includes("fa-brands")||n.includes("fab"))&&(a.prefix="fab"),!a.prefix&&sl.includes(t)){var $=Object.keys(u).find(function(P){return ll.includes(P)});if($||v.autoFetchSvg){var b=po.get(t).defaultShortPrefixId;a.prefix=b,a.iconName=Xe(a.prefix,a.iconName)||a.iconName}}return(a.prefix==="fa"||l==="fa")&&(a.prefix=We()||"fas"),a}var ul=(function(){function e(){Ar(this,e),this.definitions={}}return zr(e,[{key:"add",value:function(){for(var t=this,a=arguments.length,i=new Array(a),l=0;l<a;l++)i[l]=arguments[l];var c=i.reduce(this._pullDefinitions,{});Object.keys(c).forEach(function(u){t.definitions[u]=w(w({},t.definitions[u]||{}),c[u]),bn(u,c[u]);var d=Fn[fe][u];d&&bn(d,c[u]),Oi()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(t,a){var i=a.prefix&&a.iconName&&a.icon?{0:a}:a;return Object.keys(i).map(function(l){var c=i[l],u=c.prefix,d=c.iconName,v=c.icon,k=v[2];t[u]||(t[u]={}),k.length>0&&k.forEach(function(_){typeof _=="string"&&(t[u][_]=v)}),t[u][d]=v}),t}}])})(),ca=[],st={},lt={},fl=Object.keys(lt);function dl(e,n){var t=n.mixoutsTo;return ca=e,st={},Object.keys(lt).forEach(function(a){fl.indexOf(a)===-1&&delete lt[a]}),ca.forEach(function(a){var i=a.mixout?a.mixout():{};if(Object.keys(i).forEach(function(c){typeof i[c]=="function"&&(t[c]=i[c]),Bt(i[c])==="object"&&Object.keys(i[c]).forEach(function(u){t[c]||(t[c]={}),t[c][u]=i[c][u]})}),a.hooks){var l=a.hooks();Object.keys(l).forEach(function(c){st[c]||(st[c]=[]),st[c].push(l[c])})}a.provides&&a.provides(lt)}),t}function hn(e,n){for(var t=arguments.length,a=new Array(t>2?t-2:0),i=2;i<t;i++)a[i-2]=arguments[i];var l=st[e]||[];return l.forEach(function(c){n=c.apply(null,[n].concat(a))}),n}function Ze(e){for(var n=arguments.length,t=new Array(n>1?n-1:0),a=1;a<n;a++)t[a-1]=arguments[a];var i=st[e]||[];i.forEach(function(l){l.apply(null,t)})}function Ue(){var e=arguments[0],n=Array.prototype.slice.call(arguments,1);return lt[e]?lt[e].apply(null,n):void 0}function yn(e){e.prefix==="fa"&&(e.prefix="fas");var n=e.iconName,t=e.prefix||We();if(n)return n=Xe(t,n)||n,ra(Li.definitions,t,n)||ra(Se.styles,t,n)}var Li=new ul,ml=function(){T.autoReplaceSvg=!1,T.observeMutations=!1,Ze("noAuto")},pl={i2svg:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return De?(Ze("beforeI2svg",n),Ue("pseudoElements2svg",n),Ue("i2svg",n)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot;T.autoReplaceSvg===!1&&(T.autoReplaceSvg=!0),T.observeMutations=!0,Qs(function(){vl({autoReplaceSvgRoot:t}),Ze("watch",n)})}},gl={icon:function(n){if(n===null)return null;if(Bt(n)==="object"&&n.prefix&&n.iconName)return{prefix:n.prefix,iconName:Xe(n.prefix,n.iconName)||n.iconName};if(Array.isArray(n)&&n.length===2){var t=n[1].indexOf("fa-")===0?n[1].slice(3):n[1],a=Yt(n[0]);return{prefix:a,iconName:Xe(a,t)||t}}if(typeof n=="string"&&(n.indexOf("".concat(T.cssPrefix,"-"))>-1||n.match(Es))){var i=Xt(n.split(" "),{skipLookups:!0});return{prefix:i.prefix||We(),iconName:Xe(i.prefix,i.iconName)||i.iconName}}if(typeof n=="string"){var l=We();return{prefix:l,iconName:Xe(l,n)||n}}}},he={noAuto:ml,config:T,dom:pl,parse:gl,library:Li,findIconDefinition:yn,toHtml:Ct},vl=function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot,a=t===void 0?X:t;(Object.keys(Se.styles).length>0||T.autoFetchSvg)&&De&&T.autoReplaceSvg&&he.dom.i2svg({node:a})};function qt(e,n){return Object.defineProperty(e,"abstract",{get:n}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(function(a){return Ct(a)})}}),Object.defineProperty(e,"node",{get:function(){if(De){var a=X.createElement("div");return a.innerHTML=e.html,a.children}}}),e}function bl(e){var n=e.children,t=e.main,a=e.mask,i=e.attributes,l=e.styles,c=e.transform;if(Ln(c)&&t.found&&!a.found){var u=t.width,d=t.height,v={x:u/d/2,y:.5};i.style=Ht(w(w({},l),{},{"transform-origin":"".concat(v.x+c.x/16,"em ").concat(v.y+c.y/16,"em")}))}return[{tag:"svg",attributes:i,children:n}]}function hl(e){var n=e.prefix,t=e.iconName,a=e.children,i=e.attributes,l=e.symbol,c=l===!0?"".concat(n,"-").concat(T.cssPrefix,"-").concat(t):l;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:w(w({},i),{},{id:c}),children:a}]}]}function yl(e){var n=["aria-label","aria-labelledby","title","role"];return n.some(function(t){return t in e})}function Dn(e){var n=e.icons,t=n.main,a=n.mask,i=e.prefix,l=e.iconName,c=e.transform,u=e.symbol,d=e.maskId,v=e.extra,k=e.watchable,_=k===void 0?!1:k,A=a.found?a:t,I=A.width,$=A.height,b=[T.replacementClass,l?"".concat(T.cssPrefix,"-").concat(l):""].filter(function(F){return v.classes.indexOf(F)===-1}).filter(function(F){return F!==""||!!F}).concat(v.classes).join(" "),P={children:[],attributes:w(w({},v.attributes),{},{"data-prefix":i,"data-icon":l,class:b,role:v.attributes.role||"img",viewBox:"0 0 ".concat(I," ").concat($)})};!yl(v.attributes)&&!v.attributes["aria-hidden"]&&(P.attributes["aria-hidden"]="true"),_&&(P.attributes[Je]="");var h=w(w({},P),{},{prefix:i,iconName:l,main:t,mask:a,maskId:d,transform:c,symbol:u,styles:w({},v.styles)}),m=a.found&&t.found?Ue("generateAbstractMask",h)||{children:[],attributes:{}}:Ue("generateAbstractIcon",h)||{children:[],attributes:{}},C=m.children,y=m.attributes;return h.children=C,h.attributes=y,u?hl(h):bl(h)}function ua(e){var n=e.content,t=e.width,a=e.height,i=e.transform,l=e.extra,c=e.watchable,u=c===void 0?!1:c,d=w(w({},l.attributes),{},{class:l.classes.join(" ")});u&&(d[Je]="");var v=w({},l.styles);Ln(i)&&(v.transform=Ys({transform:i,width:t,height:a}),v["-webkit-transform"]=v.transform);var k=Ht(v);k.length>0&&(d.style=k);var _=[];return _.push({tag:"span",attributes:d,children:[n]}),_}function xl(e){var n=e.content,t=e.extra,a=w(w({},t.attributes),{},{class:t.classes.join(" ")}),i=Ht(t.styles);i.length>0&&(a.style=i);var l=[];return l.push({tag:"span",attributes:a,children:[n]}),l}var tn=Se.styles;function xn(e){var n=e[0],t=e[1],a=e.slice(4),i=Gt(a,1),l=i[0],c=null;return Array.isArray(l)?c={tag:"g",attributes:{class:"".concat(T.cssPrefix,"-").concat(Jt.GROUP)},children:[{tag:"path",attributes:{class:"".concat(T.cssPrefix,"-").concat(Jt.SECONDARY),fill:"currentColor",d:l[0]}},{tag:"path",attributes:{class:"".concat(T.cssPrefix,"-").concat(Jt.PRIMARY),fill:"currentColor",d:l[1]}}]}:c={tag:"path",attributes:{fill:"currentColor",d:l}},{found:!0,width:n,height:t,icon:c}}var wl={found:!1,width:512,height:512};function _l(e,n){!hi&&!T.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(n,'" is missing.'))}function wn(e,n){var t=n;return n==="fa"&&T.styleDefault!==null&&(n=We()),new Promise(function(a,i){if(t==="fa"){var l=Fi(e)||{};e=l.iconName||e,n=l.prefix||n}if(e&&n&&tn[n]&&tn[n][e]){var c=tn[n][e];return a(xn(c))}_l(e,n),a(w(w({},wl),{},{icon:T.showMissingIcons&&e?Ue("missingIconAbstract")||{}:{}}))})}var fa=function(){},_n=T.measurePerformance&&At&&At.mark&&At.measure?At:{mark:fa,measure:fa},ht='FA "7.3.1"',kl=function(n){return _n.mark("".concat(ht," ").concat(n," begins")),function(){return Ni(n)}},Ni=function(n){_n.mark("".concat(ht," ").concat(n," ends")),_n.measure("".concat(ht," ").concat(n),"".concat(ht," ").concat(n," begins"),"".concat(ht," ").concat(n," ends"))},Rn={begin:kl,end:Ni},Et=function(){};function da(e){var n=e.getAttribute?e.getAttribute(Je):null;return typeof n=="string"}function Sl(e){var n=e.getAttribute?e.getAttribute(jn):null,t=e.getAttribute?e.getAttribute(On):null;return n&&t}function $l(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(T.replacementClass)}function Cl(){if(T.autoReplaceSvg===!0)return Lt.replace;var e=Lt[T.autoReplaceSvg];return e||Lt.replace}function Pl(e){return X.createElementNS("http://www.w3.org/2000/svg",e)}function Il(e){return X.createElement(e)}function Mi(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.ceFn,a=t===void 0?e.tag==="svg"?Pl:Il:t;if(typeof e=="string")return X.createTextNode(e);var i=a(e.tag);Object.keys(e.attributes||[]).forEach(function(c){i.setAttribute(c,e.attributes[c])});var l=e.children||[];return l.forEach(function(c){i.appendChild(Mi(c,{ceFn:a}))}),i}function Al(e){var n=" ".concat(e.outerHTML," ");return n="".concat(n,"Font Awesome fontawesome.com "),n}var Lt={replace:function(n){var t=n[0];if(t.parentNode)if(n[1].forEach(function(i){t.parentNode.insertBefore(Mi(i),t)}),t.getAttribute(Je)===null&&T.keepOriginalSource){var a=X.createComment(Al(t));t.parentNode.replaceChild(a,t)}else t.remove()},nest:function(n){var t=n[0],a=n[1];if(~En(t).indexOf(T.replacementClass))return Lt.replace(n);var i=new RegExp("".concat(T.cssPrefix,"-.*"));if(delete a[0].attributes.id,a[0].attributes.class){var l=a[0].attributes.class.split(" ").reduce(function(u,d){return d===T.replacementClass||d.match(i)?u.toSvg.push(d):u.toNode.push(d),u},{toNode:[],toSvg:[]});a[0].attributes.class=l.toSvg.join(" "),l.toNode.length===0?t.removeAttribute("class"):t.setAttribute("class",l.toNode.join(" "))}var c=a.map(function(u){return Ct(u)}).join(`
`);t.setAttribute(Je,""),t.innerHTML=c}};function ma(e){e()}function Di(e,n){var t=typeof n=="function"?n:Et;if(e.length===0)t();else{var a=ma;T.mutateApproach===js&&(a=Be.requestAnimationFrame||ma),a(function(){var i=Cl(),l=Rn.begin("mutate");e.map(i),l(),t()})}}var Bn=!1;function Ri(){Bn=!0}function kn(){Bn=!1}var Ut=null;function pa(e){if(Jn&&T.observeMutations){var n=e.treeCallback,t=n===void 0?Et:n,a=e.nodeCallback,i=a===void 0?Et:a,l=e.pseudoElementsCallback,c=l===void 0?Et:l,u=e.observeMutationsRoot,d=u===void 0?X:u;Ut=new Jn(function(v){if(!Bn){var k=We();ut(v).forEach(function(_){if(_.type==="childList"&&_.addedNodes.length>0&&!da(_.addedNodes[0])&&(T.searchPseudoElements&&c(_.target),t(_.target)),_.type==="attributes"&&_.target.parentNode&&T.searchPseudoElements&&c([_.target],!0),_.type==="attributes"&&da(_.target)&&~Ms.indexOf(_.attributeName))if(_.attributeName==="class"&&Sl(_.target)){var A=Xt(En(_.target)),I=A.prefix,$=A.iconName;_.target.setAttribute(jn,I||k),$&&_.target.setAttribute(On,$)}else $l(_.target)&&i(_.target)})}}),De&&Ut.observe(d,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function Tl(){Ut&&Ut.disconnect()}function zl(e){var n=e.getAttribute("style"),t=[];return n&&(t=n.split(";").reduce(function(a,i){var l=i.split(":"),c=l[0],u=l.slice(1);return c&&u.length>0&&(a[c]=u.join(":").trim()),a},{})),t}function jl(e){var n=e.getAttribute("data-prefix"),t=e.getAttribute("data-icon"),a=e.innerText!==void 0?e.innerText.trim():"",i=Xt(En(e));return i.prefix||(i.prefix=We()),n&&t&&(i.prefix=n,i.iconName=t),i.iconName&&i.prefix||(i.prefix&&a.length>0&&(i.iconName=nl(i.prefix,e.innerText)||Mn(i.prefix,Ci(e.innerText))),!i.iconName&&T.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(i.iconName=e.firstChild.data)),i}function Ol(e){var n=ut(e.attributes).reduce(function(t,a){return t.name!=="class"&&t.name!=="style"&&(t[a.name]=a.value),t},{});return n}function Fl(){return{iconName:null,prefix:null,transform:Oe,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function ga(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},t=jl(e),a=t.iconName,i=t.prefix,l=t.rest,c=Ol(e),u=hn("parseNodeAttributes",{},e),d=n.styleParser?zl(e):[];return w({iconName:a,prefix:i,transform:Oe,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:l,styles:d,attributes:c}},u)}var El=Se.styles;function Bi(e){var n=T.autoReplaceSvg==="nest"?ga(e,{styleParser:!1}):ga(e);return~n.extra.classes.indexOf(xi)?Ue("generateLayersText",e,n):Ue("generateSvgReplacementMutation",e,n)}function Ll(){return[].concat($e(di),$e(mi))}function va(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!De)return Promise.resolve();var t=X.documentElement.classList,a=function(_){return t.add("".concat(ta,"-").concat(_))},i=function(_){return t.remove("".concat(ta,"-").concat(_))},l=T.autoFetchSvg?Ll():Wa.concat(Object.keys(El));l.includes("fa")||l.push("fa");var c=[".".concat(xi,":not([").concat(Je,"])")].concat(l.map(function(k){return".".concat(k,":not([").concat(Je,"])")})).join(", ");if(c.length===0)return Promise.resolve();var u=[];try{u=ut(e.querySelectorAll(c))}catch{}if(u.length>0)a("pending"),i("complete");else return Promise.resolve();var d=Rn.begin("onTree"),v=u.reduce(function(k,_){try{var A=Bi(_);A&&k.push(A)}catch(I){hi||I.name==="MissingIcon"&&console.error(I)}return k},[]);return new Promise(function(k,_){Promise.all(v).then(function(A){Di(A,function(){a("active"),a("complete"),i("pending"),typeof n=="function"&&n(),d(),k()})}).catch(function(A){d(),_(A)})})}function Nl(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;Bi(e).then(function(t){t&&Di([t],n)})}function Ml(e){return function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=(n||{}).icon?n:yn(n||{}),i=t.mask;return i&&(i=(i||{}).icon?i:yn(i||{})),e(a,w(w({},t),{},{mask:i}))}}var Dl=function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=t.transform,i=a===void 0?Oe:a,l=t.symbol,c=l===void 0?!1:l,u=t.mask,d=u===void 0?null:u,v=t.maskId,k=v===void 0?null:v,_=t.classes,A=_===void 0?[]:_,I=t.attributes,$=I===void 0?{}:I,b=t.styles,P=b===void 0?{}:b;if(n){var h=n.prefix,m=n.iconName,C=n.icon;return qt(w({type:"icon"},n),function(){return Ze("beforeDOMElementCreation",{iconDefinition:n,params:t}),Dn({icons:{main:xn(C),mask:d?xn(d.icon):{found:!1,width:null,height:null,icon:{}}},prefix:h,iconName:m,transform:w(w({},Oe),i),symbol:c,maskId:k,extra:{attributes:$,styles:P,classes:A}})})}},Rl={mixout:function(){return{icon:Ml(Dl)}},hooks:function(){return{mutationObserverCallbacks:function(t){return t.treeCallback=va,t.nodeCallback=Nl,t}}},provides:function(n){n.i2svg=function(t){var a=t.node,i=a===void 0?X:a,l=t.callback,c=l===void 0?function(){}:l;return va(i,c)},n.generateSvgReplacementMutation=function(t,a){var i=a.iconName,l=a.prefix,c=a.transform,u=a.symbol,d=a.mask,v=a.maskId,k=a.extra;return new Promise(function(_,A){Promise.all([wn(i,l),d.iconName?wn(d.iconName,d.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(I){var $=Gt(I,2),b=$[0],P=$[1];_([t,Dn({icons:{main:b,mask:P},prefix:l,iconName:i,transform:c,symbol:u,maskId:v,extra:k,watchable:!0})])}).catch(A)})},n.generateAbstractIcon=function(t){var a=t.children,i=t.attributes,l=t.main,c=t.transform,u=t.styles,d=Ht(u);d.length>0&&(i.style=d);var v;return Ln(c)&&(v=Ue("generateAbstractTransformGrouping",{main:l,transform:c,containerWidth:l.width,iconWidth:l.width})),a.push(v||l.icon),{children:a,attributes:i}}}},Bl={mixout:function(){return{layer:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.classes,l=i===void 0?[]:i;return qt({type:"layer"},function(){Ze("beforeDOMElementCreation",{assembler:t,params:a});var c=[];return t(function(u){Array.isArray(u)?u.map(function(d){c=c.concat(d.abstract)}):c=c.concat(u.abstract)}),[{tag:"span",attributes:{class:["".concat(T.cssPrefix,"-layers")].concat($e(l)).join(" ")},children:c}]})}}}},Wl={mixout:function(){return{counter:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};a.title;var i=a.classes,l=i===void 0?[]:i,c=a.attributes,u=c===void 0?{}:c,d=a.styles,v=d===void 0?{}:d;return qt({type:"counter",content:t},function(){return Ze("beforeDOMElementCreation",{content:t,params:a}),xl({content:t.toString(),extra:{attributes:u,styles:v,classes:["".concat(T.cssPrefix,"-layers-counter")].concat($e(l))}})})}}}},Ul={mixout:function(){return{text:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.transform,l=i===void 0?Oe:i,c=a.classes,u=c===void 0?[]:c,d=a.attributes,v=d===void 0?{}:d,k=a.styles,_=k===void 0?{}:k;return qt({type:"text",content:t},function(){return Ze("beforeDOMElementCreation",{content:t,params:a}),ua({content:t,transform:w(w({},Oe),l),extra:{attributes:v,styles:_,classes:["".concat(T.cssPrefix,"-layers-text")].concat($e(u))}})})}}},provides:function(n){n.generateLayersText=function(t,a){var i=a.transform,l=a.extra,c=null,u=null;if(Ra){var d=parseInt(getComputedStyle(t).fontSize,10),v=t.getBoundingClientRect();c=v.width/d,u=v.height/d}return Promise.resolve([t,ua({content:t.innerHTML,width:c,height:u,transform:i,extra:l,watchable:!0})])}}},Wi=new RegExp('"',"ug"),ba=[1105920,1112319],ha=w(w(w(w({},{FontAwesome:{normal:"fas",400:"fas"}}),mo),Ts),_o),Sn=Object.keys(ha).reduce(function(e,n){return e[n.toLowerCase()]=ha[n],e},{}),Vl=Object.keys(Sn).reduce(function(e,n){var t=Sn[n];return e[n]=t[900]||$e(Object.entries(t))[0][1],e},{});function Kl(e){var n=e.replace(Wi,"");return Ci($e(n)[0]||"")}function Gl(e){var n=e.getPropertyValue("font-feature-settings").includes("ss01"),t=e.getPropertyValue("content"),a=t.replace(Wi,""),i=a.codePointAt(0),l=i>=ba[0]&&i<=ba[1],c=a.length===2?a[0]===a[1]:!1;return l||c||n}function Hl(e,n){var t=e.replace(/^['"]|['"]$/g,"").toLowerCase(),a=parseInt(n),i=isNaN(a)?"normal":a;return(Sn[t]||{})[i]||Vl[t]}function ya(e,n){var t="".concat(zs).concat(n.replace(":","-"));return new Promise(function(a,i){if(e.getAttribute(t)!==null)return a();var l=ut(e.children),c=l.filter(function(te){return te.getAttribute(mn)===n})[0],u=Be.getComputedStyle(e,n),d=u.getPropertyValue("font-family"),v=d.match(Ls),k=u.getPropertyValue("font-weight"),_=u.getPropertyValue("content");if(c&&!v)return e.removeChild(c),a();if(v&&_!=="none"&&_!==""){var A=u.getPropertyValue("content"),I=Hl(d,k),$=Kl(A),b=v[0].startsWith("FontAwesome"),P=Gl(u),h=Mn(I,$),m=h;if(b){var C=al($);C.iconName&&C.prefix&&(h=C.iconName,I=C.prefix)}if(h&&!P&&(!c||c.getAttribute(jn)!==I||c.getAttribute(On)!==m)){e.setAttribute(t,m),c&&e.removeChild(c);var y=Fl(),F=y.extra;F.attributes[mn]=n,wn(h,I).then(function(te){var Z=Dn(w(w({},y),{},{icons:{main:te,mask:Ei()},prefix:I,iconName:m,extra:F,watchable:!0})),D=X.createElementNS("http://www.w3.org/2000/svg","svg");n==="::before"?e.insertBefore(D,e.firstChild):e.appendChild(D),D.outerHTML=Z.map(function(ne){return Ct(ne)}).join(`
`),e.removeAttribute(t),a()}).catch(i)}else a()}else a()})}function Yl(e){return Promise.all([ya(e,"::before"),ya(e,"::after")])}function Xl(e){return e.parentNode!==document.head&&!~Os.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(mn)&&(!e.parentNode||e.parentNode.tagName!=="svg")}var ql=function(n){return!!n&&bi.some(function(t){return n.includes(t)})},Ql=function(n){if(!n)return[];var t=new Set,a=n.split(/,(?![^()]*\))/).map(function(d){return d.trim()});a=a.flatMap(function(d){return d.includes("(")?d:d.split(",").map(function(v){return v.trim()})});var i=Ft(a),l;try{for(i.s();!(l=i.n()).done;){var c=l.value;if(ql(c)){var u=bi.reduce(function(d,v){return d.replace(v,"")},c);u!==""&&u!=="*"&&t.add(u)}}}catch(d){i.e(d)}finally{i.f()}return t};function xa(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if(De){var t;if(n)t=e;else if(T.searchPseudoElementsFullScan)t=e.querySelectorAll("*");else{var a=new Set,i=Ft(document.styleSheets),l;try{for(i.s();!(l=i.n()).done;){var c=l.value;try{var u=Ft(c.cssRules),d;try{for(u.s();!(d=u.n()).done;){var v=d.value,k=Ql(v.selectorText),_=Ft(k),A;try{for(_.s();!(A=_.n()).done;){var I=A.value;a.add(I)}}catch(b){_.e(b)}finally{_.f()}}}catch(b){u.e(b)}finally{u.f()}}catch(b){T.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(c.href," (").concat(b.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(b){i.e(b)}finally{i.f()}if(!a.size)return;var $=Array.from(a).join(", ");try{t=e.querySelectorAll($)}catch{}}return new Promise(function(b,P){var h=ut(t).filter(Xl).map(Yl),m=Rn.begin("searchPseudoElements");Ri(),Promise.all(h).then(function(){m(),kn(),b()}).catch(function(){m(),kn(),P()})})}}var Jl={hooks:function(){return{mutationObserverCallbacks:function(t){return t.pseudoElementsCallback=xa,t}}},provides:function(n){n.pseudoElements2svg=function(t){var a=t.node,i=a===void 0?X:a;T.searchPseudoElements&&xa(i)}}},wa=!1,Zl={mixout:function(){return{dom:{unwatch:function(){Ri(),wa=!0}}}},hooks:function(){return{bootstrap:function(){pa(hn("mutationObserverCallbacks",{}))},noAuto:function(){Tl()},watch:function(t){var a=t.observeMutationsRoot;wa?kn():pa(hn("mutationObserverCallbacks",{observeMutationsRoot:a}))}}}},_a=function(n){var t={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return n.toLowerCase().split(" ").reduce(function(a,i){var l=i.toLowerCase().split("-"),c=l[0],u=l.slice(1).join("-");if(c&&u==="h")return a.flipX=!0,a;if(c&&u==="v")return a.flipY=!0,a;if(u=parseFloat(u),isNaN(u))return a;switch(c){case"grow":a.size=a.size+u;break;case"shrink":a.size=a.size-u;break;case"left":a.x=a.x-u;break;case"right":a.x=a.x+u;break;case"up":a.y=a.y-u;break;case"down":a.y=a.y+u;break;case"rotate":a.rotate=a.rotate+u;break}return a},t)},ec={mixout:function(){return{parse:{transform:function(t){return _a(t)}}}},hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-transform");return i&&(t.transform=_a(i)),t}}},provides:function(n){n.generateAbstractTransformGrouping=function(t){var a=t.main,i=t.transform,l=t.containerWidth,c=t.iconWidth,u={transform:"translate(".concat(l/2," 256)")},d="translate(".concat(i.x*32,", ").concat(i.y*32,") "),v="scale(".concat(i.size/16*(i.flipX?-1:1),", ").concat(i.size/16*(i.flipY?-1:1),") "),k="rotate(".concat(i.rotate," 0 0)"),_={transform:"".concat(d," ").concat(v," ").concat(k)},A={transform:"translate(".concat(c/2*-1," -256)")},I={outer:u,inner:_,path:A};return{tag:"g",attributes:w({},I.outer),children:[{tag:"g",attributes:w({},I.inner),children:[{tag:a.icon.tag,children:a.icon.children,attributes:w(w({},a.icon.attributes),I.path)}]}]}}}},nn={x:0,y:0,width:"100%",height:"100%"};function ka(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||n)&&(e.attributes.fill="black"),e}function tc(e){return e.tag==="g"?e.children:[e]}var nc={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-mask"),l=i?Xt(i.split(" ").map(function(c){return c.trim()})):Ei();return l.prefix||(l.prefix=We()),t.mask=l,t.maskId=a.getAttribute("data-fa-mask-id"),t}}},provides:function(n){n.generateAbstractMask=function(t){var a=t.children,i=t.attributes,l=t.main,c=t.mask,u=t.maskId,d=t.transform,v=l.width,k=l.icon,_=c.width,A=c.icon,I=Hs({transform:d,containerWidth:_,iconWidth:v}),$={tag:"rect",attributes:w(w({},nn),{},{fill:"white"})},b=k.children?{children:k.children.map(ka)}:{},P={tag:"g",attributes:w({},I.inner),children:[ka(w({tag:k.tag,attributes:w(w({},k.attributes),I.path)},b))]},h={tag:"g",attributes:w({},I.outer),children:[P]},m="mask-".concat(u||aa()),C="clip-".concat(u||aa()),y={tag:"mask",attributes:w(w({},nn),{},{id:m,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[$,h]},F={tag:"defs",children:[{tag:"clipPath",attributes:{id:C},children:tc(A)},y]};return a.push(F,{tag:"rect",attributes:w({fill:"currentColor","clip-path":"url(#".concat(C,")"),mask:"url(#".concat(m,")")},nn)}),{children:a,attributes:i}}}},ac={provides:function(n){var t=!1;Be.matchMedia&&(t=Be.matchMedia("(prefers-reduced-motion: reduce)").matches),n.missingIconAbstract=function(){var a=[],i={fill:"currentColor"},l={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};a.push({tag:"path",attributes:w(w({},i),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var c=w(w({},l),{},{attributeName:"opacity"}),u={tag:"circle",attributes:w(w({},i),{},{cx:"256",cy:"364",r:"28"}),children:[]};return t||u.children.push({tag:"animate",attributes:w(w({},l),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:w(w({},c),{},{values:"1;0;1;1;0;1;"})}),a.push(u),a.push({tag:"path",attributes:w(w({},i),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:t?[]:[{tag:"animate",attributes:w(w({},c),{},{values:"1;0;0;0;0;1;"})}]}),t||a.push({tag:"path",attributes:w(w({},i),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:w(w({},c),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:a}}}},ic={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-symbol"),l=i===null?!1:i===""?!0:i;return t.symbol=l,t}}}},rc=[qs,Rl,Bl,Wl,Ul,Jl,Zl,ec,nc,ac,ic];dl(rc,{mixoutsTo:he});he.noAuto;he.config;he.library;he.dom;var $n=he.parse;he.findIconDefinition;he.toHtml;var oc=he.icon;he.layer;he.text;he.counter;function Cn(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function sc(e){if(Array.isArray(e))return Cn(e)}function K(e,n,t){return(n=mc(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function lc(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function cc(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Sa(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function J(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?Sa(Object(t),!0).forEach(function(a){K(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Sa(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function an(e,n){if(e==null)return{};var t,a,i=uc(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)t=l[a],n.indexOf(t)===-1&&{}.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}function uc(e,n){if(e==null)return{};var t={};for(var a in e)if({}.hasOwnProperty.call(e,a)){if(n.indexOf(a)!==-1)continue;t[a]=e[a]}return t}function fc(e){return sc(e)||lc(e)||pc(e)||cc()}function dc(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function mc(e){var n=dc(e,"string");return typeof n=="symbol"?n:n+""}function Vt(e){"@babel/helpers - typeof";return Vt=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Vt(e)}function pc(e,n){if(e){if(typeof e=="string")return Cn(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?Cn(e,n):void 0}}function rn(e,n){return Array.isArray(n)&&n.length>0||!Array.isArray(n)&&n?K({},e,n):{}}function gc(e){var n,t=(n={"fa-spin":e.spin,"fa-pulse":e.pulse,"fa-fw":e.fixedWidth,"fa-border":e.border,"fa-li":e.listItem,"fa-inverse":e.inverse,"fa-flip":e.flip===!0,"fa-flip-horizontal":e.flip==="horizontal"||e.flip==="both","fa-flip-vertical":e.flip==="vertical"||e.flip==="both"},K(K(K(K(K(K(K(K(K(K(n,"fa-".concat(e.size),e.size!==null),"fa-rotate-".concat(e.rotation),e.rotation!==null),"fa-rotate-by",e.rotateBy),"fa-pull-".concat(e.pull),e.pull!==null),"fa-swap-opacity",e.swapOpacity),"fa-bounce",e.bounce),"fa-shake",e.shake),"fa-beat",e.beat),"fa-fade",e.fade),"fa-beat-fade",e.beatFade),K(K(K(K(K(K(K(K(K(K(n,"fa-flash",e.flash),"fa-spin-pulse",e.spinPulse),"fa-spin-reverse",e.spinReverse),"fa-width-auto",e.widthAuto),"fa-canvas-square",e.canvasSquare),"fa-canvas-roomy",e.canvasRoomy),"fa-flip-360",e.flip360),"fa-buzz",e.buzz),"fa-float",e.float),"fa-jello",e.jello),K(K(K(K(K(n,"fa-spin-snap",e.spinSnap),"fa-spin-snap-4",e.spinSnap4),"fa-spin-snap-8",e.spinSnap8),"fa-swing",e.swing),"fa-wag",e.wag));return Object.keys(t).map(function(a){return t[a]?a:null}).filter(function(a){return a})}var vc=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Ui={exports:{}};(function(e){(function(n){var t=function(h,m,C){if(!v(m)||_(m)||A(m)||I(m)||d(m))return m;var y,F=0,te=0;if(k(m))for(y=[],te=m.length;F<te;F++)y.push(t(h,m[F],C));else{y={};for(var Z in m)Object.prototype.hasOwnProperty.call(m,Z)&&(y[h(Z,C)]=t(h,m[Z],C))}return y},a=function(h,m){m=m||{};var C=m.separator||"_",y=m.split||/(?=[A-Z])/;return h.split(y).join(C)},i=function(h){return $(h)?h:(h=h.replace(/[\-_\s]+(.)?/g,function(m,C){return C?C.toUpperCase():""}),h.substr(0,1).toLowerCase()+h.substr(1))},l=function(h){var m=i(h);return m.substr(0,1).toUpperCase()+m.substr(1)},c=function(h,m){return a(h,m).toLowerCase()},u=Object.prototype.toString,d=function(h){return typeof h=="function"},v=function(h){return h===Object(h)},k=function(h){return u.call(h)=="[object Array]"},_=function(h){return u.call(h)=="[object Date]"},A=function(h){return u.call(h)=="[object RegExp]"},I=function(h){return u.call(h)=="[object Boolean]"},$=function(h){return h=h-0,h===h},b=function(h,m){var C=m&&"process"in m?m.process:m;return typeof C!="function"?h:function(y,F){return C(y,h,F)}},P={camelize:i,decamelize:c,pascalize:l,depascalize:c,camelizeKeys:function(h,m){return t(b(i,m),h)},decamelizeKeys:function(h,m){return t(b(c,m),h,m)},pascalizeKeys:function(h,m){return t(b(l,m),h)},depascalizeKeys:function(){return this.decamelizeKeys.apply(this,arguments)}};e.exports?e.exports=P:n.humps=P})(vc)})(Ui);var bc=Ui.exports,hc=["gradientFill"],yc=["class","style"],xc=["type","stops","id"];function wc(e){return e.split(";").map(function(n){return n.trim()}).filter(function(n){return n}).reduce(function(n,t){var a=t.indexOf(":"),i=bc.camelize(t.slice(0,a)),l=t.slice(a+1).trim();return n[i]=l,n},{})}function _c(e){return e.split(/\s+/).reduce(function(n,t){return n[t]=!0,n},{})}function kc(e,n){return Ot("stop",J({key:"".concat(n,"-").concat(e.offset),offset:e.offset,"stop-color":e.color},e.opacity!==void 0&&{"stop-opacity":e.opacity}))}function Vi(e){if(typeof e=="string")return e;var n=(e.children||[]).map(Vi);return e.tag==="path"&&e.attributes&&"fill"in e.attributes?J(J({},e),{},{attributes:J(J({},e.attributes),{},{fill:void 0}),children:n}):J(J({},e),{},{children:n})}function Ki(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof e=="string")return e;var a=n.gradientFill,i=a===void 0?null:a,l=an(n,hc),c=!!i||"fill"in t,u=c?Vi(e):e,d=(u.children||[]).map(function(y){return Ki(y,{},{})}),v=Object.keys(u.attributes||{}).reduce(function(y,F){var te=u.attributes[F];switch(F){case"class":y.class=_c(te);break;case"style":y.style=wc(te);break;default:y.attrs[F]=te}return y},{attrs:{},class:{},style:{}});t.class;var k=t.style,_=k===void 0?{}:k,A=an(t,yc);if(i&&i.id&&(i.type==="linear"||i.type==="radial")){var I=i.type,$=i.stops,b=$===void 0?[]:$,P=i.id,h=an(i,xc),m=I==="linear"?"linearGradient":"radialGradient",C=Ot(m,J(J({},h),{},{id:P}),b.map(kc));return Ot(u.tag,J(J(J(J({},l),{},{class:v.class,style:J(J({},v.style),_)},v.attrs),A),{},{fill:"url(#".concat(P,")")}),[C].concat(fc(d)))}return Ot(e.tag,J(J(J({},l),{},{class:v.class,style:J(J({},v.style),_)},v.attrs),A),d)}var Gi=!1;try{Gi=!0}catch{}function $a(){if(!Gi&&console&&typeof console.error=="function"){var e;(e=console).error.apply(e,arguments)}}function Ca(e){if(e&&Vt(e)==="object"&&e.prefix&&e.iconName&&e.icon)return e;if($n.icon)return $n.icon(e);if(e===null)return null;if(Vt(e)==="object"&&e.prefix&&e.iconName)return e;if(Array.isArray(e)&&e.length===2)return{prefix:e[0],iconName:e[1]};if(typeof e=="string")return{prefix:"fas",iconName:e}}var Sc=Ve({name:"FontAwesomeIcon",props:{border:{type:Boolean,default:!1},fixedWidth:{type:Boolean,default:!1},flip:{type:[Boolean,String],default:!1,validator:function(n){return[!0,!1,"horizontal","vertical","both"].indexOf(n)>-1}},icon:{type:[Object,Array,String],required:!0},mask:{type:[Object,Array,String],default:null},maskId:{type:String,default:null},listItem:{type:Boolean,default:!1},pull:{type:String,default:null,validator:function(n){return["right","left"].indexOf(n)>-1}},pulse:{type:Boolean,default:!1},rotation:{type:[String,Number],default:null,validator:function(n){return[90,180,270].indexOf(Number.parseInt(n,10))>-1}},rotateBy:{type:Boolean,default:!1},swapOpacity:{type:Boolean,default:!1},size:{type:String,default:null,validator:function(n){return["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"].indexOf(n)>-1}},spin:{type:Boolean,default:!1},transform:{type:[String,Object],default:null},symbol:{type:[Boolean,String],default:!1},title:{type:String,default:null},titleId:{type:String,default:null},inverse:{type:Boolean,default:!1},bounce:{type:Boolean,default:!1},shake:{type:Boolean,default:!1},beat:{type:Boolean,default:!1},fade:{type:Boolean,default:!1},beatFade:{type:Boolean,default:!1},flash:{type:Boolean,default:!1},spinPulse:{type:Boolean,default:!1},spinReverse:{type:Boolean,default:!1},widthAuto:{type:Boolean,default:!1},canvasSquare:{type:Boolean,default:!1},canvasRoomy:{type:Boolean,default:!1},gradientFill:{type:Object,default:null,validator:function(n){return typeof n.id!="string"||!n.id?(console.warn("FontAwesomeIcon: gradientFill.id must be a non-empty string"),!1):n.type!=="linear"&&n.type!=="radial"?(console.warn('FontAwesomeIcon: gradientFill.type must be "linear" or "radial"'),!1):!0}},flip360:{type:Boolean,default:!1},buzz:{type:Boolean,default:!1},float:{type:Boolean,default:!1},jello:{type:Boolean,default:!1},spinSnap:{type:Boolean,default:!1},spinSnap4:{type:Boolean,default:!1},spinSnap8:{type:Boolean,default:!1},swing:{type:Boolean,default:!1},wag:{type:Boolean,default:!1}},setup:function(n,t){var a=t.attrs,i=j(function(){return Ca(n.icon)}),l=j(function(){return rn("classes",gc(n))}),c=j(function(){return rn("transform",typeof n.transform=="string"?$n.transform(n.transform):n.transform)}),u=j(function(){return rn("mask",Ca(n.mask))}),d=j(function(){var k=J(J(J(J({},l.value),c.value),u.value),{},{symbol:n.symbol,maskId:n.maskId});return k.title=n.title,k.titleId=n.titleId,oc(i.value,k)});Le(d,function(k){if(!k)return $a("Could not find one or more icon(s)",i.value,u.value)},{immediate:!0}),n.gradientFill&&n.symbol&&$a("gradientFill is not supported when symbol is true and will be ignored");var v=j(function(){return d.value?Ki(d.value.abstract[0],{gradientFill:n.symbol?null:n.gradientFill},a):null});return function(){return v.value}}});var $c={prefix:"fas",iconName:"arrow-up-from-bracket",icon:[448,512,[],"e09a","M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"]};const Cc={class:"challenge-launch","aria-labelledby":"launch-title"},Pc={class:"challenge-launch__heading"},Ic={class:"builder-card__eyebrow"},Ac={id:"launch-title"},Tc=["aria-label"],zc=["disabled"],jc=["disabled"],Oc={class:"action-button__icon","aria-hidden":"true"},Fc=["src"],Ec={key:1,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},Lc=["disabled"],Nc=["disabled"],Mc={class:"action-button__icon","aria-hidden":"true"},Dc=Ve({__name:"ChallengeActions",props:{ready:{type:Boolean},busyAction:{}},emits:["exercise","print","save"],setup(e,{emit:n}){const{ui:t}=et(),a=n,i=bt("challenge-random-coach-avatar",()=>"");return kt(async()=>{if(!i.value)try{const c=(await $fetch("/api/coaches")).coaches.filter(d=>d.avatarPath),u=c[Math.floor(Math.random()*c.length)];i.value=u?.avatarPath||""}catch{}}),(l,c)=>(x(),S("section",Cc,[r("div",Pc,[r("div",null,[r("p",Ic,f(s(t)("Ton défi est prêt")),1),r("h2",Ac,f(s(t)("Comment veux-tu l’utiliser ?")),1)])]),r("div",{class:"challenge-actions","aria-label":s(t)("Lancer le défi")},[r("button",{class:"action-button action-button--primary","data-tour":"action-classic",type:"button",disabled:!e.ready||!!e.busyAction,onClick:c[0]||(c[0]=u=>a("exercise","classic"))},[c[4]||(c[4]=r("span",{class:"action-button__icon","aria-hidden":"true"},"●",-1)),r("span",null,[r("strong",null,f(e.busyAction==="exercise"?s(t)("Préparation…"):s(t)("Classique")),1),r("small",null,f(s(t)("Questions et correction immédiate")),1)])],8,zc),r("button",{class:"action-button action-button--chat","data-tour":"action-coach",type:"button",disabled:!e.ready||!!e.busyAction,onClick:c[1]||(c[1]=u=>a("exercise","chat"))},[r("span",Oc,[s(i)?(x(),S("img",{key:0,src:s(i),alt:""},null,8,Fc)):(x(),S("svg",Ec,[...c[5]||(c[5]=[r("circle",{cx:"12",cy:"8",r:"4"},null,-1),r("path",{d:"M4.5 21a7.5 7.5 0 0 1 15 0"},null,-1)])]))]),r("span",null,[r("strong",null,f(e.busyAction==="exercise"?s(t)("Préparation…"):s(t)("Avec un coach")),1),r("small",null,f(s(t)("Dialogue virtuel avec une aide pas à pas")),1)])],8,jc),r("button",{class:"action-button action-button--print","data-tour":"action-print",type:"button",disabled:!e.ready||!!e.busyAction,onClick:c[2]||(c[2]=u=>a("print"))},[c[6]||(c[6]=dr('<span class="action-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v7H6z"></path><path d="M18 12h.01"></path></svg></span>',1)),r("span",null,[r("strong",null,f(e.busyAction==="print"?s(t)("Préparation…"):s(t)("Imprimer")),1),r("small",null,f(s(t)("Les questions et le corrigé")),1)])],8,Lc),r("button",{class:"action-button action-button--share","data-tour":"action-share",type:"button",disabled:!e.ready||!!e.busyAction,onClick:c[3]||(c[3]=u=>a("save"))},[r("span",Mc,[qe(s(Sc),{icon:s($c)},null,8,["icon"])]),r("span",null,[r("strong",null,f(e.busyAction==="save"?s(t)("Sauvegarde…"):s(t)("Partager")),1),r("small",null,f(s(t)("Partager ce défi avec d’autres personnes")),1)])],8,Nc)],8,Tc)]))}}),Fm=Object.assign(Dc,{__name:"ChallengeActions"}),Rc=["aria-labelledby"],Bc={class:"builder-card__header"},Wc={class:"builder-card__eyebrow"},Uc=["id"],Vc={class:"options-main-column"},Kc=["for"],Gc=["id","value"],Hc={class:"check-row"},Yc=["checked"],Xc={class:"option-fieldset"},qc={class:"segmented-control"},Qc=["name","checked"],Jc=["name","checked"],Zc={class:"segmented-control segmented-control--stacked"},eu=["name","checked"],tu=["name","checked"],nu=["aria-hidden"],au={key:0,class:"complement-options__title"},iu={key:1,class:"complement-options__description"},ru=["disabled","aria-expanded","aria-controls"],ou={"aria-hidden":"true"},su={key:3,class:"complement-options__unavailable"},lu=["id"],cu={class:"sr-only"},uu=["disabled","checked"],fu=["disabled","checked"],du=["disabled","checked"],mu=["disabled","checked"],pu={class:"conjugation-example__header"},gu={class:"conjugation-example__heading"},vu={class:"conjugation-example__screen"},bu={key:0,class:"conjugation-example__loading",role:"status"},hu={class:"sr-only"},yu={key:1,class:"conjugation-example__body"},xu={key:0,class:"conjugation-example__question"},wu={class:"conjugation-example__block-label"},_u={class:"conjugation-example__instruction"},ku={key:0,class:"conjugation-example__citation"},Su={key:1,class:"conjugation-example__question-line"},$u={class:"conjugation-example__prompt"},Cu={key:0,class:"conjugation-example__instruction"},Pu={key:1,class:"conjugation-example__question-line"},Iu={class:"conjugation-example__context"},Au={key:0,class:"conjugation-example__correction"},Tu={key:1},zu=Ve({__name:"ChallengeOptions",props:{questionCount:{},exerciseKind:{},identificationSource:{},inclusivePronouns:{type:Boolean},complementOptions:{},complementVerbs:{},eyebrow:{},idPrefix:{},gridLayout:{type:Boolean},conjugationInstruction:{},conjugationQuestionContext:{},conjugationQuestion:{},conjugationExample:{},conjugationExamplePrefix:{},conjugationExampleEmphasis:{},conjugationExampleSuffix:{},conjugationLiteraryCitation:{},conjugationExampleLoading:{type:Boolean},revealPrefilledOptions:{type:Boolean}},emits:["updateQuestionCount","updateExerciseKind","updateIdentificationSource","updateInclusivePronouns","updateComplementOptions","prefilledOptionsRevealStart"],setup(e,{emit:n}){const{ui:t}=et(),a=e,i=n,l=Y(!!a.gridLayout),c=j(()=>(a.complementVerbs??[]).filter(g=>!!g.complementExample)),u=j(()=>a.exerciseKind==="conjugation"&&c.value.length>0),d=j(()=>c.value.some(g=>g.complementFunctions?.includes("cod")||g.complementExample?.functionObject==="cod")),v=j(()=>c.value.some(g=>g.complementFunctions?.includes("coi")||g.complementExample?.functionObject==="coi")),k=j(()=>c.value.some(g=>g.anteposableComplementFunctions?.includes("cod")||!!g.complementExample?.before)),_=j(()=>c.value.some(g=>g.anteposableComplementFunctions?.includes("coi"))),A=j(()=>a.idPrefix??"challenge-options"),I=j(()=>`${A.value}-title`),$=j(()=>`${A.value}-question-count`),b=j(()=>`${A.value}-exercise-kind`),P=j(()=>`${A.value}-identification-source`),h=j(()=>`${A.value}-complement-panel`),m=j(()=>!!((a.conjugationInstruction||a.conjugationQuestionContext||a.conjugationQuestion)&&a.conjugationExample)),C=j(()=>{const g=a.conjugationQuestion?.trim()??"";return g&&!/[.!?]$/u.test(g)?`${g}.`:g}),y=Y(0),F=[],te=Y(a.questionCount),Z=Y([...a.complementOptions]),D=Y(!1),ne=Y(null);let G,q;const _e=[];function Re(){for(G!==void 0&&(cancelAnimationFrame(G),G=void 0);_e.length;)clearTimeout(_e.pop())}function Fe(){Re(),te.value=a.questionCount,Z.value=[...a.complementOptions],D.value=!1}function tt(){if(D.value)return;if(i("prefilledOptionsRevealStart"),Re(),window.matchMedia("(prefers-reduced-motion: reduce)").matches){Fe();return}const g=Math.max(0,a.questionCount),o=[...a.complementOptions],p=500,O=performance.now();D.value=!0,te.value=0,Z.value=[];const R=se=>{const xe=Math.min(1,(se-O)/p);te.value=Math.round(g*xe),xe<1?G=requestAnimationFrame(R):G=void 0};G=requestAnimationFrame(R),o.forEach((se,xe)=>{_e.push(setTimeout(()=>{Z.value=[...Z.value,se]},Math.round(xe/o.length*p)))}),_e.push(setTimeout(Fe,p))}function ye(){for(;F.length;)clearTimeout(F.pop())}Le(()=>a.conjugationExampleLoading,g=>{ye(),y.value=0,!g&&F.push(setTimeout(()=>{y.value=1},80),setTimeout(()=>{y.value=2},280))},{immediate:!0}),Le(()=>a.questionCount,g=>{D.value||(te.value=g)}),Le(()=>a.complementOptions,g=>{D.value||(Z.value=[...g])},{deep:!0}),Le(()=>a.revealPrefilledOptions,g=>{g&&tt()}),kt(()=>{a.revealPrefilledOptions&&tt()}),In(()=>{ye(),Re(),q!==void 0&&cancelAnimationFrame(q)});function Ke(g){D.value&&Fe();const o=g.target.value;if(o==="")return;const p=Number(o);Number.isFinite(p)&&i("updateQuestionCount",Math.min(99,Math.max(1,Math.round(p))))}async function nt(g){const o=g.target.value;i("updateExerciseKind",o),!(!a.gridLayout||o!=="tense-identification")&&(await Mt(),q!==void 0&&cancelAnimationFrame(q),q=requestAnimationFrame(()=>{ne.value?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"}),q=void 0}))}function Ce(g,o){D.value&&Fe();const p=new Set(a.complementOptions);o?p.add(g):p.delete(g),i("updateComplementOptions",[...p])}return Le(u,g=>{g?a.gridLayout&&(l.value=!0):l.value=!1},{immediate:!0}),(g,o)=>(x(),S("section",{class:ke(["builder-card options-card",{"options-card--grid":e.gridLayout,"options-card--revealing":s(D)}]),"aria-labelledby":s(I)},[r("div",Bc,[r("div",null,[r("p",Wc,f(e.eyebrow??"Étape 3"),1),r("h2",{id:s(I)},f(s(t)("Mes options")),9,Uc)])]),r("div",{class:ke(["options-layout",{"options-layout--columns":e.gridLayout}])},[r("div",{class:ke(["options-fields",{"options-fields--columns":e.gridLayout}])},[r("div",Vc,[r("label",{class:"field-stack question-count-field",for:s($)},[r("span",null,f(s(t)("Nombre de questions")),1),r("input",{id:s($),type:"number",inputmode:"numeric",min:"1",max:"99",step:"1",value:s(te),onInput:Ke},null,40,Gc)],8,Kc),r("label",Hc,[r("input",{type:"checkbox",checked:e.inclusivePronouns,onChange:o[0]||(o[0]=p=>i("updateInclusivePronouns",p.target.checked))},null,40,Yc),r("span",null,[ve(f(s(t)("Inclure les pronoms"))+" ",1),o[8]||(o[8]=r("strong",null,"iel / iels",-1)),r("small",null,f(s(t)("Ils apparaîtront ponctuellement dans les questions.")),1)])]),r("fieldset",Xc,[r("legend",null,f(s(t)("Type d’exercice")),1),r("div",qc,[r("label",null,[r("input",{type:"radio",name:s(b),value:"conjugation",checked:e.exerciseKind==="conjugation",onChange:nt},null,40,Qc),r("span",null,f(s(t)("Conjuguer")),1)]),r("label",null,[r("input",{type:"radio",name:s(b),value:"tense-identification",checked:e.exerciseKind==="tense-identification",onChange:nt},null,40,Jc),r("span",null,f(s(t)("Trouver le mode et le temps")),1)])])]),e.exerciseKind==="tense-identification"?(x(),S("fieldset",{key:0,ref_key:"identificationSourceFieldset",ref:ne,class:"option-fieldset identification-source-fieldset"},[o[11]||(o[11]=r("legend",{class:"sr-only"},"Choix des verbes",-1)),r("div",Zc,[r("label",null,[r("input",{type:"radio",name:s(P),value:"selected-verbs",checked:e.identificationSource==="selected-verbs",onChange:o[1]||(o[1]=p=>i("updateIdentificationSource","selected-verbs"))},null,40,eu),o[9]||(o[9]=r("span",null,[r("strong",null,"Avec mes verbes"),r("small",null,"Formes conjuguées simples, sans citation.")],-1))]),r("label",null,[r("input",{type:"radio",name:s(P),value:"literary-corpus",checked:e.identificationSource==="literary-corpus",onChange:o[2]||(o[2]=p=>i("updateIdentificationSource","literary-corpus"))},null,40,tu),o[10]||(o[10]=r("span",null,[r("strong",null,"Avec n’importe quel verbe"),r("small",null,"Construits avec des phrases littéraires")],-1))])])],512)):M("",!0)]),r("div",{class:ke(["complement-options",{"complement-options--disabled":!s(u),"complement-options--hidden":e.gridLayout&&e.exerciseKind==="tense-identification"}]),"data-tour":"options-complements","aria-hidden":e.gridLayout&&e.exerciseKind==="tense-identification"?"true":void 0},[e.gridLayout?(x(),S("h3",au,f(s(t)("Compléments d’objets :")),1)):M("",!0),e.gridLayout?(x(),S("p",iu,f(s(t)("Ajoute des compléments d’objets directs ou indirects.")),1)):(x(),S("button",{key:2,class:"complement-options__trigger",type:"button",disabled:!s(u),"aria-expanded":s(l),"aria-controls":s(h),onClick:o[3]||(o[3]=p=>l.value=!s(l))},[r("span",null,[ve(f(s(t)("Compléments d’objets :"))+" ",1),r("small",null,f(s(t)("nouveau")),1)]),r("span",ou,f(s(l)?"−":"+"),1)],8,ru)),s(u)?M("",!0):(x(),S("p",su,f(e.exerciseKind!=="conjugation"?"Disponible uniquement pour un exercice de conjugaison.":"Les verbes choisis ne proposent pas de complément."),1)),qe(yt,{name:"complement-panel"},{default:Qe(()=>[e.gridLayout||s(l)?(x(),S("fieldset",{key:0,id:s(h),class:"complement-options__panel"},[r("legend",cu,f(s(t)("Présentation des compléments d’objets")),1),r("label",null,[r("input",{type:"checkbox",disabled:!s(u)||!s(d),checked:s(Z).includes("cod-after"),onChange:o[4]||(o[4]=p=>Ce("cod-after",p.target.checked))},null,40,uu),r("span",null,[r("strong",null,f(s(t)("COD placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!s(u)||!s(k),checked:s(Z).includes("cod-before"),onChange:o[5]||(o[5]=p=>Ce("cod-before",p.target.checked))},null,40,fu),r("span",null,[r("strong",null,f(s(t)("COD placé avant")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!s(u)||!s(v),checked:s(Z).includes("coi-after"),onChange:o[6]||(o[6]=p=>Ce("coi-after",p.target.checked))},null,40,du),r("span",null,[r("strong",null,f(s(t)("COI placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!s(u)||!s(_),checked:s(Z).includes("coi-before"),onChange:o[7]||(o[7]=p=>Ce("coi-before",p.target.checked))},null,40,mu),r("span",null,[r("strong",null,f(s(t)("COI placé avant")),1)])])],8,lu)):M("",!0)]),_:1})],10,nu)],2),e.gridLayout&&(e.conjugationExampleLoading||s(m))?(x(),S("div",{key:0,class:ke(["conjugation-example",{"conjugation-example--wide":e.exerciseKind==="tense-identification"}]),"data-tour":"options-preview","aria-live":"polite","aria-atomic":"true"},[r("div",pu,[o[12]||(o[12]=r("span",{class:"conjugation-example__preview-icon","aria-hidden":"true"},[r("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},[r("path",{d:"M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z"}),r("circle",{cx:"12",cy:"12",r:"3"})])],-1)),r("div",gu,[r("span",null,f(s(t)("Aperçu d’une question")),1)])]),r("div",vu,[e.conjugationExampleLoading?(x(),S("div",bu,[o[13]||(o[13]=r("span",{class:"conjugation-example__spinner","aria-hidden":"true"},null,-1)),r("span",hu,f(s(t)("Préparation de l’aperçu")),1)])):(x(),S("div",yu,[qe(yt,{name:"example-item"},{default:Qe(()=>[s(y)>=1?(x(),S("div",xu,[r("span",wu,f(s(t)("Exemple de question")),1),e.exerciseKind==="tense-identification"&&e.conjugationInstruction&&e.conjugationQuestion?(x(),S(H,{key:0},[r("p",_u,f(e.conjugationInstruction),1),e.conjugationLiteraryCitation?(x(),S("blockquote",ku,[r("p",null,[r("span",null,f(e.conjugationLiteraryCitation.before),1),r("mark",null,f(e.conjugationLiteraryCitation.target),1),r("span",null,f(e.conjugationLiteraryCitation.after),1)]),r("footer",null,[ve(f(e.conjugationLiteraryCitation.author)+", ",1),r("cite",null,f(e.conjugationLiteraryCitation.work),1)])])):(x(),S("p",Su,[r("span",$u,f(s(C)),1)]))],64)):(x(),S(H,{key:1},[e.conjugationInstruction?(x(),S("p",Cu,f(e.conjugationInstruction),1)):M("",!0),e.conjugationQuestionContext?(x(),S("p",Pu,[r("span",Iu,f(e.conjugationQuestionContext),1)])):M("",!0)],64))])):M("",!0)]),_:1}),qe(yt,{name:"example-item"},{default:Qe(()=>[s(y)>=2?(x(),S("div",Au,[r("span",null,f(s(t)("Réponse attendue")),1),r("p",null,[e.conjugationExampleEmphasis?(x(),S(H,{key:0},[r("span",null,f(e.conjugationExamplePrefix),1),r("strong",null,f(e.conjugationExampleEmphasis),1),r("span",null,f(e.conjugationExampleSuffix),1)],64)):(x(),S("span",Tu,f(e.conjugationExample),1))])])):M("",!0)]),_:1})]))])],2)):M("",!0)],2)],10,Rc))}}),Em=Object.assign(Kt(zu,[["__scopeId","data-v-a4b4faf2"]]),{__name:"ChallengeOptions"}),ju=["aria-labelledby","aria-label"],Ou={key:0,class:"preset-browser"},Fu={class:"preset-browser__columns"},Eu={class:"preset-browser__column","data-browser-column":"1","aria-labelledby":"preset-browser-groups"},Lu={id:"preset-browser-groups"},Nu={class:"preset-browser__list"},Mu=["aria-pressed","onClick"],Du=["aria-label"],Ru={class:"preset-browser__list"},Bu={class:"preset-browser__info","data-preset-info":""},Wu=["aria-expanded","aria-controls","aria-label","onMouseenter","onClick"],Uu=["id"],Vu={class:"preset-browser__tooltip-section"},Ku={class:"preset-browser__verb-badges"},Gu={key:0,class:"preset-browser__other-verbs"},Hu={class:"preset-browser__tooltip-section"},Yu=["aria-pressed","onClick"],Xu=["aria-label"],qu={class:"preset-browser__list"},Qu={class:"preset-browser__count"},Ju={class:"preset-panel__intro"},Zu={class:"builder-card__eyebrow"},ef={id:"presets-title"},tf={class:"preset-mobile-select"},nf=["value"],af={value:""},rf=["label"],of=["value"],sf=["aria-label"],lf=["id","aria-selected","aria-controls","tabindex","onClick","onKeydown"],cf=["id","aria-labelledby"],uf=["onClick"],ff={key:0,class:"preset-card__random"},df=["onClick"],mf=["onClick"],pf=["onClick"],gf=Ve({__name:"PresetPicker",props:{presets:{},activePresetId:{},compact:{type:Boolean},verbs:{},modes:{},tenses:{}},emits:["select","stageChange"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=et(),{track:i}=Oa(),l=e,c=n,u=j(()=>{const g=new Map;return l.presets.forEach(o=>{const p=g.get(o.group)??[];p.push(o),g.set(o.group,p)}),[...g.entries()].map(([o,p])=>({id:o,label:p[0]?.groupLabel??za[o]??o,order:p[0]?.groupOrder??fr.indexOf(o),presets:p})).sort((o,p)=>o.order-p.order||o.label.localeCompare(p.label,"fr"))}),d=Y("school"),v=j(()=>u.value.find(g=>g.id===d.value)??u.value[0]),k=Y(""),_=j(()=>l.presets.find(g=>g.id===k.value)),A=Y(null),I=Y(null),$=j(()=>u.value.find(g=>g.id===A.value)),b=j(()=>l.presets.find(g=>g.id===I.value)),P=Y(null),h=Y(null),m=Y(null),C=new Set,y=j(()=>new Map((l.verbs??[]).map(g=>[g.id,g.infinitif]))),F=j(()=>new Map((l.tenses??[]).map(g=>[g.id,g]))),te=j(()=>new Map((l.modes??[]).map(g=>[g.id,g])));function Z(g){return h.value===g||m.value===g}function D(g){return g.verbIds.slice(0,12).map(o=>y.value.get(o)??`Verbe ${o}`)}function ne(g){const o=new Map;for(const p of g.tenseIds){const O=F.value.get(p);if(!O)continue;const R=te.value.get(O.modeId),se=o.get(O.modeId)??{mode:a(R?.name??O.mode?.name??t("Autres temps")),order:R?.order??O.mode?.order??Number.MAX_SAFE_INTEGER,tenses:[]};se.tenses.push(a(O.name)),o.set(O.modeId,se)}return[...o.values()].sort((p,O)=>p.order-O.order||p.mode.localeCompare(O.mode,"fr"))}function G(g){m.value=m.value===g?null:g}function q(g){g.target?.closest("[data-preset-info]")||(m.value=null)}kt(()=>document.addEventListener("pointerdown",q)),In(()=>document.removeEventListener("pointerdown",q));function _e(g){for(const o of g)C.has(o.id)||(C.add(o.id),i("feature_exposed",{feature:"preset",item:o.id}))}Le([()=>l.compact,v,$],([g,o,p])=>{if(g){p&&_e(p.presets);return}o&&_e(o.presets)},{immediate:!0});function Re(g){Mt(()=>{const o=P.value;if(!o||o.scrollWidth<=o.clientWidth+1)return;o.querySelector(`[data-browser-column="${g}"]`)?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"end"})})}function Fe(g){A.value=g,I.value=null,m.value=null,h.value=null,c("stageChange","presets"),Re(2)}function tt(g){I.value=g,Re(3)}function ye(g,o){I.value=null,c("select",g,o)}function Ke(g){k.value=g.target.value,_.value&&c("select",_.value)}function nt(g,o){let p;if((g.key==="ArrowRight"||g.key==="ArrowDown")&&(p=(o+1)%u.value.length),(g.key==="ArrowLeft"||g.key==="ArrowUp")&&(p=(o-1+u.value.length)%u.value.length),g.key==="Home"&&(p=0),g.key==="End"&&(p=u.value.length-1),p===void 0)return;g.preventDefault();const O=u.value[p];O&&(d.value=O.id,Mt(()=>document.getElementById(`preset-tab-${O.id}`)?.focus()))}function Ce(g,o){c("select",g,Math.min(o,g.verbIds.length))}return(g,o)=>(x(),S("section",{class:ke(["preset-panel",{"preset-panel--compact":e.compact}]),"aria-labelledby":e.compact?void 0:"presets-title","aria-label":e.compact?"Défis prêts à l’emploi":void 0},[e.compact?(x(),S("div",Ou,[r("div",{ref_key:"compactBrowser",ref:P,class:"preset-browser__scroll"},[r("div",Fu,[r("section",Eu,[r("h3",Lu,f(s(t)("Catégories")),1),r("div",Nu,[(x(!0),S(H,null,ge(s(u),p=>(x(),S("button",{key:p.id,type:"button",class:ke({"is-selected":s(A)===p.id}),"aria-pressed":s(A)===p.id,onClick:O=>Fe(p.id)},[r("span",null,f(p.label),1),o[7]||(o[7]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,Mu))),128))])]),qe(yt,{name:"browser-column"},{default:Qe(()=>[s($)?(x(),S("section",{key:s($).id,class:"preset-browser__column","data-browser-column":"2","aria-label":`Défis de ${s($).label}`},[r("div",Ru,[(x(!0),S(H,null,ge(s($).presets,p=>(x(),S("div",{key:p.id,class:"preset-browser__preset-row"},[r("div",Bu,[r("button",{class:"preset-browser__info-button",type:"button","aria-expanded":Z(p.id),"aria-controls":`preset-info-${p.id}`,"aria-label":`Informations sur ${p.label}`,onMouseenter:O=>h.value=p.id,onMouseleave:o[0]||(o[0]=O=>h.value=null),onClick:Dt(O=>G(p.id),["stop"])},"i",40,Wu),Z(p.id)?(x(),S("section",{key:0,id:`preset-info-${p.id}`,class:"preset-browser__tooltip","aria-live":"polite"},[r("header",null,[r("strong",null,f(p.label),1),r("span",null,f(p.questionCount)+" "+f(s(t)("questions")),1)]),r("div",Vu,[r("h4",null,f(s(t)("Verbes")),1),r("div",Ku,[(x(!0),S(H,null,ge(D(p),O=>(x(),S("span",{key:O},f(O),1))),128))]),p.verbIds.length>12?(x(),S("p",Gu,"+ "+f(p.verbIds.length-12)+" "+f(s(t)("autres verbes")),1)):M("",!0)]),r("div",Hu,[r("h4",null,f(s(t)("Temps")),1),r("dl",null,[(x(!0),S(H,null,ge(ne(p),O=>(x(),S("div",{key:O.mode},[r("dt",null,f(O.mode),1),r("dd",null,f(O.tenses.join(", ")),1)]))),128))])])],8,Uu)):M("",!0)]),r("button",{class:ke(["preset-browser__preset-button",{"is-selected":s(I)===p.id||e.activePresetId===p.id}]),type:"button","aria-pressed":s(I)===p.id,onClick:O=>tt(p.id)},[r("span",null,[r("strong",null,f(p.label),1)]),o[8]||(o[8]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,Yu)]))),128))])],8,Du)):M("",!0)]),_:1}),qe(yt,{name:"browser-column"},{default:Qe(()=>[s(b)?(x(),S("section",{key:s(b).id,class:"preset-browser__column preset-browser__column--quantity","data-browser-column":"3","aria-label":s(t)("Choisir le nombre de verbes")},[r("div",qu,[r("button",{type:"button",onClick:o[1]||(o[1]=p=>ye(s(b)))},[r("span",null,[r("strong",null,f(s(t)("Tous les verbes")),1)]),r("span",Qu,f(s(b).verbIds.length),1),o[9]||(o[9]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))]),o[20]||(o[20]=r("span",{class:"preset-browser__quantity-separator","aria-hidden":"true"},null,-1)),s(b).verbIds.length>=1&&s(b).verbIds.length<5?(x(),S("button",{key:0,type:"button",onClick:o[2]||(o[2]=p=>ye(s(b),1))},[r("span",null,[r("strong",null,f(s(t)("1 au hasard")),1)]),o[10]||(o[10]=r("span",{class:"preset-browser__count"},"1",-1)),o[11]||(o[11]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),s(b).verbIds.length>=2&&s(b).verbIds.length<5?(x(),S("button",{key:1,type:"button",onClick:o[3]||(o[3]=p=>ye(s(b),2))},[r("span",null,[r("strong",null,f(s(t)("2 au hasard")),1)]),o[12]||(o[12]=r("span",{class:"preset-browser__count"},"2",-1)),o[13]||(o[13]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),s(b).verbIds.length>=3?(x(),S("button",{key:2,type:"button",onClick:o[4]||(o[4]=p=>ye(s(b),3))},[r("span",null,[r("strong",null,f(s(t)("3 au hasard")),1)]),o[14]||(o[14]=r("span",{class:"preset-browser__count"},"3",-1)),o[15]||(o[15]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),s(b).verbIds.length>=5?(x(),S("button",{key:3,type:"button",onClick:o[5]||(o[5]=p=>ye(s(b),5))},[r("span",null,[r("strong",null,f(s(t)("5 au hasard")),1)]),o[16]||(o[16]=r("span",{class:"preset-browser__count"},"5",-1)),o[17]||(o[17]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0),s(b).verbIds.length>=10?(x(),S("button",{key:4,type:"button",onClick:o[6]||(o[6]=p=>ye(s(b),10))},[r("span",null,[r("strong",null,f(s(t)("10 au hasard")),1)]),o[18]||(o[18]=r("span",{class:"preset-browser__count"},"10",-1)),o[19]||(o[19]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):M("",!0)])],8,Xu)):M("",!0)]),_:1})])],512)])):(x(),S(H,{key:1},[r("div",Ju,[r("div",null,[r("p",Zu,f(s(t)("Pour démarrer rapidement")),1),r("h2",ef,f(s(t)("Défis prêts à l’emploi")),1)]),r("p",null,f(s(t)("Choisissez un niveau ou une famille de verbes, puis ajustez librement la sélection.")),1)]),r("label",tf,[r("span",null,f(s(t)("Choisir un défi prêt à l’emploi")),1),r("select",{value:e.activePresetId??s(k),onChange:Ke},[r("option",af,f(s(t)("Choisir un niveau ou un entraînement…")),1),(x(!0),S(H,null,ge(s(u),p=>(x(),S("optgroup",{key:p.id,label:p.label},[(x(!0),S(H,null,ge(p.presets,O=>(x(),S("option",{key:O.id,value:O.id},f(O.label)+" — "+f(O.verbIds.length)+" "+f(s(t)("verbes")),9,of))),128))],8,rf))),128))],40,nf)]),r("div",{class:"preset-groups",role:"tablist","aria-label":s(t)("Catégories de défis")},[(x(!0),S(H,null,ge(s(u),(p,O)=>(x(),S("button",{id:`preset-tab-${p.id}`,key:p.id,class:ke(["preset-group-button",{"preset-group-button--active":s(v)?.id===p.id}]),type:"button",role:"tab","aria-selected":s(v)?.id===p.id,"aria-controls":`preset-content-${p.id}`,tabindex:s(v)?.id===p.id?0:-1,onClick:R=>d.value=p.id,onKeydown:R=>nt(R,O)},f(p.label),43,lf))),128))],8,sf),s(v)?(x(),S("div",{key:0,id:`preset-content-${s(v).id}`,class:"preset-list",role:"tabpanel","aria-labelledby":`preset-tab-${s(v).id}`},[(x(!0),S(H,null,ge(s(v).presets,p=>(x(),S("article",{key:p.id,class:ke(["preset-card",{"preset-card--active":e.activePresetId===p.id}])},[r("button",{type:"button",onClick:O=>c("select",p)},[r("strong",null,f(p.label),1),r("span",null,f(p.description),1),r("small",null,f(p.verbIds.length)+" verbes · "+f(p.questionCount)+" "+f(s(t)("questions")),1)],8,uf),p.verbIds.length>5?(x(),S("div",ff,[ve(f(s(t)("Au hasard :"))+" ",1),r("button",{type:"button",onClick:O=>Ce(p,1)},"1",8,df),r("button",{type:"button",onClick:O=>Ce(p,5)},"5",8,mf),r("button",{type:"button",onClick:O=>Ce(p,10)},"10",8,pf)])):M("",!0)],2))),128))],8,cf)):M("",!0)],64))],10,ju))}}),Lm=Object.assign(Kt(gf,[["__scopeId","data-v-405192b2"]]),{__name:"ChallengePresetPicker"}),Pa="Quel est le mode et le temps de cette forme conjuguée ?";function Pn(e,n){const t=String(e||"").split(/\r?\n/u);return Math.max(1,t.reduce((a,i)=>{const l=i.replace(/\s+/g," ").trim();return a+Math.max(1,Math.ceil(l.length/n))},0))}function vf(e,n=8){return 5+n+(Pn(e,86)-1)*5}function Ia(e,n){return 8+(Math.max(Pn(e,54),Pn(n,38))-1)*5}function Aa(e,n,t,a){const i=[];let l=[],c=0,u=n;return e.forEach((d,v)=>{const k=Math.max(1,a(d));l.length>0&&c+k>u&&(i.push(l),l=[],c=0,u=t),l.push({item:d,index:v}),c+=k}),l.length>0&&i.push(l),i}const Hi=".................................",bf="......................................",hf=32;function yf(e,n){return n.mode?.trim().toLocaleLowerCase("fr-CH")!=="subjonctif"||n.complementPosition==="before"||/^(?:que|qu['’])\s*/iu.test(e)?e:`que ${e}`.replace(/^que (i(?:l|ls|el|els)|elle?s?|on)\b/iu,"qu'$1")}function xf(e,n){const t=yf(e.trim(),n),[a="",...i]=t.split("…"),l=i.join("…").trim(),u=n.mode?.trim().toLocaleLowerCase("fr-CH")==="impératif"&&!l.endsWith("!")?`${l}${l?" ":""}!`:l,d=n.complementPosition!=="before"&&n.saisiePrefixe!==void 0?n.saisiePrefixe.trim():a.trim(),v=Hi,k=u.length>hf,_=k?Math.max(32,Math.min(58,72-Math.round(u.length*.65))):100;return{completionPrefix:d,completionSuffix:u,fillBlank:t.includes("…")||i.length===0,suffixOnNextLine:k,blankWidthPercent:_,completion:[d,v,u].filter(Boolean).join(" ")}}function Ye(e,n){if(n==="tense-identification"){const u=e.literaryCitation?`${e.literaryCitation.before}【${e.literaryCitation.target}】${e.literaryCitation.after} — ${e.literaryCitation.author}, ${e.literaryCitation.work}`:e.consigne;return{label:"",completion:u,completionPrefix:u,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100}}if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="gérondif"){const u=e.infinitif||e.titre,d=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${u} | ${d} :`,completion:`en ${bf}`,completionPrefix:"en",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="participe"){const u=e.infinitif||e.titre,d=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${u} | ${d} :`,completion:Hi,completionPrefix:"",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}const t=e.consigne.split("|").map(u=>u.trim());if(t.length<3)return{label:"",completion:e.consigne,completionPrefix:e.consigne,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100};const a=t.slice(0,-2).join(" | "),i=t.at(-2)||e.infinitif||"",l=t.at(-1)||[e.temps,e.mode?`(${e.mode})`:""].filter(Boolean).join(" "),c=xf(a,e);return{label:`${i} | ${l} :`,...c}}function wf(e,n){const t=Ye(e,n);return[t.label,t.completion].filter(Boolean).join(" ")}function Nt(e){const n=[...new Set(e.reponsesPourCorrige.map(t=>t.trim()).filter(Boolean))];return e.isCompound&&n.length>1?n.slice(0,1):n}function on(e,n){if(["gérondif","participe"].includes(e.mode?.trim().toLocaleLowerCase("fr-CH")||""))return e.consigne;const t=Ye(e,n);return t.label||t.completion}function Ta(e){return Nt(e).join(`
`)}const _f={ref:"print-dialog",class:"print-overlay","data-tour":"print-preview",role:"dialog","aria-modal":"true","aria-labelledby":"print-preview-title",tabindex:"-1"},kf={class:"print-toolbar no-print"},Sf={id:"print-preview-title"},$f=["disabled"],Cf=["disabled"],Pf={class:"print-preview-layout"},If={class:"print-settings no-print","data-tour":"print-settings","aria-labelledby":"print-settings-title"},Af={class:"print-settings__heading"},Tf={id:"print-settings-title"},zf={class:"print-settings__field",for:"preview-print-title"},jf=["value"],Of={class:"print-settings__group"},Ff={class:"print-settings__number-field",for:"preview-title-spacing"},Ef=["value"],Lf={class:"print-settings__number-field",for:"preview-question-spacing"},Nf=["value"],Mf={class:"print-settings__group"},Df=["checked"],Rf=["checked"],Bf=["checked"],Wf=["checked"],Uf={class:"print-settings__group"},Vf=["checked"],Kf=["checked"],Gf=["checked"],Hf={class:"print-document print-document--pdf"},Yf=["src","title"],Xf={key:1,class:"pdf-preview-state",role:"status","aria-live":"polite"},qf={key:2,class:"pdf-preview-state pdf-preview-state--error",role:"alert"},Qf=Ve({__name:"PrintPreview",props:{questions:{},verbs:{},tenses:{},exerciseKind:{},options:{}},emits:["close","updateOptions"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=et(),i=e,l=n,{track:c}=Oa(),u=Math.floor(Math.random()*9e3)+1e3,d=Rt("print-dialog"),v=Y(!1),k=Y(!1),_=Y(!0),A=Y(!1),I=Y(""),$=Y("");let b=0,P;function h(g,o,p,O){const R=Number(g);return Number.isFinite(R)?Math.min(O,Math.max(p,R)):o}const m=j(()=>h(i.options.questionSpacingMm,8,2,15)),C=j(()=>h(i.options.titleSpacingMm,30,8,30)),y=j(()=>i.exerciseKind==="tense-identification"),F=j(()=>8+Math.max(0,5-m.value)),te=j(()=>{let g=226;return(i.options.showFirstName||i.options.showLastName||i.options.showDate)&&(g-=Math.max(0,C.value-1)),i.options.showVerbs&&(g-=8),i.options.showTenses&&(g-=8),y.value&&(g-=19),g}),Z=j(()=>Aa(i.questions,te.value,220,g=>{const o=Ye(g,i.exerciseKind);return vf(wf(g,i.exerciseKind),m.value)+(o.suffixOnNextLine?6:0)+(y.value?F.value:0)+(g.literaryCitation?4:0)})),D=j(()=>Aa(i.questions,205,220,g=>y.value?Ia("",Ta(g)):Ia(on(g,i.exerciseKind),Ta(g))));Fa(d,()=>l("close"));function ne(g,o){l("updateOptions",{...i.options,[g]:o})}function G(g){return String(g??"").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/…/g,"...").replace(/–|—/g,"-").replace(/【/g,"[").replace(/】/g,"]")}function q(g){return String(g??"").replace(new RegExp("^(\\s*)(\\p{L})","u"),(o,p,O)=>`${p}${O.toLocaleUpperCase("fr-CH")}`)}function _e(g){return String(g??"").split(`
`).map(q).join(`
`)}function Re(){return`${(i.options.title||t("Défi de conjugaison")).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"")||"defi-conjugaison"}.pdf`}async function Fe(){const{jsPDF:g}=await Un(async()=>{const{jsPDF:L}=await import("./BaH0Kb2C.js").then(W=>W.j);return{jsPDF:L}},__vite__mapDeps([0,1,2]),import.meta.url),o=new g({orientation:"portrait",unit:"mm",format:"a4",compress:!0}),p=210,O=297,R=17,se=193,xe=G(i.options.title||t("Défi de conjugaison")),at=i.options.showRandomNumber?` n° ${u}`:"";let me=0;function Pt(){me>0&&o.addPage("a4","portrait"),me+=1}function it(){o.setFont("helvetica","normal"),o.setFontSize(8),o.setTextColor(105,105,105),o.text("conjugaison.tatitotu.ch",p/2,O-8,{align:"center"}),o.setTextColor(20,20,20)}function ft(L){if(L)return o.setFont("helvetica","normal"),o.setFontSize(8.5),o.setTextColor(90,90,90),o.text(`${xe}${at}`,p/2,12,{align:"center"}),o.setTextColor(20,20,20),32;let W=18;const N=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean);N.length&&(o.setFont("helvetica","normal"),o.setFontSize(8.5),o.text(G(N.join("     ")),R,W),W+=C.value),i.options.showGrade&&(o.setDrawColor(40,40,40),o.rect(se-17,15,17,17)),o.setFont("helvetica","bold"),o.setFontSize(17);const le=`${xe}${at}`,ce=o.splitTextToSize(le.toUpperCase(),150);if(o.text(ce,R,W+8),W+=ce.length*7+10,o.setFontSize(9),i.options.showVerbs){const U=o.splitTextToSize(`Verbes : ${G(i.verbs.map(E=>E.infinitif).join(", "))}`,176);o.text(U,R,W),W+=U.length*4.5+2}if(i.options.showTenses){const U=o.splitTextToSize(`${t("Temps :")} ${G(i.tenses.map(E=>a(E.name)).join(", "))}`,176);o.text(U,R,W),W+=U.length*4.5+2}return y.value&&(o.setDrawColor(120,120,120),o.rect(R,W,176,10),o.text(Pa,R+3,W+6),W+=21),W+2}function dt(L){return L?(o.setFont("helvetica","normal"),o.setFontSize(8.5),o.setTextColor(90,90,90),o.text(`${xe} - corrigé${at}`,p/2,12,{align:"center"}),o.setTextColor(20,20,20),32):(o.setFont("helvetica","bold"),o.setFontSize(17),o.setTextColor(20,20,20),o.text(`${t("CORRIGÉ")}${at}`,R,26),38)}function mt(L,W){const N=L.literaryCitation;if(!N)return null;const le=G(N.before).replace(/\s+/gu," "),ce=G(N.target).replace(/\s+/gu," "),U=G(N.after).replace(/\s+/gu," "),E=q(`${le}${ce}${U}`),pe=G(`- ${N.author}, ${N.work}`),ae=le.length,ee=ae+ce.length;let be=0;const de=o.splitTextToSize(E,W).map(Ge=>{const ie=E.indexOf(Ge,be),we=ie>=0?ie:be;return be=we+Ge.length,{text:Ge,start:we}}),V=o.getFontSize(),ue=o.getFont().fontStyle;o.setFont("helvetica","italic"),o.setFontSize(8.3);const Pe=o.splitTextToSize(pe,W);return o.setFont("helvetica",ue),o.setFontSize(V),{lines:de,sourceLines:Pe,targetStart:ae,targetEnd:ee,height:de.length*5+Pe.length*4}}function Qt(L,W,N){L.lines.forEach((U,E)=>{const pe=N+E*5;o.text(U.text,W,pe);const ae=Math.max(U.start,L.targetStart),ee=Math.min(U.start+U.text.length,L.targetEnd);if(ee<=ae)return;const be=U.text.slice(0,ae-U.start),de=U.text.slice(ae-U.start,ee-U.start),V=W+o.getTextWidth(be);o.setDrawColor(25,25,25),o.setLineWidth(.25),o.line(V,pe+.8,V+o.getTextWidth(de),pe+.8)});const le=o.getFontSize(),ce=o.getFont().fontStyle;o.setFont("helvetica","italic"),o.setFontSize(8.3),o.setTextColor(90,90,90),L.sourceLines.forEach((U,E)=>{o.text(U,W,N+L.lines.length*5+E*4)}),o.setTextColor(20,20,20),o.setFont("helvetica",ce),o.setFontSize(le)}function pt(L,W){Pt();let N=ft(W);o.setFontSize(10.5),L.forEach(({item:le,index:ce})=>{const U=`${ce+1}. `,E=Ye(le,i.exerciseKind);o.setFont("helvetica","normal");const pe=o.splitTextToSize(G(q(E.label)),68),ae=E.label?96:169,ee=mt(le,ae),be=ee?[...ee.lines.map(Ae=>Ae.text),...ee.sourceLines]:E.fillBlank?[G(q(E.completion))]:o.splitTextToSize(G(q(E.completion)),ae),de=E.label?96:R+7,V=G(q(E.completionPrefix)),ue=G(E.completionSuffix),Pe=de+(V?o.getTextWidth(V)+2:0),Ge=se-(!E.suffixOnNextLine&&ue?o.getTextWidth(ue)+2:0),ie=E.suffixOnNextLine?de+ae*(E.blankWidthPercent/100):Ge;let we="",Ie=[];if(E.suffixOnNextLine&&ue){const Ae=ie+2,oe=Math.max(0,se-Ae),Te=ue.split(/\s+/u).filter(Boolean),ze=[];for(;Te.length;){const It=[...ze,Te[0]].join(" ");if(ze.length&&o.getTextWidth(It)>oe||!ze.length&&o.getTextWidth(It)>oe)break;ze.push(Te.shift())}we=ze.join(" "),Ie=Te.length?o.splitTextToSize(Te.join(" "),ae):[]}const rt=E.suffixOnNextLine?1+Ie.length:be.length,He=Math.max(pe.length,rt);if(o.text(U,R,N),E.label&&o.text(pe,R+7,N),E.fillBlank?(V&&o.text(V,de,N),ue&&!E.suffixOnNextLine&&o.text(ue,se,N,{align:"right"}),ie>Pe&&(o.setLineDashPattern([.7,.7],0),o.setDrawColor(55,55,55),o.line(Pe,N+.8,ie,N+.8),o.setLineDashPattern([],0)),E.suffixOnNextLine&&(we&&o.text(we,ie+2,N),Ie.forEach((Ae,oe)=>{o.text(Ae,de,N+5+oe*5)}))):ee?Qt(ee,de,N):o.text(be,de,N),y.value){const Ae=ee?ee.height:He*5,oe=N+Ae+2,Te=G(t("Mode :")),ze=G(t("Temps :"));o.setFont("helvetica","bold"),o.setFontSize(9.5),o.setTextColor(70,70,70),o.text(Te,R+7,oe),o.text(ze,108,oe),o.setLineDashPattern([.65,.65],0),o.setDrawColor(105,105,105),o.line(R+7+o.getTextWidth(Te)+2,oe+.7,101,oe+.7),o.line(108+o.getTextWidth(ze)+2,oe+.7,se,oe+.7),o.setLineDashPattern([],0),o.setTextColor(20,20,20),o.setFontSize(10.5),N+=Ae+8+Math.max(5,m.value)}else N+=Math.max(5+m.value,He*5+m.value)}),it()}function gt(L,W){Pt();let N=dt(W);o.setFontSize(9.5),L.forEach(({item:le,index:ce})=>{const U=Nt(le).flatMap(ue=>o.splitTextToSize(G(_e(ue)),y.value?169:82)),E=U.length*5;if(y.value){const ue=Math.max(9,E+4),Pe=N+Math.max(0,(ue-E)/2);o.setFont("helvetica","normal"),o.text(`${ce+1}.`,R,Pe,{baseline:"top"}),o.setFont("helvetica","bold"),o.text(U,R+10,Pe,{baseline:"top"}),o.setDrawColor(225,225,225),o.line(R,N+ue,se,N+ue),N+=ue;return}const pe=o.splitTextToSize(G(q(on(le,i.exerciseKind))),79),ae=pe.length*5,ee=Math.max(8,Math.max(ae,E)+3),be=N+Math.max(0,(ee-5)/2),de=N+Math.max(0,(ee-ae)/2),V=N+Math.max(0,(ee-E)/2);o.setFont("helvetica","normal"),o.text(`${ce+1}.`,R,be,{baseline:"top"}),o.text(pe,R+7,de,{baseline:"top"}),o.setFont("helvetica","bold"),o.text(U,106,V,{baseline:"top"}),o.setDrawColor(220,220,220),o.line(R,N+ee,se,N+ee),N+=ee}),it()}return Z.value.forEach((L,W)=>pt(L,W>0)),D.value.forEach((L,W)=>gt(L,W>0)),o}async function tt(){if(!v.value){c("feature_selected",{feature:"download.pdf"}),v.value=!0;try{(await Fe()).save(Re()),c("pdf_downloaded",{exerciseKind:i.exerciseKind})}catch{c("feature_failed",{feature:"download.pdf"})}finally{v.value=!1}}}function ye(){I.value&&(URL.revokeObjectURL(I.value),I.value="")}async function Ke(){const g=++b;_.value=!0,A.value=!1,$.value="";try{const p=(await Fe()).output("blob");if(g!==b)return;ye(),I.value=URL.createObjectURL(p)}catch(o){if(g!==b)return;console.error(t("Impossible de générer l’aperçu PDF."),o),$.value=t("L’aperçu PDF n’a pas pu être créé.")}finally{g===b&&(_.value=!1)}}function nt(){P&&clearTimeout(P),P=setTimeout(()=>{P=void 0,Ke()},250)}Le(()=>({questions:i.questions,verbs:i.verbs,tenses:i.tenses,exerciseKind:i.exerciseKind,options:i.options}),nt,{deep:!0}),kt(()=>{c("feature_exposed",{feature:"download.pdf"}),c("feature_exposed",{feature:"download.word"}),Ke()}),In(()=>{b+=1,P&&clearTimeout(P),ye()});async function Ce(){if(!k.value){c("feature_selected",{feature:"download.word"}),k.value=!0;try{const{AlignmentType:g,BorderStyle:o,Document:p,Footer:O,Header:R,HeightRule:se,LeaderType:xe,Packer:at,Paragraph:me,SectionType:Pt,Tab:it,TabStopType:ft,Table:dt,TableBorders:mt,TableCell:Qt,TableLayoutType:pt,TableRow:gt,TextRun:L,UnderlineType:W,VerticalAlign:N,WidthType:le}=await Un(async()=>{const{AlignmentType:B,BorderStyle:Q,Document:re,Footer:je,Header:Ee,HeightRule:Xi,LeaderType:qi,Packer:Qi,Paragraph:Ji,SectionType:Zi,Tab:er,TabStopType:tr,Table:nr,TableBorders:ar,TableCell:ir,TableLayoutType:rr,TableRow:or,TextRun:sr,UnderlineType:lr,VerticalAlign:cr,WidthType:ur}=await import("./BOF6v8rb.js");return{AlignmentType:B,BorderStyle:Q,Document:re,Footer:je,Header:Ee,HeightRule:Xi,LeaderType:qi,Packer:Qi,Paragraph:Ji,SectionType:Zi,Tab:er,TabStopType:tr,Table:nr,TableBorders:ar,TableCell:ir,TableLayoutType:rr,TableRow:or,TextRun:sr,UnderlineType:lr,VerticalAlign:cr,WidthType:ur}},[],import.meta.url),ce=i.options.title||t("Défi de conjugaison"),U=i.options.showRandomNumber?` n° ${u}`:"",E=9975,pe={top:1020,right:965,bottom:850,left:965,header:360,footer:360,gutter:0},ae={before:0,after:0,line:240},ee=new O({children:[new me({alignment:g.CENTER,spacing:ae,children:[new L({text:"conjugaison.tatitotu.ch",size:16,color:"666666"})]})]}),be=B=>new R({children:[new me({alignment:g.CENTER,spacing:ae,children:[new L({text:B,size:17,color:"666666"})]})]}),de=new R({children:[new me({spacing:ae})]}),V=(B,Q={})=>new me({alignment:Q.alignment,spacing:ae,children:[new L({text:B,bold:Q.bold,size:Q.size??21,font:"Arial"})]}),ue=(B,Q=21)=>{const re=B.literaryCitation;if(!re)return[V(q(Ye(B,i.exerciseKind).completion),{size:Q})];const je=q(re.before),Ee=re.before?re.target:q(re.target);return[new me({spacing:ae,children:[new L({text:je,size:Q,font:"Arial"}),new L({text:Ee,size:Q,font:"Arial",underline:{type:W.SINGLE}}),new L({text:re.after,size:Q,font:"Arial"})]}),new me({spacing:{before:50,after:0,line:220},children:[new L({text:`— ${re.author}, ${re.work}`,size:Math.max(15,Q-3),italics:!0,color:"666666",font:"Arial"})]})]},Pe=B=>{const Q=Ye(B,i.exerciseKind);if(!Q.fillBlank)return[V(q(Q.completion),{size:21})];const re=q(Q.completionPrefix),je=Q.completionSuffix;return[new me({spacing:ae,tabStops:[{type:ft.RIGHT,position:5300,leader:xe.DOT}],children:[new L({size:21,font:"Arial",children:[...re?[re," "]:[],new it,...je?[` ${je}`]:[]]})]})]},Ge=()=>new me({spacing:{before:150,after:40,line:240},tabStops:[{type:ft.RIGHT,position:4300,leader:xe.DOT},{type:ft.RIGHT,position:9250,leader:xe.DOT}],children:[new L({text:`${t("Mode :")} `,bold:!0,size:19,color:"555555",font:"Arial"}),new L({children:[new it],size:19,font:"Arial"}),new L({text:`   ${t("Temps :")} `,bold:!0,size:19,color:"555555",font:"Arial"}),new L({children:[new it],size:19,font:"Arial"})]}),ie=(B,Q,re={})=>new Qt({children:B,width:{size:Q,type:le.DXA},verticalAlign:N.CENTER,borders:re.borders,margins:re.margins??{top:70,bottom:70,left:70,right:70}}),we={bottom:{style:o.SINGLE,size:2,color:"D9D9D9"}},Ie=[],rt=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean),He=i.options.showGrade?965:0,Ae=rt.length>0?Math.floor((E-He)/rt.length):E-He;if(rt.forEach(B=>Ie.push(ie([V(B,{size:18})],Ae))),rt.length===0&&i.options.showGrade&&Ie.push(ie([V("")],E-He)),i.options.showGrade){const B={style:o.SINGLE,size:8,color:"333333"};Ie.push(ie([V("")],He,{borders:{top:B,bottom:B,left:B,right:B},margins:{top:0,bottom:0,left:0,right:0}}))}const oe=[];Ie.length>0&&oe.push(new dt({width:{size:E,type:le.DXA},columnWidths:Ie.map(B=>B.options.width?.size),layout:pt.FIXED,borders:mt.NONE,rows:[new gt({height:{value:700,rule:se.ATLEAST},cantSplit:!0,children:Ie})]})),oe.push(new me({spacing:{before:Math.round(C.value*56.7),after:260},children:[new L({text:ce.toUpperCase(),bold:!0,size:34,font:"Arial"}),new L({text:U,size:18,font:"Arial"})]})),i.options.showVerbs&&oe.push(V(`Verbes : ${i.verbs.map(B=>B.infinitif).join(", ")}`,{bold:!0,size:19})),i.options.showTenses&&oe.push(V(`${t("Temps :")} ${i.tenses.map(B=>a(B.name)).join(", ")}`,{bold:!0,size:19})),y.value&&oe.push(new me({spacing:{before:160,after:480},border:{top:{style:o.SINGLE,size:4,color:"777777"},bottom:{style:o.SINGLE,size:4,color:"777777"},left:{style:o.SINGLE,size:4,color:"777777"},right:{style:o.SINGLE,size:4,color:"777777"}},children:[new L({text:Pa,size:19,font:"Arial"})]})),oe.push(new dt({width:{size:E,type:le.DXA},columnWidths:y.value?[480,9495]:[480,3900,5595],layout:pt.FIXED,borders:mt.NONE,rows:i.questions.map((B,Q)=>{const re=Ye(B,i.exerciseKind),je=[ie([V(`${Q+1}.`,{size:21})],480,{margins:{top:90,bottom:90,left:0,right:40}}),ie([...ue(B),Ge()],9495,{margins:{top:90,bottom:100,left:70,right:70}})],Ee=[ie([V(`${Q+1}.`,{size:21})],480,{margins:{top:70,bottom:70,left:0,right:40}}),ie([V(q(re.label),{size:21})],3900),ie(Pe(B),5595)];return new gt({cantSplit:!0,height:{value:Math.round(((y.value?13:5)+Math.max(y.value?5:0,m.value))*56.7),rule:se.ATLEAST},children:y.value?je:Ee})})}));const Te=[new me({spacing:{before:0,after:260},children:[new L({text:t("CORRIGÉ"),bold:!0,size:34,font:"Arial"}),new L({text:U,size:18,font:"Arial"})]}),new dt({width:{size:E,type:le.DXA},columnWidths:y.value?[480,9495]:[480,5100,4395],layout:pt.FIXED,borders:mt.NONE,rows:i.questions.map((B,Q)=>{const re=[ie([V(`${Q+1}.`,{size:19})],480,{borders:we,margins:{top:70,bottom:70,left:0,right:40}}),ie(Nt(B).map(Ee=>V(_e(Ee),{bold:!0,size:19})),9495,{borders:we,margins:{top:70,bottom:70,left:70,right:70}})],je=[ie([V(`${Q+1}.`,{size:19})],480,{borders:we,margins:{top:55,bottom:55,left:0,right:40}}),ie([V(q(on(B,i.exerciseKind)),{size:19})],5100,{borders:we,margins:{top:55,bottom:55,left:70,right:70}}),ie(Nt(B).map(Ee=>V(_e(Ee),{bold:!0,size:19})),4395,{borders:we,margins:{top:55,bottom:55,left:70,right:70}})];return new gt({cantSplit:!0,height:{value:460,rule:se.ATLEAST},children:y.value?re:je})})})],ze=new p({styles:{default:{document:{run:{font:"Arial",size:21},paragraph:{spacing:ae}}}},sections:[{properties:{page:{margin:pe},titlePage:!0},headers:{first:de,default:be(`${ce}${U}`)},footers:{first:ee,default:ee},children:oe},{properties:{page:{margin:pe},type:Pt.NEXT_PAGE},headers:{default:be(`${ce} — corrigé${U}`)},footers:{default:ee},children:Te}]}),It=await at.toBlob(ze),Wn=URL.createObjectURL(It),vt=document.createElement("a"),Yi=ce.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"");vt.href=Wn,vt.download=`${Yi||"defi-conjugaison"}.docx`,document.body.appendChild(vt),vt.click(),c("word_downloaded",{exerciseKind:i.exerciseKind}),vt.remove(),URL.revokeObjectURL(Wn)}catch{c("feature_failed",{feature:"download.word"})}finally{k.value=!1}}}return(g,o)=>(x(),An(ja,{to:"body"},[r("div",_f,[r("div",kf,[r("div",null,[r("strong",Sf,f(s(t)("Aperçu avant impression")),1)]),r("div",null,[r("button",{class:"secondary-button",type:"button",onClick:o[0]||(o[0]=p=>l("close"))},f(s(t)("Fermer")),1),r("button",{class:"secondary-button",type:"button",disabled:s(k),onClick:Ce},f(s(k)?"Création du fichier Word…":"Télécharger au format Word"),9,$f),r("button",{class:"primary-button",type:"button",disabled:s(v),onClick:tt},f(s(v)?"Création du PDF…":"Télécharger le PDF"),9,Cf)])]),r("div",Pf,[r("aside",If,[r("div",Af,[r("p",null,f(s(t)("Personnalisation")),1),r("h2",Tf,f(s(t)("Options de la fiche")),1),r("span",null,f(s(t)("Les changements apparaissent immédiatement dans l’aperçu.")),1)]),r("label",zf,[r("span",null,f(s(t)("Titre de la fiche")),1),r("input",{id:"preview-print-title",type:"text",value:e.options.title,onInput:o[1]||(o[1]=p=>ne("title",p.target.value))},null,40,jf)]),r("fieldset",Of,[r("legend",null,f(s(t)("Mise en page")),1),r("label",Ff,[r("span",null,f(s(t)("Espace avant le titre")),1),r("span",null,[r("input",{id:"preview-title-spacing",type:"number",min:"8",max:"30",step:"1",value:s(C),onInput:o[2]||(o[2]=p=>ne("titleSpacingMm",Number(p.target.value)))},null,40,Ef),o[12]||(o[12]=ve(" mm ",-1))])]),r("label",Lf,[r("span",null,f(s(t)("Espacement entre les questions")),1),r("span",null,[r("input",{id:"preview-question-spacing",type:"number",min:"2",max:"15",step:"0.5",value:s(m),onInput:o[3]||(o[3]=p=>ne("questionSpacingMm",Number(p.target.value)))},null,40,Nf),o[13]||(o[13]=ve(" mm ",-1))])])]),r("fieldset",Mf,[r("legend",null,f(s(t)("Informations de l’élève")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showFirstName,onChange:o[4]||(o[4]=p=>ne("showFirstName",p.target.checked))},null,40,Df),r("span",null,f(s(t)("Prénom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showLastName,onChange:o[5]||(o[5]=p=>ne("showLastName",p.target.checked))},null,40,Rf),r("span",null,f(s(t)("Nom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showDate,onChange:o[6]||(o[6]=p=>ne("showDate",p.target.checked))},null,40,Bf),r("span",null,f(s(t)("Date")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showGrade,onChange:o[7]||(o[7]=p=>ne("showGrade",p.target.checked))},null,40,Wf),r("span",null,f(s(t)("Espace pour la note")),1)])]),r("fieldset",Uf,[r("legend",null,f(s(t)("Contenu affiché")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showVerbs,onChange:o[8]||(o[8]=p=>ne("showVerbs",p.target.checked))},null,40,Vf),r("span",null,f(s(t)("Liste des verbes")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showTenses,onChange:o[9]||(o[9]=p=>ne("showTenses",p.target.checked))},null,40,Kf),r("span",null,f(s(t)("Liste des temps")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showRandomNumber,onChange:o[10]||(o[10]=p=>ne("showRandomNumber",p.target.checked))},null,40,Gf),r("span",null,f(s(t)("Numéro questionnaire/corrigé")),1)])])]),r("main",Hf,[s(I)?(x(),S("iframe",{key:0,class:"pdf-preview-frame",src:`${s(I)}#view=FitH&toolbar=1&navpanes=0`,title:s(t)("Aperçu exact de la fiche PDF et de son corrigé"),onLoad:o[11]||(o[11]=p=>A.value=!0)},null,40,Yf)):M("",!0),!s($)&&(s(_)||!s(A))?(x(),S("div",Xf,[o[14]||(o[14]=r("span",{class:"pdf-preview-spinner","aria-hidden":"true"},null,-1)),r("strong",null,f(s(t)("Création de l’aperçu PDF…")),1),r("span",null,f(s(t)("La fiche et le corrigé sont mis en page.")),1)])):M("",!0),s($)?(x(),S("div",qf,[r("strong",null,f(s($)),1),r("button",{class:"secondary-button",type:"button",onClick:Ke},f(s(t)("Réessayer")),1)])):M("",!0)])])],512)]))}}),Nm=Object.assign(Qf,{__name:"ChallengePrintPreview"}),Jf=mr("/images/recharger-defi.svg?v=dynamic-code"),Zf={ref:"share-dialog",class:"app-dialog share-dialog","data-tour":"share-dialog",role:"dialog","aria-modal":"true","aria-labelledby":"share-title",tabindex:"-1"},ed=["aria-label"],td={class:"dialog-kicker"},nd={id:"share-title"},ad={for:"share-challenge-title"},id=["readonly","aria-invalid","aria-describedby"],rd=["disabled"],od={for:"share-challenge-description"},sd=["readonly","aria-describedby"],ld={id:"share-description-help",class:"share-title-form__description-help"},cd={key:0,id:"share-title-error",class:"form-error",role:"alert"},ud={key:0},fd={key:1,class:"share-methods"},dd={class:"share-method","aria-labelledby":"share-code-title"},md={id:"share-code-title"},pd={class:"share-method__tip"},gd={class:"share-value"},vd={for:"share-code"},bd=["value"],hd={class:"share-help"},yd={type:"button",class:"share-help__trigger","aria-describedby":"reload-help-tooltip"},xd={id:"reload-help-tooltip",class:"share-help__tooltip",role:"tooltip"},wd={class:"share-help__preview"},_d=["alt"],kd={"aria-hidden":"true"},Sd={class:"share-method","aria-labelledby":"share-link-title"},$d={id:"share-link-title"},Cd={class:"share-method__tip"},Pd={class:"share-value"},Id={for:"share-url"},Ad=["value"],Td={class:"copy-status","aria-live":"polite"},zd=Ve({__name:"ShareChallengeDialog",props:{code:{},url:{},busy:{type:Boolean},error:{},initialTitle:{},initialDescription:{}},emits:["close","save"],setup(e,{emit:n}){const{ui:t,localePath:a}=et(),i=e,l=n,c=Y(""),u=Y(i.initialTitle?.trim()||t("Défi de conjugaison")),d=Y(i.initialDescription?.trim()||""),v=Rt("close-button"),k=Rt("share-dialog"),_=j(()=>u.value.trim()),A=j(()=>d.value.trim()),I=j(()=>_.value.length>=1&&_.value.length<=80);Fa(k,()=>l("close"),v);async function $(h,m){try{await navigator.clipboard.writeText(h),c.value=`${m} copié.`}catch{c.value=`Sélectionnez puis copiez le ${m.toLocaleLowerCase("fr")}.`}}function b(){try{sessionStorage.setItem("highlight-home-challenge-loader","1")}catch{}}function P(){i.code||i.busy||!I.value||l("save",_.value,A.value)}return(h,m)=>{const C=br;return x(),An(ja,{to:"body"},[r("div",{class:"dialog-backdrop",onClick:m[8]||(m[8]=Dt(y=>l("close"),["self"]))},[r("section",Zf,[r("button",{ref:"close-button",class:"dialog-close",type:"button","aria-label":s(t)("Fermer"),onClick:m[0]||(m[0]=y=>l("close"))}," × ",8,ed),r("p",td,f(e.code?s(t)("Défi sauvegardé"):s(t)("Défi prêt à être partagé")),1),r("h2",nd,f(s(t)("Votre défi est prêt à être partagé")),1),r("form",{class:"share-title-form",onSubmit:Dt(P,["prevent"])},[r("label",ad,f(s(t)("Titre du défi")),1),r("div",null,[sn(r("input",{id:"share-challenge-title","onUpdate:modelValue":m[1]||(m[1]=y=>cn(u)?u.value=y:null),type:"text",maxlength:"80",readonly:!!e.code,"aria-invalid":!s(I),"aria-describedby":e.error?"share-title-error":void 0,required:"",autofocus:""},null,8,id),[[ln,s(u)]]),e.code?M("",!0):(x(),S("button",{key:0,class:"primary-button",type:"submit",disabled:e.busy||!s(I)},f(e.busy?s(t)("Création…"):s(t)("Créer le code")),9,rd))]),r("small",null,f(s(_).length)+"/80",1),r("label",od,f(s(t)("Description du défi")),1),sn(r("textarea",{id:"share-challenge-description","onUpdate:modelValue":m[2]||(m[2]=y=>cn(d)?d.value=y:null),rows:"4",maxlength:"1000",readonly:!!e.code,"aria-describedby":e.error?"share-title-error share-description-help":"share-description-help"},null,8,sd),[[ln,s(d)]]),r("small",ld,f(s(t)("Facultatif : une description à l’attention des personnes qui découvriront ce défi"))+" · "+f(s(A).length)+"/1000 ",1),e.error?(x(),S("p",cd,f(e.error),1)):M("",!0)],32),e.code?(x(),S("p",ud,f(s(t)("Deux possibilités permettent à vos élèves de retrouver ce défi.")),1)):M("",!0),e.code?(x(),S("div",fd,[r("section",dd,[r("header",null,[m[9]||(m[9]=r("span",{class:"share-method__number","aria-hidden":"true"},"1",-1)),r("div",null,[r("h3",md,f(s(t)("Sauvegarder le code")),1),r("p",null,f(s(t)("L’élève conserve ce code. Plus tard, il le copie sur la page d’accueil pour retrouver ce défi.")),1),r("p",pd,f(s(t)("Idéal pour transmettre le défi par écrit")),1)])]),r("div",gd,[r("label",vd,f(s(t)("Code à conserver")),1),r("div",null,[r("input",{id:"share-code",value:e.code,readonly:"",onFocus:m[3]||(m[3]=y=>y.target.select())},null,40,bd),r("button",{type:"button",onClick:m[4]||(m[4]=y=>$(e.code,"Code"))},f(s(t)("Copier")),1)]),r("div",hd,[r("button",yd,f(s(t)("Comment le recharger plus tard ?")),1),r("div",xd,[r("div",wd,[r("img",{src:Jf,alt:s(t)("Emplacement du code reçu sur la page d’accueil")},null,8,_d),r("span",kd,f(e.code),1)]),r("p",null,[m[10]||(m[10]=ve("Tes élèves colleront le code à cet endroit dans la ",-1)),qe(C,{to:s(a)("/"),onClick:b},{default:Qe(()=>[ve(f(s(t)("page d’accueil")),1)]),_:1},8,["to"])])])])])]),r("section",Sd,[r("header",null,[m[11]||(m[11]=r("span",{class:"share-method__number","aria-hidden":"true"},"2",-1)),r("div",null,[r("h3",$d,f(s(t)("Envoyer le lien direct")),1),r("p",null,f(s(t)("L’élève clique simplement sur ce lien : il arrive directement sur le défi, sans saisir le code.")),1),r("p",Cd,f(s(t)("Idéal pour transmettre le défi par email")),1)])]),r("div",Pd,[r("label",Id,f(s(t)("Lien à envoyer")),1),r("div",null,[r("input",{id:"share-url",value:e.url,readonly:"",onFocus:m[5]||(m[5]=y=>y.target.select())},null,40,Ad),r("button",{type:"button",onClick:m[6]||(m[6]=y=>$(e.url,"Lien"))},f(s(t)("Copier")),1)])])])])):M("",!0),e.code?(x(),S(H,{key:2},[r("p",Td,f(s(c)),1),r("button",{class:"primary-button",type:"button",onClick:m[7]||(m[7]=y=>l("close"))},f(s(t)("Terminé")),1)],64)):M("",!0)],512)])])}}}),Mm=Object.assign(zd,{__name:"ChallengeShareChallengeDialog"}),jd={class:"builder-card tense-picker","aria-labelledby":"tenses-title"},Od={class:"builder-card__header"},Fd={class:"builder-card__eyebrow"},Ed={id:"tenses-title"},Ld=["aria-label"],Nd={class:"selection-toolbar"},Md={class:"tense-groups"},Dd=["aria-labelledby"],Rd=["id"],Bd={class:"tense-group__items"},Wd={class:"tense-row"},Ud={class:"tense-info"},Vd=["aria-label","aria-describedby"],Kd=["id"],Gd={class:"switch-row"},Hd=["checked","onChange"],Yd={key:0,class:"tense-group__trailing"},Xd={class:"tense-row"},qd={class:"tense-info"},Qd=["aria-label","aria-describedby"],Jd=["id"],Zd={class:"switch-row"},em=["checked","onChange"],tm=Ve({__name:"TensePicker",props:{modes:{},tenses:{},verbs:{},selectedIds:{}},emits:["toggle","selectAll","clear"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=et(),i=e,l=n,c=j(()=>new Set(i.selectedIds)),u=Y({}),d=Y(!1),v=j(()=>{const $=i.verbs.filter(b=>b.complementExample?.functionObject==="cod");return $.length?$:i.verbs}),k=j(()=>`${v.value.map($=>$.id).join(",")}|${i.tenses.map($=>$.id).join(",")}`),_=j(()=>i.modes.map($=>{const b=i.tenses.filter(m=>m.modeId===$.id).sort((m,C)=>Vn($.name,m.name)-Vn($.name,C.name)||m.id-C.id),P=b.filter(m=>Kn(m)),h=b.filter(m=>!Kn(m));return{mode:$,tenses:b,columns:[h.filter(m=>!m.isCompound),h.filter(m=>m.isCompound)].filter(m=>m.length>0),trailingTenses:P}}).filter($=>$.tenses.length>0));let A=0;async function I(){const $=++A;if(u.value={},!(!v.value.length||!i.tenses.length)){d.value=!0;try{const b=await $fetch("/api/tense-examples",{method:"POST",body:{verbIds:v.value.map(P=>P.id),tenseIds:i.tenses.map(P=>P.id)}});$===A&&(u.value=b.examples)}catch{$===A&&(u.value={})}finally{$===A&&(d.value=!1)}}}return kt(I),Le(k,()=>{I()}),($,b)=>(x(),S("section",jd,[r("div",Od,[r("div",null,[r("p",Fd,f(s(t)("Étape 2")),1),r("h2",Ed,f(s(t)("Mes temps")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} temps sélectionnés`},f(e.selectedIds.length),9,Ld)]),r("div",Nd,[r("button",{class:"text-button",type:"button",onClick:b[0]||(b[0]=P=>l("selectAll"))},f(s(t)("Tout cocher")),1),r("button",{class:"text-button text-button--danger",type:"button",onClick:b[1]||(b[1]=P=>l("clear"))},f(s(t)("Tout décocher")),1)]),r("div",Md,[(x(!0),S(H,null,ge(s(_),P=>(x(),S("section",{key:P.mode.id,class:"tense-group",role:"group","aria-labelledby":`tense-mode-${P.mode.id}`},[r("h3",{id:`tense-mode-${P.mode.id}`,class:"tense-group__title"},f(s(a)(P.mode.name)),9,Rd),r("div",{class:ke(["tense-group__columns",{"tense-group__columns--single":P.columns.length===1}])},[(x(!0),S(H,null,ge(P.columns,(h,m)=>(x(),S("div",{key:m,class:"tense-group__column"},[r("div",Bd,[(x(!0),S(H,null,ge(h,C=>(x(),S("div",{key:C.id,class:"tense-entry"},[r("div",Wd,[r("span",Ud,[r("button",{type:"button","aria-label":`${s(t)("Voir un exemple :")} ${s(a)(C.name)}`,"aria-describedby":`tense-example-${C.id}`},"i",8,Vd),r("span",{id:`tense-example-${C.id}`,class:"tense-tooltip",role:"tooltip"},[s(u)[C.id]?(x(),S(H,{key:0},[ve(f(s(t)("Exemple:"))+" ",1),r("strong",null,f(s(u)[C.id].emphasis),1),s(u)[C.id].rest?(x(),S(H,{key:0},[ve(f(s(u)[C.id].rest),1)],64)):M("",!0)],64)):(x(),S(H,{key:1},[ve(f(s(d)?s(t)("Chargement…"):s(t)("Exemple momentanément indisponible.")),1)],64))],8,Kd)]),r("label",Gd,[r("input",{type:"checkbox",checked:s(c).has(C.id),onChange:y=>l("toggle",C.id)},null,40,Hd),b[2]||(b[2]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,f(s(a)(C.name)),1)])])]))),128))])]))),128))],2),P.trailingTenses.length?(x(),S("div",Yd,[(x(!0),S(H,null,ge(P.trailingTenses,h=>(x(),S("div",{key:h.id,class:"tense-entry"},[r("div",Xd,[r("span",qd,[r("button",{type:"button","aria-label":`${s(t)("Voir un exemple :")} ${s(a)(h.name)}`,"aria-describedby":`tense-example-${h.id}`},"i",8,Qd),r("span",{id:`tense-example-${h.id}`,class:"tense-tooltip",role:"tooltip"},[s(u)[h.id]?(x(),S(H,{key:0},[ve(f(s(t)("Exemple:"))+" ",1),r("strong",null,f(s(u)[h.id].emphasis),1),s(u)[h.id].rest?(x(),S(H,{key:0},[ve(f(s(u)[h.id].rest),1)],64)):M("",!0)],64)):(x(),S(H,{key:1},[ve(f(s(d)?s(t)("Chargement…"):s(t)("Exemple momentanément indisponible.")),1)],64))],8,Jd)]),r("label",Zd,[r("input",{type:"checkbox",checked:s(c).has(h.id),onChange:m=>l("toggle",h.id)},null,40,em),b[3]||(b[3]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,f(s(a)(h.name)),1)])])]))),128))])):M("",!0)],8,Dd))),128))])]))}}),Dm=Object.assign(Kt(tm,[["__scopeId","data-v-ee3658cb"]]),{__name:"ChallengeTensePicker"}),nm={class:"builder-card verb-picker","aria-labelledby":"verbs-title"},am={class:"builder-card__header"},im={class:"builder-card__eyebrow"},rm={id:"verbs-title"},om=["aria-label"],sm={class:"verb-search"},lm={for:"verb-search-input"},cm={class:"verb-search__control"},um=["placeholder","aria-expanded","onKeydown"],fm=["disabled","aria-label"],dm=["aria-label"],mm=["onClick"],pm={key:0},gm={key:1},vm={key:1,class:"field-hint","aria-live":"polite"},bm={class:"selection-toolbar"},hm=["aria-label","onClick"],ym=Ve({__name:"VerbPicker",props:{verbs:{},selectedIds:{}},emits:["add","remove","clear"],setup(e,{emit:n}){const{ui:t}=et(),a=e,i=n,l=Y(""),c=Rt("verb-input"),u=j(()=>new Set(a.selectedIds)),d=j(()=>{const $=new Map(a.verbs.map(b=>[b.id,b]));return a.selectedIds.map(b=>$.get(b)).filter(b=>!!b)}),v=j(()=>{const $=d.value.length;return $<=3?1.35:Math.max(1,1.35-($-3)/20)}),k=j(()=>{const $=v.value,b=1+($-1)*.55;return{"--selected-chip-gap":`${7*$}px`,"--selected-chip-inner-gap":`${6*$}px`,"--selected-chip-padding-block":`${7*$}px`,"--selected-chip-padding-end":`${8*$}px`,"--selected-chip-padding-start":`${11*$}px`,"--selected-chip-font-size":`${.87*$}rem`,"--selected-chip-button-size":`${21*$}px`,"--selected-chip-button-font-size":`${$}rem`,"--selected-chip-mobile-gap":`${7*b}px`,"--selected-chip-mobile-inner-gap":`${6*b}px`,"--selected-chip-mobile-padding-block":`${7*b}px`,"--selected-chip-mobile-padding-end":`${8*b}px`,"--selected-chip-mobile-padding-start":`${11*b}px`,"--selected-chip-mobile-font-size":`${.87*b}rem`,"--selected-chip-mobile-button-size":`${21*b}px`,"--selected-chip-mobile-button-font-size":`${b}rem`}}),_=j(()=>hr(l.value)?yr(a.verbs.filter(b=>!u.value.has(b.id)),l.value).slice(0,8):[]);function A($){i("add",$.id),l.value="",Mt(()=>c.value?.focus())}function I(){const $=_.value[0];$&&A($)}return($,b)=>(x(),S("section",nm,[r("div",am,[r("div",null,[r("p",im,f(s(t)("Étape 1")),1),r("h2",rm,f(s(t)("Mes verbes")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} verbes sélectionnés`},f(e.selectedIds.length),9,om)]),r("div",sm,[r("label",lm,f(s(t)("Ajouter un verbe")),1),r("div",cm,[sn(r("input",{id:"verb-search-input",ref:"verb-input","onUpdate:modelValue":b[0]||(b[0]=P=>cn(l)?l.value=P:null),type:"search",autocomplete:"off",placeholder:s(t)("Ex. aller, être, finir…"),"aria-expanded":s(_).length>0,"aria-controls":"verb-suggestions",onKeydown:pr(Dt(I,["prevent"]),["enter"])},null,40,um),[[ln,s(l)]]),r("button",{class:"icon-button icon-button--add",type:"button",disabled:s(_).length===0,"aria-label":s(t)("Ajouter le premier verbe proposé"),onClick:I}," + ",8,fm)]),s(_).length>0?(x(),S("ul",{key:0,id:"verb-suggestions",class:"verb-suggestions",role:"listbox","aria-label":s(t)("Verbes proposés")},[(x(!0),S(H,null,ge(s(_),P=>(x(),S("li",{key:P.id,role:"option"},[r("button",{type:"button",onClick:h=>A(P)},[r("strong",null,f(P.infinitif),1),P.isPronominalForm&&P.baseVerbId?(x(),S("span",pm,f(s(t)("forme pronominale générée")),1)):P.auxiliaire?(x(),S("span",gm,f(s(t)("auxiliaire"))+" "+f(P.auxiliaire),1)):M("",!0)],8,mm)]))),128))],8,dm)):s(l)?(x(),S("p",vm," Aucun nouveau verbe ne commence par « "+f(s(l))+" ». ",1)):M("",!0)]),r("div",bm,[r("p",null,f(s(d).length?s(t)("Verbes retenus"):s(t)("Aucun verbe sélectionné")),1),s(d).length?(x(),S("button",{key:0,class:"text-button text-button--danger",type:"button",onClick:b[1]||(b[1]=P=>i("clear"))},f(s(t)("Tout supprimer")),1)):M("",!0)]),s(d).length?(x(),An(gr,{key:0,tag:"ul",name:"verb-chip",class:"selected-chips selected-chips--adaptive",style:vr(s(k)),"aria-label":s(t)("Verbes sélectionnés")},{default:Qe(()=>[(x(!0),S(H,null,ge(s(d),P=>(x(),S("li",{key:P.id},[r("span",null,f(P.infinitif),1),r("button",{type:"button","aria-label":s(t)("Retirer le verbe {verb}",{verb:P.infinitif}),onClick:h=>i("remove",P.id)},"×",8,hm)]))),128))]),_:1},8,["style","aria-label"])):M("",!0)]))}}),Rm=Object.assign(Kt(ym,[["__scopeId","data-v-f03191bf"]]),{__name:"ChallengeVerbPicker"});function Bm(e){return new URL(globalThis.location.href)}export{Em as C,Lm as P,Mm as S,Dm as T,Rm as V,Bm as a,Fm as b,Nm as c,Om as d,xr as e,zm as f,kr as g,Tm as h,wr as l,$r as n,jm as u};
