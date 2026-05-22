'use client';

import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, CheckCircle2, AlertTriangle, XCircle, FileText, Shield, Clock, ArrowRight } from 'lucide-react';
import type { AppUser } from '@/types/user';
import { REQUIRED_DOCUMENTS, getPrazProfile, savePrazDocument, deletePrazDocument } from '@/services/praz-compliance';
import type { DocumentId } from '@/services/praz-compliance';

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

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  async function loadProfile() {
    if (!user) return;
    try {
      const profile = await getPrazProfile(user.uid);
      setDocuments(profile.documents);
      setReadinessScore(profile.readinessScore);
    } catch { /* no profile yet */ }
    setLoading(false);
  }

  async function handleUpload(docType: DocumentId) {
    if (!user) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(docType);
      try {
        const storagePath = `praz/${user.uid}/${docType}_${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        await savePrazDocument(user.uid, docType, file.name, downloadUrl, null);

        setDocuments(prev => ({
          ...prev,
          [docType]: { docType, fileName: file.name, uploadedAt: new Date(), expiresAt: null, status: 'valid' },
        }));
        loadProfile();
        toast({ title: 'Document uploaded', description: `${REQUIRED_DOCUMENTS.find(d => d.id === docType)?.label} uploaded successfully.` });
      } catch (err: any) {
        toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      } finally {
        setUploading(null);
      }
    };
    input.click();
  }

  async function handleDelete(docType: DocumentId) {
    if (!user) return;
    try {
      await deletePrazDocument(user.uid, docType);
      setDocuments(prev => ({ ...prev, [docType]: null }));
      loadProfile();
      toast({ title: 'Document removed', description: 'File has been deleted.' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
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
                        onClick={() => handleUpload(doc.id as DocumentId)}
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
                        <Button size="sm" variant="outline" onClick={() => handleUpload(doc.id as DocumentId)} disabled={uploading === doc.id}>
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
                <div className="text-4xl font-bold font-headline">{readinessScore}%</div>
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
    </div>
  );
}
