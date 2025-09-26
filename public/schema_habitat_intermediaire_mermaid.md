# Schéma ER (Mermaid) – Habitat-Intermédiaire (v2)

```mermaid
erDiagram
  ETABLISSEMENTS {
    uuid id PK
    text nom
    text presentation
    text adresse_l1
    text adresse_l2
    text code_postal
    text commune
    text code_insee
    text departement
    text region
    text pays
    point geom
    text geocode_precision
    text statut_editorial
    text eligibilite_statut
    text public_cible[]
    text source
    text url_source
    date date_observation
    date date_verification
    float confiance_score
    timestamptz created_at
    timestamptz updated_at
  }

  CATEGORIES {
    uuid id PK
    text libelle
  }

  SOUS_CATEGORIES {
    uuid id PK
    uuid categorie_id FK
    text libelle
    text alias[]
  }

  ETABLISSEMENT_SOUS_CATEGORIE {
    uuid etablissement_id FK
    uuid sous_categorie_id FK
  }

  LOGEMENTS_TYPES {
    uuid id PK
    uuid etablissement_id FK
    text libelle
    numeric surface_min
    numeric surface_max
    boolean meuble
    boolean pmr
    boolean domotique
    integer nb_unites
  }

  TARIFICATIONS {
    uuid id PK
    uuid etablissement_id FK
    uuid logements_type_id FK "nullable"
    text periode  "YYYY-MM or YYYY"
    // v2 – champs pour cas simples :
    text fourchette_prix  "€, €€, €€€"
    numeric prix_min
    numeric prix_max
    // champs précis (optionnels) :
    numeric loyer_base
    numeric charges
    text devise
    text source
    date date_observation
  }

  SERVICES {
    uuid id PK
    text libelle
  }

  ETABLISSEMENT_SERVICE {
    uuid etablissement_id FK
    uuid service_id FK
  }

  DISPONIBILITES {
    uuid id PK
    uuid etablissement_id FK
    date date_capture
    text statut_disponibilite "oui|non|nous_contacter|inconnu"
    integer nb_unites_dispo
    date date_prochaine_dispo
    text canal
    text note
  }

  MEDIAS {
    uuid id PK
    uuid etablissement_id FK
    text storage_path
    text alt_text
    integer priority
    text licence
    text credit
    text source_url
    timestamptz created_at
  }

  ETABLISSEMENTS ||--o{ LOGEMENTS_TYPES : "dispose de"
  ETABLISSEMENTS ||--o{ TARIFICATIONS : "publie"
  LOGEMENTS_TYPES ||--o{ TARIFICATIONS : "optionnel"
  ETABLISSEMENTS ||--o{ DISPONIBILITES : "observe"
  ETABLISSEMENTS ||--o{ MEDIAS : "illustre"
  ETABLISSEMENTS ||--o{ ETABLISSEMENT_SERVICE : "propose"
  SERVICES ||--o{ ETABLISSEMENT_SERVICE : "est lié à"
  CATEGORIES ||--o{ SOUS_CATEGORIES : "regroupe"
  ETABLISSEMENTS ||--o{ ETABLISSEMENT_SOUS_CATEGORIE : "classé dans"
  SOUS_CATEGORIES ||--o{ ETABLISSEMENT_SOUS_CATEGORIE : "lié à"
```
