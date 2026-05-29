'use client';

import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format, addYears } from 'date-fns';
import { Upload, CheckCircle2, AlertTriangle, XCircle, FileText, Shield, Clock, ArrowRight, CalendarIcon } from 'lucide-react';
import type { AppUser } from '@/types/user';
import { REQUIRED_DOCUMENTS } from '@/services/praz-types';
import type { DocumentId } from '@/services/praz-types';
import { PRAZ_FEES, CONSULTANT_COST_RANGE, CONSULTANT_COST_USD, classifyPrazTier, formatPrazSavings } from '@/lib/praz-constants';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  valid: { label: 'Valid', icon: CheckCircle2, class: 'text-green-500 bg-green-500/10 border-green-500/20' },
  expiring_soon: { label: 'Expiring Soon', icon: Clock, class: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  expired: { label: 'Expired', icon: AlertTriangle, class: 'text-red-500 bg-red-500/10 border-red-500/20' },
  missing: { label: 'Missing', icon: XCircle, class: 'text-muted-foreground bg-muted/30 border-muted/50' },
} as const;

export default function PrazCompliancePage() {
  const { user: authUser } = useContext(AuthContext);
  const user = authUser as AppUser | null;
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Record<string, any>>({});
  const [readinessScore, setReadinessScore] = useState(0);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDocType, setDialogDocType] = useState<DocumentId | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [noExpiry, setNoExpiry] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [wizardStep, setWizardStep] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardRevenue, setWizardRevenue] = useState<number | null>(null);
  const [wizardStaff, setWizardStaff] = useState<number | null>(null);
  const [wizardAssets, setWizardAssets] = useState<number | null>(null);
  const [classifiedTier, setClassifiedTier] = useState<string | null>(null);

  const perpetualDocIds = new Set(['cert_incorporation', 'cr14', 'cr6']);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  async function loadProfile() {
    if (!user) return;
    try {
      const res = await fetch(`/api/praz/profile?userId=${user.uid}`);
      if (res.ok) {
        const profile = await res.json();
        setDocuments(profile.documents);
        setReadinessScore(profile.readinessScore);
      }
    } catch { /* no profile yet */ }
    setLoading(false);
  }

  function openUploadDialog(docType: DocumentId) {
    setDialogDocType(docType);
    setSelectedFile(null);
    const isPerpetual = perpetualDocIds.has(docType);
    setNoExpiry(isPerpetual);
    setSelectedDate(isPerpetual ? undefined : addYears(new Date(), 1));
    setDialogOpen(true);
  }

  async function handleUploadWithExpiry() {
    if (!user || !dialogDocType || !selectedFile) return;
    const docType = dialogDocType;
    const file = selectedFile;
    setUploading(docType);
    setDialogOpen(false);
    try {
      const storagePath = `praz/${user.uid}/${docType}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      const expiresAtStr = noExpiry || !selectedDate ? null : selectedDate.toISOString();

      await fetch('/api/praz/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, docType, fileName: file.name, fileUrl: downloadUrl, expiresAt: expiresAtStr }),
      });

      setDocuments(prev => ({
        ...prev,
        [docType]: { docType, fileName: file.name, uploadedAt: new Date(), expiresAt: expiresAtStr, status: 'valid' },
      }));
      loadProfile();
      toast({ title: 'Document uploaded', description: `${REQUIRED_DOCUMENTS.find(d => d.id === docType)?.label} uploaded successfully.` });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(null);
      setDialogDocType(null);
      setSelectedFile(null);
    }
  }

  async function handleDelete(docType: DocumentId) {
    if (!user) return;
    try {
      await fetch(`/api/praz/document?userId=${user.uid}&docType=${docType}`, { method: 'DELETE' });
      setDocuments(prev => ({ ...prev, [docType]: null }));
      loadProfile();
      toast({ title: 'Document removed', description: 'File has been deleted.' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  }

  function openWizard() {
    setWizardStep(0);
    setWizardRevenue(null);
    setWizardStaff(null);
    setWizardAssets(null);
    setClassifiedTier(null);
    setWizardOpen(true);
  }

  function handleWizardNext() {
    if (wizardStep < 2) {
      setWizardStep(s => s + 1);
    } else {
      if (wizardRevenue !== null && wizardStaff !== null && wizardAssets !== null) {
        const tier = classifyPrazTier(wizardRevenue, wizardStaff, wizardAssets);
        setClassifiedTier(tier);
      }
    }
  }

  function resetWizard() {
    setWizardStep(0);
    setWizardRevenue(null);
    setWizardStaff(null);
    setWizardAssets(null);
    setClassifiedTier(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const uploadedCount = Object.values(documents).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          PRAZ Compliance
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage documents required for Procurement Regulatory Authority of Zimbabwe (PRAZ) registration and tender bidding.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">PRAZ Registration Tier</CardTitle>
            <CardDescription>Identify your registration category and fees</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={openWizard}>
            Find My Tier
          </Button>
        </CardHeader>
        {classifiedTier && (
          <CardContent className="border-t pt-4">
            <div className="bg-primary/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{PRAZ_FEES[classifiedTier as keyof typeof PRAZ_FEES]?.label || classifiedTier}</p>
                  <p className="text-2xl font-bold text-primary">
                    ${PRAZ_FEES[classifiedTier as keyof typeof PRAZ_FEES]?.usd}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/ year</span>
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>ZiG {PRAZ_FEES[classifiedTier as keyof typeof PRAZ_FEES]?.zig}</p>
                  <p className="text-green-600 font-medium mt-1">
                    {formatPrazSavings(classifiedTier as keyof typeof PRAZ_FEES).message}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground border-t pt-2">
                Typical third-party consultants charge {CONSULTANT_COST_RANGE} to process your PRAZ application.
                Register directly through our platform and save.
              </p>
              <Button size="sm" className="w-full" onClick={resetWizard}>
                Recalculate
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Required Documents</CardTitle>
            <CardDescription>
              {uploadedCount} of {REQUIRED_DOCUMENTS.length} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const docData = documents[doc.id];
              const status: keyof typeof STATUS_CONFIG = docData?.status || 'missing';
              const StatusIcon = STATUS_CONFIG[status].icon;

              return (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-lg border ${status !== 'missing' ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted/50'}`}>
                      <FileText className={`h-4 w-4 ${status !== 'missing' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                      {docData?.fileName && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{docData.fileName}</p>
                      )}
                      {docData?.expiresAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Expires: {new Date(docData.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                      {perpetualDocIds.has(doc.id) && docData && (
                        <p className="text-xs text-muted-foreground mt-0.5">No expiry</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[status].class}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {STATUS_CONFIG[status].label}
                    </Badge>
                    {status === 'missing' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUploadDialog(doc.id as DocumentId)}
                        disabled={uploading === doc.id}
                      >
                        {uploading === doc.id ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Upload className="h-3 w-3" />
                        )}
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openUploadDialog(doc.id as DocumentId)} disabled={uploading === doc.id}>
                          <Upload className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(doc.id as DocumentId)}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">PRAZ Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold font-headline">{readinessScore}%</div>
                <p className="text-xs text-muted-foreground mt-1">Complete</p>
              </div>
              <Progress value={readinessScore} className="h-2" />
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                  {uploadedCount} documents uploaded
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className={`h-3 w-3 shrink-0 ${readinessScore >= 100 ? 'text-green-500' : 'text-amber-500'}`} />
                  {readinessScore >= 100 ? 'Ready for PRAZ registration' : `${REQUIRED_DOCUMENTS.length - uploadedCount} documents remaining`}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Once all documents are uploaded, you can register with PRAZ and start bidding on government tenders.
              </p>
              <a
                href="/tenders"
                className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm font-medium"
              >
                Browse tenders
                <ArrowRight className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              {dialogDocType && REQUIRED_DOCUMENTS.find(d => d.id === dialogDocType)?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</p>
              )}
            </div>

            {dialogDocType && !perpetualDocIds.has(dialogDocType) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="noExpiry"
                    checked={noExpiry}
                    onCheckedChange={(checked) => {
                      setNoExpiry(checked === true);
                      if (checked) setSelectedDate(undefined);
                      else setSelectedDate(addYears(new Date(), 1));
                    }}
                  />
                  <label htmlFor="noExpiry" className="text-sm">Document has no expiry date</label>
                </div>
                {!noExpiry && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Expiry Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadWithExpiry} disabled={!selectedFile}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={wizardOpen} onOpenChange={(open) => { setWizardOpen(open); if (!open) resetWizard(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Find Your PRAZ Registration Tier</DialogTitle>
            <DialogDescription>Answer 3 quick questions to identify your category</DialogDescription>
          </DialogHeader>

          {classifiedTier ? (
            <div className="space-y-4 py-4">
              <div className="bg-primary/5 rounded-lg p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">Your Classification</p>
                <p className="text-xl font-bold">{PRAZ_FEES[classifiedTier as keyof typeof PRAZ_FEES]?.label || classifiedTier}</p>
                <div className="flex justify-center gap-6 mt-2">
                  <div>
                    <p className="text-2xl font-bold text-primary">${PRAZ_FEES[classifiedTier as keyof typeof PRAZ_FEES]?.usd}</p>
                    <p className="text-xs text-muted-foreground">USD / year</p>
                  </div>
                  <div className="border-l pl-6">
                    <p className="text-2xl font-bold">ZiG {PRAZ_FEES[classifiedTier as keyof typeof PRAZ_FEES]?.zig}</p>
                    <p className="text-xs text-muted-foreground">ZiG / year</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-sm">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  Save up to ${CONSULTANT_COST_USD - (PRAZ_FEES[classifiedTier as keyof typeof PRAZ_FEES]?.usd || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  vs. traditional consultants charging {CONSULTANT_COST_RANGE}
                </p>
              </div>
              <Button className="w-full" onClick={() => { setWizardOpen(false); resetWizard(); }}>
                Got it
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {wizardStep === 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">What is your annual revenue?</label>
                  {[
                    { label: 'Under $50,000', value: 25000 },
                    { label: '$50,000 – $500,000', value: 250000 },
                    { label: 'Over $500,000', value: 750000 },
                  ].map(opt => (
                    <Button key={opt.value} variant={wizardRevenue === opt.value ? 'default' : 'outline'} className="w-full justify-start" onClick={() => { setWizardRevenue(opt.value); handleWizardNext(); }}>
                      {opt.label}
                    </Button>
                  ))}
                </div>
              )}
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">How many employees do you have?</label>
                  {[
                    { label: 'Less than 5', value: 2 },
                    { label: '5 – 50', value: 25 },
                    { label: 'More than 50', value: 100 },
                  ].map(opt => (
                    <Button key={opt.value} variant={wizardStaff === opt.value ? 'default' : 'outline'} className="w-full justify-start" onClick={() => { setWizardStaff(opt.value); handleWizardNext(); }}>
                      {opt.label}
                    </Button>
                  ))}
                </div>
              )}
              {wizardStep === 2 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">What is your total asset value?</label>
                  {[
                    { label: 'Under $10,000', value: 5000 },
                    { label: '$10,000 – $100,000', value: 50000 },
                    { label: 'Over $100,000', value: 250000 },
                  ].map(opt => (
                    <Button key={opt.value} variant={wizardAssets === opt.value ? 'default' : 'outline'} className="w-full justify-start" onClick={() => { setWizardAssets(opt.value); handleWizardNext(); }}>
                      {opt.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
