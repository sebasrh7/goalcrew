// Sistema de internacionalización
export type Language = "es" | "en" | "fr";

interface Translations {
  [key: string]: {
    es: string;
    en: string;
    fr: string;
  };
}

export const translations: Translations = {
  // Navigation
  home: {
    es: "Inicio",
    en: "Home",
    fr: "Accueil",
  },
  create: {
    es: "Crear",
    en: "Create",
    fr: "Créer",
  },
  profile: {
    es: "Perfil",
    en: "Profile",
    fr: "Profil",
  },
  settings: {
    es: "Configuración",
    en: "Settings",
    fr: "Paramètres",
  },

  // Welcome Screen
  welcomeTitle1: {
    es: "Ahorra con\ntu crew",
    en: "Save with\nyour crew",
    fr: "Épargnez avec\nvotre équipe",
  },
  welcomeDesc1: {
    es: "Crea un grupo, invita a tus amigos y ahorren juntos para cualquier meta: viajes, proyectos o lo que sueñen.",
    en: "Create a group, invite your friends and save together for any goal: trips, projects or whatever you dream of.",
    fr: "Créez un groupe, invitez vos amis et épargnez ensemble pour n'importe quel objectif : voyages, projets ou ce dont vous rêvez.",
  },
  welcomeTitle2: {
    es: "Registra aportes\njuntos",
    en: "Track savings\ntogether",
    fr: "Suivez l'épargne\nensemble",
  },
  welcomeDesc2: {
    es: "Define la meta del grupo, elige cómo dividirla y registra cada aporte. El progreso se actualiza en tiempo real.",
    en: "Set the group goal, choose how to split it and log each contribution. Progress updates in real time.",
    fr: "Définissez l'objectif du groupe, choisissez comment le répartir et enregistrez chaque apport. Le progrès se met à jour en temps réel.",
  },
  welcomeTitle3: {
    es: "Celebra cada\nlogro",
    en: "Celebrate every\nachievement",
    fr: "Célébrez chaque\nréussite",
  },
  welcomeDesc3: {
    es: "Desbloquea medallas, mantén tu racha y sube de nivel mientras alcanzan su meta.",
    en: "Unlock medals, keep your streak going and level up as you reach your goal.",
    fr: "Débloquez des médailles, maintenez votre série et montez de niveau en atteignant votre objectif.",
  },
  continueWithGoogle: {
    es: "Continuar con Google",
    en: "Continue with Google",
    fr: "Continuer avec Google",
  },

  // Common
  loading: {
    es: "Cargando...",
    en: "Loading...",
    fr: "Chargement...",
  },
  loadMore: {
    es: "Cargar más",
    en: "Load more",
    fr: "Charger plus",
  },
  error: {
    es: "Error",
    en: "Error",
    fr: "Erreur",
  },
  success: {
    es: "Éxito",
    en: "Success",
    fr: "Succès",
  },
  cancel: {
    es: "Cancelar",
    en: "Cancel",
    fr: "Annuler",
  },
  save: {
    es: "Guardar",
    en: "Save",
    fr: "Sauvegarder",
  },
  of: {
    es: "de",
    en: "of",
    fr: "de",
  },

  // Home Screen
  welcomeBack: {
    es: "¡Hola de vuelta!",
    en: "Welcome back!",
    fr: "Bienvenue !",
  },
  traveler: {
    es: "Ahorrador",
    en: "Saver",
    fr: "Épargnant",
  },
  totalSaved: {
    es: "Total ahorrado",
    en: "Total saved",
    fr: "Total épargné",
  },
  activeGroups: {
    es: "Grupos activos",
    en: "Active groups",
    fr: "Groupes actifs",
  },
  streak: {
    es: "Racha",
    en: "Streak",
    fr: "Série",
  },
  myGoals: {
    es: "Mis metas",
    en: "My goals",
    fr: "Mes objectifs",
  },
  newGoal: {
    es: "+ Nueva",
    en: "+ New",
    fr: "+ Nouveau",
  },
  noGoalsYet: {
    es: "Sin metas todavía",
    en: "No goals yet",
    fr: "Pas encore d'objectifs",
  },
  noGoalsDesc: {
    es: "Crea tu primera meta grupal y empieza a ahorrar con tu crew.",
    en: "Create your first group goal and start saving with your crew.",
    fr: "Créez votre premier objectif de groupe et commencez à épargner avec votre équipe.",
  },
  createFirstGoal: {
    es: "Crear primera meta",
    en: "Create first goal",
    fr: "Créer premier objectif",
  },
  newGoalCard: {
    es: "Nueva meta",
    en: "New goal",
    fr: "Nouvel objectif",
  },
  recentActivity: {
    es: "Actividad reciente",
    en: "Recent activity",
    fr: "Activité récente",
  },
  saved: {
    es: "ahorró",
    en: "saved",
    fr: "a épargné",
  },
  hasInviteCode: {
    es: "¿Tienes un código de invitación?",
    en: "Have an invite code?",
    fr: "Avez-vous un code d'invitation ?",
  },
  joinExistingGroup: {
    es: "Únete a un grupo existente",
    en: "Join an existing group",
    fr: "Rejoignez un groupe existant",
  },
  justNow: {
    es: "hace poco",
    en: "just now",
    fr: "à l'instant",
  },
  hoursAgo: {
    es: "hace",
    en: "ago",
    fr: "il y a",
  },
  daysAgo: {
    es: "hace",
    en: "ago",
    fr: "il y a",
  },

  // Profile Screen
  level: {
    es: "Nivel",
    en: "Level",
    fr: "Niveau",
  },
  points: {
    es: "Puntos",
    en: "Points",
    fr: "Points",
  },
  levelTitle_1: { es: "Novato", en: "Rookie", fr: "Débutant" },
  levelTitle_2: { es: "Iniciado", en: "Starter", fr: "Initié" },
  levelTitle_3: { es: "Ahorrador", en: "Saver", fr: "Épargnant" },
  levelTitle_4: { es: "Constante", en: "Steady", fr: "Constant" },
  levelTitle_5: { es: "Disciplinado", en: "Disciplined", fr: "Discipliné" },
  levelTitle_6: { es: "Experto", en: "Expert", fr: "Expert" },
  levelTitle_7: { es: "Maestro", en: "Master", fr: "Maître" },
  levelTitle_8: { es: "Élite", en: "Elite", fr: "Élite" },
  levelTitle_9: { es: "Leyenda", en: "Legend", fr: "Légende" },
  levelTitle_10: { es: "Imparable", en: "Unstoppable", fr: "Inarrêtable" },
  nextLevel: { es: "Siguiente nivel", en: "Next level", fr: "Niveau suivant" },
  maxLevelReached: { es: "¡Nivel máximo!", en: "Max level!", fr: "Niveau max !" },
  noStreakYet: { es: "Únete a un grupo para empezar tu racha", en: "Join a group to start your streak", fr: "Rejoignez un groupe pour commencer" },
  medals: {
    es: "Medallas",
    en: "Medals",
    fr: "Médailles",
  },
  weeklyStreak: {
    es: "Racha de constancia",
    en: "Consistency streak",
    fr: "Série de constance",
  },
  epicStreak: {
    es: "¡Racha épica!",
    en: "Epic streak!",
    fr: "Série épique !",
  },
  goingWell: {
    es: "¡Vas bien!",
    en: "Going well!",
    fr: "Ça va bien !",
  },
  keepItUp: {
    es: "¡Sigue así!",
    en: "Keep it up!",
    fr: "Continue comme ça !",
  },
  startToday: {
    es: "¡Empieza hoy!",
    en: "Start today!",
    fr: "Commence aujourd'hui !",
  },
  myMedals: {
    es: "Mis medallas",
    en: "My medals",
    fr: "Mes médailles",
  },
  myGroups: {
    es: "Mis grupos",
    en: "My groups",
    fr: "Mes groupes",
  },
  signOut: {
    es: "Cerrar sesión",
    en: "Sign out",
    fr: "Se déconnecter",
  },
  signOutConfirm: {
    es: "¿Seguro que quieres salir?",
    en: "Are you sure you want to sign out?",
    fr: "Êtes-vous sûr de vouloir vous déconnecter ?",
  },
  signOutBtn: {
    es: "Salir",
    en: "Sign out",
    fr: "Déconnexion",
  },
  global: {
    es: "global",
    en: "global",
    fr: "global",
  },

  // Group Detail Screen
  totalCollected: {
    es: "Total reunido",
    en: "Total collected",
    fr: "Total collecté",
  },
  totalGoal: {
    es: "Meta total",
    en: "Total goal",
    fr: "Objectif total",
  },
  remaining: {
    es: "Faltan",
    en: "Remaining",
    fr: "Restant",
  },
  deadline: {
    es: "Fecha límite",
    en: "Deadline",
    fr: "Date limite",
  },
  yourProgress: {
    es: "Tu progreso",
    en: "Your progress",
    fr: "Votre progrès",
  },
  saveEvery: {
    es: "Ahorra",
    en: "Save",
    fr: "Épargnez",
  },
  every: {
    es: "cada",
    en: "every",
    fr: "chaque",
  },
  day: {
    es: "día",
    en: "day",
    fr: "jour",
  },
  days: {
    es: "días",
    en: "days",
    fr: "jours",
  },
  week: {
    es: "semana",
    en: "week",
    fr: "semaine",
  },
  weeks: {
    es: "semanas",
    en: "weeks",
    fr: "semaines",
  },
  month: {
    es: "mes",
    en: "month",
    fr: "mois",
  },
  months: {
    es: "meses",
    en: "months",
    fr: "mois",
  },
  biweeks: {
    es: "quincenas",
    en: "fortnights",
    fr: "quinzaines",
  },
  xDays: {
    es: "{x} días",
    en: "{x} days",
    fr: "{x} jours",
  },
  members: {
    es: "Miembros",
    en: "Members",
    fr: "Membres",
  },
  ranking: {
    es: "Ranking",
    en: "Ranking",
    fr: "Classement",
  },
  history: {
    es: "Historial",
    en: "History",
    fr: "Historique",
  },
  registerContribution: {
    es: "Registrar mi aporte",
    en: "Register contribution",
    fr: "Enregistrer ma contribution",
  },
  registerContribTitle: {
    es: "Registrar aporte",
    en: "Register contribution",
    fr: "Enregistrer contribution",
  },
  goal: {
    es: "Meta",
    en: "Goal",
    fr: "Objectif",
  },
  noteOptional: {
    es: "Nota (opcional) — ej. Ahorro de quincena",
    en: "Note (optional) — e.g. Biweekly savings",
    fr: "Note (optionnel) — ex. Épargne bimensuelle",
  },
  confirmContribution: {
    es: "Confirmar aporte",
    en: "Confirm contribution",
    fr: "Confirmer contribution",
  },
  shareGroup: {
    es: "Compartir grupo",
    en: "Share group",
    fr: "Partager le groupe",
  },
  inviteCode: {
    es: "Código de invitación",
    en: "Invite code",
    fr: "Code d'invitation",
  },
  someone: {
    es: "Alguien",
    en: "Someone",
    fr: "Quelqu'un",
  },
  noContributions: {
    es: "Sin aportes todavía",
    en: "No contributions yet",
    fr: "Pas encore de contributions",
  },
  groupProgress: {
    es: "grupal",
    en: "group",
    fr: "groupe",
  },

  // Create Screen
  createGoal: {
    es: "Crear meta",
    en: "Create goal",
    fr: "Créer objectif",
  },
  goalName: {
    es: "Nombre de la meta",
    en: "Goal name",
    fr: "Nom de l'objectif",
  },
  goalNamePlaceholder: {
    es: "ej. Fondo de emergencia",
    en: "e.g. Emergency fund",
    fr: "ex. Fonds d'urgence",
  },
  icon: {
    es: "Ícono",
    en: "Icon",
    fr: "Icône",
  },
  goalPerPerson: {
    es: "Meta por persona ($)",
    en: "Goal per person ($)",
    fr: "Objectif par personne ($)",
  },
  deadlineDate: {
    es: "Fecha límite",
    en: "Deadline",
    fr: "Date limite",
  },
  frequency: {
    es: "Frecuencia de ahorro",
    en: "Saving frequency",
    fr: "Fréquence d'épargne",
  },
  daily: {
    es: "Diario",
    en: "Daily",
    fr: "Quotidien",
  },
  weekly: {
    es: "Semanal",
    en: "Weekly",
    fr: "Hebdomadaire",
  },
  monthly: {
    es: "Mensual",
    en: "Monthly",
    fr: "Mensuel",
  },
  biweekly: {
    es: "Quincenal",
    en: "Biweekly",
    fr: "Bimensuel",
  },
  custom: {
    es: "Personalizada",
    en: "Custom",
    fr: "Personnalisée",
  },
  biweek: {
    es: "quincena",
    en: "two weeks",
    fr: "quinzaine",
  },
  everyXDays: {
    es: "Cada {x} días",
    en: "Every {x} days",
    fr: "Tous les {x} jours",
  },
  customDaysLabel: {
    es: "¿Cada cuántos días?",
    en: "Every how many days?",
    fr: "Tous les combien de jours ?",
  },
  customDaysPlaceholder: {
    es: "ej. 10",
    en: "e.g. 10",
    fr: "ex. 10",
  },
  autoCalculated: {
    es: "Calculado automáticamente",
    en: "Automatically calculated",
    fr: "Calculé automatiquement",
  },
  savePer: {
    es: "Ahorrar por",
    en: "Save per",
    fr: "Épargner par",
  },
  daysRemaining: {
    es: "Días restantes",
    en: "Days remaining",
    fr: "Jours restants",
  },
  divisionType: {
    es: "Tipo de división",
    en: "Division type",
    fr: "Type de division",
  },
  equalForAll: {
    es: "Igual para todos",
    en: "Equal for all",
    fr: "Égal pour tous",
  },
  customDivision: {
    es: "Personalizada",
    en: "Custom",
    fr: "Personnalisée",
  },
  equalDescription: {
    es: "Todos los miembros ahorran el mismo monto. La meta individual no se puede cambiar.",
    en: "All members save the same amount. The individual goal cannot be changed.",
    fr: "Tous les membres épargnent le même montant. L'objectif individuel ne peut pas être modifié.",
  },
  customDescription: {
    es: "Cada miembro elige cuánto quiere ahorrar. Pueden ajustar su meta individual en cualquier momento.",
    en: "Each member chooses how much to save. They can adjust their individual goal at any time.",
    fr: "Chaque membre choisit combien épargner. Ils peuvent ajuster leur objectif individuel à tout moment.",
  },
  editMyGoal: {
    es: "Editar mi meta",
    en: "Edit my goal",
    fr: "Modifier mon objectif",
  },
  editGoalDescription: {
    es: "Este grupo tiene división personalizada. Ajusta tu meta individual de ahorro.",
    en: "This group has custom division. Adjust your individual savings goal.",
    fr: "Ce groupe a une division personnalisée. Ajustez votre objectif d'épargne individuel.",
  },
  saveGoal: {
    es: "Guardar meta",
    en: "Save goal",
    fr: "Enregistrer l'objectif",
  },
  customGoalJoinTitle: {
    es: "Tu meta personal",
    en: "Your personal goal",
    fr: "Votre objectif personnel",
  },
  customGoalJoinDesc: {
    es: '"{group}" usa división personalizada. La meta sugerida es {amount}, pero puedes poner la tuya.',
    en: '"{group}" uses custom division. The suggested goal is {amount}, but you can set your own.',
    fr: '"{group}" utilise une division personnalisée. L\'objectif suggéré est {amount}, mais vous pouvez définir le vôtre.',
  },
  joinWithMyGoal: {
    es: "Unirme con mi meta",
    en: "Join with my goal",
    fr: "Rejoindre avec mon objectif",
  },
  couldNotUpdate: {
    es: "No se pudo actualizar",
    en: "Could not update",
    fr: "Impossible de mettre à jour",
  },
  goalSummary: {
    es: "Resumen de tu meta",
    en: "Goal summary",
    fr: "Résumé de votre objectif",
  },
  destination: {
    es: "Nombre",
    en: "Name",
    fr: "Nom",
  },
  goalPerPersonLabel: {
    es: "Meta/persona",
    en: "Goal/person",
    fr: "Objectif/personne",
  },
  createGroupGoal: {
    es: "Crear meta grupal",
    en: "Create group goal",
    fr: "Créer objectif de groupe",
  },

  // Settings Screen
  personal: {
    es: "Personal",
    en: "Personal",
    fr: "Personnel",
  },
  appearance: {
    es: "Apariencia",
    en: "Appearance",
    fr: "Apparence",
  },
  notifications: {
    es: "Notificaciones",
    en: "Notifications",
    fr: "Notifications",
  },
  privacySecurity: {
    es: "Privacidad y Seguridad",
    en: "Privacy & Security",
    fr: "Confidentialité et Sécurité",
  },
  account: {
    es: "Cuenta",
    en: "Account",
    fr: "Compte",
  },
  language: {
    es: "Idioma",
    en: "Language",
    fr: "Langue",
  },
  currency: {
    es: "Moneda",
    en: "Currency",
    fr: "Devise",
  },
  darkMode: {
    es: "Modo Oscuro",
    en: "Dark Mode",
    fr: "Mode Sombre",
  },
  pushNotifications: {
    es: "Notificaciones Push",
    en: "Push Notifications",
    fr: "Notifications Push",
  },
  emailNotifications: {
    es: "Notificaciones por Email",
    en: "Email Notifications",
    fr: "Notifications Email",
  },
  contributionReminders: {
    es: "Recordatorios de Contribución",
    en: "Contribution Reminders",
    fr: "Rappels de Contribution",
  },
  achievementNotifications: {
    es: "Notificaciones de Logros",
    en: "Achievement Notifications",
    fr: "Notifications de Réussites",
  },
  chatNotifications: {
    es: "Mensajes del Chat",
    en: "Chat Messages",
    fr: "Messages du Chat",
  },
  expenseNotifications: {
    es: "Gastos y Pagos",
    en: "Expenses & Payments",
    fr: "Dépenses et Paiements",
  },
  groupNotifications: {
    es: "Actividad del Grupo",
    en: "Group Activity",
    fr: "Activité du Groupe",
  },
  contributionNotifications: {
    es: "Aportes de Miembros",
    en: "Member Contributions",
    fr: "Contributions des Membres",
  },
  publicProfile: {
    es: "Perfil Público",
    en: "Public Profile",
    fr: "Profil Public",
  },
  exportData: {
    es: "Exportar Mis Datos",
    en: "Export My Data",
    fr: "Exporter Mes Données",
  },
  deleteAccount: {
    es: "Eliminar Cuenta",
    en: "Delete Account",
    fr: "Supprimer le Compte",
  },
  personalInfo: {
    es: "Información Personal",
    en: "Personal Information",
    fr: "Informations Personnelles",
  },
  showAchievements: {
    es: "Mostrar Logros",
    en: "Show Achievements",
    fr: "Afficher Réussites",
  },
  showStats: {
    es: "Mostrar Estadísticas",
    en: "Show Statistics",
    fr: "Afficher Statistiques",
  },

  // Join Group
  joinGroup: {
    es: "Unirse a un grupo",
    en: "Join a group",
    fr: "Rejoindre un groupe",
  },
  enterCode: {
    es: "Ingresa el código",
    en: "Enter the code",
    fr: "Entrez le code",
  },
  joinBtn: {
    es: "Unirse",
    en: "Join",
    fr: "Rejoindre",
  },

  // Achievement Titles
  achievement_first_contribution_title: {
    es: "Inicio rápido",
    en: "Quick start",
    fr: "Démarrage rapide",
  },
  achievement_first_contribution_desc: {
    es: "Registraste tu primer aporte",
    en: "You registered your first contribution",
    fr: "Vous avez enregistré votre première contribution",
  },
  achievement_streak_3_title: {
    es: "3 en raya",
    en: "3 in a row",
    fr: "3 d'affilée",
  },
  achievement_streak_3_desc: {
    es: "3 veces seguidas ahorrando",
    en: "Saved 3 times in a row",
    fr: "3 fois de suite à épargner",
  },
  achievement_streak_7_title: {
    es: "Semana de fuego",
    en: "Fire week",
    fr: "Semaine en feu",
  },
  achievement_streak_7_desc: {
    es: "7 veces seguidas ahorrando",
    en: "Saved 7 times in a row",
    fr: "7 fois de suite à épargner",
  },
  achievement_streak_30_title: {
    es: "Mes imparable",
    en: "Unstoppable month",
    fr: "Mois inarrêtable",
  },
  achievement_streak_30_desc: {
    es: "30 veces seguidas ahorrando",
    en: "Saved 30 times in a row",
    fr: "30 fois de suite à épargner",
  },
  achievement_first_50_percent_title: {
    es: "Primero al 50%",
    en: "First to 50%",
    fr: "Premier à 50%",
  },
  achievement_first_50_percent_desc: {
    es: "Fuiste el primero en llegar al 50%",
    en: "You were the first to reach 50%",
    fr: "Vous avez été le premier à atteindre 50%",
  },
  achievement_goal_completed_title: {
    es: "Meta cumplida",
    en: "Goal completed",
    fr: "Objectif atteint",
  },
  achievement_goal_completed_desc: {
    es: "¡Llegaste al 100% de tu meta!",
    en: "You reached 100% of your goal!",
    fr: "Vous avez atteint 100% de votre objectif !",
  },
  achievement_most_consistent_title: {
    es: "Más constante",
    en: "Most consistent",
    fr: "Le plus constant",
  },
  achievement_most_consistent_desc: {
    es: "El miembro más consistente del grupo",
    en: "The most consistent group member",
    fr: "Le membre le plus constant du groupe",
  },
  achievement_early_bird_title: {
    es: "Early bird",
    en: "Early bird",
    fr: "Lève-tôt",
  },
  achievement_early_bird_desc: {
    es: "Completaste la meta antes de tiempo",
    en: "You completed the goal ahead of time",
    fr: "Vous avez atteint l'objectif en avance",
  },
  achievement_big_saver_title: {
    es: "Gran aportador",
    en: "Big saver",
    fr: "Grand épargnant",
  },
  achievement_big_saver_desc: {
    es: "Registraste un aporte mayor a $100",
    en: "You registered a contribution over $100",
    fr: "Vous avez enregistré une contribution de plus de 100$",
  },
  medalUnlocked: {
    es: "¡Medalla desbloqueada!",
    en: "Medal unlocked!",
    fr: "Médaille débloquée !",
  },
  awesome: {
    es: "¡Genial!",
    en: "Awesome!",
    fr: "Génial !",
  },
  newAchievementUnlocked: {
    es: "¡Nuevo logro desbloqueado!",
    en: "New achievement unlocked!",
    fr: "Nouveau succès débloqué !",
  },
  youEarned: {
    es: "Has conseguido:",
    en: "You earned:",
    fr: "Vous avez obtenu :",
  },

  // Welcome / Auth
  continueBtn: {
    es: "Continuar →",
    en: "Continue →",
    fr: "Continuer →",
  },
  skip: {
    es: "Saltar",
    en: "Skip",
    fr: "Passer",
  },
  loginError: {
    es: "Error al iniciar sesión",
    en: "Login error",
    fr: "Erreur de connexion",
  },
  loginErrorMsg: {
    es: "Por favor intenta de nuevo. Si el problema persiste, cierra y vuelve a abrir la app.",
    en: "Please try again. If the problem persists, close and reopen the app.",
    fr: "Veuillez réessayer. Si le problème persiste, fermez et rouvrez l'application.",
  },
  retry: {
    es: "Reintentar",
    en: "Retry",
    fr: "Réessayer",
  },

  // Join Group Screen
  invalidCode: {
    es: "Código inválido",
    en: "Invalid code",
    fr: "Code invalide",
  },
  enterFullCode: {
    es: "Ingresa el código completo de invitación.",
    en: "Enter the full invite code.",
    fr: "Entrez le code d'invitation complet.",
  },
  welcome: {
    es: "¡Bienvenido!",
    en: "Welcome!",
    fr: "Bienvenue !",
  },
  joinedGroup: {
    es: "Te uniste al grupo. ¡Empieza a ahorrar!",
    en: "You joined the group. Start saving!",
    fr: "Vous avez rejoint le groupe. Commencez à épargner !",
  },
  letsGo: {
    es: "¡Vamos!",
    en: "Let's go!",
    fr: "Allons-y !",
  },
  couldNotJoin: {
    es: "No se pudo unir al grupo.",
    en: "Could not join group.",
    fr: "Impossible de rejoindre le groupe.",
  },
  backToHome: {
    es: "← Inicio",
    en: "← Home",
    fr: "← Accueil",
  },
  askForCode: {
    es: "Pídele el código de invitación a quien creó el grupo",
    en: "Ask the group creator for the invite code",
    fr: "Demandez le code d'invitation au créateur du groupe",
  },
  characters: {
    es: "caracteres",
    en: "characters",
    fr: "caractères",
  },
  joinMyGroup: {
    es: "Unirme al grupo",
    en: "Join group",
    fr: "Rejoindre le groupe",
  },
  scanQR: {
    es: "Escanear código QR",
    en: "Scan QR code",
    fr: "Scanner le code QR",
  },
  comingSoon: {
    es: "Próximamente",
    en: "Coming soon",
    fr: "Bientôt disponible",
  },
  or: {
    es: "— o —",
    en: "— or —",
    fr: "— ou —",
  },

  // Settings extra
  selectLanguage: {
    es: "Selecciona tu idioma",
    en: "Select your language",
    fr: "Choisissez votre langue",
  },
  selectCurrency: {
    es: "Selecciona tu moneda",
    en: "Select your currency",
    fr: "Choisissez votre devise",
  },
  // Currency names
  currency_USD: {
    es: "Dólar estadounidense ($)",
    en: "US Dollar ($)",
    fr: "Dollar américain ($)",
  },
  currency_EUR: {
    es: "Euro (€)",
    en: "Euro (€)",
    fr: "Euro (€)",
  },
  currency_GBP: {
    es: "Libra esterlina (£)",
    en: "British Pound (£)",
    fr: "Livre sterling (£)",
  },
  currency_COP: {
    es: "Peso colombiano ($)",
    en: "Colombian Peso ($)",
    fr: "Peso colombien ($)",
  },
  currency_MXN: {
    es: "Peso mexicano ($)",
    en: "Mexican Peso ($)",
    fr: "Peso mexicain ($)",
  },
  currency_ARS: {
    es: "Peso argentino ($)",
    en: "Argentine Peso ($)",
    fr: "Peso argentin ($)",
  },
  currency_CLP: {
    es: "Peso chileno ($)",
    en: "Chilean Peso ($)",
    fr: "Peso chilien ($)",
  },
  currency_PEN: {
    es: "Sol peruano (S/)",
    en: "Peruvian Sol (S/)",
    fr: "Sol péruvien (S/)",
  },
  currency_BRL: {
    es: "Real brasileño (R$)",
    en: "Brazilian Real (R$)",
    fr: "Réal brésilien (R$)",
  },
  welcomeCurrencyTitle: {
    es: "¿Cuál es tu moneda?",
    en: "What's your currency?",
    fr: "Quelle est votre devise ?",
  },
  welcomeCurrencyDesc: {
    es: "Selecciona la moneda que usarás para tus metas de ahorro. Puedes cambiarla después en ajustes.",
    en: "Select the currency you'll use for your savings goals. You can change it later in settings.",
    fr: "Sélectionnez la devise que vous utiliserez pour vos objectifs d'épargne. Vous pourrez la modifier dans les paramètres.",
  },
  confirmCurrency: {
    es: "Confirmar",
    en: "Confirm",
    fr: "Confirmer",
  },
  ok: {
    es: "Aceptar",
    en: "OK",
    fr: "OK",
  },
  editProfileSoon: {
    es: "Editar perfil próximamente disponible",
    en: "Edit profile coming soon",
    fr: "Modification du profil bientôt disponible",
  },
  editProfile: {
    es: "Editar Perfil",
    en: "Edit Profile",
    fr: "Modifier le Profil",
  },
  yourName: {
    es: "Tu nombre",
    en: "Your name",
    fr: "Votre nom",
  },
  email: {
    es: "Correo electrónico",
    en: "Email",
    fr: "Email",
  },
  saveProfile: {
    es: "Guardar",
    en: "Save",
    fr: "Enregistrer",
  },
  profileUpdated: {
    es: "Perfil actualizado correctamente",
    en: "Profile updated successfully",
    fr: "Profil mis à jour avec succès",
  },
  profileUpdateError: {
    es: "Error al actualizar el perfil",
    en: "Error updating profile",
    fr: "Erreur lors de la mise à jour du profil",
  },
  settingsUpdateError: {
    es: "No se pudo guardar la configuración. Intenta de nuevo.",
    en: "Could not save settings. Please try again.",
    fr: "Impossible d'enregistrer les paramètres. Veuillez réessayer.",
  },
  nameRequiredProfile: {
    es: "El nombre no puede estar vacío",
    en: "Name cannot be empty",
    fr: "Le nom ne peut pas être vide",
  },
  deletingAccount: {
    es: "Eliminando cuenta...",
    en: "Deleting account...",
    fr: "Suppression du compte...",
  },
  deleteAccountError: {
    es: "Error al eliminar la cuenta. Inténtalo de nuevo.",
    en: "Error deleting account. Please try again.",
    fr: "Erreur lors de la suppression du compte. Veuillez réessayer.",
  },
  changePhoto: {
    es: "Cambiar foto",
    en: "Change photo",
    fr: "Changer la photo",
  },
  selectPhotoSource: {
    es: "¿De dónde quieres tomar la foto?",
    en: "Where do you want to take the photo from?",
    fr: "D'où voulez-vous prendre la photo ?",
  },
  camera: {
    es: "Cámara",
    en: "Camera",
    fr: "Caméra",
  },
  gallery: {
    es: "Galería",
    en: "Gallery",
    fr: "Galerie",
  },
  cameraPermission: {
    es: "Se necesita permiso para acceder a la cámara",
    en: "Camera access permission is needed",
    fr: "L'autorisation d'accès à la caméra est nécessaire",
  },
  galleryPermission: {
    es: "Se necesita permiso para acceder a la galería",
    en: "Gallery access permission is needed",
    fr: "L'autorisation d'accès à la galerie est nécessaire",
  },
  uploadError: {
    es: "Error al subir la imagen. Inténtalo de nuevo.",
    en: "Error uploading image. Please try again.",
    fr: "Erreur lors du téléchargement de l'image. Veuillez réessayer.",
  },
  showStatistics: {
    es: "Mostrar Estadísticas",
    en: "Show Statistics",
    fr: "Afficher Statistiques",
  },
  exportDataConfirm: {
    es: "¿Quieres descargar todos tus datos personales?",
    en: "Do you want to download all your personal data?",
    fr: "Voulez-vous télécharger toutes vos données personnelles ?",
  },
  exportBtn: {
    es: "Exportar",
    en: "Export",
    fr: "Exporter",
  },
  exportSuccess: {
    es: "Te enviaremos un email con tus datos en 24-48 horas",
    en: "We will send you an email with your data within 24-48 hours",
    fr: "Nous vous enverrons un email avec vos données dans 24-48 heures",
  },
  deleteAccountConfirm: {
    es: "Esta acción no se puede deshacer. ¿Estás seguro?",
    en: "This action cannot be undone. Are you sure?",
    fr: "Cette action est irréversible. Êtes-vous sûr ?",
  },
  deleteBtn: {
    es: "Eliminar",
    en: "Delete",
    fr: "Supprimer",
  },
  finalConfirmation: {
    es: "Confirmación Final",
    en: "Final Confirmation",
    fr: "Confirmation Finale",
  },
  typeDeleteConfirm: {
    es: "¿Estás absolutamente seguro? Esta acción no se puede deshacer.",
    en: "Are you absolutely sure? This action cannot be undone.",
    fr: "Êtes-vous absolument sûr ? Cette action est irréversible.",
  },
  deletePermanently: {
    es: "Eliminar Definitivamente",
    en: "Delete Permanently",
    fr: "Supprimer Définitivement",
  },
  accountDeleted: {
    es: "Cuenta Eliminada",
    en: "Account Deleted",
    fr: "Compte Supprimé",
  },
  accountDeletedMsg: {
    es: "Tu cuenta ha sido eliminada",
    en: "Your account has been deleted",
    fr: "Votre compte a été supprimé",
  },
  saving: {
    es: "Guardando...",
    en: "Saving...",
    fr: "Enregistrement...",
  },
  madeWithLove: {
    es: "Hecho con 💜 para ahorradores",
    en: "Made with 💜 for savers",
    fr: "Fait avec 💜 pour les épargnants",
  },
  errorBoundaryTitle: {
    es: "Algo salió mal",
    en: "Something went wrong",
    fr: "Une erreur est survenue",
  },
  errorBoundaryMessage: {
    es: "La app encontró un error inesperado. Intenta reiniciarla.",
    en: "The app encountered an unexpected error. Try restarting it.",
    fr: "L'app a rencontré une erreur inattendue. Essayez de la redémarrer.",
  },
  errorBoundaryRetry: {
    es: "Reintentar",
    en: "Try Again",
    fr: "Réessayer",
  },
  notificationsEnabled: {
    es: "¡Notificaciones activadas!",
    en: "Notifications enabled!",
    fr: "Notifications activées !",
  },
  notificationsEnabledMsg: {
    es: "Ahora recibirás recordatorios de tus metas",
    en: "You will now receive reminders for your goals",
    fr: "Vous recevrez maintenant des rappels pour vos objectifs",
  },

  // Create screen extra
  savePerFrequency: {
    es: "Ahorrar por",
    en: "Save per",
    fr: "Épargner par",
  },
  couldNotCreateGoal: {
    es: "No se pudo crear la meta",
    en: "Could not create the goal",
    fr: "Impossible de créer l'objectif",
  },
  periods: {
    es: "Ciclos",
    en: "Cycles",
    fr: "Cycles",
  },

  // Notifications
  reminderTitle: {
    es: "Recordatorio de",
    en: "Reminder for",
    fr: "Rappel pour",
  },
  dontForgetContribution: {
    es: "No olvides tu contribución de",
    en: "Don't forget your contribution of",
    fr: "N'oubliez pas votre contribution de",
  },
  forTomorrow: {
    es: "para mañana",
    en: "for tomorrow",
    fr: "pour demain",
  },
  dailyReminderTitle: {
    es: "¡Hora de ahorrar!",
    en: "Time to save!",
    fr: "C'est l'heure d'économiser !",
  },
  dailyReminderBody: {
    es: "Revisa tus metas y haz tu contribución del día 💰",
    en: "Check your goals and make today's contribution 💰",
    fr: "Vérifiez vos objectifs et faites votre contribution du jour 💰",
  },
  weeklyReminderTitle: {
    es: "Resumen semanal",
    en: "Weekly summary",
    fr: "Résumé hebdomadaire",
  },
  weeklyReminderBody: {
    es: "¿Cómo va tu progreso? Revisa tus metas de ahorro 📊",
    en: "How's your progress? Check your savings goals 📊",
    fr: "Comment avancez-vous ? Vérifiez vos objectifs d'épargne 📊",
  },
  goalCompletedNotif: {
    es: "¡Meta completada!",
    en: "Goal completed!",
    fr: "Objectif atteint !",
  },
  goalCompletedNotifBody: {
    es: "¡Felicidades! Completaste tu meta en {group} 🎉",
    en: "Congratulations! You completed your goal in {group} 🎉",
    fr: "Félicitations ! Vous avez atteint votre objectif dans {group} 🎉",
  },
  notificationPermissionDenied: {
    es: "Permisos de notificación denegados",
    en: "Notification permissions denied",
    fr: "Autorisations de notification refusées",
  },

  // Validation errors
  invalidAmount: {
    es: "Monto inválido",
    en: "Invalid amount",
    fr: "Montant invalide",
  },
  enterAmountGreaterZero: {
    es: "Ingresa un monto mayor a 0",
    en: "Enter an amount greater than 0",
    fr: "Entrez un montant supérieur à 0",
  },
  amountTooLarge: {
    es: "El monto ingresado es demasiado grande",
    en: "The amount entered is too large",
    fr: "Le montant entré est trop élevé",
  },
  couldNotRegister: {
    es: "No se pudo registrar el aporte",
    en: "Could not register contribution",
    fr: "Impossible d'enregistrer la contribution",
  },
  codeCopied: {
    es: "Código copiado",
    en: "Code copied",
    fr: "Code copié",
  },
  joinShareMessage: {
    es: "¡Únete a nuestro grupo de ahorro en GoalCrew!",
    en: "Join our savings group on GoalCrew!",
    fr: "Rejoignez notre groupe d'épargne sur GoalCrew !",
  },
  joinShareTitle: {
    es: "Únete a",
    en: "Join",
    fr: "Rejoindre",
  },
  downloadApp: {
    es: "Únete aquí:",
    en: "Join here:",
    fr: "Rejoignez ici :",
  },
  code: {
    es: "Código",
    en: "Code",
    fr: "Code",
  },
  nameRequired: {
    es: "Nombre requerido",
    en: "Name required",
    fr: "Nom requis",
  },
  giveGoalName: {
    es: "Dale un nombre a tu meta",
    en: "Give your goal a name",
    fr: "Donnez un nom à votre objectif",
  },
  enterGoalGreaterZero: {
    es: "Ingresa una meta mayor a 0",
    en: "Enter a goal greater than 0",
    fr: "Entrez un objectif supérieur à 0",
  },
  dateTooClose: {
    es: "Fecha muy cercana",
    en: "Date too close",
    fr: "Date trop proche",
  },
  dateTooCloseMsg: {
    es: "La fecha límite debe ser al menos en 7 días",
    en: "Deadline must be at least 7 days away",
    fr: "La date limite doit être dans au moins 7 jours",
  },
  pointsAccumulated: {
    es: "Puntos acumulados",
    en: "Accumulated points",
    fr: "Points accumulés",
  },
  pts: {
    es: "pts",
    en: "pts",
    fr: "pts",
  },
  invalidInviteCode: {
    es: "Código de invitación inválido",
    en: "Invalid invite code",
    fr: "Code d'invitation invalide",
  },
  alreadyMember: {
    es: "Ya eres miembro de este grupo",
    en: "You are already a member of this group",
    fr: "Vous êtes déjà membre de ce groupe",
  },
  xpProgress: {
    es: "XP",
    en: "XP",
    fr: "XP",
  },
  whereAreYouGoing: {
    es: "¿Cuál es la meta?",
    en: "What's the goal?",
    fr: "Quel est l'objectif ?",
  },

  // Phase 2 — Group management
  groupSettings: {
    es: "Opciones del grupo",
    en: "Group options",
    fr: "Options du groupe",
  },
  editGroup: {
    es: "Editar grupo",
    en: "Edit group",
    fr: "Modifier le groupe",
  },
  leaveGroup: {
    es: "Salir del grupo",
    en: "Leave group",
    fr: "Quitter le groupe",
  },
  deleteGroup: {
    es: "Eliminar grupo",
    en: "Delete group",
    fr: "Supprimer le groupe",
  },
  leaveGroupConfirm: {
    es: "¿Seguro que quieres salir de este grupo? Tu progreso se perderá.",
    en: "Are you sure you want to leave this group? Your progress will be lost.",
    fr: "Êtes-vous sûr de vouloir quitter ce groupe ? Votre progression sera perdue.",
  },
  deleteGroupConfirm: {
    es: "¿Seguro que quieres eliminar este grupo? Se borrará para todos los miembros.",
    en: "Are you sure you want to delete this group? It will be deleted for all members.",
    fr: "Êtes-vous sûr de vouloir supprimer ce groupe ? Il sera supprimé pour tous les membres.",
  },
  creatorCannotLeave: {
    es: "Eres el creador. Elimina el grupo en vez de salir.",
    en: "You are the creator. Delete the group instead of leaving.",
    fr: "Vous êtes le créateur. Supprimez le groupe au lieu de le quitter.",
  },
  groupDeleted: {
    es: "Grupo eliminado",
    en: "Group deleted",
    fr: "Groupe supprimé",
  },
  leftGroup: {
    es: "Saliste del grupo",
    en: "You left the group",
    fr: "Vous avez quitté le groupe",
  },
  groupUpdated: {
    es: "Grupo actualizado",
    en: "Group updated",
    fr: "Groupe mis à jour",
  },
  saveChanges: {
    es: "Guardar cambios",
    en: "Save changes",
    fr: "Enregistrer les modifications",
  },

  // Phase 2 — Contribution management
  editContribution: {
    es: "Editar aporte",
    en: "Edit contribution",
    fr: "Modifier l'apport",
  },
  deleteContribution: {
    es: "Eliminar aporte",
    en: "Delete contribution",
    fr: "Supprimer l'apport",
  },
  deleteContributionConfirm: {
    es: "¿Eliminar este aporte? Se revertirá el monto de tu progreso.",
    en: "Delete this contribution? The amount will be reverted from your progress.",
    fr: "Supprimer cet apport ? Le montant sera déduit de votre progression.",
  },
  contributionDeleted: {
    es: "Aporte eliminado",
    en: "Contribution deleted",
    fr: "Apport supprimé",
  },
  contributionUpdated: {
    es: "Aporte actualizado",
    en: "Contribution updated",
    fr: "Apport mis à jour",
  },

  // Phase 2 — Completed state
  goalCompleted: {
    es: "¡Meta cumplida!",
    en: "Goal completed!",
    fr: "Objectif atteint !",
  },
  groupCompletedDesc: {
    es: "¡Felicidades! El grupo ha alcanzado su meta de ahorro.",
    en: "Congratulations! The group has reached its savings goal.",
    fr: "Félicitations ! Le groupe a atteint son objectif d'épargne.",
  },
  deadlineReached: {
    es: "Fecha límite alcanzada",
    en: "Deadline reached",
    fr: "Date limite atteinte",
  },
  deadlineReachedDesc: {
    es: "El plazo de este grupo ha terminado.",
    en: "The deadline for this group has passed.",
    fr: "La date limite de ce groupe est dépassée.",
  },
  confirm: {
    es: "Confirmar",
    en: "Confirm",
    fr: "Confirmer",
  },
  leave: {
    es: "Salir",
    en: "Leave",
    fr: "Quitter",
  },
  delete: {
    es: "Eliminar",
    en: "Delete",
    fr: "Supprimer",
  },
  dangerZone: {
    es: "Zona de peligro",
    en: "Danger zone",
    fr: "Zone de danger",
  },
  onlyCreatorCanEdit: {
    es: "Solo el creador puede editar el grupo",
    en: "Only the creator can edit the group",
    fr: "Seul le créateur peut modifier le groupe",
  },
  groupName: {
    es: "Nombre del grupo",
    en: "Group name",
    fr: "Nom du groupe",
  },

  // Phase 3: UX & Polish
  loadingGroup: {
    es: "Cargando grupo…",
    en: "Loading group…",
    fr: "Chargement du groupe…",
  },
  errorLoadingGroup: {
    es: "No se pudo cargar el grupo. Revisa tu conexión.",
    en: "Could not load group. Check your connection.",
    fr: "Impossible de charger le groupe. Vérifiez votre connexion.",
  },
  backToGoals: {
    es: "← Mis metas",
    en: "← My goals",
    fr: "← Mes objectifs",
  },
  statusOnTrack: {
    es: "Al día",
    en: "On track",
    fr: "En bonne voie",
  },
  statusAtRisk: {
    es: "En riesgo",
    en: "At risk",
    fr: "À risque",
  },
  statusBehind: {
    es: "Atrasado",
    en: "Behind",
    fr: "En retard",
  },
  youSuffix: {
    es: "(tú)",
    en: "(you)",
    fr: "(toi)",
  },
  noStreak: {
    es: "Sin racha",
    en: "No streak",
    fr: "Pas de série",
  },
  periodsCompleted: {
    es: "veces cumplidas",
    en: "times completed",
    fr: "fois complétées",
  },
  tripIcon: {
    es: "Icono del grupo",
    en: "Group icon",
    fr: "Icône du groupe",
  },
  setupGroupTrip: {
    es: "Configura tu meta grupal",
    en: "Set up your group goal",
    fr: "Configurez votre objectif de groupe",
  },
  // ─── QR Code ────────────────────────────────────────────────────────────
  inviteMembers: {
    es: "Invitar miembros",
    en: "Invite members",
    fr: "Inviter des membres",
  },
  qrScanHint: {
    es: "Los miembros pueden escanear este QR para unirse al grupo",
    en: "Members can scan this QR to join the group",
    fr: "Les membres peuvent scanner ce QR pour rejoindre le groupe",
  },
  close: {
    es: "Cerrar",
    en: "Close",
    fr: "Fermer",
  },
  pointCameraAtQR: {
    es: "Apunta la cámara al código QR de invitación",
    en: "Point your camera at the invite QR code",
    fr: "Pointez la caméra vers le code QR d'invitation",
  },
  qrInvalidCode: {
    es: "El QR no contiene un código de invitación válido",
    en: "The QR does not contain a valid invite code",
    fr: "Le QR ne contient pas de code d'invitation valide",
  },
  qrNotAvailableWeb: {
    es: "El escáner QR no está disponible en la versión web. Ingresa el código manualmente.",
    en: "QR scanner is not available on the web version. Enter the code manually.",
    fr: "Le scanner QR n'est pas disponible dans la version web. Entrez le code manuellement.",
  },
  // ─── Landing Page ───────────────────────────────────────────────────────
  landingBadge: {
    es: "Ahorro grupal simplificado",
    en: "Group savings simplified",
    fr: "Épargne de groupe simplifiée",
  },
  landingHeroTitle1: {
    es: "Ahorra en grupo,",
    en: "Save together,",
    fr: "Épargnez ensemble,",
  },
  landingHeroTitle2: {
    es: "logra tus metas",
    en: "reach your goals",
    fr: "atteignez vos objectifs",
  },
  landingHeroSubtitle: {
    es: "Crea grupos de ahorro con amigos y familia. Registra aportes, sigue el progreso y alcancen sus metas juntos.",
    en: "Create savings groups with friends and family. Track contributions, follow progress, and reach your goals together.",
    fr: "Créez des groupes d'épargne avec vos amis et votre famille. Suivez les contributions, le progrès et atteignez vos objectifs ensemble.",
  },
  landingSignIn: {
    es: "Iniciar sesión",
    en: "Sign in",
    fr: "Se connecter",
  },
  landingUseWeb: {
    es: "Usar versión web",
    en: "Use web version",
    fr: "Utiliser la version web",
  },
  landingDownloadAPK: {
    es: "Descargar APK",
    en: "Download APK",
    fr: "Télécharger APK",
  },
  landingStat1: {
    es: "100% gratuito",
    en: "100% free",
    fr: "100% gratuit",
  },
  landingStat2: {
    es: "Datos seguros",
    en: "Secure data",
    fr: "Données sécurisées",
  },
  landingStat3: {
    es: "Android, Web & iPhone",
    en: "Android, Web & iPhone",
    fr: "Android, Web & iPhone",
  },
  // How it works
  landingHowTag: {
    es: "Cómo funciona",
    en: "How it works",
    fr: "Comment ça marche",
  },
  landingHowTitle: {
    es: "Empieza en menos de un minuto",
    en: "Get started in under a minute",
    fr: "Commencez en moins d'une minute",
  },
  landingHowStep1Title: {
    es: "Crea un grupo",
    en: "Create a group",
    fr: "Créez un groupe",
  },
  landingHowStep1Desc: {
    es: "Define la meta, el plazo y cuánto aportará cada quien.",
    en: "Set the goal, deadline and how much each member will contribute.",
    fr: "Définissez l'objectif, le délai et la contribution de chacun.",
  },
  landingHowStep2Title: {
    es: "Invita a tu crew",
    en: "Invite your crew",
    fr: "Invitez votre équipe",
  },
  landingHowStep2Desc: {
    es: "Comparte el código QR o el enlace de invitación.",
    en: "Share the QR code or invitation link.",
    fr: "Partagez le code QR ou le lien d'invitation.",
  },
  landingHowStep3Title: {
    es: "Ahorren juntos",
    en: "Save together",
    fr: "Épargnez ensemble",
  },
  landingHowStep3Desc: {
    es: "Registra aportes, ve el progreso en tiempo real y celebren logros.",
    en: "Log contributions, track progress in real time and celebrate milestones.",
    fr: "Enregistrez les contributions, suivez les progrès en temps réel et célébrez.",
  },
  landingFeaturesTag: {
    es: "Funcionalidades",
    en: "Features",
    fr: "Fonctionnalités",
  },
  landingFeaturesTitle: {
    es: "Todo lo que necesitas para ahorrar juntos",
    en: "Everything you need to save together",
    fr: "Tout ce dont vous avez besoin pour épargner ensemble",
  },
  landingFeature1Title: {
    es: "Grupos de ahorro",
    en: "Savings groups",
    fr: "Groupes d'épargne",
  },
  landingFeature1Desc: {
    es: "Crea o únete a grupos con amigos y familia. Cada uno aporta a su ritmo hacia una meta común.",
    en: "Create or join groups with friends and family. Everyone contributes at their pace toward a shared goal.",
    fr: "Créez ou rejoignez des groupes avec vos proches. Chacun contribue à son rythme vers un objectif commun.",
  },
  landingFeature2Title: {
    es: "Seguimiento en tiempo real",
    en: "Real-time tracking",
    fr: "Suivi en temps réel",
  },
  landingFeature2Desc: {
    es: "Visualiza el progreso del grupo con gráficos y porcentajes. Sabe exactamente cuánto falta.",
    en: "Visualize group progress with charts and percentages. Know exactly how much is left.",
    fr: "Visualisez le progrès du groupe avec des graphiques. Sachez exactement combien il reste.",
  },
  landingFeature3Title: {
    es: "Logros y rachas",
    en: "Achievements and streaks",
    fr: "Succès et séries",
  },
  landingFeature3Desc: {
    es: "Desbloquea logros por tu constancia. Mantén rachas de ahorro y compite con tu grupo.",
    en: "Unlock achievements for your consistency. Maintain saving streaks and compete with your group.",
    fr: "Débloquez des succès pour votre constance. Maintenez des séries d'épargne et rivalisez avec votre groupe.",
  },
  landingFeature4Title: {
    es: "Códigos QR de invitación",
    en: "QR invite codes",
    fr: "Codes QR d'invitation",
  },
  landingFeature4Desc: {
    es: "Comparte un código QR para que otros se unan al instante. Sin complicaciones.",
    en: "Share a QR code so others can join instantly. No hassle.",
    fr: "Partagez un code QR pour que d'autres rejoignent instantanément. Sans complications.",
  },
  landingDownloadTag: {
    es: "Descargar",
    en: "Download",
    fr: "Télécharger",
  },
  landingDownloadTitle: {
    es: "Disponible en todas las plataformas",
    en: "Available on all platforms",
    fr: "Disponible sur toutes les plateformes",
  },
  landingDownloadAndroidDesc: {
    es: "Descarga el APK directamente. No necesitas Play Store.",
    en: "Download the APK directly. No Play Store needed.",
    fr: "Téléchargez l'APK directement. Pas besoin du Play Store.",
  },
  landingDownloadWebDesc: {
    es: "Úsalo desde cualquier navegador en tu computador. Sin instalar nada.",
    en: "Use it from any browser on your computer. No installation needed.",
    fr: "Utilisez-le depuis n'importe quel navigateur. Aucune installation requise.",
  },
  landingDownloadIphoneDesc: {
    es: "Abre la app en Safari y agrégala a tu pantalla de inicio.",
    en: "Open the app in Safari and add it to your home screen.",
    fr: "Ouvrez l'app dans Safari et ajoutez-la à votre écran d'accueil.",
  },
  landingOpenWebApp: {
    es: "Abrir app web",
    en: "Open web app",
    fr: "Ouvrir l'app web",
  },
  landingCtaTitle: {
    es: "¿Listo para empezar a ahorrar?",
    en: "Ready to start saving?",
    fr: "Prêt à commencer à épargner ?",
  },
  landingCtaSubtitle: {
    es: "Crea tu primer grupo en menos de un minuto",
    en: "Create your first group in less than a minute",
    fr: "Créez votre premier groupe en moins d'une minute",
  },
  landingCtaButton: {
    es: "Comenzar ahora",
    en: "Start now",
    fr: "Commencer maintenant",
  },
  landingFooter: {
    es: "Ahorra juntos, logra más.",
    en: "Save together, achieve more.",
    fr: "Épargnez ensemble, accomplissez plus.",
  },

  // ─── Calendar ───────────────────────────────────────────────────────────
  calendar: {
    es: "Calendario",
    en: "Calendar",
    fr: "Calendrier",
  },
  calendarNoContribs: {
    es: "Sin aportes este día",
    en: "No contributions this day",
    fr: "Pas de contributions ce jour",
  },
  yesterday: {
    es: "Ayer",
    en: "Yesterday",
    fr: "Hier",
  },
  calendarToday: {
    es: "Hoy",
    en: "Today",
    fr: "Aujourd'hui",
  },

  // ─── Group Status ───────────────────────────────────────────────────────────
  groupCompleted: {
    es: "Grupo completado",
    en: "Group completed",
    fr: "Groupe terminé",
  },
  groupArchived: {
    es: "Grupo archivado",
    en: "Group archived",
    fr: "Groupe archivé",
  },
  completeGroup: {
    es: "Completar grupo",
    en: "Complete group",
    fr: "Terminer le groupe",
  },
  archiveGroup: {
    es: "Archivar grupo",
    en: "Archive group",
    fr: "Archiver le groupe",
  },
  reactivateGroup: {
    es: "Reactivar grupo",
    en: "Reactivate group",
    fr: "Réactiver le groupe",
  },
  completeGroupConfirm: {
    es: "¿Marcar este grupo como completado? Los miembros no podrán agregar más aportes.",
    en: "Mark this group as completed? Members won't be able to add more contributions.",
    fr: "Marquer ce groupe comme terminé ? Les membres ne pourront plus ajouter de contributions.",
  },
  archiveGroupConfirm: {
    es: "¿Archivar este grupo? Se moverá a la sección de archivados.",
    en: "Archive this group? It will be moved to the archived section.",
    fr: "Archiver ce groupe ? Il sera déplacé dans la section archivée.",
  },
  reactivateGroupConfirm: {
    es: "¿Reactivar este grupo?",
    en: "Reactivate this group?",
    fr: "Réactiver ce groupe ?",
  },
  goalReached: {
    es: "¡Meta alcanzada!",
    en: "Goal reached!",
    fr: "Objectif atteint !",
  },
  congratulations: {
    es: "¡Felicidades! Tu grupo alcanzó la meta.",
    en: "Congratulations! Your group reached the goal.",
    fr: "Félicitations ! Votre groupe a atteint l'objectif.",
  },
  active: {
    es: "Activos",
    en: "Active",
    fr: "Actifs",
  },
  archived: {
    es: "Archivados",
    en: "Archived",
    fr: "Archivés",
  },
  completed: {
    es: "Completado",
    en: "Completed",
    fr: "Terminé",
  },
  noArchivedGroups: {
    es: "No tienes grupos archivados",
    en: "No archived groups",
    fr: "Aucun groupe archivé",
  },
  archivedGroups: {
    es: "Grupos archivados",
    en: "Archived groups",
    fr: "Groupes archivés",
  },

  // ─── Remove Member ──────────────────────────────────────────────────────────
  removeMember: {
    es: "Remover miembro",
    en: "Remove member",
    fr: "Retirer le membre",
  },
  removeMemberConfirm: {
    es: "¿Remover a {name} del grupo? Se eliminarán sus aportes.",
    en: "Remove {name} from the group? Their contributions will be deleted.",
    fr: "Retirer {name} du groupe ? Ses contributions seront supprimées.",
  },

  // ─── Proof Photos ──────────────────────────────────────────────────────────
  addProof: {
    es: "Adjuntar comprobante",
    en: "Attach proof",
    fr: "Joindre un justificatif",
  },
  proofAttached: {
    es: "Comprobante adjunto",
    en: "Proof attached",
    fr: "Justificatif joint",
  },
  viewProof: {
    es: "Ver comprobante",
    en: "View proof",
    fr: "Voir le justificatif",
  },
  removeProof: {
    es: "Quitar comprobante",
    en: "Remove proof",
    fr: "Retirer le justificatif",
  },
  uploadingProof: {
    es: "Subiendo comprobante…",
    en: "Uploading proof…",
    fr: "Téléchargement du justificatif…",
  },

  // ─── Icon Labels ────────────────────────────────────────────────────────────
  iconVacation: { es: "Vacaciones", en: "Vacation", fr: "Vacances" },
  iconWork: { es: "Trabajo", en: "Work", fr: "Travail" },
  iconWinter: { es: "Invierno", en: "Winter", fr: "Hiver" },
  iconTravel: { es: "Viaje", en: "Travel", fr: "Voyage" },
  iconCar: { es: "Auto", en: "Car", fr: "Voiture" },
  iconBoat: { es: "Barco", en: "Boat", fr: "Bateau" },
  iconTrain: { es: "Tren", en: "Train", fr: "Train" },
  iconPhoto: { es: "Foto", en: "Photo", fr: "Photo" },
  iconFood: { es: "Comida", en: "Food", fr: "Repas" },
  iconHome: { es: "Casa", en: "Home", fr: "Maison" },
  iconHealth: { es: "Salud", en: "Health", fr: "Santé" },
  iconGoal: { es: "Meta", en: "Goal", fr: "Objectif" },

  seeAll: { es: "Ver todo", en: "See all", fr: "Voir tout" },
  showLess: { es: "Ver menos", en: "Show less", fr: "Voir moins" },

  // ─── Chat Search ───────────────────────────────────────────────────────────
  searchMessages: {
    es: "Buscar mensajes…",
    en: "Search messages…",
    fr: "Rechercher des messages…",
  },

  // ─── Expense Splitting ──────────────────────────────────────────────────────
  expenses: { es: "Gastos", en: "Expenses", fr: "Dépenses" },
  addExpense: { es: "Agregar gasto", en: "Add expense", fr: "Ajouter dépense" },
  paidBy: { es: "Pagado por", en: "Paid by", fr: "Payé par" },
  splitEqually: { es: "Dividir igual", en: "Split equally", fr: "Diviser également" },
  splitSelected: { es: "Seleccionados", en: "Selected", fr: "Sélectionnés" },
  splitCustom: { es: "Personalizado", en: "Custom", fr: "Personnalisé" },
  splitMismatch: { es: "Los montos no cuadran", en: "Amounts don't add up", fr: "Les montants ne correspondent pas" },
  youOwe: { es: "Tú debes", en: "You owe", fr: "Tu dois" },
  youAreOwed: { es: "Te deben", en: "You are owed", fr: "On te doit" },
  allSettled: { es: "¡Todo saldado!", en: "All settled!", fr: "Tout réglé !" },
  settleUp: { es: "Saldar", en: "Settle", fr: "Régler" },
  amountExceedsDebt: { es: "El monto supera la deuda", en: "Amount exceeds debt", fr: "Le montant dépasse la dette" },
  noExpenses: { es: "Sin gastos aún", en: "No expenses yet", fr: "Pas encore de dépenses" },
  noExpensesDesc: {
    es: "Registra los gastos del grupo para saber quién debe a quién",
    en: "Record group expenses to track who owes whom",
    fr: "Enregistrez les dépenses du groupe pour savoir qui doit quoi",
  },
  expenseDescription: { es: "Descripción", en: "Description", fr: "Description" },
  expenseDescPlaceholder: { es: "Ej: Cena, Uber, Hotel…", en: "E.g. Dinner, Uber, Hotel…", fr: "Ex: Dîner, Uber, Hôtel…" },
  selectMembers: { es: "Seleccionar miembros", en: "Select members", fr: "Sélectionner" },
  owes: { es: "debe a", en: "owes", fr: "doit à" },
  confirmSettle: { es: "Confirmar pago", en: "Confirm payment", fr: "Confirmer paiement" },
  settleAmount: { es: "Monto a pagar", en: "Amount to pay", fr: "Montant à payer" },
  totalExpenses: { es: "Total gastos", en: "Total expenses", fr: "Total dépenses" },
  deleteExpense: { es: "Eliminar gasto", en: "Delete expense", fr: "Supprimer dépense" },
  deleteExpenseConfirm: {
    es: "¿Seguro que deseas eliminar este gasto?",
    en: "Are you sure you want to delete this expense?",
    fr: "Voulez-vous vraiment supprimer cette dépense ?",
  },
  attachReceipt: { es: "Adjuntar recibo", en: "Attach receipt", fr: "Joindre reçu" },
  receiptAttached: { es: "Recibo adjunto", en: "Receipt attached", fr: "Reçu joint" },

  // ─── Smart Reminders ──────────────────────────────────────────────────────
  reminderStreakAtRisk: {
    es: "¡Tu racha se rompe mañana si no aportas!",
    en: "Your streak breaks tomorrow if you don't contribute!",
    fr: "Votre série se termine demain si vous ne contribuez pas !",
  },
  reminderAmountLeft: {
    es: "Te faltan {amount} para completar esta vez",
    en: "You need {amount} more to complete this cycle",
    fr: "Il vous manque {amount} pour compléter ce cycle",
  },
  reminderDeadlineClose: {
    es: "¡Quedan {days} días para el deadline de {group}!",
    en: "{days} days left until {group}'s deadline!",
    fr: "Plus que {days} jours avant la date limite de {group} !",
  },

  // ─── Stats / Charts ──────────────────────────────────────────────────────
  stats: {
    es: "Estadísticas",
    en: "Statistics",
    fr: "Statistiques",
  },
  savingsOverTime: {
    es: "Ahorro en el tiempo",
    en: "Savings over time",
    fr: "Épargne dans le temps",
  },
  contributionsByMember: {
    es: "Aportes por miembro",
    en: "Contributions by member",
    fr: "Contributions par membre",
  },
  savingVelocity: {
    es: "Velocidad de ahorro",
    en: "Saving velocity",
    fr: "Vitesse d'épargne",
  },
  perPeriod: {
    es: "por semana",
    en: "per week",
    fr: "par semaine",
  },
  avgContribution: {
    es: "Aporte promedio",
    en: "Average contribution",
    fr: "Contribution moyenne",
  },
  totalContributions: {
    es: "Total de aportes",
    en: "Total contributions",
    fr: "Total des contributions",
  },
  projected: {
    es: "Proyección",
    en: "Projected",
    fr: "Projection",
  },

  // ─── Group Chat ──────────────────────────────────────────────────────────
  chat: {
    es: "Chat",
    en: "Chat",
    fr: "Chat",
  },
  typeMessage: {
    es: "Escribe un mensaje...",
    en: "Type a message...",
    fr: "Écrivez un message...",
  },
  noMessages: {
    es: "No hay mensajes aún. ¡Inicia la conversación!",
    en: "No messages yet. Start the conversation!",
    fr: "Pas encore de messages. Lancez la conversation !",
  },
  deleteMessage: {
    es: "Eliminar mensaje",
    en: "Delete message",
    fr: "Supprimer le message",
  },

  // ─── Search ──────────────────────────────────────────────────────────────
  searchGroups: {
    es: "Buscar grupos...",
    en: "Search groups...",
    fr: "Rechercher des groupes...",
  },
  noResults: {
    es: "Sin resultados",
    en: "No results",
    fr: "Aucun résultat",
  },

  // ─── Data Export ─────────────────────────────────────────────────────────
  exportCSV: {
    es: "Exportar CSV",
    en: "Export CSV",
    fr: "Exporter en CSV",
  },

  // ─── Theme ───────────────────────────────────────────────────────────────
  theme: {
    es: "Tema",
    en: "Theme",
    fr: "Thème",
  },
  lightMode: {
    es: "Modo claro",
    en: "Light mode",
    fr: "Mode clair",
  },
  systemTheme: {
    es: "Automático",
    en: "System",
    fr: "Automatique",
  },

  // ─── Streaks ────────────────────────────────────────────────────────────
  streakPeriods: {
    es: "veces seguidas",
    en: "times in a row",
    fr: "fois de suite",
  },

  // ─── Offline ─────────────────────────────────────────────────────────────
  offline: {
    es: "Sin conexión",
    en: "Offline",
    fr: "Hors ligne",
  },
  offlineMessage: {
    es: "Algunas funciones no están disponibles sin conexión",
    en: "Some features are unavailable offline",
    fr: "Certaines fonctionnalités ne sont pas disponibles hors ligne",
  },

  // ─── Misc ────────────────────────────────────────────────────────────────
  remove: {
    es: "Remover",
    en: "Remove",
    fr: "Retirer",
  },
  share: {
    es: "Compartir",
    en: "Share",
    fr: "Partager",
  },
};

// ─── Helpers for localized constants ──────────────────────────────────────────

export function getAchievementText(type: string, lang: Language = "es") {
  return {
    title: t(`achievement_${type}_title`, lang),
    description: t(`achievement_${type}_desc`, lang),
  };
}

export function getFrequencyLabel(
  freq: string,
  lang: Language = "es",
  customDays?: number | null,
) {
  if (freq === "custom" && customDays) {
    return t("everyXDays", lang).replace("{x}", String(customDays));
  }
  return t(freq, lang); // 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom' keys
}

export function getFrequencyPeriodLabel(
  freq: string,
  lang: Language = "es",
  customDays?: number | null,
): string {
  switch (freq) {
    case "daily":
      return t("day", lang);
    case "weekly":
      return t("week", lang);
    case "biweekly":
      return t("biweek", lang);
    case "monthly":
      return t("month", lang);
    case "custom":
      return customDays
        ? t("xDays", lang).replace("{x}", String(customDays))
        : t("week", lang);
    default:
      return t("week", lang);
  }
}

/** Plural form: "semanas", "días", "meses", etc. */
export function getFrequencyPeriodLabelPlural(
  freq: string,
  lang: Language = "es",
  customDays?: number | null,
): string {
  switch (freq) {
    case "daily":
      return t("days", lang);
    case "weekly":
      return t("weeks", lang);
    case "biweekly":
      return t("biweeks", lang);
    case "monthly":
      return t("months", lang);
    case "custom":
      return customDays
        ? t("xDays", lang).replace("{x}", String(customDays))
        : t("weeks", lang);
    default:
      return t("weeks", lang);
  }
}

// Variable global para el idioma actual
let currentLanguage: Language = "es";

export const changeLanguage = (language: Language) => {
  currentLanguage = language;
};

export const getCurrentLanguage = (): Language => {
  return currentLanguage;
};

export const t = (key: string, language?: Language): string => {
  const lang = language || currentLanguage;
  const translation = translations[key];
  if (!translation) {
    return key;
  }
  return translation[lang] || translation.es || key;
};

// Hook para usar traducciones
export const useTranslation = () => {
  return {
    t: (key: string) => t(key, currentLanguage),
    currentLanguage,
    changeLanguage,
  };
};
