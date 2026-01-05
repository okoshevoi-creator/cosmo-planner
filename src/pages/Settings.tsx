import { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Palette, Globe, FolderOpen, Plus, Pencil, Trash2, Download, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings, ThemeMode, ColorTheme, Language, Category } from '@/context/SettingsContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const Settings = () => {
  const { 
    themeMode, setThemeMode, 
    colorTheme, setColorTheme, 
    language, setLanguage,
    serviceCategories, expenseCategories,
    addCategory, updateCategory, deleteCategory,
    t 
  } = useSettings();
  const { exportData, importData } = useData();
  const { toast } = useToast();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'service' | 'expense'>('service');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleExport = async () => {
    const data = exportData();
    const fileName = `beauty-salon-backup-${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([data], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });

    // Try using Web Share API for mobile devices
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Backup Date Salon',
        });
        toast({
          title: t('settings.export'),
          description: 'Datele au fost exportate cu succes!',
        });
        return;
      } catch (error) {
        // User cancelled or share failed, fall through to download method
        if ((error as Error).name === 'AbortError') {
          return; // User cancelled, don't show error
        }
      }
    }

    // Fallback for desktop or if share API not available
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t('settings.export'),
      description: 'Datele au fost exportate cu succes!',
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            importData(content);
            toast({
              title: t('settings.import'),
              description: 'Datele au fost importate cu succes!',
            });
          } catch {
            toast({
              title: 'Eroare',
              description: 'Fișierul nu este valid.',
              variant: 'destructive',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryName);
      toast({ title: 'Succes', description: 'Categoria a fost actualizată.' });
    } else {
      addCategory({ name: categoryName, type: categoryType });
      toast({ title: 'Succes', description: 'Categoria a fost adăugată.' });
    }

    setCategoryDialogOpen(false);
    setCategoryName('');
    setEditingCategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      toast({ title: 'Succes', description: 'Categoria a fost ștearsă.' });
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const colorThemes: { id: ColorTheme; name: string; preview: string }[] = [
    { id: 'rose-gold', name: t('settings.roseGold'), preview: 'bg-[hsl(350,35%,70%)]' },
    { id: 'ocean-blue', name: t('settings.oceanBlue'), preview: 'bg-[hsl(210,70%,50%)]' },
    { id: 'forest-green', name: t('settings.forestGreen'), preview: 'bg-[hsl(150,40%,45%)]' },
  ];

  const languages: { id: Language; name: string; flag: string }[] = [
    { id: 'ro', name: 'Română', flag: '🇷🇴' },
    { id: 'ru', name: 'Русский', flag: '🇷🇺' },
    { id: 'en', name: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-display font-semibold">{t('settings.title')}</h1>
          </div>
        </div>
      </header>

      <main className="container py-4 space-y-4">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance" className="text-xs">
              <Palette className="h-4 w-4 mr-1" />
              {t('settings.appearance')}
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs">
              <FolderOpen className="h-4 w-4 mr-1" />
              {t('settings.categories')}
            </TabsTrigger>
            <TabsTrigger value="backup" className="text-xs">
              <Download className="h-4 w-4 mr-1" />
              {t('settings.backup')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            {/* Theme Mode */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {themeMode === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {t('settings.themeMode')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{themeMode === 'dark' ? t('settings.dark') : t('settings.light')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {themeMode === 'dark' ? 'Mod întunecat activ' : 'Mod luminos activ'}
                      </p>
                    </div>
                    <Switch
                      checked={themeMode === 'dark'}
                      onCheckedChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Color Theme */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    {t('settings.colorTheme')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {colorThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setColorTheme(theme.id)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          colorTheme === theme.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-full h-8 rounded-lg mb-2 ${theme.preview}`} />
                        <span className="text-xs font-medium">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Language */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t('settings.language')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          language === lang.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-xs font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-4">
            {/* Service Categories */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t('settings.serviceCategories')}</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryName('');
                        setCategoryType('service');
                        setCategoryDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t('common.add')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {serviceCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium">{category.name}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Expense Categories */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t('settings.expenseCategories')}</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryName('');
                        setCategoryType('expense');
                        setCategoryDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t('common.add')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {expenseCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium">{category.name}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4 mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('settings.backup')}</CardTitle>
                  <CardDescription>
                    Exportați sau importați datele aplicației pentru backup.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleExport} className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t('settings.export')}
                  </Button>
                  <Button onClick={handleImport} className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    {t('settings.import')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t('common.edit') : t('settings.addCategory')}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Modificați numele categoriei.' : 'Adăugați o nouă categorie.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.categoryName')}</Label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Introduceți numele..."
              />
            </div>
            {!editingCategory && (
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select value={categoryType} onValueChange={(v) => setCategoryType(v as 'service' | 'expense')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Serviciu</SelectItem>
                    <SelectItem value="expense">Cheltuială</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveCategory}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ștergeți categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Categoria "{categoryToDelete?.name}" va fi ștearsă permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
