import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const AdminEmails = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('email_templates').select('*');
    if (error) {
      showError('Failed to fetch email templates.');
    } else {
      setTemplates(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('email_templates')
      .update({ subject: selectedTemplate.subject, body: selectedTemplate.body })
      .eq('id', selectedTemplate.id);
    
    if (error) {
      showError('Failed to update template.');
    } else {
      showSuccess('Template updated successfully.');
      setIsDialogOpen(false);
      fetchTemplates();
    }
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Template Management</CardTitle>
        <CardDescription>Customize automated emails sent from the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : templates.map(template => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.subject}</TableCell>
                <TableCell>{new Date(template.updated_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedTemplate(template); setIsDialogOpen(true); }}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {selectedTemplate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Edit Template: {selectedTemplate.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={selectedTemplate.subject} onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="body">Body</Label>
                  <Textarea id="body" value={selectedTemplate.body} onChange={(e) => setSelectedTemplate({...selectedTemplate, body: e.target.value})} rows={15} />
                  <p className="text-xs text-muted-foreground">Use placeholders like {'{{name}}'} or {'{{film_title}}'}.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminEmails;