import { useMemo, useState } from "react";
import { Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/context/SettingsContext";

type ExportDataButtonProps = {
  getJson: () => string;
};

const buildFileName = () => {
  const date = new Date().toISOString().split("T")[0];
  return `beauty-salon-backup-${date}.json`;
};

// We no longer use downloadJsonFile - all downloads go through navigator.share or copy

export default function ExportDataButton({ getJson }: ExportDataButtonProps) {
  const isMobile = useIsMobile();
  const { t } = useSettings();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const fileName = useMemo(() => buildFileName(), []);

  const handleExportFile = async () => {
    const json = getJson();
    const blob = new Blob([json], { type: "application/json" });
    const file = new File([blob], fileName, { type: "application/json" });

    // Try Web Share API first - this works best on mobile devices
    // and doesn't require storage permissions
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ 
          files: [file], 
          title: t("settings.backup"),
          text: t("settings.exportHint")
        });
        toast({ title: t("settings.export"), description: t("settings.dataExported") });
        setOpen(false);
        return;
      }
    } catch (error) {
      // If user cancels share, don't treat it as a failure
      if ((error as Error)?.name === "AbortError") return;
      // fall through to text share
    }

    // Fallback: Try sharing as text (works on more devices)
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("settings.backup"),
          text: json,
        });
        toast({ title: t("settings.export"), description: t("settings.dataExported") });
        setOpen(false);
        return;
      }
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return;
      // fall through to clipboard
    }

    // Final fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(json);
      toast({ 
        title: t("settings.export"), 
        description: t("settings.backupCopied") 
      });
      setOpen(false);
    } catch {
      toast({
        title: t("settings.error"),
        description: t("settings.exportFailed"),
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getJson());
      toast({ title: t("settings.export"), description: t("settings.backupCopied") });
    } catch {
      toast({
        title: t("settings.error"),
        description: t("settings.copyFailed"),
        variant: "destructive",
      });
    }
  };

  const Content = (
    <>
      <div className="space-y-3 p-4">
        <p className="text-sm text-muted-foreground">{t("settings.exportHint")}</p>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">{t("settings.fileName")}</p>
          <p className="text-sm font-medium break-all">{fileName}</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-2">
          <Button onClick={handleExportFile} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {t("settings.exportFile")}
          </Button>
          <Button onClick={handleCopy} className="w-full" variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            {t("settings.copyBackup")}
          </Button>
          <Button onClick={() => setOpen(false)} className="w-full" variant="ghost">
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <Button onClick={() => setOpen(true)} className="w-full" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t("settings.export")}
        </Button>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("settings.export")}</DrawerTitle>
            <DrawerDescription>{t("settings.backup")}</DrawerDescription>
          </DrawerHeader>
          {Content}
          <DrawerFooter />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="w-full" variant="outline">
        <Download className="h-4 w-4 mr-2" />
        {t("settings.export")}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.export")}</DialogTitle>
          <DialogDescription>{t("settings.backup")}</DialogDescription>
        </DialogHeader>
        {Content}
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
