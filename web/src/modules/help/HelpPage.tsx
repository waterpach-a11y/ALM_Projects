import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const HelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections: HelpSection[] = [
    {
      id: 'overview',
      title: 'Vue d\'ensemble',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <p className="text-slate-700">
            Bienvenue dans l'application ALM (Application Lifecycle Management). Cette application vous permet de gérer
            l'ensemble du cycle de vie de vos projets logiciels, de la planification à la livraison.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="p-4 bg-gradient-to-br from-indigo-50 to-white">
              <h3 className="font-semibold text-slate-900 mb-2">Gestion de Projets</h3>
              <p className="text-sm text-slate-600">
                Créez et gérez vos projets, assignez des membres d'équipe et suivez la progression globale.
              </p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white">
              <h3 className="font-semibold text-slate-900 mb-2">Backlog Hiérarchique</h3>
              <p className="text-sm text-slate-600">
                Organisez votre travail en Epics, Stories, Tasks et Requirements avec une structure claire.
              </p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-white">
              <h3 className="font-semibold text-slate-900 mb-2">Gestion de Sprints</h3>
              <p className="text-sm text-slate-600">
                Planifiez et suivez vos sprints avec des tableaux Kanban et des graphiques de burndown.
              </p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-white">
              <h3 className="font-semibold text-slate-900 mb-2">Tableaux de Bord</h3>
              <p className="text-sm text-slate-600">
                Visualisez les métriques de votre projet avec des graphiques et indicateurs de performance.
              </p>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'projects',
      title: 'Projets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Création de Projet</h3>
            <p className="text-slate-700 mb-3">
              Pour créer un nouveau projet, accédez à la page "Create Project" depuis le menu. Vous devrez :
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>Définir un nom et une description pour le projet</li>
              <li>Sélectionner un chef de projet (Project Manager)</li>
              <li>Ajouter des membres d'équipe (optionnel)</li>
              <li>Définir une date limite et un statut initial</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Gestion des Membres</h3>
            <p className="text-slate-700 mb-3">
              Les membres du projet peuvent être ajoutés ou retirés depuis la page de paramètres du projet. Seuls les
              administrateurs et les chefs de projet peuvent modifier les membres.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Statuts de Projet</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="default">Planned</Badge>
              <Badge variant="warning">In Progress</Badge>
              <Badge variant="error">Blocked</Badge>
              <Badge variant="success">Closed</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'backlog',
      title: 'Backlog',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Structure Hiérarchique</h3>
            <p className="text-slate-700 mb-4">
              Le backlog est organisé en 4 niveaux hiérarchiques :
            </p>
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-indigo-50 to-white border-l-4 border-indigo-500">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-700 font-bold">E</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Epic</h4>
                    <p className="text-sm text-slate-600">
                      Un Epic représente une grande fonctionnalité ou un objectif majeur. Il peut contenir plusieurs
                      Stories. Les Epics ont des priorités (low, medium, high), des valeurs métier, des niveaux de
                      risque, et peuvent être assignés à des membres de l'équipe.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-r from-emerald-50 to-white border-l-4 border-emerald-500">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-700 font-bold">S</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Story</h4>
                    <p className="text-sm text-slate-600">
                      Une Story (User Story) décrit une fonctionnalité du point de vue de l'utilisateur. Elle appartient
                      à un Epic et peut contenir plusieurs Tasks. Les Stories ont des story points, une complexité (XS,
                      S, M, L, XL), une valeur métier, et des critères d'acceptation.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-amber-700 font-bold">T</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Task</h4>
                    <p className="text-sm text-slate-600">
                      Une Task est une unité de travail concrète qui appartient à une Story. Les Tasks ont des heures
                      estimées, du temps passé, des tags, et peuvent être bloquées avec une raison. Elles peuvent être
                      assignées à des développeurs.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-white border-l-4 border-purple-500">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-700 font-bold">R</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Requirement</h4>
                    <p className="text-sm text-slate-600">
                      Un Requirement définit un besoin fonctionnel ou technique. Il peut être lié à une Task et a des
                      critères d'acceptation, des cas de test, et peut être vérifié (verified).
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Fonctionnalités</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>
                <strong>Drag & Drop :</strong> Réorganisez les Stories en les glissant-déposant entre les colonnes
                (Todo, In Progress, Review, Done)
              </li>
              <li>
                <strong>Édition :</strong> Cliquez sur l'icône d'édition pour modifier les détails d'un élément
              </li>
              <li>
                <strong>Suppression :</strong> Utilisez l'icône de suppression pour supprimer un élément (avec
                confirmation)
              </li>
              <li>
                <strong>Assignation :</strong> Assignez des éléments aux membres de l'équipe via les listes déroulantes
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Tableau de Bord',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Indicateurs Clés (KPIs)</h3>
            <p className="text-slate-700 mb-3">
              Le tableau de bord affiche plusieurs métriques importantes :
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>
                <strong>Total Epics/Stories/Tasks :</strong> Nombre total d'éléments dans chaque catégorie
              </li>
              <li>
                <strong>Progression :</strong> Pourcentage de complétion global du projet
              </li>
              <li>
                <strong>Tâches bloquées :</strong> Nombre de tâches actuellement bloquées
              </li>
              <li>
                <strong>Exigences vérifiées :</strong> Nombre d'exigences validées
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Graphiques</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>
                <strong>Graphique en secteurs :</strong> Répartition des tâches par statut
              </li>
              <li>
                <strong>Graphique en barres :</strong> Charge de travail par développeur
              </li>
              <li>
                <strong>Graphique linéaire :</strong> Burndown chart pour suivre la progression du sprint
              </li>
              <li>
                <strong>Graphique radar :</strong> Comparaison valeur métier vs complexité
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Tableaux de Traçabilité</h3>
            <p className="text-slate-700 mb-3">
              Les tableaux de traçabilité montrent la progression des Epics, Stories et Tasks avec des indicateurs
              visuels :
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>
                <strong>Barres de progression :</strong> Pourcentage de complétion avec code couleur (vert = complet,
                jaune = en cours, rouge = bloqué/en retard)
              </li>
              <li>
                <strong>Badges de statut :</strong> Indicateurs visuels pour le statut de chaque élément
              </li>
              <li>
                <strong>Alertes :</strong> Icônes d'alerte pour les éléments bloqués ou en retard
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'sprints',
      title: 'Sprints',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Création de Sprint</h3>
            <p className="text-slate-700 mb-3">
              Pour créer un nouveau sprint :
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>Définissez un nom et un objectif (goal) pour le sprint</li>
              <li>Sélectionnez les dates de début et de fin</li>
              <li>Le statut sera automatiquement défini sur "planned"</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Statuts de Sprint</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="default">Planned</Badge>
              <Badge variant="warning">Active</Badge>
              <Badge variant="success">Completed</Badge>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Tableau de Sprint</h3>
            <p className="text-slate-700 mb-3">
              Chaque sprint a son propre tableau Kanban où vous pouvez :
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>Voir toutes les tâches assignées au sprint</li>
              <li>Déplacer les tâches entre les colonnes de statut</li>
              <li>Suivre la progression avec un graphique de burndown</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'roles',
      title: 'Rôles et Permissions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Types de Rôles</h3>
            <div className="space-y-3 mt-3">
              <Card className="p-3 bg-gradient-to-r from-red-50 to-white">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="error">Admin</Badge>
                </div>
                <p className="text-sm text-slate-700">
                  Accès complet à toutes les fonctionnalités, gestion des utilisateurs et des rôles, accès à tous les
                  projets.
                </p>
              </Card>
              <Card className="p-3 bg-gradient-to-r from-indigo-50 to-white">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="primary">Project Manager</Badge>
                </div>
                <p className="text-sm text-slate-700">
                  Peut créer et gérer des projets, voir tous les projets, gérer les membres d'équipe.
                </p>
              </Card>
              <Card className="p-3 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default">Developer</Badge>
                </div>
                <p className="text-sm text-slate-700">
                  Peut créer et modifier des éléments du backlog (Epics, Stories, Tasks), voir les projets auxquels il
                  est assigné.
                </p>
              </Card>
              <Card className="p-3 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default">User</Badge>
                </div>
                <p className="text-sm text-slate-700">
                  Accès en lecture seule aux projets auxquels il est assigné.
                </p>
              </Card>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Gestion des Utilisateurs</h3>
            <p className="text-slate-700 mb-3">
              Les administrateurs peuvent :
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>Créer de nouveaux utilisateurs</li>
              <li>Inviter des utilisateurs par email</li>
              <li>Modifier les rôles des utilisateurs</li>
              <li>Synchroniser les rôles entre Firestore et Firebase Auth</li>
              <li>Supprimer des utilisateurs</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'tips',
      title: 'Conseils et Astuces',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Organisation du Backlog</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>Commencez par créer des Epics pour les grandes fonctionnalités</li>
              <li>Décomposez chaque Epic en Stories utilisateur</li>
              <li>Détaillez les Stories en Tasks concrètes et actionnables</li>
              <li>Utilisez les priorités pour guider l'ordre de développement</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Gestion des Sprints</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>Planifiez vos sprints en fonction de la capacité de l'équipe</li>
              <li>Assignez les Stories aux sprints en utilisant le champ "Sprint Number"</li>
              <li>Suivez régulièrement le burndown chart pour ajuster si nécessaire</li>
              <li>Marquez les tâches bloquées pour une meilleure visibilité</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Utilisation du Dashboard</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>Consultez régulièrement les indicateurs de performance</li>
              <li>Utilisez les tableaux de traçabilité pour identifier les goulots d'étranglement</li>
              <li>Surveillez les tâches bloquées et agissez rapidement</li>
              <li>Analysez la charge de travail pour équilibrer les assignations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Raccourcis et Navigation</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>Utilisez le sélecteur de projet dans la barre supérieure pour changer rapidement de projet</li>
              <li>Les breadcrumbs vous montrent toujours où vous êtes dans l'application</li>
              <li>Les liens de navigation rapide sous les breadcrumbs permettent d'accéder rapidement aux différentes sections</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const activeContent = sections.find((s) => s.id === activeSection)?.content;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Documentation & Aide</h1>
        <p className="text-slate-600 font-medium">Guide complet des fonctionnalités de l'application ALM</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-24">
            <h2 className="font-semibold text-slate-900 mb-4">Sections</h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm border-2 border-indigo-300'
                      : 'text-slate-600 border-2 border-transparent hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200'
                  }`}
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-6 bg-gradient-to-br from-white to-slate-50/30">
            <SectionTitle>{sections.find((s) => s.id === activeSection)?.title}</SectionTitle>
            <div className="mt-6 prose prose-slate max-w-none">{activeContent}</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

