"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Question {
  code: string;
  icon: string;
  prompt: string;
}

interface Variable {
  code: string;
  icon: string;
  label: string;
}

interface GirResult {
  gir: number;
  description: string;
  recommendation: string;
  isApaEligible: boolean;
}

// Données du simulateur (réplique de l'application Streamlit)
const QUESTIONS: Question[] = [
  {
    code: "Cohérence",
    icon: "🧠",
    prompt: "Au quotidien, est-ce que vous vous sentez clair(e) dans vos idées, capable de faire des choix et de vous faire comprendre sans difficulté ?"
  },
  {
    code: "Orientation",
    icon: "🧭",
    prompt: "Vous repérer dans le temps et les lieux est-il facile (date, rendez-vous, trajet connu) ?"
  },
  {
    code: "Toilette",
    icon: "🚿",
    prompt: "Pour la toilette (se laver, se sécher), vous débrouillez-vous sans aide ?"
  },
  {
    code: "Habillage",
    icon: "👕",
    prompt: "Pour vous habiller (choix des vêtements, fermetures, chaussures), ça va tout seul ?"
  },
  {
    code: "Alimentation",
    icon: "🍽️",
    prompt: "Pour préparer/prendre vos repas et boire suffisamment, avez-vous besoin d'un coup de main ?"
  },
  {
    code: "Élimination",
    icon: "🚻",
    prompt: "Aller aux toilettes (y aller, s'installer, se rhabiller) est-ce gérable seul(e) ?"
  },
  {
    code: "Transferts",
    icon: "🧍‍♀️",
    prompt: "Vous lever, vous asseoir, vous coucher — pouvez-vous le faire sans assistance ?"
  },
  {
    code: "Déplacements intérieurs",
    icon: "🏠",
    prompt: "Vous déplacer **dans le logement** (avec ou sans aide technique), est-ce aisé ?"
  },
  {
    code: "Déplacements extérieurs",
    icon: "🚶",
    prompt: "Sortir **à l'extérieur** pour de petites courses/rendez-vous : le faites-vous sans aide humaine ?"
  },
  {
    code: "Communication",
    icon: "☎️",
    prompt: "Téléphone, sonnette, alarme : êtes-vous à l'aise pour **joindre quelqu'un** en cas de besoin ?"
  }
];

const VARIABLES: Variable[] = [
  {
    code: "activité_physique",
    icon: "🤸",
    label: "Bouger un peu chaque jour (marche, étirements) vous est-il facile en ce moment ?"
  },
  {
    code: "nutrition_hydratation",
    icon: "🥤",
    label: "Buvez-vous suffisamment et vos repas sont-ils réguliers et équilibrés ?"
  },
  {
    code: "sommeil",
    icon: "🌙",
    label: "Votre sommeil est-il plutôt réparateur ?"
  },
  {
    code: "vision_audition",
    icon: "👓",
    label: "Vision et audition : êtes-vous bien équipé(e) (lunettes, appareil) et à jour des contrôles ?"
  },
  {
    code: "sécurité_logement",
    icon: "🛠️",
    label: "Votre logement est-il sécurisé (éclairage, tapis antidérapants, barres d'appui) ?"
  },
  {
    code: "liens_sociaux",
    icon: "🤝",
    label: "Avez-vous des contacts réguliers (famille, voisins, associations) ?"
  },
  {
    code: "administratif_budget",
    icon: "📄",
    label: "Vous sentez-vous à l'aise avec les démarches administratives et le budget ?"
  }
];

const CHOICES = {
  0: "Je fais seul(e) sans difficulté",
  1: "J'ai parfois besoin d'un coup de main",
  2: "J'ai souvent besoin d'aide"
};

const VARS_CHOICES = {
  0: "Oui, plutôt",
  1: "Ça pourrait aller mieux",
  2: "C'est difficile en ce moment"
};

const GIR_DESCRIPTIONS = {
  1: "Dépendance très lourde, besoin d'aide continue.",
  2: "Aide importante (confinement ou altérations cognitives marquées).",
  3: "Aide pluri-quotidienne pour l'autonomie corporelle.",
  4: "Aide ponctuelle pour certains actes (transferts, toilette, repas…).",
  5: "Autonomie globale, possibles aides ménagères / prévention.",
  6: "Autonomie pour les actes essentiels."
};

// Conseils de prévention
const PREVENTION_TIPS = {
  "Cohérence": "Parler chaque jour avec un proche, tenir un petit carnet de repères (rendez-vous, médicaments), consulter si des troubles apparaissent.",
  "Orientation": "Affichage visible du calendrier et de l'horloge, routines quotidiennes stables, accompagnement ponctuel si nouveaux trajets.",
  "Toilette": "Installer **barres d'appui**, tapis antidérapant, siège de douche. Préparer le nécessaire à portée de main.",
  "Habillage": "Vêtements faciles à enfiler (scratch, fermetures simples), s'asseoir pour s'habiller.",
  "Alimentation": "Repas réguliers, hydratation tout au long de la journée, portage de repas si besoin.",
  "Élimination": "Accès WC dégagé, rehausseur/poignées, éclairage nocturne, surveillance des épisodes de fuites/infections.",
  "Transferts": "Chaise stable, lit à bonne hauteur, gestes sécurisés. Évaluer une aide technique (cannes, verticalisateur).",
  "Déplacements intérieurs": "Dégager les passages, supprimer les tapis glissants, éclairage automatique (détecteurs).",
  "Déplacements extérieurs": "Sorties accompagnées si besoin, parcours connus, canne ou déambulateur, carte de priorité si éligible.",
  "Communication": "Téléphone simplifié, numéros d'urgence en favori, médaillon/bracelet d'alerte si isolement."
};

const VARIABLES_TIPS = {
  "activité_physique": "Bouger un peu chaque jour (marche douce, exercices assis/debout), même 10–15 min, est très utile.",
  "nutrition_hydratation": "Fractionner les repas, varier les textures, penser aux boissons chaudes/froides, soupes, compotes.",
  "sommeil": "Rythme régulier, lumière naturelle en journée, limiter les écrans le soir, tisane si besoin.",
  "vision_audition": "Contrôle annuel, nettoyer lunettes/appareils, bon éclairage et contrastes au domicile.",
  "sécurité_logement": "Éliminer obstacles, tapis antidérapants, barres d'appui, veilleuses de nuit.",
  "liens_sociaux": "Appeler un proche, passer à l'association ou au club local, visites de convivialité.",
  "administratif_budget": "Mettre en place des **prélèvements automatiques**, ranger les papiers au même endroit, demander un **accompagnement social** si besoin."
};

// Composant principal
export default function SimulateurGirClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [variableAnswers, setVariableAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const totalSteps = QUESTIONS.length + VARIABLES.length;
  const isQuestionsPhase = currentStep < QUESTIONS.length;
  const currentQuestionIndex = currentStep;
  const currentVariableIndex = currentStep - QUESTIONS.length;

  // Calcul du GIR
  const calculateGir = (): GirResult => {
    const values = Object.values(answers);
    const severe = values.filter(v => v === 2).length;
    const partial = values.filter(v => v === 1).length;
    const severeKeys = new Set(Object.keys(answers).filter(k => answers[k] === 2));

    let gir: number;
    
    if (severe >= 4 && (severeKeys.has("Cohérence") || severeKeys.has("Orientation"))) {
      gir = 1;
    } else if (severe >= 2) {
      gir = 2;
    } else if (severe >= 1 && partial >= 2) {
      gir = 3;
    } else if (partial >= 1) {
      gir = 4;
    } else {
      gir = severe === 0 && partial === 0 ? 6 : 5;
    }

    const isApaEligible = gir >= 1 && gir <= 4;
    const recommendation = isApaEligible 
      ? "Prochaine étape : déposer une demande d'aide à l'autonomie (dossier commun APA + aides des caisses de retraite) auprès de votre Département."
      : "Prévention : en GIR 5–6, pensez aux aides de prévention via votre caisse de retraite (CARSAT le plus souvent).";

    return {
      gir,
      description: GIR_DESCRIPTIONS[gir as keyof typeof GIR_DESCRIPTIONS],
      recommendation,
      isApaEligible
    };
  };

  const handleAnswer = (value: number) => {
    if (isQuestionsPhase) {
      const question = QUESTIONS[currentQuestionIndex];
      setAnswers(prev => ({ ...prev, [question.code]: value }));
    } else {
      const variable = VARIABLES[currentVariableIndex];
      setVariableAnswers(prev => ({ ...prev, [variable.code]: value }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers({});
    setVariableAnswers({});
    setShowResult(false);
  };

  const getCurrentAnswer = (): number | undefined => {
    if (isQuestionsPhase) {
      const question = QUESTIONS[currentQuestionIndex];
      return answers[question.code];
    } else {
      const variable = VARIABLES[currentVariableIndex];
      return variableAnswers[variable.code];
    }
  };

  const isAnswered = getCurrentAnswer() !== undefined;

  if (showResult) {
    const result = calculateGir();
    const needHelp = Object.keys(answers).filter(k => answers[k] > 0);
    const variablePriorities = Object.keys(variableAnswers).filter(k => variableAnswers[k] >= 1);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Votre résultat (indicatif)
              </h1>
              <p className="text-slate-600">
                Seule une évaluation à domicile réalisée par un(e) professionnel(le) médico-social(e) fait foi
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-4">
                  <span className="text-3xl font-bold text-orange-700">GIR {result.gir}</span>
                </div>
                <p className="text-slate-600">{result.description}</p>
              </div>
              
              <div className={`p-6 rounded-xl ${result.isApaEligible ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                <h3 className="font-semibold text-slate-800 mb-2">Prochaine étape</h3>
                <p className={result.isApaEligible ? 'text-green-800' : 'text-blue-800'}>
                  {result.recommendation}
                </p>
              </div>
            </div>

            {needHelp.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Points d&apos;attention repérés</h3>
                <div className="grid gap-3">
                  {needHelp.map(key => (
                    <div key={key} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{QUESTIONS.find(q => q.code === key)?.icon}</span>
                        <div>
                          <h4 className="font-medium text-slate-800">{key}</h4>
                          <p className="text-sm text-slate-600">{CHOICES[answers[key] as keyof typeof CHOICES]}</p>
                          <p className="text-sm text-slate-700 mt-2">{PREVENTION_TIPS[key as keyof typeof PREVENTION_TIPS]}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {variablePriorities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Conseils d&apos;autonomie — vos priorités du moment</h3>
                <div className="grid gap-3">
                  {variablePriorities.map(code => {
                    const variable = VARIABLES.find(v => v.code === code);
                    return (
                      <div key={code} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{variable?.icon}</span>
                          <div>
                            <h4 className="font-medium text-slate-800">{variable?.label}</h4>
                            <p className="text-sm text-blue-700 mt-2">{VARIABLES_TIPS[code as keyof typeof VARIABLES_TIPS]}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <p className="text-slate-700">
                🔗 Pour une <strong>première estimation financière</strong> (participation, aides, heures possibles), 
                essayez le <strong>simulateur APA</strong> : {" "}
                <a href="/aides" className="text-orange-600 hover:text-orange-700 font-medium">
                  habitat-intermediaire.fr/aides
                </a>
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={restart}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                🔁 Refaire l&apos;évaluation
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            🧭 Évaluation de l&apos;autonomie — GIR
          </h1>
          <p className="text-slate-600 mb-4">
            Un repère pour ouvrir la discussion — seule une évaluation à domicile réalisée par un(e) professionnel(le) médico-social(e) fait foi
          </p>
          
          {/* Progress bar */}
          <div className="bg-slate-200 rounded-full h-2 mb-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-sm text-slate-500">
            Étape {currentStep + 1} / {totalSteps}
          </p>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            {isQuestionsPhase ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{QUESTIONS[currentQuestionIndex].icon}</span>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {QUESTIONS[currentQuestionIndex].code}
                  </h2>
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  {QUESTIONS[currentQuestionIndex].prompt}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{VARIABLES[currentVariableIndex].icon}</span>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Prévention — {VARIABLES[currentVariableIndex].code.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h2>
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  {VARIABLES[currentVariableIndex].label}
                </p>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 mb-6">
              {Object.entries(isQuestionsPhase ? CHOICES : VARS_CHOICES).map(([value, label]) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(parseInt(value))}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    getCurrentAnswer() === parseInt(value)
                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1 py-3 px-6 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>
          <button
            onClick={nextStep}
            disabled={!isAnswered}
            className="flex-1 py-3 px-6 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentStep === totalSteps - 1 ? "Voir mon résultat" : "Continuer"}
          </button>
        </div>

        {/* Info expandable */}
        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white rounded-xl p-6 shadow-md"
          >
            <h3 className="font-semibold text-slate-800 mb-3">ℹ️ La grille AGGIR, en deux mots</h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>• La <strong>grille AGGIR</strong> permet d&apos;apprécier l&apos;autonomie au quotidien et classe en <strong>GIR 1 à 6</strong>.</p>
              <p>• <strong>GIR 1–4</strong> : pertes d&apos;autonomie ouvrant en général droit à l&apos;<strong>APA</strong>.</p>
              <p>• <strong>GIR 5–6</strong> : autonomie globalement préservée, avec possibilités d&apos;<strong>aides de prévention</strong>.</p>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="font-medium mb-2">Ressources officielles :</p>
                <p>• <a href="https://www.pour-les-personnes-agees.gouv.fr/preserver-son-autonomie/perte-d-autonomie-evaluation-et-droits/comment-fonctionne-la-grille-aggir" className="text-orange-600 hover:text-orange-700">Explications grand public</a></p>
                <p>• <a href="https://www.pour-les-personnes-agees.gouv.fr/vivre-a-domicile/beneficier-d-aide-a-domicile/faire-une-demande-d-aides-a-l-autonomie-a-domicile" className="text-orange-600 hover:text-orange-700">Faire une demande d&apos;aides à l&apos;autonomie à domicile</a></p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}