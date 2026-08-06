const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./wP1oTXDV.js","./5AouIC9m.js","./entry.CV6J0Yfi.css"])))=>i.map(i=>d[i]);
import{a as Oa,c as fr}from"./BAJwE-Zc.js";import{u as yt}from"./DsA0u9vQ.js";import{p as z,e as Je,f as Le,ab as zt,q as lt,M as St,c as _,a as r,t as f,h as o,N as dr,b as Ge,o as x,l as te,y as In,n as $e,d as ge,R as ft,w as qe,i as R,F as ee,r as ye,j as Mt,E as on,g as An,T as ja,ao as Un,z as Dt,ar as mr,k as sn,v as ln,D as cn,m as pr,C as vr,aq as gr,J as br}from"./5AouIC9m.js";import{_ as Vt}from"./DlAUqK2U.js";import{u as za}from"./C2zIrYKI.js";import{h as hr,u as Fa}from"./DSP5YhCQ.js";import{_ as yr}from"./DomEJW2o.js";import{b as Vn}from"./CgdsjPvq.js";import{k as Hn}from"./p3310cOo.js";import{n as xr,m as wr}from"./g6ucs01C.js";const Ea=["cod-after","coi-after"];function _r(e,n){return e?n==="before"?["cod-before"]:n==="mixed"?["cod-after","cod-before","coi-after"]:[...Ea]:[]}function kr(e){const n=e.some(a=>a.endsWith("-before")),t=e.some(a=>a.endsWith("-after"));return{includeComplements:e.length>0,complementPlacement:n&&t?"mixed":n?"before":"after"}}function qm(e){return[e.groupLabel||Oa[e.group]||e.group,e.label].filter(Boolean).join(" | ")}function Ym(e){return Number.isInteger(e)&&Number(e)>0?`${Number(e)} au hasard`:"Tous les verbes"}const Kn={exerciseKind:"conjugation",identificationSource:"selected-verbs",literaryRegister:"all",pastSimplePronouns:"all",inclusivePronouns:!1,includeOnPronoun:!1,voiceMode:"active",includeComplements:!0,complementPlacement:"after",complementOptions:[...Ea]},Sr=()=>({title:"Défi de conjugaison",questionSpacingMm:8,titleSpacingMm:30,showGrade:!0,showVerbs:!1,showTenses:!1,showFirstName:!0,showLastName:!0,showDate:!0,showRandomNumber:!0}),Gn=()=>({verbIds:[1,2,3,4],tenseIds:[1,3,4,5],questionCount:10,...Kn,complementOptions:[...Kn.complementOptions],printOptions:Sr()});function Xm(){const e=yt("challenge-catalogue",()=>({verbes:[],modes:[],temps:[],presets:[]})),n=yt("challenge-config",Gn),t=yt("challenge-catalogue-status",()=>"idle"),a=yt("challenge-catalogue-error",()=>""),i=z(()=>{const m=new Map(e.value.verbes.map(p=>[p.id,p]));return n.value.verbIds.map(p=>m.get(p)).filter(p=>!!p)}),l=z(()=>{const m=new Map(e.value.temps.map($=>[$.id,$])),p=new Map(e.value.modes.map($=>[$.id,$]));return n.value.tenseIds.map($=>m.get($)).filter($=>!!$).map($=>({...$,mode:$.mode||p.get($.modeId)}))}),c=z(()=>n.value.verbIds.length>0&&n.value.tenseIds.length>0&&n.value.questionCount>0);function u(){const m=e.value.modes.find($=>$.name.toLocaleLowerCase("fr")==="indicatif");if(!m)return[1,3,4,5];const p=new Set(["présent","futur proche","imparfait","passé composé","futur","futur simple"]);return e.value.temps.filter($=>$.modeId===m.id&&p.has($.name.toLocaleLowerCase("fr"))).map($=>$.id)}async function d(m=!1){const p=e.value.temps.length>0&&e.value.temps.every($=>!!$.example?.trim());if(!m&&t.value==="success"&&p)return e.value;t.value="loading",a.value="";try{const $=await $fetch("/api/catalogue");e.value={verbes:[...$.verbes].sort((H,G)=>H.infinitif.localeCompare(G.infinitif,"fr")),modes:[...$.modes].sort((H,G)=>H.order-G.order||H.id-G.id),temps:[...$.temps],presets:[...$.presets]};const F=new Set(e.value.verbes.map(H=>H.id)),ie=new Set(e.value.temps.map(H=>H.id)),ce=u();return n.value.verbIds=n.value.verbIds.filter(H=>F.has(H)),n.value.tenseIds=n.value.tenseIds.filter(H=>ie.has(H)),n.value.verbIds.length===0&&(n.value.verbIds=e.value.verbes.slice(0,4).map(H=>H.id)),n.value.tenseIds.length===0&&(n.value.tenseIds=ce.length>0?ce:e.value.temps.slice(0,1).map(H=>H.id)),t.value="success",e.value}catch($){throw t.value="error",a.value=$r($,"Impossible de charger le catalogue."),$}}function g(m){n.value.verbIds.includes(m)||(n.value.verbIds=[...n.value.verbIds,m])}function S(m){n.value.verbIds=n.value.verbIds.filter(p=>p!==m)}function w(){n.value.verbIds=[]}function T(m){n.value.tenseIds=n.value.tenseIds.includes(m)?n.value.tenseIds.filter(p=>p!==m):[...n.value.tenseIds,m]}function P(){n.value.tenseIds=e.value.temps.map(m=>m.id)}function C(){n.value.tenseIds=[]}function b(){n.value.tenseIds=u()}function I(m){const p=new Set(e.value.verbes.map(F=>F.id)),$=new Set(e.value.temps.map(F=>F.id));n.value={...n.value,verbIds:m.verbIds.filter(F=>p.has(F)),tenseIds:m.tenseIds.filter(F=>$.has(F)),questionCount:m.questionCount}}function y(m){const p=Gn();I(m);const $=m.complementOptions??(m.includeComplements===void 0?[...p.complementOptions]:_r(m.includeComplements,m.complementPlacement??"after")),F=kr($);n.value={...n.value,exerciseKind:m.exerciseKind??p.exerciseKind,identificationSource:m.identificationSource??p.identificationSource,literaryRegister:m.literaryRegister??p.literaryRegister,pastSimplePronouns:m.pastSimplePronouns??p.pastSimplePronouns,inclusivePronouns:m.inclusivePronouns??p.inclusivePronouns,includeOnPronoun:m.includeOnPronoun??p.includeOnPronoun,voiceMode:m.voiceMode??p.voiceMode,includeComplements:F.includeComplements,complementPlacement:F.complementPlacement,complementOptions:$,printOptions:{...p.printOptions,...m.printOptions??{}}}}return{catalogue:e,challenge:n,catalogueStatus:t,catalogueError:a,selectedVerbs:i,selectedTenses:l,isReady:c,loadCatalogue:d,addVerb:g,removeVerb:S,clearVerbs:w,toggleTense:T,selectAllTenses:P,clearTenses:C,selectDefaultTenses:b,applySelection:I,applySharedChallenge:y}}function $r(e,n="Une erreur est survenue."){if(e&&typeof e=="object"){const t=e;return t.data?.statusMessage||t.data?.message||t.statusMessage||t.message||n}return n}function Cr(e){return{verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,identificationSource:e.identificationSource??"selected-verbs",literaryRegister:e.literaryRegister??"all",pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeOnPronoun:e.includeOnPronoun,voiceMode:e.voiceMode,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions]}}function Pr(e){const n=e.toUpperCase().replace(/[^A-Z0-9]/g,"");return n.length===8?n.match(/.{1,2}/g)?.join("-")??n:e.trim().toUpperCase()}function Ir(e,n,t){return{version:1,...n===void 0?{}:{title:n.trim()},...t?.trim()?{description:t.trim()}:{},verbIds:[...e.verbIds],tenseIds:[...e.tenseIds],questionCount:e.questionCount,exerciseKind:e.exerciseKind,identificationSource:e.identificationSource??"selected-verbs",literaryRegister:e.literaryRegister??"all",pastSimplePronouns:e.pastSimplePronouns,inclusivePronouns:e.inclusivePronouns,includeOnPronoun:e.includeOnPronoun,voiceMode:e.voiceMode,includeComplements:e.includeComplements,complementPlacement:e.complementPlacement,complementOptions:[...e.complementOptions],printOptions:{...e.printOptions}}}function Qm(){async function e(a){return await $fetch("/api/questionnaires",{method:"POST",body:Cr(a)})}async function n(a,i,l=""){return await $fetch("/api/defis",{method:"POST",body:Ir(a,i,l)})}async function t(a){const i=Pr(a);return await $fetch(`/api/defis/${encodeURIComponent(i)}`)}return{generateQuestions:e,saveChallenge:n,loadChallenge:t}}function un(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function Ar(e){if(Array.isArray(e))return e}function Tr(e){if(Array.isArray(e))return un(e)}function Or(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function jr(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,La(a.key),a)}}function zr(e,n,t){return n&&jr(e.prototype,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function Ft(e,n){var t=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=Tn(e))||n){t&&(e=t);var a=0,i=function(){};return{s:i,n:function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}},e:function(d){throw d},f:i}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var l,c=!0,u=!1;return{s:function(){t=t.call(e)},n:function(){var d=t.next();return c=d.done,d},e:function(d){u=!0,l=d},f:function(){try{c||t.return==null||t.return()}finally{if(u)throw l}}}}function j(e,n,t){return(n=La(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function Fr(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Er(e,n){var t=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(t!=null){var a,i,l,c,u=[],d=!0,g=!1;try{if(l=(t=t.call(e)).next,n===0){if(Object(t)!==t)return;d=!1}else for(;!(d=(a=l.call(t)).done)&&(u.push(a.value),u.length!==n);d=!0);}catch(S){g=!0,i=S}finally{try{if(!d&&t.return!=null&&(c=t.return(),Object(c)!==c))return}finally{if(g)throw i}}return u}}function Lr(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Nr(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function qn(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function k(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?qn(Object(t),!0).forEach(function(a){j(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):qn(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function Ht(e,n){return Ar(e)||Er(e,n)||Tn(e,n)||Lr()}function Pe(e){return Tr(e)||Fr(e)||Tn(e)||Nr()}function Mr(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function La(e){var n=Mr(e,"string");return typeof n=="symbol"?n:n+""}function Rt(e){"@babel/helpers - typeof";return Rt=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Rt(e)}function Tn(e,n){if(e){if(typeof e=="string")return un(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?un(e,n):void 0}}var Yn=function(){},On={},Na={},Ma=null,Da={mark:Yn,measure:Yn};try{typeof window<"u"&&(On=window),typeof document<"u"&&(Na=document),typeof MutationObserver<"u"&&(Ma=MutationObserver),typeof performance<"u"&&(Da=performance)}catch{}var Dr=On.navigator||{},Xn=Dr.userAgent,Qn=Xn===void 0?"":Xn,Ye=On,Q=Na,Jn=Ma,At=Da;Ye.document;var Ue=!!Q.documentElement&&!!Q.head&&typeof Q.addEventListener=="function"&&typeof Q.createElement=="function",Ra=~Qn.indexOf("MSIE")||~Qn.indexOf("Trident/"),Tt,Rr=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|gt|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt|sldr|slpdr|pr|ms|vs)?[\-\ ]/,Br=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Graphite|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Slab Duo|Slab Press Duo|Pixel|Mosaic|Vellum|Whiteboard)?.*/i,Ba={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},"slab-duo":{"fa-regular":"regular",fasldr:"regular"},"slab-press-duo":{"fa-regular":"regular",faslpdr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},vellum:{"fa-solid":"solid",favs:"solid"},pixel:{"fa-regular":"regular",fapr:"regular"},mosaic:{"fa-solid":"solid",fams:"solid"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},graphite:{"fa-thin":"thin",fagt:"thin"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},Wr={GROUP:"duotone-group",PRIMARY:"primary",SECONDARY:"secondary"},Wa=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],pe="classic",$t="duotone",Ua="sharp",Va="sharp-duotone",Ha="chisel",Ka="etch",Ga="graphite",qa="jelly",Ya="jelly-duo",Xa="jelly-fill",Qa="mosaic",Ja="notdog",Za="notdog-duo",ei="pixel",ti="slab",ni="slab-duo",ai="slab-press",ii="slab-press-duo",ri="thumbprint",oi="utility",si="utility-duo",li="utility-fill",ci="vellum",ui="whiteboard",Ur="Classic",Vr="Duotone",Hr="Sharp",Kr="Sharp Duotone",Gr="Chisel",qr="Etch",Yr="Graphite",Xr="Jelly",Qr="Jelly Duo",Jr="Jelly Fill",Zr="Mosaic",eo="Notdog",to="Notdog Duo",no="Pixel",ao="Slab",io="Slab Duo",ro="Slab Press",oo="Slab Press Duo",so="Thumbprint",lo="Utility",co="Utility Duo",uo="Utility Fill",fo="Vellum",mo="Whiteboard",fi=[pe,$t,Ua,Va,Ha,Ka,Ga,qa,Ya,Xa,Qa,Ja,Za,ei,ti,ni,ai,ii,ri,oi,si,li,ci,ui];Tt={},j(j(j(j(j(j(j(j(j(j(Tt,pe,Ur),$t,Vr),Ua,Hr),Va,Kr),Ha,Gr),Ka,qr),Ga,Yr),qa,Xr),Ya,Qr),Xa,Jr),j(j(j(j(j(j(j(j(j(j(Tt,Qa,Zr),Ja,eo),Za,to),ei,no),ti,ao),ni,io),ai,ro),ii,oo),ri,so),oi,lo),j(j(j(j(Tt,si,co),li,uo),ci,fo),ui,mo);var po={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},"slab-duo":{400:"fasldr"},"slab-press-duo":{400:"faslpdr"},vellum:{900:"favs"},mosaic:{900:"fams"},pixel:{400:"fapr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},graphite:{100:"fagt"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},vo={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Slab Duo":{400:"fasldr",normal:"fasldr"},"Font Awesome 7 Slab Press Duo":{400:"faslpdr",normal:"faslpdr"},"Font Awesome 7 Pixel":{400:"fapr",normal:"fapr"},"Font Awesome 7 Mosaic":{900:"fams",normal:"fams"},"Font Awesome 7 Vellum":{900:"favs",normal:"favs"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Graphite":{100:"fagt",normal:"fagt"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},go=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["graphite",{defaultShortPrefixId:"fagt",defaultStyleId:"thin",styleIds:["thin"],futureStyleIds:[],defaultFontWeight:100}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["mosaic",{defaultShortPrefixId:"fams",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["pixel",{defaultShortPrefixId:"fapr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-duo",{defaultShortPrefixId:"fasldr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press-duo",{defaultShortPrefixId:"faslpdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["vellum",{defaultShortPrefixId:"favs",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),bo={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},graphite:{thin:"fagt"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},mosaic:{solid:"fams"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},pixel:{regular:"fapr"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-duo":{regular:"fasldr"},"slab-press":{regular:"faslpr"},"slab-press-duo":{regular:"faslpdr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},vellum:{solid:"favs"},whiteboard:{semibold:"fawsb"}},di=["fak","fa-kit","fakd","fa-kit-duotone"],Zn={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},ho=["kit"],yo="kit",xo="kit-duotone",wo="Kit",_o="Kit Duotone";j(j({},yo,wo),xo,_o);var ko={kit:{"fa-kit":"fak"}},So={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},$o={kit:{fak:"fa-kit"}},ea={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},Ot,jt={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},Co=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-slab-press-duo","fa-slab-duo","fa-mosaic","fa-pixel","fa-vellum","fa-utility","fa-utility-duo","fa-utility-fill"],Po="classic",Io="duotone",Ao="sharp",To="sharp-duotone",Oo="chisel",jo="etch",zo="graphite",Fo="jelly",Eo="jelly-duo",Lo="jelly-fill",No="mosaic",Mo="notdog",Do="notdog-duo",Ro="pixel",Bo="slab",Wo="slab-duo",Uo="slab-press",Vo="slab-press-duo",Ho="thumbprint",Ko="utility",Go="utility-duo",qo="utility-fill",Yo="vellum",Xo="whiteboard",Qo="Classic",Jo="Duotone",Zo="Sharp",es="Sharp Duotone",ts="Chisel",ns="Etch",as="Graphite",is="Jelly",rs="Jelly Duo",os="Jelly Fill",ss="Mosaic",ls="Notdog",cs="Notdog Duo",us="Pixel",fs="Slab",ds="Slab Duo",ms="Slab Press",ps="Slab Press Duo",vs="Thumbprint",gs="Utility",bs="Utility Duo",hs="Utility Fill",ys="Vellum",xs="Whiteboard";Ot={},j(j(j(j(j(j(j(j(j(j(Ot,Po,Qo),Io,Jo),Ao,Zo),To,es),Oo,ts),jo,ns),zo,as),Fo,is),Eo,rs),Lo,os),j(j(j(j(j(j(j(j(j(j(Ot,No,ss),Mo,ls),Do,cs),Ro,us),Bo,fs),Wo,ds),Uo,ms),Vo,ps),Ho,vs),Ko,gs),j(j(j(j(Ot,Go,bs),qo,hs),Yo,ys),Xo,xs);var ws="kit",_s="kit-duotone",ks="Kit",Ss="Kit Duotone";j(j({},ws,ks),_s,Ss);var $s={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},"slab-duo":{"fa-regular":"fasldr"},"slab-press-duo":{"fa-regular":"faslpdr"},pixel:{"fa-regular":"fapr"},mosaic:{"fa-solid":"fams"},vellum:{"fa-solid":"favs"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},graphite:{"fa-thin":"fagt"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},Cs={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],"slab-duo":["fasldr"],"slab-press-duo":["faslpdr"],pixel:["fapr"],mosaic:["fams"],vellum:["favs"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],graphite:["fagt"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},fn={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},"slab-duo":{fasldr:"fa-regular"},"slab-press-duo":{faslpdr:"fa-regular"},pixel:{fapr:"fa-regular"},mosaic:{fams:"fa-solid"},vellum:{favs:"fa-solid"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},graphite:{fagt:"fa-thin"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},Ps=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],mi=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fasldr","faslpdr","fapr","fams","favs","fawsb","fatl","fans","fands","faes","fagt","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(Co,Ps),Is=["solid","regular","light","thin","duotone","brands","semibold"],pi=[1,2,3,4,5,6,7,8,9,10],As=pi.concat([11,12,13,14,15,16,17,18,19,20]),Ts=["aw","fw","pull-left","pull-right"],Os=[].concat(Pe(Object.keys(Cs)),Is,Ts,["2xs","xs","sm","lg","xl","2xl","beat","beat-fade","border","bounce","buzz","canvas-square","canvas-roomy","fade","flip-360","flip-both","flip-horizontal","flip-vertical","flip","float","inverse","jello","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","spin-snap","spin-snap-4","spin-snap-8","stack-1x","stack-2x","stack","swing","ul","wag","width-auto","width-fixed",jt.GROUP,jt.SWAP_OPACITY,jt.PRIMARY,jt.SECONDARY]).concat(pi.map(function(e){return"".concat(e,"x")})).concat(As.map(function(e){return"w-".concat(e)})),js={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},Be="___FONT_AWESOME___",dn=16,vi="fa",gi="svg-inline--fa",ot="data-fa-i2svg",mn="data-fa-pseudo-element",zs="data-fa-pseudo-element-pending",jn="data-prefix",zn="data-icon",ta="fontawesome-i2svg",Fs="async",Es=["HTML","HEAD","STYLE","SCRIPT"],bi=["::before","::after",":before",":after"],hi=(function(){try{return!0}catch{return!1}})();function Ct(e){return new Proxy(e,{get:function(t,a){return a in t?t[a]:t[pe]}})}var yi=k({},Ba);yi[pe]=k(k(k(k({},{"fa-duotone":"duotone"}),Ba[pe]),Zn.kit),Zn["kit-duotone"]);var Ls=Ct(yi),pn=k({},bo);pn[pe]=k(k(k(k({},{duotone:"fad"}),pn[pe]),ea.kit),ea["kit-duotone"]);var na=Ct(pn),vn=k({},fn);vn[pe]=k(k({},vn[pe]),$o.kit);var Fn=Ct(vn),gn=k({},$s);gn[pe]=k(k({},gn[pe]),ko.kit);Ct(gn);var Ns=Rr,xi="fa-layers-text",Ms=Br,Ds=k({},po);Ct(Ds);var Rs=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],Qt=Wr,Bs=[].concat(Pe(ho),Pe(Os)),wt=Ye.FontAwesomeConfig||{};function Ws(e){var n=Q.querySelector("script["+e+"]");if(n)return n.getAttribute(e)}function Us(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}if(Q&&typeof Q.querySelector=="function"){var Vs=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];Vs.forEach(function(e){var n=Ht(e,2),t=n[0],a=n[1],i=Us(Ws(t));i!=null&&(wt[a]=i)})}var wi={styleDefault:"solid",familyDefault:pe,cssPrefix:vi,replacementClass:gi,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};wt.familyPrefix&&(wt.cssPrefix=wt.familyPrefix);var pt=k(k({},wi),wt);pt.autoReplaceSvg||(pt.observeMutations=!1);var O={};Object.keys(wi).forEach(function(e){Object.defineProperty(O,e,{enumerable:!0,set:function(t){pt[e]=t,_t.forEach(function(a){return a(O)})},get:function(){return pt[e]}})});Object.defineProperty(O,"familyPrefix",{enumerable:!0,set:function(n){pt.cssPrefix=n,_t.forEach(function(t){return t(O)})},get:function(){return pt.cssPrefix}});Ye.FontAwesomeConfig=O;var _t=[];function Hs(e){return _t.push(e),function(){_t.splice(_t.indexOf(e),1)}}var ut=dn,Ne={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Ks(e){if(!(!e||!Ue)){var n=Q.createElement("style");n.setAttribute("type","text/css"),n.innerHTML=e;for(var t=Q.head.childNodes,a=null,i=t.length-1;i>-1;i--){var l=t[i],c=(l.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(c)>-1&&(a=l)}return Q.head.insertBefore(n,a),e}}var Gs="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function aa(){for(var e=12,n="";e-- >0;)n+=Gs[Math.random()*62|0];return n}function vt(e){for(var n=[],t=(e||[]).length>>>0;t--;)n[t]=e[t];return n}function En(e){return e.classList?vt(e.classList):(e.getAttribute("class")||"").split(" ").filter(function(n){return n})}function _i(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function qs(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,'="').concat(_i(e[t]),'" ')},"").trim()}function Kt(e){return Object.keys(e||{}).reduce(function(n,t){return n+"".concat(t,": ").concat(e[t].trim(),";")},"")}function Ln(e){return e.size!==Ne.size||e.x!==Ne.x||e.y!==Ne.y||e.rotate!==Ne.rotate||e.flipX||e.flipY}function Ys(e){var n=e.transform,t=e.containerWidth,a=e.iconWidth,i={transform:"translate(".concat(t/2," 256)")},l="translate(".concat(n.x*32,", ").concat(n.y*32,") "),c="scale(".concat(n.size/16*(n.flipX?-1:1),", ").concat(n.size/16*(n.flipY?-1:1),") "),u="rotate(".concat(n.rotate," 0 0)"),d={transform:"".concat(l," ").concat(c," ").concat(u)},g={transform:"translate(".concat(a/2*-1," -256)")};return{outer:i,inner:d,path:g}}function Xs(e){var n=e.transform,t=e.width,a=t===void 0?dn:t,i=e.height,l=i===void 0?dn:i,c="";return Ra?c+="translate(".concat(n.x/ut-a/2,"em, ").concat(n.y/ut-l/2,"em) "):c+="translate(calc(-50% + ".concat(n.x/ut,"em), calc(-50% + ").concat(n.y/ut,"em)) "),c+="scale(".concat(n.size/ut*(n.flipX?-1:1),", ").concat(n.size/ut*(n.flipY?-1:1),") "),c+="rotate(".concat(n.rotate,"deg) "),c}var Qs=`:root, :host {
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
}`;function ki(){var e=vi,n=gi,t=O.cssPrefix,a=O.replacementClass,i=Qs;if(t!==e||a!==n){var l=new RegExp("\\.".concat(e,"\\-"),"g"),c=new RegExp("\\--".concat(e,"\\-"),"g"),u=new RegExp("\\.".concat(n),"g");i=i.replace(l,".".concat(t,"-")).replace(c,"--".concat(t,"-")).replace(u,".".concat(a))}return i}var ia=!1;function Jt(){O.autoAddCss&&!ia&&(Ks(ki()),ia=!0)}var Js={mixout:function(){return{dom:{css:ki,insertCss:Jt}}},hooks:function(){return{beforeDOMElementCreation:function(){Jt()},beforeI2svg:function(){Jt()}}}},We=Ye||{};We[Be]||(We[Be]={});We[Be].styles||(We[Be].styles={});We[Be].hooks||(We[Be].hooks={});We[Be].shims||(We[Be].shims=[]);var Ce=We[Be],Si=[],$i=function(){Q.removeEventListener("DOMContentLoaded",$i),Bt=1,Si.map(function(n){return n()})},Bt=!1;Ue&&(Bt=(Q.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(Q.readyState),Bt||Q.addEventListener("DOMContentLoaded",$i));function Zs(e){Ue&&(Bt?setTimeout(e,0):Si.push(e))}function Pt(e){var n=e.tag,t=e.attributes,a=t===void 0?{}:t,i=e.children,l=i===void 0?[]:i;return typeof e=="string"?_i(e):"<".concat(n," ").concat(qs(a),">").concat(l.map(Pt).join(""),"</").concat(n,">")}function ra(e,n,t){if(e&&e[n]&&e[n][t])return{prefix:n,iconName:t,icon:e[n][t]}}var Zt=function(n,t,a,i){var l=Object.keys(n),c=l.length,u=t,d,g,S;for(a===void 0?(d=1,S=n[l[0]]):(d=0,S=a);d<c;d++)g=l[d],S=u(S,n[g],g,n);return S};function Ci(e){return Pe(e).length!==1?null:e.codePointAt(0).toString(16)}function oa(e){return Object.keys(e).reduce(function(n,t){var a=e[t],i=!!a.icon;return i?n[a.iconName]=a.icon:n[t]=a,n},{})}function bn(e,n){var t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},a=t.skipHooks,i=a===void 0?!1:a,l=oa(n);typeof Ce.hooks.addPack=="function"&&!i?Ce.hooks.addPack(e,oa(n)):Ce.styles[e]=k(k({},Ce.styles[e]||{}),l),e==="fas"&&bn("fa",n)}var kt=Ce.styles,el=Ce.shims,Pi=Object.keys(Fn),tl=Pi.reduce(function(e,n){return e[n]=Object.keys(Fn[n]),e},{}),Nn=null,Ii={},Ai={},Ti={},Oi={},ji={};function nl(e){return~Bs.indexOf(e)}function al(e,n){var t=n.split("-"),a=t[0],i=t.slice(1).join("-");return a===e&&i!==""&&!nl(i)?i:null}var zi=function(){var n=function(l){return Zt(kt,function(c,u,d){return c[d]=Zt(u,l,{}),c},{})};Ii=n(function(i,l,c){if(l[3]&&(i[l[3]]=c),l[2]){var u=l[2].filter(function(d){return typeof d=="number"});u.forEach(function(d){i[d.toString(16)]=c})}return i}),Ai=n(function(i,l,c){if(i[c]=c,l[2]){var u=l[2].filter(function(d){return typeof d=="string"});u.forEach(function(d){i[d]=c})}return i}),ji=n(function(i,l,c){var u=l[2];return i[c]=c,u.forEach(function(d){i[d]=c}),i});var t="far"in kt||O.autoFetchSvg,a=Zt(el,function(i,l){var c=l[0],u=l[1],d=l[2];return u==="far"&&!t&&(u="fas"),typeof c=="string"&&(i.names[c]={prefix:u,iconName:d}),typeof c=="number"&&(i.unicodes[c.toString(16)]={prefix:u,iconName:d}),i},{names:{},unicodes:{}});Ti=a.names,Oi=a.unicodes,Nn=Gt(O.styleDefault,{family:O.familyDefault})};Hs(function(e){Nn=Gt(e.styleDefault,{family:O.familyDefault})});zi();function Mn(e,n){return(Ii[e]||{})[n]}function il(e,n){return(Ai[e]||{})[n]}function rt(e,n){return(ji[e]||{})[n]}function Fi(e){return Ti[e]||{prefix:null,iconName:null}}function rl(e){var n=Oi[e],t=Mn("fas",e);return n||(t?{prefix:"fas",iconName:t}:null)||{prefix:null,iconName:null}}function Xe(){return Nn}var Ei=function(){return{prefix:null,iconName:null,rest:[]}};function ol(e){var n=pe,t=Pi.reduce(function(a,i){return a[i]="".concat(O.cssPrefix,"-").concat(i),a},{});return fi.forEach(function(a){(e.includes(t[a])||e.some(function(i){return tl[a].includes(i)}))&&(n=a)}),n}function Gt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.family,a=t===void 0?pe:t,i=Ls[a][e];if(a===$t&&!e)return"fad";var l=na[a][e]||na[a][i],c=e in Ce.styles?e:null,u=l||c||null;return u}function sl(e){var n=[],t=null;return e.forEach(function(a){var i=al(O.cssPrefix,a);i?t=i:a&&n.push(a)}),{iconName:t,rest:n}}function sa(e){return e.sort().filter(function(n,t,a){return a.indexOf(n)===t})}var la=mi.concat(di);function qt(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.skipLookups,a=t===void 0?!1:t,i=null,l=sa(e.filter(function(P){return la.includes(P)})),c=sa(e.filter(function(P){return!la.includes(P)})),u=l.filter(function(P){return i=P,!Wa.includes(P)}),d=Ht(u,1),g=d[0],S=g===void 0?null:g,w=ol(l),T=k(k({},sl(c)),{},{prefix:Gt(S,{family:w})});return k(k(k({},T),fl({values:e,family:w,styles:kt,config:O,canonical:T,givenPrefix:i})),ll(a,i,T))}function ll(e,n,t){var a=t.prefix,i=t.iconName;if(e||!a||!i)return{prefix:a,iconName:i};var l=n==="fa"?Fi(i):{},c=rt(a,i);return i=l.iconName||c||i,a=l.prefix||a,a==="far"&&!kt.far&&kt.fas&&!O.autoFetchSvg&&(a="fas"),{prefix:a,iconName:i}}var cl=fi.filter(function(e){return e!==pe||e!==$t}),ul=Object.keys(fn).filter(function(e){return e!==pe}).map(function(e){return Object.keys(fn[e])}).flat();function fl(e){var n=e.values,t=e.family,a=e.canonical,i=e.givenPrefix,l=i===void 0?"":i,c=e.styles,u=c===void 0?{}:c,d=e.config,g=d===void 0?{}:d,S=t===$t,w=n.includes("fa-duotone")||n.includes("fad"),T=g.familyDefault==="duotone",P=a.prefix==="fad"||a.prefix==="fa-duotone";if(!S&&(w||T||P)&&(a.prefix="fad"),(n.includes("fa-brands")||n.includes("fab"))&&(a.prefix="fab"),!a.prefix&&cl.includes(t)){var C=Object.keys(u).find(function(I){return ul.includes(I)});if(C||g.autoFetchSvg){var b=go.get(t).defaultShortPrefixId;a.prefix=b,a.iconName=rt(a.prefix,a.iconName)||a.iconName}}return(a.prefix==="fa"||l==="fa")&&(a.prefix=Xe()||"fas"),a}var dl=(function(){function e(){Or(this,e),this.definitions={}}return zr(e,[{key:"add",value:function(){for(var t=this,a=arguments.length,i=new Array(a),l=0;l<a;l++)i[l]=arguments[l];var c=i.reduce(this._pullDefinitions,{});Object.keys(c).forEach(function(u){t.definitions[u]=k(k({},t.definitions[u]||{}),c[u]),bn(u,c[u]);var d=Fn[pe][u];d&&bn(d,c[u]),zi()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(t,a){var i=a.prefix&&a.iconName&&a.icon?{0:a}:a;return Object.keys(i).map(function(l){var c=i[l],u=c.prefix,d=c.iconName,g=c.icon,S=g[2];t[u]||(t[u]={}),S.length>0&&S.forEach(function(w){typeof w=="string"&&(t[u][w]=g)}),t[u][d]=g}),t}}])})(),ca=[],dt={},mt={},ml=Object.keys(mt);function pl(e,n){var t=n.mixoutsTo;return ca=e,dt={},Object.keys(mt).forEach(function(a){ml.indexOf(a)===-1&&delete mt[a]}),ca.forEach(function(a){var i=a.mixout?a.mixout():{};if(Object.keys(i).forEach(function(c){typeof i[c]=="function"&&(t[c]=i[c]),Rt(i[c])==="object"&&Object.keys(i[c]).forEach(function(u){t[c]||(t[c]={}),t[c][u]=i[c][u]})}),a.hooks){var l=a.hooks();Object.keys(l).forEach(function(c){dt[c]||(dt[c]=[]),dt[c].push(l[c])})}a.provides&&a.provides(mt)}),t}function hn(e,n){for(var t=arguments.length,a=new Array(t>2?t-2:0),i=2;i<t;i++)a[i-2]=arguments[i];var l=dt[e]||[];return l.forEach(function(c){n=c.apply(null,[n].concat(a))}),n}function st(e){for(var n=arguments.length,t=new Array(n>1?n-1:0),a=1;a<n;a++)t[a-1]=arguments[a];var i=dt[e]||[];i.forEach(function(l){l.apply(null,t)})}function Qe(){var e=arguments[0],n=Array.prototype.slice.call(arguments,1);return mt[e]?mt[e].apply(null,n):void 0}function yn(e){e.prefix==="fa"&&(e.prefix="fas");var n=e.iconName,t=e.prefix||Xe();if(n)return n=rt(t,n)||n,ra(Li.definitions,t,n)||ra(Ce.styles,t,n)}var Li=new dl,vl=function(){O.autoReplaceSvg=!1,O.observeMutations=!1,st("noAuto")},gl={i2svg:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return Ue?(st("beforeI2svg",n),Qe("pseudoElements2svg",n),Qe("i2svg",n)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot;O.autoReplaceSvg===!1&&(O.autoReplaceSvg=!0),O.observeMutations=!0,Zs(function(){hl({autoReplaceSvgRoot:t}),st("watch",n)})}},bl={icon:function(n){if(n===null)return null;if(Rt(n)==="object"&&n.prefix&&n.iconName)return{prefix:n.prefix,iconName:rt(n.prefix,n.iconName)||n.iconName};if(Array.isArray(n)&&n.length===2){var t=n[1].indexOf("fa-")===0?n[1].slice(3):n[1],a=Gt(n[0]);return{prefix:a,iconName:rt(a,t)||t}}if(typeof n=="string"&&(n.indexOf("".concat(O.cssPrefix,"-"))>-1||n.match(Ns))){var i=qt(n.split(" "),{skipLookups:!0});return{prefix:i.prefix||Xe(),iconName:rt(i.prefix,i.iconName)||i.iconName}}if(typeof n=="string"){var l=Xe();return{prefix:l,iconName:rt(l,n)||n}}}},_e={noAuto:vl,config:O,dom:gl,parse:bl,library:Li,findIconDefinition:yn,toHtml:Pt},hl=function(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=n.autoReplaceSvgRoot,a=t===void 0?Q:t;(Object.keys(Ce.styles).length>0||O.autoFetchSvg)&&Ue&&O.autoReplaceSvg&&_e.dom.i2svg({node:a})};function Yt(e,n){return Object.defineProperty(e,"abstract",{get:n}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(function(a){return Pt(a)})}}),Object.defineProperty(e,"node",{get:function(){if(Ue){var a=Q.createElement("div");return a.innerHTML=e.html,a.children}}}),e}function yl(e){var n=e.children,t=e.main,a=e.mask,i=e.attributes,l=e.styles,c=e.transform;if(Ln(c)&&t.found&&!a.found){var u=t.width,d=t.height,g={x:u/d/2,y:.5};i.style=Kt(k(k({},l),{},{"transform-origin":"".concat(g.x+c.x/16,"em ").concat(g.y+c.y/16,"em")}))}return[{tag:"svg",attributes:i,children:n}]}function xl(e){var n=e.prefix,t=e.iconName,a=e.children,i=e.attributes,l=e.symbol,c=l===!0?"".concat(n,"-").concat(O.cssPrefix,"-").concat(t):l;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:k(k({},i),{},{id:c}),children:a}]}]}function wl(e){var n=["aria-label","aria-labelledby","title","role"];return n.some(function(t){return t in e})}function Dn(e){var n=e.icons,t=n.main,a=n.mask,i=e.prefix,l=e.iconName,c=e.transform,u=e.symbol,d=e.maskId,g=e.extra,S=e.watchable,w=S===void 0?!1:S,T=a.found?a:t,P=T.width,C=T.height,b=[O.replacementClass,l?"".concat(O.cssPrefix,"-").concat(l):""].filter(function(F){return g.classes.indexOf(F)===-1}).filter(function(F){return F!==""||!!F}).concat(g.classes).join(" "),I={children:[],attributes:k(k({},g.attributes),{},{"data-prefix":i,"data-icon":l,class:b,role:g.attributes.role||"img",viewBox:"0 0 ".concat(P," ").concat(C)})};!wl(g.attributes)&&!g.attributes["aria-hidden"]&&(I.attributes["aria-hidden"]="true"),w&&(I.attributes[ot]="");var y=k(k({},I),{},{prefix:i,iconName:l,main:t,mask:a,maskId:d,transform:c,symbol:u,styles:k({},g.styles)}),m=a.found&&t.found?Qe("generateAbstractMask",y)||{children:[],attributes:{}}:Qe("generateAbstractIcon",y)||{children:[],attributes:{}},p=m.children,$=m.attributes;return y.children=p,y.attributes=$,u?xl(y):yl(y)}function ua(e){var n=e.content,t=e.width,a=e.height,i=e.transform,l=e.extra,c=e.watchable,u=c===void 0?!1:c,d=k(k({},l.attributes),{},{class:l.classes.join(" ")});u&&(d[ot]="");var g=k({},l.styles);Ln(i)&&(g.transform=Xs({transform:i,width:t,height:a}),g["-webkit-transform"]=g.transform);var S=Kt(g);S.length>0&&(d.style=S);var w=[];return w.push({tag:"span",attributes:d,children:[n]}),w}function _l(e){var n=e.content,t=e.extra,a=k(k({},t.attributes),{},{class:t.classes.join(" ")}),i=Kt(t.styles);i.length>0&&(a.style=i);var l=[];return l.push({tag:"span",attributes:a,children:[n]}),l}var en=Ce.styles;function xn(e){var n=e[0],t=e[1],a=e.slice(4),i=Ht(a,1),l=i[0],c=null;return Array.isArray(l)?c={tag:"g",attributes:{class:"".concat(O.cssPrefix,"-").concat(Qt.GROUP)},children:[{tag:"path",attributes:{class:"".concat(O.cssPrefix,"-").concat(Qt.SECONDARY),fill:"currentColor",d:l[0]}},{tag:"path",attributes:{class:"".concat(O.cssPrefix,"-").concat(Qt.PRIMARY),fill:"currentColor",d:l[1]}}]}:c={tag:"path",attributes:{fill:"currentColor",d:l}},{found:!0,width:n,height:t,icon:c}}var kl={found:!1,width:512,height:512};function Sl(e,n){!hi&&!O.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(n,'" is missing.'))}function wn(e,n){var t=n;return n==="fa"&&O.styleDefault!==null&&(n=Xe()),new Promise(function(a,i){if(t==="fa"){var l=Fi(e)||{};e=l.iconName||e,n=l.prefix||n}if(e&&n&&en[n]&&en[n][e]){var c=en[n][e];return a(xn(c))}Sl(e,n),a(k(k({},kl),{},{icon:O.showMissingIcons&&e?Qe("missingIconAbstract")||{}:{}}))})}var fa=function(){},_n=O.measurePerformance&&At&&At.mark&&At.measure?At:{mark:fa,measure:fa},xt='FA "7.3.1"',$l=function(n){return _n.mark("".concat(xt," ").concat(n," begins")),function(){return Ni(n)}},Ni=function(n){_n.mark("".concat(xt," ").concat(n," ends")),_n.measure("".concat(xt," ").concat(n),"".concat(xt," ").concat(n," begins"),"".concat(xt," ").concat(n," ends"))},Rn={begin:$l,end:Ni},Et=function(){};function da(e){var n=e.getAttribute?e.getAttribute(ot):null;return typeof n=="string"}function Cl(e){var n=e.getAttribute?e.getAttribute(jn):null,t=e.getAttribute?e.getAttribute(zn):null;return n&&t}function Pl(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(O.replacementClass)}function Il(){if(O.autoReplaceSvg===!0)return Lt.replace;var e=Lt[O.autoReplaceSvg];return e||Lt.replace}function Al(e){return Q.createElementNS("http://www.w3.org/2000/svg",e)}function Tl(e){return Q.createElement(e)}function Mi(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=n.ceFn,a=t===void 0?e.tag==="svg"?Al:Tl:t;if(typeof e=="string")return Q.createTextNode(e);var i=a(e.tag);Object.keys(e.attributes||[]).forEach(function(c){i.setAttribute(c,e.attributes[c])});var l=e.children||[];return l.forEach(function(c){i.appendChild(Mi(c,{ceFn:a}))}),i}function Ol(e){var n=" ".concat(e.outerHTML," ");return n="".concat(n,"Font Awesome fontawesome.com "),n}var Lt={replace:function(n){var t=n[0];if(t.parentNode)if(n[1].forEach(function(i){t.parentNode.insertBefore(Mi(i),t)}),t.getAttribute(ot)===null&&O.keepOriginalSource){var a=Q.createComment(Ol(t));t.parentNode.replaceChild(a,t)}else t.remove()},nest:function(n){var t=n[0],a=n[1];if(~En(t).indexOf(O.replacementClass))return Lt.replace(n);var i=new RegExp("".concat(O.cssPrefix,"-.*"));if(delete a[0].attributes.id,a[0].attributes.class){var l=a[0].attributes.class.split(" ").reduce(function(u,d){return d===O.replacementClass||d.match(i)?u.toSvg.push(d):u.toNode.push(d),u},{toNode:[],toSvg:[]});a[0].attributes.class=l.toSvg.join(" "),l.toNode.length===0?t.removeAttribute("class"):t.setAttribute("class",l.toNode.join(" "))}var c=a.map(function(u){return Pt(u)}).join(`
`);t.setAttribute(ot,""),t.innerHTML=c}};function ma(e){e()}function Di(e,n){var t=typeof n=="function"?n:Et;if(e.length===0)t();else{var a=ma;O.mutateApproach===Fs&&(a=Ye.requestAnimationFrame||ma),a(function(){var i=Il(),l=Rn.begin("mutate");e.map(i),l(),t()})}}var Bn=!1;function Ri(){Bn=!0}function kn(){Bn=!1}var Wt=null;function pa(e){if(Jn&&O.observeMutations){var n=e.treeCallback,t=n===void 0?Et:n,a=e.nodeCallback,i=a===void 0?Et:a,l=e.pseudoElementsCallback,c=l===void 0?Et:l,u=e.observeMutationsRoot,d=u===void 0?Q:u;Wt=new Jn(function(g){if(!Bn){var S=Xe();vt(g).forEach(function(w){if(w.type==="childList"&&w.addedNodes.length>0&&!da(w.addedNodes[0])&&(O.searchPseudoElements&&c(w.target),t(w.target)),w.type==="attributes"&&w.target.parentNode&&O.searchPseudoElements&&c([w.target],!0),w.type==="attributes"&&da(w.target)&&~Rs.indexOf(w.attributeName))if(w.attributeName==="class"&&Cl(w.target)){var T=qt(En(w.target)),P=T.prefix,C=T.iconName;w.target.setAttribute(jn,P||S),C&&w.target.setAttribute(zn,C)}else Pl(w.target)&&i(w.target)})}}),Ue&&Wt.observe(d,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function jl(){Wt&&Wt.disconnect()}function zl(e){var n=e.getAttribute("style"),t=[];return n&&(t=n.split(";").reduce(function(a,i){var l=i.split(":"),c=l[0],u=l.slice(1);return c&&u.length>0&&(a[c]=u.join(":").trim()),a},{})),t}function Fl(e){var n=e.getAttribute("data-prefix"),t=e.getAttribute("data-icon"),a=e.innerText!==void 0?e.innerText.trim():"",i=qt(En(e));return i.prefix||(i.prefix=Xe()),n&&t&&(i.prefix=n,i.iconName=t),i.iconName&&i.prefix||(i.prefix&&a.length>0&&(i.iconName=il(i.prefix,e.innerText)||Mn(i.prefix,Ci(e.innerText))),!i.iconName&&O.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(i.iconName=e.firstChild.data)),i}function El(e){var n=vt(e.attributes).reduce(function(t,a){return t.name!=="class"&&t.name!=="style"&&(t[a.name]=a.value),t},{});return n}function Ll(){return{iconName:null,prefix:null,transform:Ne,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function va(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},t=Fl(e),a=t.iconName,i=t.prefix,l=t.rest,c=El(e),u=hn("parseNodeAttributes",{},e),d=n.styleParser?zl(e):[];return k({iconName:a,prefix:i,transform:Ne,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:l,styles:d,attributes:c}},u)}var Nl=Ce.styles;function Bi(e){var n=O.autoReplaceSvg==="nest"?va(e,{styleParser:!1}):va(e);return~n.extra.classes.indexOf(xi)?Qe("generateLayersText",e,n):Qe("generateSvgReplacementMutation",e,n)}function Ml(){return[].concat(Pe(di),Pe(mi))}function ga(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!Ue)return Promise.resolve();var t=Q.documentElement.classList,a=function(w){return t.add("".concat(ta,"-").concat(w))},i=function(w){return t.remove("".concat(ta,"-").concat(w))},l=O.autoFetchSvg?Ml():Wa.concat(Object.keys(Nl));l.includes("fa")||l.push("fa");var c=[".".concat(xi,":not([").concat(ot,"])")].concat(l.map(function(S){return".".concat(S,":not([").concat(ot,"])")})).join(", ");if(c.length===0)return Promise.resolve();var u=[];try{u=vt(e.querySelectorAll(c))}catch{}if(u.length>0)a("pending"),i("complete");else return Promise.resolve();var d=Rn.begin("onTree"),g=u.reduce(function(S,w){try{var T=Bi(w);T&&S.push(T)}catch(P){hi||P.name==="MissingIcon"&&console.error(P)}return S},[]);return new Promise(function(S,w){Promise.all(g).then(function(T){Di(T,function(){a("active"),a("complete"),i("pending"),typeof n=="function"&&n(),d(),S()})}).catch(function(T){d(),w(T)})})}function Dl(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;Bi(e).then(function(t){t&&Di([t],n)})}function Rl(e){return function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=(n||{}).icon?n:yn(n||{}),i=t.mask;return i&&(i=(i||{}).icon?i:yn(i||{})),e(a,k(k({},t),{},{mask:i}))}}var Bl=function(n){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=t.transform,i=a===void 0?Ne:a,l=t.symbol,c=l===void 0?!1:l,u=t.mask,d=u===void 0?null:u,g=t.maskId,S=g===void 0?null:g,w=t.classes,T=w===void 0?[]:w,P=t.attributes,C=P===void 0?{}:P,b=t.styles,I=b===void 0?{}:b;if(n){var y=n.prefix,m=n.iconName,p=n.icon;return Yt(k({type:"icon"},n),function(){return st("beforeDOMElementCreation",{iconDefinition:n,params:t}),Dn({icons:{main:xn(p),mask:d?xn(d.icon):{found:!1,width:null,height:null,icon:{}}},prefix:y,iconName:m,transform:k(k({},Ne),i),symbol:c,maskId:S,extra:{attributes:C,styles:I,classes:T}})})}},Wl={mixout:function(){return{icon:Rl(Bl)}},hooks:function(){return{mutationObserverCallbacks:function(t){return t.treeCallback=ga,t.nodeCallback=Dl,t}}},provides:function(n){n.i2svg=function(t){var a=t.node,i=a===void 0?Q:a,l=t.callback,c=l===void 0?function(){}:l;return ga(i,c)},n.generateSvgReplacementMutation=function(t,a){var i=a.iconName,l=a.prefix,c=a.transform,u=a.symbol,d=a.mask,g=a.maskId,S=a.extra;return new Promise(function(w,T){Promise.all([wn(i,l),d.iconName?wn(d.iconName,d.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(P){var C=Ht(P,2),b=C[0],I=C[1];w([t,Dn({icons:{main:b,mask:I},prefix:l,iconName:i,transform:c,symbol:u,maskId:g,extra:S,watchable:!0})])}).catch(T)})},n.generateAbstractIcon=function(t){var a=t.children,i=t.attributes,l=t.main,c=t.transform,u=t.styles,d=Kt(u);d.length>0&&(i.style=d);var g;return Ln(c)&&(g=Qe("generateAbstractTransformGrouping",{main:l,transform:c,containerWidth:l.width,iconWidth:l.width})),a.push(g||l.icon),{children:a,attributes:i}}}},Ul={mixout:function(){return{layer:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.classes,l=i===void 0?[]:i;return Yt({type:"layer"},function(){st("beforeDOMElementCreation",{assembler:t,params:a});var c=[];return t(function(u){Array.isArray(u)?u.map(function(d){c=c.concat(d.abstract)}):c=c.concat(u.abstract)}),[{tag:"span",attributes:{class:["".concat(O.cssPrefix,"-layers")].concat(Pe(l)).join(" ")},children:c}]})}}}},Vl={mixout:function(){return{counter:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};a.title;var i=a.classes,l=i===void 0?[]:i,c=a.attributes,u=c===void 0?{}:c,d=a.styles,g=d===void 0?{}:d;return Yt({type:"counter",content:t},function(){return st("beforeDOMElementCreation",{content:t,params:a}),_l({content:t.toString(),extra:{attributes:u,styles:g,classes:["".concat(O.cssPrefix,"-layers-counter")].concat(Pe(l))}})})}}}},Hl={mixout:function(){return{text:function(t){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=a.transform,l=i===void 0?Ne:i,c=a.classes,u=c===void 0?[]:c,d=a.attributes,g=d===void 0?{}:d,S=a.styles,w=S===void 0?{}:S;return Yt({type:"text",content:t},function(){return st("beforeDOMElementCreation",{content:t,params:a}),ua({content:t,transform:k(k({},Ne),l),extra:{attributes:g,styles:w,classes:["".concat(O.cssPrefix,"-layers-text")].concat(Pe(u))}})})}}},provides:function(n){n.generateLayersText=function(t,a){var i=a.transform,l=a.extra,c=null,u=null;if(Ra){var d=parseInt(getComputedStyle(t).fontSize,10),g=t.getBoundingClientRect();c=g.width/d,u=g.height/d}return Promise.resolve([t,ua({content:t.innerHTML,width:c,height:u,transform:i,extra:l,watchable:!0})])}}},Wi=new RegExp('"',"ug"),ba=[1105920,1112319],ha=k(k(k(k({},{FontAwesome:{normal:"fas",400:"fas"}}),vo),js),So),Sn=Object.keys(ha).reduce(function(e,n){return e[n.toLowerCase()]=ha[n],e},{}),Kl=Object.keys(Sn).reduce(function(e,n){var t=Sn[n];return e[n]=t[900]||Pe(Object.entries(t))[0][1],e},{});function Gl(e){var n=e.replace(Wi,"");return Ci(Pe(n)[0]||"")}function ql(e){var n=e.getPropertyValue("font-feature-settings").includes("ss01"),t=e.getPropertyValue("content"),a=t.replace(Wi,""),i=a.codePointAt(0),l=i>=ba[0]&&i<=ba[1],c=a.length===2?a[0]===a[1]:!1;return l||c||n}function Yl(e,n){var t=e.replace(/^['"]|['"]$/g,"").toLowerCase(),a=parseInt(n),i=isNaN(a)?"normal":a;return(Sn[t]||{})[i]||Kl[t]}function ya(e,n){var t="".concat(zs).concat(n.replace(":","-"));return new Promise(function(a,i){if(e.getAttribute(t)!==null)return a();var l=vt(e.children),c=l.filter(function(ie){return ie.getAttribute(mn)===n})[0],u=Ye.getComputedStyle(e,n),d=u.getPropertyValue("font-family"),g=d.match(Ms),S=u.getPropertyValue("font-weight"),w=u.getPropertyValue("content");if(c&&!g)return e.removeChild(c),a();if(g&&w!=="none"&&w!==""){var T=u.getPropertyValue("content"),P=Yl(d,S),C=Gl(T),b=g[0].startsWith("FontAwesome"),I=ql(u),y=Mn(P,C),m=y;if(b){var p=rl(C);p.iconName&&p.prefix&&(y=p.iconName,P=p.prefix)}if(y&&!I&&(!c||c.getAttribute(jn)!==P||c.getAttribute(zn)!==m)){e.setAttribute(t,m),c&&e.removeChild(c);var $=Ll(),F=$.extra;F.attributes[mn]=n,wn(y,P).then(function(ie){var ce=Dn(k(k({},$),{},{icons:{main:ie,mask:Ei()},prefix:P,iconName:m,extra:F,watchable:!0})),H=Q.createElementNS("http://www.w3.org/2000/svg","svg");n==="::before"?e.insertBefore(H,e.firstChild):e.appendChild(H),H.outerHTML=ce.map(function(G){return Pt(G)}).join(`
`),e.removeAttribute(t),a()}).catch(i)}else a()}else a()})}function Xl(e){return Promise.all([ya(e,"::before"),ya(e,"::after")])}function Ql(e){return e.parentNode!==document.head&&!~Es.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(mn)&&(!e.parentNode||e.parentNode.tagName!=="svg")}var Jl=function(n){return!!n&&bi.some(function(t){return n.includes(t)})},Zl=function(n){if(!n)return[];var t=new Set,a=n.split(/,(?![^()]*\))/).map(function(d){return d.trim()});a=a.flatMap(function(d){return d.includes("(")?d:d.split(",").map(function(g){return g.trim()})});var i=Ft(a),l;try{for(i.s();!(l=i.n()).done;){var c=l.value;if(Jl(c)){var u=bi.reduce(function(d,g){return d.replace(g,"")},c);u!==""&&u!=="*"&&t.add(u)}}}catch(d){i.e(d)}finally{i.f()}return t};function xa(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if(Ue){var t;if(n)t=e;else if(O.searchPseudoElementsFullScan)t=e.querySelectorAll("*");else{var a=new Set,i=Ft(document.styleSheets),l;try{for(i.s();!(l=i.n()).done;){var c=l.value;try{var u=Ft(c.cssRules),d;try{for(u.s();!(d=u.n()).done;){var g=d.value,S=Zl(g.selectorText),w=Ft(S),T;try{for(w.s();!(T=w.n()).done;){var P=T.value;a.add(P)}}catch(b){w.e(b)}finally{w.f()}}}catch(b){u.e(b)}finally{u.f()}}catch(b){O.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(c.href," (").concat(b.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(b){i.e(b)}finally{i.f()}if(!a.size)return;var C=Array.from(a).join(", ");try{t=e.querySelectorAll(C)}catch{}}return new Promise(function(b,I){var y=vt(t).filter(Ql).map(Xl),m=Rn.begin("searchPseudoElements");Ri(),Promise.all(y).then(function(){m(),kn(),b()}).catch(function(){m(),kn(),I()})})}}var ec={hooks:function(){return{mutationObserverCallbacks:function(t){return t.pseudoElementsCallback=xa,t}}},provides:function(n){n.pseudoElements2svg=function(t){var a=t.node,i=a===void 0?Q:a;O.searchPseudoElements&&xa(i)}}},wa=!1,tc={mixout:function(){return{dom:{unwatch:function(){Ri(),wa=!0}}}},hooks:function(){return{bootstrap:function(){pa(hn("mutationObserverCallbacks",{}))},noAuto:function(){jl()},watch:function(t){var a=t.observeMutationsRoot;wa?kn():pa(hn("mutationObserverCallbacks",{observeMutationsRoot:a}))}}}},_a=function(n){var t={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return n.toLowerCase().split(" ").reduce(function(a,i){var l=i.toLowerCase().split("-"),c=l[0],u=l.slice(1).join("-");if(c&&u==="h")return a.flipX=!0,a;if(c&&u==="v")return a.flipY=!0,a;if(u=parseFloat(u),isNaN(u))return a;switch(c){case"grow":a.size=a.size+u;break;case"shrink":a.size=a.size-u;break;case"left":a.x=a.x-u;break;case"right":a.x=a.x+u;break;case"up":a.y=a.y-u;break;case"down":a.y=a.y+u;break;case"rotate":a.rotate=a.rotate+u;break}return a},t)},nc={mixout:function(){return{parse:{transform:function(t){return _a(t)}}}},hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-transform");return i&&(t.transform=_a(i)),t}}},provides:function(n){n.generateAbstractTransformGrouping=function(t){var a=t.main,i=t.transform,l=t.containerWidth,c=t.iconWidth,u={transform:"translate(".concat(l/2," 256)")},d="translate(".concat(i.x*32,", ").concat(i.y*32,") "),g="scale(".concat(i.size/16*(i.flipX?-1:1),", ").concat(i.size/16*(i.flipY?-1:1),") "),S="rotate(".concat(i.rotate," 0 0)"),w={transform:"".concat(d," ").concat(g," ").concat(S)},T={transform:"translate(".concat(c/2*-1," -256)")},P={outer:u,inner:w,path:T};return{tag:"g",attributes:k({},P.outer),children:[{tag:"g",attributes:k({},P.inner),children:[{tag:a.icon.tag,children:a.icon.children,attributes:k(k({},a.icon.attributes),P.path)}]}]}}}},tn={x:0,y:0,width:"100%",height:"100%"};function ka(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||n)&&(e.attributes.fill="black"),e}function ac(e){return e.tag==="g"?e.children:[e]}var ic={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-mask"),l=i?qt(i.split(" ").map(function(c){return c.trim()})):Ei();return l.prefix||(l.prefix=Xe()),t.mask=l,t.maskId=a.getAttribute("data-fa-mask-id"),t}}},provides:function(n){n.generateAbstractMask=function(t){var a=t.children,i=t.attributes,l=t.main,c=t.mask,u=t.maskId,d=t.transform,g=l.width,S=l.icon,w=c.width,T=c.icon,P=Ys({transform:d,containerWidth:w,iconWidth:g}),C={tag:"rect",attributes:k(k({},tn),{},{fill:"white"})},b=S.children?{children:S.children.map(ka)}:{},I={tag:"g",attributes:k({},P.inner),children:[ka(k({tag:S.tag,attributes:k(k({},S.attributes),P.path)},b))]},y={tag:"g",attributes:k({},P.outer),children:[I]},m="mask-".concat(u||aa()),p="clip-".concat(u||aa()),$={tag:"mask",attributes:k(k({},tn),{},{id:m,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[C,y]},F={tag:"defs",children:[{tag:"clipPath",attributes:{id:p},children:ac(T)},$]};return a.push(F,{tag:"rect",attributes:k({fill:"currentColor","clip-path":"url(#".concat(p,")"),mask:"url(#".concat(m,")")},tn)}),{children:a,attributes:i}}}},rc={provides:function(n){var t=!1;Ye.matchMedia&&(t=Ye.matchMedia("(prefers-reduced-motion: reduce)").matches),n.missingIconAbstract=function(){var a=[],i={fill:"currentColor"},l={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};a.push({tag:"path",attributes:k(k({},i),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var c=k(k({},l),{},{attributeName:"opacity"}),u={tag:"circle",attributes:k(k({},i),{},{cx:"256",cy:"364",r:"28"}),children:[]};return t||u.children.push({tag:"animate",attributes:k(k({},l),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:k(k({},c),{},{values:"1;0;1;1;0;1;"})}),a.push(u),a.push({tag:"path",attributes:k(k({},i),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:t?[]:[{tag:"animate",attributes:k(k({},c),{},{values:"1;0;0;0;0;1;"})}]}),t||a.push({tag:"path",attributes:k(k({},i),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:k(k({},c),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:a}}}},oc={hooks:function(){return{parseNodeAttributes:function(t,a){var i=a.getAttribute("data-fa-symbol"),l=i===null?!1:i===""?!0:i;return t.symbol=l,t}}}},sc=[Js,Wl,Ul,Vl,Hl,ec,tc,nc,ic,rc,oc];pl(sc,{mixoutsTo:_e});_e.noAuto;_e.config;_e.library;_e.dom;var $n=_e.parse;_e.findIconDefinition;_e.toHtml;var lc=_e.icon;_e.layer;_e.text;_e.counter;function Cn(e,n){(n==null||n>e.length)&&(n=e.length);for(var t=0,a=Array(n);t<n;t++)a[t]=e[t];return a}function cc(e){if(Array.isArray(e))return Cn(e)}function X(e,n,t){return(n=vc(n))in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function uc(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function fc(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Sa(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),t.push.apply(t,a)}return t}function Z(e){for(var n=1;n<arguments.length;n++){var t=arguments[n]!=null?arguments[n]:{};n%2?Sa(Object(t),!0).forEach(function(a){X(e,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Sa(Object(t)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})}return e}function nn(e,n){if(e==null)return{};var t,a,i=dc(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)t=l[a],n.indexOf(t)===-1&&{}.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}function dc(e,n){if(e==null)return{};var t={};for(var a in e)if({}.hasOwnProperty.call(e,a)){if(n.indexOf(a)!==-1)continue;t[a]=e[a]}return t}function mc(e){return cc(e)||uc(e)||gc(e)||fc()}function pc(e,n){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var a=t.call(e,n);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(e)}function vc(e){var n=pc(e,"string");return typeof n=="symbol"?n:n+""}function Ut(e){"@babel/helpers - typeof";return Ut=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Ut(e)}function gc(e,n){if(e){if(typeof e=="string")return Cn(e,n);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?Cn(e,n):void 0}}function an(e,n){return Array.isArray(n)&&n.length>0||!Array.isArray(n)&&n?X({},e,n):{}}function bc(e){var n,t=(n={"fa-spin":e.spin,"fa-pulse":e.pulse,"fa-fw":e.fixedWidth,"fa-border":e.border,"fa-li":e.listItem,"fa-inverse":e.inverse,"fa-flip":e.flip===!0,"fa-flip-horizontal":e.flip==="horizontal"||e.flip==="both","fa-flip-vertical":e.flip==="vertical"||e.flip==="both"},X(X(X(X(X(X(X(X(X(X(n,"fa-".concat(e.size),e.size!==null),"fa-rotate-".concat(e.rotation),e.rotation!==null),"fa-rotate-by",e.rotateBy),"fa-pull-".concat(e.pull),e.pull!==null),"fa-swap-opacity",e.swapOpacity),"fa-bounce",e.bounce),"fa-shake",e.shake),"fa-beat",e.beat),"fa-fade",e.fade),"fa-beat-fade",e.beatFade),X(X(X(X(X(X(X(X(X(X(n,"fa-flash",e.flash),"fa-spin-pulse",e.spinPulse),"fa-spin-reverse",e.spinReverse),"fa-width-auto",e.widthAuto),"fa-canvas-square",e.canvasSquare),"fa-canvas-roomy",e.canvasRoomy),"fa-flip-360",e.flip360),"fa-buzz",e.buzz),"fa-float",e.float),"fa-jello",e.jello),X(X(X(X(X(n,"fa-spin-snap",e.spinSnap),"fa-spin-snap-4",e.spinSnap4),"fa-spin-snap-8",e.spinSnap8),"fa-swing",e.swing),"fa-wag",e.wag));return Object.keys(t).map(function(a){return t[a]?a:null}).filter(function(a){return a})}var hc=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Ui={exports:{}};(function(e){(function(n){var t=function(y,m,p){if(!g(m)||w(m)||T(m)||P(m)||d(m))return m;var $,F=0,ie=0;if(S(m))for($=[],ie=m.length;F<ie;F++)$.push(t(y,m[F],p));else{$={};for(var ce in m)Object.prototype.hasOwnProperty.call(m,ce)&&($[y(ce,p)]=t(y,m[ce],p))}return $},a=function(y,m){m=m||{};var p=m.separator||"_",$=m.split||/(?=[A-Z])/;return y.split($).join(p)},i=function(y){return C(y)?y:(y=y.replace(/[\-_\s]+(.)?/g,function(m,p){return p?p.toUpperCase():""}),y.substr(0,1).toLowerCase()+y.substr(1))},l=function(y){var m=i(y);return m.substr(0,1).toUpperCase()+m.substr(1)},c=function(y,m){return a(y,m).toLowerCase()},u=Object.prototype.toString,d=function(y){return typeof y=="function"},g=function(y){return y===Object(y)},S=function(y){return u.call(y)=="[object Array]"},w=function(y){return u.call(y)=="[object Date]"},T=function(y){return u.call(y)=="[object RegExp]"},P=function(y){return u.call(y)=="[object Boolean]"},C=function(y){return y=y-0,y===y},b=function(y,m){var p=m&&"process"in m?m.process:m;return typeof p!="function"?y:function($,F){return p($,y,F)}},I={camelize:i,decamelize:c,pascalize:l,depascalize:c,camelizeKeys:function(y,m){return t(b(i,m),y)},decamelizeKeys:function(y,m){return t(b(c,m),y,m)},pascalizeKeys:function(y,m){return t(b(l,m),y)},depascalizeKeys:function(){return this.decamelizeKeys.apply(this,arguments)}};e.exports?e.exports=I:n.humps=I})(hc)})(Ui);var yc=Ui.exports,xc=["gradientFill"],wc=["class","style"],_c=["type","stops","id"];function kc(e){return e.split(";").map(function(n){return n.trim()}).filter(function(n){return n}).reduce(function(n,t){var a=t.indexOf(":"),i=yc.camelize(t.slice(0,a)),l=t.slice(a+1).trim();return n[i]=l,n},{})}function Sc(e){return e.split(/\s+/).reduce(function(n,t){return n[t]=!0,n},{})}function $c(e,n){return zt("stop",Z({key:"".concat(n,"-").concat(e.offset),offset:e.offset,"stop-color":e.color},e.opacity!==void 0&&{"stop-opacity":e.opacity}))}function Vi(e){if(typeof e=="string")return e;var n=(e.children||[]).map(Vi);return e.tag==="path"&&e.attributes&&"fill"in e.attributes?Z(Z({},e),{},{attributes:Z(Z({},e.attributes),{},{fill:void 0}),children:n}):Z(Z({},e),{},{children:n})}function Hi(e){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof e=="string")return e;var a=n.gradientFill,i=a===void 0?null:a,l=nn(n,xc),c=!!i||"fill"in t,u=c?Vi(e):e,d=(u.children||[]).map(function($){return Hi($,{},{})}),g=Object.keys(u.attributes||{}).reduce(function($,F){var ie=u.attributes[F];switch(F){case"class":$.class=Sc(ie);break;case"style":$.style=kc(ie);break;default:$.attrs[F]=ie}return $},{attrs:{},class:{},style:{}});t.class;var S=t.style,w=S===void 0?{}:S,T=nn(t,wc);if(i&&i.id&&(i.type==="linear"||i.type==="radial")){var P=i.type,C=i.stops,b=C===void 0?[]:C,I=i.id,y=nn(i,_c),m=P==="linear"?"linearGradient":"radialGradient",p=zt(m,Z(Z({},y),{},{id:I}),b.map($c));return zt(u.tag,Z(Z(Z(Z({},l),{},{class:g.class,style:Z(Z({},g.style),w)},g.attrs),T),{},{fill:"url(#".concat(I,")")}),[p].concat(mc(d)))}return zt(e.tag,Z(Z(Z({},l),{},{class:g.class,style:Z(Z({},g.style),w)},g.attrs),T),d)}var Ki=!1;try{Ki=!0}catch{}function $a(){if(!Ki&&console&&typeof console.error=="function"){var e;(e=console).error.apply(e,arguments)}}function Ca(e){if(e&&Ut(e)==="object"&&e.prefix&&e.iconName&&e.icon)return e;if($n.icon)return $n.icon(e);if(e===null)return null;if(Ut(e)==="object"&&e.prefix&&e.iconName)return e;if(Array.isArray(e)&&e.length===2)return{prefix:e[0],iconName:e[1]};if(typeof e=="string")return{prefix:"fas",iconName:e}}var Cc=Je({name:"FontAwesomeIcon",props:{border:{type:Boolean,default:!1},fixedWidth:{type:Boolean,default:!1},flip:{type:[Boolean,String],default:!1,validator:function(n){return[!0,!1,"horizontal","vertical","both"].indexOf(n)>-1}},icon:{type:[Object,Array,String],required:!0},mask:{type:[Object,Array,String],default:null},maskId:{type:String,default:null},listItem:{type:Boolean,default:!1},pull:{type:String,default:null,validator:function(n){return["right","left"].indexOf(n)>-1}},pulse:{type:Boolean,default:!1},rotation:{type:[String,Number],default:null,validator:function(n){return[90,180,270].indexOf(Number.parseInt(n,10))>-1}},rotateBy:{type:Boolean,default:!1},swapOpacity:{type:Boolean,default:!1},size:{type:String,default:null,validator:function(n){return["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"].indexOf(n)>-1}},spin:{type:Boolean,default:!1},transform:{type:[String,Object],default:null},symbol:{type:[Boolean,String],default:!1},title:{type:String,default:null},titleId:{type:String,default:null},inverse:{type:Boolean,default:!1},bounce:{type:Boolean,default:!1},shake:{type:Boolean,default:!1},beat:{type:Boolean,default:!1},fade:{type:Boolean,default:!1},beatFade:{type:Boolean,default:!1},flash:{type:Boolean,default:!1},spinPulse:{type:Boolean,default:!1},spinReverse:{type:Boolean,default:!1},widthAuto:{type:Boolean,default:!1},canvasSquare:{type:Boolean,default:!1},canvasRoomy:{type:Boolean,default:!1},gradientFill:{type:Object,default:null,validator:function(n){return typeof n.id!="string"||!n.id?(console.warn("FontAwesomeIcon: gradientFill.id must be a non-empty string"),!1):n.type!=="linear"&&n.type!=="radial"?(console.warn('FontAwesomeIcon: gradientFill.type must be "linear" or "radial"'),!1):!0}},flip360:{type:Boolean,default:!1},buzz:{type:Boolean,default:!1},float:{type:Boolean,default:!1},jello:{type:Boolean,default:!1},spinSnap:{type:Boolean,default:!1},spinSnap4:{type:Boolean,default:!1},spinSnap8:{type:Boolean,default:!1},swing:{type:Boolean,default:!1},wag:{type:Boolean,default:!1}},setup:function(n,t){var a=t.attrs,i=z(function(){return Ca(n.icon)}),l=z(function(){return an("classes",bc(n))}),c=z(function(){return an("transform",typeof n.transform=="string"?$n.transform(n.transform):n.transform)}),u=z(function(){return an("mask",Ca(n.mask))}),d=z(function(){var S=Z(Z(Z(Z({},l.value),c.value),u.value),{},{symbol:n.symbol,maskId:n.maskId});return S.title=n.title,S.titleId=n.titleId,lc(i.value,S)});Le(d,function(S){if(!S)return $a("Could not find one or more icon(s)",i.value,u.value)},{immediate:!0}),n.gradientFill&&n.symbol&&$a("gradientFill is not supported when symbol is true and will be ignored");var g=z(function(){return d.value?Hi(d.value.abstract[0],{gradientFill:n.symbol?null:n.gradientFill},a):null});return function(){return g.value}}});var Pc={prefix:"fas",iconName:"arrow-up-from-bracket",icon:[448,512,[],"e09a","M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"]};const Ic={class:"challenge-launch","aria-labelledby":"launch-title"},Ac={class:"challenge-launch__heading"},Tc={class:"builder-card__eyebrow"},Oc={id:"launch-title"},jc=["aria-label"],zc=["disabled"],Fc=["disabled"],Ec={class:"action-button__icon","aria-hidden":"true"},Lc=["src"],Nc={key:1,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},Mc=["disabled"],Dc=["disabled"],Rc={class:"action-button__icon","aria-hidden":"true"},Bc=Je({__name:"ChallengeActions",props:{ready:{type:Boolean},busyAction:{}},emits:["exercise","print","save"],setup(e,{emit:n}){const{ui:t}=lt(),a=n,i=yt("challenge-random-coach-avatar",()=>"");return St(async()=>{if(!i.value)try{const c=(await $fetch("/api/coaches")).coaches.filter(d=>d.avatarPath),u=c[Math.floor(Math.random()*c.length)];i.value=u?.avatarPath||""}catch{}}),(l,c)=>(x(),_("section",Ic,[r("div",Ac,[r("div",null,[r("p",Tc,f(o(t)("Ton défi est prêt")),1),r("h2",Oc,f(o(t)("Comment veux-tu l’utiliser ?")),1)])]),r("div",{class:"challenge-actions","aria-label":o(t)("Lancer le défi")},[r("button",{class:"action-button action-button--primary","data-tour":"action-classic",type:"button",disabled:!e.ready||!!e.busyAction,onClick:c[0]||(c[0]=u=>a("exercise","classic"))},[c[4]||(c[4]=r("span",{class:"action-button__icon","aria-hidden":"true"},"●",-1)),r("span",null,[r("strong",null,f(e.busyAction==="exercise"?o(t)("Préparation…"):o(t)("Classique")),1),r("small",null,f(o(t)("Questions et correction immédiate")),1)])],8,zc),r("button",{class:"action-button action-button--chat","data-tour":"action-coach",type:"button",disabled:!e.ready||!!e.busyAction,onClick:c[1]||(c[1]=u=>a("exercise","chat"))},[r("span",Ec,[o(i)?(x(),_("img",{key:0,src:o(i),alt:""},null,8,Lc)):(x(),_("svg",Nc,[...c[5]||(c[5]=[r("circle",{cx:"12",cy:"8",r:"4"},null,-1),r("path",{d:"M4.5 21a7.5 7.5 0 0 1 15 0"},null,-1)])]))]),r("span",null,[r("strong",null,f(e.busyAction==="exercise"?o(t)("Préparation…"):o(t)("Avec un coach")),1),r("small",null,f(o(t)("Dialogue virtuel avec une aide pas à pas")),1)])],8,Fc),r("button",{class:"action-button action-button--print","data-tour":"action-print",type:"button",disabled:!e.ready||!!e.busyAction,onClick:c[2]||(c[2]=u=>a("print"))},[c[6]||(c[6]=dr('<span class="action-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v7H6z"></path><path d="M18 12h.01"></path></svg></span>',1)),r("span",null,[r("strong",null,f(e.busyAction==="print"?o(t)("Préparation…"):o(t)("Imprimer")),1),r("small",null,f(o(t)("Les questions et le corrigé")),1)])],8,Mc),r("button",{class:"action-button action-button--share","data-tour":"action-share",type:"button",disabled:!e.ready||!!e.busyAction,onClick:c[3]||(c[3]=u=>a("save"))},[r("span",Rc,[Ge(o(Cc),{icon:o(Pc)},null,8,["icon"])]),r("span",null,[r("strong",null,f(e.busyAction==="save"?o(t)("Sauvegarde…"):o(t)("Partager")),1),r("small",null,f(o(t)("Partager ce défi avec d’autres personnes")),1)])],8,Dc)],8,jc)]))}}),Jm=Object.assign(Bc,{__name:"ChallengeActions"}),Wc=new Set(["avoir","falloir","pleuvoir","savoir"]);function Uc(e){return e.trim().toLocaleLowerCase("fr-CH")}function Vc(e){return!Wc.has(Uc(e))}const Hc=["aria-labelledby"],Kc={class:"builder-card__header"},Gc={class:"builder-card__eyebrow"},qc=["id"],Yc={class:"options-main-column"},Xc={class:"option-group-card option-group-card--questions"},Qc=["for"],Jc=["id","value"],Zc={class:"option-fieldset option-group-card option-group-card--pronouns"},eu={class:"check-row"},tu=["checked"],nu={class:"check-row"},au=["checked"],iu={class:"option-fieldset option-group-card option-group-card--exercise"},ru={class:"segmented-control"},ou=["name","checked"],su=["name","checked"],lu={key:0,class:"identification-source-panel"},cu={class:"segmented-control segmented-control--stacked"},uu=["name","checked"],fu=["name","checked"],du=["disabled"],mu={class:"segmented-control segmented-control--stacked"},pu=["name","checked"],vu=["name","checked","disabled"],gu=["name","checked","disabled"],bu={key:0,class:"field-hint"},hu={key:0,class:"complement-options__title"},yu={key:1,class:"complement-options__description"},xu=["disabled","aria-expanded","aria-controls"],wu={"aria-hidden":"true"},_u={key:3,class:"complement-options__unavailable"},ku=["id"],Su={class:"sr-only"},$u=["disabled","checked"],Cu=["disabled","checked"],Pu=["disabled","checked"],Iu=["disabled","checked"],Au={class:"conjugation-example__header"},Tu={class:"conjugation-example__heading"},Ou={class:"conjugation-example__screen"},ju={key:0,class:"conjugation-example__loading",role:"status"},zu={class:"sr-only"},Fu={key:1,class:"conjugation-example__body"},Eu={key:0,class:"conjugation-example__question"},Lu={class:"conjugation-example__block-label"},Nu={class:"conjugation-example__instruction"},Mu={key:0,class:"conjugation-example__citation"},Du={key:1,class:"conjugation-example__question-line"},Ru={class:"conjugation-example__prompt"},Bu={key:0,class:"conjugation-example__instruction"},Wu={key:1,class:"conjugation-example__question-line"},Uu={class:"conjugation-example__context"},Vu={key:0,class:"conjugation-example__correction"},Hu={key:1},Ku=Je({__name:"ChallengeOptions",props:{questionCount:{},exerciseKind:{},identificationSource:{},inclusivePronouns:{type:Boolean},includeOnPronoun:{type:Boolean},voiceMode:{},complementOptions:{},complementVerbs:{},eyebrow:{},idPrefix:{},gridLayout:{type:Boolean},conjugationInstruction:{},conjugationQuestionContext:{},conjugationQuestion:{},conjugationExample:{},conjugationExamplePrefix:{},conjugationExampleEmphasis:{},conjugationExampleSuffix:{},conjugationLiteraryCitation:{},conjugationExampleLoading:{type:Boolean},revealPrefilledOptions:{type:Boolean}},emits:["updateQuestionCount","updateExerciseKind","updateIdentificationSource","updateInclusivePronouns","updateIncludeOnPronoun","updateVoiceMode","updateComplementOptions","prefilledOptionsRevealStart"],setup(e,{emit:n}){const{ui:t}=lt(),a=e,i=n,l=te(!!a.gridLayout),c=z(()=>(a.complementVerbs??[]).filter(E=>!!E.complementExample)),u=z(()=>a.exerciseKind==="conjugation"&&a.voiceMode!=="passive"&&c.value.length>0),d=z(()=>(a.complementVerbs??[]).some(E=>!E.isPronominalForm&&Vc(E.infinitif)&&E.complementFunctions?.includes("cod"))),g=z(()=>c.value.some(E=>E.complementFunctions?.includes("cod")||E.complementExample?.functionObject==="cod")),S=z(()=>c.value.some(E=>E.complementFunctions?.includes("coi")||E.complementExample?.functionObject==="coi")),w=z(()=>c.value.some(E=>E.anteposableComplementFunctions?.includes("cod")||!!E.complementExample?.before)),T=z(()=>c.value.some(E=>E.anteposableComplementFunctions?.includes("coi"))),P=z(()=>a.idPrefix??"challenge-options"),C=z(()=>`${P.value}-title`),b=z(()=>`${P.value}-question-count`),I=z(()=>`${P.value}-exercise-kind`),y=z(()=>`${P.value}-voice-mode`),m=z(()=>`${P.value}-identification-source`),p=z(()=>`${P.value}-complement-panel`),$=z(()=>!!((a.conjugationInstruction||a.conjugationQuestionContext||a.conjugationQuestion)&&a.conjugationExample)),F=z(()=>{const E=a.conjugationQuestion?.trim()??"";return E&&!/[.!?]$/u.test(E)?`${E}.`:E}),ie=te(0),ce=[],H=te(a.questionCount),G=te([...a.complementOptions]),q=te(!1),ne=te(null);let xe,Ie,Ve,Ze;const be=[];function et(){if(Ie=void 0,!a.gridLayout||!ne.value)return;ne.value.querySelectorAll(".option-group-card, .complement-options, .conjugation-example").forEach(A=>{if(Ve?.observe(A),getComputedStyle(A).display==="none"){A.style.removeProperty("grid-row-end");return}A.style.gridRowEnd=`span ${Math.ceil(A.getBoundingClientRect().height+16)}`})}function Me(){Ie===void 0&&(Ie=requestAnimationFrame(et))}function tt(){!a.gridLayout||!ne.value||(Ve=new ResizeObserver(Me),Ze=new MutationObserver(Me),Ze.observe(ne.value,{childList:!0,subtree:!0}),window.addEventListener("resize",Me),Me())}function h(){for(xe!==void 0&&(cancelAnimationFrame(xe),xe=void 0);be.length;)clearTimeout(be.pop())}function s(){h(),H.value=a.questionCount,G.value=[...a.complementOptions],q.value=!1}function v(){if(q.value)return;if(i("prefilledOptionsRevealStart"),h(),window.matchMedia("(prefers-reduced-motion: reduce)").matches){s();return}const E=Math.max(0,a.questionCount),A=[...a.complementOptions],B=500,He=performance.now();q.value=!0,H.value=0,G.value=[];const Ke=De=>{const Ae=Math.min(1,(De-He)/B);H.value=Math.round(E*Ae),Ae<1?xe=requestAnimationFrame(Ke):xe=void 0};xe=requestAnimationFrame(Ke),A.forEach((De,Ae)=>{be.push(setTimeout(()=>{G.value=[...G.value,De]},Math.round(Ae/A.length*B)))}),be.push(setTimeout(s,B))}function L(){for(;ce.length;)clearTimeout(ce.pop())}Le(()=>a.conjugationExampleLoading,E=>{L(),ie.value=0,!E&&ce.push(setTimeout(()=>{ie.value=1},80),setTimeout(()=>{ie.value=2},280))},{immediate:!0}),Le(()=>a.questionCount,E=>{q.value||(H.value=E)}),Le(()=>a.complementOptions,E=>{q.value||(G.value=[...E])},{deep:!0}),Le(()=>a.revealPrefilledOptions,E=>{E&&v()}),St(()=>{a.revealPrefilledOptions&&v(),tt()}),In(()=>{L(),h(),Ie!==void 0&&cancelAnimationFrame(Ie),Ve?.disconnect(),Ze?.disconnect(),window.removeEventListener("resize",Me)});function U(E){q.value&&s();const A=E.target.value;if(A==="")return;const B=Number(A);Number.isFinite(B)&&i("updateQuestionCount",Math.min(99,Math.max(1,Math.round(B))))}function ue(E){const A=E.target.value;i("updateExerciseKind",A)}function ke(E,A){q.value&&s();const B=new Set(a.complementOptions);A?B.add(E):B.delete(E),i("updateComplementOptions",[...B])}return Le(u,E=>{E?a.gridLayout&&(l.value=!0):l.value=!1},{immediate:!0}),Le(d,E=>{!E&&a.voiceMode!=="active"&&i("updateVoiceMode","active")},{immediate:!0}),(E,A)=>(x(),_("section",{class:$e(["builder-card options-card",{"options-card--grid":e.gridLayout,"options-card--revealing":o(q)}]),"aria-labelledby":o(C)},[r("div",Kc,[r("div",null,[r("p",Gc,f(e.eyebrow??"Étape 3"),1),r("h2",{id:o(C)},f(o(t)("Mes options")),9,qc)])]),r("div",{ref_key:"optionsLayout",ref:ne,class:$e(["options-layout",{"options-layout--columns":e.gridLayout}])},[r("div",{class:$e(["options-fields",{"options-fields--columns":e.gridLayout}])},[r("div",Yc,[r("div",Xc,[r("label",{class:"field-stack question-count-field",for:o(b)},[r("span",null,f(o(t)("Nombre de questions")),1),r("input",{id:o(b),type:"number",inputmode:"numeric",min:"1",max:"99",step:"1",value:o(H),onInput:U},null,40,Jc)],8,Qc)]),r("fieldset",Zc,[r("legend",null,f(o(t)("Pronoms")),1),r("label",eu,[r("input",{type:"checkbox",checked:e.inclusivePronouns,onChange:A[0]||(A[0]=B=>i("updateInclusivePronouns",B.target.checked))},null,40,tu),r("span",null,[ge(f(o(t)("Inclure les pronoms"))+" ",1),A[12]||(A[12]=r("strong",null,"iel / iels",-1)),r("small",null,f(o(t)("Ils apparaîtront ponctuellement dans les questions.")),1)])]),r("label",nu,[r("input",{type:"checkbox",checked:e.includeOnPronoun,onChange:A[1]||(A[1]=B=>i("updateIncludeOnPronoun",B.target.checked))},null,40,au),r("span",null,[ge(f(o(t)("Inclure le pronom"))+" ",1),A[13]||(A[13]=r("strong",null,"on",-1)),r("small",null,f(o(t)("Il apparaîtra ponctuellement dans les questions à la troisième personne du singulier.")),1)])])]),r("fieldset",iu,[r("legend",null,f(o(t)("Type d’exercice")),1),r("div",ru,[r("label",null,[r("input",{type:"radio",name:o(I),value:"conjugation",checked:e.exerciseKind==="conjugation",onChange:ue},null,40,ou),r("span",null,f(o(t)("Conjuguer")),1)]),r("label",null,[r("input",{type:"radio",name:o(I),value:"tense-identification",checked:e.exerciseKind==="tense-identification",onChange:ue},null,40,su),r("span",null,f(o(t)("Trouver le mode et le temps")),1)])]),Ge(ft,{name:"identification-options"},{default:qe(()=>[e.exerciseKind==="tense-identification"?(x(),_("div",lu,[r("div",cu,[r("label",null,[r("input",{type:"radio",name:o(m),value:"selected-verbs",checked:e.identificationSource==="selected-verbs",onChange:A[2]||(A[2]=B=>i("updateIdentificationSource","selected-verbs"))},null,40,uu),r("span",null,[r("strong",null,f(o(t)("Avec mes verbes")),1),r("small",null,f(o(t)("Formes conjuguées simples, sans citation.")),1)])]),r("label",null,[r("input",{type:"radio",name:o(m),value:"literary-corpus",checked:e.identificationSource==="literary-corpus",onChange:A[3]||(A[3]=B=>i("updateIdentificationSource","literary-corpus"))},null,40,fu),r("span",null,[r("strong",null,f(o(t)("Avec n’importe quel verbe")),1),r("small",null,f(o(t)("Construits avec des phrases littéraires.")),1)])])])])):R("",!0)]),_:1})]),r("fieldset",{class:$e(["option-fieldset option-group-card option-group-card--voice voice-mode-fieldset",{"option-group-card--disabled":e.exerciseKind!=="conjugation"}]),disabled:e.exerciseKind!=="conjugation"},[r("legend",null,f(o(t)("Voix du verbe")),1),r("div",mu,[r("label",null,[r("input",{type:"radio",name:o(y),value:"active",checked:e.voiceMode==="active",onChange:A[4]||(A[4]=B=>i("updateVoiceMode","active"))},null,40,pu),r("span",null,[r("strong",null,f(o(t)("Active uniquement")),1)])]),r("label",null,[r("input",{type:"radio",name:o(y),value:"passive",checked:e.voiceMode==="passive",disabled:!o(d),onChange:A[5]||(A[5]=B=>i("updateVoiceMode","passive"))},null,40,vu),r("span",null,[r("strong",null,f(o(t)("Passive uniquement")),1),r("small",null,f(o(t)("Le COD devient le sujet de la phrase.")),1)])]),r("label",null,[r("input",{type:"radio",name:o(y),value:"mixed",checked:e.voiceMode==="mixed",disabled:!o(d),onChange:A[6]||(A[6]=B=>i("updateVoiceMode","mixed"))},null,40,gu),r("span",null,[r("strong",null,f(o(t)("Active et passive")),1),r("small",null,f(o(t)("Les deux voix alterneront dans le défi.")),1)])])]),o(d)?R("",!0):(x(),_("small",bu,f(o(t)("Aucun verbe sélectionné ne possède de COD validé.")),1))],10,du)]),r("div",{class:$e(["complement-options",{"complement-options--disabled":!o(u)}]),"data-tour":"options-complements"},[e.gridLayout?(x(),_("h3",hu,f(o(t)("Compléments d’objets :")),1)):R("",!0),e.gridLayout?(x(),_("p",yu,f(o(t)("Ajoute des compléments d’objets directs ou indirects.")),1)):(x(),_("button",{key:2,class:"complement-options__trigger",type:"button",disabled:!o(u),"aria-expanded":o(l),"aria-controls":o(p),onClick:A[7]||(A[7]=B=>l.value=!o(l))},[r("span",null,[ge(f(o(t)("Compléments d’objets :"))+" ",1),r("small",null,f(o(t)("nouveau")),1)]),r("span",wu,f(o(l)?"−":"+"),1)],8,xu)),o(u)?R("",!0):(x(),_("p",_u,f(e.exerciseKind!=="conjugation"?o(t)("Disponible uniquement pour un exercice de conjugaison."):e.voiceMode==="passive"?o(t)("Au passif, le COD devient le sujet : ces options ne s’appliquent pas."):o(t)("Les verbes choisis ne proposent pas de complément.")),1)),Ge(ft,{name:"complement-panel"},{default:qe(()=>[e.gridLayout||o(l)?(x(),_("fieldset",{key:0,id:o(p),class:"complement-options__panel"},[r("legend",Su,f(o(t)("Présentation des compléments d’objets")),1),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(g),checked:o(G).includes("cod-after"),onChange:A[8]||(A[8]=B=>ke("cod-after",B.target.checked))},null,40,$u),r("span",null,[r("strong",null,f(o(t)("COD placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(w),checked:o(G).includes("cod-before"),onChange:A[9]||(A[9]=B=>ke("cod-before",B.target.checked))},null,40,Cu),r("span",null,[r("strong",null,f(o(t)("COD placé avant")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(S),checked:o(G).includes("coi-after"),onChange:A[10]||(A[10]=B=>ke("coi-after",B.target.checked))},null,40,Pu),r("span",null,[r("strong",null,f(o(t)("COI placé après")),1)])]),r("label",null,[r("input",{type:"checkbox",disabled:!o(u)||!o(T),checked:o(G).includes("coi-before"),onChange:A[11]||(A[11]=B=>ke("coi-before",B.target.checked))},null,40,Iu),r("span",null,[r("strong",null,f(o(t)("COI placé avant")),1)])])],8,ku)):R("",!0)]),_:1})],2)],2),e.gridLayout&&(e.conjugationExampleLoading||o($))?(x(),_("div",{key:0,class:$e(["conjugation-example",{"conjugation-example--wide":e.exerciseKind==="tense-identification"}]),"data-tour":"options-preview","aria-live":"polite","aria-atomic":"true"},[r("div",Au,[A[14]||(A[14]=r("span",{class:"conjugation-example__preview-icon","aria-hidden":"true"},[r("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"},[r("path",{d:"M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z"}),r("circle",{cx:"12",cy:"12",r:"3"})])],-1)),r("div",Tu,[r("span",null,f(o(t)("Aperçu d’une question")),1)])]),r("div",Ou,[e.conjugationExampleLoading?(x(),_("div",ju,[A[15]||(A[15]=r("span",{class:"conjugation-example__spinner","aria-hidden":"true"},null,-1)),r("span",zu,f(o(t)("Préparation de l’aperçu")),1)])):(x(),_("div",Fu,[Ge(ft,{name:"example-item"},{default:qe(()=>[o(ie)>=1?(x(),_("div",Eu,[r("span",Lu,f(o(t)("Exemple de question")),1),e.exerciseKind==="tense-identification"&&e.conjugationInstruction&&e.conjugationQuestion?(x(),_(ee,{key:0},[r("p",Nu,f(e.conjugationInstruction),1),e.conjugationLiteraryCitation?(x(),_("blockquote",Mu,[r("p",null,[r("span",null,f(e.conjugationLiteraryCitation.before),1),r("mark",null,f(e.conjugationLiteraryCitation.target),1),r("span",null,f(e.conjugationLiteraryCitation.after),1)]),r("footer",null,[ge(f(e.conjugationLiteraryCitation.author)+", ",1),r("cite",null,f(e.conjugationLiteraryCitation.work),1)])])):(x(),_("p",Du,[r("span",Ru,f(o(F)),1)]))],64)):(x(),_(ee,{key:1},[e.conjugationInstruction?(x(),_("p",Bu,f(e.conjugationInstruction),1)):R("",!0),e.conjugationQuestionContext?(x(),_("p",Wu,[r("span",Uu,f(e.conjugationQuestionContext),1)])):R("",!0)],64))])):R("",!0)]),_:1}),Ge(ft,{name:"example-item"},{default:qe(()=>[o(ie)>=2?(x(),_("div",Vu,[r("span",null,f(o(t)("Réponse attendue")),1),r("p",null,[e.conjugationExampleEmphasis?(x(),_(ee,{key:0},[r("span",null,f(e.conjugationExamplePrefix),1),r("strong",null,f(e.conjugationExampleEmphasis),1),r("span",null,f(e.conjugationExampleSuffix),1)],64)):(x(),_("span",Hu,f(e.conjugationExample),1))])])):R("",!0)]),_:1})]))])],2)):R("",!0)],2)],10,Hc))}}),Zm=Object.assign(Vt(Ku,[["__scopeId","data-v-840fae66"]]),{__name:"ChallengeOptions"}),Gu=["aria-labelledby","aria-label"],qu={key:0,class:"preset-browser"},Yu={class:"preset-browser__columns"},Xu={class:"preset-browser__column","data-browser-column":"1","aria-labelledby":"preset-browser-groups"},Qu={id:"preset-browser-groups"},Ju={class:"preset-browser__list"},Zu=["aria-pressed","onClick"],ef=["aria-label"],tf={class:"preset-browser__list"},nf={class:"preset-browser__info","data-preset-info":""},af=["aria-expanded","aria-controls","aria-label","onMouseenter","onClick"],rf=["id"],of={class:"preset-browser__tooltip-section"},sf={class:"preset-browser__verb-badges"},lf={key:0,class:"preset-browser__other-verbs"},cf={class:"preset-browser__tooltip-section"},uf=["aria-pressed","onClick"],ff=["aria-label"],df={class:"preset-browser__list"},mf={class:"preset-browser__count"},pf={class:"preset-panel__intro"},vf={class:"builder-card__eyebrow"},gf={id:"presets-title"},bf={class:"preset-mobile-select"},hf=["value"],yf={value:""},xf=["label"],wf=["value"],_f=["aria-label"],kf=["id","aria-selected","aria-controls","tabindex","onClick","onKeydown"],Sf=["id","aria-labelledby"],$f=["onClick"],Cf={key:0,class:"preset-card__random"},Pf=["onClick"],If=["onClick"],Af=["onClick"],Tf=Je({__name:"PresetPicker",props:{presets:{},activePresetId:{},compact:{type:Boolean},verbs:{},modes:{},tenses:{}},emits:["select","stageChange"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=lt(),{track:i}=za(),l=e,c=n,u=z(()=>{const h=new Map;return l.presets.forEach(s=>{const v=h.get(s.group)??[];v.push(s),h.set(s.group,v)}),[...h.entries()].map(([s,v])=>({id:s,label:v[0]?.groupLabel??Oa[s]??s,order:v[0]?.groupOrder??fr.indexOf(s),presets:v})).sort((s,v)=>s.order-v.order||s.label.localeCompare(v.label,"fr"))}),d=te("school"),g=z(()=>u.value.find(h=>h.id===d.value)??u.value[0]),S=te(""),w=z(()=>l.presets.find(h=>h.id===S.value)),T=te(null),P=te(null),C=z(()=>u.value.find(h=>h.id===T.value)),b=z(()=>l.presets.find(h=>h.id===P.value)),I=te(null),y=te(null),m=te(null),p=new Set,$=z(()=>new Map((l.verbs??[]).map(h=>[h.id,h.infinitif]))),F=z(()=>new Map((l.tenses??[]).map(h=>[h.id,h]))),ie=z(()=>new Map((l.modes??[]).map(h=>[h.id,h])));function ce(h){return y.value===h||m.value===h}function H(h){return h.verbIds.slice(0,12).map(s=>$.value.get(s)??`Verbe ${s}`)}function G(h){const s=new Map;for(const v of h.tenseIds){const L=F.value.get(v);if(!L)continue;const U=ie.value.get(L.modeId),ue=s.get(L.modeId)??{mode:a(U?.name??L.mode?.name??t("Autres temps")),order:U?.order??L.mode?.order??Number.MAX_SAFE_INTEGER,tenses:[]};ue.tenses.push(a(L.name)),s.set(L.modeId,ue)}return[...s.values()].sort((v,L)=>v.order-L.order||v.mode.localeCompare(L.mode,"fr"))}function q(h){m.value=m.value===h?null:h}function ne(h){h.target?.closest("[data-preset-info]")||(m.value=null)}St(()=>document.addEventListener("pointerdown",ne)),In(()=>document.removeEventListener("pointerdown",ne));function xe(h){for(const s of h)p.has(s.id)||(p.add(s.id),i("feature_exposed",{feature:"preset",item:s.id}))}Le([()=>l.compact,g,C],([h,s,v])=>{if(h){v&&xe(v.presets);return}s&&xe(s.presets)},{immediate:!0});function Ie(h){on(()=>{const s=I.value;if(!s||s.scrollWidth<=s.clientWidth+1)return;s.querySelector(`[data-browser-column="${h}"]`)?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"end"})})}function Ve(h){T.value=h,P.value=null,m.value=null,y.value=null,c("stageChange","presets"),Ie(2)}function Ze(h){P.value=h,Ie(3)}function be(h,s){P.value=null,c("select",h,s)}function et(h){S.value=h.target.value,w.value&&c("select",w.value)}function Me(h,s){let v;if((h.key==="ArrowRight"||h.key==="ArrowDown")&&(v=(s+1)%u.value.length),(h.key==="ArrowLeft"||h.key==="ArrowUp")&&(v=(s-1+u.value.length)%u.value.length),h.key==="Home"&&(v=0),h.key==="End"&&(v=u.value.length-1),v===void 0)return;h.preventDefault();const L=u.value[v];L&&(d.value=L.id,on(()=>document.getElementById(`preset-tab-${L.id}`)?.focus()))}function tt(h,s){c("select",h,Math.min(s,h.verbIds.length))}return(h,s)=>(x(),_("section",{class:$e(["preset-panel",{"preset-panel--compact":e.compact}]),"aria-labelledby":e.compact?void 0:"presets-title","aria-label":e.compact?"Défis prêts à l’emploi":void 0},[e.compact?(x(),_("div",qu,[r("div",{ref_key:"compactBrowser",ref:I,class:"preset-browser__scroll"},[r("div",Yu,[r("section",Xu,[r("h3",Qu,f(o(t)("Catégories")),1),r("div",Ju,[(x(!0),_(ee,null,ye(o(u),v=>(x(),_("button",{key:v.id,type:"button",class:$e({"is-selected":o(T)===v.id}),"aria-pressed":o(T)===v.id,onClick:L=>Ve(v.id)},[r("span",null,f(v.label),1),s[7]||(s[7]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,Zu))),128))])]),Ge(ft,{name:"browser-column"},{default:qe(()=>[o(C)?(x(),_("section",{key:o(C).id,class:"preset-browser__column","data-browser-column":"2","aria-label":`Défis de ${o(C).label}`},[r("div",tf,[(x(!0),_(ee,null,ye(o(C).presets,v=>(x(),_("div",{key:v.id,class:"preset-browser__preset-row"},[r("div",nf,[r("button",{class:"preset-browser__info-button",type:"button","aria-expanded":ce(v.id),"aria-controls":`preset-info-${v.id}`,"aria-label":`Informations sur ${v.label}`,onMouseenter:L=>y.value=v.id,onMouseleave:s[0]||(s[0]=L=>y.value=null),onClick:Mt(L=>q(v.id),["stop"])},"i",40,af),ce(v.id)?(x(),_("section",{key:0,id:`preset-info-${v.id}`,class:"preset-browser__tooltip","aria-live":"polite"},[r("header",null,[r("strong",null,f(v.label),1),r("span",null,f(v.questionCount)+" "+f(o(t)("questions")),1)]),r("div",of,[r("h4",null,f(o(t)("Verbes")),1),r("div",sf,[(x(!0),_(ee,null,ye(H(v),L=>(x(),_("span",{key:L},f(L),1))),128))]),v.verbIds.length>12?(x(),_("p",lf,"+ "+f(v.verbIds.length-12)+" "+f(o(t)("autres verbes")),1)):R("",!0)]),r("div",cf,[r("h4",null,f(o(t)("Temps")),1),r("dl",null,[(x(!0),_(ee,null,ye(G(v),L=>(x(),_("div",{key:L.mode},[r("dt",null,f(L.mode),1),r("dd",null,f(L.tenses.join(", ")),1)]))),128))])])],8,rf)):R("",!0)]),r("button",{class:$e(["preset-browser__preset-button",{"is-selected":o(P)===v.id||e.activePresetId===v.id}]),type:"button","aria-pressed":o(P)===v.id,onClick:L=>Ze(v.id)},[r("span",null,[r("strong",null,f(v.label),1)]),s[8]||(s[8]=r("span",{class:"preset-browser__chevron","aria-hidden":"true"},"›",-1))],10,uf)]))),128))])],8,ef)):R("",!0)]),_:1}),Ge(ft,{name:"browser-column"},{default:qe(()=>[o(b)?(x(),_("section",{key:o(b).id,class:"preset-browser__column preset-browser__column--quantity","data-browser-column":"3","aria-label":o(t)("Choisir le nombre de verbes")},[r("div",df,[r("button",{type:"button",onClick:s[1]||(s[1]=v=>be(o(b)))},[r("span",null,[r("strong",null,f(o(t)("Tous les verbes")),1)]),r("span",mf,f(o(b).verbIds.length),1),s[9]||(s[9]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))]),s[20]||(s[20]=r("span",{class:"preset-browser__quantity-separator","aria-hidden":"true"},null,-1)),o(b).verbIds.length>=1&&o(b).verbIds.length<5?(x(),_("button",{key:0,type:"button",onClick:s[2]||(s[2]=v=>be(o(b),1))},[r("span",null,[r("strong",null,f(o(t)("1 au hasard")),1)]),s[10]||(s[10]=r("span",{class:"preset-browser__count"},"1",-1)),s[11]||(s[11]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):R("",!0),o(b).verbIds.length>=2&&o(b).verbIds.length<5?(x(),_("button",{key:1,type:"button",onClick:s[3]||(s[3]=v=>be(o(b),2))},[r("span",null,[r("strong",null,f(o(t)("2 au hasard")),1)]),s[12]||(s[12]=r("span",{class:"preset-browser__count"},"2",-1)),s[13]||(s[13]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):R("",!0),o(b).verbIds.length>=3?(x(),_("button",{key:2,type:"button",onClick:s[4]||(s[4]=v=>be(o(b),3))},[r("span",null,[r("strong",null,f(o(t)("3 au hasard")),1)]),s[14]||(s[14]=r("span",{class:"preset-browser__count"},"3",-1)),s[15]||(s[15]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):R("",!0),o(b).verbIds.length>=5?(x(),_("button",{key:3,type:"button",onClick:s[5]||(s[5]=v=>be(o(b),5))},[r("span",null,[r("strong",null,f(o(t)("5 au hasard")),1)]),s[16]||(s[16]=r("span",{class:"preset-browser__count"},"5",-1)),s[17]||(s[17]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):R("",!0),o(b).verbIds.length>=10?(x(),_("button",{key:4,type:"button",onClick:s[6]||(s[6]=v=>be(o(b),10))},[r("span",null,[r("strong",null,f(o(t)("10 au hasard")),1)]),s[18]||(s[18]=r("span",{class:"preset-browser__count"},"10",-1)),s[19]||(s[19]=r("span",{class:"preset-browser__launch","aria-hidden":"true"},"→",-1))])):R("",!0)])],8,ff)):R("",!0)]),_:1})])],512)])):(x(),_(ee,{key:1},[r("div",pf,[r("div",null,[r("p",vf,f(o(t)("Pour démarrer rapidement")),1),r("h2",gf,f(o(t)("Défis prêts à l’emploi")),1)]),r("p",null,f(o(t)("Choisissez un niveau ou une famille de verbes, puis ajustez librement la sélection.")),1)]),r("label",bf,[r("span",null,f(o(t)("Choisir un défi prêt à l’emploi")),1),r("select",{value:e.activePresetId??o(S),onChange:et},[r("option",yf,f(o(t)("Choisir un niveau ou un entraînement…")),1),(x(!0),_(ee,null,ye(o(u),v=>(x(),_("optgroup",{key:v.id,label:v.label},[(x(!0),_(ee,null,ye(v.presets,L=>(x(),_("option",{key:L.id,value:L.id},f(L.label)+" — "+f(L.verbIds.length)+" "+f(o(t)("verbes")),9,wf))),128))],8,xf))),128))],40,hf)]),r("div",{class:"preset-groups",role:"tablist","aria-label":o(t)("Catégories de défis")},[(x(!0),_(ee,null,ye(o(u),(v,L)=>(x(),_("button",{id:`preset-tab-${v.id}`,key:v.id,class:$e(["preset-group-button",{"preset-group-button--active":o(g)?.id===v.id}]),type:"button",role:"tab","aria-selected":o(g)?.id===v.id,"aria-controls":`preset-content-${v.id}`,tabindex:o(g)?.id===v.id?0:-1,onClick:U=>d.value=v.id,onKeydown:U=>Me(U,L)},f(v.label),43,kf))),128))],8,_f),o(g)?(x(),_("div",{key:0,id:`preset-content-${o(g).id}`,class:"preset-list",role:"tabpanel","aria-labelledby":`preset-tab-${o(g).id}`},[(x(!0),_(ee,null,ye(o(g).presets,v=>(x(),_("article",{key:v.id,class:$e(["preset-card",{"preset-card--active":e.activePresetId===v.id}])},[r("button",{type:"button",onClick:L=>c("select",v)},[r("strong",null,f(v.label),1),r("span",null,f(v.description),1),r("small",null,f(v.verbIds.length)+" verbes · "+f(v.questionCount)+" "+f(o(t)("questions")),1)],8,$f),v.verbIds.length>5?(x(),_("div",Cf,[ge(f(o(t)("Au hasard :"))+" ",1),r("button",{type:"button",onClick:L=>tt(v,1)},"1",8,Pf),r("button",{type:"button",onClick:L=>tt(v,5)},"5",8,If),r("button",{type:"button",onClick:L=>tt(v,10)},"10",8,Af)])):R("",!0)],2))),128))],8,Sf)):R("",!0)],64))],10,Gu))}}),ep=Object.assign(Vt(Tf,[["__scopeId","data-v-405192b2"]]),{__name:"ChallengePresetPicker"}),Pa="Quel est le mode et le temps de cette forme conjuguée ?";function Pn(e,n){const t=String(e||"").split(/\r?\n/u);return Math.max(1,t.reduce((a,i)=>{const l=i.replace(/\s+/g," ").trim();return a+Math.max(1,Math.ceil(l.length/n))},0))}function Of(e,n=8){return 5+n+(Pn(e,86)-1)*5}function Ia(e,n){return 8+(Math.max(Pn(e,54),Pn(n,38))-1)*5}function Aa(e,n,t,a){const i=[];let l=[],c=0,u=n;return e.forEach((d,g)=>{const S=Math.max(1,a(d));l.length>0&&c+S>u&&(i.push(l),l=[],c=0,u=t),l.push({item:d,index:g}),c+=S}),l.length>0&&i.push(l),i}const Gi=".................................",jf="......................................",zf=32;function Ff(e,n){return n.mode?.trim().toLocaleLowerCase("fr-CH")!=="subjonctif"||n.complementPosition==="before"||/^(?:que|qu['’])\s*/iu.test(e)?e:`que ${e}`.replace(/^que (i(?:l|ls|el|els)|elle?s?|on)\b/iu,"qu'$1")}function Ef(e){return e.replace(/[.*+?^${}()|[\]\\]/gu,"\\$&")}function Lf(e,n){const t=n.pronom?.trim()||"",a=[n.saisiePrefixe?.trim(),t.toLocaleLowerCase("fr-CH")==="je"?"j'":"",t].filter(i=>!!i).sort((i,l)=>l.length-i.length);for(const i of a){const l=new RegExp(`${Ef(i).replace(/[’']/gu,"[’']")}\\s*$`,"iu");if(l.test(e))return e.replace(l,"").trim()}return e.trim()}function Nf(e,n){const t=Ff(e.trim(),n),[a="",...i]=t.split("…"),l=i.join("…").trim(),u=n.mode?.trim().toLocaleLowerCase("fr-CH")==="impératif"&&!l.endsWith("!")?`${l}${l?" ":""}!`:l,g=hr(n)?Lf(a.trim(),n):n.complementPosition!=="before"&&n.saisiePrefixe!==void 0?n.saisiePrefixe.trim():a.trim(),S=Gi,w=u.length>zf,T=w?Math.max(32,Math.min(58,72-Math.round(u.length*.65))):100;return{completionPrefix:g,completionSuffix:u,fillBlank:t.includes("…")||i.length===0,suffixOnNextLine:w,blankWidthPercent:T,completion:[g,S,u].filter(Boolean).join(" ")}}function it(e,n){if(n==="tense-identification"){const u=e.literaryCitation?`${e.literaryCitation.before}【${e.literaryCitation.target}】${e.literaryCitation.after} — ${e.literaryCitation.author}, ${e.literaryCitation.work}`:e.consigne;return{label:"",completion:u,completionPrefix:u,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100}}if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="gérondif"){const u=e.infinitif||e.titre,d=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${u} | ${d} :`,completion:`en ${jf}`,completionPrefix:"en",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}if(e.mode?.trim().toLocaleLowerCase("fr-CH")==="participe"){const u=e.infinitif||e.titre,d=[e.temps,`(${e.mode})`].filter(Boolean).join(" ");return{label:`${u} | ${d} :`,completion:Gi,completionPrefix:"",completionSuffix:"",fillBlank:!0,suffixOnNextLine:!1,blankWidthPercent:100}}const t=e.consigne.split("|").map(u=>u.trim());if(t.length<3)return{label:"",completion:e.consigne,completionPrefix:e.consigne,completionSuffix:"",fillBlank:!1,suffixOnNextLine:!1,blankWidthPercent:100};const a=t.slice(0,-2).join(" | "),i=t.at(-2)||e.infinitif||"",l=t.at(-1)||[e.temps,e.mode?`(${e.mode})`:""].filter(Boolean).join(" "),c=Nf(a,e);return{label:`${e.pronom?`${e.pronom} | `:""}${i} | ${l} :`,...c}}function Mf(e,n){const t=it(e,n);return[t.label,t.completion].filter(Boolean).join(" ")}function Nt(e){const n=[...new Set(e.reponsesPourCorrige.map(t=>t.trim()).filter(Boolean))];return e.isCompound&&n.length>1?n.slice(0,1):n}function rn(e,n){if(["gérondif","participe"].includes(e.mode?.trim().toLocaleLowerCase("fr-CH")||""))return e.consigne;const t=it(e,n);return t.label||t.completion}function Ta(e){return Nt(e).join(`
`)}const Df={ref:"print-dialog",class:"print-overlay","data-tour":"print-preview",role:"dialog","aria-modal":"true","aria-labelledby":"print-preview-title",tabindex:"-1"},Rf={class:"print-toolbar no-print"},Bf={id:"print-preview-title"},Wf=["disabled"],Uf=["disabled"],Vf={class:"print-preview-layout"},Hf={class:"print-settings no-print","data-tour":"print-settings","aria-labelledby":"print-settings-title"},Kf={class:"print-settings__heading"},Gf={id:"print-settings-title"},qf={class:"print-settings__field",for:"preview-print-title"},Yf=["value"],Xf={class:"print-settings__group"},Qf={class:"print-settings__number-field",for:"preview-title-spacing"},Jf=["value"],Zf={class:"print-settings__number-field",for:"preview-question-spacing"},ed=["value"],td={class:"print-settings__group"},nd=["checked"],ad=["checked"],id=["checked"],rd=["checked"],od={class:"print-settings__group"},sd=["checked"],ld=["checked"],cd=["checked"],ud={class:"print-document print-document--pdf"},fd=["src","title"],dd={key:1,class:"pdf-preview-state",role:"status","aria-live":"polite"},md={key:2,class:"pdf-preview-state pdf-preview-state--error",role:"alert"},pd=Je({__name:"PrintPreview",props:{questions:{},verbs:{},tenses:{},exerciseKind:{},options:{}},emits:["close","updateOptions"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=lt(),i=e,l=n,{track:c}=za(),u=Math.floor(Math.random()*9e3)+1e3,d=Dt("print-dialog"),g=te(!1),S=te(!1),w=te(!0),T=te(!1),P=te(""),C=te("");let b=0,I;function y(h,s,v,L){const U=Number(h);return Number.isFinite(U)?Math.min(L,Math.max(v,U)):s}const m=z(()=>y(i.options.questionSpacingMm,8,2,15)),p=z(()=>y(i.options.titleSpacingMm,30,8,30)),$=z(()=>i.exerciseKind==="tense-identification"),F=z(()=>8+Math.max(0,5-m.value)),ie=z(()=>{let h=226;return(i.options.showFirstName||i.options.showLastName||i.options.showDate)&&(h-=Math.max(0,p.value-1)),i.options.showVerbs&&(h-=8),i.options.showTenses&&(h-=8),$.value?h-=19:h-=6,h}),ce=z(()=>Aa(i.questions,ie.value,220,h=>{const s=it(h,i.exerciseKind);return Of(Mf(h,i.exerciseKind),m.value)+(s.suffixOnNextLine?6:0)+($.value?F.value:0)+(h.literaryCitation?4:0)})),H=z(()=>Aa(i.questions,205,220,h=>$.value?Ia("",Ta(h)):Ia(rn(h,i.exerciseKind),Ta(h))));Fa(d,()=>l("close"));function G(h,s){l("updateOptions",{...i.options,[h]:s})}function q(h){return String(h??"").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/…/g,"...").replace(/–|—/g,"-").replace(/【/g,"[").replace(/】/g,"]")}function ne(h){return String(h??"").replace(new RegExp("^(\\s*)(\\p{L})","u"),(s,v,L)=>`${v}${L.toLocaleUpperCase("fr-CH")}`)}function xe(h){return String(h??"").split(`
`).map(ne).join(`
`)}function Ie(){return`${(i.options.title||t("Défi de conjugaison")).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"")||"defi-conjugaison"}.pdf`}async function Ve(){const{jsPDF:h}=await Un(async()=>{const{jsPDF:M}=await import("./wP1oTXDV.js").then(V=>V.j);return{jsPDF:M}},__vite__mapDeps([0,1,2]),import.meta.url),s=new h({orientation:"portrait",unit:"mm",format:"a4",compress:!0}),v=210,L=297,U=17,ue=193,ke=q(i.options.title||t("Défi de conjugaison")),E=i.options.showRandomNumber?` n° ${u}`:"";let A=0;function B(){A>0&&s.addPage("a4","portrait"),A+=1}function He(){s.setFont("helvetica","normal"),s.setFontSize(8),s.setTextColor(105,105,105),s.text("conjugaison.tatitotu.ch",v/2,L-8,{align:"center"}),s.setTextColor(20,20,20)}function Ke(M){if(M)return s.setFont("helvetica","normal"),s.setFontSize(8.5),s.setTextColor(90,90,90),s.text(`${ke}${E}`,v/2,12,{align:"center"}),s.setTextColor(20,20,20),32;let V=18;const D=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean);D.length&&(s.setFont("helvetica","normal"),s.setFontSize(8.5),s.text(q(D.join("     ")),U,V),V+=p.value),i.options.showGrade&&(s.setDrawColor(40,40,40),s.rect(ue-17,15,17,17)),s.setFont("helvetica","bold"),s.setFontSize(17);const fe=`${ke}${E}`,de=s.splitTextToSize(fe.toUpperCase(),150);if(s.text(de,U,V+8),V+=de.length*7+10,s.setFontSize(9),i.options.showVerbs){const K=s.splitTextToSize(`Verbes : ${q(i.verbs.map(N=>N.infinitif).join(", "))}`,176);s.text(K,U,V),V+=K.length*4.5+2}if(i.options.showTenses){const K=s.splitTextToSize(`${t("Temps :")} ${q(i.tenses.map(N=>a(N.name)).join(", "))}`,176);s.text(K,U,V),V+=K.length*4.5+2}return $.value&&(s.setDrawColor(120,120,120),s.rect(U,V,176,10),s.text(Pa,U+3,V+6),V+=21),V+($.value?2:8)}function De(M){return M?(s.setFont("helvetica","normal"),s.setFontSize(8.5),s.setTextColor(90,90,90),s.text(`${ke} - corrigé${E}`,v/2,12,{align:"center"}),s.setTextColor(20,20,20),32):(s.setFont("helvetica","bold"),s.setFontSize(17),s.setTextColor(20,20,20),s.text(`${t("CORRIGÉ")}${E}`,U,26),38)}function Ae(M,V){const D=M.literaryCitation;if(!D)return null;const fe=q(D.before).replace(/\s+/gu," "),de=q(D.target).replace(/\s+/gu," "),K=q(D.after).replace(/\s+/gu," "),N=ne(`${fe}${de}${K}`),he=q(`- ${D.author}, ${D.work}`),re=fe.length,ae=re+de.length;let we=0;const ve=s.splitTextToSize(N,V).map(nt=>{const oe=N.indexOf(nt,we),Se=oe>=0?oe:we;return we=Se+nt.length,{text:nt,start:Se}}),Y=s.getFontSize(),me=s.getFont().fontStyle;s.setFont("helvetica","italic"),s.setFontSize(8.3);const Te=s.splitTextToSize(he,V);return s.setFont("helvetica",me),s.setFontSize(Y),{lines:ve,sourceLines:Te,targetStart:re,targetEnd:ae,height:ve.length*5+Te.length*4}}function Xt(M,V,D){M.lines.forEach((K,N)=>{const he=D+N*5;s.text(K.text,V,he);const re=Math.max(K.start,M.targetStart),ae=Math.min(K.start+K.text.length,M.targetEnd);if(ae<=re)return;const we=K.text.slice(0,re-K.start),ve=K.text.slice(re-K.start,ae-K.start),Y=V+s.getTextWidth(we);s.setDrawColor(25,25,25),s.setLineWidth(.25),s.line(Y,he+.8,Y+s.getTextWidth(ve),he+.8)});const fe=s.getFontSize(),de=s.getFont().fontStyle;s.setFont("helvetica","italic"),s.setFontSize(8.3),s.setTextColor(90,90,90),M.sourceLines.forEach((K,N)=>{s.text(K,V,D+M.lines.length*5+N*4)}),s.setTextColor(20,20,20),s.setFont("helvetica",de),s.setFontSize(fe)}function gt(M,V){B();let D=Ke(V);s.setFontSize(10.5),M.forEach(({item:fe,index:de})=>{const K=`${de+1}. `,N=it(fe,i.exerciseKind);s.setFont("helvetica","normal");const he=s.splitTextToSize(q(ne(N.label)),68),re=N.label?96:169,ae=Ae(fe,re),we=ae?[...ae.lines.map(je=>je.text),...ae.sourceLines]:N.fillBlank?[q(ne(N.completion))]:s.splitTextToSize(q(ne(N.completion)),re),ve=N.label?96:U+7,Y=q(ne(N.completionPrefix)),me=q(N.completionSuffix),Te=ve+(Y?s.getTextWidth(Y)+2:0),nt=ue-(!N.suffixOnNextLine&&me?s.getTextWidth(me)+2:0),oe=N.suffixOnNextLine?ve+re*(N.blankWidthPercent/100):nt;let Se="",Oe=[];if(N.suffixOnNextLine&&me){const je=oe+2,se=Math.max(0,ue-je),ze=me.split(/\s+/u).filter(Boolean),Fe=[];for(;ze.length;){const It=[...Fe,ze[0]].join(" ");if(Fe.length&&s.getTextWidth(It)>se||!Fe.length&&s.getTextWidth(It)>se)break;Fe.push(ze.shift())}Se=Fe.join(" "),Oe=ze.length?s.splitTextToSize(ze.join(" "),re):[]}const ct=N.suffixOnNextLine?1+Oe.length:we.length,at=Math.max(he.length,ct);if(s.text(K,U,D),N.label&&s.text(he,U+7,D),N.fillBlank?(Y&&s.text(Y,ve,D),me&&!N.suffixOnNextLine&&s.text(me,ue,D,{align:"right"}),oe>Te&&(s.setLineDashPattern([.7,.7],0),s.setDrawColor(55,55,55),s.line(Te,D+.8,oe,D+.8),s.setLineDashPattern([],0)),N.suffixOnNextLine&&(Se&&s.text(Se,oe+2,D),Oe.forEach((je,se)=>{s.text(je,ve,D+5+se*5)}))):ae?Xt(ae,ve,D):s.text(we,ve,D),$.value){const je=ae?ae.height:at*5,se=D+je+2,ze=q(t("Mode :")),Fe=q(t("Temps :"));s.setFont("helvetica","bold"),s.setFontSize(9.5),s.setTextColor(70,70,70),s.text(ze,U+7,se),s.text(Fe,108,se),s.setLineDashPattern([.65,.65],0),s.setDrawColor(105,105,105),s.line(U+7+s.getTextWidth(ze)+2,se+.7,101,se+.7),s.line(108+s.getTextWidth(Fe)+2,se+.7,ue,se+.7),s.setLineDashPattern([],0),s.setTextColor(20,20,20),s.setFontSize(10.5),D+=je+8+Math.max(5,m.value)}else D+=Math.max(5+m.value,at*5+m.value)}),He()}function bt(M,V){B();let D=De(V);s.setFontSize(9.5),M.forEach(({item:fe,index:de})=>{const K=Nt(fe).flatMap(me=>s.splitTextToSize(q(xe(me)),$.value?169:82)),N=K.length*5;if($.value){const me=Math.max(9,N+4),Te=D+Math.max(0,(me-N)/2);s.setFont("helvetica","normal"),s.text(`${de+1}.`,U,Te,{baseline:"top"}),s.setFont("helvetica","bold"),s.text(K,U+10,Te,{baseline:"top"}),s.setDrawColor(225,225,225),s.line(U,D+me,ue,D+me),D+=me;return}const he=s.splitTextToSize(q(ne(rn(fe,i.exerciseKind))),79),re=he.length*5,ae=Math.max(8,Math.max(re,N)+3),we=D+Math.max(0,(ae-5)/2),ve=D+Math.max(0,(ae-re)/2),Y=D+Math.max(0,(ae-N)/2);s.setFont("helvetica","normal"),s.text(`${de+1}.`,U,we,{baseline:"top"}),s.text(he,U+7,ve,{baseline:"top"}),s.setFont("helvetica","bold"),s.text(K,106,Y,{baseline:"top"}),s.setDrawColor(220,220,220),s.line(U,D+ae,ue,D+ae),D+=ae}),He()}return ce.value.forEach((M,V)=>gt(M,V>0)),H.value.forEach((M,V)=>bt(M,V>0)),s}async function Ze(){if(!g.value){c("feature_selected",{feature:"download.pdf"}),g.value=!0;try{(await Ve()).save(Ie()),c("pdf_downloaded",{exerciseKind:i.exerciseKind})}catch{c("feature_failed",{feature:"download.pdf"})}finally{g.value=!1}}}function be(){P.value&&(URL.revokeObjectURL(P.value),P.value="")}async function et(){const h=++b;w.value=!0,T.value=!1,C.value="";try{const v=(await Ve()).output("blob");if(h!==b)return;be(),P.value=URL.createObjectURL(v)}catch(s){if(h!==b)return;console.error(t("Impossible de générer l’aperçu PDF."),s),C.value=t("L’aperçu PDF n’a pas pu être créé.")}finally{h===b&&(w.value=!1)}}function Me(){I&&clearTimeout(I),I=setTimeout(()=>{I=void 0,et()},250)}Le(()=>({questions:i.questions,verbs:i.verbs,tenses:i.tenses,exerciseKind:i.exerciseKind,options:i.options}),Me,{deep:!0}),St(()=>{c("feature_exposed",{feature:"download.pdf"}),c("feature_exposed",{feature:"download.word"}),et()}),In(()=>{b+=1,I&&clearTimeout(I),be()});async function tt(){if(!S.value){c("feature_selected",{feature:"download.word"}),S.value=!0;try{const{AlignmentType:h,BorderStyle:s,Document:v,Footer:L,Header:U,HeightRule:ue,LeaderType:ke,Packer:E,Paragraph:A,SectionType:B,Tab:He,TabStopType:Ke,Table:De,TableBorders:Ae,TableCell:Xt,TableLayoutType:gt,TableRow:bt,TextRun:M,UnderlineType:V,VerticalAlign:D,WidthType:fe}=await Un(async()=>{const{AlignmentType:W,BorderStyle:J,Document:le,Footer:Ee,Header:Re,HeightRule:Yi,LeaderType:Xi,Packer:Qi,Paragraph:Ji,SectionType:Zi,Tab:er,TabStopType:tr,Table:nr,TableBorders:ar,TableCell:ir,TableLayoutType:rr,TableRow:or,TextRun:sr,UnderlineType:lr,VerticalAlign:cr,WidthType:ur}=await import("./BOF6v8rb.js");return{AlignmentType:W,BorderStyle:J,Document:le,Footer:Ee,Header:Re,HeightRule:Yi,LeaderType:Xi,Packer:Qi,Paragraph:Ji,SectionType:Zi,Tab:er,TabStopType:tr,Table:nr,TableBorders:ar,TableCell:ir,TableLayoutType:rr,TableRow:or,TextRun:sr,UnderlineType:lr,VerticalAlign:cr,WidthType:ur}},[],import.meta.url),de=i.options.title||t("Défi de conjugaison"),K=i.options.showRandomNumber?` n° ${u}`:"",N=9975,he={top:1020,right:965,bottom:850,left:965,header:360,footer:360,gutter:0},re={before:0,after:0,line:240},ae=new L({children:[new A({alignment:h.CENTER,spacing:re,children:[new M({text:"conjugaison.tatitotu.ch",size:16,color:"666666"})]})]}),we=W=>new U({children:[new A({alignment:h.CENTER,spacing:re,children:[new M({text:W,size:17,color:"666666"})]})]}),ve=new U({children:[new A({spacing:re})]}),Y=(W,J={})=>new A({alignment:J.alignment,spacing:re,children:[new M({text:W,bold:J.bold,size:J.size??21,font:"Arial"})]}),me=(W,J=21)=>{const le=W.literaryCitation;if(!le)return[Y(ne(it(W,i.exerciseKind).completion),{size:J})];const Ee=ne(le.before),Re=le.before?le.target:ne(le.target);return[new A({spacing:re,children:[new M({text:Ee,size:J,font:"Arial"}),new M({text:Re,size:J,font:"Arial",underline:{type:V.SINGLE}}),new M({text:le.after,size:J,font:"Arial"})]}),new A({spacing:{before:50,after:0,line:220},children:[new M({text:`— ${le.author}, ${le.work}`,size:Math.max(15,J-3),italics:!0,color:"666666",font:"Arial"})]})]},Te=W=>{const J=it(W,i.exerciseKind);if(!J.fillBlank)return[Y(ne(J.completion),{size:21})];const le=ne(J.completionPrefix),Ee=J.completionSuffix;return[new A({spacing:re,tabStops:[{type:Ke.RIGHT,position:5300,leader:ke.DOT}],children:[new M({size:21,font:"Arial",children:[...le?[le," "]:[],new He,...Ee?[` ${Ee}`]:[]]})]})]},nt=()=>new A({spacing:{before:150,after:40,line:240},tabStops:[{type:Ke.RIGHT,position:4300,leader:ke.DOT},{type:Ke.RIGHT,position:9250,leader:ke.DOT}],children:[new M({text:`${t("Mode :")} `,bold:!0,size:19,color:"555555",font:"Arial"}),new M({children:[new He],size:19,font:"Arial"}),new M({text:`   ${t("Temps :")} `,bold:!0,size:19,color:"555555",font:"Arial"}),new M({children:[new He],size:19,font:"Arial"})]}),oe=(W,J,le={})=>new Xt({children:W,width:{size:J,type:fe.DXA},verticalAlign:D.CENTER,borders:le.borders,margins:le.margins??{top:70,bottom:70,left:70,right:70}}),Se={bottom:{style:s.SINGLE,size:2,color:"D9D9D9"}},Oe=[],ct=[i.options.showFirstName?`${t("Prénom")} : ____________________`:"",i.options.showLastName?`${t("Nom")} : ____________________`:"",i.options.showDate?`${t("Date")} : ______________`:""].filter(Boolean),at=i.options.showGrade?965:0,je=ct.length>0?Math.floor((N-at)/ct.length):N-at;if(ct.forEach(W=>Oe.push(oe([Y(W,{size:18})],je))),ct.length===0&&i.options.showGrade&&Oe.push(oe([Y("")],N-at)),i.options.showGrade){const W={style:s.SINGLE,size:8,color:"333333"};Oe.push(oe([Y("")],at,{borders:{top:W,bottom:W,left:W,right:W},margins:{top:0,bottom:0,left:0,right:0}}))}const se=[];Oe.length>0&&se.push(new De({width:{size:N,type:fe.DXA},columnWidths:Oe.map(W=>W.options.width?.size),layout:gt.FIXED,borders:Ae.NONE,rows:[new bt({height:{value:700,rule:ue.ATLEAST},cantSplit:!0,children:Oe})]})),se.push(new A({spacing:{before:Math.round(p.value*56.7),after:260},children:[new M({text:de.toUpperCase(),bold:!0,size:34,font:"Arial"}),new M({text:K,size:18,font:"Arial"})]})),i.options.showVerbs&&se.push(Y(`Verbes : ${i.verbs.map(W=>W.infinitif).join(", ")}`,{bold:!0,size:19})),i.options.showTenses&&se.push(Y(`${t("Temps :")} ${i.tenses.map(W=>a(W.name)).join(", ")}`,{bold:!0,size:19})),$.value?se.push(new A({spacing:{before:160,after:480},border:{top:{style:s.SINGLE,size:4,color:"777777"},bottom:{style:s.SINGLE,size:4,color:"777777"},left:{style:s.SINGLE,size:4,color:"777777"},right:{style:s.SINGLE,size:4,color:"777777"}},children:[new M({text:Pa,size:19,font:"Arial"})]})):se.push(new A({spacing:{before:0,after:340},children:[]})),se.push(new De({width:{size:N,type:fe.DXA},columnWidths:$.value?[480,9495]:[480,3900,5595],layout:gt.FIXED,borders:Ae.NONE,rows:i.questions.map((W,J)=>{const le=it(W,i.exerciseKind),Ee=[oe([Y(`${J+1}.`,{size:21})],480,{margins:{top:90,bottom:90,left:0,right:40}}),oe([...me(W),nt()],9495,{margins:{top:90,bottom:100,left:70,right:70}})],Re=[oe([Y(`${J+1}.`,{size:21})],480,{margins:{top:70,bottom:70,left:0,right:40}}),oe([Y(ne(le.label),{size:21})],3900),oe(Te(W),5595)];return new bt({cantSplit:!0,height:{value:Math.round((($.value?13:5)+Math.max($.value?5:0,m.value))*56.7),rule:ue.ATLEAST},children:$.value?Ee:Re})})}));const ze=[new A({spacing:{before:0,after:260},children:[new M({text:t("CORRIGÉ"),bold:!0,size:34,font:"Arial"}),new M({text:K,size:18,font:"Arial"})]}),new De({width:{size:N,type:fe.DXA},columnWidths:$.value?[480,9495]:[480,5100,4395],layout:gt.FIXED,borders:Ae.NONE,rows:i.questions.map((W,J)=>{const le=[oe([Y(`${J+1}.`,{size:19})],480,{borders:Se,margins:{top:70,bottom:70,left:0,right:40}}),oe(Nt(W).map(Re=>Y(xe(Re),{bold:!0,size:19})),9495,{borders:Se,margins:{top:70,bottom:70,left:70,right:70}})],Ee=[oe([Y(`${J+1}.`,{size:19})],480,{borders:Se,margins:{top:55,bottom:55,left:0,right:40}}),oe([Y(ne(rn(W,i.exerciseKind)),{size:19})],5100,{borders:Se,margins:{top:55,bottom:55,left:70,right:70}}),oe(Nt(W).map(Re=>Y(xe(Re),{bold:!0,size:19})),4395,{borders:Se,margins:{top:55,bottom:55,left:70,right:70}})];return new bt({cantSplit:!0,height:{value:460,rule:ue.ATLEAST},children:$.value?le:Ee})})})],Fe=new v({styles:{default:{document:{run:{font:"Arial",size:21},paragraph:{spacing:re}}}},sections:[{properties:{page:{margin:he},titlePage:!0},headers:{first:ve,default:we(`${de}${K}`)},footers:{first:ae,default:ae},children:se},{properties:{page:{margin:he},type:B.NEXT_PAGE},headers:{default:we(`${de} — corrigé${K}`)},footers:{default:ae},children:ze}]}),It=await E.toBlob(Fe),Wn=URL.createObjectURL(It),ht=document.createElement("a"),qi=de.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"");ht.href=Wn,ht.download=`${qi||"defi-conjugaison"}.docx`,document.body.appendChild(ht),ht.click(),c("word_downloaded",{exerciseKind:i.exerciseKind}),ht.remove(),URL.revokeObjectURL(Wn)}catch{c("feature_failed",{feature:"download.word"})}finally{S.value=!1}}}return(h,s)=>(x(),An(ja,{to:"body"},[r("div",Df,[r("div",Rf,[r("div",null,[r("strong",Bf,f(o(t)("Aperçu avant impression")),1)]),r("div",null,[r("button",{class:"secondary-button",type:"button",onClick:s[0]||(s[0]=v=>l("close"))},f(o(t)("Fermer")),1),r("button",{class:"secondary-button",type:"button",disabled:o(S),onClick:tt},f(o(S)?"Création du fichier Word…":"Télécharger au format Word"),9,Wf),r("button",{class:"primary-button",type:"button",disabled:o(g),onClick:Ze},f(o(g)?"Création du PDF…":"Télécharger le PDF"),9,Uf)])]),r("div",Vf,[r("aside",Hf,[r("div",Kf,[r("p",null,f(o(t)("Personnalisation")),1),r("h2",Gf,f(o(t)("Options de la fiche")),1),r("span",null,f(o(t)("Les changements apparaissent immédiatement dans l’aperçu.")),1)]),r("label",qf,[r("span",null,f(o(t)("Titre de la fiche")),1),r("input",{id:"preview-print-title",type:"text",value:e.options.title,onInput:s[1]||(s[1]=v=>G("title",v.target.value))},null,40,Yf)]),r("fieldset",Xf,[r("legend",null,f(o(t)("Mise en page")),1),r("label",Qf,[r("span",null,f(o(t)("Espace avant le titre")),1),r("span",null,[r("input",{id:"preview-title-spacing",type:"number",min:"8",max:"30",step:"1",value:o(p),onInput:s[2]||(s[2]=v=>G("titleSpacingMm",Number(v.target.value)))},null,40,Jf),s[12]||(s[12]=ge(" mm ",-1))])]),r("label",Zf,[r("span",null,f(o(t)("Espacement entre les questions")),1),r("span",null,[r("input",{id:"preview-question-spacing",type:"number",min:"2",max:"15",step:"0.5",value:o(m),onInput:s[3]||(s[3]=v=>G("questionSpacingMm",Number(v.target.value)))},null,40,ed),s[13]||(s[13]=ge(" mm ",-1))])])]),r("fieldset",td,[r("legend",null,f(o(t)("Informations de l’élève")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showFirstName,onChange:s[4]||(s[4]=v=>G("showFirstName",v.target.checked))},null,40,nd),r("span",null,f(o(t)("Prénom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showLastName,onChange:s[5]||(s[5]=v=>G("showLastName",v.target.checked))},null,40,ad),r("span",null,f(o(t)("Nom")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showDate,onChange:s[6]||(s[6]=v=>G("showDate",v.target.checked))},null,40,id),r("span",null,f(o(t)("Date")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showGrade,onChange:s[7]||(s[7]=v=>G("showGrade",v.target.checked))},null,40,rd),r("span",null,f(o(t)("Espace pour la note")),1)])]),r("fieldset",od,[r("legend",null,f(o(t)("Contenu affiché")),1),r("label",null,[r("input",{type:"checkbox",checked:e.options.showVerbs,onChange:s[8]||(s[8]=v=>G("showVerbs",v.target.checked))},null,40,sd),r("span",null,f(o(t)("Liste des verbes")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showTenses,onChange:s[9]||(s[9]=v=>G("showTenses",v.target.checked))},null,40,ld),r("span",null,f(o(t)("Liste des temps")),1)]),r("label",null,[r("input",{type:"checkbox",checked:e.options.showRandomNumber,onChange:s[10]||(s[10]=v=>G("showRandomNumber",v.target.checked))},null,40,cd),r("span",null,f(o(t)("Numéro questionnaire/corrigé")),1)])])]),r("main",ud,[o(P)?(x(),_("iframe",{key:0,class:"pdf-preview-frame",src:`${o(P)}#view=FitH&toolbar=1&navpanes=0`,title:o(t)("Aperçu exact de la fiche PDF et de son corrigé"),onLoad:s[11]||(s[11]=v=>T.value=!0)},null,40,fd)):R("",!0),!o(C)&&(o(w)||!o(T))?(x(),_("div",dd,[s[14]||(s[14]=r("span",{class:"pdf-preview-spinner","aria-hidden":"true"},null,-1)),r("strong",null,f(o(t)("Création de l’aperçu PDF…")),1),r("span",null,f(o(t)("La fiche et le corrigé sont mis en page.")),1)])):R("",!0),o(C)?(x(),_("div",md,[r("strong",null,f(o(C)),1),r("button",{class:"secondary-button",type:"button",onClick:et},f(o(t)("Réessayer")),1)])):R("",!0)])])],512)]))}}),tp=Object.assign(pd,{__name:"ChallengePrintPreview"}),vd=mr("/images/recharger-defi.svg?v=dynamic-code"),gd={ref:"share-dialog",class:"app-dialog share-dialog","data-tour":"share-dialog",role:"dialog","aria-modal":"true","aria-labelledby":"share-title",tabindex:"-1"},bd=["aria-label"],hd={class:"dialog-kicker"},yd={id:"share-title"},xd={for:"share-challenge-title"},wd=["readonly","aria-invalid","aria-describedby"],_d=["disabled"],kd={for:"share-challenge-description"},Sd=["readonly","aria-describedby"],$d={id:"share-description-help",class:"share-title-form__description-help"},Cd={key:0,id:"share-title-error",class:"form-error",role:"alert"},Pd={key:0},Id={key:1,class:"share-methods"},Ad={class:"share-method","aria-labelledby":"share-code-title"},Td={id:"share-code-title"},Od={class:"share-method__tip"},jd={class:"share-value"},zd={for:"share-code"},Fd=["value"],Ed={key:0,class:"share-value__copy-status",role:"status"},Ld={class:"share-help"},Nd={type:"button",class:"share-help__trigger","aria-describedby":"reload-help-tooltip"},Md={id:"reload-help-tooltip",class:"share-help__tooltip",role:"tooltip"},Dd={class:"share-help__preview"},Rd=["alt"],Bd={"aria-hidden":"true"},Wd={class:"share-method","aria-labelledby":"share-link-title"},Ud={id:"share-link-title"},Vd={class:"share-method__tip"},Hd={class:"share-value"},Kd={for:"share-url"},Gd=["value"],qd={key:0,class:"share-value__copy-status",role:"status"},Yd=Je({__name:"ShareChallengeDialog",props:{code:{},url:{},busy:{type:Boolean},error:{},initialTitle:{},initialDescription:{}},emits:["close","save"],setup(e,{emit:n}){const{ui:t,localePath:a}=lt(),i=e,l=n,c=pr({code:"",link:""}),u=te(i.initialTitle?.trim()||t("Défi de conjugaison")),d=te(i.initialDescription?.trim()||""),g=Dt("close-button"),S=Dt("share-dialog"),w=z(()=>u.value.trim()),T=z(()=>d.value.trim()),P=z(()=>w.value.length>=1&&w.value.length<=80);Fa(S,()=>l("close"),g);async function C(m){if(navigator.clipboard?.writeText)try{await navigator.clipboard.writeText(m);return}catch{}const p=document.createElement("textarea");p.value=m,p.setAttribute("readonly",""),p.style.position="fixed",p.style.opacity="0",document.body.appendChild(p),p.focus(),p.select(),p.setSelectionRange(0,m.length);const $=document.execCommand("copy");if(p.remove(),!$)throw new Error("Copie impossible")}async function b(m,p){try{await C(m),c[p]=t(p==="code"?"Code copié":"Lien copié")}catch{c[p]=t("La copie a échoué.")}}function I(){try{sessionStorage.setItem("highlight-home-challenge-loader","1")}catch{}}function y(){i.code||i.busy||!P.value||l("save",w.value,T.value)}return(m,p)=>{const $=yr;return x(),An(ja,{to:"body"},[r("div",{class:"dialog-backdrop",onClick:p[8]||(p[8]=Mt(F=>l("close"),["self"]))},[r("section",gd,[r("button",{ref:"close-button",class:"dialog-close",type:"button","aria-label":o(t)("Fermer"),onClick:p[0]||(p[0]=F=>l("close"))}," × ",8,bd),r("p",hd,f(e.code?o(t)("Défi sauvegardé"):o(t)("Défi prêt à être partagé")),1),r("h2",yd,f(o(t)("Votre défi est prêt à être partagé")),1),r("form",{class:"share-title-form",onSubmit:Mt(y,["prevent"])},[r("label",xd,f(o(t)("Titre du défi")),1),r("div",null,[sn(r("input",{id:"share-challenge-title","onUpdate:modelValue":p[1]||(p[1]=F=>cn(u)?u.value=F:null),type:"text",maxlength:"80",readonly:!!e.code,"aria-invalid":!o(P),"aria-describedby":e.error?"share-title-error":void 0,required:"",autofocus:""},null,8,wd),[[ln,o(u)]]),e.code?R("",!0):(x(),_("button",{key:0,class:"primary-button",type:"submit",disabled:e.busy||!o(P)},f(e.busy?o(t)("Création…"):o(t)("Créer le code")),9,_d))]),r("small",null,f(o(w).length)+"/80",1),r("label",kd,f(o(t)("Description du défi")),1),sn(r("textarea",{id:"share-challenge-description","onUpdate:modelValue":p[2]||(p[2]=F=>cn(d)?d.value=F:null),rows:"4",maxlength:"1000",readonly:!!e.code,"aria-describedby":e.error?"share-title-error share-description-help":"share-description-help"},null,8,Sd),[[ln,o(d)]]),r("small",$d,f(o(t)("Facultatif : une description à l’attention des personnes qui découvriront ce défi"))+" · "+f(o(T).length)+"/1000 ",1),e.error?(x(),_("p",Cd,f(e.error),1)):R("",!0)],32),e.code?(x(),_("p",Pd,f(o(t)("Deux possibilités permettent à vos élèves de retrouver ce défi.")),1)):R("",!0),e.code?(x(),_("div",Id,[r("section",Ad,[r("header",null,[p[9]||(p[9]=r("span",{class:"share-method__number","aria-hidden":"true"},"1",-1)),r("div",null,[r("h3",Td,f(o(t)("Sauvegarder le code")),1),r("p",null,f(o(t)("L’élève conserve ce code. Plus tard, il le copie sur la page d’accueil pour retrouver ce défi.")),1),r("p",Od,f(o(t)("Idéal pour transmettre le défi par écrit")),1)])]),r("div",jd,[r("label",zd,f(o(t)("Code à conserver")),1),r("div",null,[r("input",{id:"share-code",value:e.code,readonly:"",onFocus:p[3]||(p[3]=F=>F.target.select())},null,40,Fd),r("button",{type:"button",onClick:p[4]||(p[4]=F=>b(e.code,"code"))},f(o(t)("Copier")),1)]),o(c).code?(x(),_("p",Ed,f(o(c).code),1)):R("",!0),r("div",Ld,[r("button",Nd,f(o(t)("Comment le recharger plus tard ?")),1),r("div",Md,[r("div",Dd,[r("img",{src:vd,alt:o(t)("Emplacement du code reçu sur la page d’accueil")},null,8,Rd),r("span",Bd,f(e.code),1)]),r("p",null,[p[10]||(p[10]=ge("Tes élèves colleront le code à cet endroit dans la ",-1)),Ge($,{to:o(a)("/"),onClick:I},{default:qe(()=>[ge(f(o(t)("page d’accueil")),1)]),_:1},8,["to"])])])])])]),r("section",Wd,[r("header",null,[p[11]||(p[11]=r("span",{class:"share-method__number","aria-hidden":"true"},"2",-1)),r("div",null,[r("h3",Ud,f(o(t)("Envoyer le lien direct")),1),r("p",null,f(o(t)("L’élève clique simplement sur ce lien : il arrive directement sur le défi, sans saisir le code.")),1),r("p",Vd,f(o(t)("Idéal pour transmettre le défi par email")),1)])]),r("div",Hd,[r("label",Kd,f(o(t)("Lien à envoyer")),1),r("div",null,[r("input",{id:"share-url",value:e.url,readonly:"",onFocus:p[5]||(p[5]=F=>F.target.select())},null,40,Gd),r("button",{type:"button",onClick:p[6]||(p[6]=F=>b(e.url,"link"))},f(o(t)("Copier")),1)]),o(c).link?(x(),_("p",qd,f(o(c).link),1)):R("",!0)])])])):R("",!0),e.code?(x(),_("button",{key:2,class:"primary-button",type:"button",onClick:p[7]||(p[7]=F=>l("close"))},f(o(t)("Terminé")),1)):R("",!0)],512)])])}}}),np=Object.assign(Yd,{__name:"ChallengeShareChallengeDialog"}),Xd={class:"builder-card tense-picker","aria-labelledby":"tenses-title"},Qd={class:"builder-card__header"},Jd={class:"builder-card__eyebrow"},Zd={id:"tenses-title"},em=["aria-label"],tm={class:"selection-toolbar"},nm={class:"tense-groups"},am=["aria-labelledby"],im=["id"],rm={class:"tense-group__items"},om={class:"tense-row"},sm={class:"tense-info"},lm=["aria-label","aria-describedby"],cm=["id"],um={class:"switch-row"},fm=["checked","onChange"],dm={key:0,class:"tense-group__trailing"},mm={class:"tense-row"},pm={class:"tense-info"},vm=["aria-label","aria-describedby"],gm=["id"],bm={class:"switch-row"},hm=["checked","onChange"],ym=Je({__name:"TensePicker",props:{modes:{},tenses:{},verbs:{},selectedIds:{}},emits:["toggle","selectAll","clear"],setup(e,{emit:n}){const{ui:t,uiLabel:a}=lt(),i=e,l=n,c=z(()=>new Set(i.selectedIds)),u=te({}),d=te(!1),g=z(()=>{const C=i.verbs.filter(b=>b.complementExample?.functionObject==="cod");return C.length?C:i.verbs}),S=z(()=>`${g.value.map(C=>C.id).join(",")}|${i.tenses.map(C=>C.id).join(",")}`),w=z(()=>i.modes.map(C=>{const b=i.tenses.filter(m=>m.modeId===C.id).sort((m,p)=>Vn(C.name,m.name)-Vn(C.name,p.name)||m.id-p.id),I=b.filter(m=>Hn(m)),y=b.filter(m=>!Hn(m));return{mode:C,tenses:b,columns:[y.filter(m=>!m.isCompound),y.filter(m=>m.isCompound)].filter(m=>m.length>0),trailingTenses:I}}).filter(C=>C.tenses.length>0));let T=0;async function P(){const C=++T;if(u.value={},!(!g.value.length||!i.tenses.length)){d.value=!0;try{const b=await $fetch("/api/tense-examples",{method:"POST",body:{verbIds:g.value.map(I=>I.id),tenseIds:i.tenses.map(I=>I.id)}});C===T&&(u.value=b.examples)}catch{C===T&&(u.value={})}finally{C===T&&(d.value=!1)}}}return St(P),Le(S,()=>{P()}),(C,b)=>(x(),_("section",Xd,[r("div",Qd,[r("div",null,[r("p",Jd,f(o(t)("Étape 2")),1),r("h2",Zd,f(o(t)("Mes temps")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} temps sélectionnés`},f(e.selectedIds.length),9,em)]),r("div",tm,[r("button",{class:"text-button",type:"button",onClick:b[0]||(b[0]=I=>l("selectAll"))},f(o(t)("Tout cocher")),1),r("button",{class:"text-button text-button--danger",type:"button",onClick:b[1]||(b[1]=I=>l("clear"))},f(o(t)("Tout décocher")),1)]),r("div",nm,[(x(!0),_(ee,null,ye(o(w),I=>(x(),_("section",{key:I.mode.id,class:"tense-group",role:"group","aria-labelledby":`tense-mode-${I.mode.id}`},[r("h3",{id:`tense-mode-${I.mode.id}`,class:"tense-group__title"},f(o(a)(I.mode.name)),9,im),r("div",{class:$e(["tense-group__columns",{"tense-group__columns--single":I.columns.length===1}])},[(x(!0),_(ee,null,ye(I.columns,(y,m)=>(x(),_("div",{key:m,class:"tense-group__column"},[r("div",rm,[(x(!0),_(ee,null,ye(y,p=>(x(),_("div",{key:p.id,class:"tense-entry"},[r("div",om,[r("span",sm,[r("button",{type:"button","aria-label":`${o(t)("Voir un exemple :")} ${o(a)(p.name)}`,"aria-describedby":`tense-example-${p.id}`},"i",8,lm),r("span",{id:`tense-example-${p.id}`,class:"tense-tooltip",role:"tooltip"},[o(u)[p.id]?(x(),_(ee,{key:0},[ge(f(o(t)("Exemple:"))+" ",1),r("strong",null,f(o(u)[p.id].emphasis),1),o(u)[p.id].rest?(x(),_(ee,{key:0},[ge(f(o(u)[p.id].rest),1)],64)):R("",!0)],64)):(x(),_(ee,{key:1},[ge(f(o(d)?o(t)("Chargement…"):o(t)("Exemple momentanément indisponible.")),1)],64))],8,cm)]),r("label",um,[r("input",{type:"checkbox",checked:o(c).has(p.id),onChange:$=>l("toggle",p.id)},null,40,fm),b[2]||(b[2]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,f(o(a)(p.name)),1)])])]))),128))])]))),128))],2),I.trailingTenses.length?(x(),_("div",dm,[(x(!0),_(ee,null,ye(I.trailingTenses,y=>(x(),_("div",{key:y.id,class:"tense-entry"},[r("div",mm,[r("span",pm,[r("button",{type:"button","aria-label":`${o(t)("Voir un exemple :")} ${o(a)(y.name)}`,"aria-describedby":`tense-example-${y.id}`},"i",8,vm),r("span",{id:`tense-example-${y.id}`,class:"tense-tooltip",role:"tooltip"},[o(u)[y.id]?(x(),_(ee,{key:0},[ge(f(o(t)("Exemple:"))+" ",1),r("strong",null,f(o(u)[y.id].emphasis),1),o(u)[y.id].rest?(x(),_(ee,{key:0},[ge(f(o(u)[y.id].rest),1)],64)):R("",!0)],64)):(x(),_(ee,{key:1},[ge(f(o(d)?o(t)("Chargement…"):o(t)("Exemple momentanément indisponible.")),1)],64))],8,gm)]),r("label",bm,[r("input",{type:"checkbox",checked:o(c).has(y.id),onChange:m=>l("toggle",y.id)},null,40,hm),b[3]||(b[3]=r("span",{class:"switch-row__control","aria-hidden":"true"},null,-1)),r("span",null,f(o(a)(y.name)),1)])])]))),128))])):R("",!0)],8,am))),128))])]))}}),ap=Object.assign(Vt(ym,[["__scopeId","data-v-ee3658cb"]]),{__name:"ChallengeTensePicker"}),xm={class:"builder-card verb-picker","aria-labelledby":"verbs-title"},wm={class:"builder-card__header"},_m={class:"builder-card__eyebrow"},km={id:"verbs-title"},Sm=["aria-label"],$m={class:"verb-search"},Cm={for:"verb-search-input"},Pm={class:"verb-search__control"},Im=["placeholder","aria-expanded","onKeydown"],Am=["disabled","aria-label"],Tm=["aria-label"],Om=["onClick"],jm={key:0},zm={key:1},Fm={key:1,class:"field-hint","aria-live":"polite"},Em={class:"selection-toolbar"},Lm=["aria-label","onClick"],Nm=Je({__name:"VerbPicker",props:{verbs:{},selectedIds:{}},emits:["add","remove","clear"],setup(e,{emit:n}){const{ui:t}=lt(),a=e,i=n,l=te(""),c=Dt("verb-input"),u=z(()=>new Set(a.selectedIds)),d=z(()=>{const C=new Map(a.verbs.map(b=>[b.id,b]));return a.selectedIds.map(b=>C.get(b)).filter(b=>!!b)}),g=z(()=>{const C=d.value.length;return C<=3?1.35:Math.max(1,1.35-(C-3)/20)}),S=z(()=>{const C=g.value,b=1+(C-1)*.55;return{"--selected-chip-gap":`${7*C}px`,"--selected-chip-inner-gap":`${6*C}px`,"--selected-chip-padding-block":`${7*C}px`,"--selected-chip-padding-end":`${8*C}px`,"--selected-chip-padding-start":`${11*C}px`,"--selected-chip-font-size":`${.87*C}rem`,"--selected-chip-button-size":`${21*C}px`,"--selected-chip-button-font-size":`${C}rem`,"--selected-chip-mobile-gap":`${7*b}px`,"--selected-chip-mobile-inner-gap":`${6*b}px`,"--selected-chip-mobile-padding-block":`${7*b}px`,"--selected-chip-mobile-padding-end":`${8*b}px`,"--selected-chip-mobile-padding-start":`${11*b}px`,"--selected-chip-mobile-font-size":`${.87*b}rem`,"--selected-chip-mobile-button-size":`${21*b}px`,"--selected-chip-mobile-button-font-size":`${b}rem`}}),w=z(()=>xr(l.value)?wr(a.verbs.filter(b=>!u.value.has(b.id)),l.value).slice(0,8):[]);function T(C){i("add",C.id),l.value="",on(()=>c.value?.focus())}function P(){const C=w.value[0];C&&T(C)}return(C,b)=>(x(),_("section",xm,[r("div",wm,[r("div",null,[r("p",_m,f(o(t)("Étape 1")),1),r("h2",km,f(o(t)("Mes verbes")),1)]),r("span",{class:"count-badge","aria-label":`${e.selectedIds.length} verbes sélectionnés`},f(e.selectedIds.length),9,Sm)]),r("div",$m,[r("label",Cm,f(o(t)("Ajouter un verbe")),1),r("div",Pm,[sn(r("input",{id:"verb-search-input",ref:"verb-input","onUpdate:modelValue":b[0]||(b[0]=I=>cn(l)?l.value=I:null),type:"search",autocomplete:"off",placeholder:o(t)("Ex. aller, être, finir…"),"aria-expanded":o(w).length>0,"aria-controls":"verb-suggestions",onKeydown:vr(Mt(P,["prevent"]),["enter"])},null,40,Im),[[ln,o(l)]]),r("button",{class:"icon-button icon-button--add",type:"button",disabled:o(w).length===0,"aria-label":o(t)("Ajouter le premier verbe proposé"),onClick:P}," + ",8,Am)]),o(w).length>0?(x(),_("ul",{key:0,id:"verb-suggestions",class:"verb-suggestions",role:"listbox","aria-label":o(t)("Verbes proposés")},[(x(!0),_(ee,null,ye(o(w),I=>(x(),_("li",{key:I.id,role:"option"},[r("button",{type:"button",onClick:y=>T(I)},[r("strong",null,f(I.infinitif),1),I.isPronominalForm&&I.baseVerbId?(x(),_("span",jm,f(o(t)("forme pronominale générée")),1)):I.auxiliaire?(x(),_("span",zm,f(o(t)("auxiliaire"))+" "+f(I.auxiliaire),1)):R("",!0)],8,Om)]))),128))],8,Tm)):o(l)?(x(),_("p",Fm," Aucun nouveau verbe ne commence par « "+f(o(l))+" ». ",1)):R("",!0)]),r("div",Em,[r("p",null,f(o(d).length?o(t)("Verbes retenus"):o(t)("Aucun verbe sélectionné")),1),o(d).length?(x(),_("button",{key:0,class:"text-button text-button--danger",type:"button",onClick:b[1]||(b[1]=I=>i("clear"))},f(o(t)("Tout supprimer")),1)):R("",!0)]),o(d).length?(x(),An(gr,{key:0,tag:"ul",name:"verb-chip",class:"selected-chips selected-chips--adaptive",style:br(o(S)),"aria-label":o(t)("Verbes sélectionnés")},{default:qe(()=>[(x(!0),_(ee,null,ye(o(d),I=>(x(),_("li",{key:I.id},[r("span",null,f(I.infinitif),1),r("button",{type:"button","aria-label":o(t)("Retirer le verbe {verb}",{verb:I.infinitif}),onClick:y=>i("remove",I.id)},"×",8,Lm)]))),128))]),_:1},8,["style","aria-label"])):R("",!0)]))}}),ip=Object.assign(Vt(Nm,[["__scopeId","data-v-f03191bf"]]),{__name:"ChallengeVerbPicker"});function rp(e){return new URL(globalThis.location.href)}export{Zm as C,ep as P,np as S,ap as T,ip as V,rp as a,Jm as b,tp as c,Qm as d,_r as e,Ym as f,$r as g,qm as h,kr as l,Pr as n,Xm as u};
