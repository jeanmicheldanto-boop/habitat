"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Icônes SVG monochromes modernes
const Icons = {
  brain: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.33 12.91C21.42 14.46 20.71 15.95 19.44 16.86L19.46 17.78C19.46 19.15 18.35 20.26 16.98 20.26C15.61 20.26 14.5 19.15 14.5 17.78V16.5C14.5 15.67 13.83 15 13 15S11.5 15.67 11.5 16.5V17.78C11.5 19.15 10.39 20.26 9.02 20.26C7.65 20.26 6.54 19.15 6.54 17.78L6.56 16.86C5.29 15.95 4.58 14.46 4.67 12.91C4.75 11.35 5.61 9.96 6.95 9.17C6.95 9.17 7.64 8.8 8.5 8.5C9.14 6.66 10.85 5.33 12.83 5.06C15.5 4.72 18 6.5 18.5 9.17C19.36 9.47 20.05 9.84 20.05 9.84C21.39 10.63 22.25 12.02 21.33 12.91Z"/>
    </svg>
  ),
  compass: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6L8 14L16 10L12 6Z"/>
    </svg>
  ),
  shower: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 20H15V22H9V20ZM12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 10V12H3V10H21ZM5 14H19V16H5V14ZM12 8C10.9 8 10 7.1 10 6H14C14 7.1 13.1 8 12 8Z"/>
    </svg>
  ),
  shirt: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 4L18.29 8.29L22 9L18.5 12.5L19.5 16L16 14L12.5 16L13.5 12.5L10 9L13.71 8.29L15 4V2H9V4L10.29 8.29L14 9L10.5 12.5L11.5 16L8 14L4.5 16L5.5 12.5L2 9L5.71 8.29L7 4V2H17V4H16Z"/>
    </svg>
  ),
  utensils: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.1 13.34L2.91 8.15C2.66 7.9 2.66 7.47 2.91 7.22L7.22 2.91C7.47 2.66 7.9 2.66 8.15 2.91L13.34 8.1C14.93 6.51 17.45 6.51 19.04 8.1S21.49 12.07 19.9 13.66L13.66 19.9C12.07 21.49 9.55 21.49 7.96 19.9S6.47 16.93 8.06 15.34L8.1 13.34Z"/>
    </svg>
  ),
  toilet: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 12H17V10C17 8.9 16.1 8 15 8H9C7.9 8 7 8.9 7 10V12H5C4.45 12 4 12.45 4 13S4.45 14 5 14H7V18C7 19.1 7.9 20 9 20H15C16.1 20 17 19.1 17 18V14H19C19.55 14 20 13.55 20 13S19.55 12 19 12ZM15 18H9V10H15V18Z"/>
    </svg>
  ),
  person: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12C14.21 12 16 10.21 16 8S14.21 4 12 4 8 5.79 8 8 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
    </svg>
  ),
  home: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"/>
    </svg>
  ),
  walk: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.5 5.5C14.6 5.5 15.5 4.6 15.5 3.5S14.6 1.5 13.5 1.5 11.5 2.4 11.5 3.5 12.4 5.5 13.5 5.5ZM9.8 8.9L7 23H9.1L10.9 15L13 17V23H15V15.5L12.9 13.5L13.5 10.5C14.8 12 16.8 13 19 13V11C17.1 11 15.5 10 14.7 8.6L13.7 7C13.3 6.4 12.7 6 12 6S10.7 6.4 10.3 7L7.8 10.5L9.8 8.9Z"/>
    </svg>
  ),
  phone: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"/>
    </svg>
  ),
  activity: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12C22 17.5 17.5 22 12 22S2 17.5 2 12 6.5 2 12 2 22 6.5 22 12ZM12 7C9.8 7 8 8.8 8 11S9.8 15 12 15 16 13.2 16 11 14.2 7 12 7Z"/>
    </svg>
  ),
  drink: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 3V7H10.5V19C10.5 20.11 11.39 21 12.5 21S14.5 20.11 14.5 19V7H20V3H5ZM7 5H18V5.5H7V5Z"/>
    </svg>
  ),
  sleep: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.75 4.09L15.22 6.03L16.13 9.09L13.5 7.28L10.87 9.09L11.78 6.03L9.25 4.09L12.44 4L13.5 1L14.56 4L17.75 4.09ZM21.25 11L19.61 12.25L20.2 14.23L18.5 13.06L16.8 14.23L17.39 12.25L15.75 11L17.81 10.95L18.5 9L19.19 10.95L21.25 11ZM18.97 15.95C19.8 15.87 20.69 17.05 20.16 17.8C19.84 18.25 19.5 18.67 19.08 19.07C15.17 23 8.84 23 4.94 19.07C1.03 15.17 1.03 8.83 4.94 4.93C5.34 4.53 5.76 4.17 6.21 3.85C6.96 3.32 8.14 4.21 8.06 5.04C7.79 7.9 8.75 10.87 10.95 13.06C13.14 15.26 16.1 16.22 18.97 15.95Z"/>
    </svg>
  ),
  security: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.5 8.1 14.5 9.5V10.5H15V16H9V10.5H9.5V9.5C9.5 8.1 10.6 7 12 7ZM12 8.2C11.2 8.2 10.7 8.7 10.7 9.5V10.5H13.3V9.5C13.3 8.7 12.8 8.2 12 8.2Z"/>
    </svg>
  ),
  handshake: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.5 12C19.4 12 21 13.6 21 15.5S19.4 19 17.5 19 14 17.4 14 15.5 15.6 12 17.5 12ZM6.5 12C8.4 12 10 13.6 10 15.5S8.4 19 6.5 19 3 17.4 3 15.5 4.6 12 6.5 12ZM12 2.5C13.4 2.5 14.5 3.6 14.5 5S13.4 7.5 12 7.5 9.5 6.4 9.5 5 10.6 2.5 12 2.5Z"/>
    </svg>
  ),
  care: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.14 12.94C19.73 12.35 20.04 11.53 19.96 10.63C19.83 9.24 18.71 8.12 17.32 7.99C16.42 7.91 15.6 8.22 15.01 8.81L12 11.82L8.99 8.81C8.4 8.22 7.58 7.91 6.68 7.99C5.29 8.12 4.17 9.24 4.04 10.63C3.96 11.53 4.27 12.35 4.86 12.94L12 20.08L19.14 12.94Z"/>
    </svg>
  ),
  glasses: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M2 7H6C7.1 7 8 7.9 8 9V15C8 16.1 7.1 17 6 17H2C0.9 17 0 16.1 0 15V9C0 7.9 0.9 7 2 7ZM18 7H22C23.1 7 24 7.9 24 9V15C24 16.1 23.1 17 22 17H18C16.9 17 16 16.1 16 15V9C16 7.9 16.9 7 18 7ZM8 12H16"/>
    </svg>
  ),
  document: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM6 20V4H13V9H18V20H6Z"/>
    </svg>
  )
};

// Types
interface Question {
  code: string;
  iconKey: string;
  prompt: string;
}

interface Variable {
  code: string;
  iconKey: string;
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
    iconKey: "brain",
    prompt: "Au quotidien, est-ce que vous vous sentez clair(e) dans vos idées, capable de faire des choix et de vous faire comprendre sans difficulté ?"
  },
  {
    code: "Orientation",
    iconKey: "compass",
    prompt: "Vous repérer dans le temps et les lieux est-il facile (date, rendez-vous, trajet connu) ?"
  },
  {
    code: "Toilette",
    iconKey: "shower",
    prompt: "Pour la toilette (se laver, se sécher), vous débrouillez-vous sans aide ?"
  },
  {
    code: "Habillage",
    iconKey: "shirt",
    prompt: "Pour vous habiller (choix des vêtements, fermetures, chaussures), ça va tout seul ?"
  },
  {
    code: "Alimentation",
    iconKey: "utensils",
    prompt: "Pour préparer/prendre vos repas et boire suffisamment, avez-vous besoin d'un coup de main ?"
  },
  {
    code: "Élimination",
    iconKey: "toilet",
    prompt: "Aller aux toilettes (y aller, s'installer, se rhabiller) est-ce gérable seul(e) ?"
  },
  {
    code: "Transferts",
    iconKey: "person",
    prompt: "Vous lever, vous asseoir, vous coucher — pouvez-vous le faire sans assistance ?"
  },
  {
    code: "Déplacements intérieurs",
    iconKey: "home",
    prompt: "Vous déplacer **dans le logement** (avec ou sans aide technique), est-ce aisé ?"
  },
  {
    code: "Déplacements extérieurs",
    iconKey: "walk",
    prompt: "Sortir **à l'extérieur** pour de petites courses/rendez-vous : le faites-vous sans aide humaine ?"
  },
  {
    code: "Communication",
    iconKey: "phone",
    prompt: "Téléphone, sonnette, alarme : êtes-vous à l'aise pour **joindre quelqu'un** en cas de besoin ?"
  }
];

const VARIABLES: Variable[] = [
  {
    code: "activité_physique",
    iconKey: "activity",
    label: "Bouger un peu chaque jour (marche, étirements) vous est-il facile en ce moment ?"
  },
  {
    code: "nutrition_hydratation",
    iconKey: "drink",
    label: "Buvez-vous suffisamment et vos repas sont-ils réguliers et équilibrés ?"
  },
  {
    code: "sommeil",
    iconKey: "sleep",
    label: "Votre sommeil est-il plutôt réparateur ?"
  },
  {
    code: "vision_audition",
    iconKey: "glasses",
    label: "Vision et audition : êtes-vous bien équipé(e) (lunettes, appareil) et à jour des contrôles ?"
  },
  {
    code: "sécurité_logement",
    iconKey: "security",
    label: "Votre logement est-il sécurisé (éclairage, tapis antidérapants, barres d&apos;appui) ?"
  },
  {
    code: "liens_sociaux",
    iconKey: "handshake",
    label: "Avez-vous des contacts réguliers (famille, voisins, associations) ?"
  },
  {
    code: "administratif_budget",
    iconKey: "document",
    label: "Vous sentez-vous à l&apos;aise avec les démarches administratives et le budget ?"
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
                        <span className="text-orange-600">{Icons[QUESTIONS.find(q => q.code === key)?.iconKey as keyof typeof Icons]}</span>
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
                          <span className="text-blue-600">{Icons[variable?.iconKey as keyof typeof Icons]}</span>
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
                  <span className="text-orange-600">{Icons[QUESTIONS[currentQuestionIndex].iconKey as keyof typeof Icons]}</span>
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
                  <span className="text-blue-600">{Icons[VARIABLES[currentVariableIndex].iconKey as keyof typeof Icons]}</span>
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