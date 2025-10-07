"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Types
interface Solution {
  key: string;
  cat: string;
  label: string;
  for_who: string;
  retenir: string;
  reflexe: string;
  descr: string;
  autonomy: number;
  collective: number;
  services: number;
  budget: number;
  intergen: number;
  rural: number;
  urban: number;
  privatif: boolean;
  partage: boolean;
  engagement: number;
  familial: number;
  image: string;
}

interface UserPreferences {
  autonomy: number;
  collective: number;
  services: number;
  budget: number;
  intergen: number;
  rural: number;
  urban: number;
  engagement: number;
  familial: number;
  privatif: number;
  partage: number;
}

// Données des solutions
const solutions: Solution[] = [
  // Habitat individuel
  {
    key: "hab_regroupe",
    cat: "Habitat individuel",
    label: "Habitat regroupé",
    for_who: "Garder son indépendance sans s'isoler.",
    retenir: "Compromis souple, souvent porté par des collectivités.",
    reflexe: "Vérifier le dynamisme (animations, vie collective).",
    descr: "Petits logements côte à côte avec espaces communs.",
    autonomy: 5,
    collective: 2,
    services: 1,
    budget: 2,
    intergen: 1,
    rural: 3,
    urban: 3,
    privatif: true,
    partage: false,
    engagement: 1,
    familial: 1,
    image: "/habitat_regroupe.webp"
  },
  {
    key: "village_seniors",
    cat: "Habitat individuel",
    label: "Village seniors",
    for_who: "Seniors actifs souhaitant confort et tranquillité entre pairs.",
    retenir: "Convivialité et sécurité.",
    reflexe: "Attention aux frais annexes (entretien, services).",
    descr: "Petit quartier pensé pour retraités, maisons/appartements adaptés.",
    autonomy: 5,
    collective: 2,
    services: 2,
    budget: 3,
    intergen: 0,
    rural: 3,
    urban: 3,
    privatif: true,
    partage: false,
    engagement: 1,
    familial: 1,
    image: "/village_seniors.webp"
  },
  {
    key: "beguinage",
    cat: "Habitat individuel",
    label: "Béguinage",
    for_who: "Seniors autonomes en petit collectif.",
    retenir: "Esprit simple et solidaire.",
    reflexe: "Vérifier l'animation réelle.",
    descr: "Logements indépendants autour d'espaces communs, ambiance conviviale.",
    autonomy: 5,
    collective: 2,
    services: 1,
    budget: 2,
    intergen: 1,
    rural: 3,
    urban: 2,
    privatif: true,
    partage: false,
    engagement: 2,
    familial: 1,
    image: "/beguinage.webp"
  },
  // Habitat partagé
  {
    key: "hab_inclusif",
    cat: "Habitat partagé",
    label: "Habitat inclusif",
    for_who: "Autonomie + vie collective, cadre sécurisant.",
    retenir: "Projet collectif en plein essor (vie sociale & partagée).",
    reflexe: "Bien comprendre le projet de vie sociale.",
    descr: "Logements regroupés avec projet de vie sociale et partagée.",
    autonomy: 4,
    collective: 4,
    services: 2,
    budget: 2,
    intergen: 1,
    rural: 2,
    urban: 3,
    privatif: true,
    partage: false,
    engagement: 4,
    familial: 1,
    image: "/habitat_inclusif.webp"
  },
  {
    key: "accueil_familial",
    cat: "Habitat partagé",
    label: "Accueil familial",
    for_who: "Cadre intime, souvent plus abordable.",
    retenir: "Relation humaine forte.",
    reflexe: "Tester la compatibilité avant de s'engager.",
    descr: "Accueil d'1 à 2 personnes âgées au domicile d'un accueillant.",
    autonomy: 3,
    collective: 3,
    services: 2,
    budget: 1,
    intergen: 0,
    rural: 3,
    urban: 2,
    privatif: false,
    partage: true,
    engagement: 3,
    familial: 5,
    image: "/accueil_familial.webp"
  },
  {
    key: "colo_services",
    cat: "Habitat partagé",
    label: "Colocation avec services",
    for_who: "Éviter la solitude tout en mutualisant.",
    retenir: "Équilibre intimité / vie commune.",
    reflexe: "Clarifier le rôle du gestionnaire.",
    descr: "Maison adaptée partagée, services mutualisés.",
    autonomy: 4,
    collective: 4,
    services: 2,
    budget: 2,
    intergen: 1,
    rural: 2,
    urban: 3,
    privatif: false,
    partage: true,
    engagement: 3,
    familial: 2,
    image: "/colocation_avec_services.webp"
  },
  {
    key: "hab_alternatif",
    cat: "Habitat partagé",
    label: "Habitat alternatif",
    for_who: "Personnes souhaitant s'engager dans un collectif.",
    retenir: "Enthousiasmant mais exigeant.",
    reflexe: "Mesurer son niveau d'implication.",
    descr: "Éco-hameaux, coopératives, résidences solidaires, etc.",
    autonomy: 4,
    collective: 4,
    services: 1,
    budget: 1,
    intergen: 2,
    rural: 3,
    urban: 2,
    privatif: false,
    partage: true,
    engagement: 5,
    familial: 1,
    image: "/habitat_alternatif.webp"
  },
  {
    key: "intergen",
    cat: "Habitat partagé",
    label: "Habitat intergénérationnel",
    for_who: "Seniors ouverts à la mixité avec les jeunes.",
    retenir: "Riche humainement, demande flexibilité.",
    reflexe: "Clarifier les règles de vie commune.",
    descr: "Partage de logement ou d'immeuble avec échanges de services.",
    autonomy: 4,
    collective: 4,
    services: 1,
    budget: 1,
    intergen: 5,
    rural: 2,
    urban: 4,
    privatif: false,
    partage: true,
    engagement: 3,
    familial: 1,
    image: "/habitat_intergenerationnel.webp"
  },
  {
    key: "maf",
    cat: "Habitat partagé",
    label: "Maison d'accueil familial",
    for_who: "Personnes fragiles, ambiance familiale.",
    retenir: "Proximité humaine + encadrement solide.",
    reflexe: "Regarder taille/ratio encadrement-résidents.",
    descr: "Plusieurs accueillants familiaux regroupent leurs accueils.",
    autonomy: 2,
    collective: 4,
    services: 3,
    budget: 2,
    intergen: 0,
    rural: 3,
    urban: 2,
    privatif: false,
    partage: true,
    engagement: 3,
    familial: 4,
    image: "/maison_accueil_familial.webp"
  },
  // Résidence légère
  {
    key: "marpa",
    cat: "Résidence légère",
    label: "MARPA",
    for_who: "Personnes âgées en milieu rural.",
    retenir: "Proximité et ancrage territorial.",
    reflexe: "Vérifier la viabilité financière.",
    descr: "Petites structures rurales (≤25), portées par les communes.",
    autonomy: 4,
    collective: 3,
    services: 2,
    budget: 2,
    intergen: 0,
    rural: 5,
    urban: 1,
    privatif: true,
    partage: false,
    engagement: 1,
    familial: 1,
    image: "/marpa.webp"
  },
  {
    key: "res_autonomie",
    cat: "Résidence légère",
    label: "Résidence autonomie",
    for_who: "Seniors autonomes mais isolés.",
    retenir: "Compromis abordable (variable selon commune).",
    reflexe: "Regarder état du bâti et la qualité des animations.",
    descr: "Appartements adaptés + services collectifs, gestion communale.",
    autonomy: 4,
    collective: 3,
    services: 3,
    budget: 2,
    intergen: 1,
    rural: 3,
    urban: 3,
    privatif: true,
    partage: false,
    engagement: 1,
    familial: 1,
    image: "/residence_autonomie.webp"
  },
  {
    key: "res_services",
    cat: "Résidence légère",
    label: "Résidence services seniors",
    for_who: "Confort + services clés en main.",
    retenir: "Attractif mais coûteux.",
    reflexe: "Décortiquer charges & services.",
    descr: "Logements indépendants avec services hôteliers.",
    autonomy: 4,
    collective: 3,
    services: 5,
    budget: 5,
    intergen: 1,
    rural: 2,
    urban: 4,
    privatif: true,
    partage: false,
    engagement: 1,
    familial: 1,
    image: "/residence_services_seniors.webp"
  }
];

// Icônes monochromes contemporaines
const icons = {
  autonomy: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7.5L21 9ZM15 9.5C15 11.2 13.8 12.5 12.1 12.9L11.9 20.9C11.9 21.5 11.4 22 10.8 22S9.7 21.5 9.7 20.9L9.5 12.9C7.8 12.5 6.5 11.2 6.5 9.5C6.5 7.6 8 6 10 6S13.5 7.6 13.5 9.5H15Z"/>
    </svg>
  ),
  collective: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 13C20.4 13 24 14.8 24 17V20H8V17C8 14.8 11.6 13 16 13M8 4C10.2 4 12 5.8 12 8S10.2 12 8 12 4 10.2 4 8 5.8 4 8 4M8 13C12.4 13 16 14.8 16 17V20H0V17C0 14.8 3.6 13 8 13Z"/>
    </svg>
  ),
  services: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M12 17C11.45 17 11 16.55 11 16V12C11 11.45 11.45 11 12 11S13 11.45 13 12V16C13 16.55 12.55 17 12 17M12 9C11.45 9 11 8.55 11 8S11.45 7 12 7 13 7.45 13 8 12.55 9 12 9Z"/>
    </svg>
  ),
  budget: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 15H9C9 16.08 10.37 17 12 17S15 16.08 15 15C15 13.9 13.96 13.5 11.76 12.97C9.64 12.44 7 11.78 7 9C7 7.21 8.47 5.69 10.5 5.18V3H13.5V5.18C15.53 5.69 17 7.21 17 9H15C15 7.92 13.63 7 12 7S9 7.92 9 9C9 10.1 10.04 10.5 12.24 11.03C14.36 11.56 17 12.22 17 15C17 16.79 15.53 18.31 13.5 18.82V21H10.5V18.82C8.47 18.31 7 16.79 7 15Z"/>
    </svg>
  ),
  home: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"/>
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 9.2H7V19H5V9.2M10.6 5H12.6V19H10.6V5M16.2 13H18.2V19H16.2V13Z"/>
    </svg>
  )
};

export default function SimulateurHabitatClient() {
  const [formData, setFormData] = useState({
    autonomie: 7,
    social: 6,
    budget_sens: 7,
    services_wish: 4,
    privatif: "Logement privatif",
    intergen_pref: "Moyenne",
    territoire: "Peu d'importance",
    engagement_pref: "Faible",
    familial_pref: "Moyen"
  });

  const [results, setResults] = useState<Array<Solution & { score: number }> | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateResults = () => {
    const rescale = (x: number) => (x / 10.0) * 5.0;

    const prefs: UserPreferences = {
      autonomy: rescale(formData.autonomie),
      collective: rescale(formData.social),
      services: rescale(formData.services_wish),
      budget: rescale(10 - formData.budget_sens),
      intergen: formData.intergen_pref === "Faible" ? 1 : formData.intergen_pref === "Moyenne" ? 3 : 5,
      rural: formData.territoire === "Rural" ? 3 : formData.territoire === "Urbain" ? 1 : 2,
      urban: formData.territoire === "Urbain" ? 3 : formData.territoire === "Rural" ? 1 : 2,
      engagement: formData.engagement_pref === "Faible" ? 1 : formData.engagement_pref === "Moyenne" ? 3 : 5,
      familial: formData.familial_pref === "Faible" ? 1 : formData.familial_pref === "Moyen" ? 3 : 5,
      privatif: formData.privatif === "Logement privatif" ? 1 : formData.privatif === "Colocation" ? 0 : 0.5,
      partage: formData.privatif === "Colocation" ? 1 : formData.privatif === "Logement privatif" ? 0 : 0.5,
    };

    const weights = {
      autonomy: 1.0,
      collective: 1.0,
      services: 0.9,
      budget: 1.1,
      intergen: 0.7,
      rural: 0.5,
      urban: 0.5,
      engagement: 0.6,
      familial: 0.8,
      privatif: 0.6,
      partage: 0.6
    };

    const scoreRow = (solution: Solution) => {
      let score = 0.0;
      
      Object.entries(weights).forEach(([key, weight]) => {
        if (key === "privatif" || key === "partage") {
          const pref = prefs[key as keyof UserPreferences];
          const target = solution[key as keyof Solution] ? 1.0 : 0.0;
          score += weight * (5.0 - Math.abs(5.0 * pref - 5.0 * target));
        } else {
          const prefValue = prefs[key as keyof UserPreferences];
          const solutionValue = solution[key as keyof Solution] as number;
          score += weight * (prefValue * (solutionValue / 5.0));
        }
      });

      // Pénalité supplémentaire si budget très sensible et solution coûteuse
      if (formData.budget_sens >= 7 && solution.budget >= 4) {
        score -= 1.0;
      }

      return score;
    };

    const scoredResults = solutions
      .map(solution => ({
        ...solution,
        score: scoreRow(solution)
      }))
      .sort((a, b) => b.score - a.score);

    setResults(scoredResults);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setResults(null);
    setFormData({
      autonomie: 7,
      social: 6,
      budget_sens: 7,
      services_wish: 4,
      privatif: "Logement privatif",
      intergen_pref: "Moyenne",
      territoire: "Peu d'importance",
      engagement_pref: "Faible",
      familial_pref: "Moyen"
    });
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
            {icons.home}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simulateur d&apos;orientation
          </h1>
          <h2 className="text-2xl text-orange-600 mb-4">Habitat intermédiaire</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez les solutions qui correspondent à vos besoins et préférences parmi les différents types d&apos;habitat intermédiaire.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
                Votre situation
              </h3>

              <div className="space-y-8">
                {/* Sliders principaux */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Autonomie (capacité à gérer le quotidien)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.autonomie}
                      onChange={(e) => handleInputChange('autonomie', parseInt(e.target.value))}
                      className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Accompagnement important</span>
                      <span className="font-medium text-orange-600">{formData.autonomie}/10</span>
                      <span>Autonome</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Besoin de vie sociale partagée
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.social}
                      onChange={(e) => handleInputChange('social', parseInt(e.target.value))}
                      className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Faible</span>
                      <span className="font-medium text-orange-600">{formData.social}/10</span>
                      <span>Élevé</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Sensibilité au budget / charges
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.budget_sens}
                      onChange={(e) => handleInputChange('budget_sens', parseInt(e.target.value))}
                      className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Peu sensible</span>
                      <span className="font-medium text-orange-600">{formData.budget_sens}/10</span>
                      <span>Très sensible</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Souhait de services sur place
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.services_wish}
                      onChange={(e) => handleInputChange('services_wish', parseInt(e.target.value))}
                      className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Peu important</span>
                      <span className="font-medium text-orange-600">{formData.services_wish}/10</span>
                      <span>Très important</span>
                    </div>
                  </div>
                </div>

                {/* Sélections */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Préférence : logement privatif vs colocation
                    </label>
                    <select
                      value={formData.privatif}
                      onChange={(e) => handleInputChange('privatif', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Colocation">Colocation</option>
                      <option value="Indifférent">Indifférent</option>
                      <option value="Logement privatif">Logement privatif</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Ouverture à l&apos;intergénérationnel
                    </label>
                    <select
                      value={formData.intergen_pref}
                      onChange={(e) => handleInputChange('intergen_pref', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Faible">Faible</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Forte">Forte</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Contexte de vie préféré
                    </label>
                    <select
                      value={formData.territoire}
                      onChange={(e) => handleInputChange('territoire', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Peu d'importance">Peu d&apos;importance</option>
                      <option value="Urbain">Urbain</option>
                      <option value="Périurbain">Périurbain</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Engagé autour d&apos;un projet commun
                    </label>
                    <select
                      value={formData.engagement_pref}
                      onChange={(e) => handleInputChange('engagement_pref', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Faible">Faible</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Forte">Forte</option>
                    </select>
                  </div>

                  <div className="space-y-3 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Intérêt pour un cadre familial
                    </label>
                    <select
                      value={formData.familial_pref}
                      onChange={(e) => handleInputChange('familial_pref', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Faible">Faible</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Fort">Fort</option>
                    </select>
                  </div>
                </div>

                <div className="text-center pt-6">
                  <button
                    onClick={calculateResults}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Voir les recommandations
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Header des résultats */}
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-4">
                  {icons.chart}
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Vos recommandations personnalisées
                </h3>
                <p className="text-gray-600 mb-6">
                  Classement par adéquation globale avec vos préférences
                </p>
                <button
                  onClick={resetForm}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Modifier mes réponses
                </button>
              </div>

              {/* Top 3 recommandations */}
              <div className="space-y-6">
                {results?.slice(0, 3).map((solution, index) => (
                  <motion.div
                    key={solution.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 relative h-48 md:h-auto">
                        <Image
                          src={solution.image}
                          alt={solution.label}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          #{index + 1}
                        </div>
                        <div className="absolute top-4 right-4 bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                          {solution.score.toFixed(1)}
                        </div>
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="text-sm text-orange-600 font-medium mb-2">
                          {solution.cat}
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">
                          {solution.label}
                        </h4>
                        <p className="text-gray-700 mb-4">
                          {solution.descr}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <span className="text-sm text-orange-600 font-medium">👤 Pour qui ?</span>
                            <span className="text-sm text-gray-700">{solution.for_who}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-sm text-orange-600 font-medium">⭐ À retenir</span>
                            <span className="text-sm text-gray-700">{solution.retenir}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-sm text-orange-600 font-medium">🧭 Réflexe</span>
                            <span className="text-sm text-gray-700">{solution.reflexe}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <div className="inline-flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-xs">
                            {icons.autonomy}
                            <span>Autonomie {solution.autonomy}/5</span>
                          </div>
                          <div className="inline-flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-xs">
                            {icons.collective}
                            <span>Collectif {solution.collective}/5</span>
                          </div>
                          <div className="inline-flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-xs">
                            {icons.services}
                            <span>Services {solution.services}/5</span>
                          </div>
                          <div className="inline-flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-xs">
                            {icons.budget}
                            <span>Budget {solution.budget}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Graphique de comparaison */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">
                  Comparaison des 6 meilleures solutions
                </h4>
                <div className="space-y-3">
                  {results?.slice(0, 6).map((solution, index) => (
                    <div key={solution.key} className="flex items-center space-x-4">
                      <div className="w-32 text-sm text-gray-700 truncate">
                        {solution.label}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(solution.score / (results[0]?.score || 1)) * 100}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="bg-orange-600 h-2 rounded-full"
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-600 text-right">
                        {solution.score.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conseil final */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <h4 className="font-semibold text-orange-900 mb-3">
                  💡 Conseil
                </h4>
                <p className="text-orange-800 text-sm leading-relaxed">
                  Ce simulateur fournit une <strong>orientation éditoriale</strong>. Avant décision :
                  visiter les lieux, clarifier les coûts/charges et les services réellement inclus,
                  vérifier l&apos;animation de la vie sociale, la gouvernance et l&apos;ancrage local.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ea580c;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ea580c;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}