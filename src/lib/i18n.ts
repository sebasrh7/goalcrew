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
    es: "Viaja con\ntu crew",
    en: "Travel with\nyour crew",
    fr: "Voyagez avec\nvotre équipe",
  },
  welcomeDesc1: {
    es: "Ahorra en grupo, mantente motivado y llega al destino que siempre soñaron juntos.",
    en: "Save as a group, stay motivated and reach the destination you always dreamed of together.",
    fr: "Économisez en groupe, restez motivé et atteignez la destination dont vous avez toujours rêvé ensemble.",
  },
  welcomeTitle2: {
    es: "Establece metas\njuntos",
    en: "Set goals\ntogether",
    fr: "Fixez des objectifs\nensemble",
  },
  welcomeDesc2: {
    es: "Define objetivos claros, divídanse los gastos de forma justa y trackeen el progreso en tiempo real.",
    en: "Define clear objectives, divide expenses fairly and track progress in real time.",
    fr: "Définissez des objectifs clairs, divisez les dépenses équitablement et suivez les progrès en temps réel.",
  },
  welcomeTitle3: {
    es: "Celebra cada\nlogro",
    en: "Celebrate every\nachievement",
    fr: "Célébrez chaque\nréussite",
  },
  welcomeDesc3: {
    es: "Gana medallas, mantén rachas y comparte la emoción de cada meta alcanzada.",
    en: "Earn medals, maintain streaks and share the excitement of each goal achieved.",
    fr: "Gagnez des médailles, maintenez des séries et partagez l'excitation de chaque objectif atteint.",
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
    es: "Viajero",
    en: "Traveler",
    fr: "Voyageur",
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
  medals: {
    es: "Medallas",
    en: "Medals",
    fr: "Médailles",
  },
  weeklyStreak: {
    es: "Racha semanal",
    en: "Weekly streak",
    fr: "Série hebdomadaire",
  },
  days: {
    es: "días",
    en: "days",
    fr: "jours",
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
  week: {
    es: "semana",
    en: "week",
    fr: "semaine",
  },
  month: {
    es: "mes",
    en: "month",
    fr: "mois",
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
    es: "ej. Viaje a Miami",
    en: "e.g. Trip to Miami",
    fr: "ex. Voyage à Miami",
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
    es: "Destino",
    en: "Destination",
    fr: "Destination",
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
    es: "3 días consecutivos ahorrando",
    en: "3 consecutive days saving",
    fr: "3 jours consécutifs d'épargne",
  },
  achievement_streak_7_title: {
    es: "Semana de fuego",
    en: "Fire week",
    fr: "Semaine en feu",
  },
  achievement_streak_7_desc: {
    es: "7 días consecutivos ahorrando",
    en: "7 consecutive days saving",
    fr: "7 jours consécutifs d'épargne",
  },
  achievement_streak_30_title: {
    es: "Mes imparable",
    en: "Unstoppable month",
    fr: "Mois inarrêtable",
  },
  achievement_streak_30_desc: {
    es: "30 días consecutivos ahorrando",
    en: "30 consecutive days saving",
    fr: "30 jours consécutifs d'épargne",
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
    es: "Hecho con 💜 para viajeros",
    en: "Made with 💜 for travelers",
    fr: "Fait avec 💜 pour les voyageurs",
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
    es: "Periodos",
    en: "Periods",
    fr: "Périodes",
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
    es: "¡Únete a nuestro grupo de ahorro",
    en: "Join our savings group",
    fr: "Rejoignez notre groupe d'épargne",
  },
  joinShareTitle: {
    es: "Únete a",
    en: "Join",
    fr: "Rejoindre",
  },
  downloadApp: {
    es: "Descarga la app:",
    en: "Download the app:",
    fr: "Téléchargez l'app :",
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
    es: "¿A dónde van?",
    en: "Where are you going?",
    fr: "Où allez-vous ?",
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
  tripIcon: {
    es: "Icono del viaje",
    en: "Trip icon",
    fr: "Icône du voyage",
  },
  setupGroupTrip: {
    es: "Configura tu viaje grupal",
    en: "Set up your group trip",
    fr: "Configurez votre voyage de groupe",
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
