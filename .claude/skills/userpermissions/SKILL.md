
---
description: Rôles & Permissions — Fausse erreur à la modification
---

## Description

1. Rôles & Permissions — Fausse erreur à la modification
Lors de la modification d'une permission, un message d'erreur s'affiche systématiquement, alors que la modification est en réalité bien enregistrée. Ce comportement crée une confusion et une perte de confiance de l'utilisateur dans le système. 
2.Recommandation : corriger la gestion des retours d'état après modification afin d'afficher un message de succès cohérent avec l'action effectuée.

## Instructions
- Corriger la gestion des retours d'état après modification afin d'afficher un message de succès cohérent avec l'action effectuée.
- Vérifier que les messages d'erreur sont uniquement affichés en cas d'erreur réelle.
- Vérifier que les messages de succès sont affichés en cas de succès.
- Ne pas déployer si des erreurs critiques sont détectées.

