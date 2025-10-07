"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Configuration par défaut (basée sur l'app Streamlit)
const DEFAULT_CONFIG = {
  mtp: 1365.08, // Montant de la MTP mensuel
  plafonds_multiplicateurs: {
    1: 1.615,
    2: 1.306,
    3: 0.944,
    4: 0.630,
  },
  couts_horaires: {
    "Emploi direct": 18.96,
    "SAAD - mandataire": 21.00,
    "SAAD - prestataire": 24.58,
  }
};

// Constantes pour le calcul de participation
const T1 = 0.317; // seuil 1 × MTP (palier A1)
const T2 = 0.498; // seuil 2 × MTP (palier A2)
const LOW = 0.725; // 0,725 × MTP : 0 % de participation
const HIGH = 2.67; // 2,67 × MTP : 90 % de participation

// Items AGGIR pour l'évaluation GIR
const AGGIR_ITEMS = [
  ["Cohérence", "Comprendre, s'exprimer et se comporter de manière adaptée"],
  ["Orientation", "Se repérer dans le temps et les lieux"],
  ["Toilette", "Se laver"],
  ["Habillage", "S'habiller"],
  ["Alimentation", "Manger et boire"],
  ["Élimination", "Utiliser les toilettes"],
  ["Transferts", "Se lever, se coucher et s'asseoir"],
  ["Déplacements intérieurs", "Se déplacer dans le logement"],
  ["Déplacements extérieurs", "Sortir de chez soi"],
  ["Communication", "Téléphone, alarme…"],
];

const CHOICES = {
  0: "Autonome (sans aide)",
  1: "Aide partielle (ponctuelle)",
  2: "Aide fréquente ou continue"
};

const NOTES_GIR = {
  1: "GIR 1 : dépendance très lourde (aide continue, fonctions mentales très altérées).",
  2: "GIR 2 : aide importante (confinement ou altérations cognitives marquées).",
  3: "GIR 3 : aide pluriquotidienne pour l'autonomie corporelle.",
  4: "GIR 4 : aide ponctuelle (transferts, toilette, repas…).",
  5: "GIR 5 : aide ménagère possible (hors APA).",
  6: "GIR 6 : autonome pour les actes essentiels.",
};

// Types
interface AggrirResponses {
  [key: string]: number;
}

interface CalculationResults {
  gir: number;
  plafond: number;
  participation: number;
  tauxParticipation: number;
  apaVersee: number;
  revenusCalcule: number;
  planAide: number;
}

// Icônes monochromes contemporaines
const icons = {
  calculator: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19Z"/>
      <path d="M6.25 7.72H17.75V9.5H6.25V7.72Z"/>
      <path d="M6.25 10.78H8.03V12.56H6.25V10.78Z"/>
      <path d="M9.31 10.78H11.09V12.56H9.31V10.78Z"/>
      <path d="M12.37 10.78H14.15V12.56H12.37V10.78Z"/>
      <path d="M15.43 10.78H17.21V12.56H15.43V10.78Z"/>
      <path d="M6.25 13.84H8.03V15.62H6.25V13.84Z"/>
      <path d="M9.31 13.84H11.09V15.62H9.31V13.84Z"/>
      <path d="M12.37 13.84H14.15V15.62H12.37V13.84Z"/>
      <path d="M15.43 13.84H17.21V15.62H15.43V13.84Z"/>
      <path d="M6.25 16.9H8.03V18.68H6.25V16.9Z"/>
      <path d="M9.31 16.9H11.09V18.68H9.31V16.9Z"/>
      <path d="M12.37 16.9H14.15V18.68H12.37V16.9Z"/>
      <path d="M15.43 16.9H17.21V18.68H15.43V16.9Z"/>
    </svg>
  ),
  money: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 15H9C9 16.08 10.37 17 12 17S15 16.08 15 15C15 13.9 13.96 13.5 11.76 12.97C9.64 12.44 7 11.78 7 9C7 7.21 8.47 5.69 10.5 5.18V3H13.5V5.18C15.53 5.69 17 7.21 17 9H15C15 7.92 13.63 7 12 7S9 7.92 9 9C9 10.1 10.04 10.5 12.24 11.03C14.36 11.56 17 12.22 17 15C17 16.79 15.53 18.31 13.5 18.82V21H10.5V18.82C8.47 18.31 7 16.79 7 15Z"/>
    </svg>
  ),
  health: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7.5L21 9ZM15 9.5C15 11.2 13.8 12.5 12.1 12.9L11.9 20.9C11.9 21.5 11.4 22 10.8 22S9.7 21.5 9.7 20.9L9.5 12.9C7.8 12.5 6.5 11.2 6.5 9.5C6.5 7.6 8 6 10 6S13.5 7.6 13.5 9.5H15Z"/>
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 9.2H7V19H5V9.2M10.6 5H12.6V19H10.6V5M16.2 13H18.2V19H16.2V13Z"/>
    </svg>
  ),
  time: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M17 13H11V7H12.5V11.5H17V13Z"/>
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M12 17C11.45 17 11 16.55 11 16V12C11 11.45 11.45 11 12 11S13 11.45 13 12V16C13 16.55 12.55 17 12 17M12 9C11.45 9 11 8.55 11 8S11.45 7 12 7 13 7.45 13 8 12.55 9 12 9Z"/>
    </svg>
  ),
  gauge: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12H4C4 7.58 7.58 4 12 4S20 7.58 20 12H22C22 6.48 17.52 2 12 2Z"/>
      <path d="M12 6C8.69 6 6 8.69 6 12H8C8 9.79 9.79 8 12 8S16 9.79 16 12H18C18 8.69 15.31 6 12 6Z"/>
      <path d="M12 10C10.9 10 10 10.9 10 12H14C14 10.9 13.1 10 12 10Z"/>
    </svg>
  ),
};

// Fonctions de calcul (basées sur l'app Streamlit)
function computeGirSimplified(responses: AggrirResponses): number {
  const vals = Object.values(responses);
  const severe = vals.filter(v => v === 2).length;
  const partial = vals.filter(v => v === 1).length;
  const sevKeys = new Set(Object.keys(responses).filter(k => responses[k] === 2));

  if (severe >= 4 && (sevKeys.has("Cohérence") || sevKeys.has("Orientation"))) {
    return 1;
  }
  if (severe >= 2) {
    return 2;
  }
  if (severe >= 1 && partial >= 2) {
    return 3;
  }
  if (partial >= 1) {
    return 4;
  }
  return severe === 0 && partial === 0 ? 6 : 5;
}

function splitA(A: number, mtp: number): [number, number, number] {
  const s1 = T1 * mtp;
  const s2 = T2 * mtp;
  const a1 = Math.min(A, s1);
  const a2 = Math.min(Math.max(A - s1, 0.0), Math.max(s2 - s1, 0.0));
  const a3 = Math.max(A - s2, 0.0);
  return [a1, a2, a3];
}

function computeParticipation(R: number, A: number, mtp: number): number {
  if (A <= 0) return 0.0;
  if (R <= LOW * mtp) return 0.0;
  if (R >= HIGH * mtp) return 0.9 * A;

  const [a1, a2, a3] = splitA(A, mtp);
  const denom = (HIGH - LOW) * mtp;
  const base = ((R - LOW * mtp) / denom) * 0.9;
  const term2 = ((1 - 0.4) / denom) * R + 0.4;
  const term3 = ((1 - 0.2) / denom) * R + 0.2;
  const P = a1 * base + a2 * base * term2 + a3 * base * term3;
  return Math.max(Math.min(P, 0.9 * A), 0.0);
}

export default function SimulateurApaClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [aggrirResponses, setAggrirResponses] = useState<AggrirResponses>({});
  const [girEstime, setGirEstime] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    situation: "Seul(e)",
    revenus: 1500,
    planAide: 0
  });
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [selectedMode, setSelectedMode] = useState("Emploi direct");

  const handleAggrirResponse = (item: string, value: number) => {
    setAggrirResponses(prev => ({ ...prev, [item]: value }));
  };

  const calculateGir = () => {
    const gir = computeGirSimplified(aggrirResponses);
    setGirEstime(gir);
    
    // Calculer le plafond selon le GIR
    const coef = DEFAULT_CONFIG.plafonds_multiplicateurs[gir as keyof typeof DEFAULT_CONFIG.plafonds_multiplicateurs] || 0;
    const plafond = Math.round(coef * DEFAULT_CONFIG.mtp);
    
    setFormData(prev => ({ ...prev, planAide: plafond }));
    setCurrentStep(2);
  };

  const calculateApa = () => {
    if (!girEstime) return;
    
    const coef = DEFAULT_CONFIG.plafonds_multiplicateurs[girEstime as keyof typeof DEFAULT_CONFIG.plafonds_multiplicateurs] || 0;
    const plafond = Math.round(coef * DEFAULT_CONFIG.mtp);
    
    // Revenus pris en compte (règle couple)
    const R = formData.situation === "Seul(e)" ? formData.revenus : formData.revenus / 1.7;
    
    // Plan d'aide effectif (plafonné)
    const A_effectif = Math.min(formData.planAide, plafond);
    
    // Calcul de la participation
    const P = computeParticipation(R, A_effectif, DEFAULT_CONFIG.mtp);
    const T = A_effectif === 0 ? 0 : P / A_effectif;
    const APA_versee = Math.max(A_effectif - P, 0);

    const newResults: CalculationResults = {
      gir: girEstime,
      plafond,
      participation: P,
      tauxParticipation: T,
      apaVersee: APA_versee,
      revenusCalcule: R,
      planAide: A_effectif
    };

    setResults(newResults);
    setCurrentStep(3);
  };

  const getHeuresEstimees = () => {
    if (!results) return { min: 0, max: 0 };
    
    const coutHoraire = DEFAULT_CONFIG.couts_horaires[selectedMode as keyof typeof DEFAULT_CONFIG.couts_horaires] || 0;
    if (coutHoraire <= 0) return { min: 0, max: 0 };
    
    const baseHeures = results.planAide / coutHoraire;
    return {
      min: Math.floor(baseHeures * 0.70),
      max: Math.floor(baseHeures * 0.90)
    };
  };

  const resetSimulator = () => {
    setCurrentStep(1);
    setAggrirResponses({});
    setGirEstime(null);
    setFormData({ situation: "Seul(e)", revenus: 1500, planAide: 0 });
    setResults(null);
    setSelectedMode("Emploi direct");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-6">
            {icons.calculator}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mes droits en matière de perte d&apos;autonomie
          </h1>
          <h2 className="text-2xl text-orange-600 mb-4">Estimation GIR & APA</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estimation indicative. Les aides dépendent d&apos;une évaluation à domicile et des pratiques départementales.
          </p>
        </motion.div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 ${
                    currentStep > step ? 'bg-orange-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2 max-w-md mx-auto">
            <span>Estimer le GIR</span>
            <span>Calculer l&apos;APA</span>
            <span>Résultats</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Étape 1: Estimation GIR */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 mr-4">
                  {icons.health}
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  1) Estimer le GIR
                </h3>
              </div>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-600">{icons.info}</div>
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Explication grand public :</strong>{" "}
                      <a
                        href="https://www.pour-les-personnes-agees.gouv.fr/preserver-son-autonomie/perte-d-autonomie-evaluation-et-droits/comment-fonctionne-la-grille-aggir"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Comment fonctionne la grille AGGIR
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                <strong>Pour chaque item, cochez la situation la plus proche.</strong>
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {AGGIR_ITEMS.map(([code, label]) => (
                  <div key={code} className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      <span className="text-orange-600">{code}</span> — {label}
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(CHOICES).map(([value, text]) => (
                        <label key={value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={code}
                            value={value}
                            checked={aggrirResponses[code] === parseInt(value)}
                            onChange={(e) => handleAggrirResponse(code, parseInt(e.target.value))}
                            className="text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={calculateGir}
                  disabled={Object.keys(aggrirResponses).length < AGGIR_ITEMS.length}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Estimer mon GIR
                </button>
              </div>

              {girEstime && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-green-600">{icons.gauge}</div>
                    <h4 className="font-semibold text-green-800">
                      GIR estimé : {girEstime}
                    </h4>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    {NOTES_GIR[girEstime as keyof typeof NOTES_GIR]}
                  </p>
                  
                  {girEstime <= 4 && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-3">
                      <p className="text-sm text-orange-800">
                        <strong>➡️ Pour un GIR 1 à 4</strong>, vous pouvez déposer une demande d&apos;aide à l&apos;autonomie 
                        (dossier commun APA + aides des caisses de retraite), à adresser au Département.
                      </p>
                    </div>
                  )}
                  
                  {girEstime >= 5 && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-800">
                        <strong>➡️ En GIR 5 ou 6</strong>, vous pouvez demander une aide à l&apos;autonomie si vous ressentez 
                        un besoin ou un enjeu de prévention ; la demande est à adresser en priorité à votre caisse de retraite.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Étape 2: Calcul APA */}
          {currentStep === 2 && girEstime && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 mr-4">
                  {icons.money}
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  2) Estimer mes droits APA et ma participation
                </h3>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Plafond mensuel pour GIR {girEstime} : {Math.round((DEFAULT_CONFIG.plafonds_multiplicateurs[girEstime as keyof typeof DEFAULT_CONFIG.plafonds_multiplicateurs] || 0) * DEFAULT_CONFIG.mtp).toLocaleString()} € / mois</strong>
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Le plan d&apos;aide accepté (A) est souvent inférieur au plafond, sur la base d&apos;une évaluation à domicile 
                    par un travailleur médico-social et du choix de la personne.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Situation familiale
                  </label>
                  <select
                    value={formData.situation}
                    onChange={(e) => setFormData(prev => ({ ...prev, situation: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Seul(e)">Seul(e)</option>
                    <option value="En couple">En couple</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Revenus mensuels du foyer (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.revenus}
                    onChange={(e) => setFormData(prev => ({ ...prev, revenus: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Montant du plan d&apos;aide accepté (A) - € / mois
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.planAide}
                  onChange={(e) => setFormData(prev => ({ ...prev, planAide: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Par défaut au plafond, mais souvent inférieur après évaluation et choix de la personne.
                </p>
                
                {formData.planAide > (DEFAULT_CONFIG.plafonds_multiplicateurs[girEstime as keyof typeof DEFAULT_CONFIG.plafonds_multiplicateurs] || 0) * DEFAULT_CONFIG.mtp && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      A dépasse le plafond GIR : {Math.round((DEFAULT_CONFIG.plafonds_multiplicateurs[girEstime as keyof typeof DEFAULT_CONFIG.plafonds_multiplicateurs] || 0) * DEFAULT_CONFIG.mtp).toLocaleString()} €. 
                      L&apos;aide versée sera plafonnée.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  Retour
                </button>
                <button
                  onClick={calculateApa}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl flex-1"
                >
                  Calculer ma participation
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 3: Résultats */}
          {currentStep === 3 && results && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Résultats principaux */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 mr-4">
                    {icons.chart}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">
                    Résultat
                  </h3>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {results.planAide.toLocaleString()} €
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Plan d&apos;aide retenu (A)
                    </div>
                    <div className="text-xs text-gray-500 mt-1">/ mois</div>
                  </div>

                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {(results.tauxParticipation * 100).toFixed(1)} %
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Taux de participation
                    </div>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {results.participation.toLocaleString()} €
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Reste à charge estimé
                    </div>
                    <div className="text-xs text-gray-500 mt-1">/ mois</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {results.apaVersee.toLocaleString()} €
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      APA versée (estimation)
                    </div>
                    <div className="text-xs text-gray-500 mt-1">/ mois</div>
                  </div>
                </div>
              </div>

              {/* Mode d'intervention */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 mr-4">
                    {icons.time}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">
                    3) Choisir un mode d&apos;intervention — heures possibles
                  </h3>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mode d&apos;intervention
                  </label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {Object.keys(DEFAULT_CONFIG.couts_horaires).map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.planAide.toLocaleString()} €
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Plan d&apos;aide retenu (A)
                    </div>
                    <div className="text-xs text-gray-500 mt-1">/ mois</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ≈ {getHeuresEstimees().min}–{getHeuresEstimees().max} h
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Heures possibles en {selectedMode}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">/ mois</div>
                  </div>
                </div>

                {results.participation > 0 ? (
                  <p className="text-sm text-orange-700 mt-4 text-center">
                    Rappel : dont <strong>{results.participation.toLocaleString()} €</strong> de reste à charge (participation).
                  </p>
                ) : (
                  <p className="text-sm text-green-700 mt-4 text-center">
                    Rappel : aucune participation estimée (reste à charge 0 €).
                  </p>
                )}

                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Lorsque l&apos;APA est accordée, vous choisissez un mode d&apos;intervention parmi 3 :
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Emploi direct</strong> : vous embauchez directement un(e) aide à domicile (ex. via CESU).</li>
                    <li>• <strong>Mandataire</strong> : une structure vous accompagne, mais vous restez l&apos;employeur.</li>
                    <li>• <strong>Prestataire</strong> : la structure emploie directement les aides à domicile.</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    <em>Les plans d&apos;aide indicatifs sont calculés à partir de moyennes observées (plafonds, tarifs). 
                    Ils peuvent varier selon les situations individuelles et les pratiques départementales.</em>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <button
                  onClick={resetSimulator}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Nouvelle estimation
                </button>
              </div>

              {/* Note importante */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <p className="text-sm text-orange-800">
                  <strong>Règles paramétrées :</strong> MTP, plafonds par GIR, division revenus/1,7 en couple, 
                  paliers A1/A2/A3, formule de participation (0,725 / 2,67 / 0,317 / 0,498).
                </p>
                <p className="text-sm text-orange-700 mt-2">
                  Estimation indicative à confirmer par une évaluation à domicile par un professionnel.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}