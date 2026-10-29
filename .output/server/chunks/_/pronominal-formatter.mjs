import { $ as findCompoundAuxiliaryForm } from '../nitro/nitro.mjs';

function normalized(value) {
  return value.trim().toLocaleLowerCase("fr").normalize("NFC");
}
function elidesBefore(form, hType) {
  const normalizedForm = normalized(form);
  const first = normalizedForm.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0);
  if ("aeiouy".includes(first)) return true;
  return first === "h" && hType !== "aspire";
}
function proclitic(personId, form, hType) {
  const elided = elidesBefore(form, hType);
  if (personId === 4) return elided ? "m'" : "me ";
  if (personId === 5) return elided ? "t'" : "te ";
  if (personId === 7) return "nous ";
  if (personId === 8) return "vous ";
  return elided ? "s'" : "se ";
}
function pronominalizeSimple(form, personId, mode, hType) {
  if (!form.trim()) return "";
  if (normalized(mode) === "imp\xE9ratif") {
    const suffix = personId === 5 ? "toi" : personId === 7 ? "nous" : "vous";
    return `${form.trim()}-${suffix}`;
  }
  return `${proclitic(personId, form, hType)}${form.trim()}`;
}
function participleForPerson(participle, personId, agreementRule) {
  const form = participle.trim();
  if (agreementRule === "invariable" || ![7, 8, 9].includes(Number(personId)) || /[sx]$/u.test(form)) {
    return form;
  }
  return `${form}s`;
}
function generatePronominalRow(row, auxiliaryForms) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const forms = [row.base_conjugaison1, row.base_conjugaison2, row.base_conjugaison3];
  let generated;
  if (Number(row.is_compound)) {
    const auxiliary = findCompoundAuxiliaryForm(row, auxiliaryForms);
    const auxiliaryForm = (_b = (_a = auxiliary == null ? void 0 : auxiliary.conjugaison1) == null ? void 0 : _a.trim()) != null ? _b : "";
    if (!auxiliaryForm) {
      generated = [];
    } else if (normalized(row.mode_name) === "imp\xE9ratif") {
      const suffix = Number(row.personne_id) === 5 ? "toi" : Number(row.personne_id) === 7 ? "nous" : "vous";
      generated = [`${auxiliaryForm}-${suffix} ${participleForPerson(row.participe_passe, row.personne_id, row.regle_accord)}`];
    } else {
      generated = [`${proclitic(row.personne_id, auxiliaryForm, null)}${auxiliaryForm} ${participleForPerson(row.participe_passe, row.personne_id, row.regle_accord)}`];
    }
  } else {
    generated = forms.map((form) => pronominalizeSimple(form, row.personne_id, row.mode_name, row.type_h_initial));
  }
  let nousForm = null;
  if ((_c = row.nous_form) == null ? void 0 : _c.trim()) {
    if (Number(row.is_compound)) {
      const auxiliary = findCompoundAuxiliaryForm({ ...row, personne_id: 7 }, auxiliaryForms);
      const auxiliaryForm = (_e = (_d = auxiliary == null ? void 0 : auxiliary.conjugaison1) == null ? void 0 : _d.trim()) != null ? _e : "";
      if (auxiliaryForm) {
        nousForm = normalized(row.mode_name) === "imp\xE9ratif" ? `${auxiliaryForm}-nous ${participleForPerson(row.participe_passe, 7, row.regle_accord)}` : `${proclitic(7, auxiliaryForm, null)}${auxiliaryForm} ${participleForPerson(row.participe_passe, 7, row.regle_accord)}`;
      }
    } else {
      nousForm = pronominalizeSimple(row.nous_form, 7, row.mode_name, row.type_h_initial);
    }
  }
  return {
    ...row,
    id: -(Number(row.pronominal_use_id) * 1e5 + Number(row.id)),
    verbe_id: -Number(row.pronominal_use_id),
    infinitif: row.infinitif_pronominal,
    auxiliaire: Number(row.is_compound) ? "\xEAtre" : row.auxiliaire,
    conjugaison1: (_f = generated[0]) != null ? _f : "",
    conjugaison2: (_g = generated[1]) != null ? _g : "",
    conjugaison3: (_h = generated[2]) != null ? _h : "",
    agreement_rule: row.regle_accord,
    nous_form: nousForm
  };
}

export { generatePronominalRow as g };
//# sourceMappingURL=pronominal-formatter.mjs.map
