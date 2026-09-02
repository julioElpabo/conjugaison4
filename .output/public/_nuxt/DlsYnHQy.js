function n(r){return r?.trim().toLocaleLowerCase("fr-CH")==="impératif"?" !":"."}function i(r,t){const e=r.trimEnd();return!e||/[.!?…]$/u.test(e)?e:`${e}${n(t)}`}export{n as s,i as w};
