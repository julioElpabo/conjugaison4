import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-4Nuy8GEQ.mjs';
import { defineComponent, reactive, ref, watch, withCtx, unref, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode, withModifiers, withDirectives, vModelCheckbox, vModelText, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrRenderAttr } from 'vue/server-renderer';
import { u as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './nuxt-link-icjx6oE7.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "contact",
  __ssrInlineRender: true,
  setup(__props) {
    const defaults = {
      enabled: true,
      contactEmail: "",
      subjectMinLength: 5,
      subjectMaxLength: 120,
      messageMinLength: 20,
      messageMaxLength: 3e3,
      maxLinks: 2,
      shortRateLimit: 3,
      shortRateWindowMinutes: 120,
      dailyRateLimit: 8
    };
    const { user, handleUnauthorized } = useAdminAuth();
    const settings = reactive({ ...defaults });
    const loading = ref(false);
    const saving = ref(false);
    const error = ref("");
    const success = ref("");
    let loaded = false;
    useHead({ title: "Contact — Administration" });
    async function loadSettings() {
      loading.value = true;
      error.value = "";
      try {
        const response = await $fetch("/api/admin/contact-settings", {
          credentials: "same-origin"
        });
        Object.assign(settings, response.settings);
      } catch (caught) {
        if (!handleUnauthorized(caught)) {
          error.value = getAdminErrorMessage(caught, "Impossible de charger les réglages du contact.");
        }
      } finally {
        loading.value = false;
      }
    }
    async function saveSettings() {
      if (saving.value) return;
      saving.value = true;
      error.value = "";
      success.value = "";
      try {
        const response = await $fetch("/api/admin/contact-settings", {
          method: "PUT",
          credentials: "same-origin",
          body: { ...settings }
        });
        Object.assign(settings, response.settings);
        success.value = "Réglages du formulaire de contact enregistrés.";
      } catch (caught) {
        if (!handleUnauthorized(caught)) {
          error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer les réglages.");
        }
      } finally {
        saving.value = false;
      }
    }
    watch(user, (current) => {
      if (current && !loaded) {
        loaded = true;
        void loadSettings();
      }
      if (!current) loaded = false;
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminAuthBoundary = __nuxt_component_0;
      const _component_AdminShell = __nuxt_component_1;
      _push(ssrRenderComponent(_component_AdminAuthBoundary, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminShell, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="contact-admin" data-v-1493575b${_scopeId2}><header class="admin-section-heading" data-v-1493575b${_scopeId2}><div data-v-1493575b${_scopeId2}><p class="admin-eyebrow" data-v-1493575b${_scopeId2}>Formulaire public</p><h1 data-v-1493575b${_scopeId2}>Contact</h1><p class="admin-muted" data-v-1493575b${_scopeId2}>Réglez la réception, la validation et les limites anti-abus du formulaire.</p></div><button class="admin-button" type="button"${ssrIncludeBooleanAttr(unref(loading) || unref(saving)) ? " disabled" : ""} data-v-1493575b${_scopeId2}> Actualiser </button></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-1493575b${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(success)) {
                    _push3(`<p class="admin-notice admin-notice--success" role="status" data-v-1493575b${_scopeId2}>${ssrInterpolate(unref(success))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(loading)) {
                    _push3(`<div class="contact-admin__loading" data-v-1493575b${_scopeId2}><span class="admin-spinner" aria-hidden="true" data-v-1493575b${_scopeId2}></span> Chargement… </div>`);
                  } else {
                    _push3(`<form class="contact-admin__form" data-v-1493575b${_scopeId2}><section class="admin-card contact-admin__section" data-v-1493575b${_scopeId2}><header data-v-1493575b${_scopeId2}><div data-v-1493575b${_scopeId2}><h2 data-v-1493575b${_scopeId2}>Réception</h2><p data-v-1493575b${_scopeId2}>Destination des messages et disponibilité du formulaire.</p></div><label class="contact-admin__switch" data-v-1493575b${_scopeId2}><input${ssrIncludeBooleanAttr(Array.isArray(unref(settings).enabled) ? ssrLooseContain(unref(settings).enabled, null) : unref(settings).enabled) ? " checked" : ""} type="checkbox" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Formulaire actif</span></label></header><label class="admin-field" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Adresse destinataire *</span><input${ssrRenderAttr("value", unref(settings).contactEmail)} type="email" maxlength="254" autocomplete="email" required data-v-1493575b${_scopeId2}><small data-v-1493575b${_scopeId2}>L’adresse reste invisible pour les visiteurs. Les secrets SMTP et Turnstile restent dans les variables d’environnement.</small></label></section><section class="admin-card contact-admin__section" data-v-1493575b${_scopeId2}><header data-v-1493575b${_scopeId2}><div data-v-1493575b${_scopeId2}><h2 data-v-1493575b${_scopeId2}>Contenu</h2><p data-v-1493575b${_scopeId2}>Contraintes vérifiées dans le navigateur et de nouveau sur le serveur.</p></div></header><div class="contact-admin__grid" data-v-1493575b${_scopeId2}><label class="admin-field" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Objet — caractères minimum</span><input${ssrRenderAttr("value", unref(settings).subjectMinLength)} type="number" min="1" max="100" required data-v-1493575b${_scopeId2}></label><label class="admin-field" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Objet — caractères maximum</span><input${ssrRenderAttr("value", unref(settings).subjectMaxLength)} type="number" min="5" max="200" required data-v-1493575b${_scopeId2}></label><label class="admin-field" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Message — caractères minimum</span><input${ssrRenderAttr("value", unref(settings).messageMinLength)} type="number" min="1" max="500" required data-v-1493575b${_scopeId2}></label><label class="admin-field" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Message — caractères maximum</span><input${ssrRenderAttr("value", unref(settings).messageMaxLength)} type="number" min="100" max="10000" required data-v-1493575b${_scopeId2}></label><label class="admin-field" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Nombre maximal de liens</span><input${ssrRenderAttr("value", unref(settings).maxLinks)} type="number" min="0" max="10" required data-v-1493575b${_scopeId2}><small data-v-1493575b${_scopeId2}>Au-delà de ce nombre, le message est considéré comme automatisé.</small></label></div></section><section class="admin-card contact-admin__section" data-v-1493575b${_scopeId2}><header data-v-1493575b${_scopeId2}><div data-v-1493575b${_scopeId2}><h2 data-v-1493575b${_scopeId2}>Limitation des envois</h2><p data-v-1493575b${_scopeId2}>Les deux limites s’appliquent à une même connexion internet.</p></div></header><div class="contact-admin__grid contact-admin__grid--rates" data-v-1493575b${_scopeId2}><label class="admin-field" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Messages pendant la période courte</span><input${ssrRenderAttr("value", unref(settings).shortRateLimit)} type="number" min="1" max="100" required data-v-1493575b${_scopeId2}></label><label class="admin-field" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Durée de la période courte, en minutes</span><input${ssrRenderAttr("value", unref(settings).shortRateWindowMinutes)} type="number" min="5" max="1440" required data-v-1493575b${_scopeId2}><small data-v-1493575b${_scopeId2}>120 minutes correspondent à 2 heures.</small></label><label class="admin-field" data-v-1493575b${_scopeId2}><span data-v-1493575b${_scopeId2}>Messages maximum sur 24 heures</span><input${ssrRenderAttr("value", unref(settings).dailyRateLimit)} type="number" min="1" max="500" required data-v-1493575b${_scopeId2}></label></div><p class="contact-admin__summary" data-v-1493575b${_scopeId2}> Réglage actuel : au maximum <strong data-v-1493575b${_scopeId2}>${ssrInterpolate(unref(settings).shortRateLimit)}</strong> messages toutes les <strong data-v-1493575b${_scopeId2}>${ssrInterpolate(unref(settings).shortRateWindowMinutes)}</strong> minutes et <strong data-v-1493575b${_scopeId2}>${ssrInterpolate(unref(settings).dailyRateLimit)}</strong> messages sur 24 heures. </p></section><aside class="contact-admin__translation-note" data-v-1493575b${_scopeId2}><strong data-v-1493575b${_scopeId2}>Textes traduits</strong><p data-v-1493575b${_scopeId2}>Le titre, l’introduction, les libellés, les confirmations et les erreurs restent dans <code data-v-1493575b${_scopeId2}>shared/i18n/contact.ts</code>. Ils ne sont pas mélangés à ces réglages techniques.</p></aside><div class="contact-admin__actions" data-v-1493575b${_scopeId2}><button class="admin-button admin-button--primary" type="submit"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-1493575b${_scopeId2}>${ssrInterpolate(unref(saving) ? "Enregistrement…" : "Enregistrer les réglages")}</button></div></form>`);
                  }
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "contact-admin" }, [
                      createVNode("header", { class: "admin-section-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Formulaire public"),
                          createVNode("h1", null, "Contact"),
                          createVNode("p", { class: "admin-muted" }, "Réglez la réception, la validation et les limites anti-abus du formulaire.")
                        ]),
                        createVNode("button", {
                          class: "admin-button",
                          type: "button",
                          disabled: unref(loading) || unref(saving),
                          onClick: loadSettings
                        }, " Actualiser ", 8, ["disabled"])
                      ]),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error",
                        role: "alert"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      unref(success) ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "admin-notice admin-notice--success",
                        role: "status"
                      }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                      unref(loading) ? (openBlock(), createBlock("div", {
                        key: 2,
                        class: "contact-admin__loading"
                      }, [
                        createVNode("span", {
                          class: "admin-spinner",
                          "aria-hidden": "true"
                        }),
                        createTextVNode(" Chargement… ")
                      ])) : (openBlock(), createBlock("form", {
                        key: 3,
                        class: "contact-admin__form",
                        onSubmit: withModifiers(saveSettings, ["prevent"])
                      }, [
                        createVNode("section", { class: "admin-card contact-admin__section" }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("h2", null, "Réception"),
                              createVNode("p", null, "Destination des messages et disponibilité du formulaire.")
                            ]),
                            createVNode("label", { class: "contact-admin__switch" }, [
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(settings).enabled = $event,
                                type: "checkbox"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelCheckbox, unref(settings).enabled]
                              ]),
                              createVNode("span", null, "Formulaire actif")
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Adresse destinataire *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).contactEmail = $event,
                              type: "email",
                              maxlength: "254",
                              autocomplete: "email",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(settings).contactEmail,
                                void 0,
                                { trim: true }
                              ]
                            ]),
                            createVNode("small", null, "L’adresse reste invisible pour les visiteurs. Les secrets SMTP et Turnstile restent dans les variables d’environnement.")
                          ])
                        ]),
                        createVNode("section", { class: "admin-card contact-admin__section" }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("h2", null, "Contenu"),
                              createVNode("p", null, "Contraintes vérifiées dans le navigateur et de nouveau sur le serveur.")
                            ])
                          ]),
                          createVNode("div", { class: "contact-admin__grid" }, [
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Objet — caractères minimum"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(settings).subjectMinLength = $event,
                                type: "number",
                                min: "1",
                                max: "100",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(settings).subjectMinLength,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Objet — caractères maximum"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(settings).subjectMaxLength = $event,
                                type: "number",
                                min: "5",
                                max: "200",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(settings).subjectMaxLength,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Message — caractères minimum"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(settings).messageMinLength = $event,
                                type: "number",
                                min: "1",
                                max: "500",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(settings).messageMinLength,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Message — caractères maximum"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(settings).messageMaxLength = $event,
                                type: "number",
                                min: "100",
                                max: "10000",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(settings).messageMaxLength,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Nombre maximal de liens"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(settings).maxLinks = $event,
                                type: "number",
                                min: "0",
                                max: "10",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(settings).maxLinks,
                                  void 0,
                                  { number: true }
                                ]
                              ]),
                              createVNode("small", null, "Au-delà de ce nombre, le message est considéré comme automatisé.")
                            ])
                          ])
                        ]),
                        createVNode("section", { class: "admin-card contact-admin__section" }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("h2", null, "Limitation des envois"),
                              createVNode("p", null, "Les deux limites s’appliquent à une même connexion internet.")
                            ])
                          ]),
                          createVNode("div", { class: "contact-admin__grid contact-admin__grid--rates" }, [
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Messages pendant la période courte"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(settings).shortRateLimit = $event,
                                type: "number",
                                min: "1",
                                max: "100",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(settings).shortRateLimit,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Durée de la période courte, en minutes"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(settings).shortRateWindowMinutes = $event,
                                type: "number",
                                min: "5",
                                max: "1440",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(settings).shortRateWindowMinutes,
                                  void 0,
                                  { number: true }
                                ]
                              ]),
                              createVNode("small", null, "120 minutes correspondent à 2 heures.")
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Messages maximum sur 24 heures"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(settings).dailyRateLimit = $event,
                                type: "number",
                                min: "1",
                                max: "500",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(settings).dailyRateLimit,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ])
                          ]),
                          createVNode("p", { class: "contact-admin__summary" }, [
                            createTextVNode(" Réglage actuel : au maximum "),
                            createVNode("strong", null, toDisplayString(unref(settings).shortRateLimit), 1),
                            createTextVNode(" messages toutes les "),
                            createVNode("strong", null, toDisplayString(unref(settings).shortRateWindowMinutes), 1),
                            createTextVNode(" minutes et "),
                            createVNode("strong", null, toDisplayString(unref(settings).dailyRateLimit), 1),
                            createTextVNode(" messages sur 24 heures. ")
                          ])
                        ]),
                        createVNode("aside", { class: "contact-admin__translation-note" }, [
                          createVNode("strong", null, "Textes traduits"),
                          createVNode("p", null, [
                            createTextVNode("Le titre, l’introduction, les libellés, les confirmations et les erreurs restent dans "),
                            createVNode("code", null, "shared/i18n/contact.ts"),
                            createTextVNode(". Ils ne sont pas mélangés à ces réglages techniques.")
                          ])
                        ]),
                        createVNode("div", { class: "contact-admin__actions" }, [
                          createVNode("button", {
                            class: "admin-button admin-button--primary",
                            type: "submit",
                            disabled: unref(saving)
                          }, toDisplayString(unref(saving) ? "Enregistrement…" : "Enregistrer les réglages"), 9, ["disabled"])
                        ])
                      ], 32))
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AdminShell, null, {
                default: withCtx(() => [
                  createVNode("div", { class: "contact-admin" }, [
                    createVNode("header", { class: "admin-section-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Formulaire public"),
                        createVNode("h1", null, "Contact"),
                        createVNode("p", { class: "admin-muted" }, "Réglez la réception, la validation et les limites anti-abus du formulaire.")
                      ]),
                      createVNode("button", {
                        class: "admin-button",
                        type: "button",
                        disabled: unref(loading) || unref(saving),
                        onClick: loadSettings
                      }, " Actualiser ", 8, ["disabled"])
                    ]),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error",
                      role: "alert"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    unref(success) ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "admin-notice admin-notice--success",
                      role: "status"
                    }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                    unref(loading) ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "contact-admin__loading"
                    }, [
                      createVNode("span", {
                        class: "admin-spinner",
                        "aria-hidden": "true"
                      }),
                      createTextVNode(" Chargement… ")
                    ])) : (openBlock(), createBlock("form", {
                      key: 3,
                      class: "contact-admin__form",
                      onSubmit: withModifiers(saveSettings, ["prevent"])
                    }, [
                      createVNode("section", { class: "admin-card contact-admin__section" }, [
                        createVNode("header", null, [
                          createVNode("div", null, [
                            createVNode("h2", null, "Réception"),
                            createVNode("p", null, "Destination des messages et disponibilité du formulaire.")
                          ]),
                          createVNode("label", { class: "contact-admin__switch" }, [
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).enabled = $event,
                              type: "checkbox"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelCheckbox, unref(settings).enabled]
                            ]),
                            createVNode("span", null, "Formulaire actif")
                          ])
                        ]),
                        createVNode("label", { class: "admin-field" }, [
                          createVNode("span", null, "Adresse destinataire *"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(settings).contactEmail = $event,
                            type: "email",
                            maxlength: "254",
                            autocomplete: "email",
                            required: ""
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [
                              vModelText,
                              unref(settings).contactEmail,
                              void 0,
                              { trim: true }
                            ]
                          ]),
                          createVNode("small", null, "L’adresse reste invisible pour les visiteurs. Les secrets SMTP et Turnstile restent dans les variables d’environnement.")
                        ])
                      ]),
                      createVNode("section", { class: "admin-card contact-admin__section" }, [
                        createVNode("header", null, [
                          createVNode("div", null, [
                            createVNode("h2", null, "Contenu"),
                            createVNode("p", null, "Contraintes vérifiées dans le navigateur et de nouveau sur le serveur.")
                          ])
                        ]),
                        createVNode("div", { class: "contact-admin__grid" }, [
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Objet — caractères minimum"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).subjectMinLength = $event,
                              type: "number",
                              min: "1",
                              max: "100",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(settings).subjectMinLength,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Objet — caractères maximum"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).subjectMaxLength = $event,
                              type: "number",
                              min: "5",
                              max: "200",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(settings).subjectMaxLength,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Message — caractères minimum"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).messageMinLength = $event,
                              type: "number",
                              min: "1",
                              max: "500",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(settings).messageMinLength,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Message — caractères maximum"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).messageMaxLength = $event,
                              type: "number",
                              min: "100",
                              max: "10000",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(settings).messageMaxLength,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Nombre maximal de liens"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).maxLinks = $event,
                              type: "number",
                              min: "0",
                              max: "10",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(settings).maxLinks,
                                void 0,
                                { number: true }
                              ]
                            ]),
                            createVNode("small", null, "Au-delà de ce nombre, le message est considéré comme automatisé.")
                          ])
                        ])
                      ]),
                      createVNode("section", { class: "admin-card contact-admin__section" }, [
                        createVNode("header", null, [
                          createVNode("div", null, [
                            createVNode("h2", null, "Limitation des envois"),
                            createVNode("p", null, "Les deux limites s’appliquent à une même connexion internet.")
                          ])
                        ]),
                        createVNode("div", { class: "contact-admin__grid contact-admin__grid--rates" }, [
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Messages pendant la période courte"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).shortRateLimit = $event,
                              type: "number",
                              min: "1",
                              max: "100",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(settings).shortRateLimit,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Durée de la période courte, en minutes"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).shortRateWindowMinutes = $event,
                              type: "number",
                              min: "5",
                              max: "1440",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(settings).shortRateWindowMinutes,
                                void 0,
                                { number: true }
                              ]
                            ]),
                            createVNode("small", null, "120 minutes correspondent à 2 heures.")
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Messages maximum sur 24 heures"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(settings).dailyRateLimit = $event,
                              type: "number",
                              min: "1",
                              max: "500",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(settings).dailyRateLimit,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ])
                        ]),
                        createVNode("p", { class: "contact-admin__summary" }, [
                          createTextVNode(" Réglage actuel : au maximum "),
                          createVNode("strong", null, toDisplayString(unref(settings).shortRateLimit), 1),
                          createTextVNode(" messages toutes les "),
                          createVNode("strong", null, toDisplayString(unref(settings).shortRateWindowMinutes), 1),
                          createTextVNode(" minutes et "),
                          createVNode("strong", null, toDisplayString(unref(settings).dailyRateLimit), 1),
                          createTextVNode(" messages sur 24 heures. ")
                        ])
                      ]),
                      createVNode("aside", { class: "contact-admin__translation-note" }, [
                        createVNode("strong", null, "Textes traduits"),
                        createVNode("p", null, [
                          createTextVNode("Le titre, l’introduction, les libellés, les confirmations et les erreurs restent dans "),
                          createVNode("code", null, "shared/i18n/contact.ts"),
                          createTextVNode(". Ils ne sont pas mélangés à ces réglages techniques.")
                        ])
                      ]),
                      createVNode("div", { class: "contact-admin__actions" }, [
                        createVNode("button", {
                          class: "admin-button admin-button--primary",
                          type: "submit",
                          disabled: unref(saving)
                        }, toDisplayString(unref(saving) ? "Enregistrement…" : "Enregistrer les réglages"), 9, ["disabled"])
                      ])
                    ], 32))
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/contact.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const contact = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1493575b"]]);

export { contact as default };
//# sourceMappingURL=contact-A7PyoAx2.mjs.map
