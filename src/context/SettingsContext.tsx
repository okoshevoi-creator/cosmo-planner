import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ColorTheme = 'rose-gold' | 'ocean-blue' | 'forest-green';
export type Language = 'ro' | 'ru' | 'en';

export interface Category {
  id: string;
  name: string;
  type: 'service' | 'expense';
}

interface SettingsContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  serviceCategories: Category[];
  expenseCategories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  t: (key: string) => string;
}

const defaultServiceCategories: Category[] = [
  { id: '1', name: 'Manichiură', type: 'service' },
  { id: '2', name: 'Pedichiură', type: 'service' },
  { id: '3', name: 'Coafor', type: 'service' },
  { id: '4', name: 'Cosmetologie', type: 'service' },
  { id: '5', name: 'Masaj', type: 'service' },
];

const defaultExpenseCategories: Category[] = [
  { id: '10', name: 'Produse', type: 'expense' },
  { id: '11', name: 'Ustensile', type: 'expense' },
  { id: '12', name: 'Chirie', type: 'expense' },
  { id: '13', name: 'Utilități', type: 'expense' },
  { id: '14', name: 'Marketing', type: 'expense' },
  { id: '15', name: 'Altele', type: 'expense' },
];

const translations: Record<Language, Record<string, string>> = {
  ro: {
    // Navigation
    'nav.home': 'Acasă',
    'nav.appointments': 'Programări',
    'nav.clients': 'Clienți',
    'nav.services': 'Servicii',
    'nav.expenses': 'Cheltuieli',
    'nav.reports': 'Rapoarte',
    'nav.settings': 'Setări',
    'nav.more': 'Mai mult',
    
    // Dashboard
    'dashboard.title': 'Bun venit!',
    'dashboard.todayRevenue': 'Venit Azi',
    'dashboard.monthlyRevenue': 'Venituri Luna',
    'dashboard.todayAppointments': 'Programări Azi',
    'dashboard.totalClients': 'Total Clienți',
    'dashboard.monthlyExpenses': 'Cheltuieli Luna',
    'dashboard.monthlyProfit': 'Profit Luna',
    'dashboard.quickActions': 'Acțiuni Rapide',
    'dashboard.todaySchedule': 'Programări Azi',
    'dashboard.activeClients': 'Clienți Activi',
    'dashboard.plannedHours': 'Ore Planificate',
    'dashboard.thisMonth': 'Luna aceasta',
    'dashboard.today': 'Azi',
    'dashboard.viewAll': 'Vezi toate',
    'dashboard.appointmentsFor': 'Ai {count} programări pentru azi',
    'dashboard.goodMorning': 'Bună dimineața',
    'dashboard.goodAfternoon': 'Bună ziua',
    'dashboard.goodEvening': 'Bună seara',
    
    // Common
    'common.add': 'Adaugă',
    'common.edit': 'Editează',
    'common.delete': 'Șterge',
    'common.save': 'Salvează',
    'common.cancel': 'Anulează',
    'common.search': 'Caută',
    'common.filter': 'Filtrează',
    'common.noData': 'Nu există date',
    'common.loading': 'Se încarcă...',
    'common.currency': 'MDL',
    'common.all': 'Toate',
    'common.registered': 'înregistrați',
    'common.available': 'disponibile',
    'common.min': 'min',
    'common.visits': 'Vizite',
    'common.totalSpent': 'Total cheltuit',
    'common.lastVisit': 'Ultima vizită',
    'common.searchClient': 'Caută client...',
    'common.noExpenses': 'Nu ai cheltuieli înregistrate',
    'common.addFirstExpense': 'Adaugă prima cheltuială',
    'common.reservations': 'rezervări',
    'common.completed': 'finalizate',
    'common.startDate': 'Data început',
    'common.endDate': 'Data sfârșit',
    
    // Settings
    'settings.title': 'Setări',
    'settings.appearance': 'Aspect',
    'settings.themeMode': 'Mod afișare',
    'settings.light': 'Luminos',
    'settings.dark': 'Întunecat',
    'settings.colorTheme': 'Tema culori',
    'settings.roseGold': 'Rose Gold',
    'settings.oceanBlue': 'Ocean Blue',
    'settings.forestGreen': 'Forest Green',
    'settings.language': 'Limba',
    'settings.categories': 'Categorii',
    'settings.serviceCategories': 'Categorii Servicii',
    'settings.expenseCategories': 'Categorii Cheltuieli',
    'settings.addCategory': 'Adaugă Categorie',
    'settings.categoryName': 'Nume categorie',
    'settings.backup': 'Backup Date',
    'settings.export': 'Exportă Date',
    'settings.import': 'Importă Date',
    'settings.darkModeActive': 'Mod întunecat activ',
    'settings.lightModeActive': 'Mod luminos activ',
    'settings.backupDescription': 'Exportați sau importați datele aplicației pentru backup.',
    'settings.categoryUpdated': 'Categoria a fost actualizată.',
    'settings.categoryAdded': 'Categoria a fost adăugată.',
    'settings.categoryDeleted': 'Categoria a fost ștearsă.',
    'settings.editCategory': 'Modificați numele categoriei.',
    'settings.addNewCategory': 'Adăugați o nouă categorie.',
    'settings.success': 'Succes',
    'settings.error': 'Eroare',
    'settings.invalidFile': 'Fișierul nu este valid.',
    'settings.dataExported': 'Datele au fost exportate cu succes!',
    'settings.dataImported': 'Datele au fost importate cu succes!',
    
    // Reports
    'reports.title': 'Rapoarte',
    'reports.period': 'Perioadă',
    'reports.day': 'Zi',
    'reports.week': 'Săptămână',
    'reports.month': 'Lună',
    'reports.quarter': 'Trimestru',
    'reports.year': 'An',
    'reports.custom': 'Personalizat',
    'reports.revenue': 'Venituri',
    'reports.expenses': 'Cheltuieli',
    'reports.profit': 'Profit',
    'reports.totalAppointments': 'Programări',
    'reports.completedAppointments': 'Programări Finalizate',
    'reports.topServices': 'Top Servicii',
    'reports.loyalClients': 'Clienți Fideli',
    'reports.topRevenueClients': 'Clienți cu Venit Maxim',
    'reports.revenueVsExpenses': 'Venituri vs Cheltuieli',
    'reports.expenseBreakdown': 'Distribuție Cheltuieli',
    'reports.noDataPeriod': 'Nu există date pentru această perioadă',
    
    // Appointments
    'appointments.title': 'Programări',
    'appointments.new': 'Programare Nouă',
    'appointments.client': 'Client',
    'appointments.service': 'Serviciu',
    'appointments.date': 'Data',
    'appointments.time': 'Ora',
    'appointments.status': 'Status',
    'appointments.scheduled': 'Programat',
    'appointments.completed': 'Finalizat',
    'appointments.cancelled': 'Anulat',
    'appointments.count': '{count} Programări',
    
    // Clients
    'clients.title': 'Clienți',
    'clients.new': 'Client Nou',
    'clients.name': 'Nume',
    'clients.phone': 'Telefon',
    'clients.email': 'Email',
    'clients.visits': 'Vizite',
    'clients.spent': 'Cheltuit',
    'clients.registered': '{count} clienți înregistrați',
    
    // Services
    'services.title': 'Servicii',
    'services.new': 'Serviciu Nou',
    'services.name': 'Nume',
    'services.category': 'Categorie',
    'services.duration': 'Durată',
    'services.price': 'Preț',
    'services.available': '{count} servicii disponibile',
    
    // Expenses
    'expenses.title': 'Cheltuieli',
    'expenses.new': 'Cheltuială Nouă',
    'expenses.category': 'Categorie',
    'expenses.description': 'Descriere',
    'expenses.amount': 'Sumă',
    'expenses.date': 'Data',
    'expenses.registered': '{count} cheltuieli înregistrate',
    'expenses.total': 'Total',
  },
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.appointments': 'Записи',
    'nav.clients': 'Клиенты',
    'nav.services': 'Услуги',
    'nav.expenses': 'Расходы',
    'nav.reports': 'Отчёты',
    'nav.settings': 'Настройки',
    'nav.more': 'Ещё',
    
    // Dashboard
    'dashboard.title': 'Добро пожаловать!',
    'dashboard.todayRevenue': 'Доход Сегодня',
    'dashboard.monthlyRevenue': 'Доход за Месяц',
    'dashboard.todayAppointments': 'Записей Сегодня',
    'dashboard.totalClients': 'Всего Клиентов',
    'dashboard.monthlyExpenses': 'Расходы за Месяц',
    'dashboard.monthlyProfit': 'Прибыль за Месяц',
    'dashboard.quickActions': 'Быстрые Действия',
    'dashboard.todaySchedule': 'Записи Сегодня',
    'dashboard.activeClients': 'Активные Клиенты',
    'dashboard.plannedHours': 'Запланировано Часов',
    'dashboard.thisMonth': 'В этом месяце',
    'dashboard.today': 'Сегодня',
    'dashboard.viewAll': 'Смотреть все',
    'dashboard.appointmentsFor': 'У вас {count} записей на сегодня',
    'dashboard.goodMorning': 'Доброе утро',
    'dashboard.goodAfternoon': 'Добрый день',
    'dashboard.goodEvening': 'Добрый вечер',
    
    // Common
    'common.add': 'Добавить',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.noData': 'Нет данных',
    'common.loading': 'Загрузка...',
    'common.currency': 'MDL',
    'common.all': 'Все',
    'common.registered': 'зарегистрировано',
    'common.available': 'доступно',
    'common.min': 'мин',
    'common.visits': 'Визиты',
    'common.totalSpent': 'Всего потрачено',
    'common.lastVisit': 'Последний визит',
    'common.searchClient': 'Найти клиента...',
    'common.noExpenses': 'Нет зарегистрированных расходов',
    'common.addFirstExpense': 'Добавить первый расход',
    'common.reservations': 'бронирований',
    'common.completed': 'завершено',
    'common.startDate': 'Дата начала',
    'common.endDate': 'Дата окончания',
    
    // Settings
    'settings.title': 'Настройки',
    'settings.appearance': 'Внешний вид',
    'settings.themeMode': 'Режим отображения',
    'settings.light': 'Светлый',
    'settings.dark': 'Тёмный',
    'settings.colorTheme': 'Цветовая тема',
    'settings.roseGold': 'Rose Gold',
    'settings.oceanBlue': 'Ocean Blue',
    'settings.forestGreen': 'Forest Green',
    'settings.language': 'Язык',
    'settings.categories': 'Категории',
    'settings.serviceCategories': 'Категории Услуг',
    'settings.expenseCategories': 'Категории Расходов',
    'settings.addCategory': 'Добавить Категорию',
    'settings.categoryName': 'Название категории',
    'settings.backup': 'Резервное Копирование',
    'settings.export': 'Экспорт Данных',
    'settings.import': 'Импорт Данных',
    'settings.darkModeActive': 'Тёмный режим активен',
    'settings.lightModeActive': 'Светлый режим активен',
    'settings.backupDescription': 'Экспортируйте или импортируйте данные приложения для резервного копирования.',
    'settings.categoryUpdated': 'Категория обновлена.',
    'settings.categoryAdded': 'Категория добавлена.',
    'settings.categoryDeleted': 'Категория удалена.',
    'settings.editCategory': 'Измените название категории.',
    'settings.addNewCategory': 'Добавьте новую категорию.',
    'settings.success': 'Успешно',
    'settings.error': 'Ошибка',
    'settings.invalidFile': 'Файл недействителен.',
    'settings.dataExported': 'Данные успешно экспортированы!',
    'settings.dataImported': 'Данные успешно импортированы!',
    
    // Reports
    'reports.title': 'Отчёты',
    'reports.period': 'Период',
    'reports.day': 'День',
    'reports.week': 'Неделя',
    'reports.month': 'Месяц',
    'reports.quarter': 'Квартал',
    'reports.year': 'Год',
    'reports.custom': 'Произвольный',
    'reports.revenue': 'Доходы',
    'reports.expenses': 'Расходы',
    'reports.profit': 'Прибыль',
    'reports.totalAppointments': 'Записи',
    'reports.completedAppointments': 'Завершённых Записей',
    'reports.topServices': 'Топ Услуг',
    'reports.loyalClients': 'Постоянные Клиенты',
    'reports.topRevenueClients': 'Клиенты с Макс. Доходом',
    'reports.revenueVsExpenses': 'Доходы vs Расходы',
    'reports.expenseBreakdown': 'Распределение Расходов',
    'reports.noDataPeriod': 'Нет данных за этот период',
    
    // Appointments
    'appointments.title': 'Записи',
    'appointments.new': 'Новая Запись',
    'appointments.client': 'Клиент',
    'appointments.service': 'Услуга',
    'appointments.date': 'Дата',
    'appointments.time': 'Время',
    'appointments.status': 'Статус',
    'appointments.scheduled': 'Запланировано',
    'appointments.completed': 'Завершено',
    'appointments.cancelled': 'Отменено',
    'appointments.count': '{count} Записей',
    
    // Clients
    'clients.title': 'Клиенты',
    'clients.new': 'Новый Клиент',
    'clients.name': 'Имя',
    'clients.phone': 'Телефон',
    'clients.email': 'Email',
    'clients.visits': 'Визиты',
    'clients.spent': 'Потрачено',
    'clients.registered': '{count} клиентов зарегистрировано',
    
    // Services
    'services.title': 'Услуги',
    'services.new': 'Новая Услуга',
    'services.name': 'Название',
    'services.category': 'Категория',
    'services.duration': 'Длительность',
    'services.price': 'Цена',
    'services.available': '{count} услуг доступно',
    
    // Expenses
    'expenses.title': 'Расходы',
    'expenses.new': 'Новый Расход',
    'expenses.category': 'Категория',
    'expenses.description': 'Описание',
    'expenses.amount': 'Сумма',
    'expenses.date': 'Дата',
    'expenses.registered': '{count} расходов зарегистрировано',
    'expenses.total': 'Всего',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.appointments': 'Appointments',
    'nav.clients': 'Clients',
    'nav.services': 'Services',
    'nav.expenses': 'Expenses',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.more': 'More',
    
    // Dashboard
    'dashboard.title': 'Welcome!',
    'dashboard.todayRevenue': 'Today Revenue',
    'dashboard.monthlyRevenue': 'Monthly Revenue',
    'dashboard.todayAppointments': 'Today Appointments',
    'dashboard.totalClients': 'Total Clients',
    'dashboard.monthlyExpenses': 'Monthly Expenses',
    'dashboard.monthlyProfit': 'Monthly Profit',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.todaySchedule': 'Today Schedule',
    'dashboard.activeClients': 'Active Clients',
    'dashboard.plannedHours': 'Planned Hours',
    'dashboard.thisMonth': 'This month',
    'dashboard.today': 'Today',
    'dashboard.viewAll': 'View all',
    'dashboard.appointmentsFor': 'You have {count} appointments today',
    'dashboard.goodMorning': 'Good morning',
    'dashboard.goodAfternoon': 'Good afternoon',
    'dashboard.goodEvening': 'Good evening',
    
    // Common
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.noData': 'No data',
    'common.loading': 'Loading...',
    'common.currency': 'MDL',
    'common.all': 'All',
    'common.registered': 'registered',
    'common.available': 'available',
    'common.min': 'min',
    'common.visits': 'Visits',
    'common.totalSpent': 'Total spent',
    'common.lastVisit': 'Last visit',
    'common.searchClient': 'Search client...',
    'common.noExpenses': 'No registered expenses',
    'common.addFirstExpense': 'Add first expense',
    'common.reservations': 'reservations',
    'common.completed': 'completed',
    'common.startDate': 'Start date',
    'common.endDate': 'End date',
    
    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.themeMode': 'Display Mode',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.colorTheme': 'Color Theme',
    'settings.roseGold': 'Rose Gold',
    'settings.oceanBlue': 'Ocean Blue',
    'settings.forestGreen': 'Forest Green',
    'settings.language': 'Language',
    'settings.categories': 'Categories',
    'settings.serviceCategories': 'Service Categories',
    'settings.expenseCategories': 'Expense Categories',
    'settings.addCategory': 'Add Category',
    'settings.categoryName': 'Category name',
    'settings.backup': 'Data Backup',
    'settings.export': 'Export Data',
    'settings.import': 'Import Data',
    'settings.darkModeActive': 'Dark mode active',
    'settings.lightModeActive': 'Light mode active',
    'settings.backupDescription': 'Export or import application data for backup.',
    'settings.categoryUpdated': 'Category updated.',
    'settings.categoryAdded': 'Category added.',
    'settings.categoryDeleted': 'Category deleted.',
    'settings.editCategory': 'Edit category name.',
    'settings.addNewCategory': 'Add a new category.',
    'settings.success': 'Success',
    'settings.error': 'Error',
    'settings.invalidFile': 'Invalid file.',
    'settings.dataExported': 'Data exported successfully!',
    'settings.dataImported': 'Data imported successfully!',
    
    // Reports
    'reports.title': 'Reports',
    'reports.period': 'Period',
    'reports.day': 'Day',
    'reports.week': 'Week',
    'reports.month': 'Month',
    'reports.quarter': 'Quarter',
    'reports.year': 'Year',
    'reports.custom': 'Custom',
    'reports.revenue': 'Revenue',
    'reports.expenses': 'Expenses',
    'reports.profit': 'Profit',
    'reports.totalAppointments': 'Appointments',
    'reports.completedAppointments': 'Completed Appointments',
    'reports.topServices': 'Top Services',
    'reports.loyalClients': 'Loyal Clients',
    'reports.topRevenueClients': 'Top Revenue Clients',
    'reports.revenueVsExpenses': 'Revenue vs Expenses',
    'reports.expenseBreakdown': 'Expense Breakdown',
    'reports.noDataPeriod': 'No data for this period',
    
    // Appointments
    'appointments.title': 'Appointments',
    'appointments.new': 'New Appointment',
    'appointments.client': 'Client',
    'appointments.service': 'Service',
    'appointments.date': 'Date',
    'appointments.time': 'Time',
    'appointments.status': 'Status',
    'appointments.scheduled': 'Scheduled',
    'appointments.completed': 'Completed',
    'appointments.cancelled': 'Cancelled',
    'appointments.count': '{count} Appointments',
    
    // Clients
    'clients.title': 'Clients',
    'clients.new': 'New Client',
    'clients.name': 'Name',
    'clients.phone': 'Phone',
    'clients.email': 'Email',
    'clients.visits': 'Visits',
    'clients.spent': 'Spent',
    'clients.registered': '{count} clients registered',
    
    // Services
    'services.title': 'Services',
    'services.new': 'New Service',
    'services.name': 'Name',
    'services.category': 'Category',
    'services.duration': 'Duration',
    'services.price': 'Price',
    'services.available': '{count} services available',
    
    // Expenses
    'expenses.title': 'Expenses',
    'expenses.new': 'New Expense',
    'expenses.category': 'Category',
    'expenses.description': 'Description',
    'expenses.amount': 'Amount',
    'expenses.date': 'Date',
    'expenses.registered': '{count} expenses registered',
    'expenses.total': 'Total',
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'light';
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('colorTheme');
    return (saved as ColorTheme) || 'rose-gold';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ro';
  });

  const [serviceCategories, setServiceCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('serviceCategories');
    return saved ? JSON.parse(saved) : defaultServiceCategories;
  });

  const [expenseCategories, setExpenseCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('expenseCategories');
    return saved ? JSON.parse(saved) : defaultExpenseCategories;
  });

  // Apply theme mode
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Apply color theme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', colorTheme);
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  // Save language
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Save categories
  useEffect(() => {
    localStorage.setItem('serviceCategories', JSON.stringify(serviceCategories));
  }, [serviceCategories]);

  useEffect(() => {
    localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  const setThemeMode = (mode: ThemeMode) => setThemeModeState(mode);
  const setColorTheme = (theme: ColorTheme) => setColorThemeState(theme);
  const setLanguage = (lang: Language) => setLanguageState(lang);

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: Date.now().toString() };
    if (category.type === 'service') {
      setServiceCategories(prev => [...prev, newCategory]);
    } else {
      setExpenseCategories(prev => [...prev, newCategory]);
    }
  };

  const updateCategory = (id: string, name: string) => {
    setServiceCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, name } : cat))
    );
    setExpenseCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, name } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setServiceCategories(prev => prev.filter(cat => cat.id !== id));
    setExpenseCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        themeMode,
        setThemeMode,
        colorTheme,
        setColorTheme,
        language,
        setLanguage,
        serviceCategories,
        expenseCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
